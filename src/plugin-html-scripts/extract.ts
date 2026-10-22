// cspell:ignore oncdatastart onclosetag oncomment onopentag

// Why this parser, not html-eslint's one, for example:
// it aligns with the HTML spec (v12+), has an XML mode, and gives exact positions for remapping
import {Parser} from 'htmlparser2';
import type {TagNode} from './css-selector';
import {
  type Range,
  TransformableString,
  getLineStarts,
  indexToLocation,
} from './transformable-string';

type IgnoreState = 'none' | 'nextScript' | 'untilEnabled';

const DIRECTIVE_COMMENTS: ReadonlyMap<string, IgnoreState> = new Map([
  ['eslint-disable', 'untilEnabled'],
  ['eslint-enable', 'none'],
  ['eslint-disable-next-script', 'nextScript'],
]);

// Not U+2028 and U+2029, which ESLint counts as line breaks too: they can be in strings
const LINE_REGEXP = /(\r\n|\n|\r)([\t ]*)(.*)/g;
const BLANK_LINE_START_REGEXP = /^[\t ]*(?:\r\n|\n|\r)/;
export const INDENTATION_OR_EMPTY_REGEXP = /^[\t ]*$/;
const FIRST_LINE_INDENTATION_REGEXP = /[\n\r]+([\t ]*)/;

const CDATA_START_LENGTH = '<![CDATA['.length;

const SPACE_CHARACTERS: ReadonlySet<string | undefined> = new Set([' ', '\t']);

export interface IndentDescriptor {
  isRelative: boolean;
  spaces: string;
}

interface ScriptMatcher {
  match: (node: TagNode) => boolean;
  isModule: boolean;
}

interface ExtractOptions {
  isXml: boolean;
  indent: IndentDescriptor | undefined;
  scriptMatchers: readonly ScriptMatcher[];
}

export interface ExtractedScript {
  code: TransformableString;
  isModule: boolean;

  /** The indentation removed from the lines of the script */
  indent: string;

  /** Start of the line giving its indentation to a script starting on its tag line */
  baseLineStart: number | undefined;
}

interface HtmlChunk extends Range {
  type: 'html';
  ignore: IgnoreState;
}

interface ScriptChunk extends Range {
  type: 'script';
  isModule: boolean;
  tagName: string;
  cdataRanges: Range[];
}

type DedentAction =
  | {type: 'dedent'; range: Range; isFirstNonEmptyLine: boolean}
  | {type: 'empty'; range: Range | undefined}
  | {type: 'badIndent'; range: Range | undefined; index: number};

const parseHtml = (
  html: string,
  {isXml, scriptMatchers}: Pick<ExtractOptions, 'isXml' | 'scriptMatchers'>,
) => {
  // Ranges of the HTML comments this plugin reacts to
  const directiveComments: Range[] = [];
  // Each chunk ends where the next one starts, and the last one at the end of the text
  const createHtmlChunk = (start: number): HtmlChunk => ({
    type: 'html',
    start,
    end: html.length,
    ignore: 'none',
  });
  const chunks: (HtmlChunk | ScriptChunk)[] = [createHtmlChunk(0)];
  // eslint-disable-next-line ts/no-non-null-assertion -- there is always a chunk
  const getCurrentChunk = () => chunks.at(-1)!;

  const parser = new Parser(
    {
      onopentag: (tagName, attributes) => {
        const chunk = getCurrentChunk();
        if (chunk.type !== 'html') {
          return;
        }

        const matchingMatcher = scriptMatchers.find(({match}) => match({tagName, attributes}));
        if (!matchingMatcher) {
          return;
        }

        if (chunk.ignore === 'nextScript') {
          chunk.ignore = 'none';
          return;
        }
        if (chunk.ignore === 'untilEnabled') {
          return;
        }

        chunk.end = parser.endIndex + 1;
        chunks.push({
          type: 'script',
          start: parser.endIndex + 1,
          end: html.length,
          isModule: matchingMatcher.isModule,
          tagName,
          cdataRanges: [],
        });
      },

      oncdatastart: () => {
        const chunk = getCurrentChunk();
        if (chunk.type === 'script') {
          chunk.cdataRanges.push(
            {start: parser.startIndex, end: parser.startIndex + CDATA_START_LENGTH},
            {start: parser.endIndex - 2, end: parser.endIndex + 1},
          );
        }
      },

      onclosetag: (tagName) => {
        const chunk = getCurrentChunk();
        if (chunk.type !== 'script' || chunk.tagName !== tagName) {
          return;
        }

        // In XML, the index doesn't move past a self-closing tag, which has no content anyway
        if (parser.startIndex < chunk.start) {
          chunks.pop();
          return;
        }

        chunk.end = parser.startIndex;
        chunks.push(createHtmlChunk(parser.startIndex));
      },

      oncomment: (comment) => {
        const ignore = DIRECTIVE_COMMENTS.get(comment.trim());
        if (ignore == null) {
          return;
        }

        const chunk = getCurrentChunk();
        if (chunk.type === 'html') {
          chunk.ignore = ignore;
        }
        directiveComments.push({start: parser.startIndex, end: parser.endIndex + 1});
      },

      onend: () => {
        getCurrentChunk().end = parser.endIndex + 1;
      },
    },
    {xmlMode: isXml},
  );

  parser.parseComplete(html);

  return {chunks, directiveComments};
};

const computeIndent = (
  descriptor: IndentDescriptor | undefined,
  previousHtml: string,
  slice: string,
) => {
  if (!descriptor) {
    return FIRST_LINE_INDENTATION_REGEXP.exec(slice)?.[1] || '';
  }

  if (descriptor.isRelative) {
    // The previous HTML ends with the opening tag of the script, whose line gives the indentation
    const tagStart = previousHtml.lastIndexOf('<');
    const tagLineStart =
      Math.max(previousHtml.lastIndexOf('\n', tagStart), previousHtml.lastIndexOf('\r', tagStart)) +
      1;
    return (tagStart === -1 ? '' : previousHtml.slice(tagLineStart, tagStart)) + descriptor.spaces;
  }

  return descriptor.spaces;
};

const getTrailingSpacesLength = (text: string) => {
  let index = text.length;
  while (index > 0 && SPACE_CHARACTERS.has(text[index - 1])) {
    index -= 1;
  }
  return text.length - index;
};

/** Where the content of the tag line starts (after a CDATA start in XML) when it's blank */
const getBlankTagLineStart = (slice: string, chunk: ScriptChunk) => {
  const cdataStart = chunk.cdataRanges.find((cdata) =>
    INDENTATION_OR_EMPTY_REGEXP.test(slice.slice(0, cdata.start - chunk.start)),
  );
  const start = cdataStart ? cdataStart.end - chunk.start : 0;
  return BLANK_LINE_START_REGEXP.test(slice.slice(start)) ? start : undefined;
};

const dedent = (indent: string, slice: string, blankTagLineStart: number | undefined) => {
  const actions: DedentAction[] = [];
  let hasNonEmptyLine = false;
  let lastIndex = 0;

  slice.matchAll(LINE_REGEXP).forEach((match, matchIndex) => {
    const [, lineBreak = '', lineIndent = '', lineText] = match;
    const lineStart = match.index + lineBreak.length;

    // The tag line is not part of the script when it's blank
    const tagLine =
      matchIndex === 0 && blankTagLineStart != null
        ? {start: blankTagLineStart, end: lineStart}
        : undefined;

    const isEmptyLine = !lineText;
    const isFirstNonEmptyLine = !isEmptyLine && !hasNonEmptyLine;
    // Be stricter on the first line
    const isWellIndented = isFirstNonEmptyLine
      ? lineIndent === indent
      : lineIndent.startsWith(indent);

    if (isWellIndented) {
      lastIndex = lineStart + indent.length;
      actions.push({
        type: 'dedent',
        range: {start: tagLine ? tagLine.start : lineStart, end: lastIndex},
        isFirstNonEmptyLine,
      });
    } else if (isEmptyLine) {
      actions.push({type: 'empty', range: tagLine});
    } else {
      actions.push({type: 'badIndent', range: tagLine, index: lineStart});
    }

    if (!isEmptyLine) {
      hasNonEmptyLine = true;
    }
  });

  const endSpacesLength = getTrailingSpacesLength(slice.slice(lastIndex));
  if (endSpacesLength > 0) {
    actions.push({
      type: 'dedent',
      range: {start: slice.length - endSpacesLength, end: slice.length},
      isFirstNonEmptyLine: false,
    });
  }

  return actions;
};

export const extract = (html: string, options: ExtractOptions) => {
  const badIndentationLines: number[] = [];
  const scripts: ExtractedScript[] = [];
  let previousHtml = '';
  let htmlLineStarts: readonly number[] | undefined;

  const {chunks, directiveComments} = parseHtml(html, options);

  chunks.forEach((chunk) => {
    const {start, end} = chunk;
    const slice = html.slice(start, end);
    if (chunk.type === 'html') {
      previousHtml = slice;
      return;
    }

    const code = new TransformableString(html);
    let indentSlice = slice;
    chunk.cdataRanges.forEach((cdata) => {
      code.remove(cdata.start, cdata.end);
      if (cdata.end === end) {
        indentSlice = html.slice(start, cdata.start);
      }
    });
    code.remove(0, start);
    code.remove(end, html.length);

    const indent = computeIndent(options.indent, previousHtml, indentSlice);
    const blankTagLineStart = getBlankTagLineStart(indentSlice, chunk);
    let baseLineStart: number | undefined;
    dedent(indent, indentSlice, blankTagLineStart).forEach((action) => {
      if (action.range) {
        code.remove(start + action.range.start, start + action.range.end);
      }
      if (action.type === 'dedent') {
        if (blankTagLineStart == null && action.isFirstNonEmptyLine) {
          baseLineStart = start + action.range.end;
        }
      } else if (action.type === 'badIndent') {
        htmlLineStarts ||= getLineStarts(html);
        badIndentationLines.push(indexToLocation(start + action.index, htmlLineStarts).line);
      }
    });

    scripts.push({code, isModule: chunk.isModule, indent, baseLineStart});
  });

  return {scripts, badIndentationLines, directiveComments};
};

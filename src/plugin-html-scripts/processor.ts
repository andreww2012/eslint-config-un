import crypto from 'node:crypto';
import path from 'node:path';
import type * as Eslint from 'eslint';
import {parseCssSelector} from './css-selector';
import {extract} from './extract';
import {PLUGIN_META} from './meta';
import {remapMessages} from './remap-messages';
import {deleteFileScripts, getScriptFilename, setFileScripts} from './scope-sharing';
import {type Range, getLineStarts} from './transformable-string';

interface HtmlProcessorScriptTag {
  /**
   * CSS selector matching the tags whose content is a script, like `script[type="text/babel" i]`.
   * Supports tag names, `*`, `#id`, `.class`, attributes (with the `i` and `s` flags) and `:not()`
   */
  match: string;

  /**
   * Whether the matched scripts are modules.
   * Module scripts don't share their declarations with other scripts
   * @default false
   */
  module?: boolean;
}

export interface HtmlProcessorOptions {
  /**
   * Expected indentation of scripts: a number of spaces or `tab`, with a `+` prefix to make it
   * relative to the indentation of the tag.
   * By default, it's the indentation of the first line
   */
  indent?: number | `${'+' | ''}${number}` | `${'+' | ''}tab`;

  /**
   * Severity of the reports of the lines that are less indented than the script
   * @default 'off'
   */
  reportBadIndent?: 'off' | 'warn' | 'error';

  /**
   * Which tags contain scripts, and which of them are modules.
   * The first matching item wins.
   * Replaces the default list, so restate the items of it you want to keep
   * @default <script> without `src`, with no `type`, an empty one, or a JavaScript or `module` one
   */
  scriptTags?: readonly HtmlProcessorScriptTag[];

  /**
   * Extensions of the files parsed as XML, in which CDATA sections are removed from scripts
   * @default ['.xhtml', '.xml']
   */
  xmlExtensions?: readonly string[];

  /**
   * Also lint the whole file with the file's own config, without this processor.
   * Only for files parsed by an HTML parser or language
   * @default false
   */
  lintMarkup?: boolean;
}

// No type, an empty type, or (application|text)/(x-)?(javascript|babel|ecmascript-6)
const CLASSIC_SCRIPT_TYPES = Object.freeze(
  ['application', 'text'].flatMap((prefix) =>
    ['', 'x-'].flatMap((variant) =>
      ['javascript', 'babel', 'ecmascript-6'].map((name) => `${prefix}/${variant}${name}`),
    ),
  ),
);

const DEFAULT_SCRIPT_TAGS: readonly HtmlProcessorScriptTag[] = Object.freeze([
  {
    match: [
      'script:not([type]):not([src])',
      'script[type=""]:not([src])',
      ...CLASSIC_SCRIPT_TYPES.map((type) => `script[type="${type}" i]:not([src])`),
    ].join(', '),
  },
  {match: 'script[type="module" i]:not([src])', module: true},
]);

const DEFAULT_XML_EXTENSIONS: readonly string[] = Object.freeze(['.xhtml', '.xml']);

const BAD_INDENT_SEVERITIES: Readonly<
  Record<Exclude<HtmlProcessorOptions['reportBadIndent'] & {}, 'off'>, 1 | 2>
> = {warn: 1, error: 2};

const INDENT_REGEXP = /^(\+)?(tab|\d+)$/;

const parseIndent = (indent: HtmlProcessorOptions['indent']) => {
  const [, relativityMark, spaces] = (indent != null && INDENT_REGEXP.exec(String(indent))) || [];
  return spaces
    ? {
        isRelative: relativityMark === '+',
        spaces: spaces === 'tab' ? '\t' : ' '.repeat(Number(spaces)),
      }
    : undefined;
};

/**
 * When linting the markup, ESLint reports the HTML comments of this plugin as its own unused
 * directives, which `--fix` would even empty
 */
const omitDirectiveCommentMessages = (
  messages: readonly Eslint.Linter.LintMessage[],
  {
    directiveComments,
    htmlLineStarts,
  }: {directiveComments: readonly Range[]; htmlLineStarts: readonly number[]},
) =>
  directiveComments.length === 0
    ? messages
    : messages.filter((message) => {
        if (message.ruleId != null || !message.line || !message.column) {
          return true;
        }

        const index = (htmlLineStarts[message.line - 1] ?? 0) + message.column - 1;
        return directiveComments.every(({start, end}) => index < start || index >= end);
      });

export const createProcessor = ({
  indent,
  reportBadIndent = 'off',
  scriptTags = DEFAULT_SCRIPT_TAGS,
  xmlExtensions = DEFAULT_XML_EXTENSIONS,
  lintMarkup = false,
}: HtmlProcessorOptions = {}): Eslint.Linter.Processor => {
  // JS configs can still pass the values of the old setting, like `true` or `2`
  if (reportBadIndent !== 'off' && !Object.hasOwn(BAD_INDENT_SEVERITIES, reportBadIndent)) {
    throw new Error(
      `Invalid value of \`reportBadIndent\`: ${JSON.stringify(reportBadIndent)}, expected 'off', 'warn' or 'error'`,
    );
  }

  const preprocessResults = new Map<string, ReturnType<typeof extract> & {html: string}>();
  const scriptMatchers = scriptTags.map(({match, module: isModule = false}) => ({
    match: parseCssSelector(match),
    isModule,
  }));
  const indentDescriptor = parseIndent(indent);
  const badIndentSeverity =
    reportBadIndent === 'off' ? null : BAD_INDENT_SEVERITIES[reportBadIndent];
  const optionsHash = crypto
    .createHash('sha1')
    .update(JSON.stringify({indent, reportBadIndent, scriptTags, xmlExtensions, lintMarkup}))
    .digest('hex')
    .slice(0, 8);

  return {
    meta: {
      name: PLUGIN_META.name,
      // Options are part of the version so that ESLint's cache notices when they change
      version: `${PLUGIN_META.version}+${optionsHash}`,
    },
    supportsAutofix: true,

    preprocess: (text, filename) => {
      // ESLint's locations and ranges don't count the BOM
      const html = text.startsWith('\u{FEFF}') ? text.slice(1) : text; // cspell:disable-line
      const extractResult = extract(html, {
        isXml: xmlExtensions.includes(path.extname(filename).toLowerCase()),
        indent: indentDescriptor,
        scriptMatchers,
      });
      preprocessResults.set(filename, {...extractResult, html});

      const scripts = extractResult.scripts.map(({code, isModule}) => ({
        code: code.toString(),
        isModule,
      }));
      // Same text and extension: ESLint lints it with the file's own config, minus this processor
      const markupBlocks = lintMarkup ? [{text, filename: path.basename(filename)}] : [];
      setFileScripts(filename, scripts, markupBlocks.length);

      return [
        ...markupBlocks,
        ...scripts.map(({code, isModule}, index) => ({
          text: code,
          filename: getScriptFilename(index, isModule),
        })),
      ];
    },

    postprocess: (messagesLists, filename) => {
      const preprocessResult = preprocessResults.get(filename);
      /* v8 ignore next 3 -- ESLint always preprocesses a file before postprocessing it */
      if (!preprocessResult) {
        return messagesLists.flat();
      }

      preprocessResults.delete(filename);
      deleteFileScripts(filename);

      const {scripts, badIndentationLines, directiveComments, html} = preprocessResult;
      const htmlLineStarts = getLineStarts(html);
      const markupMessages = (lintMarkup && messagesLists[0]) || [];
      const scriptsMessages = lintMarkup ? messagesLists.slice(1) : messagesLists;

      return [
        ...omitDirectiveCommentMessages(markupMessages, {directiveComments, htmlLineStarts}),
        ...scriptsMessages.flatMap((messages, index) => {
          const script = scripts[index];
          /* v8 ignore next -- every list of messages belongs to a script */
          return script ? remapMessages(messages, {html, htmlLineStarts, script}) : [];
        }),
        ...(badIndentSeverity
          ? badIndentationLines.map((line): Eslint.Linter.LintMessage => ({
              message: 'Bad line indentation.',
              line,
              column: 1,
              ruleId: '(html-scripts)',
              severity: badIndentSeverity,
            }))
          : []),
      ].toSorted((first, second) => first.line - second.line || first.column - second.column);
    },
  };
};

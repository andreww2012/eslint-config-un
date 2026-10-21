import type * as Eslint from 'eslint';
import {type ExtractedScript, INDENTATION_OR_EMPTY_REGEXP} from './extract';

type Fix = Eslint.Rule.Fix;

// Only CR and LF, like when scripts are dedented: U+2028 and U+2029 can be in strings
const LINE_BREAK_CHARACTER_REGEXP = /[\n\r]/;
const INNER_LINE_BREAK_REGEXP = /(?:\r\n|\r|\n)(?=[^\n\r])/g;
const TRAILING_LINE_BREAK_REGEXP = /(?:\r\n|\r|\n)$/;
const INDENTATION_REGEXP = /^[\t ]+$/;

interface RemapContext {
  /** The original text, which the script was extracted from */
  html: string;
  htmlLineStarts: readonly number[];
  script: ExtractedScript;
}

/**
 * Maps the exclusive end from the last targeted character, and takes in the lost indentation of
 * the line the fix joins to the previous one, so it doesn't stay in the middle of the line
 */
const remapRangeEnd = (
  end: number,
  {html, script: {code}}: RemapContext,
  doesJoinLines: boolean,
) => {
  const afterLastCharacter = code.originalIndex(end - 1) + 1;
  if (!doesJoinLines || end >= code.toString().length) {
    return afterLastCharacter;
  }

  const nextCharacter = code.originalIndex(end);
  return INDENTATION_OR_EMPTY_REGEXP.test(html.slice(afterLastCharacter, nextCharacter))
    ? nextCharacter
    : afterLastCharacter;
};

// Lines a fix adds, except empty ones, need the indentation removed from the script
const indentLines = (text: string, indent: string, isFollowedByLineContent: boolean) => {
  const indented = text.replaceAll(
    INNER_LINE_BREAK_REGEXP,
    (lineBreak: string) => lineBreak + indent,
  );
  return isFollowedByLineContent ? indented + indent : indented;
};

const isInsideScriptLine = (html: string, index: number, scriptEnd: number) =>
  index > 0 &&
  index < scriptEnd &&
  !LINE_BREAK_CHARACTER_REGEXP.test(html[index - 1] || '') &&
  !LINE_BREAK_CHARACTER_REGEXP.test(html[index] || '');

const remapFix = (fix: Fix, context: RemapContext): Fix | undefined => {
  const {html, script} = context;
  const {code, indent} = script;
  const [start, end] = fix.range;
  const originalStart = code.originalIndex(start);
  // Indenting the base line of a script starting on its tag line would never stop applying
  if (
    start === end &&
    originalStart === script.baseLineStart &&
    INDENTATION_REGEXP.test(fix.text)
  ) {
    return undefined;
  }

  const virtualText = code.toString();
  // Whether the text after the range continues the line of the replacement, or starts a line
  const doesJoinLines = fix.text
    ? !TRAILING_LINE_BREAK_REGEXP.test(fix.text)
    : start > 0 && !LINE_BREAK_CHARACTER_REGEXP.test(virtualText[start - 1] || '');
  const originalEnd = end > start ? remapRangeEnd(end, context, doesJoinLines) : originalStart;
  const scriptEnd = code.originalIndex(virtualText.length);

  return {
    range: [originalStart, originalEnd],
    text: indent
      ? indentLines(
          fix.text,
          indent,
          TRAILING_LINE_BREAK_REGEXP.test(fix.text) &&
            isInsideScriptLine(html, originalEnd, scriptEnd),
        )
      : fix.text,
  };
};

const remapMessage = (
  message: Eslint.Linter.LintMessage,
  context: RemapContext,
): Eslint.Linter.LintMessage => {
  // Messages without a line or a column apply to the whole file
  if (!message.line || !message.column) {
    return message;
  }

  const {code} = context.script;
  const {fix, suggestions, endLine, endColumn, ...messageRest} = message;
  const remappedFix = fix && remapFix(fix, context);
  const endLocation =
    endLine && endColumn
      ? code.originalLocation({line: endLine, column: endColumn}, context.htmlLineStarts)
      : undefined;

  return {
    ...messageRest,
    ...code.originalLocation(message, context.htmlLineStarts),
    ...(endLocation && {endLine: endLocation.line, endColumn: endLocation.column}),
    ...(remappedFix && {fix: remappedFix}),
    ...(suggestions && {
      suggestions: suggestions.flatMap((suggestion) => {
        const remappedSuggestionFix = remapFix(suggestion.fix, context);
        return remappedSuggestionFix ? {...suggestion, fix: remappedSuggestionFix} : [];
      }),
    }),
  };
};

export const remapMessages = (messages: Eslint.Linter.LintMessage[], context: RemapContext) =>
  messages.map((message) => remapMessage(message, context));

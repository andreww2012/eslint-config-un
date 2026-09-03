import type Eslint from 'eslint';
import type {JSONSchema4} from 'json-schema';
import type {FromSchema as InferJsonSchemaType} from 'json-schema-to-ts';

const EDGE_SPACES_ALLOWANCE_SCHEMA = {
  enum: ['always', 'never', 'stringOnly', 'linesOnly'],
} as const satisfies JSONSchema4;

const RULE_OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    allowSpacesOnly: {
      type: 'boolean',
    },
    allowLeadingSpaces: EDGE_SPACES_ALLOWANCE_SCHEMA,
    allowTrailingSpaces: EDGE_SPACES_ALLOWANCE_SCHEMA,
    checkTemplateLiterals: {
      type: 'boolean',
    },
    checkTaggedTemplateLiterals: {
      type: 'boolean',
    },
    spaceCharacters: {
      type: 'object',
      properties: {
        space: {
          type: 'boolean',
        },
        tab: {
          type: 'boolean',
        },
        unicodeSpaces: {
          type: 'boolean',
        },
      },
      additionalProperties: false,
    },
    reportMixedSpaces: {
      type: 'boolean',
    },
    ignorePatterns: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
  additionalProperties: false,
} as const satisfies JSONSchema4;

type RuleOptions = InferJsonSchemaType<typeof RULE_OPTIONS_SCHEMA>;
type EdgeSpacesOption = NonNullable<RuleOptions['allowLeadingSpaces']>;
type SpaceKind = keyof NonNullable<RuleOptions['spaceCharacters']>;

// Raw text is scanned, so escapes count too; `\\` is consumed whole so the next char is not misread as an escape
const SPACE_TOKEN_REGEXP =
  /\\\\|[\p{Zs}\t]|\\t|\\x[\dA-Fa-f]{2}|\\u[\dA-Fa-f]{4}|\\u\{[\dA-Fa-f]+\}/gu;
const UNICODE_SPACE_REGEXP = /^\p{Zs}$/u;
const SPACE_CODE_POINT = ' '.codePointAt(0);
const TAB_CODE_POINT = '\t'.codePointAt(0);
const BACKSLASH_CODE_POINT = '\\'.codePointAt(0);
const ESCAPE_SEQUENCE_CODE_POINT_REGEXP = /^\\(?:x|u\{?)([\dA-Fa-f]+)\}?$/;
const ESCAPED_LINE_BREAKS = [String.raw`\n`, String.raw`\r`];
const LITERAL_AND_ESCAPED_LINE_BREAKS = ['\n', '\r', ...ESCAPED_LINE_BREAKS];

const getCodePoint = (token: string) => {
  const escapedCodePoint = ESCAPE_SEQUENCE_CODE_POINT_REGEXP.exec(token)?.[1];
  if (escapedCodePoint != null) {
    return Number.parseInt(escapedCodePoint, 16);
  }

  if (token === String.raw`\t`) {
    return TAB_CODE_POINT;
  }

  return token.codePointAt(0);
};

const getSpaceKind = (token: string): SpaceKind | undefined => {
  const codePoint = getCodePoint(token);
  if (codePoint === SPACE_CODE_POINT) {
    return 'space';
  }

  if (codePoint === TAB_CODE_POINT) {
    return 'tab';
  }

  if (codePoint != null && UNICODE_SPACE_REGEXP.test(String.fromCodePoint(codePoint))) {
    return 'unicodeSpaces';
  }

  return undefined;
};

interface SpaceRun {
  start: number;
  end: number;
  tokenCount: number;
  firstToken: string;
  kinds: Set<SpaceKind>;
}

const findSpaceRuns = (text: string) =>
  text.matchAll(SPACE_TOKEN_REGEXP).reduce<SpaceRun[]>((runs, {index, 0: token}) => {
    const kind = getSpaceKind(token);
    if (kind == null) {
      return runs;
    }

    const lastRun = runs.at(-1);
    if (lastRun?.end === index) {
      lastRun.end += token.length;
      lastRun.tokenCount++;
      lastRun.kinds.add(kind);
    } else {
      runs.push({
        start: index,
        end: index + token.length,
        tokenCount: 1,
        firstToken: token,
        kinds: new Set([kind]),
      });
    }

    return runs;
  }, []);

// A backslash preceded by an odd number of backslashes is itself escaped
const isEscapeStartingAt = (text: string, index: number) => {
  let backslashCount = 0;
  while (text.codePointAt(index - backslashCount) === BACKSLASH_CODE_POINT) {
    backslashCount++;
  }

  return backslashCount % 2 === 1;
};

const isLineBreakBefore = (text: string, index: number, lineBreaks: string[]) =>
  lineBreaks.some(
    (lineBreak) =>
      text.endsWith(lineBreak, index) &&
      (!lineBreak.startsWith('\\') || isEscapeStartingAt(text, index - lineBreak.length)),
  );

// String edges win over line edges: the string start is also its first line start
const isEdgeAllowed = (
  option: EdgeSpacesOption | undefined,
  isStringEdge: boolean,
  isLineEdge: boolean,
) => {
  if (isStringEdge) {
    return option === 'always' || option === 'stringOnly';
  }

  if (isLineEdge) {
    return option === 'always' || option === 'linesOnly';
  }

  return false;
};

const rule: Eslint.Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Disallow multiple consecutive spaces in string and template literals',
    },
    fixable: 'code',
    hasSuggestions: true,
    schema: [RULE_OPTIONS_SCHEMA],
    defaultOptions: [
      {
        allowSpacesOnly: true,
        allowLeadingSpaces: 'always',
        allowTrailingSpaces: 'always',
        checkTemplateLiterals: true,
        checkTaggedTemplateLiterals: false,
        spaceCharacters: {space: true},
        reportMixedSpaces: true,
        ignorePatterns: [],
      },
    ] satisfies [RuleOptions],
    messages: {
      noMultipleConsecutiveSpaces:
        'Multiple consecutive spaces in a string or template literal are not allowed.',
      noMixedSpaces:
        'Mixed kinds of space characters in a string or template literal are not allowed.',
      replaceMultipleSpacesWithSingle: 'Replace multiple spaces with a single space',
    },
  },

  create: (context) => {
    const {sourceCode} = context;
    const options = context.options[0] as RuleOptions | undefined;
    const ignoreRegexps = (options?.ignorePatterns || []).map(
      (pattern) => new RegExp(pattern, 'u'),
    );

    const checkText = (
      node: Eslint.Rule.Node,
      text: string,
      textStartIndex: number,
      {isFirst, isLast, lineBreaks}: {isFirst: boolean; isLast: boolean; lineBreaks: string[]},
    ) => {
      const runs = findSpaceRuns(text);

      runs.forEach(({start, end, tokenCount, firstToken, kinds}) => {
        if (tokenCount < 2) {
          return;
        }

        const isStringStart = isFirst && start === 0;
        const isStringEnd = isLast && end === text.length;
        const isSpacesOnly = runs.length === 1 && isStringStart && isStringEnd;

        const isMixed = kinds.size > 1;
        const shouldReport = isMixed
          ? options?.reportMixedSpaces
          : kinds.values().every((kind) => options?.spaceCharacters?.[kind]);
        if (!shouldReport) {
          return;
        }

        if (!isMixed) {
          if (isSpacesOnly && options?.allowSpacesOnly) {
            return;
          }

          const isLeadingAllowed = isEdgeAllowed(
            options?.allowLeadingSpaces,
            isStringStart,
            isLineBreakBefore(text, start, lineBreaks),
          );
          const isTrailingAllowed = isEdgeAllowed(
            options?.allowTrailingSpaces,
            isStringEnd,
            lineBreaks.some((lineBreak) => text.startsWith(lineBreak, end)),
          );
          if (!isSpacesOnly && (isLeadingAllowed || isTrailingAllowed)) {
            return;
          }
        }

        const reportStart = textStartIndex + start;
        const reportEnd = textStartIndex + end;

        context.report({
          node,
          loc: {
            start: sourceCode.getLocFromIndex(reportStart),
            end: sourceCode.getLocFromIndex(reportEnd),
          },
          messageId: isMixed ? 'noMixedSpaces' : 'noMultipleConsecutiveSpaces',
          suggest: [
            {
              messageId: 'replaceMultipleSpacesWithSingle',
              fix: (fixer) =>
                fixer.replaceTextRange([reportStart, reportEnd], isMixed ? ' ' : firstToken),
            },
          ],
        });
      });
    };

    const getTextInsideDelimiters = (node: Eslint.Rule.Node) =>
      sourceCode.getText(node).slice(1, -1);

    const isIgnored = (node: Eslint.Rule.Node) => {
      const innerText = getTextInsideDelimiters(node);
      return ignoreRegexps.some((regexp) => regexp.test(innerText));
    };

    return {
      Literal: (node) => {
        if (typeof node.value !== 'string' || isIgnored(node)) {
          return;
        }

        checkText(node, getTextInsideDelimiters(node), (node.range?.[0] || 0) + 1, {
          isFirst: true,
          isLast: true,
          lineBreaks: ESCAPED_LINE_BREAKS,
        });
      },

      TemplateLiteral: (node) => {
        const isTagged =
          node.parent.type === 'TaggedTemplateExpression' && node.parent.quasi === node;
        const shouldCheck = isTagged
          ? options?.checkTaggedTemplateLiterals
          : options?.checkTemplateLiterals;
        if (!shouldCheck || isIgnored(node)) {
          return;
        }

        node.quasis // cspell:disable-line
          .forEach((quasi, index) => {
            // Not `value.raw`: parsers normalize CRLF in it
            const quasiText = sourceCode
              .getText(quasi)
              .slice(1 /* ` or } */, quasi.tail ? -1 : -2 /* ` or ${ */);
            checkText(node, quasiText, (quasi.range?.[0] || 0) + 1, {
              isFirst: index === 0,
              isLast: quasi.tail,
              lineBreaks: LITERAL_AND_ESCAPED_LINE_BREAKS,
            });
          });
      },
    };
  },
};

export {rule as noMultipleConsecutiveSpaces};

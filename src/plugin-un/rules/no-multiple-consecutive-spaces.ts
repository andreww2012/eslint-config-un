import type Eslint from 'eslint';
import type {JSONSchema4} from 'json-schema';
import type {FromSchema as InferJsonSchemaType} from 'json-schema-to-ts';

const RULE_OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    allowSpacesOnly: {
      type: 'boolean',
    },
  },
  additionalProperties: false,
} as const satisfies JSONSchema4;

type RuleOptions = InferJsonSchemaType<typeof RULE_OPTIONS_SCHEMA>;

const MULTIPLE_CONSECUTIVE_SPACES_REGEXP = / {2,}/g;
const SPACES_ONLY_REGEXP = /^ +$/;

const rule: Eslint.Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Disallow multiple consecutive spaces in string literals',
    },
    fixable: 'code',
    hasSuggestions: true,
    schema: [RULE_OPTIONS_SCHEMA],
    defaultOptions: [{allowSpacesOnly: true}] satisfies [RuleOptions],
    messages: {
      noMultipleConsecutiveSpaces: 'Multiple consecutive spaces in string literal are not allowed.',
      replaceMultipleSpacesWithSingle: 'Replace multiple spaces with a single space',
    },
  },

  create(context) {
    const {sourceCode} = context;
    return {
      Literal: (node) => {
        const options = context.options[0] as RuleOptions | undefined;

        const {value} = node;
        if (typeof value !== 'string') {
          return;
        }

        const matches = value.matchAll(MULTIPLE_CONSECUTIVE_SPACES_REGEXP);
        [...matches].forEach(({index: startIndex, 0: matchString}) => {
          if (options?.allowSpacesOnly && SPACES_ONLY_REGEXP.test(value)) {
            return;
          }

          const reportStart = (node.range?.[0] || 0) + 1 /* Quote */ + startIndex;
          const reportEnd = reportStart + matchString.length;

          context.report({
            node,
            loc: {
              start: sourceCode.getLocFromIndex(reportStart),
              end: sourceCode.getLocFromIndex(reportEnd),
            },
            messageId: 'noMultipleConsecutiveSpaces',
            suggest: [
              {
                messageId: 'replaceMultipleSpacesWithSingle',
                fix: (fixer) => fixer.replaceTextRange([reportStart, reportEnd], ' '),
              },
            ],
          });
        });
      },
    };
  },
};

export {rule as noMultipleConsecutiveSpaces};

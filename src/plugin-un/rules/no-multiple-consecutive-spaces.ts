import type Eslint from 'eslint';

const MULTIPLE_CONSECUTIVE_SPACES_REGEXP = / {2,}/g;

const rule: Eslint.Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Disallow multiple consecutive spaces in string literals',
    },
    fixable: 'code',
    hasSuggestions: true,
    schema: [],
    messages: {
      noMultipleConsecutiveSpaces: 'Multiple consecutive spaces in string literal are not allowed.',
      replaceMultipleSpacesWithSingle: 'Replace multiple spaces with a single space',
    },
  },

  create(context) {
    const {sourceCode} = context;
    return {
      Literal: (node) => {
        const {value} = node;
        if (typeof value !== 'string') {
          return;
        }

        const matches = value.matchAll(MULTIPLE_CONSECUTIVE_SPACES_REGEXP);
        [...matches].forEach(({index: startIndex, 0: matchString}) => {
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

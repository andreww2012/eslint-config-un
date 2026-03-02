// Based on: https://github.com/Shopify/web-configs/blob/6c51fc60ef04a6229c5498acae988b49bedb4a18/packages/eslint-plugin/lib/rules/prefer-early-return.js
import type Eslint from 'eslint';
import type * as ESTree from 'estree';
import type {JSONSchema4} from 'json-schema';
import type {FromSchema as InferJsonSchemaType} from 'json-schema-to-ts';

const DEFAULT_MAXIMUM_STATEMENTS = 1;

const RULE_OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    maximumStatements: {
      type: 'integer',
    },
    onlyReportIfSingleStatement: {
      type: 'boolean',
    },
  },
  additionalProperties: false,
} as const satisfies JSONSchema4;

type RuleOptions = InferJsonSchemaType<typeof RULE_OPTIONS_SCHEMA>;

const CONSEQUENT_INDENT_REGEX = /^\s+/m;

const rule: Eslint.Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description:
        'Prefer early returns over full-body conditional wrapping in function declarations.',
      url: 'https://github.com/Shopify/web-configs/blob/HEAD/packages/eslint-plugin/docs/rules/prefer-early-return.md',
    },
    fixable: 'code',
    schema: [RULE_OPTIONS_SCHEMA],
    messages: {
      preferEarlyReturn: 'Prefer an early return to a conditionally-wrapped function body',
    },
  },

  create(context) {
    const options = context.options[0] as RuleOptions | undefined;
    const {sourceCode} = context;

    const maxStatements: number = options?.maximumStatements ?? DEFAULT_MAXIMUM_STATEMENTS;
    const onlyReportIfSingleStatement = options?.onlyReportIfSingleStatement ?? false;

    const isOffendingConsequent = (consequent: ESTree.Statement) =>
      (consequent.type === 'ExpressionStatement' && maxStatements === 0) ||
      (consequent.type === 'BlockStatement' && consequent.body.length > maxStatements);

    const checkFunctionBody = (
      functionNode:
        | ESTree.FunctionDeclaration
        | ESTree.FunctionExpression
        | ESTree.ArrowFunctionExpression,
    ) => {
      const functionBody = functionNode.body;
      if (functionBody.type !== 'BlockStatement') {
        return;
      }

      const bodyStatements = functionBody.body;
      const lastBodyStatement = bodyStatements.at(-1);
      if (
        lastBodyStatement &&
        !(onlyReportIfSingleStatement && bodyStatements.length > 1) &&
        lastBodyStatement.type === 'IfStatement' &&
        lastBodyStatement.alternate == null &&
        isOffendingConsequent(lastBodyStatement.consequent)
      ) {
        context.report({
          node: lastBodyStatement,
          messageId: 'preferEarlyReturn',
          fix: (fixer) => {
            const conditionText = sourceCode.getText(lastBodyStatement.test);
            const consequentText = sourceCode.getText(lastBodyStatement.consequent);

            const indent = ' '.repeat(lastBodyStatement.loc?.start.column || 0);

            const consequentIndentLength =
              consequentText.match(CONSEQUENT_INDENT_REGEX)?.[0]?.length || 0;
            const indentInsideConsequent = ' '.repeat(
              Math.max(0, consequentIndentLength - indent.length),
            );

            const expressionsAfterConditionText = consequentText
              .slice(1, -1) // strip braces
              .trim()
              .split('\n')
              .map((line) => `${indent}${line.trim()}`)
              .join('\n');

            return fixer.replaceText(
              lastBodyStatement,
              `if (!(${conditionText})) {
${indent}${indentInsideConsequent}return;
${indent}}
${expressionsAfterConditionText}`,
            );
          },
        });
      }
    };

    return {
      FunctionDeclaration: checkFunctionBody,
      FunctionExpression: checkFunctionBody,
      ArrowFunctionExpression: checkFunctionBody,
    };
  },
};

export {rule as preferEarlyReturn};

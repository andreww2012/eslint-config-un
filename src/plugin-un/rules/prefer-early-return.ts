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
  },
  additionalProperties: false,
} as const satisfies JSONSchema4;

type RuleOptions = InferJsonSchemaType<typeof RULE_OPTIONS_SCHEMA>;

const rule: Eslint.Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description:
        'Prefer early returns over full-body conditional wrapping in function declarations.',
      url: 'https://github.com/Shopify/web-configs/blob/HEAD/packages/eslint-plugin/docs/rules/prefer-early-return.md',
    },
    schema: [RULE_OPTIONS_SCHEMA],
    messages: {
      preferEarlyReturn: 'Prefer an early return to a conditionally-wrapped function body',
    },
  },

  create(context) {
    const options = context.options[0] as RuleOptions | undefined;

    const maxStatements: number = options?.maximumStatements ?? DEFAULT_MAXIMUM_STATEMENTS;

    const isOffendingConsequent = (consequent: ESTree.Statement) =>
      (consequent.type === 'ExpressionStatement' && maxStatements === 0) ||
      (consequent.type === 'BlockStatement' && consequent.body.length > maxStatements);

    const isOffendingIfStatement = (statement: ESTree.Statement | undefined) =>
      statement?.type === 'IfStatement' &&
      statement.alternate == null &&
      isOffendingConsequent(statement.consequent);

    const checkFunctionBody = (
      functionNode:
        | ESTree.FunctionDeclaration
        | ESTree.FunctionExpression
        | ESTree.ArrowFunctionExpression,
    ) => {
      const {body} = functionNode;

      if (
        body.type === 'BlockStatement' &&
        body.body.length === 1 &&
        isOffendingIfStatement(body.body[0])
      ) {
        context.report({
          node: body,
          messageId: 'preferEarlyReturn',
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

import type Eslint from 'eslint';
import type * as ESTree from 'estree';
import type {JSONSchema4} from 'json-schema';
import type {FromSchema as InferJsonSchemaType} from 'json-schema-to-ts';

const TYPEOF_POSSIBLE_RETURN_VALUES_SET = new Set<string>([
  'string',
  'number',
  'boolean',
  'bigint',
  'symbol',
  'object',
  'function',
  'undefined',
]);

const COMPARISON_OPERATORS_SET = new Set<string>([
  '==',
  '===',
  '!=',
  '!==',
] satisfies ESTree.BinaryOperator[]);

const RULE_OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    allow: {
      type: 'object',
      additionalProperties: false,
      properties: Object.fromEntries(
        Array.from(TYPEOF_POSSIBLE_RETURN_VALUES_SET, (value) => [value, {type: 'boolean'}]),
      ),
    },
    disallow: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
  additionalProperties: false,
} as const satisfies JSONSchema4;

type RuleOptions = InferJsonSchemaType<typeof RULE_OPTIONS_SCHEMA>;

const rule: Eslint.Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        "Disallow typeof-like comparisons (`variable === 'string'). Such expressions are likely missing `typeof` operator before `variable`",
    },
    fixable: 'code',
    schema: [RULE_OPTIONS_SCHEMA],
    messages: {
      noTypeofLikeComparison:
        'This comparison is likely missing `typeof` operator before the {{ operandSide }} operand and therefore is forbidden. If this is intentional, you may need to suppress this report.',
      noComparisonWithUserProvidedLiteral: 'Comparing with "{{ value }}" is forbidden.',
    },
  },

  create(context) {
    const options = context.options[0] as RuleOptions | undefined;
    const allow: Record<string, boolean> = {
      undefined: true,
      ...options?.allow,
    };

    return {
      BinaryExpression: (node) => {
        const {left: leftOperand, operator, right: rightOperand} = node;
        if (!COMPARISON_OPERATORS_SET.has(operator)) {
          return;
        }

        const literalNode =
          leftOperand.type === 'Literal'
            ? leftOperand
            : rightOperand.type === 'Literal'
              ? rightOperand
              : null;
        if (!literalNode) {
          return;
        }

        const otherNode = literalNode === rightOperand ? leftOperand : rightOperand;
        if (
          otherNode.type === 'Literal' ||
          (otherNode.type === 'UnaryExpression' && otherNode.operator === 'typeof')
        ) {
          return;
        }

        const literalValue = literalNode.value;
        if (typeof literalValue !== 'string' || allow[literalValue]) {
          return;
        }

        if (TYPEOF_POSSIBLE_RETURN_VALUES_SET.has(literalValue)) {
          context.report({
            node,
            messageId: 'noTypeofLikeComparison',
            data: {
              operandSide: otherNode === rightOperand ? 'right' : 'left',
            },
          });
          return;
        }

        const disallowedValue = options?.disallow?.find((value) => literalValue === value);
        if (disallowedValue != null) {
          context.report({
            node,
            messageId: 'noComparisonWithUserProvidedLiteral',
            data: {
              value: disallowedValue.replaceAll('"', String.raw`\"`),
            },
          });
        }
      },
    };
  },
};

export {rule as noTypeofLikeComparison};

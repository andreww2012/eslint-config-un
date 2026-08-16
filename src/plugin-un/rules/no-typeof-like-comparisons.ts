import {findVariable} from '@eslint-community/eslint-utils';
import type Eslint from 'eslint';
import type * as ESTree from 'estree';
import type {JSONSchema4} from 'json-schema';
import type {FromSchema as InferJsonSchemaType} from 'json-schema-to-ts';

const TYPEOF_POSSIBLE_RETURN_VALUES_SET = new Set([
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

const DEFAULT_ALLOWED_LITERAL_VALUES_SET = new Set<string>(['undefined']);

/**
 * TypeScript-only expression wrappers, which are absent from `ESTree` types because they are erased
 * at runtime and therefore never change the value of the expression they wrap.
 */
interface TypeOnlyWrapperExpression {
  type:
    | 'TSAsExpression'
    | 'TSInstantiationExpression'
    | 'TSNonNullExpression'
    | 'TSSatisfiesExpression'
    | 'TSTypeAssertion';
  expression: ESTree.Expression;
}

/**
 * Tells whether `node` is guaranteed to evaluate to the result of a `typeof` operator, resolving
 * identifiers to the expressions they are written with.
 */
const isTypeofResultExpression = (
  node: ESTree.Node | TypeOnlyWrapperExpression,
  scope: Eslint.Scope.Scope,
  variablesBeingResolved?: Set<Eslint.Scope.Variable>,
): boolean => {
  switch (node.type) {
    case 'TSAsExpression':
    case 'TSInstantiationExpression':
    case 'TSNonNullExpression':
    case 'TSSatisfiesExpression':
    case 'TSTypeAssertion': {
      return isTypeofResultExpression(node.expression, scope, variablesBeingResolved);
    }

    case 'UnaryExpression': {
      return node.operator === 'typeof';
    }

    case 'AssignmentExpression': {
      return (
        node.operator === '=' && isTypeofResultExpression(node.right, scope, variablesBeingResolved)
      );
    }

    case 'SequenceExpression': {
      const lastExpression = node.expressions.at(-1);
      return (
        lastExpression != null &&
        isTypeofResultExpression(lastExpression, scope, variablesBeingResolved)
      );
    }

    case 'ConditionalExpression': {
      return (
        isTypeofResultExpression(node.consequent, scope, variablesBeingResolved) &&
        isTypeofResultExpression(node.alternate, scope, variablesBeingResolved)
      );
    }

    case 'LogicalExpression': {
      return (
        isTypeofResultExpression(node.left, scope, variablesBeingResolved) &&
        isTypeofResultExpression(node.right, scope, variablesBeingResolved)
      );
    }

    case 'Identifier': {
      const variable = findVariable(scope, node);
      if (variable == null || variablesBeingResolved?.has(variable)) {
        return false;
      }

      // Read-write references (`type += typeof value`) are skipped: their `writeExpr` is only
      // an operand of the assignment, not the value the variable ends up holding
      const writes = variable.references.flatMap((reference) =>
        reference.writeExpr == null || reference.isReadWrite()
          ? []
          : [[reference.writeExpr, reference.from] as const],
      );
      if (writes.length === 0) {
        return false;
      }

      const variablesBeingResolvedWithCurrent =
        variablesBeingResolved || new Set<Eslint.Scope.Variable>();
      variablesBeingResolvedWithCurrent.add(variable);
      const areAllWritesTypeofResults = writes.every(([writeExpression, writeScope]) =>
        isTypeofResultExpression(writeExpression, writeScope, variablesBeingResolvedWithCurrent),
      );
      variablesBeingResolvedWithCurrent.delete(variable);

      return areAllWritesTypeofResults;
    }

    default: {
      return false;
    }
  }
};

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
        "Disallow typeof-like comparisons (`variable === 'string'`). Such expressions are likely missing `typeof` operator before `variable`",
    },
    fixable: 'code',
    schema: [RULE_OPTIONS_SCHEMA],
    messages: {
      noTypeofLikeComparison:
        'This comparison is likely missing `typeof` operator before the {{ operandSide }} operand and therefore is forbidden. If this is intentional, you may need to suppress this report.',
      noComparisonWithUserProvidedLiteral: 'Comparing with "{{ value }}" is forbidden.',
    },
  },

  create: (context) => {
    const options = context.options[0] as RuleOptions | undefined;
    const allowedLiteralValues = options?.allow
      ? new Set(
          Object.entries({undefined: true, ...options.allow}).flatMap(([value, isAllowed]) =>
            isAllowed ? [value] : [],
          ),
        )
      : DEFAULT_ALLOWED_LITERAL_VALUES_SET;

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
        if (otherNode.type === 'Literal') {
          return;
        }

        const literalValue = literalNode.value;
        if (typeof literalValue !== 'string' || allowedLiteralValues.has(literalValue)) {
          return;
        }

        const reportDescriptor:
          (Eslint.Rule.ReportDescriptorMessage & Eslint.Rule.ReportDescriptorOptions) | null =
          TYPEOF_POSSIBLE_RETURN_VALUES_SET.has(literalValue)
            ? {
                messageId: 'noTypeofLikeComparison',
                data: {operandSide: otherNode === rightOperand ? 'right' : 'left'},
              }
            : options?.disallow?.includes(literalValue)
              ? {
                  messageId: 'noComparisonWithUserProvidedLiteral',
                  data: {value: literalValue.replaceAll('"', String.raw`\"`)},
                }
              : null;
        if (!reportDescriptor) {
          return;
        }

        if (isTypeofResultExpression(otherNode, context.sourceCode.getScope(node))) {
          return;
        }

        context.report({node, ...reportDescriptor});
      },
    };
  },
};

export {rule as noTypeofLikeComparison};

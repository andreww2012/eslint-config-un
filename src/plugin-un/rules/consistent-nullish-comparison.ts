import {hasSideEffect, isParenthesized} from '@eslint-community/eslint-utils';
import type * as Eslint from 'eslint';
import type * as ESTree from 'estree';
import type * as ts from 'typescript';
import {allUnionMembers} from '../../utils';
import {
  getConstituents,
  getTypeInformation,
  isGlobalReference,
  isIndexSignatureRead,
  unwrapTypeOnlyWrappers,
} from '../rule-utils';

type Mode = 'non-strict' | 'strict';

type NullishValue = 'null' | 'undefined';

// The values `== null` matches
type LooselyNullishValue = NullishValue | 'document.all';

type LooseOperator = '!=' | '==';

type MessageId = 'joinComparisons' | 'replace' | 'replaceByType' | 'splitComparison';

interface NullishComparison {
  node: ESTree.BinaryExpression;
  operand: ESTree.Expression;
  nullishOperand: ESTree.Expression;
  nullishValue: NullishValue;
  looseOperator: LooseOperator;
  isStrict: boolean;
}

const NULLISH_VALUES = allUnionMembers<NullishValue>()(['null', 'undefined']);

// What an expression of an unknown type may hold, leaving out the rare `document.all`
const UNKNOWN_TYPE_VALUES_SET: ReadonlySet<LooselyNullishValue> = new Set(NULLISH_VALUES);

const OTHER_NULLISH_VALUE: Readonly<Record<NullishValue, NullishValue>> = {
  null: 'undefined',
  undefined: 'null',
};

const LOOSE_OPERATORS: Readonly<Partial<Record<ESTree.BinaryOperator, LooseOperator>>> = {
  '==': '==',
  '===': '==',
  '!=': '!=',
  '!==': '!=',
};

// The operator joining the separate strict comparisons with `null` and `undefined` that work like
// a loose one
const PAIR_OPERATORS: Readonly<Record<LooseOperator, ESTree.LogicalOperator>> = {
  '==': '||',
  '!=': '&&',
};

/**
 * Creates a function that returns which of the values `== null` matches (`null`, `undefined` and
 * `document.all`) an expression can hold
 */
const createLooselyNullishValuesGetter = (
  typeInformation: ReturnType<typeof getTypeInformation>,
) => {
  if (!typeInformation) {
    return () => UNKNOWN_TYPE_VALUES_SET;
  }

  const {checker, getType} = typeInformation;
  const emptyObjectType = checker.getNonNullableType(checker.getUnknownType());
  const nullishTypes: Readonly<Record<NullishValue, ts.Type>> = {
    null: checker.getNullType(),
    undefined: checker.getUndefinedType(),
  };

  const canBe = (type: ts.Type, value: NullishValue) =>
    checker.isTypeAssignableTo(nullishTypes[value], type) ||
    // A type that fits neither `{}` nor the other nullish value may hold this one, like `void` or
    // a generic type without a constraint (`T[K]`)
    (!checker.isTypeAssignableTo(type, emptyObjectType) &&
      !checker.isTypeAssignableTo(type, nullishTypes[OTHER_NULLISH_VALUE[value]]));

  return (node: ESTree.Node) => {
    // The asserted type may leave out a value the expression can hold
    const expression = unwrapTypeOnlyWrappers(node);
    const type = getType(expression);
    if (!type) {
      return UNKNOWN_TYPE_VALUES_SET;
    }

    const constituents = getConstituents(checker, type);
    const values = new Set<LooselyNullishValue>(
      NULLISH_VALUES.filter((value) =>
        constituents.some((constituent) => canBe(constituent, value)),
      ),
    );
    // A key missing from an index signature gives `undefined`, which the type of the read only has
    // with `noUncheckedIndexedAccess`
    if (isIndexSignatureRead(typeInformation, expression)) {
      values.add('undefined');
    }
    if (
      constituents.some((constituent) => constituent.getSymbol()?.getName() === 'HTMLAllCollection')
    ) {
      values.add('document.all');
    }
    return values;
  };
};

const rule: Eslint.JSRuleDefinition<{RuleOptions: [Mode?]; MessageIds: MessageId}> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce `== null` and `!= null` (default) or strict comparisons for checking `null` and `undefined`, wherever the other form works the same',
    },
    fixable: 'code',
    schema: [
      {
        description:
          "`'non-strict'` (default) prefers `== null` and `!= null`, `'strict'` prefers `===` and `!==`",
        type: 'string',
        enum: allUnionMembers<Mode>()(['non-strict', 'strict']),
      },
    ],
    defaultOptions: ['non-strict'],
    messages: {
      replace: 'Use `{{ replacement }}` instead of `{{ original }}`: they work the same.',
      replaceByType:
        'Use `{{ replacement }}` instead of `{{ original }}`: they work the same here, because the value cannot be `{{ impossibleValue }}`.',
      joinComparisons:
        'Use `{{ replacement }}` instead of separate comparisons with `null` and `undefined`: it works the same.',
      splitComparison:
        'Use `{{ operator }}` to compare with `null` and `undefined` separately instead of `{{ original }}`.',
    },
  },

  create: (context) => {
    const {sourceCode} = context;
    const [mode] = context.options;
    const getLooselyNullishValues = createLooselyNullishValuesGetter(
      getTypeInformation(sourceCode),
    );

    const getNullishValue = (node: ESTree.Node) =>
      node.type === 'Literal' && node.raw === 'null'
        ? 'null'
        : node.type === 'Identifier' &&
            node.name === 'undefined' &&
            isGlobalReference(sourceCode, node, 'value')
          ? 'undefined'
          : undefined;

    const parseComparison = (node: ESTree.Node): NullishComparison | undefined => {
      const looseOperator = node.type === 'BinaryExpression' && LOOSE_OPERATORS[node.operator];
      if (!looseOperator || node.left.type === 'PrivateIdentifier') {
        return undefined;
      }

      const [operand, nullishOperand] = getNullishValue(node.right)
        ? [node.left, node.right]
        : [node.right, node.left];
      const nullishValue = getNullishValue(nullishOperand);
      return nullishValue && !getNullishValue(operand)
        ? {
            node,
            operand,
            nullishOperand,
            nullishValue,
            looseOperator,
            isStrict: node.operator !== looseOperator,
          }
        : undefined;
    };

    const replaceComparison = (
      fixer: Eslint.Rule.RuleFixer,
      {node, nullishOperand, nullishValue}: NullishComparison,
      operator: string,
      value: NullishValue,
    ) => {
      const operatorToken = sourceCode.getTokenAfter(
        node.left,
        (token) => token.value === node.operator,
      );
      return [
        ...(operatorToken && operator !== node.operator
          ? [fixer.replaceText(operatorToken, operator)]
          : []),
        ...(value === nullishValue ? [] : [fixer.replaceText(nullishOperand, value)]),
      ];
    };

    if (mode === 'strict') {
      return {
        BinaryExpression: (node) => {
          const comparison = parseComparison(node);
          if (!comparison || comparison.isStrict) {
            return;
          }

          const {operand, nullishValue, looseOperator} = comparison;
          const values = getLooselyNullishValues(operand);
          if (values.has('document.all')) {
            return;
          }

          const strictOperator = `${looseOperator}=`;
          const original = `${node.operator} ${nullishValue}`;

          // If the type allows neither value, the comparison likely guards against a wrong type, so
          // it keeps matching both
          const [value, ...otherValues] = NULLISH_VALUES.filter((nullish) => values.has(nullish));
          if (value && otherValues.length === 0) {
            context.report({
              node,
              messageId: 'replaceByType',
              data: {
                original,
                replacement: `${strictOperator} ${value}`,
                impossibleValue: OTHER_NULLISH_VALUE[value],
              },
              fix: (fixer) => replaceComparison(fixer, comparison, strictOperator, value),
            });
            return;
          }

          const pairOperator = PAIR_OPERATORS[looseOperator];
          const {parent} = node;
          const needsParentheses =
            !isParenthesized(node, sourceCode) &&
            (parent.type === 'BinaryExpression' ||
              (parent.type === 'LogicalExpression' &&
                parent.operator !== '||' &&
                parent.operator !== pairOperator));
          const operandText = isParenthesized(operand, sourceCode)
            ? `(${sourceCode.getText(operand)})`
            : sourceCode.getText(operand);
          const separateComparisons = `${operandText} ${strictOperator} null ${pairOperator} ${operandText} ${strictOperator} undefined`;

          context.report({
            node,
            messageId: 'splitComparison',
            data: {operator: strictOperator, original},
            fix:
              hasSideEffect(operand, sourceCode) || sourceCode.getCommentsInside(node).length > 0
                ? null
                : (fixer) =>
                    fixer.replaceText(
                      node,
                      needsParentheses ? `(${separateComparisons})` : separateComparisons,
                    ),
          });
        },
      };
    }

    // Pairs are visited before the comparisons in them, which are then only reported as a part of
    // their pair
    const comparisonsInPairs = new Set<ESTree.Node>();

    return {
      LogicalExpression: (node) => {
        const {left} = node;
        // `a || x === null || x === undefined`
        const first = parseComparison(
          left.type === 'LogicalExpression' &&
            left.operator === node.operator &&
            !isParenthesized(left, sourceCode)
            ? left.right
            : left,
        );
        const second = parseComparison(node.right);
        if (
          !first ||
          !second ||
          PAIR_OPERATORS[first.looseOperator] !== node.operator ||
          second.looseOperator !== first.looseOperator ||
          first.nullishValue === second.nullishValue ||
          sourceCode.getText(first.operand) !== sourceCode.getText(second.operand) ||
          hasSideEffect(first.operand, sourceCode) ||
          getLooselyNullishValues(first.operand).has('document.all')
        ) {
          return;
        }

        comparisonsInPairs.add(first.node).add(second.node);

        const operatorToken = sourceCode.getTokenBefore(
          node.right,
          (token) => token.value === node.operator,
        );
        const tokenBeforeOperator = operatorToken && sourceCode.getTokenBefore(operatorToken);
        const lastToken = sourceCode.getLastToken(node);
        context.report({
          loc: {start: sourceCode.getLoc(first.node).start, end: sourceCode.getLoc(node).end},
          messageId: 'joinComparisons',
          data: {replacement: `${first.looseOperator} null`},
          fix:
            tokenBeforeOperator &&
            lastToken &&
            !sourceCode.commentsExistBetween(tokenBeforeOperator, lastToken)
              ? (fixer) => [
                  ...replaceComparison(fixer, first, first.looseOperator, 'null'),
                  fixer.removeRange([tokenBeforeOperator.range[1], sourceCode.getRange(node)[1]]),
                ]
              : null,
        });
      },

      BinaryExpression: (node) => {
        const comparison = parseComparison(node);
        if (!comparison || comparisonsInPairs.has(node)) {
          return;
        }

        const {operand, nullishValue, looseOperator, isStrict} = comparison;
        // A strict comparison works like `== null` if the value can't be anything else `== null`
        // matches. If the type allows neither value, the comparison likely guards against a wrong
        // type, so it's left alone
        const values = isStrict ? getLooselyNullishValues(operand) : undefined;
        if (values ? values.size === 1 && values.has(nullishValue) : nullishValue === 'undefined') {
          context.report({
            node,
            messageId: isStrict ? 'replaceByType' : 'replace',
            data: {
              original: `${node.operator} ${nullishValue}`,
              replacement: `${looseOperator} null`,
              impossibleValue: OTHER_NULLISH_VALUE[nullishValue],
            },
            fix: (fixer) => replaceComparison(fixer, comparison, looseOperator, 'null'),
          });
        }
      },
    };
  },
};

export {rule as consistentNullishComparison};

import {isParenthesized} from '@eslint-community/eslint-utils';
import type * as Eslint from 'eslint';
import type * as ESTree from 'estree';
import type {JSONSchema4} from 'json-schema';
import type * as ts from 'typescript';
import type {Prettify} from '../../types';
import {allUnionMembers} from '../../utils';
import {
  MEMBER_OBJECT_TYPES,
  TYPE_ONLY_WRAPPER_TYPES,
  getTypeInformation,
  isIndexSignatureRead,
  needsLeadingSemicolon,
} from '../rule-utils';

type Style = 'empty-string' | 'length';

type OperatorMap = Readonly<Partial<Record<ESTree.BinaryOperator, ESTree.BinaryOperator>>>;

type BinaryExpression = Prettify<ESTree.BinaryExpression & Eslint.Rule.NodeParentExtension>;

const RULE_OPTIONS_SCHEMA: Readonly<JSONSchema4> = {
  enum: allUnionMembers<Style>()(['empty-string', 'length']),
};

// The operator maps below are keyed by the operator as written with the empty string or zero on
// the right
const EMPTY_STRING_TO_LENGTH_OPERATORS: OperatorMap = {
  '===': '===',
  '==': '==',
  '!==': '>',
  '!=': '>',
};

const LENGTH_TO_EMPTY_STRING_OPERATORS: OperatorMap = {
  '===': '===',
  '==': '==',
  '!==': '!==',
  '!=': '!=',
  '>': '!==',
};

const MIRRORED_OPERATORS: OperatorMap = {
  '>': '<',
  '<': '>',
};

const isEmptyString = (node: ESTree.Node) =>
  node.type === 'TemplateLiteral'
    ? node.expressions.length === 0 &&
      // cspell:disable-next-line
      node.quasis[0]?.value.cooked === ''
    : node.type === 'Literal' && node.value === '';

const isZero = (node: ESTree.Node) => node.type === 'Literal' && node.value === 0;

const isLengthAccess = (node: ESTree.Node): node is ESTree.MemberExpression =>
  node.type === 'MemberExpression' &&
  !node.computed &&
  !node.optional &&
  node.property.type === 'Identifier' &&
  node.property.name === 'length';

// Turns `0 < a` into `a > 0` and back
const mirrorIf = (shouldMirror: boolean, operator: ESTree.BinaryOperator) =>
  (shouldMirror && MIRRORED_OPERATORS[operator]) || operator;

// The operand compared with the literal, and the operator as if the literal is on the right
const splitComparison = (node: BinaryExpression, isLiteral: (operand: ESTree.Node) => boolean) => {
  const isLiteralOnLeft = isLiteral(node.left);
  return isLiteralOnLeft || isLiteral(node.right)
    ? {
        isLiteralOnLeft,
        literal: isLiteralOnLeft ? node.left : node.right,
        operand: isLiteralOnLeft ? node.right : node.left,
        operator: mirrorIf(isLiteralOnLeft, node.operator),
      }
    : undefined;
};

const rule: Eslint.JSRuleDefinition<{
  RuleOptions: [Style?];
  MessageIds: 'preferEmptyString' | 'preferLength';
}> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        "Enforce checking whether a string is empty either with `.length === 0` and `.length > 0` or with `=== ''` and `!== ''`",
    },
    fixable: 'code',
    schema: [RULE_OPTIONS_SCHEMA],
    defaultOptions: ['length'],
    messages: {
      preferEmptyString: 'Use `{{ replacement }}` instead of `{{ original }}`.',
      preferLength: 'Use `{{ replacement }}` instead of `{{ original }}`.',
    },
  },

  create: (context) => {
    const {sourceCode} = context;
    const typeInformation = getTypeInformation(sourceCode);
    if (!typeInformation) {
      throw new Error(
        'This rule requires type information: https://typescript-eslint.io/getting-started/typed-linting',
      );
    }

    const {checker, getType} = typeInformation;
    const stringType = checker.getStringType();
    const numberType = checker.getNumberType();
    const emptyStringType = checker.getStringLiteralType('');

    // Also true for string literal, template literal and branded string types, and for type
    // parameters constrained to them. `any` and `never` are assignable to both `string` and
    // `number`
    const isString = (type: ts.Type) =>
      checker.isTypeAssignableTo(type, stringType) && !checker.isTypeAssignableTo(type, numberType);

    // The comparison with an empty string also narrows the type. Code may rely on that for a union
    // or literal type, like `'' | 'auto'`, but hardly ever for `string`, which it narrows to `''`
    const isNarrowable = (type: ts.Type) =>
      [type, checker.getBaseConstraintOfType(type)].some(
        (typeOrConstraint) => typeOrConstraint?.isUnion() || typeOrConstraint?.isStringLiteral(),
      );

    const canBeEmpty = (type: ts.Type): boolean => {
      if (type.isUnion()) {
        return type.types.some(canBeEmpty);
      }

      if (type.isIntersection()) {
        // Object members of an intersection with a primitive are brands, which don't exist at
        // runtime
        return type.types.every((member) => !isString(member) || canBeEmpty(member));
      }

      const constraint = checker.getBaseConstraintOfType(type);
      return constraint == null || constraint === type
        ? checker.isTypeAssignableTo(emptyStringType, type)
        : canBeEmpty(constraint);
    };

    // Whether `(` added before the node would continue the previous statement
    const needsSemicolonBefore = (node: Eslint.Rule.Node): boolean =>
      node.type === 'ExpressionStatement'
        ? needsLeadingSemicolon(sourceCode, node)
        : node.parent != null &&
          sourceCode.getRange(node.parent)[0] === sourceCode.getRange(node)[0] &&
          needsSemicolonBefore(node.parent);

    const getParenthesizedLastToken = (node: ESTree.Node) =>
      (isParenthesized(node, sourceCode) ? sourceCode.getTokenAfter(node) : null) ||
      sourceCode.getLastToken(node);

    const getOperatorToken = ({left, right, operator}: ESTree.BinaryExpression) =>
      sourceCode.getFirstTokenBetween(left, right, (token) => token.value === operator);

    const checkEmptyStringComparison = (node: BinaryExpression) => {
      const comparison = splitComparison(node, isEmptyString);
      const newOperator = comparison && EMPTY_STRING_TO_LENGTH_OPERATORS[comparison.operator];
      if (!comparison || !newOperator) {
        return;
      }

      const {isLiteralOnLeft, literal, operand} = comparison;
      const type = getType(operand);
      if (
        type == null ||
        !isString(type) ||
        isNarrowable(type) ||
        // `.length` would throw where the value is missing, and the type of such a read only says
        // it can be with `noUncheckedIndexedAccess`
        isIndexSignatureRead(typeInformation, operand)
      ) {
        return;
      }

      const operatorToken = getOperatorToken(node);
      const operandLastToken = getParenthesizedLastToken(operand);
      if (!operatorToken || !operandLastToken) {
        return;
      }

      const needsParentheses =
        !isParenthesized(operand, sourceCode) && !MEMBER_OBJECT_TYPES.has(operand.type);
      context.report({
        node,
        messageId: 'preferLength',
        data: {original: `${node.operator} ''`, replacement: `.length ${newOperator} 0`},
        fix: (fixer) => [
          ...(needsParentheses
            ? [
                fixer.insertTextBefore(
                  operand,
                  // The left operand starts where the comparison does
                  !isLiteralOnLeft && needsSemicolonBefore(node) ? ';(' : '(',
                ),
              ]
            : []),
          fixer.insertTextAfter(operandLastToken, needsParentheses ? ').length' : '.length'),
          fixer.replaceText(operatorToken, mirrorIf(isLiteralOnLeft, newOperator)),
          fixer.replaceText(literal, '0'),
        ],
      });
    };

    const checkLengthComparison = (node: BinaryExpression) => {
      const comparison = splitComparison(node, isZero);
      const newOperator = comparison && LENGTH_TO_EMPTY_STRING_OPERATORS[comparison.operator];
      if (!comparison || !newOperator || !isLengthAccess(comparison.operand)) {
        return;
      }

      const {literal, operand, operator} = comparison;
      const type = getType(operand.object);
      if (
        type == null ||
        !isString(type) ||
        // Comparing a string that is never empty with `''` is a type error, and comparing one that
        // is always empty narrows it to `never`
        !canBeEmpty(type) ||
        (type.isStringLiteral() && type.value.length === 0)
      ) {
        return;
      }

      const operatorToken = getOperatorToken(node);
      const dotToken = sourceCode.getTokenBefore(operand.property);
      // `!==` binds more loosely than `>` and `<`
      const needsParentheses =
        newOperator !== operator &&
        !isParenthesized(node, sourceCode) &&
        (node.parent.type === 'BinaryExpression' || TYPE_ONLY_WRAPPER_TYPES.has(node.parent.type));
      if (operatorToken && dotToken) {
        context.report({
          node,
          messageId: 'preferEmptyString',
          data: {original: `.length ${operator} 0`, replacement: `${newOperator} ''`},
          fix: (fixer) => [
            ...(needsParentheses
              ? [fixer.insertTextBefore(node, '('), fixer.insertTextAfter(node, ')')]
              : []),
            fixer.remove(dotToken),
            fixer.remove(operand.property),
            fixer.replaceText(operatorToken, newOperator),
            fixer.replaceText(literal, "''"),
          ],
        });
      }
    };

    return {
      BinaryExpression:
        context.options[0] === 'empty-string' ? checkLengthComparison : checkEmptyStringComparison,
    };
  },
};

export {rule as consistentEmptyStringCheck};

import {isParenthesized} from '@eslint-community/eslint-utils';
import type * as Eslint from 'eslint';
import type * as ESTree from 'estree';
import type * as ts from 'typescript';

interface TypeInformation {
  program: ts.Program;
  esTreeNodeToTSNodeMap: {get: (node: ESTree.Node) => ts.Node | undefined};
}

const hasTypeInformation = (parserServices: unknown): parserServices is TypeInformation =>
  typeof parserServices === 'object' &&
  parserServices != null &&
  'esTreeNodeToTSNodeMap' in parserServices &&
  'program' in parserServices &&
  parserServices.program != null;

const isNullishCoalescing = (node: ESTree.Node | null): node is ESTree.LogicalExpression =>
  node?.type === 'LogicalExpression' && node.operator === '??';

const rule: Eslint.Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer `||` and `||=` over `??` and `??=` where they work the same, that is, where the left side cannot be a falsy value other than `null` and `undefined`',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferLogicalOr:
        'Use `{{ replacement }}` instead of `{{ operator }}`: they work the same here, because the left side cannot be `false`, `0`, `0n`, `NaN` or an empty string.',
    },
  },

  create: (context) => {
    const {sourceCode} = context;
    const parserServices: unknown = sourceCode.parserServices;
    if (!hasTypeInformation(parserServices)) {
      throw new Error(
        'This rule requires type information: https://typescript-eslint.io/getting-started/typed-linting',
      );
    }

    const checker = parserServices.program.getTypeChecker();
    const falsyTypes = [
      checker.getFalseType(),
      checker.getNumberLiteralType(0),
      checker.getBigIntLiteralType({negative: false, base10Value: '0'}),
      checker.getStringLiteralType(''),
    ];
    const nonPrimitiveType = checker.getNonPrimitiveType();
    const numberType = checker.getNumberType();
    const voidTypeFlags = checker.getVoidType().flags;
    const nullishOrNeverTypeFlags = new Set([
      checker.getNeverType().flags,
      checker.getNullType().flags,
      checker.getUndefinedType().flags,
    ]);

    // Where `||` and `??` differ
    const canBeNonNullishFalsy = (type: ts.Type): boolean => {
      if (type.isUnion()) {
        return type.types.some(canBeNonNullishFalsy);
      }

      if (type.isIntersection()) {
        // Object members of an intersection with a primitive are brands, which don't exist at
        // runtime
        const nonObjectMembers = type.types.filter(
          (member) => !checker.isTypeAssignableTo(member, nonPrimitiveType),
        );
        return (nonObjectMembers.length > 0 ? nonObjectMembers : type.types).every(
          canBeNonNullishFalsy,
        );
      }

      // Unlike assignability, also works for string enums
      if (type.isLiteral()) {
        const {value} = type;
        return typeof value === 'object'
          ? value.base10Value === '0'
          : !value ||
              // Any number can be assigned to a numeric enum, like a combination of flags
              (typeof value === 'number' && checker.isTypeAssignableTo(numberType, type));
      }

      const constraint = checker.getBaseConstraintOfType(type);
      if (constraint != null && constraint !== type) {
        return canBeNonNullishFalsy(constraint);
      }

      return (
        falsyTypes.some((falsyType) => checker.isTypeAssignableTo(falsyType, type)) ||
        // A function returning `void` may still return any value
        type.flags === voidTypeFlags ||
        // The type of `document.all`, the only falsy object
        type.getSymbol()?.getName() === 'HTMLAllCollection' ||
        // An unconstrained type parameter can be anything
        type.isTypeParameter()
      );
    };

    const canBeReplaced = ({left}: ESTree.AssignmentExpression | ESTree.LogicalExpression) => {
      const leftTsNode = parserServices.esTreeNodeToTSNodeMap.get(left);
      const leftType = leftTsNode && checker.getTypeAtLocation(leftTsNode);
      return (
        leftType != null &&
        // An always nullish left side is more likely typed wrong than written on purpose
        (leftType.isUnion() ? leftType.types : [leftType]).some(
          (member) => !nullishOrNeverTypeFlags.has(member.flags),
        ) &&
        !canBeNonNullishFalsy(leftType)
      );
    };

    const getOperatorToken = ({
      left,
      right,
      operator,
    }: ESTree.AssignmentExpression | ESTree.LogicalExpression) =>
      sourceCode.getFirstTokenBetween(left, right, (token) => token.value === operator);

    // The `??` expressions of a chain like `a ?? b ?? c`, starting from the last one
    const getChain = (node: ESTree.LogicalExpression): ESTree.LogicalExpression[] =>
      isNullishCoalescing(node.left) && !isParenthesized(node.left, sourceCode)
        ? [node, ...getChain(node.left)]
        : [node];

    const report = (
      operatorToken: Eslint.AST.Token,
      operator: string,
      fix: Eslint.Rule.ReportFixer,
    ) => {
      context.report({
        loc: operatorToken.loc,
        messageId: 'preferLogicalOr',
        data: {operator, replacement: operator.replace('??', '||')},
        fix,
      });
    };

    return {
      'AssignmentExpression[operator="??="]': (node: ESTree.AssignmentExpression) => {
        const operatorToken = getOperatorToken(node);
        if (operatorToken && canBeReplaced(node)) {
          report(operatorToken, '??=', (fixer) => fixer.replaceText(operatorToken, '||='));
        }
      },

      'LogicalExpression[operator="??"]': (
        node: ESTree.LogicalExpression & Eslint.Rule.NodeParentExtension,
      ) => {
        // A chain is fixed as a whole from its last `??`, so that `||` and `??`, which can't be
        // mixed without parentheses, only get them where they meet
        if (isNullishCoalescing(node.parent) && !isParenthesized(node, sourceCode)) {
          return;
        }

        const links = getChain(node).flatMap((link) => {
          const operatorToken = getOperatorToken(link);
          return operatorToken ? {link, operatorToken, isReplaced: canBeReplaced(link)} : [];
        });
        const fix: Eslint.Rule.ReportFixer = (fixer) =>
          links.flatMap(({operatorToken, isReplaced}, index) => {
            const inner = links[index + 1];
            return [
              ...(isReplaced ? [fixer.replaceText(operatorToken, '||')] : []),
              ...(inner && inner.isReplaced !== isReplaced
                ? [fixer.insertTextBefore(inner.link, '('), fixer.insertTextAfter(inner.link, ')')]
                : []),
            ];
          });
        links.forEach(({operatorToken, isReplaced}) => {
          if (isReplaced) {
            report(operatorToken, '??', fix);
          }
        });
      },
    };
  },
};

export {rule as preferLogicalOr};

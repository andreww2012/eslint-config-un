import {findVariable} from '@eslint-community/eslint-utils';
import {AST_NODE_TYPES, type TSESTree} from '@typescript-eslint/types';
import type * as Eslint from 'eslint';
import type * as ESTree from 'estree';

const rule: Eslint.Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow checking a naked type parameter against `never` (`T extends never`) in conditional types, which resolves to `never` instead of taking the true branch',
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      noDistributiveNeverCheck:
        '`{{ typeParameter }} extends never` can never take the true branch: a conditional type distributes over a naked type parameter, checking its union members one by one, and `never` is a union of no members at all, so the whole conditional resolves to `never` instead. Use `[{{ typeParameter }}] extends [never]`, which opts out of distribution and actually tests for `never`',
      wrapBothSidesInTuples: 'Wrap both sides in a tuple: `[{{ typeParameter }}] extends [never]`',
    },
  },

  create: (context) => {
    const {sourceCode} = context;

    const parserServices: unknown = sourceCode.parserServices;
    const isTypescriptParserUsed =
      typeof parserServices === 'object' &&
      parserServices != null &&
      'esTreeNodeToTSNodeMap' in parserServices;
    if (!isTypescriptParserUsed) {
      return {};
    }

    return {
      TSConditionalType: ({checkType, extendsType}: TSESTree.TSConditionalType) => {
        if (
          checkType.type !== AST_NODE_TYPES.TSTypeReference ||
          extendsType.type !== AST_NODE_TYPES.TSNeverKeyword
        ) {
          return;
        }

        const {typeName} = checkType;
        if (typeName.type !== AST_NODE_TYPES.Identifier) {
          return;
        }

        const variable = findVariable(sourceCode.getScope(typeName), typeName);
        if (
          !variable?.defs.some(
            ({node}: {node: ESTree.Node | TSESTree.TSTypeParameter}) =>
              node.type === AST_NODE_TYPES.TSTypeParameter,
          )
        ) {
          return;
        }

        const data = {typeParameter: typeName.name};

        context.report({
          loc: {start: checkType.loc.start, end: extendsType.loc.end},
          messageId: 'noDistributiveNeverCheck',
          data,
          suggest: [
            {
              messageId: 'wrapBothSidesInTuples',
              data,
              fix: (fixer) => [
                fixer.insertTextBeforeRange(checkType.range, '['),
                fixer.insertTextAfterRange(checkType.range, ']'),
                fixer.insertTextBeforeRange(extendsType.range, '['),
                fixer.insertTextAfterRange(extendsType.range, ']'),
              ],
            },
          ],
        });
      },
      // ESLint types have no way of expressing a node type for a selector unknown to them
    } as unknown as Eslint.Rule.RuleListener;
  },
};

export {rule as noDistributiveNeverCheck};

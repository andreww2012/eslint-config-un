import type Eslint from 'eslint';
import type * as ESTree from 'estree';

const isEmptyObject = (node: ESTree.Node): node is ESTree.ObjectExpression =>
  node.type === 'ObjectExpression' && node.properties.length === 0;

const isNonEmptyObject = (node: ESTree.Node): node is ESTree.ObjectExpression =>
  node.type === 'ObjectExpression' && node.properties.length > 0;

const needsParensOnLeftOfAnd = (node: ESTree.Expression): boolean => {
  switch (node.type) {
    case 'LogicalExpression': {
      return node.operator !== '&&';
    }
    case 'ConditionalExpression':
    case 'AssignmentExpression':
    case 'SequenceExpression':
    case 'YieldExpression':
    case 'ArrowFunctionExpression': {
      return true;
    }
    default: {
      return false;
    }
  }
};

const NODE_TYPES_SAFE_AFTER_UNARY_NOT = new Set<ESTree.Node['type']>([
  'Identifier',
  'Literal',
  'MemberExpression',
  'CallExpression',
  'NewExpression',
  'ThisExpression',
  'TemplateLiteral',
  'TaggedTemplateExpression',
  'ChainExpression',
  'UnaryExpression',
  'UpdateExpression',
  'ArrayExpression',
  'ObjectExpression',
  'FunctionExpression',
  'ClassExpression',
]);

const needsParensAfterUnaryNot = (node: ESTree.Expression): boolean =>
  !NODE_TYPES_SAFE_AFTER_UNARY_NOT.has(node.type);

const rule: Eslint.Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow spreading a conditional expression where one branch is an empty object literal; prefer `...(condition && {...})` instead.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      noEmptyObjectTernarySpread:
        'Prefer `...({{ condition }} && {...})` over spreading a conditional expression with an empty object branch.',
    },
  },

  create: (context) => {
    const {sourceCode} = context;

    return {
      SpreadElement: (node) => {
        if (node.parent.type !== 'ObjectExpression') {
          return;
        }

        const {argument} = node;
        if (argument.type !== 'ConditionalExpression') {
          return;
        }

        const {test, consequent, alternate} = argument;

        let nonEmpty: ESTree.ObjectExpression;
        let isConsequentNonEmpty: boolean;
        if (isNonEmptyObject(consequent) && isEmptyObject(alternate)) {
          nonEmpty = consequent;
          isConsequentNonEmpty = true;
        } else if (isEmptyObject(consequent) && isNonEmptyObject(alternate)) {
          nonEmpty = alternate;
          isConsequentNonEmpty = false;
        } else {
          return;
        }

        context.report({
          node: argument,
          messageId: 'noEmptyObjectTernarySpread',
          data: {
            condition: isConsequentNonEmpty ? 'condition' : '!condition',
          },
          fix: (fixer) => {
            const testText = sourceCode.getText(test);
            const objectText = sourceCode.getText(nonEmpty);

            const conditionText = isConsequentNonEmpty
              ? needsParensOnLeftOfAnd(test)
                ? `(${testText})`
                : testText
              : needsParensAfterUnaryNot(test)
                ? `!(${testText})`
                : `!${testText}`;

            return fixer.replaceText(argument, `${conditionText} && ${objectText}`);
          },
        });
      },
    };
  },
};

export {rule as noEmptyObjectTernarySpread};

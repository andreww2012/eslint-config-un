import {type AstSelector, createParser} from 'css-selector-parser';

export interface TagNode {
  tagName: string;
  attributes: Record<string, string>;
}

const WHITESPACE_SEPARATED_REGEXP = /\S+/g;

const parseSelector = createParser({
  syntax: {
    tag: true,
    ids: true,
    classNames: true,
    attributes: {
      operators: ['=', '~=', '|=', '^=', '$=', '*='],
      caseSensitivityModifiers: ['i', 's'],
    },
    pseudoClasses: {
      definitions: {Selector: ['not']},
    },
  },
});

const normalizeCase = (text: string, isCaseInsensitive: boolean) =>
  isCaseInsensitive ? text.toLowerCase() : text;

interface AttributeCondition {
  name: string;
  operator?: string;
  value?: string;
  isCaseInsensitive?: boolean;
}

const doesAttributeMatch = (
  node: TagNode,
  {name, operator, value: expectedValueRaw = '', isCaseInsensitive = false}: AttributeCondition,
) => {
  if (!Object.hasOwn(node.attributes, name)) {
    return false;
  }
  if (operator == null) {
    return true;
  }

  // The value always comes with an operator
  const expectedValue = normalizeCase(expectedValueRaw, isCaseInsensitive);
  const actualValue = normalizeCase(node.attributes[name] || '', isCaseInsensitive);
  switch (operator) {
    case '=': {
      return actualValue === expectedValue;
    }
    case '~=': {
      return actualValue.match(WHITESPACE_SEPARATED_REGEXP)?.includes(expectedValue) === true;
    }
    case '|=': {
      return actualValue === expectedValue || actualValue.startsWith(`${expectedValue}-`);
    }
    case '^=': {
      return actualValue.startsWith(expectedValue);
    }
    case '$=': {
      return actualValue.endsWith(expectedValue);
    }
    case '*=': {
      return actualValue.includes(expectedValue);
    }
    /* v8 ignore next 3 -- the parser only accepts the operators above */
    default: {
      throw new Error(`Unsupported operator ${operator}`);
    }
  }
};

const doesSelectorMatch = (selector: AstSelector, node: TagNode): boolean =>
  selector.rules.some((rule) =>
    rule.items.every((item) => {
      switch (item.type) {
        case 'TagName': {
          return node.tagName === item.name;
        }
        case 'WildcardTag': {
          return true;
        }
        case 'Id': {
          return doesAttributeMatch(node, {name: 'id', operator: '=', value: item.name});
        }
        case 'ClassName': {
          return doesAttributeMatch(node, {name: 'class', operator: '~=', value: item.name});
        }
        case 'Attribute': {
          return doesAttributeMatch(node, {
            name: item.name,
            operator: item.operator,
            value: item.value?.type === 'String' ? item.value.value : undefined,
            isCaseInsensitive: item.caseSensitivityModifier === 'i',
          });
        }
        case 'PseudoClass': {
          // Only `:not()` with a selector is enabled
          /* v8 ignore next 3 -- the parser rejects `:not` without a selector */
          if (item.argument?.type !== 'Selector') {
            throw new Error(`Unsupported pseudo-class ${item.name}`);
          }
          return !doesSelectorMatch(item.argument, node);
        }
        /* v8 ignore next 3 -- the parser rejects the other syntax */
        default: {
          throw new Error(`Unsupported selector syntax ${item.type}`);
        }
      }
    }),
  );

export const parseCssSelector = (selector: string) => {
  const astSelector = parseSelector(selector);
  return (node: TagNode) => doesSelectorMatch(astSelector, node);
};

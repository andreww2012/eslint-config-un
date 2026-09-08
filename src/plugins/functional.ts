import {definePluginMetadata} from './shared';

export default definePluginMetadata('functional', {
  configs: ['functional'],
  docsUrl: 'https://github.com/eslint-functional/eslint-plugin-functional/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/eslint-functional/eslint-plugin-functional/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'functional-parameters': {requiresTypeInfo: 'optional'},
    'immutable-data': {requiresTypeInfo: true},
    'no-conditional-statements': {requiresTypeInfo: true},
    'no-expression-statements': {requiresTypeInfo: 'optional'},
    'no-mixed-types': {requiresTypeInfo: true},
    'no-return-void': {requiresTypeInfo: true},
    'no-throw-statements': {requiresTypeInfo: 'optional'},
    'prefer-immutable-types': {requiresTypeInfo: true},
    'prefer-property-signatures': {requiresTypeInfo: true},
    'prefer-tacit': {requiresTypeInfo: true},
    'readonly-type': {requiresTypeInfo: true, stylistic: true},
    'type-declaration-immutability': {requiresTypeInfo: true},
  },
});

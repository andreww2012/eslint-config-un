import {definePluginMetadata} from './shared';

export default definePluginMetadata('functional', {
  configs: ['functional'],
  docsUrl: 'https://github.com/eslint-functional/eslint-plugin-functional/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/eslint-functional/eslint-plugin-functional/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'functional-parameters': {requiresTypeInfo: 'optional', disableInCodeBlocks: 'tooStrict'},
    'immutable-data': {requiresTypeInfo: true},
    'no-class-inheritance': {disableInCodeBlocks: 'tooStrict'},
    'no-classes': {disableInCodeBlocks: 'tooStrict'},
    'no-conditional-statements': {requiresTypeInfo: true},
    'no-expression-statements': {requiresTypeInfo: 'optional', disableInCodeBlocks: 'tooStrict'},
    'no-let': {disableInCodeBlocks: 'tooStrict'},
    'no-loop-statements': {disableInCodeBlocks: 'tooStrict'},
    'no-mixed-types': {requiresTypeInfo: true},
    'no-promise-reject': {disableInCodeBlocks: 'tooStrict'},
    'no-return-void': {requiresTypeInfo: true},
    'no-this-expressions': {disableInCodeBlocks: 'tooStrict'},
    'no-throw-statements': {requiresTypeInfo: 'optional', disableInCodeBlocks: 'tooStrict'},
    'no-try-statements': {disableInCodeBlocks: 'tooStrict'},
    'prefer-immutable-types': {requiresTypeInfo: true},
    'prefer-property-signatures': {requiresTypeInfo: true},
    'prefer-readonly-type': {requiresTypeInfo: true},
    'prefer-tacit': {requiresTypeInfo: true},
    'readonly-type': {requiresTypeInfo: true, stylistic: true},
    'type-declaration-immutability': {requiresTypeInfo: true},
  },
});

import {definePluginMetadata} from './shared';

export default definePluginMetadata('awscdk', {
  configs: ['awsCdk'],
  docsUrl: 'https://awscdk-lint.dev',
  ruleDocsUrl: (ruleName) => `https://awscdk-lint.dev/rules/${ruleName}.html`,
  gitTag: (version) => `eslint-plugin-awscdk@${version}`,
  rules: {
    'construct-constructor-property': {requiresTypeInfo: true},
    'no-construct-in-interface': {requiresTypeInfo: true},
    'no-construct-in-public-property-of-construct': {requiresTypeInfo: true},
    'no-construct-stack-suffix': {requiresTypeInfo: true},
    'no-mutable-public-property-of-construct': {requiresTypeInfo: true},
    'no-parent-name-construct-id-match': {requiresTypeInfo: true},
    'no-unused-props': {requiresTypeInfo: true},
    'no-variable-construct-id': {requiresTypeInfo: true},
    'pascal-case-construct-id': {requiresTypeInfo: true},
    'prefer-grants-property': {requiresTypeInfo: true},
    'prevent-construct-id-collision': {requiresTypeInfo: true},
    'props-name-convention': {requiresTypeInfo: true},
    'require-jsdoc': {requiresTypeInfo: true},
    'require-passing-this': {requiresTypeInfo: true},
  },
});

import {definePluginMetadata} from './shared';

export default definePluginMetadata('zod-openapi', {
  configs: ['zodOpenapi'],
  docsUrl: 'https://github.com/samchungy/eslint-plugin-zod-openapi/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/samchungy/eslint-plugin-zod-openapi/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'prefer-meta-last': {requiresTypeInfo: true},
    'prefer-zod-default': {requiresTypeInfo: true},
    'require-comment': {requiresTypeInfo: true},
    'require-example': {requiresTypeInfo: true},
    'require-meta': {requiresTypeInfo: true},
  },
});

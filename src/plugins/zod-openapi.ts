import {definePluginMetadata} from './shared';

export default definePluginMetadata('zod-openapi', {
  configs: ['zodOpenapi'],
  docsUrl: 'https://github.com/samchungy/eslint-plugin-zod-openapi/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/samchungy/eslint-plugin-zod-openapi/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'prefer-meta-last': {requiresTypeInfo: true, disableInCodeBlocks: 'tooStrict'},
    'prefer-zod-default': {requiresTypeInfo: true, disableInCodeBlocks: 'tooStrict'},
    'require-comment': {requiresTypeInfo: true, disableInCodeBlocks: 'tooStrict'},
    'require-example': {requiresTypeInfo: true, disableInCodeBlocks: 'tooStrict'},
    'require-meta': {requiresTypeInfo: true, disableInCodeBlocks: 'tooStrict'},
  },
});

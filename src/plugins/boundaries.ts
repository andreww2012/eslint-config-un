import {definePluginMetadata} from './shared';

export default definePluginMetadata('boundaries', {
  configs: ['boundaries'],
  docsUrl: 'https://www.jsboundaries.dev',
  ruleDocsUrl: (ruleName, ref) =>
    ref
      ? `https://github.com/javierbrea/eslint-plugin-boundaries/blob/${ref}/docs/rules/${ruleName}.md`
      : `https://jsboundaries.dev/docs/rules/${ruleName}`,
  // Deprecated rules
  ruleDocsRefs: {
    'element-types': 'v7.2.0',
    'no-ignored': 'v6.0.2',
    'no-unknown': 'v6.0.2',
  },
  rules: {
    dependencies: {disableInCodeBlocks: 'imports'},
    'element-types': {disableInCodeBlocks: 'imports'},
    'entry-point': {disableInCodeBlocks: 'imports'},
    external: {disableInCodeBlocks: 'imports'},
    'no-ignored': {disableInCodeBlocks: 'imports'},
    'no-ignored-dependencies': {disableInCodeBlocks: 'imports'},
    'no-private': {disableInCodeBlocks: 'imports'},
    'no-unknown': {disableInCodeBlocks: 'imports'},
    'no-unknown-dependencies': {disableInCodeBlocks: 'imports'},
    'no-unknown-files': {disableInCodeBlocks: 'fileName'},
  },
});

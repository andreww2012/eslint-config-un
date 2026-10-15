import {definePluginMetadata} from './shared';

export default definePluginMetadata('boundaries', {
  configs: ['boundaries'],
  docsUrl: 'https://www.jsboundaries.dev',
  ruleDocsUrl: (ruleName) => `https://jsboundaries.dev/docs/rules/${ruleName}`,
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

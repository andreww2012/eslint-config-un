import {definePluginMetadata, gitTagAsVersion} from './shared';

export default definePluginMetadata('lit', {
  configs: ['lit'],
  isMainPlugin: true,
  docsUrl: 'https://github.com/43081j/eslint-plugin-lit/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/43081j/eslint-plugin-lit/blob/HEAD/docs/rules/${ruleName}.md`,
  gitTag: gitTagAsVersion,
  rules: {
    'ban-attributes': {disableInCodeBlocks: 'tooStrict'},
    'no-template-arrow': {disableInCodeBlocks: 'performance'},
    'no-template-bind': {disableInCodeBlocks: 'performance'},
    'prefer-static-styles': {disableInCodeBlocks: 'performance'},
    'quoted-expressions': {stylistic: true},
  },
});

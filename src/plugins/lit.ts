import {definePluginMetadata, gitTagAsVersion} from './shared';

export default definePluginMetadata('lit', {
  configs: ['lit'],
  isMainPlugin: true,
  docsUrl: 'https://github.com/43081j/eslint-plugin-lit/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/43081j/eslint-plugin-lit/blob/HEAD/docs/rules/${ruleName}.md`,
  gitTag: gitTagAsVersion,
  rules: {
    'quoted-expressions': {stylistic: true},
  },
});

import {definePluginMetadata, gitTagAsVersion} from './shared';

export default definePluginMetadata('wc', {
  configs: ['webComponents'],
  docsUrl: 'https://github.com/43081j/eslint-plugin-wc/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/43081j/eslint-plugin-wc/blob/HEAD/docs/rules/${ruleName}.md`,
  gitTag: gitTagAsVersion,
  rules: {
    'file-name-matches-element': {stylistic: true},
    'max-elements-per-file': {stylistic: true},
  },
});

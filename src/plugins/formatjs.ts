import {definePluginMetadata} from './shared';

export default definePluginMetadata('formatjs', {
  configs: ['formatJs'],
  docsUrl: 'https://formatjs.github.io/docs/tooling/linter',
  ruleDocsUrl: (ruleName) => `https://formatjs.github.io/docs/tooling/linter/#${ruleName}`,
  gitTag: (tag) => `eslint-plugin-formatjs@${tag}`,
  rules: {
    'prefer-formatted-message': {stylistic: true},
    'prefer-pound-in-plural': {stylistic: true},
  },
});

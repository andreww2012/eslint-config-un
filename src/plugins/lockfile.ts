import {definePluginMetadata} from './shared';

export default definePluginMetadata('lockfile', {
  configs: ['lockfile'],
  docsUrl: 'https://github.com/ljharb/lockfile-tools/blob/HEAD/packages/eslint-plugin/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/ljharb/lockfile-tools/blob/HEAD/packages/eslint-plugin/docs/rules/${ruleName}.md`,
  gitTag: (tag) => `eslint-plugin-lockfile@${tag}`,
  rules: {
    'binary-conflicts': {requiresNetwork: true},
    integrity: {requiresNetwork: true},
    'minimum-release-age': {requiresNetwork: true},
  },
});

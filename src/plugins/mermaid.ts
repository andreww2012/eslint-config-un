import {definePluginMetadata} from './shared';

export default definePluginMetadata('mermaid', {
  configs: ['mermaid'],
  docsUrl: 'https://mmd-toolkit.github.io/mmd-toolkit/linter/',
  ruleDocsUrl: (ruleName) =>
    `https://mmd-toolkit.github.io/mmd-toolkit/linter/rules/${ruleName}.html`,
  gitTag: (version) => `@mmd-toolkit/eslint-plugin@${version}`,
  suggestedPrefix: [
    '@mmd-toolkit',
    'consistent with the language name; `@mmd-toolkit` is the name of the project',
  ],
  rules: {},
});

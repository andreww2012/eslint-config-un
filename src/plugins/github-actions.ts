import {definePluginMetadata} from './shared';

export default definePluginMetadata('github-actions', {
  configs: ['githubActions'],
  docsUrl: 'https://eslint-plugin-github-action.ntnyq.com',
  ruleDocsUrl: (ruleName) => `https://eslint-plugin-github-action.ntnyq.com/rules/${ruleName}`,
  suggestedPrefix: [
    'github-action',
    'consistent with the platform name (and `eslint-plugin-github-actions` looks unmaintained)',
  ],
  rules: {
    'action-name-casing': {
      autofixDisabled: [
        true,
        'mangles acronyms and punctuation, like `Deploy to AWS (CI)` into `Deploy To Aws Ci`, and other workflows match a workflow by its name',
      ],
    },
    'prefer-file-extension': {stylistic: true},
  },
});

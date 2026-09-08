import {definePluginMetadata} from './shared';

export default definePluginMetadata('github-actions', {
  configs: ['githubActions'],
  docsUrl: 'https://eslint-plugin-github-action.ntnyq.com',
  ruleDocsUrl: (ruleName) => `https://eslint-plugin-github-action.ntnyq.com/rules/${ruleName}`,
  suggestedPrefix: [
    'github-action',
    'consistent with the platform name (also `-github-actions` plugin seems to not be maintained)',
  ],
  rules: {
    'action-name-casing': {autofixDisabled: [true, 'may break the name']},
    'prefer-file-extension': {stylistic: true},
  },
});

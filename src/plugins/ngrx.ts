import {definePluginMetadata, gitTagAsVersion} from './shared';

export default definePluginMetadata('ngrx', {
  configs: ['ngrx'],
  docsUrl: 'https://ngrx.io/guide/eslint-plugin',
  ruleDocsUrl: (ruleName) => `https://ngrx.io/guide/eslint-plugin/rules/${ruleName}`,
  gitTag: gitTagAsVersion,
  suggestedPrefix: ['@ngrx', 'more concise and convenient to use; `@` feels redundant'],
  rules: {
    'select-style': {stylistic: true},
  },
});

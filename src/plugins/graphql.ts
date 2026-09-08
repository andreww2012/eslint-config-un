import {definePluginMetadata} from './shared';

export default definePluginMetadata('graphql', {
  configs: ['graphql'],
  docsUrl: 'https://the-guild.dev/graphql/eslint/docs',
  ruleDocsUrl: (ruleName) => `https://the-guild.dev/graphql/eslint/rules/${ruleName}`,
  gitTag: (tag) => `@graphql-eslint/eslint-plugin@${tag}`,
  suggestedPrefix: ['@graphql-eslint', 'more concise and convenient to use; `@` feels redundant'],
  rules: {
    alphabetize: {stylistic: true},
    'description-style': {stylistic: true},
    'input-name': {stylistic: true},
    'match-document-filename': {stylistic: true},
    'naming-convention': {stylistic: true},
    'no-hashtag-description': {stylistic: true},
    'no-typename-prefix': {stylistic: true},
  },
});

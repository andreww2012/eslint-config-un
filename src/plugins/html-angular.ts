import {definePluginMetadata} from './shared';

export default definePluginMetadata('html-angular', {
  configs: ['angular'],
  docsUrl: 'https://html-eslint.org/docs/angular-template/getting-started',
  ruleDocsUrl: (ruleName) => `https://html-eslint.org/docs/angular-template/rules/${ruleName}`,
  suggestedPrefix: [
    '@html-eslint/angular-template',
    'more concise and convenient to use; `@` feels redundant',
  ],
  prettierLanguage: 'html',
  rules: {
    'class-spacing': {stylistic: true, prettierIncompatible: true},
  },
});

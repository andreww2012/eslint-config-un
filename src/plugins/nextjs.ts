import {definePluginMetadata} from './shared';

export default definePluginMetadata('nextjs', {
  configs: [
    'nextJs', // eslint-disable-line case-police/string-check
  ],
  docsUrl: 'https://nextjs.org/docs/app/api-reference/config/eslint',
  ruleDocsUrl: (ruleName) => `https://nextjs.org/docs/messages/${ruleName}`,
  suggestedPrefix: ['@next/next', '`@next/next` is redundant; consistent with the framework name'],
  rules: {},
});

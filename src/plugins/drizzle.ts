import {definePluginMetadata} from './shared';

export default definePluginMetadata('drizzle', {
  configs: ['drizzle'],
  docsUrl: 'https://github.com/drizzle-team/drizzle-orm/blob/HEAD/eslint-plugin-drizzle/readme.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/drizzle-team/drizzle-orm/blob/main/eslint-plugin-drizzle/readme.md#:~:text=${ruleName}:`,
  rules: {
    'enforce-delete-with-where': {disableInCodeBlocks: 'runtimeOnly'},
    'enforce-update-with-where': {disableInCodeBlocks: 'runtimeOnly'},
  },
});

import {definePluginMetadata} from './shared';

export default definePluginMetadata('nextjs', {
  configs: [
    'nextJs', // eslint-disable-line case-police/string-check
  ],
  docsUrl: 'https://nextjs.org/docs/app/api-reference/config/eslint',
  ruleDocsUrl: (ruleName) => `https://nextjs.org/docs/messages/${ruleName}`,
  suggestedPrefix: ['@next/next', '`@next/next` is redundant; consistent with the framework name'],
  rules: {
    'google-font-display': {disableInCodeBlocks: 'performance'},
    'google-font-preconnect': {disableInCodeBlocks: 'performance'},
    'next-script-for-ga': {disableInCodeBlocks: 'performance'},
    'no-assign-module-variable': {disableInCodeBlocks: 'runtimeOnly'},
    'no-before-interactive-script-outside-document': {disableInCodeBlocks: 'fileName'},
    'no-css-tags': {disableInCodeBlocks: 'performance'},
    'no-document-import-in-page': {disableInCodeBlocks: 'fileName'},
    'no-head-element': {disableInCodeBlocks: 'fileName'},
    'no-img-element': {disableInCodeBlocks: 'performance'},
    'no-page-custom-font': {disableInCodeBlocks: 'fileName'},
    'no-sync-scripts': {disableInCodeBlocks: 'performance'},
    'no-unwanted-polyfillio': {disableInCodeBlocks: 'performance'},
  },
});

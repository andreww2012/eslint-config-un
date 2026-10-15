import {definePluginMetadata} from './shared';

export default definePluginMetadata('pinia', {
  configs: ['vue'],
  ruleDocsUrl: (ruleName) =>
    `https://github.com/lisilinhart/eslint-plugin-pinia/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'no-duplicate-store-ids': {disableInCodeBlocks: 'tooStrict'},
    'no-store-to-refs-in-store': {disableInCodeBlocks: 'tooStrict'},
    'prefer-single-store-per-file': {disableInCodeBlocks: 'tooStrict'},
    'prefer-use-store-naming-convention': {stylistic: true},
    'require-setup-store-properties-export': {disableInCodeBlocks: 'tooStrict'},
  },
});

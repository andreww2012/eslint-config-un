import {definePluginMetadata} from './shared';

export default definePluginMetadata('qwik', {
  configs: ['qwik'],
  docsUrl: 'https://qwik.dev/docs/advanced/eslint',
  ruleDocsUrl: (ruleName) => `https://qwik.dev/docs/advanced/eslint/#${ruleName}`,
  gitTag: (version) => `eslint-plugin-qwik@${version}`,
  rules: {
    'jsx-a': {disableInCodeBlocks: 'runtimeOnly'},
    'jsx-img': {disableInCodeBlocks: 'performance'},
    'loader-location': {disableInCodeBlocks: 'fileName'},
    'no-use-visible-task': {disableInCodeBlocks: 'performance'},
    'prefer-classlist': {stylistic: true},
    'unused-server': {disableInCodeBlocks: 'unused'},
    'use-method-usage': {disableInCodeBlocks: 'tooStrict'},
    'valid-lexical-scope': {requiresTypeInfo: true},
  },
});

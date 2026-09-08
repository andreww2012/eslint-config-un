import {definePluginMetadata} from './shared';

export default definePluginMetadata('qwik', {
  configs: ['qwik'],
  docsUrl: 'https://qwik.dev/docs/advanced/eslint',
  ruleDocsUrl: (ruleName) => `https://qwik.dev/docs/advanced/eslint/#${ruleName}`,
  gitTag: (version) => `eslint-plugin-qwik@${version}`,
  rules: {
    'prefer-classlist': {stylistic: true},
    'valid-lexical-scope': {requiresTypeInfo: true},
  },
});

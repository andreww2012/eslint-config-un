import {definePluginMetadata} from './shared';

export default definePluginMetadata('css-in-js', {
  configs: ['cssInJs'],
  docsUrl: 'https://ota-meshi.github.io/eslint-plugin-css',
  ruleDocsUrl: (ruleName) => `https://ota-meshi.github.io/eslint-plugin-css/rules/${ruleName}.html`,
  suggestedPrefix: [
    'css',
    'conflicts with [`@eslint/css`](https://npmx.dev/@eslint/css), and our prefix describes the plugin better',
  ],
  rules: {
    'color-hex-style': {stylistic: true},
    'named-color': {stylistic: true},
    'property-casing': {stylistic: true},
  },
});

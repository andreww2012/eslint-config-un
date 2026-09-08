import {definePluginMetadata} from './shared';

export default definePluginMetadata('cspell', {
  configs: ['cspell'],
  docsUrl:
    'https://github.com/streetsidesoftware/cspell/blob/HEAD/packages/cspell-eslint-plugin/README.md',
  suggestedPrefix: ['@cspell', 'more concise and convenient to use; `@` feels redundant'],
  rules: {},
});

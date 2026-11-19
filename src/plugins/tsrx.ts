import {definePluginMetadata} from './shared';

export default definePluginMetadata('tsrx', {
  configs: ['tsrx'],
  docsUrl: 'https://github.com/tsrx-org/tsrx/blob/HEAD/packages/eslint-plugin/README.md',
  gitTag: (version) => `@tsrx/eslint-plugin@${version}`,
  rules: {
    'jsx-curly-brace-presence': {stylistic: true},
    'no-await-in-loop': {disableInCodeBlocks: 'performance'},
    'no-unreachable': {disableInCodeBlocks: 'alternatives'},
    'no-unused-vars': {disableInCodeBlocks: 'unused'},
    'no-useless-assignment': {disableInCodeBlocks: 'unused'},
  },
});

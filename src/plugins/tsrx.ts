import {definePluginMetadata} from './shared';

export default definePluginMetadata('tsrx', {
  configs: ['tsrx'],
  docsUrl: 'https://github.com/tsrx-org/tsrx/blob/HEAD/packages/eslint-plugin/README.md',
  gitTag: (version) => `@tsrx/eslint-plugin@${version}`,
  rules: {
    'no-lazy-destructuring-in-modules': {disableInCodeBlocks: 'runtimeOnly'},
  },
});

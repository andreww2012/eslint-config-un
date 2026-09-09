import {definePluginMetadata} from './shared';

export default definePluginMetadata('tsdoc', {
  configs: ['tsdoc'],
  docsUrl: 'https://tsdoc.org/pages/packages/eslint-plugin-tsdoc',
  gitTag: (version) => `eslint-plugin-tsdoc_v${version}`,
  rules: {
    syntax: {
      requiresTypeInfo: [
        false,
        'only reads `baseUrl` off the compiler options, never asks about a type',
      ],
    },
  },
});

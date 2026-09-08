import {definePluginMetadata, gitTagAsVersion} from './shared';

export default definePluginMetadata('prefer-arrow-functions', {
  configs: ['preferArrowFunctions'],
  docsUrl: 'https://github.com/JamieMason/eslint-plugin-prefer-arrow-functions/blob/HEAD/README.md',
  gitTag: gitTagAsVersion,
  rules: {
    'prefer-arrow-functions': {stylistic: true},
  },
});

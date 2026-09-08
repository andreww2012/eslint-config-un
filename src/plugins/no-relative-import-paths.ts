import {definePluginMetadata} from './shared';

export default definePluginMetadata('no-relative-import-paths', {
  configs: ['noRelativeImportPaths'],
  docsUrl:
    'https://github.com/MelvinVermeer/eslint-plugin-no-relative-import-paths/blob/HEAD/README.md',
  rules: {
    'no-relative-import-paths': {disableInCodeBlocks: 'imports'},
  },
});

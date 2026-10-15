import {definePluginMetadata} from './shared';

export default definePluginMetadata('react-refresh', {
  configs: ['react'],
  rules: {'only-export-components': {disableInCodeBlocks: 'imports'}},
});

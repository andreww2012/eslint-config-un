import {definePluginMetadata} from './shared';

export default definePluginMetadata('react-hooks', {
  configs: ['react'],
  gitTag:
    'https://github.com/react/react/blob/HEAD/packages/eslint-plugin-react-hooks/CHANGELOG.md',
  rules: {
    'incompatible-library': {disableInCodeBlocks: 'performance'},
    invariant: {disableInCodeBlocks: 'performance'},
    'preserve-manual-memoization': {disableInCodeBlocks: 'performance'},
    'rules-of-hooks': {disableInCodeBlocks: 'tooStrict'},
    todo: {disableInCodeBlocks: 'performance'},
  },
});

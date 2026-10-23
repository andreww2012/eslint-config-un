import {eslintConfig} from 'eslint-config-un';

export default eslintConfig({
  configs: {
    arrowReturnStyle: {
      overrides: {
        // Makes the rule format code through its Prettier worker
        'arrow-return-style/arrow-return-style': [2, {usePrettier: {printWidth: 40}}],
      },
    },
    // Makes the `format/prettier` rule format the code blocks through its worker
    format: {files: [], configFencedCodeBlocks: true},
  },
  plugins: {
    // The progress is hidden in CI by default
    'file-progress': {settings: {hide: false}},
  },
});

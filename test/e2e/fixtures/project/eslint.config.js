import {eslintConfig} from 'eslint-config-un';

export default eslintConfig({
  configs: {
    arrowReturnStyle: {
      overrides: {
        // Makes the rule format code through its Prettier worker
        'arrow-return-style/arrow-return-style': [2, {usePrettier: {printWidth: 40}}],
      },
    },
    fileProgress: true,
    // Flat layouts hoist `remeda`, a dependency of `eslint-plugin-clsx`, so it's detected as installed
    remeda: false,
  },
  plugins: {
    // The progress is hidden in CI by default
    'file-progress': {settings: {hide: false}},
  },
});

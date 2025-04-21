import {eslintConfig} from './src';

const TEST_DIR_GLOB = ['test/**/*'];

export default eslintConfig({
  configs: {
    ts: {
      configTypeAware: {
        ignores: TEST_DIR_GLOB,
      },
    },
    deMorgan: true,
    yaml: true,
    toml: true,
    json: true,
    jsxA11y: false,
    packageJson: true,
    vue: true,
  },

  extraConfigs: [
    {
      files: TEST_DIR_GLOB,
      rules: {
        'sort-imports': 0,
        'import/order': 0,
        'unused-imports/no-unused-imports': 0,
        'import/no-duplicates': 0,
        'import/newline-after-import': 0,
        'no-unused-vars': 0,
        '@typescript-eslint/no-unused-vars': 0,
        '@stylistic/padding-line-between-statements': 0,
        '@typescript-eslint/no-non-null-assertion': 0,
        '@typescript-eslint/consistent-type-imports': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@stylistic/quotes': 0,
      },
    },
  ],
});

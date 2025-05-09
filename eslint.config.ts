import {eslintConfig} from './src';

const TEST_DIR_GLOB = ['test/**/*'];

export default eslintConfig({
  mode: 'lib',
  pluginRenames: {
    '@typescript-eslint': 'ts',
  },

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
    casePolice: true,
    import: {
      ignores: TEST_DIR_GLOB,
    },
    perfectionist: {
      files: ['src/plugins.ts'],
    },
  },

  extraConfigs: [
    {
      files: TEST_DIR_GLOB,
      rules: {
        curly: 0,
        'import/order': 0,
        'no-unused-vars': 0,
        'prefer-template': 0,
        'sort-imports': 0,

        'unused-imports/no-unused-imports': 0,

        'import/newline-after-import': 0,
        'import/no-duplicates': 0,

        '@typescript-eslint/consistent-type-imports': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-non-null-assertion': 0,
        '@typescript-eslint/no-shadow': 0,
        '@typescript-eslint/no-unused-vars': 0,

        '@stylistic/padding-line-between-statements': 0,
        '@stylistic/quotes': 0,

        'jsdoc/lines-before-block': 0,

        'astro/prefer-class-list-directive': 0,
        'astro/sort-attributes': 0,

        'svelte/button-has-type': 0,
        'svelte/prefer-style-directive': 0,
        'svelte/sort-attributes': 0,
      },
    },
    {
      name: 'forbid-utility-package-imports',
      ignores: ['src/utils.ts', 'src/types.ts'],
      rules: {
        'no-restricted-imports': [
          2,
          {
            patterns: [
              {
                regex: '^local-pkg|type-fest|klona|@antfu/utils|defu|es-toolkit$',
                message:
                  'Please do not use this package directly, import utility functions from `utils.ts` instead',
              },
            ],
          },
        ],
      },
    },
  ],
});

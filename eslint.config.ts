import {optionalPeerDependencyVersionShouldMatchInstalledVersion} from './eslint-local-rules/optional-peer-dependency-version-should-match-installed-version';
import {eslintConfig, isInEditor} from './src';

const TEST_DIR_GLOB = ['test/**/*'];

export default eslintConfig({
  mode: 'lib',

  configs: {
    markdownLinks: {
      check: {
        deadUrls: {
          ignoreUrls: [
            // npm gets rate-limited quickly: https://github.com/ota-meshi/eslint-plugin-markdown-links/issues/42
            String.raw`/^https:\/\/npmjs.com\/.*/`,
          ],
        },
      },
    },
    markdownPreferences: {
      ignores: ['LICENSE.md'],
      wordsToPreserveCasingOf: ['eslint-config-un', 'Description/Notes'],
      overrides: {
        'markdown-preferences/sort-definitions': 2,
      },
    },
    fileProgress: !isInEditor(),
    ts: {
      allowDefaultProject: ['*.config.*s', '.*.*s'],
      configSortTsconfigKeys: {
        orderCompilerOptions: {
          preset: 'totalTypescript',
        },
      },
    },
    erasableSyntaxOnly: true,
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
      overrides: {
        'import/no-extraneous-dependencies': (_, options) => [
          2,
          {
            ...options?.[0],
            whitelist: ['import-meta-resolve'], // Patched + bundled
          },
        ],
      },
    },
    perfectionist: {
      configSortObjects: {
        files: ['src/plugins.ts'],
      },
    },
    nodeDependencies: {
      enforceAbsoluteVersion: {
        dependencies: 'always',
        devDependencies: 'always',
        peerDependencies: 'never',
      },
    },
    depend: {
      options: {
        allowed: ['eslint-plugin-react'],
      },
    },
    jsdoc: {
      customTags: ['knipignore', 'until', 'aka'],
    },
    eslintPlugin: {
      files: ['eslint-local-rules/**', 'src/plugin-un/rules/**'],
    },
    nx: false,
    rxjs: false,
    turbo: false,
    importZod: true,
  },

  extraConfigs: [
    {
      files: ['package.json'],
      plugins: {
        'local-rules': {
          rules: {
            'optional-peer-dependency-version-should-match-installed-version':
              optionalPeerDependencyVersionShouldMatchInstalledVersion,
          },
        },
      },
      rules: {
        'local-rules/optional-peer-dependency-version-should-match-installed-version': [
          2,
          {
            ignore: [
              '@angular-eslint/eslint-plugin',
              '@angular-eslint/eslint-plugin-template',
              '@angular-eslint/template-parser',
            ],
          },
        ],
      },
    },
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

        'ts/consistent-type-imports': 0,
        'ts/no-explicit-any': 0,
        'ts/no-non-null-assertion': 0,
        'ts/no-shadow': 0,
        'ts/no-unused-vars': 0,

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
      ignores: ['src/utils.ts', 'src/types.ts', 'scripts/**'],
      rules: {
        'no-restricted-imports': [
          2,
          {
            patterns: [
              {
                regex:
                  '^(?:local-pkg|type-fest|klona|@antfu/utils|defu|es-toolkit|remeda|node:util|destr|string-ts)$',
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

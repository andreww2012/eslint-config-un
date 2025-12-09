import {optionalPeerDependencyVersionShouldMatchInstalledVersion} from './eslint-local-rules/optional-peer-dependency-version-should-match-installed-version';
import {eslintConfig, isInCi} from './src';
import {forbidImportingFromUtilityLibraries} from './src/snippets';

const TEST_DIR_GLOB = ['test/**/*'];

export default eslintConfig({
  mode: 'lib',
  extraPlugins: {
    'local-rules': () => ({
      rules: {
        'optional-peer-dependency-version-should-match-installed-version':
          optionalPeerDependencyVersionShouldMatchInstalledVersion,
      },
    }),
  },

  configs: {
    js: {
      overrides: {
        'arrow-body-style': 2,
      },
    },
    expectType: true,
    command: true,
    checkFile: {
      fileNamingConventions: {
        '{eslint-local-rules,src,scripts}/**': 'KEBAB_CASE',
      },
    },
    markdown: {
      configSentencesPerLine: {
        ignores: ['CHANGELOG.md', '.changeset/README.md'],
      },
    },
    markdownLinks: {
      ...(!isInCi && {files: []}),
    },
    markdownPreferences: {
      ignores: ['LICENSE.md'],
      wordsToPreserveCasingOf: ['eslint-config-un', 'Description/Notes', 'Tailwind'],
      casingEnforcementIgnorePatterns: ['/changes/i'] /* Added by changeset CLI to CHANGELOG.md */,
    },
    fileProgress: true,
    ts: {
      allowDefaultProject: ['*.config.*s', '.*.*s'],
      configSortTsconfigKeys: {
        orderCompilerOptions: {
          preset: 'totalTypescript',
        },
      },
    },
    erasableSyntaxOnly: true,
    yaml: true,
    toml: true,
    json: true,
    jsxA11y: false,
    packageJson: true,
    casePolice: true,
    import: {
      ignores: TEST_DIR_GLOB,
      extraneousDependenciesWhitelist: [
        'import-meta-resolve', // Bundled (patched)
        'is-in-editor', // Bundled (patched)
      ],
    },
    perfectionist: {
      configSortInterfaces: {
        files: ['src/configs/index.ts'],
      },
      configSortObjects: {
        files: ['src/configs/extra/no-stylistic-rules.ts', 'src/loaders/*.ts'],
        ignores: ['src/loaders/{index,shared}.ts'],
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
  },

  extraConfigs: [
    {
      files: ['**/*.?([cm])ts?(x)'],
      rules: {
        'ts/no-restricted-types': [
          2,
          {
            types: {
              Omit: 'Please use `OmitStrict` utility instead',
            },
          },
        ],
      },
    },
    {
      files: ['package.json'],
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
      files: ['src/configs/**/*.ts'],
      rules: {
        'import/no-default-export': 0,
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
              forbidImportingFromUtilityLibraries({
                packageNames: {'local-pkg': true, klona: true, defu: true, destr: true},
                message:
                  'Please do not use this package directly, import utilities from `utils.ts` or `types.ts` instead',
              }),
            ],
          },
        ],
      },
    },
    {
      name: 'enforce-kebab-case-for-plugin-and-parser-prefixes',
      files: ['src/loaders/{plugins,parsers}.ts'],
      rules: {
        'ts/naming-convention': [
          2,
          {
            selector: 'objectLiteralProperty',
            format: null,
            custom: {
              match: true,
              regex: String.raw`^@?[a-z\d]+(-[a-z\d]+)*(?:/[a-z\d]+(-[a-z\d]+)*)?$`,
            },
          },
        ],
      },
    },
    {
      files: ['CHANGELOG.md'], // Partially auto-generated by Changesets
      rules: {
        'markdown-preferences/prefer-link-reference-definitions': 0,
      },
    },
  ],
});

import {optionalPeerDependencyVersionShouldMatchInstalledVersion} from './eslint-local-rules/optional-peer-dependency-version-should-match-installed-version';
import {eslintConfig, isInCi} from './src';
import {forbidImportingFromUtilityLibraries} from './src/snippets';

export default eslintConfig({
  ignores: ['test/**/fixtures/**'],
  mode: 'lib',
  extraPlugins: {
    'local-rules': () => ({
      rules: {
        'optional-peer-dependency-version-should-match-installed-version':
          optionalPeerDependencyVersionShouldMatchInstalledVersion,
      },
    }),
  },
  defaultConfigsStatus: 'misc-enabled',

  configs: {
    js: {
      overrides: {
        'arrow-body-style': 2,
      },
    },
    lockfile: {
      noNonRegistryDependencySpecifiers: {
        ignore: [
          {
            specifier: 'file',
            explanation: 'Local dependencies are safe',
          },
        ],
      },
    },
    barrelFiles: true,
    expectType: true,
    command: true,
    checkFile: {
      fileNamingConventions: {
        '{eslint-local-rules,src,scripts}/**': 'KEBAB_CASE',
      },
    },
    markdown: {
      configSentencesPerLine: {
        ignores: [
          'CHANGELOG.md',
          // Putting every sentence on its own line causes line wraps in the changelog
          '.changeset/*.md',
        ],
      },
    },
    markdownLinks: {
      ...(!isInCi && {files: []}),
    },
    markdownPreferences: {
      ignores: ['LICENSE.md'],
      wordsToPreserveCasingOf: ['eslint-config-un', 'Description/Notes', 'Tailwind', 'JSDoc'],
      casingEnforcementIgnorePatterns: ['/changes/i'] /* Added by changeset CLI to CHANGELOG.md */,
    },
    fileProgress: true,
    ts: {
      // TODO remove when this is fixed: https://github.com/typescript-eslint/typescript-eslint/issues/12068
      ignores: ['src/config-un/resolve-config-async-data.ts'],
      allowDefaultProject: ['*.config.*s', '.*.*s'],
      configSortTsconfigKeys: {
        orderCompilerOptions: {
          preset: 'totalTypescript',
        },
      },
    },
    erasableSyntaxOnly: true,
    jsxA11y: false,
    casePolice: true,
    import: {
      overrides: {
        'import/default': 0, // TODO started to produce many false reports, investigate why
      },

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
        files: [
          'src/configs/extra/no-stylistic-rules.ts',
          'src/loaders/*.ts',
          'scripts/updated-packages-info.ts',
        ],
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
    e18e: {
      configModuleReplacements: {
        options: {
          allowed: ['eslint-plugin-react'],
        },
      },
    },
    jsdoc: {
      customTags: ['knipignore', 'until', 'aka'],
    },
    eslintPlugin: {
      files: ['eslint-local-rules/**', 'src/plugin-un/rules/**'],
    },
    security: {
      overrides: {
        'security/detect-unsafe-regex': 0, // Many false positives
      },
    },
    vitest: {
      overrides: {
        'vitest/expect-expect': [
          2,
          {
            assertFunctionNames: ['expect', 'expectConfigState'],
          },
        ],
      },
    },

    // False positives:
    betterTailwind: false,
    clsx: false,
    graphql: false,
    formatJs: false,
    jestDom: false,
    nx: false,
    react: false,
    svelte: false,
    testingLibrary: false,
    turbo: false,
    youDontNeedLodashUnderscore: false,
  },

  extraConfigs: [
    {
      files: ['scripts/**'],
      rules: {
        'max-classes-per-file': 0,
        'e18e/prefer-static-regex': 0,
      },
    },
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
      files: ['test/**/*'],
      rules: {
        'e18e/prefer-static-regex': 0,
        'ts/no-shadow': 0,
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
        'markdown-preferences/emphasis-delimiters-style': 0, // Changes *italic* to _italic_
      },
    },
    {
      files: ['README.md/3_3.ts'],
      rules: {
        'ts/consistent-type-definitions': 0,
        'ts/no-empty-object-type': 0,
      },
    },
  ],
});

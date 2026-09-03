import {optionalPeerDependencyVersionShouldMatchInstalledVersion} from './eslint-local-rules/optional-peer-dependency-version-should-match-installed-version';
import {eslintConfig, isInCi} from './src';
import {forbidImportingFromUtilityLibraries} from './src/snippets';
import {ALWAYS_BUNDLED_DEPENDENCIES} from './tsdown.config';

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
  linterOptionsReportUnusedDisableDirectives: {
    ignores: [
      // Some rules are disabled in non-CI for this file
      isInCi ? null : '.agents/skills/eslint-config-un-new-eslint-plugin/SKILL.md',
      'src/configs/extra/no-prettier-incompatible-rules.ts',
    ].filter((v) => v != null),
  },

  defaultConfigsStatus: 'misc-enabled',
  configs: {
    barrelFiles: true,
    checkFile: {
      fileNamingConventions: {
        '{eslint-local-rules,src,scripts}/**': 'KEBAB_CASE',
      },
    },
    casePolice: true,
    command: true,
    e18e: {
      configModuleReplacements: {
        options: {
          allowed: ['eslint-plugin-react', 'eslint-plugin-jest-dom'],
        },
      },
    },
    erasableSyntaxOnly: true,
    eslintPlugin: {
      files: ['eslint-local-rules/**', 'src/plugin-un/rules/**'],
    },
    expectType: true,
    fileProgress: true,
    import: {
      extraneousDependenciesCheck: {whitelist: ALWAYS_BUNDLED_DEPENDENCIES},
      configAllowDefaultExport: {
        files: ({filesDefault}) => [...filesDefault, 'src/configs/**/*.ts'],
      },
    },
    js: {
      overrides: {
        'arrow-body-style': 2,
      },
    },
    jsdoc: {
      customTags: ['knipignore', 'until', 'aka'],
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
    markdown: {
      configSentencesPerLine: {
        ignores: [
          'CHANGELOG.md',
          // Putting every sentence on its own line causes line wraps in the changelog
          '.changeset/**/*.md',
        ],
      },
    },
    markdownPreferences: {
      ignores: ['LICENSE.md'],
      wordsToPreserveCasingOf: ['eslint-config-un', 'Description/Notes', 'Tailwind', 'JSDoc'],
      casingEnforcementIgnorePatterns: ['/changes/i'] /* Added by changeset CLI to CHANGELOG.md */,
    },
    nodeDependencies: {
      enforceAbsoluteVersion: {
        dependencies: 'always',
        devDependencies: 'always',
        peerDependencies: 'never',
      },
    },
    perfectionist: {
      configSortInterfaces: {
        files: ['src/configs/index.ts'],
      },
      configSortObjects: {
        files: [
          'src/configs/extra/no-prettier-incompatible-rules.ts',
          'src/configs/extra/no-stylistic-rules.ts',
          'src/loaders/*.ts',
          'scripts/shared/packages-meta.ts',
        ],
        ignores: ['src/loaders/{index,shared}.ts'],
      },
    },
    ts: {
      parserOptions: (isTypeAware) =>
        isTypeAware
          ? {
              projectService: false,
              project: './tsconfig.eslint.json',
              tsconfigRootDir: import.meta.dirname,
            }
          : {},
      configSortTsconfigKeys: {
        orderCompilerOptions: {
          preset: 'totalTypescript',
        },
      },
    },
    vitest: {
      additionalAssertions: ['expect', 'expectConfigState'],
    },

    // False positives:
    betterTailwind: false,
    clsx: false,
    formatJs: false,
    graphql: false,
    jsxA11y: false,
    nx: false,
    rxjs: false,
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
        'e18e/prefer-static-collator': 0,
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
        'markdown-preferences/padding-line-between-blocks': 0,
        'markdown-links/no-dead-urls': 0,
      },
    },
    {
      files: ['README.md/2_2.ts'],
      rules: {
        'ts/consistent-type-definitions': 0,
        'ts/no-empty-object-type': 0,
        'unicorn/no-accidental-bitwise-operator': 0,
      },
    },
    {
      files: ['lychee.toml'],
      rules: {
        // Reports TOML `#` comments as malformed `/* */` blocks, and its autofix
        // corrupts them by inserting padding before the last character
        'stylistic/spaced-comment': 0,
        // The `#:schema` directive must not have a space after `#`
        'toml/spaced-comment': 0,
      },
    },
  ],
});

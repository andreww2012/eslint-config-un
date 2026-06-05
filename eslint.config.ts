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
  loadPluginsOnDemand: {
    alwaysLoad: [
      'markdown-links', // Disabled in non-CI below, so need to load rules to avoid errors
    ],
  },
  linterOptionsReportUnusedDisableDirectives: {
    ignores: [
      // Some rules are disabled in non-CI for this file
      isInCi ? null : '.agents/skills/eslint-config-un-new-eslint-plugin/SKILL.md',
    ].filter((v) => v != null),
  },

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
      check: {
        deadUrls: {
          options: {
            ignoreUrls: [
              // Removed rules still linked from the .changeset files
              String.raw`/https:\/\/www\.eslint-react\.xyz\/docs\/rules\/(?:no-unnecessary-use-ref|dom-prefer-namespace-import|component-hook-factories|naming-convention-use-state|no-unnecessary-use-callback|no-unnecessary-use-memo|prefer-use-state-lazy-initialization)\/?/`,
              // Site just responds with 404
              String.raw`/https:\/\/eslint-plugin-github-action.ntnyq.com\/rules\/[\w-]+/`, // cspell:disable-line
            ],
          },
        },
      },
    },
    markdownPreferences: {
      ignores: ['LICENSE.md'],
      wordsToPreserveCasingOf: ['eslint-config-un', 'Description/Notes', 'Tailwind', 'JSDoc'],
      casingEnforcementIgnorePatterns: ['/changes/i'] /* Added by changeset CLI to CHANGELOG.md */,
    },
    fileProgress: true,
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
    erasableSyntaxOnly: true,
    jsxA11y: false,
    casePolice: true,
    import: {
      overrides: {
        'import/default': 0, // TODO started to produce many false reports, investigate why
      },

      // Must be in sync with `tsdown.config.ts`'s `deps.alwaysBundle`:
      extraneousDependenciesWhitelist: ['import-meta-resolve', 'remeda'],
    },
    packageJson: {
      overrides: {
        'package-json/no-local-dependencies': 0, // Local deps are bundled
      },
    },
    perfectionist: {
      configSortInterfaces: {
        files: ['src/configs/index.ts'],
      },
      configSortObjects: {
        files: [
          'src/configs/extra/no-stylistic-rules.ts',
          'src/loaders/*.ts',
          'scripts/shared/packages-meta.ts',
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
        'e18e/prefer-static-regex': 0,
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
        'markdown-links/no-dead-urls': 0,
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

import {optionalPeerDependencyVersionShouldMatchInstalledVersion} from './eslint-local-rules/optional-peer-dependency-version-should-match-installed-version';
import oxfmtConfig from './oxfmt.config';
import {eslintConfig, isInCi} from './src';
import {PLUGIN_METADATA_KEY_ORDER, RULE_TRAIT_ORDER} from './src/plugins/shared';
import {createNoRestrictedSyntaxRule, forbidImportingFromUtilityLibraries} from './src/snippets';
import {ALWAYS_BUNDLED_DEPENDENCIES} from './tsdown.config';

const PLUGIN_METADATA_GROUP_ORDER = [...PLUGIN_METADATA_KEY_ORDER, ...RULE_TRAIT_ORDER] as const;

const noRestrictedSyntaxPlugin = createNoRestrictedSyntaxRule('local-rules', {
  name: 'no-catch-parameter-type-annotation',
  selector: 'CatchClause > .param[typeAnnotation]',
  message: 'Catch clause parameters are already `unknown`, so the annotation is redundant',
});

export default eslintConfig({
  ignores: ['test/**/fixtures/**', '.agents/guidelines.md'],
  mode: 'lib',
  extraPlugins: {
    'local-rules': () => ({
      rules: {
        ...noRestrictedSyntaxPlugin.rules,
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
    ].filter((value) => value != null),
  },
  typeInfoRules: {
    parserOptions: {
      projectService: false,
      project: './tsconfig.eslint.json',
      tsconfigRootDir: import.meta.dirname,
    },
  },

  defaultConfigsStatus: 'misc-enabled',
  configs: {
    barrelFiles: true,
    casePolice: true,
    checkFile: {
      ignores: ['src/plugins/@.ts'],
      fileNamingConventions: {
        '{eslint-local-rules,src,scripts}/**': 'KEBAB_CASE',
      },
    },
    command: true,
    e18e: {
      configModuleReplacements: {
        options: {
          allowed: ['eslint-plugin-react'],
        },
      },
    },
    erasableSyntaxOnly: true,
    eslintPlugin: {
      files: ['eslint-local-rules/**', 'src/plugin-un/rules/**'],
    },
    expectType: true,
    format: {
      // Other files are formatted by oxfmt itself
      files: [],
      configFencedCodeBlocks: true,
      formatter: [
        'oxfmt',
        {
          bracketSpacing: oxfmtConfig.bracketSpacing,
          printWidth: oxfmtConfig.printWidth,
          singleQuote: oxfmtConfig.singleQuote,
        },
      ],
    },
    import: {
      extraneousDependenciesCheck: {whitelist: [...ALWAYS_BUNDLED_DEPENDENCIES]},
      configAllowDefaultExport: {
        files: ({filesDefault}) => [...filesDefault, 'src/configs/**/*.ts', 'src/plugins/*.ts'],
      },
    },
    js: {
      arrowFunctionBodyStyle: true,
    },
    jsdoc: {
      customTags: ['knipignore', 'until', 'aka'],
      overrides: {
        // Missing from the plugin's list of TypeScript globals
        'jsdoc/no-undefined-types': [2, {definedTypes: ['ReadonlySet']}],
      },
    },
    jsxA11y: false,
    lockfile: {
      overrides: {
        // TODO fetch full registry metadata of every locked package, which exhausts the heap in CI
        'lockfile/binary-conflicts': 0,
        'lockfile/shrinkwrap': 0,
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
      enforceCasing: true,
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
    svelte: false, // Only installed for the tests
    ts: {
      configSortTsconfigKeys: {
        orderCompilerOptions: {
          preset: 'totalTypescript',
        },
      },
    },
    un: {
      overrides: {
        'un/no-type-assertion': 2,
        'un/prefer-array-for-each': 2,
      },
    },
    vitest: {
      additionalAssertions: ['expectConfigState', 'expectExtraction'],
      vitestGlobalsImporting: 'disallow',
    },
  },

  extraConfigs: [
    {
      name: 'plugins-metadata-key-order',
      files: ['src/plugins/*.ts'],
      rules: {
        'perfectionist/sort-objects': [
          2,
          {
            customGroups: PLUGIN_METADATA_GROUP_ORDER.map((key) => ({
              groupName: key,
              elementNamePattern: `^${key}$`,
            })),
            groups: [...PLUGIN_METADATA_GROUP_ORDER, 'unknown'],
          },
        ],
      },
    },
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
        'local-rules/no-catch-parameter-type-annotation': 2,
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
              // oxfmt is pre-1.0 and released often: a caret range allows only one minor version
              'oxfmt',
              // Inlined plugins format with the user's Prettier, which can be any 3.x version
              'prettier',
              // Must stay a peer: under Yarn PnP, `typescript-eslint` can only get the `typescript`
              // it requires through us, and it checks the version itself
              'typescript',
            ],
          },
        ],
      },
    },
    {
      files: ['test/**/*'],
      rules: {
        'ts/no-shadow': 0,
        // Spies pass for boolean functions; options replace ours, hence the repeated defaults
        'unicorn/consistent-boolean-name': [
          2,
          {
            checkFunctions: 'prohibit',
            prefixes: {
              had: true,
              cannot: true,
              must: true,
              may: true,
              needs: true,
              allows: true,
              supports: true,
              contains: true,
              includes: true,
            },
            ignore: ['Spy$'],
          },
        ],
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
                packageNames: {
                  'local-pkg': true,
                  klona: true,
                  defu: true,
                  destr: true,
                  utilery: true,
                },
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
        'markdown-preferences/padding-line-between-blocks': 0,
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

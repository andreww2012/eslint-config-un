import {
  TSCONFIG_COMPILER_OPTIONS_KEYS,
  TSCONFIG_COMPILER_OPTIONS_ORDER_PRESETS,
} from '../../../src/configs/ts';

const FIXTURES = {
  unsortedTsconfig: 'tsconfig.unsorted.json',
} as const;

describe('ts: sub config `sortTsconfigKeys`', () => {
  describe('basic tests', () => {
    it('does not create `sort-tsconfig-keys` eslint config by default', async () => {
      const configResult = await computeEslintConfig('ts');

      expect(configResult.getConfigByUnPostfix('sort-tsconfig-keys')).toBeUndefined();
    });

    it('creates `sort-tsconfig-keys` eslint config when set to `true`', async () => {
      const configResult = await computeEslintConfig({ts: {configSortTsconfigKeys: true}});

      const config = configResult.getConfigByUnPostfix('sort-tsconfig-keys');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["{tsconfig,*.tsconfig,tsconfig.*}.json"]');
    });

    it('does not create `sort-tsconfig-keys` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({ts: {configSortTsconfigKeys: false}});

      expect(configResult.getConfigByUnPostfix('sort-tsconfig-keys')).toBeUndefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig({ts: {configSortTsconfigKeys: true}});

      expect(configResult.getRuleSeverities('sort-tsconfig-keys')).toStrictEqual({
        'jsonc/sort-keys': 2,
      });
    });

    it('`jsonc/sort-keys` rule fires on a tsconfig.json with unsorted keys', async () => {
      const results = await testEslintConfig(
        {ts: {configSortTsconfigKeys: {files: [`**/${FIXTURES.unsortedTsconfig}`]}}},
        FIXTURES.unsortedTsconfig,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.unsortedTsconfig,
        'jsonc/sort-keys',
      );

      expect(error?.message).toMatchInlineSnapshot(
        `"Expected object keys to be in specified order. 'compilerOptions' should be after 'extends'."`,
      );
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `sort-tsconfig-keys` eslint config', async () => {
        const FILES = ['tsconfig.json'];

        const configResult = await computeEslintConfig({
          ts: {configSortTsconfigKeys: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('sort-tsconfig-keys')?.files).toStrictEqual(FILES);
      });

      it('disables `sort-tsconfig-keys` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({ts: {configSortTsconfigKeys: {files: []}}});

        expect(configResult.getConfigByUnPostfix('sort-tsconfig-keys')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `sort-tsconfig-keys` eslint config and merges them with the implicit defaults', async () => {
        const IGNORES = ['**/node_modules/**'];

        const configResult = await computeEslintConfig({
          ts: {configSortTsconfigKeys: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('sort-tsconfig-keys')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `sort-tsconfig-keys` eslint config', async () => {
      const configResult = await computeEslintConfig({
        ts: {
          configSortTsconfigKeys: {
            overrides: {'jsonc/sort-keys': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('sort-tsconfig-keys')).toMatchObject({
        'jsonc/sort-keys': 0,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `orderTopLevel`', () => {
      it('uses default top-level keys order by default', async () => {
        const configResult = await computeEslintConfig({ts: {configSortTsconfigKeys: true}});

        expect(
          configResult.getRuleEntryOptions('sort-tsconfig-keys', 'jsonc/sort-keys')[0],
        ).toMatchInlineSnapshot(
          '{"order": ["extends", "references", "files", "include", "exclude", "compilerOptions", "vueCompilerOptions", "angularCompilerOptions", "ts-node"], "pathPattern": "^$"}',
        );
      });

      it('does not set top-level keys order when set to `false`', async () => {
        const configResult = await computeEslintConfig({
          ts: {configSortTsconfigKeys: {orderTopLevel: false}},
        });

        expect(
          configResult.getRuleEntryOptions('sort-tsconfig-keys', 'jsonc/sort-keys')[0],
        ).toMatchInlineSnapshot('{"order": [], "pathPattern": "^$"}');
      });

      it('uses custom top-level key order when set to array', async () => {
        const ORDER = ['compilerOptions', 'extends', 'include', 'exclude'];

        const configResult = await computeEslintConfig({
          ts: {configSortTsconfigKeys: {orderTopLevel: ORDER}},
        });

        expect(
          configResult.getRuleEntryOptions('sort-tsconfig-keys', 'jsonc/sort-keys')[0],
        ).toMatchObject({order: ORDER});
      });
    });

    describe('option: `orderCompilerOptions`', () => {
      it('uses `antfu` preset for `compilerOptions` order by default', async () => {
        const configResult = await computeEslintConfig({
          ts: {configSortTsconfigKeys: true},
        });

        expect(
          configResult.getRuleEntryOptions('sort-tsconfig-keys', 'jsonc/sort-keys')[1],
        ).toMatchObject({order: TSCONFIG_COMPILER_OPTIONS_ORDER_PRESETS.antfu});
      });

      it('uses `antfu` preset for `compilerOptions` order when set to `true`', async () => {
        const configResult = await computeEslintConfig({
          ts: {configSortTsconfigKeys: {orderCompilerOptions: true}},
        });

        expect(
          configResult.getRuleEntryOptions('sort-tsconfig-keys', 'jsonc/sort-keys')[1],
        ).toMatchObject({order: TSCONFIG_COMPILER_OPTIONS_ORDER_PRESETS.antfu});
      });

      it('does not set `compilerOptions` order when set to `false`', async () => {
        const configResult = await computeEslintConfig({
          ts: {configSortTsconfigKeys: {orderCompilerOptions: false}},
        });

        expect(
          configResult.getRuleEntryOptions('sort-tsconfig-keys', 'jsonc/sort-keys')[1],
        ).toMatchObject({order: []});
      });

      it('uses `antfu` preset when specified via object', async () => {
        const configResult = await computeEslintConfig({
          ts: {configSortTsconfigKeys: {orderCompilerOptions: {preset: 'antfu'}}},
        });

        expect(
          configResult.getRuleEntryOptions('sort-tsconfig-keys', 'jsonc/sort-keys')[1],
        ).toMatchObject({order: TSCONFIG_COMPILER_OPTIONS_ORDER_PRESETS.antfu});
      });

      it('uses `totalTypescript` preset when specified', async () => {
        const configResult = await computeEslintConfig({
          ts: {configSortTsconfigKeys: {orderCompilerOptions: {preset: 'totalTypescript'}}},
        });

        expect(
          configResult.getRuleEntryOptions('sort-tsconfig-keys', 'jsonc/sort-keys')[1],
        ).toMatchObject({order: TSCONFIG_COMPILER_OPTIONS_ORDER_PRESETS.totalTypescript});
      });

      it('uses custom key order when `type` is `order-keys`', async () => {
        const ORDER = ['strict', 'target', 'module', 'lib'];

        const configResult = await computeEslintConfig({
          ts: {configSortTsconfigKeys: {orderCompilerOptions: {type: 'order-keys', order: ORDER}}},
        });

        expect(
          configResult.getRuleEntryOptions('sort-tsconfig-keys', 'jsonc/sort-keys')[1],
        ).toMatchObject({order: ORDER});
      });

      it('uses custom group order and options order from `antfu` present within groups when `type` is `order-groups`', async () => {
        const configResult = await computeEslintConfig({
          ts: {
            configSortTsconfigKeys: {
              orderCompilerOptions: {type: 'order-groups', order: ['typeChecking', 'modules']},
            },
          },
        });

        expect(
          configResult.getRuleEntryOptions('sort-tsconfig-keys', 'jsonc/sort-keys')[1],
        ).toMatchInlineSnapshot(
          '{"order": ["strict", "strictBindCallApply", "strictFunctionTypes", "strictNullChecks", "strictPropertyInitialization", "allowUnreachableCode", "allowUnusedLabels", "alwaysStrict", "exactOptionalPropertyTypes", "noFallthroughCasesInSwitch", "noImplicitAny", "noImplicitOverride", "noImplicitReturns", "noImplicitThis", "noPropertyAccessFromIndexSignature", "noUncheckedIndexedAccess", "noUnusedLocals", "noUnusedParameters", "useUnknownInCatchVariables", "baseUrl", "rootDir", "rootDirs", "customConditions", "module", "moduleResolution", "moduleSuffixes", "noResolve", "paths", "resolveJsonModule", "resolvePackageJsonExports", "resolvePackageJsonImports", "typeRoots", "types", "allowArbitraryExtensions", "allowImportingTsExtensions", "allowUmdGlobalAccess"], "pathPattern": "^compilerOptions$"}',
        );
      });

      it('uses `alphabetical` order within a group when `orderWithinGroup` is `alphabetical`', async () => {
        const configResult = await computeEslintConfig({
          ts: {
            configSortTsconfigKeys: {
              orderCompilerOptions: {
                type: 'order-groups',
                order: ['typeChecking'],
                orderWithinGroup: {typeChecking: 'alphabetical'},
              },
            },
          },
        });

        expect(
          configResult.getRuleEntryOptions('sort-tsconfig-keys', 'jsonc/sort-keys')[1],
        ).toMatchObject({
          order: TSCONFIG_COMPILER_OPTIONS_KEYS.typeChecking.toSorted(),
        });
      });

      it('uses custom order within a group when `orderWithinGroup` is array', async () => {
        const TYPE_CHECKING_ORDER = ['strict', 'noImplicitAny'];

        const configResult = await computeEslintConfig({
          ts: {
            configSortTsconfigKeys: {
              orderCompilerOptions: {
                type: 'order-groups',
                order: ['typeChecking'],
                orderWithinGroup: {typeChecking: TYPE_CHECKING_ORDER},
              },
            },
          },
        });

        expect(
          configResult.getRuleEntryOptions('sort-tsconfig-keys', 'jsonc/sort-keys')[1],
        ).toMatchObject({order: TYPE_CHECKING_ORDER});
      });

      it('uses default `antfu` order for groups not present in `orderWithinGroup`', async () => {
        const TYPE_CHECKING_ORDER = ['strict', 'noImplicitAny'];

        const configResult = await computeEslintConfig({
          ts: {
            configSortTsconfigKeys: {
              orderCompilerOptions: {
                type: 'order-groups',
                order: ['typeChecking', 'modules'],
                orderWithinGroup: {typeChecking: TYPE_CHECKING_ORDER},
              },
            },
          },
        });

        expect(
          configResult.getRuleEntryOptions('sort-tsconfig-keys', 'jsonc/sort-keys')[1],
        ).toMatchObject({
          order: [
            ...TYPE_CHECKING_ORDER,
            'baseUrl',
            'rootDir',
            'rootDirs',
            'customConditions',
            'module',
            'moduleResolution',
            'moduleSuffixes',
            'noResolve',
            'paths',
            'resolveJsonModule',
            'resolvePackageJsonExports',
            'resolvePackageJsonImports',
            'typeRoots',
            'types',
            'allowArbitraryExtensions',
            'allowImportingTsExtensions',
            'allowUmdGlobalAccess',
          ],
        });
      });

      it('returns empty order for unknown groups when `orderWithinGroup` is `alphabetical` for that group', async () => {
        const configResult = await computeEslintConfig({
          ts: {
            configSortTsconfigKeys: {
              orderCompilerOptions: {
                type: 'order-groups',
                order: ['tyPeChecking'],
                orderWithinGroup: {['tyPeChecking' as 'typeChecking']: 'alphabetical'},
              },
            },
          },
        });

        expect(
          configResult.getRuleEntryOptions('sort-tsconfig-keys', 'jsonc/sort-keys')[1],
        ).toMatchObject({order: []});
      });

      it('returns empty order for unknown groups when `orderWithinGroup` is not provided for that group', async () => {
        const configResult = await computeEslintConfig({
          ts: {
            configSortTsconfigKeys: {
              orderCompilerOptions: {
                type: 'order-groups',
                order: ['tyPeChecking'],
              },
            },
          },
        });

        expect(
          configResult.getRuleEntryOptions('sort-tsconfig-keys', 'jsonc/sort-keys')[1],
        ).toMatchObject({order: []});
      });
    });

    describe('option: `extraSortKeysConfigs`', () => {
      it('does not add extra `jsonc/sort-keys` configs by default', async () => {
        const configResult = await computeEslintConfig({ts: {configSortTsconfigKeys: true}});

        expect(
          configResult.getRuleEntryOptions('sort-tsconfig-keys', 'jsonc/sort-keys'),
        ).toHaveLength(2);
      });

      it('appends extra sort-keys configs when provided', async () => {
        const EXTRA = [{pathPattern: '^paths$', order: {type: 'asc'}} as const];

        const configResult = await computeEslintConfig({
          ts: {configSortTsconfigKeys: {extraSortKeysConfigs: EXTRA}},
        });

        const ruleEntryOptions = configResult.getRuleEntryOptions(
          'sort-tsconfig-keys',
          'jsonc/sort-keys',
        );

        expect(ruleEntryOptions).toHaveLength(2 + EXTRA.length);
        expect(ruleEntryOptions.slice(2)).toStrictEqual(EXTRA);
      });
    });
  });
});

import {GLOB_ASTRO, GLOB_SVELTE, GLOB_TS_X, GLOB_VUE} from '../../src/constants';

const FIXTURES = {
  nestedArrayMethods: 'nested-array-methods.js',
} as const;

const FRAMEWORKS = [
  ['astro', GLOB_ASTRO],
  ['svelte', GLOB_SVELTE],
  ['vue', GLOB_VUE],
] as const;

const FUNCTIONAL_OPTIONS = {
  overrides: {
    // Throws without type information
    'functional/immutable-data': 2,
    // Only partially works without type information
    'functional/functional-parameters': 1,
  },
} as const;

beforeEach(() => {
  addInstalledPackages({astro: '5.0.0', svelte: '5.34.3', vue: '3.5.0'});
});

describe('rules requiring type information', () => {
  describe('`ts/typeAware/setup` config is disabled, but `typescript` is installed', () => {
    beforeEach(() => {
      addInstalledPackages({typescript: '5.9.0'});
    });

    it('moves rules requiring type info to a separate config and enables a parser', async () => {
      const configResult = await computeEslintConfig('eslintPlugin', {internalOptions: {}});

      const baseConfig = configResult.getConfigByUnPostfix('eslint-plugin');

      expect(baseConfig?.rules).toBeObject();
      expect(baseConfig?.rules).not.toHaveProperty('eslint-plugin/no-property-in-node');

      const configForTypedRules = configResult.getConfigByUnPostfix(
        'eslint-plugin/@type-information',
      );

      expect(configForTypedRules?.files).toMatchInlineSnapshot('["**/*.?([cm])ts?(x)"]');
      expect(configForTypedRules?.rules).toStrictEqual({
        'eslint-plugin/no-property-in-node': 2,
      });
      expect(configForTypedRules?.languageOptions).toMatchObject({
        parserOptions: {projectService: true},
        parser: {
          meta: {name: 'typescript-eslint/parser'},
          parseForESLint: expect.any(Function) as unknown,
        },
      });
    });

    it('copies rules that only partially work without type information to a separate config, keeping them in the original one', async () => {
      const configResult = await computeEslintConfig(
        {functional: FUNCTIONAL_OPTIONS},
        {internalOptions: {}},
      );

      const baseConfigRules = configResult.getRuleSeverities('functional');

      expect(baseConfigRules).toMatchObject({'functional/functional-parameters': 1});
      expect(baseConfigRules).not.toHaveProperty('functional/immutable-data');

      expect(configResult.getRuleSeverities('functional/@type-information')).toMatchObject({
        'functional/immutable-data': 2,
        'functional/functional-parameters': 1,
      });
    });

    it("intersects `files` with the original config's `files`", async () => {
      const FILES = ['*.ts'];

      const configResult = await computeEslintConfig(
        {awsCdk: {files: FILES}},
        {internalOptions: {}},
      );

      const configForTypedRules = configResult.getConfigByUnPostfix('aws-cdk/@type-information');

      expect(configForTypedRules?.files).toStrictEqual([[FILES[0], GLOB_TS_X]]);
    });

    it('does not create a separate config if the original config does not have rules requiring type information', async () => {
      const configResult = await computeEslintConfig('js', {internalOptions: {}});

      expect(configResult.getConfigByUnPostfix('js')).toBeDefined();
      expect(configResult.getConfigByUnPostfix('js/@type-information')).toBeUndefined();
    });

    it('creates a separate config for a single rule override', async () => {
      const BASE_FILES = ['**/*.ts'];
      const RULE_OVERRIDE_FILES = ['special/**/*.ts'];

      const configResult = await computeEslintConfig(
        {
          awsCdk: {
            files: BASE_FILES,
            overrides: {'awscdk/no-unused-props': {severity: 2, files: RULE_OVERRIDE_FILES}},
          },
        },
        {internalOptions: {}},
      );

      const ruleOverrideConfig = configResult.getConfigByUnPostfix(
        'aws-cdk/@rule/awscdk/no-unused-props',
      );

      expect(ruleOverrideConfig?.files).toStrictEqual([[BASE_FILES[0], RULE_OVERRIDE_FILES[0]]]);
      expect(ruleOverrideConfig?.rules).toStrictEqual({});

      const ruleOverrideConfigForTypedRules = configResult.getConfigByUnPostfix(
        'aws-cdk/@rule/awscdk/no-unused-props/@type-information',
      );

      expect(ruleOverrideConfigForTypedRules?.files).toStrictEqual([
        [BASE_FILES[0], RULE_OVERRIDE_FILES[0], GLOB_TS_X],
      ]);
      expect(ruleOverrideConfigForTypedRules?.rules).toStrictEqual({'awscdk/no-unused-props': 2});
    });

    it('moves "typed" rules from `overrides` to a separate config', async () => {
      const configResult = await computeEslintConfig(
        {ember: {overrides: {'ember/template-no-deprecated': 1}}},
        {internalOptions: {}},
      );

      expect(configResult.getConfigByUnPostfix('ember/@type-information')?.rules).toStrictEqual({
        'ember/template-no-positive-tabindex': 2,
        'ember/template-no-deprecated': 1,
      });
    });

    it('moves "typed" rules from `overridesAny` to a separate config', async () => {
      const configResult = await computeEslintConfig(
        {js: {overridesAny: {'ember/template-no-deprecated': 1}}},
        {internalOptions: {}},
      );

      expect(configResult.getConfigByUnPostfix('js/@type-information')?.rules).toStrictEqual({
        'ember/template-no-deprecated': 1,
      });
    });

    it('does not create a separate config if all rules requiring type information were disabled', async () => {
      const configResult = await computeEslintConfig(
        {
          ember: {
            overrides: {
              'ember/template-no-deprecated': 0,
              'ember/template-no-positive-tabindex': 0,
            },
          },
        },
        {internalOptions: {}},
      );

      expect(configResult.getConfigByUnPostfix('ember/@type-information')).toBeUndefined();
    });

    it('does not create a separate config for `ts/type-aware/rules` config', async () => {
      const configResult = await computeEslintConfig('ts', {internalOptions: {}});

      expect(configResult.getConfigByUnPostfix('ts/type-aware/rules')).toBeDefined();
      expect(
        configResult.getConfigByUnPostfix('ts/type-aware/rules/@type-information'),
      ).toBeUndefined();
    });

    it('creates a separate config for `ts/non-type-aware/rules` config with `overrides` including "typed" rules', async () => {
      const configResult = await computeEslintConfig(
        {ts: {overridesAny: {'ts/no-floating-promises': 2}}},
        {internalOptions: {}},
      );

      expect(configResult.getConfigByUnPostfix('ts/non-type-aware/rules')).toBeDefined();
      expect(
        configResult.getConfigByUnPostfix('ts/non-type-aware/rules/@type-information'),
      ).toMatchObject({
        rules: {'ts/no-floating-promises': 2},
      });
    });

    it('does not create a separate config for `vitest/ts` config', async () => {
      const configResult = await computeEslintConfig(
        {vitest: {configTypescript: true}},
        {internalOptions: {}},
      );

      expect(configResult.getConfigByUnPostfix('vitest/ts')).toBeDefined();
      expect(configResult.getConfigByUnPostfix('vitest/ts/@type-information')).toBeUndefined();
    });

    it('does not create a separate config for `jest/ts` config', async () => {
      const configResult = await computeEslintConfig(
        {jest: {configTypescript: true}},
        {internalOptions: {}},
      );

      expect(configResult.getConfigByUnPostfix('jest/ts')).toBeDefined();
      expect(configResult.getConfigByUnPostfix('jest/ts/@type-information')).toBeUndefined();
    });

    it('does not create a separate config for `jest/ts` rule override', async () => {
      const configResult = await computeEslintConfig(
        {
          jest: {
            configTypescript: {
              overrides: {
                'jest/no-unnecessary-assertion': {severity: 2, files: ['test/foo/*.spec.ts']},
              },
            },
          },
        },
        {internalOptions: {}},
      );

      expect(
        configResult.getConfigByUnPostfix('jest/ts/@rule/jest/no-unnecessary-assertion'),
      ).toBeDefined();
      expect(
        configResult.getConfigByUnPostfix(
          'jest/ts/@rule/jest/no-unnecessary-assertion/@type-information',
        ),
      ).toBeUndefined();
    });

    it('adds .svelte to `extraFileExtensions` in the extra config if there is a "typed" rule coming from `svelte` plugin and intersects original `files` with ts and svelte files', async () => {
      const FILES = ['foo/**/*.svelte'];

      const configResult = await computeEslintConfig(
        {svelte: {files: FILES}},
        {internalOptions: {}},
      );

      expect(configResult.getConfigByUnPostfix('svelte')).toBeDefined();

      const configForTypedRules = configResult.getConfigByUnPostfix('svelte/@type-information');

      expect(configForTypedRules?.files).toStrictEqual([
        [FILES[0], GLOB_TS_X],
        [FILES[0], GLOB_SVELTE],
      ]);
      expect(configForTypedRules?.languageOptions).toMatchObject({
        parserOptions: {extraFileExtensions: ['.svelte']},
      });
    });

    it('moves `disable-autofix` version of the rule and its base version to a separate config', async () => {
      const configResult = await computeEslintConfig(
        {
          functional: {
            overrides: {'functional/prefer-immutable-types': {severity: 2, disableAutofix: true}},
          },
        },
        {internalOptions: {}},
      );

      expect(configResult.getConfigByUnPostfix('functional')?.rules).not.toHaveProperty(
        'functional/prefer-immutable-types',
      );
      expect(configResult.getConfigByUnPostfix('functional')?.rules).not.toHaveProperty(
        'disable-autofix/functional/prefer-immutable-types',
      );

      expect(
        configResult.getConfigByUnPostfix('functional/@type-information')?.rules,
      ).toMatchObject({
        'functional/prefer-immutable-types': 0,
        'disable-autofix/functional/prefer-immutable-types': 2,
      });
    });
  });

  describe('`typescript` is not installed', () => {
    // Otherwise projects without TypeScript would crash on loading the parser
    it('creates a separate config with "typed" rules, but sets up no parser', async () => {
      const configResult = await computeEslintConfig('eslintPlugin', {internalOptions: {}});

      expect(
        configResult.getConfigByUnPostfix('eslint-plugin/@type-information')?.rules,
      ).toStrictEqual({'eslint-plugin/no-property-in-node': 2});
      expect(
        configResult.config.map(({languageOptions}) => languageOptions?.['parser']),
      ).not.toContainEqual(
        expect.objectContaining({
          meta: expect.objectContaining({name: 'typescript-eslint/parser'}) as unknown,
        }) as unknown,
      );
    });
  });

  describe('`ts/typeAware/setup` config is enabled', () => {
    it('creates a separate config with "typed" rules w/o parser', async () => {
      const configResult = await computeEslintConfig(
        {eslintPlugin: true, ts: true},
        {internalOptions: {}},
      );

      expect(configResult.getConfigByUnPostfix('eslint-plugin')).toBeDefined();

      const configForTypedRules = configResult.getConfigByUnPostfix(
        'eslint-plugin/@type-information',
      );

      expect(configForTypedRules).toBeDefined();
      expect(configForTypedRules?.languageOptions?.['parser']).toBeUndefined();
      expect(configForTypedRules?.languageOptions?.['parserOptions']).toStrictEqual({});
    });

    it('leaves rules that only partially work without type information in the original config', async () => {
      const configResult = await computeEslintConfig(
        {ts: true, functional: FUNCTIONAL_OPTIONS},
        {internalOptions: {}},
      );

      expect(configResult.getRuleSeverities('functional')).toMatchObject({
        'functional/functional-parameters': 1,
      });

      const configForTypedRulesRules = configResult.getRuleSeverities(
        'functional/@type-information',
      );

      expect(configForTypedRulesRules).toMatchObject({'functional/immutable-data': 2});
      expect(configForTypedRulesRules).not.toHaveProperty('functional/functional-parameters');
    });

    it('does not create a separate config if all rules requiring type information only partially work without it', async () => {
      const configResult = await computeEslintConfig(
        {ts: true, unicorn: true},
        {internalOptions: {}},
      );

      expect(
        configResult.getRuleEntrySeverity('unicorn', 'unicorn/no-negated-array-predicate'),
      ).toBe(2);
      expect(configResult.getConfigByUnPostfix('unicorn/@type-information')).toBeUndefined();
    });

    it.each(FRAMEWORKS)(
      'adds `%s` files to a separate config if the `ts` config sets up type information for them',
      async (configName, glob) => {
        const configResult = await computeEslintConfig(
          {ts: true, [configName]: true, functional: FUNCTIONAL_OPTIONS},
          {internalOptions: {}},
        );

        expect(
          configResult.getConfigByUnPostfix('functional/@type-information')?.files,
        ).toStrictEqual([GLOB_TS_X, glob]);
      },
    );

    it.each([
      {configName: 'svelte', configs: {svelte: {configEnforceTypescriptInScriptSection: false}}},
      {
        configName: 'vue',
        configs: {
          vue: {configEnforceTypescriptInScriptSection: {typescriptRules: 'only-non-type-aware'}},
        },
      },
    ] as const)(
      'does not add `$configName` files to a separate config if they are opted out of type-aware rules',
      async ({configs}) => {
        const configResult = await computeEslintConfig(
          {ts: true, ...configs, functional: FUNCTIONAL_OPTIONS},
          {internalOptions: {}},
        );

        expect(
          configResult.getConfigByUnPostfix('functional/@type-information')?.files,
        ).toStrictEqual([GLOB_TS_X]);
      },
    );

    it.each(FRAMEWORKS)(
      'does not add `%s` files to a separate config once their language is turned off',
      async (configName) => {
        const configResult = await computeEslintConfig(
          {ts: true, [configName]: true, functional: FUNCTIONAL_OPTIONS},
          {un: {parsing: {[configName]: false}}, internalOptions: {}},
        );

        expect(
          configResult.getConfigByUnPostfix('functional/@type-information')?.files,
        ).toStrictEqual([GLOB_TS_X]);
      },
    );

    const IGNORES = ['legacy/**'];

    it.each([
      {configName: 'astro', configs: {astro: {ignores: IGNORES}}},
      {
        configName: 'svelte',
        configs: {svelte: {configEnforceTypescriptInScriptSection: {ignores: IGNORES}}},
      },
      {
        configName: 'vue',
        configs: {vue: {configEnforceTypescriptInScriptSection: {ignores: IGNORES}}},
      },
    ] as const)(
      'adds the `$configName` files the `ts` config does not set up type information for to `ignores` of a separate config',
      async ({configs}) => {
        const configResult = await computeEslintConfig(
          {ts: true, ...configs, functional: FUNCTIONAL_OPTIONS},
          {internalOptions: {}},
        );

        expect(
          configResult.getConfigByUnPostfix('functional/@type-information')?.ignores,
        ).toIncludeAllMembers(IGNORES);
      },
    );

    it('runs rules that only partially work without type information on JavaScript files', async () => {
      const results = await testEslintConfig(
        {ts: true, unicorn: true},
        FIXTURES.nestedArrayMethods,
        {
          searchFixturesRelativeToPath: import.meta.dirname,
          internalOptions: {},
        },
      );

      expect(
        findLintMessageFromLintResults(
          results,
          FIXTURES.nestedArrayMethods,
          'unicorn/no-negated-array-predicate',
        )?.message,
      ).toMatchInlineSnapshot(
        '"Prefer `Array#every()` with a negated predicate over negating `Array#some()`."',
      );
    });

    it('runs rules that only partially work without type information in configs limited to JavaScript files', async () => {
      const results = await testEslintConfig(
        {ts: true, cloudfrontFunctions: {files: ['**/*.js']}},
        FIXTURES.nestedArrayMethods,
        {searchFixturesRelativeToPath: import.meta.dirname, internalOptions: {}},
      );

      expect(
        findLintMessageFromLintResults(
          results,
          FIXTURES.nestedArrayMethods,
          'es/no-array-prototype-flat',
        )?.message,
      ).toMatchInlineSnapshot(`"ES2019 'Array.prototype.flat' method is forbidden."`);
    });
  });

  describe('`typeInfoRules` is set to `splitOnly`', () => {
    it('creates a separate config with "typed" rules w/o parser', async () => {
      const configResult = await computeEslintConfig('eslintPlugin', {
        un: {typeInfoRules: 'splitOnly'},
        internalOptions: {},
      });

      expect(configResult.getConfigByUnPostfix('eslint-plugin')).toBeDefined();

      const configForTypedRules = configResult.getConfigByUnPostfix(
        'eslint-plugin/@type-information',
      );

      expect(configForTypedRules).toBeDefined();
      expect(configForTypedRules?.languageOptions?.['parser']).toBeUndefined();
      expect(configForTypedRules?.languageOptions?.['parserOptions']).toStrictEqual({});
    });
  });

  describe('`typeInfoRules` is set to `standalone`', () => {
    it('creates a separate config with "typed" rules and a parser even when `ts/typeAware/setup` is enabled', async () => {
      const configResult = await computeEslintConfig(
        {eslintPlugin: true, ts: true},
        {un: {typeInfoRules: 'standalone'}, internalOptions: {}},
      );

      const configForTypedRules = configResult.getConfigByUnPostfix(
        'eslint-plugin/@type-information',
      );

      expect(configForTypedRules).toBeDefined();
      expect(configForTypedRules?.languageOptions?.['parserOptions']).toMatchObject({
        projectService: true,
      });
    });

    it.each(FRAMEWORKS)(
      'limits a separate config to TypeScript files even if the `ts` config sets up type information for `%s` files',
      async (configName) => {
        const configResult = await computeEslintConfig(
          {ts: true, [configName]: true, functional: FUNCTIONAL_OPTIONS},
          {un: {typeInfoRules: 'standalone'}, internalOptions: {}},
        );

        expect(
          configResult.getConfigByUnPostfix('functional/@type-information')?.files,
        ).toStrictEqual([GLOB_TS_X]);
      },
    );

    it('applies the global `allowDefaultProject` shortcut to the split config', async () => {
      const configResult = await computeEslintConfig('eslintPlugin', {
        un: {typeInfoRules: {mode: 'standalone', allowDefaultProject: ['*.ts']}},
        internalOptions: {},
      });

      expect(
        configResult.getConfigByUnPostfix('eslint-plugin/@type-information')?.languageOptions?.[
          'parserOptions'
        ],
      ).toMatchObject({projectService: {allowDefaultProject: ['*.ts']}});
    });

    it('keeps the default parser options when the global `allowDefaultProject` is empty', async () => {
      const configResult = await computeEslintConfig('eslintPlugin', {
        un: {typeInfoRules: {mode: 'standalone', allowDefaultProject: []}},
        internalOptions: {},
      });

      expect(
        configResult.getConfigByUnPostfix('eslint-plugin/@type-information')?.languageOptions?.[
          'parserOptions'
        ],
      ).toStrictEqual({projectService: true});
    });

    it('applies the global `parserOptions` escape hatch to the split config', async () => {
      const configResult = await computeEslintConfig('eslintPlugin', {
        un: {typeInfoRules: {mode: 'standalone', parserOptions: {tsconfigRootDir: '/global/root'}}},
        internalOptions: {},
      });

      expect(
        configResult.getConfigByUnPostfix('eslint-plugin/@type-information')?.languageOptions?.[
          'parserOptions'
        ],
      ).toMatchObject({tsconfigRootDir: '/global/root', projectService: true});
    });

    it('merges the global `allowDefaultProject` into the global `parserOptions`', async () => {
      const configResult = await computeEslintConfig('eslintPlugin', {
        un: {
          typeInfoRules: {
            mode: 'standalone',
            allowDefaultProject: ['*.ts'],
            parserOptions: {
              tsconfigRootDir: '/global/root',
              projectService: {
                maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 100,
                allowDefaultProject: ['*.js'],
              },
            },
          },
        },
        internalOptions: {},
      });

      expect(
        configResult.getConfigByUnPostfix('eslint-plugin/@type-information')?.languageOptions?.[
          'parserOptions'
        ],
      ).toStrictEqual({
        tsconfigRootDir: '/global/root',
        projectService: {
          maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 100,
          allowDefaultProject: ['*.ts'],
        },
      });
    });

    it('replaces the boolean global `projectService` when merging `allowDefaultProject`', async () => {
      const configResult = await computeEslintConfig('eslintPlugin', {
        un: {
          typeInfoRules: {
            mode: 'standalone',
            allowDefaultProject: ['*.ts'],
            parserOptions: {projectService: true},
          },
        },
        internalOptions: {},
      });

      expect(
        configResult.getConfigByUnPostfix('eslint-plugin/@type-information')?.languageOptions?.[
          'parserOptions'
        ],
      ).toStrictEqual({projectService: {allowDefaultProject: ['*.ts']}});
    });
  });

  describe('`typeInfoRules` is set to `asIs`', () => {
    it('leaves rules requiring type information in the original config and creates no separate config', async () => {
      const configResult = await computeEslintConfig('eslintPlugin', {
        un: {typeInfoRules: 'asIs'},
        internalOptions: {},
      });

      expect(configResult.getConfigByUnPostfix('eslint-plugin')?.rules).toHaveProperty(
        'eslint-plugin/no-property-in-node',
      );
      expect(configResult.getConfigByUnPostfix('eslint-plugin/@type-information')).toBeUndefined();
    });
  });

  describe('`typeInfoRules` is set to `disabled`', () => {
    it('turns off throwing rules in place and creates no separate config', async () => {
      const configResult = await computeEslintConfig('eslintPlugin', {
        un: {typeInfoRules: 'disabled'},
        internalOptions: {},
      });

      expect(configResult.getConfigByUnPostfix('eslint-plugin/@type-information')).toBeUndefined();
      expect(
        configResult.getRuleEntrySeverity('eslint-plugin', 'eslint-plugin/no-property-in-node'),
      ).toBe(0);
    });

    it('only disables throwing rules, leaving "optional" ones enabled', async () => {
      const configResult = await computeEslintConfig(
        {functional: FUNCTIONAL_OPTIONS},
        {un: {typeInfoRules: 'disabled'}, internalOptions: {}},
      );

      expect(configResult.getConfigByUnPostfix('functional/@type-information')).toBeUndefined();
      expect(configResult.getRuleEntrySeverity('functional', 'functional/immutable-data')).toBe(0);
      expect(
        configResult.getRuleEntrySeverity('functional', 'functional/functional-parameters'),
      ).toBe(1);
    });

    it('respects a hand-written requirement overriding what the plugin reports itself', async () => {
      const configResult = await computeEslintConfig('ts', {
        un: {typeInfoRules: 'disabled'},
        internalOptions: {},
      });

      expect(configResult.getRuleEntrySeverity('ts/type-aware/rules', 'ts/naming-convention')).toBe(
        2,
      );
      expect(
        configResult.getRuleEntrySeverity('ts/type-aware/rules', 'ts/no-floating-promises'),
      ).toBe(0);
    });

    it('disables throwing rules even in never-split configs like `vitest/ts`', async () => {
      const configResult = await computeEslintConfig(
        {vitest: {configTypescript: true}},
        {un: {typeInfoRules: 'disabled'}, internalOptions: {}},
      );

      expect(configResult.getRuleEntrySeverity('vitest/ts', 'vitest/unbound-method')).toBe(0);
    });
  });

  describe('`typeInfoRules.ignores`', () => {
    it('appends ignores to generated split configs and to never-split configs', async () => {
      const IGNORES = ['vendor/**'];

      const configResult = await computeEslintConfig(
        {eslintPlugin: true, vitest: {configTypescript: true}},
        {un: {typeInfoRules: {mode: 'standalone', ignores: IGNORES}}, internalOptions: {}},
      );

      expect(
        configResult.getConfigByUnPostfix('eslint-plugin/@type-information')?.ignores,
      ).toStrictEqual(expect.arrayContaining(IGNORES));
      expect(configResult.getConfigByUnPostfix('vitest/ts')?.ignores).toStrictEqual(
        expect.arrayContaining(IGNORES),
      );
    });

    it('appends ignores to the type information entry so excluded files do not request type info', async () => {
      const IGNORES = ['vendor/**'];

      const configResult = await computeEslintConfig('ts', {
        un: {typeInfoRules: {ignores: IGNORES}},
        internalOptions: {},
      });

      expect(configResult.getConfigByUnPostfix('parsing/ts/type-aware')?.ignores).toStrictEqual(
        expect.arrayContaining(IGNORES),
      );
      expect(configResult.getConfigByUnPostfix('parsing/ts')?.ignores).not.toStrictEqual(
        expect.arrayContaining(IGNORES),
      );
      expect(
        configResult.getConfigByUnPostfix('ts/non-type-aware/rules')?.ignores,
      ).not.toStrictEqual(expect.arrayContaining(IGNORES));
    });
  });
});

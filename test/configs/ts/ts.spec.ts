const FIXTURES = {
  explicitAny: 'explicit-any.ts',
} as const;

const MAIN_TS_ESLINT_CONFIGS = ['ts/non-type-aware/rules', 'ts/type-aware/rules'];

beforeEach(() => {
  addInstalledPackages({typescript: '5.0.0'});
});

describe('basic tests', () => {
  it('creates `ts/non-type-aware/rules` eslint config, loads `ts` plugin when set to `true`', async () => {
    const configResult = await computeEslintConfig('ts');

    const configRules = configResult.getConfigByUnPostfix('ts/non-type-aware/rules');

    expect(configRules).toBeDefined();
    expect(configRules?.files).toMatchInlineSnapshot('["**/*.?([cm])ts?(x)"]');
    expect(configRules?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('ts')).toBeDefined();
  });

  it('does not create `ts/non-type-aware/{setup,rules}` eslint configs, does not load `ts` plugin when set to `false`', async () => {
    const configResult = await computeEslintConfig({ts: false});

    expect(configResult.getConfigByUnPostfix('parsing/ts')).toBeUndefined();
    expect(configResult.getConfigByUnPostfix('ts/non-type-aware/rules')).toBeUndefined();

    expect(configResult.getLoadedPlugin('ts')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `ts` eslint configs', async () => {
      await expectConfigState({}, MAIN_TS_ESLINT_CONFIGS, false);
    });

    it('creates `ts` eslint configs if explicitly enabled', async () => {
      await expectConfigState('ts', MAIN_TS_ESLINT_CONFIGS, true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `ts` eslint configs', async () => {
      await expectConfigState({}, MAIN_TS_ESLINT_CONFIGS, true, 'default');
    });

    it('creates `ts` eslint configs and prints a warning if explicitly enabled', async () => {
      await expectConfigState('ts', MAIN_TS_ESLINT_CONFIGS, ['ts', true], 'default');
    });

    it('does not create `ts` eslint configs if explicitly disabled', async () => {
      await expectConfigState({ts: false}, MAIN_TS_ESLINT_CONFIGS, false, 'default');
    });

    describe('`typescript` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `ts` eslint configs', async () => {
        await expectConfigState({}, MAIN_TS_ESLINT_CONFIGS, false, 'default');
      });

      it('creates `ts` eslint configs if explicitly enabled', async () => {
        await expectConfigState('ts', MAIN_TS_ESLINT_CONFIGS, true, 'default');
      });

      it('does not create `ts` eslint configs and prints a warning if explicitly disabled', async () => {
        await expectConfigState({ts: false}, MAIN_TS_ESLINT_CONFIGS, ['ts', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `ts` eslint configs', async () => {
      await expectConfigState({}, MAIN_TS_ESLINT_CONFIGS, true, 'misc-enabled');
    });

    it('creates `ts` eslint configs and prints a warning if explicitly enabled', async () => {
      await expectConfigState({ts: true}, MAIN_TS_ESLINT_CONFIGS, ['ts', true], 'misc-enabled');
    });

    it('does not create `ts` eslint configs if explicitly disabled', async () => {
      await expectConfigState({ts: false}, MAIN_TS_ESLINT_CONFIGS, false, 'misc-enabled');
    });
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig({ts: {configSortTsconfigKeys: true}});

    expect(configResult.getRuleSeverities('ts/non-type-aware/rules')).toMatchObject({
      'ts/ban-ts-comment': 2,
      'ts/no-dynamic-delete': 1,
      'ts/explicit-function-return-type': 0,
    });
  });

  it('`ts/no-explicit-any` rule fires on a file with `any`', async () => {
    const results = await testEslintConfig('ts', FIXTURES.explicitAny, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.explicitAny,
      'ts/no-explicit-any',
    );

    expect(error?.message).toMatchInlineSnapshot('"Unexpected any. Specify a different type."');
  });
});

describe('un options', () => {
  describe('option: `files`', async () => {
    const FILES = ['src/**/*.ts'];

    const configResult = await computeEslintConfig({ts: {files: FILES}});

    it('uses user-provided `files` in both rules configs, without narrowing what gets parsed', () => {
      expect(configResult.getConfigByUnPostfix('ts/non-type-aware/rules')?.files).toStrictEqual(
        FILES,
      );
      expect(configResult.getConfigByUnPostfix('ts/type-aware/rules')?.files).toStrictEqual(FILES);

      for (const configName of ['parsing/ts', 'parsing/ts/type-aware'] as const) {
        expect(configResult.getConfigByUnPostfix(configName)?.files).toIncludeAllMembers([
          '**/*.?([cm])ts?(x)',
        ]);
      }
    });

    it('disables both rules configs when set to empty array, but keeps the files parsed', async () => {
      const configResult = await computeEslintConfig({ts: {files: []}});

      expect(configResult.getConfigByUnPostfix('ts/non-type-aware/rules')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('ts/type-aware/rules')).toBeUndefined();

      for (const configName of ['parsing/ts', 'parsing/ts/type-aware'] as const) {
        const config = configResult.getConfigByUnPostfix(configName);

        expect(config).toBeDefined();
        expect(config?.files).not.toStrictEqual([]);
      }
    });
  });

  describe('option: `ignores`', async () => {
    const IGNORES = ['**/fixtures/*.ts'];

    const configResult = await computeEslintConfig({ts: {ignores: IGNORES}});

    it('uses user-provided `ignores` in `{non-type-aware,type-aware}/rules` eslint configs (but not in `*/setup`) and merges them with the implicit defaults', () => {
      const nonTypeAwareRules = configResult.getConfigByUnPostfix('ts/non-type-aware/rules');

      expect(nonTypeAwareRules?.ignores).toIncludeAllMembers(IGNORES);
      expect(nonTypeAwareRules?.ignores?.length).toBeGreaterThan(IGNORES.length);

      const typeAwareRules = configResult.getConfigByUnPostfix('ts/type-aware/rules');

      expect(typeAwareRules?.ignores).toIncludeAllMembers(IGNORES);
      expect(typeAwareRules?.ignores?.length).toBeGreaterThan(IGNORES.length);
      expect(configResult.getConfigByUnPostfix('parsing/ts')?.ignores).not.toIncludeAnyMembers(
        IGNORES,
      );
      expect(
        configResult.getConfigByUnPostfix('parsing/ts/type-aware')?.ignores,
      ).not.toIncludeAnyMembers(IGNORES);
    });
  });

  it('respects `overrides` and `overridesAny` in `ts/non-type-aware/rules` eslint config', async () => {
    const configResult = await computeEslintConfig({
      ts: {
        overrides: {'ts/no-dynamic-delete': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleSeverities('ts/non-type-aware/rules')).toMatchObject({
      'ts/no-dynamic-delete': 0,
      'no-console': 0,
    });
  });
});

describe('options', () => {
  describe('option: `inheritBaseRuleSeverityAndOptionsForExtensionRules`', () => {
    it('inherits base rule severity and options for extension rules by default', async () => {
      const configResult = await computeEslintConfig({js: {overrides: {'no-shadow': 1}}, ts: true});

      expect(configResult.getRuleEntrySeverity('ts/non-type-aware/rules', 'ts/no-shadow')).toBe(1);
    });

    it('inherits base rule severity and options for extension rules when set to `true`', async () => {
      const configResult = await computeEslintConfig({
        js: {overrides: {'no-shadow': 1}},
        ts: {inheritBaseRuleSeverityAndOptionsForExtensionRules: true},
      });

      expect(configResult.getRuleEntrySeverity('ts/non-type-aware/rules', 'ts/no-shadow')).toBe(1);
    });

    it('does not inherit base rule severity and options for extension rules when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        js: {overrides: {'no-shadow': 1}},
        ts: {inheritBaseRuleSeverityAndOptionsForExtensionRules: false},
      });

      expect(configResult.getRuleEntrySeverity('ts/non-type-aware/rules', 'ts/no-shadow')).toBe(2);
    });

    it('inherits base `ts/max-params` rule options when base rule has object options with `maximum` key', async () => {
      const configResult = await computeEslintConfig({
        js: {overrides: {'max-params': [2, {maximum: 4}]}},
        ts: true,
      });

      expect(
        configResult.getRuleEntry('ts/non-type-aware/rules', 'ts/max-params'),
      ).toMatchInlineSnapshot('[2, {"max": 4}]');
    });

    it('inherits base `ts/max-params` rule options when base rule has object options with `max` key', async () => {
      const configResult = await computeEslintConfig({
        js: {overrides: {'max-params': [2, {max: 5}]}},
        ts: true,
      });

      expect(
        configResult.getRuleEntry('ts/non-type-aware/rules', 'ts/max-params'),
      ).toMatchInlineSnapshot('[2, {"max": 5}]');
    });

    it('inherits base `ts/max-params` rule options when base rule has number options', async () => {
      const configResult = await computeEslintConfig({
        js: {overrides: {'max-params': [2, 3]}},
        ts: true,
      });

      expect(
        configResult.getRuleEntry('ts/non-type-aware/rules', 'ts/max-params'),
      ).toMatchInlineSnapshot('[2, {"max": 3}]');
    });

    it('inherits base `ts/no-empty-function` rule options, transforming `privateConstructors` and `protectedConstructors` in `allow`', async () => {
      const configResult = await computeEslintConfig({
        js: {
          overrides: {
            'no-empty-function': [2, {allow: ['privateConstructors', 'protectedConstructors']}],
          },
        },
        ts: true,
      });

      expect(
        configResult.getRuleEntry('ts/non-type-aware/rules', 'ts/no-empty-function'),
      ).toMatchInlineSnapshot('[2, {"allow": ["private-constructors", "protected-constructors"]}]');
    });

    it('inherits base `ts/no-empty-function` rule options when `allow` has no constructor values', async () => {
      const configResult = await computeEslintConfig({
        js: {overrides: {'no-empty-function': [2, {allow: ['arrowFunctions']}]}},
        ts: true,
      });

      expect(
        configResult.getRuleEntry('ts/non-type-aware/rules', 'ts/no-empty-function'),
      ).toMatchInlineSnapshot('[2, {"allow": ["arrowFunctions"]}]');
    });

    it('inherits base `ts/no-unused-vars` rule options when base rule has string options', async () => {
      const configResult = await computeEslintConfig({
        js: {overrides: {'no-unused-vars': [2, 'all']}},
        ts: true,
      });

      expect(
        configResult.getRuleEntry('ts/non-type-aware/rules', 'ts/no-unused-vars'),
      ).toMatchInlineSnapshot('[2, {"enableAutofixRemoval": {"imports": true}, "vars": "all"}]');
    });

    it('inherits base `ts/dot-notation` options when base `dot-notation` rule has object options', async () => {
      const configResult = await computeEslintConfig({
        js: {overrides: {'dot-notation': [2, {allowKeywords: false}]}},
        ts: true,
      });

      expect(
        configResult.getRuleEntry('ts/type-aware/rules', 'ts/dot-notation'),
      ).toMatchInlineSnapshot(
        '[2, {"allowIndexSignaturePropertyAccess": true, "allowKeywords": false}]',
      );
    });
  });

  describe('option: `typescriptVersion`', () => {
    it('resolves typescript version from the installed package and thus uses `inline-type-imports` fix style for `ts/consistent-type-imports` by default', async () => {
      const configResult = await computeEslintConfig('ts');

      expect(
        configResult.getRuleEntryOptions('ts/non-type-aware/rules', 'ts/consistent-type-imports'),
      ).toMatchObject([{fixStyle: 'inline-type-imports'}]);
    });

    it('uses `inline-type-imports` fix style for `ts/consistent-type-imports` when set to >=4.5', async () => {
      const configResult = await computeEslintConfig({ts: {typescriptVersion: 4.5}});

      expect(
        configResult.getRuleEntryOptions('ts/non-type-aware/rules', 'ts/consistent-type-imports'),
      ).toMatchObject([{fixStyle: 'inline-type-imports'}]);
    });

    it('does not use `inline-type-imports` fix style for `ts/consistent-type-imports` when set to <4.5', async () => {
      const configResult = await computeEslintConfig({ts: {typescriptVersion: 4.4}});

      expect(
        configResult.getRuleEntry('ts/non-type-aware/rules', 'ts/consistent-type-imports'),
      ).toMatchInlineSnapshot('[2, {"disallowTypeAnnotations": false}]');
    });
  });

  describe('option: `allowDefaultProject`', () => {
    it('does not set `allowDefaultProject` in parser options by default', async () => {
      const configResult = await computeEslintConfig('ts');

      expect(
        configResult.getConfigByUnPostfix('parsing/ts/type-aware')?.languageOptions?.[
          'parserOptions'
        ],
      ).toMatchObject({
        projectService: expect.not.objectContaining({
          allowDefaultProject: expect.anything() as unknown,
        }) as unknown,
      });
    });

    it('sets `allowDefaultProject` in parser options when provided', async () => {
      const ALLOW_DEFAULT_PROJECT = ['*.js'];

      const configResult = await computeEslintConfig({
        ts: {allowDefaultProject: ALLOW_DEFAULT_PROJECT},
      });

      expect(
        configResult.getConfigByUnPostfix('parsing/ts/type-aware')?.languageOptions?.[
          'parserOptions'
        ],
      ).toMatchObject({projectService: {allowDefaultProject: ALLOW_DEFAULT_PROJECT}});
    });
  });

  describe('option: `parserOptions`', () => {
    it('uses default parser options by default', async () => {
      const configResult = await computeEslintConfig('ts');

      expect(
        configResult.getConfigByUnPostfix('parsing/ts')?.languageOptions?.['parserOptions'],
      ).toMatchInlineSnapshot('{"sourceType": "module"}');
      expect(
        configResult.getConfigByUnPostfix('parsing/ts/type-aware')?.languageOptions?.[
          'parserOptions'
        ],
      ).toMatchInlineSnapshot('{"projectService": {}}');
    });

    it('merges user-provided parser options (object) with default parser options', async () => {
      const configResult = await computeEslintConfig({
        ts: {parserOptions: {tsconfigRootDir: '/custom/root'}},
      });

      expect(
        configResult.getConfigByUnPostfix('parsing/ts')?.languageOptions?.['parserOptions'],
      ).toMatchInlineSnapshot('{"sourceType": "module", "tsconfigRootDir": "/custom/root"}');
      expect(
        configResult.getConfigByUnPostfix('parsing/ts/type-aware')?.languageOptions?.[
          'parserOptions'
        ],
      ).toMatchInlineSnapshot('{"projectService": {}, "tsconfigRootDir": "/custom/root"}');
    });

    it('deduplicates `extraFileExtensions` merged from several layers', async () => {
      const configResult = await computeEslintConfig({
        ts: {parserOptions: {extraFileExtensions: ['.vue', '.svelte', '.vue']}},
      });

      expect(
        configResult.getConfigByUnPostfix('parsing/ts')?.languageOptions?.['parserOptions'],
      ).toMatchInlineSnapshot(
        '{"extraFileExtensions": [".vue", ".svelte"], "sourceType": "module"}',
      );
    });

    it('gives each layer what its own call returned, letting the type-aware one win the conflicts', async () => {
      const configResult = await computeEslintConfig({
        ts: {
          parserOptions: (isTypeAware) => ({
            tsconfigRootDir: isTypeAware ? '/type-aware-root' : '/non-type-aware-root',
            ...(isTypeAware ? {jsxPragma: 'h'} : {emitDecoratorMetadata: true}),
          }),
        },
      });

      expect(
        configResult.getConfigByUnPostfix('parsing/ts')?.languageOptions?.['parserOptions'],
      ).toMatchInlineSnapshot(
        '{"emitDecoratorMetadata": true, "sourceType": "module", "tsconfigRootDir": "/non-type-aware-root"}',
      );
      // Applied on top of the entry above for the files it covers, so it settles the conflicts
      expect(
        configResult.getConfigByUnPostfix('parsing/ts/type-aware')?.languageOptions?.[
          'parserOptions'
        ],
      ).toMatchInlineSnapshot(
        '{"jsxPragma": "h", "projectService": {}, "tsconfigRootDir": "/type-aware-root"}',
      );
    });

    it('routes `projectService` to the type-aware layer even when the non-type-aware call sets it', async () => {
      const configResult = await computeEslintConfig({
        ts: {parserOptions: (isTypeAware) => (isTypeAware ? {} : {projectService: false})},
      });

      expect(
        configResult.getConfigByUnPostfix('parsing/ts')?.languageOptions?.['parserOptions'],
      ).not.toHaveProperty('projectService');
      expect(
        configResult.getConfigByUnPostfix('parsing/ts/type-aware')?.languageOptions?.[
          'parserOptions'
        ],
      ).toMatchObject({projectService: false});
    });
  });

  describe('option interaction: global `typeInfoRules` parser options', () => {
    it('uses the global `allowDefaultProject` shortcut as the default for the type-aware setup', async () => {
      const configResult = await computeEslintConfig('ts', {
        un: {typeInfoRules: {allowDefaultProject: ['*.js']}},
      });

      expect(
        configResult.getConfigByUnPostfix('parsing/ts/type-aware')?.languageOptions?.[
          'parserOptions'
        ],
      ).toMatchObject({projectService: {allowDefaultProject: ['*.js']}});
    });

    it('uses the global `parserOptions` escape hatch as the default for the type-aware setup', async () => {
      const configResult = await computeEslintConfig('ts', {
        un: {typeInfoRules: {parserOptions: {tsconfigRootDir: '/global/root'}}},
      });

      expect(
        configResult.getConfigByUnPostfix('parsing/ts/type-aware')?.languageOptions?.[
          'parserOptions'
        ],
      ).toMatchObject({tsconfigRootDir: '/global/root'});
    });

    it('lets `ts.parserOptions.projectService` take precedence over the global value, merging objects', async () => {
      const configResult = await computeEslintConfig(
        {ts: {parserOptions: {projectService: {defaultProject: 'tsconfig.json'}}}},
        {un: {typeInfoRules: {allowDefaultProject: ['*.js']}}},
      );

      expect(
        configResult.getConfigByUnPostfix('parsing/ts/type-aware')?.languageOptions?.[
          'parserOptions'
        ],
      ).toMatchObject({
        projectService: {allowDefaultProject: ['*.js'], defaultProject: 'tsconfig.json'},
      });
    });

    it('lets `ts.allowDefaultProject` take precedence over both `ts.parserOptions` and the global value', async () => {
      const configResult = await computeEslintConfig(
        {
          ts: {
            allowDefaultProject: ['*.ts'],
            parserOptions: {projectService: {allowDefaultProject: ['*.jsx']}},
          },
        },
        {un: {typeInfoRules: {allowDefaultProject: ['*.js']}}},
      );

      expect(
        configResult.getConfigByUnPostfix('parsing/ts/type-aware')?.languageOptions?.[
          'parserOptions'
        ],
      ).toMatchObject({projectService: {allowDefaultProject: ['*.ts']}});
    });
  });

  describe('option: `extraFileExtensions`', () => {
    it('does not set `extraFileExtensions` in parser options when set to empty array', async () => {
      const configResult = await computeEslintConfig({ts: {extraFileExtensions: []}});

      expect(
        configResult.getConfigByUnPostfix('parsing/ts')?.languageOptions?.['parserOptions'],
      ).toMatchInlineSnapshot('{"sourceType": "module"}');
    });

    it('sets `extraFileExtensions` in parser options when provided', async () => {
      const configResult = await computeEslintConfig({
        ts: {extraFileExtensions: ['vue', 'svelte']},
      });

      expect(
        configResult.getConfigByUnPostfix('parsing/ts')?.languageOptions?.['parserOptions'],
      ).toMatchInlineSnapshot(
        '{"extraFileExtensions": [".vue", ".svelte"], "sourceType": "module"}',
      );
    });

    it('auto-detects `extraFileExtensions` when `astro` config is enabled', async () => {
      const configResult = await computeEslintConfig({ts: true, astro: true});

      expect(
        (
          configResult.getConfigByUnPostfix('parsing/ts')?.languageOptions?.['parserOptions'] as
            Record<string, unknown> | undefined
        )?.['extraFileExtensions'],
      ).toMatchInlineSnapshot('[".astro"]');
    });

    it('auto-detects `extraFileExtensions` when `vue` config is enabled', async () => {
      const configResult = await computeEslintConfig({ts: true, vue: true});

      expect(
        (
          configResult.getConfigByUnPostfix('parsing/ts')?.languageOptions?.['parserOptions'] as
            Record<string, unknown> | undefined
        )?.['extraFileExtensions'],
      ).toMatchInlineSnapshot('[".vue"]');
    });

    it('auto-detects `extraFileExtensions` when `svelte` config is enabled', async () => {
      const configResult = await computeEslintConfig({ts: true, svelte: true});

      expect(
        (
          configResult.getConfigByUnPostfix('parsing/ts')?.languageOptions?.['parserOptions'] as
            Record<string, unknown> | undefined
        )?.['extraFileExtensions'],
      ).toMatchInlineSnapshot('[".svelte"]');
    });

    // TODO should merge?
    it('explicit `extraFileExtensions` overrides auto-detected extensions from enabled configs', async () => {
      const configResult = await computeEslintConfig({
        ts: {extraFileExtensions: ['mdx']},
        vue: true,
      });

      expect(
        (
          configResult.getConfigByUnPostfix('parsing/ts')?.languageOptions?.['parserOptions'] as
            Record<string, unknown> | undefined
        )?.['extraFileExtensions'],
      ).toMatchInlineSnapshot('[".mdx"]');
    });
  });

  describe('option: `extraVariableTypesToRemove`', () => {
    it('uses default `extraVariableTypesToRemove` for `ts/no-unused-vars` by default', async () => {
      const configResult = await computeEslintConfig({ts: true, js: true});

      expect(
        configResult.getRuleEntryOptions('ts/non-type-aware/rules', 'ts/no-unused-vars'),
      ).toMatchObject([{enableAutofixRemoval: {imports: true}}]);
    });

    it('overrides default `enableAutofixRemoval` when `extraVariableTypesToRemove` is provided', async () => {
      const configResult = await computeEslintConfig({
        ts: {extraVariableTypesToRemove: {imports: false}},
        js: true,
      });

      expect(
        configResult.getRuleEntryOptions('ts/non-type-aware/rules', 'ts/no-unused-vars'),
      ).toMatchObject([{enableAutofixRemoval: {imports: false}}]);
    });
  });
});

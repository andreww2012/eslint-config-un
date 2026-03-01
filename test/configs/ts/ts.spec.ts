describe('basic tests', async () => {
  const configResult = await computeEslintConfig('ts');

  it('loads `ts` plugin if used', () => {
    expect(configResult.getLoadedPlugin('ts')).toBeDefined();
  });

  it('creates `ts/non-type-aware/setup` eslint config', () => {
    const config = configResult.getConfigByUnPostfix('ts/non-type-aware/setup');

    expect(config?.files).toMatchInlineSnapshot(`["**/*.?([cm])ts?(x)"]`);
    expect(config?.ignores).toMatchInlineSnapshot(
      `["**/*.css", "**/*.md", "**/*.mdx", "**/*.htm?(l)", "**/*.toml", "**/*.yaml"]`,
    );
    expect(config?.languageOptions?.['parserOptions']).toMatchInlineSnapshot(
      `{"sourceType": "module"}`,
    );
  });

  it('creates `ts/non-type-aware/rules` eslint config', () => {
    const config = configResult.getConfigByUnPostfix('ts/non-type-aware/rules');

    expect(config?.files).toMatchInlineSnapshot(`["**/*.?([cm])ts?(x)"]`);
    expect(config?.ignores).toMatchInlineSnapshot(
      `["**/*.css", "**/*.md", "**/*.mdx", "**/*.htm?(l)", "**/*.toml", "**/*.yaml"]`,
    );
  });

  it('creates `ts/type-aware/setup` eslint config', () => {
    const config = configResult.getConfigByUnPostfix('ts/type-aware/setup');

    expect(config?.files).toMatchInlineSnapshot(`["**/*.?([cm])ts?(x)"]`);
    expect(config?.ignores).toMatchInlineSnapshot(
      `["**/*.css", "**/*.md", "**/*.mdx", "**/*.htm?(l)", "**/*.toml", "**/*.yaml", "**/*.md?(x)/**/*.*"]`,
    );
    expect(config?.languageOptions?.['parserOptions']).toMatchInlineSnapshot(
      `{"projectService": {}, "sourceType": "module"}`,
    );
  });

  it('creates `ts/type-aware/rules` eslint config', () => {
    const config = configResult.getConfigByUnPostfix('ts/type-aware/rules');

    expect(config?.files).toMatchInlineSnapshot(`["**/*.?([cm])ts?(x)"]`);
    expect(config?.ignores).toMatchInlineSnapshot(
      `["**/*.css", "**/*.md", "**/*.mdx", "**/*.htm?(l)", "**/*.toml", "**/*.yaml", "**/*.md?(x)/**/*.*"]`,
    );
  });
});

describe('un options', () => {
  describe('option: `files`', async () => {
    const FILES = ['src/**/*.ts'];
    const configResult = await computeEslintConfig({
      ts: {files: FILES},
    });

    it('uses user-provided `files` in `{non-type-aware,type-aware}/rules` eslint configs, but not in `*/setup`', () => {
      expect(configResult.getConfigByUnPostfix('ts/non-type-aware/rules')?.files).toStrictEqual(
        FILES,
      );
      expect(configResult.getConfigByUnPostfix('ts/type-aware/rules')?.files).toStrictEqual(FILES);

      expect(
        configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.files,
      ).not.to.include.members(FILES);
      expect(
        configResult.getConfigByUnPostfix('ts/type-aware/setup')?.files,
      ).not.to.include.members(FILES);
    });

    it('disables `{non-type-aware,type-aware}/rules` eslint configs when `files` is empty array, but does not disable `{non-type-aware,type-aware}/setup`', async () => {
      const FILES: string[] = [];
      const configResult = await computeEslintConfig({
        ts: {files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('ts/non-type-aware/rules')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('ts/type-aware/rules')).toBeUndefined();

      const nonTypeAwareSetup = configResult.getConfigByUnPostfix('ts/non-type-aware/setup');
      expect(nonTypeAwareSetup).toBeDefined();
      expect(nonTypeAwareSetup?.files).not.toStrictEqual(FILES);

      const typeAwareSetup = configResult.getConfigByUnPostfix('ts/type-aware/setup');
      expect(typeAwareSetup).toBeDefined();
      expect(typeAwareSetup?.files).not.toStrictEqual(FILES);
    });
  });

  describe('option: `ignores`', async () => {
    const IGNORES = ['**/fixtures/*.ts'];
    const configResult = await computeEslintConfig({
      ts: {ignores: IGNORES},
    });

    it('uses user-provided `ignores` in `{non-type-aware,type-aware}/rules` eslint configs and merges them with the implicit default `ignores`, but not in `*/setup`', () => {
      const nonTypeAwareRules = configResult.getConfigByUnPostfix('ts/non-type-aware/rules');
      expect(nonTypeAwareRules?.ignores).to.include.members(IGNORES);
      expect(nonTypeAwareRules?.ignores?.length).toBeGreaterThan(IGNORES.length);

      const typeAwareRules = configResult.getConfigByUnPostfix('ts/type-aware/rules');
      expect(typeAwareRules?.ignores).to.include.members(IGNORES);
      expect(typeAwareRules?.ignores?.length).toBeGreaterThan(IGNORES.length);

      expect(
        configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.ignores,
      ).not.to.include.members(IGNORES);
      expect(
        configResult.getConfigByUnPostfix('ts/type-aware/setup')?.ignores,
      ).not.to.include.members(IGNORES);
    });
  });

  describe('option: `overrides`', async () => {
    const configResult = await computeEslintConfig({
      ts: {overrides: {'ts/no-dynamic-delete': 0}},
    });

    it('respect `overrides`', () => {
      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('ts/non-type-aware/rules', 'ts/no-dynamic-delete'),
        ),
      ).toEqual(0);
    });
  });

  describe('option: `overridesAny`', () => {
    it('respect `overridesAny`', async () => {
      const configResult = await computeEslintConfig({
        ts: {overridesAny: {'no-console': 0}},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('ts/non-type-aware/rules', 'no-console'),
        ),
      ).toEqual(0);
    });

    it('respects both `overrides` and `overridesAny`', async () => {
      const configResult = await computeEslintConfig({
        ts: {
          overrides: {'ts/no-dynamic-delete': 0},
          overridesAny: {'no-console': 0},
        },
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('ts/non-type-aware/rules', 'ts/no-dynamic-delete'),
        ),
      ).toEqual(0);

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('ts/non-type-aware/rules', 'no-console'),
        ),
      ).toEqual(0);
    });

    it('puts `overridesAny` after `overrides`', async () => {
      const configResult = await computeEslintConfig({
        ts: {
          overrides: {'ts/no-dynamic-delete': 1},
          overridesAny: {'ts/no-dynamic-delete': 2},
        },
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('ts/non-type-aware/rules', 'ts/no-dynamic-delete'),
        ),
      ).toEqual(2);
    });
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `non-type-aware/rules` eslint config, but does not in `type-aware/rules` eslint config', async () => {
      const configResult = await computeEslintConfig({
        ts: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('ts/non-type-aware/rules')),
      ).toStrictEqual([2]);

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('ts/type-aware/rules')),
      ).toStrictEqual([0, 1, 2]);
    });

    it('respects `forceSeverity` set to `warn`', async () => {
      const configResult = await computeEslintConfig({
        ts: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('ts/non-type-aware/rules')),
      ).toStrictEqual([1]);

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('ts/type-aware/rules')),
      ).toStrictEqual([0, 1, 2]);
    });
  });
});

describe('options', () => {
  describe('option: `disableNoUnsafeRules`', () => {
    const NO_UNSAFE_RULES = [
      'ts/no-unsafe-argument',
      'ts/no-unsafe-assignment',
      'ts/no-unsafe-call',
      'ts/no-unsafe-enum-comparison',
      'ts/no-unsafe-member-access',
      'ts/no-unsafe-return',
    ] as const;

    it('does not disable `no-unsafe-*` rules when `disableNoUnsafeRules` is `false` (default)', async () => {
      const configResult = await computeEslintConfig('ts');
      const config = configResult.getConfigByUnPostfix('ts/type-aware/rules');

      for (const rule of NO_UNSAFE_RULES) {
        expect(getRuleSeverityFromEslintRuleEntry(config?.rules?.[rule])).toBe(1);
      }
    });

    it('disables `no-unsafe-*` rules when `disableNoUnsafeRules` is `true`', async () => {
      const configResult = await computeEslintConfig({
        ts: {disableNoUnsafeRules: true},
      });
      const config = configResult.getConfigByUnPostfix('ts/type-aware/rules');

      for (const rule of NO_UNSAFE_RULES) {
        expect(getRuleSeverityFromEslintRuleEntry(config?.rules?.[rule])).toBe(0);
      }
    });
  });

  describe('option: `inheritBaseRuleSeverityAndOptionsForExtensionRules`', () => {
    it('inherits base rule severity and options for extension rules when `true` (default)', async () => {
      const configResult = await computeEslintConfig({
        js: {overrides: {'no-shadow': 1}},
        ts: {inheritBaseRuleSeverityAndOptionsForExtensionRules: true},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('ts/non-type-aware/rules', 'ts/no-shadow'),
        ),
      ).toBe(1);
    });

    it('does not inherit base rule severity and options for extension rules when `false`', async () => {
      const configResult = await computeEslintConfig({
        js: {overrides: {'no-shadow': 1}},
        ts: {inheritBaseRuleSeverityAndOptionsForExtensionRules: false},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('ts/non-type-aware/rules', 'ts/no-shadow'),
        ),
      ).toBe(2);
    });
  });

  describe('option: `typescriptVersion`', () => {
    it('uses `inline-type-imports` fix style for `consistent-type-imports` when typescript version >= 4.5', async () => {
      const configResult = await computeEslintConfig({
        ts: {typescriptVersion: 4.5},
      });
      const rule = configResult.getRuleEntry(
        'ts/non-type-aware/rules',
        'ts/consistent-type-imports',
      );

      expect(rule).toMatchInlineSnapshot(
        `[2, {"disallowTypeAnnotations": false, "fixStyle": "inline-type-imports"}]`,
      );
    });

    it('does not use `inline-type-imports` fix style for `consistent-type-imports` when typescript version < 4.5', async () => {
      const configResult = await computeEslintConfig({
        ts: {typescriptVersion: 4.4},
      });
      const rule = configResult.getRuleEntry(
        'ts/non-type-aware/rules',
        'ts/consistent-type-imports',
      );

      expect(rule).toMatchInlineSnapshot(`[2, {"disallowTypeAnnotations": false}]`);
    });
  });

  describe('option: `allowDefaultProject`', () => {
    it('does not set `allowDefaultProject` in parser options when not provided (default)', async () => {
      const configResult = await computeEslintConfig('ts');
      const config = configResult.getConfigByUnPostfix('ts/type-aware/setup');

      expect(config?.languageOptions?.['parserOptions']).toMatchInlineSnapshot(
        `{"projectService": {}, "sourceType": "module"}`,
      );
    });

    it('sets `allowDefaultProject` in parser options when provided', async () => {
      const configResult = await computeEslintConfig({
        ts: {allowDefaultProject: ['*.js']},
      });
      const config = configResult.getConfigByUnPostfix('ts/type-aware/setup');

      expect(config?.languageOptions?.['parserOptions']).toMatchInlineSnapshot(
        `{"projectService": {"allowDefaultProject": ["*.js"]}, "sourceType": "module"}`,
      );
    });
  });

  describe('option: `parserOptions`', () => {
    it('uses default parser options when `parserOptions` is not provided', async () => {
      const configResult = await computeEslintConfig('ts');

      expect(
        configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.languageOptions?.[
          'parserOptions'
        ],
      ).toMatchInlineSnapshot(`{"sourceType": "module"}`);
      expect(
        configResult.getConfigByUnPostfix('ts/type-aware/setup')?.languageOptions?.[
          'parserOptions'
        ],
      ).toMatchInlineSnapshot(`{"projectService": {}, "sourceType": "module"}`);
    });

    it('merges user-provided parser options (object) with default parser options', async () => {
      const configResult = await computeEslintConfig({
        ts: {parserOptions: {tsconfigRootDir: '/custom/root'}},
      });

      expect(
        configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.languageOptions?.[
          'parserOptions'
        ],
      ).toMatchInlineSnapshot(`{"sourceType": "module", "tsconfigRootDir": "/custom/root"}`);
      expect(
        configResult.getConfigByUnPostfix('ts/type-aware/setup')?.languageOptions?.[
          'parserOptions'
        ],
      ).toMatchInlineSnapshot(
        `{"projectService": {}, "sourceType": "module", "tsconfigRootDir": "/custom/root"}`,
      );
    });

    it('merges user-provided parser options (function) with default parser options, receiving `isForTypeAwareConfig` flag', async () => {
      const configResult = await computeEslintConfig({
        ts: {
          parserOptions: (isTypeAware) => ({
            tsconfigRootDir: isTypeAware ? '/type-aware-root' : '/non-type-aware-root',
          }),
        },
      });

      expect(
        configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.languageOptions?.[
          'parserOptions'
        ],
      ).toMatchInlineSnapshot(
        `{"sourceType": "module", "tsconfigRootDir": "/non-type-aware-root"}`,
      );
      expect(
        configResult.getConfigByUnPostfix('ts/type-aware/setup')?.languageOptions?.[
          'parserOptions'
        ],
      ).toMatchInlineSnapshot(
        `{"projectService": {}, "sourceType": "module", "tsconfigRootDir": "/type-aware-root"}`,
      );
    });
  });

  describe('option: `extraFileExtensions`', () => {
    it('does not set `extraFileExtensions` in parser options when array is empty', async () => {
      const configResult = await computeEslintConfig({
        ts: {extraFileExtensions: []},
      });
      const nonTypeAwareParserOptions =
        configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.languageOptions?.[
          'parserOptions'
        ];
      const typeAwareParserOptions =
        configResult.getConfigByUnPostfix('ts/type-aware/setup')?.languageOptions?.[
          'parserOptions'
        ];

      expect(nonTypeAwareParserOptions).toMatchInlineSnapshot(`{"sourceType": "module"}`);
      expect(typeAwareParserOptions).toMatchInlineSnapshot(
        `{"projectService": {}, "sourceType": "module"}`,
      );
    });

    it('sets `extraFileExtensions` in parser options when provided', async () => {
      const configResult = await computeEslintConfig({
        ts: {extraFileExtensions: ['vue', 'svelte']},
      });
      const nonTypeAwareParserOptions =
        configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.languageOptions?.[
          'parserOptions'
        ];
      const typeAwareParserOptions =
        configResult.getConfigByUnPostfix('ts/type-aware/setup')?.languageOptions?.[
          'parserOptions'
        ];

      expect(nonTypeAwareParserOptions).toMatchInlineSnapshot(
        `{"extraFileExtensions": [".vue", ".svelte"], "sourceType": "module"}`,
      );
      expect(typeAwareParserOptions).toMatchInlineSnapshot(
        `{"extraFileExtensions": [".vue", ".svelte"], "projectService": {}, "sourceType": "module"}`,
      );
    });

    it('auto-detects `extraFileExtensions` when `astro` config is enabled', async () => {
      const configResult = await computeEslintConfig({
        ts: true,
        astro: true,
      });
      const parserOptions = configResult.getConfigByUnPostfix('ts/non-type-aware/setup')
        ?.languageOptions?.['parserOptions'] as Record<string, unknown> | undefined;

      expect(parserOptions?.['extraFileExtensions']).toMatchInlineSnapshot(`[".astro"]`);
    });

    it('auto-detects `extraFileExtensions` when `vue` config is enabled', async () => {
      const configResult = await computeEslintConfig({
        ts: true,
        vue: true,
      });
      const parserOptions = configResult.getConfigByUnPostfix('ts/non-type-aware/setup')
        ?.languageOptions?.['parserOptions'] as Record<string, unknown> | undefined;

      expect(parserOptions?.['extraFileExtensions']).toMatchInlineSnapshot(`[".vue"]`);
    });

    it('auto-detects `extraFileExtensions` when `svelte` config is enabled', async () => {
      const configResult = await computeEslintConfig({
        ts: true,
        svelte: true,
      });
      const parserOptions = configResult.getConfigByUnPostfix('ts/non-type-aware/setup')
        ?.languageOptions?.['parserOptions'] as Record<string, unknown> | undefined;

      expect(parserOptions?.['extraFileExtensions']).toMatchInlineSnapshot(`[".svelte"]`);
    });

    it('explicit `extraFileExtensions` overrides auto-detected extensions from enabled configs', async () => {
      const configResult = await computeEslintConfig({
        ts: {extraFileExtensions: ['mdx']},
        vue: true,
      });
      const parserOptions = configResult.getConfigByUnPostfix('ts/non-type-aware/setup')
        ?.languageOptions?.['parserOptions'] as Record<string, unknown> | undefined;

      expect(parserOptions?.['extraFileExtensions']).toMatchInlineSnapshot(`[".mdx"]`);
    });
  });

  describe('option: `extraVariableTypesToRemove`', () => {
    it('uses default `extraVariableTypesToRemove` (`{imports: true}`) when not provided', async () => {
      const configResult = await computeEslintConfig({ts: true, js: true});
      const rule = configResult.getRuleEntry('ts/non-type-aware/rules', 'ts/no-unused-vars');
      const options = (Array.isArray(rule) ? rule[1] : undefined) as
        | Record<string, unknown>
        | undefined;

      expect(options?.['enableAutofixRemoval']).toMatchInlineSnapshot(`{"imports": true}`);
    });

    it('overrides default `enableAutofixRemoval` when `extraVariableTypesToRemove` is provided', async () => {
      const configResult = await computeEslintConfig({
        ts: {extraVariableTypesToRemove: {imports: false}},
        js: true,
      });
      const rule = configResult.getRuleEntry('ts/non-type-aware/rules', 'ts/no-unused-vars');
      const options = (Array.isArray(rule) ? rule[1] : undefined) as
        | Record<string, unknown>
        | undefined;

      expect(options?.['enableAutofixRemoval']).toMatchInlineSnapshot(`{"imports": false}`);
    });
  });
});

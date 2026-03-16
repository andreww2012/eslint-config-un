beforeEach(() => {
  addInstalledPackages({zod: '4.3.5'});
});

const FIXTURES = {
  zodSchemaWithoutSpecificSuffix: 'zod-schema-without-specific-suffix.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('zod');

  it('loads `zod` plugin if used', () => {
    expect(configResult.getLoadedPlugin('zod')).toBeDefined();
  });

  it('creates `zod` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('zod')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `zod` eslint config', async () => {
      await expectConfigState({}, 'zod', false);
    });

    it('creates `zod` eslint config if explicitly enabled', async () => {
      await expectConfigState('zod', 'zod', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `zod` eslint config', async () => {
      await expectConfigState({}, 'zod', true, 'default');
    });

    it('does not create `zod` eslint config if explicitly disabled', async () => {
      await expectConfigState({zod: false}, 'zod', false, 'default');
    });

    it('creates `zod` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('zod', 'zod', ['zod', true], 'default');
    });

    it('does not create `zod` eslint config when `zod` is not installed', async () => {
      setInstalledPackages({});

      await expectConfigState({}, 'zod', false, 'default');
    });

    it('creates `zod` eslint config when `zod` v3 is installed', async () => {
      setInstalledPackages({zod: '3.23.8'});

      await expectConfigState({}, 'zod', true, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `zod` eslint config', async () => {
      await expectConfigState({}, 'zod', true, 'misc-enabled');
    });

    it('creates `zod` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('zod', 'zod', ['zod', true], 'misc-enabled');
    });

    it('does not create `zod` eslint config if explicitly disabled', async () => {
      await expectConfigState({zod: false}, 'zod', false, 'misc-enabled');
    });
  });

  it('has no explicit `files` restriction in `zod` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('zod')?.files).toBeUndefined();
  });

  it('has default `ignores` in `zod` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('zod')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('zod');

  it('enables `zod/no-throw-in-refine` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('zod', 'zod/no-throw-in-refine')).toBe(2);
  });

  it('disables `zod/consistent-import-source` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('zod', 'zod/consistent-import-source')).toBe(0);
  });

  it('enables v4-only rules when zod v4 is installed', () => {
    expect(configResult.getRuleEntrySeverity('zod', 'zod/no-number-schema-with-int')).toBe(2);
    expect(configResult.getRuleEntrySeverity('zod', 'zod/prefer-meta')).toBe(2);
  });

  it('disables v4-only rules when zod v3 is installed', async () => {
    addInstalledPackages({zod: '3.23.8'});

    const configResult = await computeEslintConfig('zod');

    expect(configResult.getRuleEntrySeverity('zod', 'zod/no-number-schema-with-int')).toBe(0);
    expect(configResult.getRuleEntrySeverity('zod', 'zod/prefer-meta')).toBe(0);
  });

  it('enables v4-only rules when zod is not installed (defaults to v4 behavior)', async () => {
    setInstalledPackages({});

    const configResult = await computeEslintConfig('zod');

    expect(configResult.getRuleEntrySeverity('zod', 'zod/no-number-schema-with-int')).toBe(2);
    expect(configResult.getRuleEntrySeverity('zod', 'zod/prefer-meta')).toBe(2);
  });

  it('`zod/require-schema-suffix` rule fires when schema variable lacks configured suffix', async () => {
    const results = await testEslintConfig(
      'zod',
      FIXTURES.zodSchemaWithoutSpecificSuffix,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.zodSchemaWithoutSpecificSuffix,
      'zod/require-schema-suffix',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Use the "Zod" suffix for Zod schemas. Rename this to "userZod""',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `zod` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({zod: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('zod')?.files).toStrictEqual(FILES);
    });

    it('disables `zod` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({zod: {files: []}});

      expect(configResult.getConfigByUnPostfix('zod')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `zod` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({zod: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('zod')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `zod` eslint config', async () => {
    const configResult = await computeEslintConfig({
      zod: {
        overrides: {'zod/no-throw-in-refine': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('zod', 'zod/no-throw-in-refine')).toBe(0);
    expect(configResult.getRuleEntrySeverity('zod', 'no-console')).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `zod` eslint config', async () => {
      const configResult = await computeEslintConfig({
        zod: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('zod'), (ruleName) =>
          ruleName.startsWith('zod/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `zod` eslint config', async () => {
      const configResult = await computeEslintConfig({
        zod: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('zod'), (ruleName) =>
          ruleName.startsWith('zod/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('options', () => {
  describe('option: `arrayStyle`', () => {
    it("uses `'method'` style by default", async () => {
      const configResult = await computeEslintConfig('zod');

      expect(configResult.getRuleEntry('zod', 'zod/array-style')).toMatchInlineSnapshot(
        '[2, {"style": "method"}]',
      );
    });

    it("uses `'function'` style when set to `'function'`", async () => {
      const configResult = await computeEslintConfig({
        zod: {arrayStyle: 'function'},
      });

      expect(configResult.getRuleEntry('zod', 'zod/array-style')).toMatchInlineSnapshot(
        '[2, {"style": "function"}]',
      );
    });

    it('disables `array-style` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        zod: {arrayStyle: false},
      });

      expect(configResult.getRuleEntrySeverity('zod', 'zod/array-style')).toBe(0);
    });
  });

  describe('option: `enforceNamespaceImport`', () => {
    it('enables `prefer-namespace-import` rule by default', async () => {
      const configResult = await computeEslintConfig('zod');

      expect(configResult.getRuleEntrySeverity('zod', 'zod/prefer-namespace-import')).toBe(2);
    });

    it('enables `prefer-namespace-import` when set to `true`', async () => {
      const configResult = await computeEslintConfig({
        zod: {enforceNamespaceImport: true},
      });

      expect(configResult.getRuleEntrySeverity('zod', 'zod/prefer-namespace-import')).toBe(2);
    });

    it('disables `prefer-namespace-import` when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        zod: {enforceNamespaceImport: false},
      });

      expect(configResult.getRuleEntrySeverity('zod', 'zod/prefer-namespace-import')).toBe(0);
    });
  });

  describe('option: `schemaSuffix`', () => {
    it("enforces suffix `'Zod'` by default", async () => {
      const configResult = await computeEslintConfig('zod');

      expect(configResult.getRuleEntry('zod', 'zod/require-schema-suffix')).toMatchInlineSnapshot(
        '[2, {"suffix": "Zod"}]',
      );
    });

    it('enforces custom suffix when provided', async () => {
      const configResult = await computeEslintConfig({
        zod: {schemaSuffix: 'Schema'},
      });

      expect(configResult.getRuleEntry('zod', 'zod/require-schema-suffix')).toMatchInlineSnapshot(
        '[2, {"suffix": "Schema"}]',
      );
    });

    it('disables `require-schema-suffix` when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        zod: {schemaSuffix: false},
      });

      expect(configResult.getRuleEntrySeverity('zod', 'zod/require-schema-suffix')).toBe(0);
    });
  });

  describe('option: `allowedObjectSchemaTypes`', () => {
    it('disables `consistent-object-schema-type` when all types are allowed (default)', async () => {
      const configResult = await computeEslintConfig('zod');

      expect(configResult.getRuleEntrySeverity('zod', 'zod/consistent-object-schema-type')).toBe(0);
    });

    it('enables `consistent-object-schema-type` when only some types are allowed via object', async () => {
      const configResult = await computeEslintConfig({
        zod: {allowedObjectSchemaTypes: {object: false}},
      });

      expect(
        configResult.getRuleEntry('zod', 'zod/consistent-object-schema-type'),
      ).toMatchInlineSnapshot('[2, {"allow": ["looseObject", "strictObject"]}]');
    });

    it('supports array form with a subset of types', async () => {
      const configResult = await computeEslintConfig({
        zod: {allowedObjectSchemaTypes: ['object']},
      });

      expect(
        configResult.getRuleEntry('zod', 'zod/consistent-object-schema-type'),
      ).toMatchInlineSnapshot('[2, {"allow": ["object"]}]');
    });

    it('disables `consistent-object-schema-type` when all types are listed as array', async () => {
      const configResult = await computeEslintConfig({
        zod: {allowedObjectSchemaTypes: ['object', 'looseObject', 'strictObject']},
      });

      expect(configResult.getRuleEntrySeverity('zod', 'zod/consistent-object-schema-type')).toBe(0);
    });
  });
});

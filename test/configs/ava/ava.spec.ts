const FIXTURES = {
  noSkipTest: 'no-skip-test/test.spec.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('ava');

  it('loads `ava` plugin if used', () => {
    expect(configResult.getLoadedPlugin('ava')).toBeDefined();
  });

  it('creates `ava` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('ava')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `ava` eslint config', async () => {
      const configResult = await computeEslintConfig({});

      expect(configResult.getConfigByUnPostfix('ava')).toBeUndefined();
    });

    it('creates `ava` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig('ava');

      expect(configResult.getConfigByUnPostfix('ava')).toBeDefined();
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `ava` eslint config when `ava` package is not installed', async () => {
      const configResult = await computeEslintConfig({}, {reset: true});

      expect(configResult.getConfigByUnPostfix('ava')).toBeUndefined();
    });

    it('creates `ava` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig('ava', {reset: true});

      expect(configResult.getConfigByUnPostfix('ava')).toBeDefined();
    });

    it('creates `ava` eslint config when `ava` package is installed', async () => {
      addInstalledPackages({ava: '6.2.0'});

      const configResult = await computeEslintConfig({}, {reset: true});

      expect(configResult.getConfigByUnPostfix('ava')).toBeDefined();
    });

    it('creates `ava` eslint config and prints a warning if explicitly enabled when `ava` package is installed', async () => {
      addInstalledPackages({ava: '6.2.0'});

      using stderrSpy = vi.spyOn(process.stderr, 'write');

      const configResult = await computeEslintConfig('ava', {reset: true});

      expect(configResult.getConfigByUnPostfix('ava')).toBeDefined();

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          '[warn] [eslint-config-un] There is no need to enable `ava` config because this is the default',
        ),
      ).toBe(true);
    });

    it('does not create `ava` eslint config if explicitly disabled when `ava` package is installed', async () => {
      addInstalledPackages({ava: '6.2.0'});

      const configResult = await computeEslintConfig({ava: false}, {reset: true});

      expect(configResult.getConfigByUnPostfix('ava')).toBeUndefined();
    });

    it('does not create `ava` eslint config if explicitly disabled when `ava` package is not installed', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      const configResult = await computeEslintConfig({ava: false}, {reset: true});

      expect(configResult.getConfigByUnPostfix('ava')).toBeUndefined();

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          '[warn] [eslint-config-un] There is no need to disable `ava` config because this is the default',
        ),
      ).toBe(true);
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `ava` eslint config (not in misc group)', async () => {
      const configResult = await computeEslintConfig(
        {},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(configResult.getConfigByUnPostfix('ava')).toBeUndefined();
    });

    it('creates `ava` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig(
        {ava: true},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(configResult.getConfigByUnPostfix('ava')).toBeDefined();
    });
  });

  it('has default `files` in `ava` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('ava')?.files).toMatchInlineSnapshot(
      '["**/*.spec.?([cm])[jt]s?(x)", "**/*-spec.?([cm])[jt]s?(x)", "**/*_spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__tests__/**/*.?([cm])[jt]s?(x)", "**/__test__/**/*.?([cm])[jt]s?(x)"]',
    );
  });

  it('has default `ignores` in `ava` eslint config', () => {
    const ignores = configResult.getConfigByUnPostfix('ava')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('ava');

  it('enables `ava/hooks-order` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('ava', 'ava/hooks-order')).toBe(2);
  });

  it('disables `ava/prefer-power-assert` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('ava', 'ava/prefer-power-assert')).toBe(0);
  });

  it('`ava/no-skip-test` rule fires on a skipped test', async () => {
    const results = await testEslintConfig('ava', FIXTURES.noSkipTest, import.meta.dirname);

    const error = findLintMessageFromLintResults(results, FIXTURES.noSkipTest, 'ava/no-skip-test');

    expect(error?.message).toMatchInlineSnapshot('"No tests should be skipped."');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `ava` eslint config', async () => {
      const FILES = ['tests/**/*.spec.ts'];
      const configResult = await computeEslintConfig({ava: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('ava')?.files).toStrictEqual(FILES);
    });

    it('disables `ava` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({ava: {files: []}});

      expect(configResult.getConfigByUnPostfix('ava')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `ava` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({ava: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('ava')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `ava` eslint config', async () => {
    const configResult = await computeEslintConfig({
      ava: {overrides: {'ava/hooks-order': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntry('ava', 'ava/hooks-order')).toBe(0);
    expect(configResult.getRuleEntry('ava', 'no-console')).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `ava` eslint config', async () => {
      const configResult = await computeEslintConfig({ava: {forceSeverity: 'error'}});

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('ava'), (ruleName) =>
          ruleName.startsWith('ava/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `ava` eslint config', async () => {
      const configResult = await computeEslintConfig({ava: {forceSeverity: 'warn'}});

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('ava'), (ruleName) =>
          ruleName.startsWith('ava/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('options', () => {
  describe('option: `enforceAssertionMessage`', () => {
    it('does not enforce assertion message when option is not provided (default)', async () => {
      const configResult = await computeEslintConfig('ava');

      expect(configResult.getRuleEntry('ava', 'ava/assertion-arguments')).toMatchInlineSnapshot(
        '[2]',
      );
    });

    it('enforces assertion message when set to `true`', async () => {
      const configResult = await computeEslintConfig({
        ava: {enforceAssertionMessage: true},
      });

      expect(configResult.getRuleEntry('ava', 'ava/assertion-arguments')).toMatchInlineSnapshot(
        '[2, {"message": "always"}]',
      );
    });

    it('disallows assertion message when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        ava: {enforceAssertionMessage: false},
      });

      expect(configResult.getRuleEntry('ava', 'ava/assertion-arguments')).toMatchInlineSnapshot(
        '[2, {"message": "never"}]',
      );
    });
  });

  describe('option: `enforceMaxAssertions`', () => {
    it('disables `max-asserts` rule when option is not provided (default)', async () => {
      const configResult = await computeEslintConfig('ava');

      expect(configResult.getRuleEntrySeverity('ava', 'ava/max-asserts')).toBe(0);
    });

    it('enables `max-asserts` rule with the provided limit', async () => {
      const MAX_ASSERTIONS = 5;

      const configResult = await computeEslintConfig({
        ava: {enforceMaxAssertions: MAX_ASSERTIONS},
      });

      expect(configResult.getRuleEntryOptions('ava', 'ava/max-asserts')).toStrictEqual([
        {max: MAX_ASSERTIONS},
      ]);
    });
  });
});

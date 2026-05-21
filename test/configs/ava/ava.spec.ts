const FIXTURES = {
  noSkipTest: 'no-skip-test/test.spec.js',
} as const;

beforeEach(() => {
  addInstalledPackages({ava: '6.2.0'});
});

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
      await expectConfigState({}, 'ava', false);
    });

    it('creates `ava` eslint config if explicitly enabled', async () => {
      await expectConfigState('ava', 'ava', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    describe('ava is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `ava` eslint config', async () => {
        await expectConfigState({}, 'ava', false, 'default');
      });

      it('creates `ava` eslint config if explicitly enabled', async () => {
        await expectConfigState('ava', 'ava', true, 'default');
      });

      it('does not create `ava` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({ava: false}, 'ava', ['ava', false], 'default');
      });
    });

    describe('ava is installed', () => {
      beforeEach(() => {
        addInstalledPackages({ava: '6.2.0'});
      });

      it('creates `ava` eslint config by default', async () => {
        await expectConfigState({}, 'ava', true, 'default');
      });

      it('creates `ava` eslint config and prints a warning if explicitly enabled', async () => {
        await expectConfigState('ava', 'ava', ['ava', true], 'default');
      });

      it('does not create `ava` eslint config if explicitly disabled', async () => {
        await expectConfigState({ava: false}, 'ava', false, 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `ava` eslint config', async () => {
      await expectConfigState({}, 'ava', true, 'misc-enabled');
    });

    it('creates `ava` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('ava', 'ava', ['ava', true], 'misc-enabled');
    });

    it('does not create `ava` eslint config if explicitly disabled', async () => {
      await expectConfigState({ava: false}, 'ava', false, 'misc-enabled');
    });

    describe('ava is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `ava` eslint config (not in misc group)', async () => {
        await expectConfigState({}, 'ava', false, 'misc-enabled');
      });

      it('creates `ava` eslint config if explicitly enabled', async () => {
        await expectConfigState({ava: true}, 'ava', true, 'misc-enabled');
      });
    });
  });

  it('has default `files` in `ava` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('ava')?.files).toMatchInlineSnapshot(
      '["**/*.spec.?([cm])[jt]s?(x)", "**/*-spec.?([cm])[jt]s?(x)", "**/*_spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__tests__/**/*.?([cm])[jt]s?(x)", "**/__test__/**/*.?([cm])[jt]s?(x)"]',
    );
  });

  it('has default `ignores` in `ava` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('ava')?.ignores?.length).toBeGreaterThan(0);
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

    it('disables `ava` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({ava: {files: []}});

      expect(configResult.getConfigByUnPostfix('ava')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `ava` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({ava: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('ava')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
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
});

describe('options', () => {
  describe('option: `enforceAssertionMessage`', () => {
    it('does not enforce assertion message by default', async () => {
      const configResult = await computeEslintConfig('ava');

      expect(configResult.getRuleEntry('ava', 'ava/assertion-arguments')).toMatchInlineSnapshot(
        '2',
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
    it('disables `ava/max-asserts` rule by default', async () => {
      const configResult = await computeEslintConfig('ava');

      expect(configResult.getRuleEntrySeverity('ava', 'ava/max-asserts')).toBe(0);
    });

    it('enables `ava/max-asserts` rule with the provided limit', async () => {
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

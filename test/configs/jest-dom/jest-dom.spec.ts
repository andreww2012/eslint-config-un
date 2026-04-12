const FIXTURES = {
  preferChecked: 'prefer-checked/test.spec.js',
} as const;

beforeEach(() => {
  addInstalledPackages({'@testing-library/jest-dom': '6.9.1'});
});

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('jestDom');

  it('loads `jest-dom` plugin if used', () => {
    expect(configResult.getLoadedPlugin('jest-dom')).toBeDefined();
  });

  it('creates `jest-dom` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('jest-dom')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `jest-dom` eslint config', async () => {
      await expectConfigState({}, 'jest-dom', false);
    });

    it('creates `jest-dom` eslint config if explicitly enabled', async () => {
      await expectConfigState('jestDom', 'jest-dom', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `jest-dom` eslint config when `@testing-library/jest-dom` package is installed', async () => {
      await expectConfigState({}, 'jest-dom', true, 'default');
    });

    it('creates `jest-dom` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('jestDom', 'jest-dom', ['jestDom', true], 'default');
    });

    it('does not create `jest-dom` eslint config if explicitly disabled', async () => {
      await expectConfigState({jestDom: false}, 'jest-dom', false, 'default');
    });

    describe('`@testing-library/jest-dom` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `jest-dom` eslint config', async () => {
        await expectConfigState({}, 'jest-dom', false, 'default');
      });

      it('creates `jest-dom` eslint config if explicitly enabled', async () => {
        await expectConfigState('jestDom', 'jest-dom', true, 'default');
      });

      it('does not create `jest-dom` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({jestDom: false}, 'jest-dom', ['jestDom', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `jest-dom` eslint config when `@testing-library/jest-dom` package is installed (not in misc group)', async () => {
      await expectConfigState({}, 'jest-dom', true, 'misc-enabled');
    });

    it('creates `jest-dom` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('jestDom', 'jest-dom', ['jestDom', true], 'misc-enabled');
    });

    it('does not create `jest-dom` eslint config if explicitly disabled', async () => {
      await expectConfigState({jestDom: false}, 'jest-dom', false, 'misc-enabled');
    });
  });

  it('has default `files` in `jest-dom` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('jest-dom')?.files).toMatchInlineSnapshot(
      '["**/*.spec.?([cm])[jt]s?(x)", "**/*-spec.?([cm])[jt]s?(x)", "**/*_spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__tests__/**/*.?([cm])[jt]s?(x)", "**/__test__/**/*.?([cm])[jt]s?(x)"]',
    );
  });

  it('has default `ignores` in `jest-dom` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('jest-dom')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('jestDom');

  it('enables `jest-dom/prefer-checked` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('jest-dom', 'jest-dom/prefer-checked')).toBe(2);
  });

  it('disables `no-empty-function` rule in `jest-dom` eslint config', () => {
    expect(configResult.getRuleEntrySeverity('jest-dom', 'no-empty-function')).toBe(0);
  });

  it('`jest-dom/prefer-checked` rule fires when using `toHaveAttribute` for checked state', async () => {
    const results = await testEslintConfig('jestDom', FIXTURES.preferChecked, {
      searchFixturesRelativeToPath: import.meta.dirname,
    });

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.preferChecked,
      'jest-dom/prefer-checked',
    );

    expect(error?.message).toMatchInlineSnapshot(
      `"Use toBeChecked() instead of toHaveAttribute('checked')"`,
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `jest-dom` eslint config', async () => {
      const FILES = ['tests/**/*.spec.ts'];

      const configResult = await computeEslintConfig({jestDom: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('jest-dom')?.files).toStrictEqual(FILES);
    });

    it('disables `jest-dom` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({jestDom: {files: []}});

      expect(configResult.getConfigByUnPostfix('jest-dom')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `jest-dom` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({jestDom: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('jest-dom')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `jest-dom` eslint config', async () => {
    const configResult = await computeEslintConfig({
      jestDom: {overrides: {'jest-dom/prefer-checked': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('jest-dom', 'jest-dom/prefer-checked')).toBe(0);
    expect(configResult.getRuleEntrySeverity('jest-dom', 'no-console')).toBe(0);
  });
});

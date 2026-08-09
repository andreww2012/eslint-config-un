const FIXTURES = {
  nonPascalCaseName: 'non-pascal-case.stories.ts',
} as const;

beforeEach(() => {
  addInstalledPackages({storybook: '8.0.0'});
});

describe('basic tests', () => {
  it('creates `storybook` and `storybook/main` eslint configs and loads `storybook` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('storybook');

    const config = configResult.getConfigByUnPostfix('storybook');

    expect(config).toBeDefined();
    expect(configResult.getConfigByUnPostfix('storybook/main')).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot('["**/*.{stories,story}.?([cm])[jt]s?(x)"]');
    expect(config?.ignores?.length).toBeGreaterThan(0);
    expect(configResult.getConfigByUnPostfix('storybook/main')?.files).toMatchInlineSnapshot(
      '[".storybook/main.?([cm])[jt]s"]',
    );
    expect(configResult.getConfigByUnPostfix('storybook/main')?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('storybook')).toBeDefined();
  });

  it('does not create `storybook` and `storybook/main` eslint configs and does not load `storybook` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({storybook: false});

    expect(configResult.getConfigByUnPostfix('storybook')).toBeUndefined();
    expect(configResult.getConfigByUnPostfix('storybook/main')).toBeUndefined();
    expect(configResult.getLoadedPlugin('storybook')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `storybook` eslint config', async () => {
      await expectConfigState({}, 'storybook', false);
    });

    it('creates `storybook` eslint config if explicitly enabled', async () => {
      await expectConfigState('storybook', 'storybook', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `storybook` eslint config when `storybook` package is installed', async () => {
      await expectConfigState({}, 'storybook', true, 'default');
    });

    it('creates `storybook` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState('storybook', 'storybook', ['storybook', true], 'default');
    });

    it('does not create `storybook` eslint config if explicitly disabled', async () => {
      await expectConfigState({storybook: false}, 'storybook', false, 'default');
    });

    describe('`storybook` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `storybook` eslint config', async () => {
        await expectConfigState({}, 'storybook', false, 'default');
      });

      it('creates `storybook` eslint config if explicitly enabled', async () => {
        await expectConfigState('storybook', 'storybook', true, 'default');
      });

      it('does not create `storybook` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({storybook: false}, 'storybook', ['storybook', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `storybook` eslint config when `storybook` package is installed', async () => {
      await expectConfigState({}, 'storybook', true, 'misc-enabled');
    });

    it('creates `storybook` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState({storybook: true}, 'storybook', ['storybook', true], 'misc-enabled');
    });

    it('does not create `storybook` eslint config if explicitly disabled', async () => {
      await expectConfigState({storybook: false}, 'storybook', false, 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('storybook');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('storybook')).toMatchObject({
      'storybook/default-exports': 2,
      'storybook/meta-inline-properties': 1,
      'storybook/no-uninstalled-addons': 0,
    });
  });

  it('enables `storybook/no-uninstalled-addons` rule in `storybook/main` eslint config', () => {
    expect(
      configResult.getRuleEntrySeverity('storybook/main', 'storybook/no-uninstalled-addons'),
    ).toBe(2);
  });

  it('`storybook/prefer-pascal-case` rule fires on a story with a non-PascalCase name', async () => {
    const results = await testEslintConfig(
      'storybook',
      FIXTURES.nonPascalCaseName,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.nonPascalCaseName,
      'storybook/prefer-pascal-case',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"The story should use PascalCase notation: myButton"',
    );
  });

  describe('typescript dependent rules', () => {
    it('disables `storybook/meta-satisfies-type` if `typescript` is not installed', () => {
      expect(configResult.getRuleEntrySeverity('storybook', 'storybook/meta-satisfies-type')).toBe(
        0,
      );
    });

    it('disables `storybook/meta-satisfies-type` if `typescript` version is less than 4.9', async () => {
      addInstalledPackages({typescript: '4.8.4'});

      const configResult = await computeEslintConfig('storybook');

      expect(configResult.getRuleEntrySeverity('storybook', 'storybook/meta-satisfies-type')).toBe(
        0,
      );
    });

    it('enables `storybook/meta-satisfies-type` if `typescript` version is at least 4.9', async () => {
      addInstalledPackages({typescript: '4.9.0'});

      const configResult = await computeEslintConfig('storybook');

      expect(
        configResult.getRuleEntrySeverity('storybook', 'storybook/meta-satisfies-type'),
      ).not.toBe(0);
    });
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `storybook` eslint config', async () => {
      const FILES = ['src/**/*.stories.ts'];

      const configResult = await computeEslintConfig({storybook: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('storybook')?.files).toStrictEqual(FILES);
    });

    it('disables `storybook` and `storybook/main` eslint configs when set to empty array', async () => {
      const configResult = await computeEslintConfig({storybook: {files: []}});

      expect(configResult.getConfigByUnPostfix('storybook')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('storybook/main')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `storybook` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({storybook: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('storybook')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `storybook` eslint config', async () => {
    const configResult = await computeEslintConfig({
      storybook: {
        overrides: {'storybook/default-exports': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('storybook', 'storybook/default-exports')).toBe(0);
    expect(configResult.getRuleEntrySeverity('storybook', 'no-console')).toBe(0);
  });
});

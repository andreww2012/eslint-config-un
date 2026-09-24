const FIXTURES = {
  componentWithPlainText: 'component-with-plain-text.jsx',
} as const;

beforeEach(() => {
  addInstalledPackages({i18next: '26.0.0'});
});

describe('basic tests', () => {
  it('creates `i18next` eslint config and loads `i18next` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('i18next');

    const config = configResult.getConfigByUnPostfix('i18next');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('i18next')).toBeDefined();
  });

  it('does not create `i18next` eslint config and does not load `i18next` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({i18next: false});

    expect(configResult.getConfigByUnPostfix('i18next')).toBeUndefined();
    expect(configResult.getLoadedPlugin('i18next')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `i18next` eslint config', async () => {
      await expectConfigState({}, 'i18next', false);
    });

    it('creates `i18next` eslint config if explicitly enabled', async () => {
      await expectConfigState('i18next', 'i18next', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    describe('`i18next` is installed', () => {
      it('creates `i18next` eslint config by default', async () => {
        await expectConfigState({}, 'i18next', true, 'default');
      });

      it('creates `i18next` eslint config and prints a warning if explicitly enabled', async () => {
        await expectConfigState('i18next', 'i18next', ['i18next', true], 'default');
      });

      it('does not create `i18next` eslint config if explicitly disabled', async () => {
        await expectConfigState({i18next: false}, 'i18next', false, 'default');
      });
    });

    it.each(['react-i18next', 'next-i18next', 'remix-i18next', 'i18next-vue'])(
      'creates `i18next` eslint config by default if only `%s` is installed',
      async (packageName) => {
        setInstalledPackages({[packageName]: '1.0.0'});

        await expectConfigState({}, 'i18next', true, 'default');
      },
    );

    describe('neither `i18next` nor any of its bindings is installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `i18next` eslint config', async () => {
        await expectConfigState({}, 'i18next', false, 'default');
      });

      it('creates `i18next` eslint config if explicitly enabled', async () => {
        await expectConfigState('i18next', 'i18next', true, 'default');
      });

      it('does not create `i18next` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({i18next: false}, 'i18next', ['i18next', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `i18next` eslint config when `i18next` is installed', async () => {
      await expectConfigState({}, 'i18next', true, 'misc-enabled');
    });

    it('creates `i18next` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('i18next', 'i18next', ['i18next', true], 'misc-enabled');
    });

    it('does not create `i18next` eslint config if explicitly disabled', async () => {
      await expectConfigState({i18next: false}, 'i18next', false, 'misc-enabled');
    });
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig('i18next');

    expect(configResult.getRuleSeverities('i18next')).toMatchObject({
      'i18next/no-literal-string': 2,
    });
  });

  it('keeps `i18next/no-literal-string` out of the type information eslint config', async () => {
    const configResult = await computeEslintConfig('i18next', {internalOptions: {}});

    expect(configResult.getRuleSeverities('i18next')).toMatchObject({
      'i18next/no-literal-string': 2,
    });
    expect(configResult.getConfigByUnPostfix('i18next/@type-information')).toBeUndefined();
  });

  it('`i18next/no-literal-string` rule fires on plain text in JSX', async () => {
    const results = await testEslintConfig('i18next', FIXTURES.componentWithPlainText, {
      searchFixturesRelativeToPath: import.meta.dirname,
      // No enabled config targets `.jsx` files otherwise
      un: {files: ['**/*.jsx']},
    });

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.componentWithPlainText,
      'i18next/no-literal-string',
    );

    expect(error?.message).toMatchInlineSnapshot('"disallow literal string: <p>Hello world</p>"');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `i18next` eslint config', async () => {
      const FILES = ['src/**/*.tsx'];

      const configResult = await computeEslintConfig({i18next: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('i18next')?.files).toStrictEqual(FILES);
    });

    it('disables `i18next` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({i18next: {files: []}});

      expect(configResult.getConfigByUnPostfix('i18next')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `i18next` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({i18next: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('i18next')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `i18next` eslint config', async () => {
    const configResult = await computeEslintConfig({
      i18next: {
        overrides: {'i18next/no-literal-string': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleSeverities('i18next')).toMatchObject({
      'i18next/no-literal-string': 0,
      'no-console': 0,
    });
  });
});

describe('options', () => {
  describe('option: `options`', () => {
    it('does not pass any options to `i18next/no-literal-string` when option is not set', async () => {
      const configResult = await computeEslintConfig('i18next');

      expect(
        configResult.getRuleEntryOptions('i18next', 'i18next/no-literal-string'),
      ).toStrictEqual([]);
    });

    it('passes the provided options to `i18next/no-literal-string`', async () => {
      const OPTIONS = {mode: 'jsx-only' as const, callees: {exclude: ['logger.*']}};

      const configResult = await computeEslintConfig({i18next: {options: OPTIONS}});

      expect(
        configResult.getRuleEntryOptions('i18next', 'i18next/no-literal-string'),
      ).toStrictEqual([OPTIONS]);
    });
  });
});

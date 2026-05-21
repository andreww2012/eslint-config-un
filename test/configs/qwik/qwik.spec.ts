const FIXTURES = {
  noReactProps: 'no-react-props.tsx',
} as const;

beforeEach(() => {
  addInstalledPackages({'@builder.io/qwik': '1.9.1'});
});

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('qwik');

  it('loads `qwik` plugin if used', () => {
    expect(configResult.getLoadedPlugin('qwik')).toBeDefined();
  });

  it('creates `qwik` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('qwik')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `qwik` eslint config', async () => {
      await expectConfigState({}, 'qwik', false);
    });

    it('creates `qwik` eslint config if explicitly enabled', async () => {
      await expectConfigState('qwik', 'qwik', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `qwik` eslint config', async () => {
      await expectConfigState({}, 'qwik', true, 'default');
    });

    it('does not create `qwik` eslint config if explicitly disabled', async () => {
      await expectConfigState({qwik: false}, 'qwik', false, 'default');
    });

    it('creates `qwik` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('qwik', 'qwik', ['qwik', true], 'default');
    });

    describe('only `@qwik.dev/core` is installed', () => {
      beforeEach(() => {
        setInstalledPackages({'@qwik.dev/core': '1.0.0'});
      });

      it('creates `qwik` eslint config', async () => {
        await expectConfigState({}, 'qwik', true, 'default');
      });
    });

    describe('neither `@builder.io/qwik` nor `@qwik.dev/core` is installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `qwik` eslint config', async () => {
        await expectConfigState({}, 'qwik', false, 'default');
      });

      it('creates `qwik` eslint config if explicitly enabled', async () => {
        await expectConfigState('qwik', 'qwik', true, 'default');
      });

      it('does not create `qwik` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({qwik: false}, 'qwik', ['qwik', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `qwik` eslint config', async () => {
      await expectConfigState({}, 'qwik', true, 'misc-enabled');
    });

    it('creates `qwik` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('qwik', 'qwik', ['qwik', true], 'misc-enabled');
    });

    it('does not create `qwik` eslint config if explicitly disabled', async () => {
      await expectConfigState({qwik: false}, 'qwik', false, 'misc-enabled');
    });
  });

  it('has default `files` in `qwik` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('qwik')?.files).toMatchInlineSnapshot(
      '["**/*.?([cm])[jt]s?(x)"]',
    );
  });

  it('has default `ignores` in `qwik` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('qwik')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('qwik');

  it('enables `qwik/valid-lexical-scope` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('qwik', 'qwik/valid-lexical-scope')).toBe(2);
  });

  it('disables `qwik/jsx-img` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('qwik', 'qwik/jsx-img')).toBe(0);
  });

  it('`qwik/no-react-props` rule fires on JSX with `className` prop', async () => {
    const results = await testEslintConfig(
      // valid-lexical-scope requires TypeScript type information which is not available in lintText
      {qwik: {overrides: {'qwik/valid-lexical-scope': 0}}},
      FIXTURES.noReactProps,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.noReactProps,
      'qwik/no-react-props',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Prefer the `class` prop over the deprecated `className` prop."',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `qwik` eslint config', async () => {
      const FILES = ['src/**/*.tsx'];

      const configResult = await computeEslintConfig({qwik: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('qwik')?.files).toStrictEqual(FILES);
    });

    it('disables `qwik` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({qwik: {files: []}});

      expect(configResult.getConfigByUnPostfix('qwik')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `qwik` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({qwik: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('qwik')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `qwik` eslint config', async () => {
    const configResult = await computeEslintConfig({
      qwik: {overrides: {'qwik/valid-lexical-scope': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('qwik', 'qwik/valid-lexical-scope')).toBe(0);
    expect(configResult.getRuleEntrySeverity('qwik', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `routesDir`', () => {
    it('does not set `routesDir` in `qwik/loader-location` rule options by default', async () => {
      const configResult = await computeEslintConfig('qwik');

      expect(configResult.getRuleEntry('qwik', 'qwik/loader-location')).toMatchInlineSnapshot('2');
    });

    it('sets `routesDir` in `qwik/loader-location` rule options when provided', async () => {
      const ROUTES_DIR = 'src/routes';

      const configResult = await computeEslintConfig({
        qwik: {routesDir: ROUTES_DIR},
      });

      expect(configResult.getRuleEntryOptions('qwik', 'qwik/loader-location')).toStrictEqual([
        {routesDir: ROUTES_DIR},
      ]);
    });
  });
});

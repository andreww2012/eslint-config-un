const FIXTURES = {
  elementTypesViolation: 'pages/Home.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig({boundaries: {settings: {elements: []}}});

  it('loads `boundaries` plugin if used', () => {
    expect(configResult.getLoadedPlugin('boundaries')).toBeDefined();
  });

  it('creates `boundaries` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('boundaries')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `boundaries` eslint config', async () => {
      await expectConfigState({}, 'boundaries', false);
    });

    it('creates `boundaries` eslint config if explicitly enabled', async () => {
      await expectConfigState({boundaries: {settings: {elements: []}}}, 'boundaries', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `boundaries` eslint config', async () => {
      await expectConfigState({}, 'boundaries', false, 'default');
    });

    it('creates `boundaries` eslint config if explicitly enabled', async () => {
      await expectConfigState(
        {boundaries: {settings: {elements: []}}},
        'boundaries',
        true,
        'default',
      );
    });

    it('does not create `boundaries` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({boundaries: false}, 'boundaries', ['boundaries', false], 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `boundaries` eslint config', async () => {
      await expectConfigState({}, 'boundaries', false, 'misc-enabled');
    });

    it('creates `boundaries` eslint config if explicitly enabled', async () => {
      await expectConfigState(
        {boundaries: {settings: {elements: []}}},
        'boundaries',
        true,
        'misc-enabled',
      );
    });

    it('does not create `boundaries` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {boundaries: false},
        'boundaries',
        ['boundaries', false],
        'misc-enabled',
      );
    });
  });

  it('has no explicit `files` restriction in `boundaries` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('boundaries')?.files).toBeUndefined();
  });

  it('has default `ignores` in `boundaries` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('boundaries')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig({boundaries: {settings: {elements: []}}});

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('boundaries')).toMatchObject({
      'boundaries/dependencies': 2,
      'boundaries/no-ignored-dependencies': 0,
    });
  });

  it('`boundaries/dependencies` rule fires on a disallowed cross-element import', async () => {
    const results = await testEslintConfig(
      {
        boundaries: {
          overrides: {
            'boundaries/dependencies': [2, {default: 'disallow', rules: []}],
          },
          settings: {
            elements: [
              {type: 'component', pattern: 'components/*', mode: 'file'},
              {type: 'page', pattern: 'pages/*', mode: 'file'},
            ],
            // eslint-disable-next-line node/no-path-concat -- doesn't matter in tests
            rootPath: `${import.meta.dirname}/fixtures`,
          },
        },
      },
      FIXTURES.elementTypesViolation,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.elementTypesViolation,
      'boundaries/dependencies',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"There is no policy allowing dependencies from elements of type "page" to elements of type "component""',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `boundaries` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({
        boundaries: {files: FILES, settings: {elements: []}},
      });

      expect(configResult.getConfigByUnPostfix('boundaries')?.files).toStrictEqual(FILES);
    });

    it('disables `boundaries` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({
        boundaries: {files: [], settings: {elements: []}},
      });

      expect(configResult.getConfigByUnPostfix('boundaries')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `boundaries` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({
        boundaries: {ignores: IGNORES, settings: {elements: []}},
      });

      const ignores = configResult.getConfigByUnPostfix('boundaries')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `boundaries` eslint config', async () => {
    const configResult = await computeEslintConfig({
      boundaries: {
        overrides: {'boundaries/element-types': 0},
        overridesAny: {'no-console': 0},
        settings: {elements: []},
      },
    });

    expect(configResult.getRuleEntrySeverity('boundaries', 'boundaries/element-types')).toBe(0);
    expect(configResult.getRuleEntrySeverity('boundaries', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set `boundaries` ESLint config settings when no settings are provided, and warns', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write').mockReturnValue(true);

      const configResult = await computeEslintConfig('boundaries');
      const config = configResult.getConfigByUnPostfix('boundaries');

      expect(config?.settings).toBeUndefined();
      expect(String(stderrSpy.mock.calls[0]?.[0])).toContain(
        "[boundaries] You haven't specified `settings.elements`",
      );
    });

    it('does not warn when `settings.elements` is provided', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write').mockReturnValue(true);

      await computeEslintConfig({boundaries: {settings: {elements: []}}});

      expect(stderrSpy.mock.calls).toBeEmpty();
    });

    it('sets `boundaries/elements` in ESLint config settings when `elements` is provided', async () => {
      const ELEMENTS = [{type: 'component', pattern: 'components/*'}];

      const configResult = await computeEslintConfig({
        boundaries: {settings: {elements: ELEMENTS}},
      });

      expect(
        configResult.getConfigByUnPostfix('boundaries')?.settings?.['boundaries/elements'],
      ).toStrictEqual(ELEMENTS);
    });

    it('transforms camelCase settings key `rootPath` to `boundaries/root-path`', async () => {
      const configResult = await computeEslintConfig({
        boundaries: {
          settings: {elements: [], rootPath: '/src'},
        },
      });
      const config = configResult.getConfigByUnPostfix('boundaries');

      expect(config?.settings?.['boundaries/root-path']).toBe('/src');
    });
  });
});

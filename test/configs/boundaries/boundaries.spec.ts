const FIXTURES = {
  elementTypesViolation: 'pages/Home.js',
} as const;

const PLUGIN_SETTINGS_OPTIONS = {
  un: {plugins: {boundaries: {settings: {elements: []}}}},
} satisfies Parameters<typeof expectConfigState>[3];

describe('basic tests', () => {
  it('creates `boundaries` eslint config and loads `boundaries` plugin by default', async () => {
    const configResult = await computeEslintConfig('boundaries', {
      un: {plugins: {boundaries: {settings: {elements: []}}}},
    });

    const config = configResult.getConfigByUnPostfix('boundaries');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('boundaries')).toBeDefined();
  });

  it('does not create `boundaries` eslint config and does not load `boundaries` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({boundaries: false});

    expect(configResult.getConfigByUnPostfix('boundaries')).toBeUndefined();
    expect(configResult.getLoadedPlugin('boundaries')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `boundaries` eslint config', async () => {
      await expectConfigState({}, 'boundaries', false);
    });

    it('creates `boundaries` eslint config if explicitly enabled', async () => {
      await expectConfigState('boundaries', 'boundaries', true, PLUGIN_SETTINGS_OPTIONS);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `boundaries` eslint config', async () => {
      await expectConfigState({}, 'boundaries', false, 'default');
    });

    it('creates `boundaries` eslint config if explicitly enabled', async () => {
      await expectConfigState('boundaries', 'boundaries', true, {
        ...PLUGIN_SETTINGS_OPTIONS,
        mode: 'default',
      });
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
      await expectConfigState('boundaries', 'boundaries', true, {
        ...PLUGIN_SETTINGS_OPTIONS,
        mode: 'misc-enabled',
      });
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
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('boundaries', {
    un: {plugins: {boundaries: {settings: {elements: []}}}},
  });

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
        },
      },
      FIXTURES.elementTypesViolation,
      {
        searchFixturesRelativeToPath: import.meta.dirname,
        un: {
          plugins: {
            boundaries: {
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
        },
      },
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

      const configResult = await computeEslintConfig(
        {
          boundaries: {files: FILES},
        },
        {un: {plugins: {boundaries: {settings: {elements: []}}}}},
      );

      expect(configResult.getConfigByUnPostfix('boundaries')?.files).toStrictEqual(FILES);
    });

    it('disables `boundaries` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig(
        {
          boundaries: {files: []},
        },
        {un: {plugins: {boundaries: {settings: {elements: []}}}}},
      );

      expect(configResult.getConfigByUnPostfix('boundaries')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `boundaries` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig(
        {
          boundaries: {ignores: IGNORES},
        },
        {un: {plugins: {boundaries: {settings: {elements: []}}}}},
      );

      const ignores = configResult.getConfigByUnPostfix('boundaries')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `boundaries` eslint config', async () => {
    const configResult = await computeEslintConfig(
      {
        boundaries: {
          overrides: {'boundaries/element-types': 0},
          overridesAny: {'no-console': 0},
        },
      },
      {un: {plugins: {boundaries: {settings: {elements: []}}}}},
    );

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

      await computeEslintConfig('boundaries', {
        un: {plugins: {boundaries: {settings: {elements: []}}}},
      });

      expect(stderrSpy.mock.calls).toBeEmpty();
    });

    it('sets `boundaries/elements` in ESLint config settings when `elements` is provided', async () => {
      const ELEMENTS = [{type: 'component', pattern: 'components/*'}];

      const configResult = await computeEslintConfig('boundaries', {
        un: {plugins: {boundaries: {settings: {elements: ELEMENTS}}}},
      });

      expect(
        configResult.getConfigByUnPostfix('boundaries')?.settings?.['boundaries/elements'],
      ).toStrictEqual(ELEMENTS);
    });

    it('transforms camelCase settings key `rootPath` to `boundaries/root-path`', async () => {
      const configResult = await computeEslintConfig('boundaries', {
        un: {plugins: {boundaries: {settings: {elements: [], rootPath: '/src'}}}},
      });
      const config = configResult.getConfigByUnPostfix('boundaries');

      expect(config?.settings?.['boundaries/root-path']).toBe('/src');
    });
  });
});

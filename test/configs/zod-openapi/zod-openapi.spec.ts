beforeEach(() => {
  addInstalledPackages({'zod-openapi': '5.4.1'});
});

describe('basic tests', () => {
  it('creates `zod-openapi` eslint config and loads `zod-openapi` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('zodOpenapi');

    const config = configResult.getConfigByUnPostfix('zod-openapi');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();

    expect(configResult.getLoadedPlugin('zod-openapi')).toBeDefined();
  });

  it('does not create `zod-openapi` eslint config and does not load `zod-openapi` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({zodOpenapi: false});

    expect(configResult.getConfigByUnPostfix('zod-openapi')).toBeUndefined();
    expect(configResult.getLoadedPlugin('zod-openapi')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `zod-openapi` eslint config', async () => {
      await expectConfigState({}, 'zod-openapi', false);
    });

    it('creates `zod-openapi` eslint config if explicitly enabled', async () => {
      await expectConfigState('zodOpenapi', 'zod-openapi', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    describe('`zod-openapi` is installed', () => {
      it('creates `zod-openapi` eslint config by default', async () => {
        await expectConfigState({}, 'zod-openapi', true, 'default');
      });

      it('creates `zod-openapi` eslint config and prints a warning if explicitly enabled', async () => {
        await expectConfigState('zodOpenapi', 'zod-openapi', ['zodOpenapi', true], 'default');
      });

      it('does not create `zod-openapi` eslint config if explicitly disabled', async () => {
        await expectConfigState({zodOpenapi: false}, 'zod-openapi', false, 'default');
      });
    });

    describe('`zod-openapi` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `zod-openapi` eslint config', async () => {
        await expectConfigState({}, 'zod-openapi', false, 'default');
      });

      it('creates `zod-openapi` eslint config if explicitly enabled', async () => {
        await expectConfigState('zodOpenapi', 'zod-openapi', true, 'default');
      });

      it('does not create `zod-openapi` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState(
          {zodOpenapi: false},
          'zod-openapi',
          ['zodOpenapi', false],
          'default',
        );
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `zod-openapi` eslint config when `zod-openapi` is installed', async () => {
      await expectConfigState({}, 'zod-openapi', true, 'misc-enabled');
    });

    it('creates `zod-openapi` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState(
        {zodOpenapi: true},
        'zod-openapi',
        ['zodOpenapi', true],
        'misc-enabled',
      );
    });

    it('does not create `zod-openapi` eslint config if explicitly disabled', async () => {
      await expectConfigState({zodOpenapi: false}, 'zod-openapi', false, 'misc-enabled');
    });
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig('zodOpenapi');

    expect(configResult.getRuleSeverities('zod-openapi')).toMatchObject({
      'zod-openapi/prefer-meta-last': 2,
      'zod-openapi/require-comment': 0,
    });
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `zod-openapi` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({zodOpenapi: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('zod-openapi')?.files).toStrictEqual(FILES);
    });

    it('disables `zod-openapi` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({zodOpenapi: {files: []}});

      expect(configResult.getConfigByUnPostfix('zod-openapi')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `zod-openapi` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({zodOpenapi: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('zod-openapi')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `zod-openapi` eslint config', async () => {
    const configResult = await computeEslintConfig({
      zodOpenapi: {
        overrides: {'zod-openapi/prefer-meta-last': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleSeverities('zod-openapi')).toMatchObject({
      'zod-openapi/prefer-meta-last': 0,
      'no-console': 0,
    });
  });
});

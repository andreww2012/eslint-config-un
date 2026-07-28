const FIXTURES = {
  useHeadWithDeprecatedTagProp: 'use-head-with-deprecated-tag-prop.js',
} as const;

beforeEach(() => {
  addInstalledPackages({unhead: '3.2.3'});
});

describe('basic tests', () => {
  it('creates `unhead` eslint config and loads `unhead` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('unhead');

    const config = configResult.getConfigByUnPostfix('unhead');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('unhead')).toBeDefined();
  });

  it('does not create `unhead` eslint config and does not load `unhead` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({unhead: false});

    expect(configResult.getConfigByUnPostfix('unhead')).toBeUndefined();
    expect(configResult.getLoadedPlugin('unhead')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `unhead` eslint config', async () => {
      await expectConfigState({}, 'unhead', false);
    });

    it('creates `unhead` eslint config if explicitly enabled', async () => {
      await expectConfigState('unhead', 'unhead', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    describe('`unhead` is installed', () => {
      it('creates `unhead` eslint config by default', async () => {
        await expectConfigState({}, 'unhead', true, 'default');
      });

      it('creates `unhead` eslint config and prints a warning if explicitly enabled', async () => {
        await expectConfigState('unhead', 'unhead', ['unhead', true], 'default');
      });

      it('does not create `unhead` eslint config if explicitly disabled', async () => {
        await expectConfigState({unhead: false}, 'unhead', false, 'default');
      });
    });

    describe('`unhead` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `unhead` eslint config', async () => {
        await expectConfigState({}, 'unhead', false, 'default');
      });

      it('creates `unhead` eslint config if explicitly enabled', async () => {
        await expectConfigState('unhead', 'unhead', true, 'default');
      });

      it('does not create `unhead` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({unhead: false}, 'unhead', ['unhead', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `unhead` eslint config when `unhead` is installed', async () => {
      await expectConfigState({}, 'unhead', true, 'misc-enabled');
    });

    it('creates `unhead` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState({unhead: true}, 'unhead', ['unhead', true], 'misc-enabled');
    });

    it('does not create `unhead` eslint config if explicitly disabled', async () => {
      await expectConfigState({unhead: false}, 'unhead', false, 'misc-enabled');
    });
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig('unhead');

    expect(configResult.getRuleSeverities('unhead')).toMatchObject({
      'unhead/no-deprecated-props': 2,
      'unhead/prefer-define-helpers': 0,
    });
  });

  it('`unhead/no-deprecated-props` rule fires on a v2 tag prop', async () => {
    const results = await testEslintConfig(
      'unhead',
      FIXTURES.useHeadWithDeprecatedTagProp,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.useHeadWithDeprecatedTagProp,
      'unhead/no-deprecated-props',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '""hid" was removed in v3 of unhead. Use "key" instead."',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `unhead` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({unhead: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('unhead')?.files).toStrictEqual(FILES);
    });

    it('disables `unhead` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({unhead: {files: []}});

      expect(configResult.getConfigByUnPostfix('unhead')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `unhead` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({unhead: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('unhead')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `unhead` eslint config', async () => {
    const configResult = await computeEslintConfig({
      unhead: {
        overrides: {'unhead/prefer-define-helpers': 2},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleSeverities('unhead')).toMatchObject({
      'unhead/prefer-define-helpers': 2,
      'no-console': 0,
    });
  });
});

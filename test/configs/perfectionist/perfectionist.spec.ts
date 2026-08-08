describe('basic tests', async () => {
  const configResult = await computeEslintConfig('perfectionist');

  it('creates `perfectionist` eslint config and does not load `perfectionist` plugin when set to `true`', () => {
    expect(configResult.getConfigByUnPostfix('perfectionist')).toBeDefined();
    expect(configResult.getLoadedPlugin('perfectionist')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `perfectionist` eslint config', async () => {
      await expectConfigState({}, 'perfectionist', false);
    });

    it('creates `perfectionist` eslint config if explicitly enabled', async () => {
      await expectConfigState('perfectionist', 'perfectionist', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `perfectionist` eslint config', async () => {
      await expectConfigState({}, 'perfectionist', false, 'default');
    });

    it('creates `perfectionist` eslint config if explicitly enabled', async () => {
      await expectConfigState('perfectionist', 'perfectionist', true, 'default');
    });

    it('does not create `perfectionist` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {perfectionist: false},
        'perfectionist',
        ['perfectionist', false],
        'default',
      );
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `perfectionist` eslint config', async () => {
      await expectConfigState({}, 'perfectionist', false, 'misc-enabled');
    });

    it('creates `perfectionist` eslint config if explicitly enabled', async () => {
      await expectConfigState({perfectionist: true}, 'perfectionist', true, 'misc-enabled');
    });

    it('does not create `perfectionist` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {perfectionist: false},
        'perfectionist',
        ['perfectionist', false],
        'misc-enabled',
      );
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('perfectionist');

  it('does not enable any rules by default (every sorting rule lives in a sub config)', () => {
    expect(getAllRulesSeverities(configResult.getConfigByUnPostfix('perfectionist'))).toStrictEqual(
      [0],
    );
  });

  it('disables `perfectionist/sort-objects` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('perfectionist', 'perfectionist/sort-objects')).toBe(
      0,
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `perfectionist` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({perfectionist: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('perfectionist')?.files).toStrictEqual(FILES);
    });

    it('disables `perfectionist` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({perfectionist: {files: []}});

      expect(configResult.getConfigByUnPostfix('perfectionist')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `perfectionist` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({perfectionist: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('perfectionist')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `perfectionist` eslint config', async () => {
    const configResult = await computeEslintConfig({
      perfectionist: {
        overrides: {'perfectionist/sort-classes': 1},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleSeverities('perfectionist')).toMatchObject({
      'perfectionist/sort-classes': 1,
      'no-console': 0,
    });
  });
});

describe('options', () => {
  describe('option: `settings`', async () => {
    const PLUGIN_SETTINGS = {ignoreCase: false};

    const configResult = await computeEslintConfig({perfectionist: {settings: PLUGIN_SETTINGS}});

    it('sets plugin settings on `perfectionist` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist')?.settings?.['perfectionist'],
      ).toStrictEqual(PLUGIN_SETTINGS);
    });
  });
});

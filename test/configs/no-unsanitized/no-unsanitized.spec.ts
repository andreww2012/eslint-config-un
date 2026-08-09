const FIXTURES = {
  unsafeProperty: 'unsafe-property.js',
} as const;

describe('basic tests', () => {
  it('creates `no-unsanitized` eslint config and loads `no-unsanitized` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('noUnsanitized');

    const config = configResult.getConfigByUnPostfix('no-unsanitized');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('no-unsanitized')).toBeDefined();
  });

  it('does not create `no-unsanitized` eslint config and does not load `no-unsanitized` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({noUnsanitized: false});

    expect(configResult.getConfigByUnPostfix('no-unsanitized')).toBeUndefined();
    expect(configResult.getLoadedPlugin('no-unsanitized')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `no-unsanitized` eslint config', async () => {
      await expectConfigState({}, 'no-unsanitized', false);
    });

    it('creates `no-unsanitized` eslint config if explicitly enabled', async () => {
      await expectConfigState('noUnsanitized', 'no-unsanitized', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `no-unsanitized` eslint config', async () => {
      await expectConfigState({}, 'no-unsanitized', true, 'default');
    });

    it('creates `no-unsanitized` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState(
        'noUnsanitized',
        'no-unsanitized',
        ['noUnsanitized', true],
        'default',
      );
    });

    it('does not create `no-unsanitized` eslint config if explicitly disabled', async () => {
      await expectConfigState({noUnsanitized: false}, 'no-unsanitized', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `no-unsanitized` eslint config', async () => {
      await expectConfigState({}, 'no-unsanitized', true, 'misc-enabled');
    });

    it('creates `no-unsanitized` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState(
        'noUnsanitized',
        'no-unsanitized',
        ['noUnsanitized', true],
        'misc-enabled',
      );
    });

    it('does not create `no-unsanitized` eslint config if explicitly disabled', async () => {
      await expectConfigState({noUnsanitized: false}, 'no-unsanitized', false, 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('noUnsanitized');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('no-unsanitized')).toMatchObject({
      'no-unsanitized/method': 2,
      'no-unsanitized/property': 2,
    });
  });

  it('`no-unsanitized/property` rule fires on unsafe `innerHTML` assignment', async () => {
    const results = await testEslintConfig(
      'noUnsanitized',
      FIXTURES.unsafeProperty,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.unsafeProperty,
      'no-unsanitized/property',
    );

    expect(error?.message).toMatchInlineSnapshot('"Unsafe assignment to innerHTML"');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `no-unsanitized` eslint config', async () => {
      const FILES = ['src/**/*.js'];

      const configResult = await computeEslintConfig({noUnsanitized: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('no-unsanitized')?.files).toStrictEqual(FILES);
    });

    it('disables `no-unsanitized` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({noUnsanitized: {files: []}});

      expect(configResult.getConfigByUnPostfix('no-unsanitized')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `no-unsanitized` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({noUnsanitized: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('no-unsanitized')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `no-unsanitized` eslint config', async () => {
    const configResult = await computeEslintConfig({
      noUnsanitized: {
        overrides: {'no-unsanitized/method': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('no-unsanitized', 'no-unsanitized/method')).toBe(0);
    expect(configResult.getRuleEntrySeverity('no-unsanitized', 'no-console')).toBe(0);
  });
});

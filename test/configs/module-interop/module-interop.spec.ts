const FIXTURES = {
  jsonImportWithoutTypeAttribute: 'json-import-without-type-attribute.mjs',
} as const;

describe('basic tests', () => {
  it('creates `module-interop` eslint config and loads `module-interop` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('moduleInterop');

    const config = configResult.getConfigByUnPostfix('module-interop');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('module-interop')).toBeDefined();
  });

  it('does not create `module-interop` eslint config and does not load `module-interop` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({moduleInterop: false});

    expect(configResult.getConfigByUnPostfix('module-interop')).toBeUndefined();
    expect(configResult.getLoadedPlugin('module-interop')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `module-interop` eslint config', async () => {
      await expectConfigState({}, 'module-interop', false);
    });

    it('creates `module-interop` eslint config if explicitly enabled', async () => {
      await expectConfigState('moduleInterop', 'module-interop', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `module-interop` eslint config by default', async () => {
      await expectConfigState({}, 'module-interop', true, 'default');
    });

    it('creates `module-interop` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState(
        'moduleInterop',
        'module-interop',
        ['moduleInterop', true],
        'default',
      );
    });

    it('does not create `module-interop` eslint config if explicitly disabled', async () => {
      await expectConfigState({moduleInterop: false}, 'module-interop', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `module-interop` eslint config', async () => {
      await expectConfigState({}, 'module-interop', true, 'misc-enabled');
    });

    it('creates `module-interop` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState(
        'moduleInterop',
        'module-interop',
        ['moduleInterop', true],
        'misc-enabled',
      );
    });

    it('does not create `module-interop` eslint config if explicitly disabled', async () => {
      await expectConfigState({moduleInterop: false}, 'module-interop', false, 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('moduleInterop');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('module-interop')).toMatchObject({
      'module-interop/prefer-json-modules': 2,
      'module-interop/no-import-cjs': 0,
    });
  });

  it('`prefer-json-modules` reports an error for a JSON import missing `with {type: "json"}`', async () => {
    const results = await testEslintConfig(
      'moduleInterop',
      FIXTURES.jsonImportWithoutTypeAttribute,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.jsonImportWithoutTypeAttribute,
      'module-interop/prefer-json-modules',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"`with {type: "json"}` is required for `*.json` import."',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `module-interop` eslint config', async () => {
      const FILES = ['src/**/*.{js,ts}'];

      const configResult = await computeEslintConfig({moduleInterop: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('module-interop')?.files).toStrictEqual(FILES);
    });

    it('disables `module-interop` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({moduleInterop: {files: []}});

      expect(configResult.getConfigByUnPostfix('module-interop')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `module-interop` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({moduleInterop: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('module-interop')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });

    it('empty `ignores` array does not remove default ignores', async () => {
      const configResult = await computeEslintConfig({moduleInterop: {ignores: []}});

      expect(configResult.getConfigByUnPostfix('module-interop')?.ignores?.length).toBeGreaterThan(
        0,
      );
    });
  });

  it('respects `overrides` and `overridesAny` in `module-interop` eslint config', async () => {
    const configResult = await computeEslintConfig({
      moduleInterop: {
        overrides: {'module-interop/no-import-cjs': 1},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      configResult.getRuleEntrySeverity('module-interop', 'module-interop/no-import-cjs'),
    ).toBe(1);
    expect(configResult.getRuleEntrySeverity('module-interop', 'no-console')).toBe(0);
  });
});

import {GLOB_HTM, GLOB_HTML, GLOB_HTM_HTML} from '../../../src/constants';

const FIXTURES = {
  optionalChaining: 'optional-chaining.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig({es: {ecmaVersion: 2019}});

  it('loads `es` plugin', () => {
    expect(configResult.getLoadedPlugin('es')).toBeDefined();
  });

  it('creates `es` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('es')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `es` eslint config', async () => {
      await expectConfigState({}, 'es', false);
    });

    it('creates `es` eslint config if explicitly enabled', async () => {
      await expectConfigState('es', 'es', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `es` eslint config', async () => {
      await expectConfigState({}, 'es', false, 'default');
    });

    it('creates `es` eslint config if explicitly enabled', async () => {
      await expectConfigState('es', 'es', true, 'default');
    });

    it('does not create `es` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({es: false}, 'es', ['es', false], 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `es` eslint config (`es` is not in the misc group)', async () => {
      await expectConfigState({}, 'es', false, 'misc-enabled');
    });

    it('creates `es` eslint config if explicitly enabled in misc mode', async () => {
      await expectConfigState({es: true}, 'es', true, 'misc-enabled');
    });

    it('does not create `es` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({es: false}, 'es', ['es', false], 'misc-enabled');
    });
  });

  it('has no explicit `files` in `es` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('es')?.files).toBeUndefined();
  });

  it('has default `ignores` in `es` eslint config (does not ignore HTML files)', () => {
    const ignores = configResult.getConfigByUnPostfix('es')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.toIncludeAnyMembers([GLOB_HTML, GLOB_HTM, GLOB_HTM_HTML]);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('es');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('es')).toMatchObject({
      'es/no-date-prototype-getyear-setyear': 0,
      'es/no-date-prototype-togmtstring': 0,
    });
  });

  it('does not add `es/no-optional-chaining` rule by default (ecmaVersion: latest → ES2020 is fully supported)', () => {
    expect(configResult.getRuleEntry('es', 'es/no-optional-chaining')).toBeUndefined();
  });

  it('`es/no-optional-chaining` rule fires on optional chaining when ecmaVersion is 2019', async () => {
    const results = await testEslintConfig(
      {es: {ecmaVersion: 2019}},
      FIXTURES.optionalChaining,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.optionalChaining,
      'es/no-optional-chaining',
    );

    expect(error?.message).toMatchInlineSnapshot('"ES2020 optional chaining is forbidden."');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `es` eslint config', async () => {
      const FILES = ['src/**/*.js'];

      const configResult = await computeEslintConfig({es: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('es')?.files).toStrictEqual(FILES);
    });

    it('disables `es` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({es: {files: []}});

      expect(configResult.getConfigByUnPostfix('es')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `es` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({es: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('es')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `es` eslint config', async () => {
    const configResult = await computeEslintConfig({
      es: {
        overrides: {'es/no-date-prototype-getyear-setyear': 2},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('es', 'es/no-date-prototype-getyear-setyear')).toBe(2);
    expect(configResult.getRuleEntrySeverity('es', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set `es-x` settings by default', async () => {
      const configResult = await computeEslintConfig('es');

      expect(configResult.getConfigByUnPostfix('es')?.settings?.['es-x']).toBeUndefined();
    });

    it('sets `es-x` settings when `aggressive` is provided', async () => {
      const SETTINGS = {aggressive: true};

      const configResult = await computeEslintConfig({
        es: {settings: SETTINGS},
      });

      expect(configResult.getConfigByUnPostfix('es')?.settings?.['es-x']).toStrictEqual(SETTINGS);
    });
  });

  describe('option: `ecmaVersion`', () => {
    it('does not add ES2020 feature rules by default (ecmaVersion: latest)', async () => {
      const configResult = await computeEslintConfig('es');

      expect(configResult.getRuleEntry('es', 'es/no-optional-chaining')).toBeUndefined();
    });

    it('enables ES2020 feature rules as error when ecmaVersion is 2019', async () => {
      const configResult = await computeEslintConfig({es: {ecmaVersion: 2019}});

      expect(configResult.getRuleEntrySeverity('es', 'es/no-optional-chaining')).toBe(2);
    });

    it('does not add ES2015 feature rules when ecmaVersion is 2015 (ES2015 is fully supported)', async () => {
      const configResult = await computeEslintConfig({es: {ecmaVersion: 2015}});

      expect(configResult.getRuleEntry('es', 'es/no-arrow-functions')).toBeUndefined();
    });

    it('enables ES2015 feature rules as error when ecmaVersion is 5', async () => {
      const configResult = await computeEslintConfig({es: {ecmaVersion: 5}});

      expect(configResult.getRuleEntrySeverity('es', 'es/no-arrow-functions')).toBe(2);
    });
  });

  describe('option: `ecmaFeatures`', () => {
    it('enables a specific feature rule when the feature is set to false within an otherwise supported version', async () => {
      const configResult = await computeEslintConfig({
        es: {ecmaFeatures: {2020: {optionalChaining: false}}},
      });

      expect(configResult.getRuleEntrySeverity('es', 'es/no-optional-chaining')).toBe(2);
      expect(configResult.getRuleEntrySeverity('es', 'es/no-bigint')).toBe(0);
    });

    it('disables a specific feature rule when the feature is set to true within an otherwise unsupported version', async () => {
      const configResult = await computeEslintConfig({
        es: {ecmaVersion: 2019, ecmaFeatures: {2020: {optionalChaining: true}}},
      });

      expect(configResult.getRuleEntrySeverity('es', 'es/no-optional-chaining')).toBe(0);
    });

    it('enables all rules in a version when ecmaFeatures sets that version to false (boolean shorthand)', async () => {
      const configResult = await computeEslintConfig({es: {ecmaFeatures: {2020: false}}});

      expect(configResult.getRuleSeverities('es')).toMatchObject({
        'es/no-bigint': 2,
        'es/no-optional-chaining': 2,
      });
    });

    it('enables ES5 rules when ecmaFeatures sets ES5 to `false`', async () => {
      const configResult = await computeEslintConfig({es: {ecmaFeatures: {5: false}}});

      expect(configResult.getRuleEntrySeverity('es', 'es/no-array-isarray')).toBe(2);
    });
  });
});

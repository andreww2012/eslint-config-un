import {GLOB_HTM, GLOB_HTML, GLOB_HTM_HTML} from '../../../src/constants';

const FIXTURES = {
  duplicateDisjunctions: 'duplicate-disjunctions.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('regexp');

  it('loads `regexp` plugin if used', () => {
    expect(configResult.getLoadedPlugin('regexp')).toBeDefined();
  });

  it('creates `regexp` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('regexp')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `regexp` eslint config', async () => {
      await expectConfigState({}, 'regexp', false);
    });

    it('creates `regexp` eslint config if explicitly enabled', async () => {
      await expectConfigState('regexp', 'regexp', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `regexp` eslint config by default', async () => {
      await expectConfigState({}, 'regexp', true, 'default');
    });

    it('creates `regexp` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('regexp', 'regexp', ['regexp', true], 'default');
    });

    it('does not create `regexp` eslint config if explicitly disabled', async () => {
      await expectConfigState({regexp: false}, 'regexp', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `regexp` eslint config', async () => {
      await expectConfigState({}, 'regexp', true, 'misc-enabled');
    });

    it('creates `regexp` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('regexp', 'regexp', ['regexp', true], 'misc-enabled');
    });

    it('does not create `regexp` eslint config if explicitly disabled', async () => {
      await expectConfigState({regexp: false}, 'regexp', false, 'misc-enabled');
    });
  });

  it('has no explicit `files` restriction in `regexp` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('regexp')?.files).toBeUndefined();
  });

  it('has default `ignores` in `regexp` eslint config (does not ignore HTML files)', () => {
    const ignores = configResult.getConfigByUnPostfix('regexp')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.toIncludeAnyMembers([GLOB_HTML, GLOB_HTM, GLOB_HTM_HTML]);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('regexp');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('regexp')).toMatchObject({
      'regexp/no-dupe-disjunctions': 2,
      'regexp/no-potentially-useless-backreference': 1,
      'regexp/no-super-linear-move': 0,
    });
  });

  it('`regexp/no-dupe-disjunctions` rule fires on a file with duplicate regex disjunctions', async () => {
    const results = await testEslintConfig(
      'regexp',
      FIXTURES.duplicateDisjunctions,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.duplicateDisjunctions,
      'regexp/no-dupe-disjunctions',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Unexpected duplicate alternative. This alternative can be removed."',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `regexp` eslint config', async () => {
      const FILES = ['src/**/*.js'];

      const configResult = await computeEslintConfig({regexp: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('regexp')?.files).toStrictEqual(FILES);
    });

    it('disables `regexp` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({regexp: {files: []}});

      expect(configResult.getConfigByUnPostfix('regexp')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `regexp` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({regexp: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('regexp')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `regexp` eslint config', async () => {
    const configResult = await computeEslintConfig({
      regexp: {
        overrides: {'regexp/no-dupe-disjunctions': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('regexp', 'regexp/no-dupe-disjunctions')).toBe(0);
    expect(configResult.getRuleEntrySeverity('regexp', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set regexp settings by default', async () => {
      const configResult = await computeEslintConfig('regexp');
      const config = configResult.getConfigByUnPostfix('regexp');

      expect(config?.settings?.['regexp']).toBeUndefined();
    });

    it('sets regexp settings when `settings` is provided', async () => {
      const SETTINGS = {allowedCharacterRanges: 'all'} as const;

      const configResult = await computeEslintConfig({
        regexp: {settings: SETTINGS},
      });
      const config = configResult.getConfigByUnPostfix('regexp');

      expect(config?.settings?.['regexp']).toStrictEqual(SETTINGS);
    });
  });
});

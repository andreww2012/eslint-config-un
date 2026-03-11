import {GLOB_HTML, GLOB_HTM, GLOB_HTM_HTML} from '../../../src/constants';

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
      const configResult = await computeEslintConfig({});

      expect(configResult.getConfigByUnPostfix('regexp')).toBeUndefined();
    });

    it('creates `regexp` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig('regexp');

      expect(configResult.getConfigByUnPostfix('regexp')).toBeDefined();
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `regexp` eslint config by default', async () => {
      const configResult = await computeEslintConfig({}, {reset: true});

      expect(configResult.getConfigByUnPostfix('regexp')).toBeDefined();
    });

    it('creates `regexp` eslint config and prints a warning if explicitly enabled', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      const configResult = await computeEslintConfig('regexp', {reset: true});

      expect(configResult.getConfigByUnPostfix('regexp')).toBeDefined();

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          `[warn] [eslint-config-un] There is no need to enable \`regexp\` config because this is the default`,
        ),
      ).toBe(true);
    });

    it('does not create `regexp` eslint config if explicitly disabled', async () => {
      const configResult = await computeEslintConfig({regexp: false}, {reset: true});

      expect(configResult.getConfigByUnPostfix('regexp')).toBeUndefined();
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `regexp` eslint config', async () => {
      const configResult = await computeEslintConfig(
        {},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(configResult.getConfigByUnPostfix('regexp')).toBeDefined();
    });
  });

  it('has no explicit `files` restriction in `regexp` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('regexp')?.files).toBeUndefined();
  });

  it('has default `ignores` in `regexp` eslint config (does not ignore HTML files)', () => {
    const ignores = configResult.getConfigByUnPostfix('regexp')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.to.include.members([GLOB_HTML, GLOB_HTM, GLOB_HTM_HTML]);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('regexp');

  it('enables `regexp/no-dupe-disjunctions` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('regexp', 'regexp/no-dupe-disjunctions')).toBe(2);
  });

  it('disables `regexp/no-super-linear-move` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('regexp', 'regexp/no-super-linear-move')).toBe(0);
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
      `"Unexpected duplicate alternative. This alternative can be removed."`,
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `regexp` eslint config', async () => {
      const FILES = ['src/**/*.js'];
      const configResult = await computeEslintConfig({
        regexp: {files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('regexp')?.files).toStrictEqual(FILES);
    });

    it('disables `regexp` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        regexp: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('regexp')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `regexp` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        regexp: {ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix('regexp')?.ignores;

      expect(ignores).to.include.members(IGNORES);
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

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `regexp` eslint config', async () => {
      const configResult = await computeEslintConfig({
        regexp: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('regexp'), (ruleName) =>
          ruleName.startsWith('regexp/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `regexp` eslint config', async () => {
      const configResult = await computeEslintConfig({
        regexp: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('regexp'), (ruleName) =>
          ruleName.startsWith('regexp/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set regexp settings when `settings` is not provided', async () => {
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

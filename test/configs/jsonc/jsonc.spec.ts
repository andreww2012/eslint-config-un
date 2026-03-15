import {GLOB_MARKDOWN, GLOB_MDX} from '../../../src/constants';

const FIXTURES = {
  dupKeysJson: 'dup-keys.json',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('json');

  it('loads `jsonc` plugin if used', () => {
    expect(configResult.getLoadedPlugin('jsonc')).toBeDefined();
  });

  it('creates `jsonc/all` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('jsonc/all')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `jsonc/all` eslint config', async () => {
      const configResult = await computeEslintConfig({});

      expect(configResult.getConfigByUnPostfix('jsonc/all')).toBeUndefined();
    });

    it('creates `jsonc/all` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig('json');

      expect(configResult.getConfigByUnPostfix('jsonc/all')).toBeDefined();
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `jsonc/all` eslint config', async () => {
      const configResult = await computeEslintConfig({}, {reset: true});

      expect(configResult.getConfigByUnPostfix('jsonc/all')).toBeUndefined();
    });

    it('creates `jsonc/all` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig('json', {reset: true});

      expect(configResult.getConfigByUnPostfix('jsonc/all')).toBeDefined();
    });

    it('does not create `jsonc/all` eslint config and prints a warning if explicitly disabled', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      const configResult = await computeEslintConfig({json: false}, {reset: true});

      expect(configResult.getConfigByUnPostfix('jsonc/all')).toBeUndefined();

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          '[warn] [eslint-config-un] There is no need to disable `json` config because this is the default',
        ),
      ).toBe(true);
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `jsonc/all` eslint config', async () => {
      const configResult = await computeEslintConfig(
        {},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(configResult.getConfigByUnPostfix('jsonc/all')).toBeDefined();
    });
  });

  it('has default `files` in `jsonc/all` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('jsonc/all')?.files).toMatchInlineSnapshot(
      '["**/*.json", "**/*.jsonc", "**/*.json5"]',
    );
  });

  it('has default `ignores` in `jsonc/all` eslint config (does not ignore .md and .mdx files)', () => {
    const ignores = configResult.getConfigByUnPostfix('jsonc/all')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.to.include.members([GLOB_MARKDOWN, GLOB_MDX]);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('json');

  it('enables `jsonc/no-dupe-keys` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('jsonc/all', 'jsonc/no-dupe-keys')).toBe(2);
  });

  it('disables `jsonc/sort-keys` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('jsonc/all', 'jsonc/sort-keys')).toBe(0);
  });

  it('`jsonc/no-dupe-keys` rule fires on a .json file with duplicate keys', async () => {
    const results = await testEslintConfig('json', FIXTURES.dupKeysJson, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.dupKeysJson,
      'jsonc/no-dupe-keys',
    );

    expect(error?.message).toMatchInlineSnapshot(`"Duplicate key 'key'."`);
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `jsonc/all` eslint config', async () => {
      const FILES = ['src/**/*.json'];
      const configResult = await computeEslintConfig({
        json: {files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('jsonc/all')?.files).toStrictEqual(FILES);
    });

    it('disables `jsonc/all` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        json: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('jsonc/all')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `jsonc/all` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        json: {ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix('jsonc/all')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `jsonc/all` eslint config', async () => {
    const configResult = await computeEslintConfig({
      json: {overrides: {'jsonc/no-dupe-keys': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('jsonc/all', 'jsonc/no-dupe-keys')).toBe(0);
    expect(configResult.getRuleEntrySeverity('jsonc/all', 'no-console')).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `jsonc/all` eslint config', async () => {
      const configResult = await computeEslintConfig({
        json: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('jsonc/all'), (ruleName) =>
          ruleName.startsWith('jsonc/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `jsonc/all` eslint config', async () => {
      const configResult = await computeEslintConfig({
        json: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('jsonc/all'), (ruleName) =>
          ruleName.startsWith('jsonc/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

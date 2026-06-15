import {GLOB_MARKDOWN, GLOB_MDX} from '../../../src/constants';

const FIXTURES = {
  dupKeysJson: 'dup-keys.json',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('jsonc');

  it('loads `jsonc` plugin if used', () => {
    expect(configResult.getLoadedPlugin('jsonc')).toBeDefined();
  });

  it('creates `jsonc/all` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('jsonc/all')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `jsonc/all` eslint config', async () => {
      await expectConfigState({}, 'jsonc/all', false);
    });

    it('creates `jsonc/all` eslint config if explicitly enabled', async () => {
      await expectConfigState('jsonc', 'jsonc/all', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `jsonc/all` eslint config', async () => {
      await expectConfigState({}, 'jsonc/all', false, 'default');
    });

    it('creates `jsonc/all` eslint config if explicitly enabled', async () => {
      await expectConfigState('jsonc', 'jsonc/all', true, 'default');
    });

    it('does not create `jsonc/all` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({jsonc: false}, 'jsonc/all', ['jsonc', false], 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `jsonc/all` eslint config', async () => {
      await expectConfigState({}, 'jsonc/all', true, 'misc-enabled');
    });

    it('creates `jsonc/all` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState({jsonc: true}, 'jsonc/all', ['jsonc', true], 'misc-enabled');
    });

    it('does not create `jsonc/all` eslint config if explicitly disabled', async () => {
      await expectConfigState({jsonc: false}, 'jsonc/all', false, 'misc-enabled');
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
    expect(ignores).not.toIncludeAnyMembers([GLOB_MARKDOWN, GLOB_MDX]);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('jsonc');

  it('enables `jsonc/no-dupe-keys` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('jsonc/all', 'jsonc/no-dupe-keys')).toBe(2);
  });

  it('disables `jsonc/sort-keys` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('jsonc/all', 'jsonc/sort-keys')).toBe(0);
  });

  it('`jsonc/no-dupe-keys` rule fires on a .json file with duplicate keys', async () => {
    const results = await testEslintConfig('jsonc', FIXTURES.dupKeysJson, import.meta.dirname);

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

      const configResult = await computeEslintConfig({jsonc: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('jsonc/all')?.files).toStrictEqual(FILES);
    });

    it('disables `jsonc/all` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({jsonc: {files: []}});

      expect(configResult.getConfigByUnPostfix('jsonc/all')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `jsonc/all` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({jsonc: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('jsonc/all')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `jsonc/all` eslint config', async () => {
    const configResult = await computeEslintConfig({
      jsonc: {overrides: {'jsonc/no-dupe-keys': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('jsonc/all', 'jsonc/no-dupe-keys')).toBe(0);
    expect(configResult.getRuleEntrySeverity('jsonc/all', 'no-console')).toBe(0);
  });
});

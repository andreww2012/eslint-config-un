import {GLOB_HTM, GLOB_HTML, GLOB_HTM_HTML} from '../../../src/constants';

const FIXTURES = {
  plainFunction: 'plain-function.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('preferArrowFunctions');

  it('loads `prefer-arrow-functions` plugin if used', () => {
    expect(configResult.getLoadedPlugin('prefer-arrow-functions')).toBeDefined();
  });

  it('creates `prefer-arrow-functions` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('prefer-arrow-functions')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `prefer-arrow-functions` eslint config', async () => {
      await expectConfigState({}, 'prefer-arrow-functions', false);
    });

    it('creates `prefer-arrow-functions` eslint config if explicitly enabled', async () => {
      await expectConfigState('preferArrowFunctions', 'prefer-arrow-functions', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `prefer-arrow-functions` eslint config', async () => {
      await expectConfigState({}, 'prefer-arrow-functions', false, 'default');
    });

    it('creates `prefer-arrow-functions` eslint config if explicitly enabled', async () => {
      await expectConfigState('preferArrowFunctions', 'prefer-arrow-functions', true, 'default');
    });

    it('does not create `prefer-arrow-functions` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {preferArrowFunctions: false},
        'prefer-arrow-functions',
        ['preferArrowFunctions', false],
        'default',
      );
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `prefer-arrow-functions` eslint config', async () => {
      await expectConfigState({}, 'prefer-arrow-functions', false, 'misc-enabled');
    });

    it('creates `prefer-arrow-functions` eslint config if explicitly enabled', async () => {
      await expectConfigState(
        {preferArrowFunctions: true},
        'prefer-arrow-functions',
        true,
        'misc-enabled',
      );
    });

    it('does not create `prefer-arrow-functions` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {preferArrowFunctions: false},
        'prefer-arrow-functions',
        ['preferArrowFunctions', false],
        'misc-enabled',
      );
    });
  });

  it('has no explicit `files` restriction in `prefer-arrow-functions` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('prefer-arrow-functions')?.files).toBeUndefined();
  });

  it('has default `ignores` in `prefer-arrow-functions` eslint config (does not ignore HTML files)', () => {
    const ignores = configResult.getConfigByUnPostfix('prefer-arrow-functions')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.toIncludeAnyMembers([GLOB_HTML, GLOB_HTM, GLOB_HTM_HTML]);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('preferArrowFunctions');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('prefer-arrow-functions')).toMatchObject({
      'prefer-arrow-functions/prefer-arrow-functions': 1,
    });
  });

  it('`prefer-arrow-functions/prefer-arrow-functions` rule fires on a file with a plain function', async () => {
    const results = await testEslintConfig(
      'preferArrowFunctions',
      FIXTURES.plainFunction,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.plainFunction,
      'prefer-arrow-functions/prefer-arrow-functions',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Prefer using arrow functions over plain functions"',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `prefer-arrow-functions` eslint config', async () => {
      const FILES = ['**/*.ts'];

      const configResult = await computeEslintConfig({preferArrowFunctions: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('prefer-arrow-functions')?.files).toStrictEqual(
        FILES,
      );
    });

    it('disables `prefer-arrow-functions` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({preferArrowFunctions: {files: []}});

      expect(configResult.getConfigByUnPostfix('prefer-arrow-functions')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `prefer-arrow-functions` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({preferArrowFunctions: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('prefer-arrow-functions')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `prefer-arrow-functions` eslint config', async () => {
    const configResult = await computeEslintConfig({
      preferArrowFunctions: {
        overrides: {'prefer-arrow-functions/prefer-arrow-functions': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      configResult.getRuleEntrySeverity(
        'prefer-arrow-functions',
        'prefer-arrow-functions/prefer-arrow-functions',
      ),
    ).toBe(0);
    expect(configResult.getRuleEntrySeverity('prefer-arrow-functions', 'no-console')).toBe(0);
  });
});

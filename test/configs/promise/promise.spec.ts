import {GLOB_HTM, GLOB_HTML, GLOB_HTM_HTML} from '../../../src/constants';

const FIXTURES = {
  promiseRejectParameterNamedDone: 'promise-reject-parameter-named-done.js',
} as const;

describe('basic tests', () => {
  it('creates `promise` eslint config and loads `promise` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('promise');

    const config = configResult.getConfigByUnPostfix('promise');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();

    const ignores = config?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.toIncludeAnyMembers([GLOB_HTML, GLOB_HTM, GLOB_HTM_HTML]);

    expect(configResult.getLoadedPlugin('promise')).toBeDefined();
  });

  it('does not create `promise` eslint config and does not load `promise` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({promise: false});

    expect(configResult.getConfigByUnPostfix('promise')).toBeUndefined();
    expect(configResult.getLoadedPlugin('promise')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `promise` eslint config', async () => {
      await expectConfigState({}, 'promise', false);
    });

    it('creates `promise` eslint config if explicitly enabled', async () => {
      await expectConfigState('promise', 'promise', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `promise` eslint config by default', async () => {
      await expectConfigState({}, 'promise', true, 'default');
    });

    it('creates `promise` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('promise', 'promise', ['promise', true], 'default');
    });

    it('does not create `promise` eslint config if explicitly disabled', async () => {
      await expectConfigState({promise: false}, 'promise', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `promise` eslint config', async () => {
      await expectConfigState({}, 'promise', true, 'misc-enabled');
    });

    it('creates `promise` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('promise', 'promise', ['promise', true], 'misc-enabled');
    });

    it('does not create `promise` eslint config if explicitly disabled', async () => {
      await expectConfigState({promise: false}, 'promise', false, 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('promise');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('promise')).toMatchObject({
      'promise/param-names': 2,
      'promise/no-multiple-resolved': 1,
      'promise/avoid-new': 0,
    });
  });

  it('`promise/param-names` rule fires on a promise with incorrectly named reject parameter', async () => {
    const results = await testEslintConfig(
      'promise',
      FIXTURES.promiseRejectParameterNamedDone,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.promiseRejectParameterNamedDone,
      'promise/param-names',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Promise constructor parameters must be named to match "^_?reject$""',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `promise` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({promise: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('promise')?.files).toStrictEqual(FILES);
    });

    it('disables `promise` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({promise: {files: []}});

      expect(configResult.getConfigByUnPostfix('promise')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `promise` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({promise: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('promise')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `promise` eslint config', async () => {
    const configResult = await computeEslintConfig({
      promise: {overrides: {'promise/param-names': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('promise', 'promise/param-names')).toBe(0);
    expect(configResult.getRuleEntrySeverity('promise', 'no-console')).toBe(0);
  });
});

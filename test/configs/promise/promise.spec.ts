import {GLOB_HTM, GLOB_HTML, GLOB_HTM_HTML} from '../../../src/constants';

const FIXTURES = {
  promiseRejectParameterNamedDone: 'promise-reject-parameter-named-done.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('promise');

  it('loads `promise` plugin if used', () => {
    expect(configResult.getLoadedPlugin('promise')).toBeDefined();
  });

  it('creates `promise` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('promise')).toBeDefined();
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
  });

  it('has no explicit `files` restriction in `promise` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('promise')?.files).toBeUndefined();
  });

  it('has default `ignores` in `promise` eslint config (does not ignore HTML files)', () => {
    const ignores = configResult.getConfigByUnPostfix('promise')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.to.include.members([GLOB_HTML, GLOB_HTM, GLOB_HTM_HTML]);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('promise');

  it('enables `promise/param-names` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('promise', 'promise/param-names')).toBe(2);
  });

  it('disables `promise/avoid-new` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('promise', 'promise/avoid-new')).toBe(0);
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

    it('disables `promise` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({promise: {files: []}});

      expect(configResult.getConfigByUnPostfix('promise')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `promise` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({promise: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('promise')?.ignores;

      expect(ignores).to.include.members(IGNORES);
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

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `promise` eslint config', async () => {
      const configResult = await computeEslintConfig({promise: {forceSeverity: 'error'}});

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('promise'), (ruleName) =>
          ruleName.startsWith('promise/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `promise` eslint config', async () => {
      const configResult = await computeEslintConfig({promise: {forceSeverity: 'warn'}});

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('promise'), (ruleName) =>
          ruleName.startsWith('promise/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

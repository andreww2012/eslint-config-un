const FIXTURES = {
  toFunction: 'to-function.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('command');

  it('loads `command` plugin if used', () => {
    expect(configResult.getLoadedPlugin('command')).toBeDefined();
  });

  it('creates `command` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('command')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `command` eslint config', async () => {
      await expectConfigState({}, 'command', false);
    });

    it('creates `command` eslint config if explicitly enabled', async () => {
      await expectConfigState('command', 'command', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `command` eslint config', async () => {
      await expectConfigState({}, 'command', false, 'default');
    });

    it('creates `command` eslint config if explicitly enabled', async () => {
      await expectConfigState('command', 'command', true, 'default');
    });

    it('does not create `command` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({command: false}, 'command', ['command', false], 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `command` eslint config', async () => {
      await expectConfigState({}, 'command', false, 'misc-enabled');
    });

    it('creates `command` eslint config if explicitly enabled', async () => {
      await expectConfigState({command: true}, 'command', true, 'misc-enabled');
    });

    it('does not create `command` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({command: false}, 'command', ['command', false], 'misc-enabled');
    });
  });

  it('has no explicit `files` restriction in `command` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('command')?.files).toBeUndefined();
  });

  it('has default `ignores` in `command` eslint config', () => {
    const ignores = configResult.getConfigByUnPostfix('command')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('command');

  it('enables `command/command` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('command', 'command/command')).toBe(2);
  });

  it('`command/command` rule fires on a file with a `/// to-function` command comment', async () => {
    const results = await testEslintConfig('command', FIXTURES.toFunction, import.meta.dirname);

    const error = findLintMessageFromLintResults(results, FIXTURES.toFunction, 'command/command');

    expect(error?.message).toMatchInlineSnapshot('"[to-function] fix: Convert to function"');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `command` eslint config', async () => {
      const FILES = ['src/**/*.js'];
      const configResult = await computeEslintConfig({
        command: {files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('command')?.files).toStrictEqual(FILES);
    });

    it('disables `command` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        command: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('command')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `command` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        command: {ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix('command')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `command` eslint config', async () => {
    const configResult = await computeEslintConfig({
      command: {overrides: {'command/command': 1}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('command', 'command/command')).toBe(1);
    expect(configResult.getRuleEntrySeverity('command', 'no-console')).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `command` eslint config', async () => {
      const configResult = await computeEslintConfig({
        command: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('command'), (ruleName) =>
          ruleName.startsWith('command/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `command` eslint config', async () => {
      const configResult = await computeEslintConfig({
        command: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('command'), (ruleName) =>
          ruleName.startsWith('command/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

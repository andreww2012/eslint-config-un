const FIXTURES = {
  arrowWithToFunctionDirective: 'arrow-with-to-function-directive.js',
} as const;

describe('basic tests', () => {
  it('creates `command` eslint config and loads `command` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('command');

    const config = configResult.getConfigByUnPostfix('command');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('command')).toBeDefined();
  });

  it('does not create `command` eslint config and does not load `command` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({command: false});

    expect(configResult.getConfigByUnPostfix('command')).toBeUndefined();
    expect(configResult.getLoadedPlugin('command')).toBeUndefined();
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
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('command');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('command')).toMatchObject({
      'command/command': 2,
    });
  });

  it('`command/command` rule fires on a file with a `/// to-function` command comment', async () => {
    const results = await testEslintConfig(
      'command',
      FIXTURES.arrowWithToFunctionDirective,
      import.meta.dirname,
    );

    expect(
      findLintMessageFromLintResults(
        results,
        FIXTURES.arrowWithToFunctionDirective,
        'command/command',
      )?.message,
    ).toMatchInlineSnapshot('"[to-function] fix: Convert to function"');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `command` eslint config', async () => {
      const FILES = ['src/**/*.js'];

      const configResult = await computeEslintConfig({command: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('command')?.files).toStrictEqual(FILES);
    });

    it('disables `command` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({command: {files: []}});

      expect(configResult.getConfigByUnPostfix('command')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `command` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({command: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('command')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
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
});

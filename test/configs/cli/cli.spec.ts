const FIXTURES = {
  iifeAsync: 'bin/iife-async.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('cli');

  it('loads `unicorn` plugin if used', () => {
    expect(configResult.getLoadedPlugin('unicorn')).toBeDefined();
  });

  it('creates `cli` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('cli')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `cli` eslint config', async () => {
      await expectConfigState({}, 'cli', false);
    });

    it('creates `cli` eslint config if explicitly enabled', async () => {
      await expectConfigState({cli: true}, 'cli', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `cli` eslint config by default', async () => {
      await expectConfigState({}, 'cli', true, 'default');
    });

    it('creates `cli` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState({cli: true}, 'cli', ['cli', true], 'default');
    });

    it('does not create `cli` eslint config if explicitly disabled', async () => {
      await expectConfigState({cli: false}, 'cli', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `cli` eslint config', async () => {
      await expectConfigState({}, 'cli', true, 'misc-enabled');
    });

    it('creates `cli` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState({cli: true}, 'cli', ['cli', true], 'misc-enabled');
    });

    it('does not create `cli` eslint config if explicitly disabled', async () => {
      await expectConfigState({cli: false}, 'cli', false, 'misc-enabled');
    });
  });

  it('has default `files` in `cli` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('cli')?.files).toMatchInlineSnapshot(
      '["**/bin/**/*.?([cm])[jt]s", "**/scripts/**/*.?([cm])[jt]s", "**/cli/**/*.?([cm])[jt]s", "**/cli.?([cm])[jt]s"]',
    );
  });

  it('has default `ignores` in `cli` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('cli')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('cli');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('cli')).toMatchObject({
      'unicorn/prefer-top-level-await': 2,
      'node/hashbang': 0,
    });
  });

  it('`unicorn/prefer-top-level-await` rule fires on a file with a top-level async IIFE', async () => {
    const results = await testEslintConfig('cli', FIXTURES.iifeAsync, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.iifeAsync,
      'unicorn/prefer-top-level-await',
    );

    expect(error?.message).toMatchInlineSnapshot('"Prefer top-level await over an async IIFE."');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `cli` eslint config', async () => {
      const FILES = ['bin/**/*.ts'];

      const configResult = await computeEslintConfig({cli: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('cli')?.files).toStrictEqual(FILES);
    });

    it('disables `cli` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({cli: {files: []}});

      expect(configResult.getConfigByUnPostfix('cli')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `cli` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({cli: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('cli')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `cli` eslint config', async () => {
    const configResult = await computeEslintConfig({
      cli: {
        overrides: {'unicorn/prefer-top-level-await': 0},
        overridesAny: {'no-console': 1},
      },
    });

    expect(configResult.getRuleEntrySeverity('cli', 'unicorn/prefer-top-level-await')).toBe(0);
    expect(configResult.getRuleEntrySeverity('cli', 'no-console')).toBe(1);
  });
});

describe('options', () => {
  describe('option: `disabledRules`', () => {
    it('disables `no-await-in-loop`, `no-console`, `node/hashbang` and other rules by default', async () => {
      const configResult = await computeEslintConfig('cli');

      expect(configResult.getRuleEntrySeverity('cli', 'no-await-in-loop')).toBe(0);
      expect(configResult.getRuleEntrySeverity('cli', 'no-console')).toBe(0);
      expect(configResult.getRuleEntrySeverity('cli', 'node/hashbang')).toBe(0);
    });

    it('does not disable `check-file/no-await-in-loop` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        cli: {disabledRules: {'no-await-in-loop': false}},
      });

      expect(configResult.getRuleEntry('cli', 'no-await-in-loop')).toBeUndefined();
    });

    it('does not disable `check-file/no-console` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({cli: {disabledRules: {'no-console': false}}});

      expect(configResult.getRuleEntry('cli', 'no-console')).toBeUndefined();
    });

    it('does not disable `node/hashbang` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        cli: {disabledRules: {'node/hashbang': false}},
      });

      expect(configResult.getRuleEntry('cli', 'node/hashbang')).toBeUndefined();
    });

    it('does not disable `node/no-process-exit` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        cli: {disabledRules: {'node/no-process-exit': false}},
      });

      expect(configResult.getRuleEntry('cli', 'node/no-process-exit')).toBeUndefined();
    });

    it('does not disable `node/no-top-level-await` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        cli: {disabledRules: {'node/no-top-level-await': false}},
      });

      expect(configResult.getRuleEntry('cli', 'node/no-top-level-await')).toBeUndefined();
    });

    it('does not disable `import/no-extraneous-dependencies` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        cli: {disabledRules: {'import/no-extraneous-dependencies': false}},
      });

      expect(configResult.getRuleEntry('cli', 'import/no-extraneous-dependencies')).toBeUndefined();
    });

    it('does not disable `unicorn/no-process-exit` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        cli: {disabledRules: {'unicorn/no-process-exit': false}},
      });

      expect(configResult.getRuleEntry('cli', 'unicorn/no-process-exit')).toBeUndefined();
    });
  });

  describe('option: `onlyTopLevelDirs`', () => {
    it('includes nested directories in default `files` by default', async () => {
      const configResult = await computeEslintConfig('cli');

      expect(configResult.getConfigByUnPostfix('cli')?.files).toMatchInlineSnapshot(
        '["**/bin/**/*.?([cm])[jt]s", "**/scripts/**/*.?([cm])[jt]s", "**/cli/**/*.?([cm])[jt]s", "**/cli.?([cm])[jt]s"]',
      );
    });

    it('only includes top-level directories in `files` when set to `true`', async () => {
      const configResult = await computeEslintConfig({cli: {onlyTopLevelDirs: true}});

      expect(configResult.getConfigByUnPostfix('cli')?.files).toMatchInlineSnapshot(
        '["bin/**/*.?([cm])[jt]s", "scripts/**/*.?([cm])[jt]s", "cli/**/*.?([cm])[jt]s", "cli.?([cm])[jt]s"]',
      );
    });

    it('includes nested directories in default `files` when set to `false`', async () => {
      const configResult = await computeEslintConfig({cli: {onlyTopLevelDirs: false}});

      expect(configResult.getConfigByUnPostfix('cli')?.files).toMatchInlineSnapshot(
        '["**/bin/**/*.?([cm])[jt]s", "**/scripts/**/*.?([cm])[jt]s", "**/cli/**/*.?([cm])[jt]s", "**/cli.?([cm])[jt]s"]',
      );
    });
  });
});

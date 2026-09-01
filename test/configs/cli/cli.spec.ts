const FIXTURES = {
  iifeAsync: 'bin/iife-async.js',
} as const;

describe('basic tests', () => {
  it('creates `cli` eslint config and loads `unicorn` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('cli');

    const config = configResult.getConfigByUnPostfix('cli');

    expect(config).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot(
      '["**/bin/**/*.?([cm])[jt]s", "**/scripts/**/*.?([cm])[jt]s", "**/cli/**/*.?([cm])[jt]s", "**/cli.?([cm])[jt]s"]',
    );
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('unicorn')).toBeDefined();
  });

  it('does not create `cli` eslint config and does not load `unicorn` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({cli: false});

    expect(configResult.getConfigByUnPostfix('cli')).toBeUndefined();
    expect(configResult.getLoadedPlugin('unicorn')).toBeUndefined();
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
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('cli');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('cli')).toMatchObject({
      'unicorn/prefer-top-level-await': 2,
      'node/hashbang': 0,
    });
  });

  it('disables the rest of the rules it is aware of by default', () => {
    expect(configResult.getRuleSeverities('cli')).toMatchObject({
      'no-await-in-loop': 0,
      'no-console': 0,
      'import/no-extraneous-dependencies': 0,
      'node/no-process-exit': 0,
      'node/no-top-level-await': 0,
      'unicorn/no-process-exit': 0,
    });
  });

  it('disables the `disable-autofix/` counterpart of a fixable disabled rule', () => {
    expect(configResult.getRuleEntrySeverity('cli', 'disable-autofix/node/hashbang')).toBe(0);
  });

  it('respects renamed plugin prefixes', async () => {
    const renamedConfigResult = await computeEslintConfig('cli', {
      un: {plugins: {node: {prefix: 'nodejs'}}},
    });

    expect(renamedConfigResult.getRuleEntrySeverity('cli', 'nodejs/hashbang')).toBe(0);
    expect(renamedConfigResult.getRuleEntry('cli', 'node/hashbang')).toBeUndefined();
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
        overridesAny: {eqeqeq: 1},
      },
    });

    expect(configResult.getRuleEntrySeverity('cli', 'unicorn/prefer-top-level-await')).toBe(0);
    expect(configResult.getRuleEntrySeverity('cli', 'eqeqeq')).toBe(1);
  });
});

describe('options', () => {
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

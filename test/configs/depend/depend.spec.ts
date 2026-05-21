const FIXTURES = {
  bannedDependency: 'banned-dependency/package.json',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('depend');

  it('loads `depend` plugin if used', () => {
    expect(configResult.getLoadedPlugin('depend')).toBeDefined();
  });

  it('creates `depend` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('depend')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `depend` eslint config', async () => {
      await expectConfigState({}, 'depend', false);
    });

    it('creates `depend` eslint config if explicitly enabled', async () => {
      await expectConfigState('depend', 'depend', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `depend` eslint config', async () => {
      await expectConfigState({}, 'depend', false, 'default');
    });

    it('creates `depend` eslint config if explicitly enabled', async () => {
      await expectConfigState('depend', 'depend', true, 'default');
    });

    it('does not create `depend` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({depend: false}, 'depend', ['depend', false], 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `depend` eslint config', async () => {
      await expectConfigState({}, 'depend', false, 'misc-enabled');
    });

    it('creates `depend` eslint config if explicitly enabled', async () => {
      await expectConfigState({depend: true}, 'depend', true, 'misc-enabled');
    });

    it('does not create `depend` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({depend: false}, 'depend', ['depend', false], 'misc-enabled');
    });
  });

  it('has default `files` in `depend` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('depend')?.files).toMatchInlineSnapshot(
      '["**/package.json"]',
    );
  });

  it('has default `ignores` in `depend` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('depend')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('depend');

  it('enables `depend/ban-dependencies` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('depend', 'depend/ban-dependencies')).toBe(2);
  });

  it('`depend/ban-dependencies` rule fires on a package.json with a banned dependency', async () => {
    const results = await testEslintConfig(
      'depend',
      FIXTURES.bannedDependency,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.bannedDependency,
      'depend/ban-dependencies',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '""lodash" should be replaced with an alternative package. Read more here: https://github.com/es-tooling/module-replacements/blob/main/docs/modules/lodash-underscore.md"',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `depend` eslint config', async () => {
      const FILES = ['packages/*/package.json'];

      const configResult = await computeEslintConfig({depend: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('depend')?.files).toStrictEqual(FILES);
    });

    it('disables `depend` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({depend: {files: []}});

      expect(configResult.getConfigByUnPostfix('depend')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `depend` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({depend: {ignores: IGNORES}});
      const ignores = configResult.getConfigByUnPostfix('depend')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `depend` eslint config', async () => {
    const configResult = await computeEslintConfig({
      depend: {overrides: {'depend/ban-dependencies': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('depend', 'depend/ban-dependencies')).toBe(0);
    expect(configResult.getRuleEntrySeverity('depend', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `options`', () => {
    it('does not pass extra options to `depend/ban-dependencies` rule by default', async () => {
      const configResult = await computeEslintConfig('depend');

      expect(configResult.getRuleEntry('depend', 'depend/ban-dependencies')).toMatchInlineSnapshot(
        '2',
      );
    });

    it('passes provided options to `depend/ban-dependencies` rule when set', async () => {
      const configResult = await computeEslintConfig({
        depend: {options: {modules: ['some-banned-module'], allowed: ['lodash']}},
      });

      expect(configResult.getRuleEntry('depend', 'depend/ban-dependencies')).toMatchInlineSnapshot(
        '[2, {"allowed": ["lodash"], "modules": ["some-banned-module"]}]',
      );
    });
  });
});

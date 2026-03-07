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
      const configResult = await computeEslintConfig({});

      expect(configResult.getConfigByUnPostfix('depend')).toBeUndefined();
    });

    it('creates `depend` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig('depend');

      expect(configResult.getConfigByUnPostfix('depend')).toBeDefined();
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `depend` eslint config', async () => {
      const configResult = await computeEslintConfig({}, {reset: true});

      expect(configResult.getConfigByUnPostfix('depend')).toBeUndefined();
    });

    it('creates `depend` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig('depend', {reset: true});

      expect(configResult.getConfigByUnPostfix('depend')).toBeDefined();
    });

    it('does not create `depend` eslint config and prints a warning if explicitly disabled', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      const configResult = await computeEslintConfig({depend: false}, {reset: true});

      expect(configResult.getConfigByUnPostfix('depend')).toBeUndefined();

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          `[warn] [eslint-config-un] There is no need to disable \`depend\` config because this is the default`,
        ),
      ).toBe(true);
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `depend` eslint config', async () => {
      const configResult = await computeEslintConfig(
        {},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(configResult.getConfigByUnPostfix('depend')).toBeUndefined();
    });
  });

  it('has default `files` in `depend` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('depend')?.files).toMatchInlineSnapshot(
      `["**/package.json"]`,
    );
  });

  it('has default `ignores` in `depend` eslint config', () => {
    const ignores = configResult.getConfigByUnPostfix('depend')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('depend');

  it('enables `depend/ban-dependencies` rule by default', () => {
    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('depend', 'depend/ban-dependencies'),
      ),
    ).toBe(2);
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
      `""lodash" should be replaced with an alternative package. Read more here: https://github.com/es-tooling/module-replacements/blob/main/docs/modules/lodash-underscore.md"`,
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

    it('disables `depend` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({depend: {files: []}});

      expect(configResult.getConfigByUnPostfix('depend')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `depend` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({depend: {ignores: IGNORES}});
      const ignores = configResult.getConfigByUnPostfix('depend')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `depend` eslint config', async () => {
    const configResult = await computeEslintConfig({
      depend: {overrides: {'depend/ban-dependencies': 0}, overridesAny: {'no-console': 0}},
    });

    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('depend', 'depend/ban-dependencies'),
      ),
    ).toBe(0);

    expect(
      getRuleSeverityFromEslintRuleEntry(configResult.getRuleEntry('depend', 'no-console')),
    ).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `depend` eslint config', async () => {
      const configResult = await computeEslintConfig({depend: {forceSeverity: 'error'}});

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('depend'), (ruleName) =>
          ruleName.startsWith('depend/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `depend` eslint config', async () => {
      const configResult = await computeEslintConfig({depend: {forceSeverity: 'warn'}});

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('depend'), (ruleName) =>
          ruleName.startsWith('depend/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('options', () => {
  describe('option: `options`', () => {
    it('does not pass extra options to `depend/ban-dependencies` rule when `options` is not set (default)', async () => {
      const configResult = await computeEslintConfig('depend');

      expect(
        JSON.stringify(configResult.getRuleEntry('depend', 'depend/ban-dependencies')),
      ).toMatchInlineSnapshot(`"[2]"`);
    });

    it('passes provided options to `depend/ban-dependencies` rule when `options` is set', async () => {
      const configResult = await computeEslintConfig({
        depend: {options: {modules: ['some-banned-module'], allowed: ['lodash']}},
      });

      expect(
        JSON.stringify(configResult.getRuleEntry('depend', 'depend/ban-dependencies')),
      ).toMatchInlineSnapshot(`"[2,{"modules":["some-banned-module"],"allowed":["lodash"]}]"`);
    });
  });
});

const FIXTURES = {
  unsafeProperty: 'unsafe-property.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('noUnsanitized');

  it('loads `no-unsanitized` plugin if used', () => {
    expect(configResult.getLoadedPlugin('no-unsanitized')).toBeDefined();
  });

  it('creates `no-unsanitized` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('no-unsanitized')).toBeDefined();
  });

  it('has no explicit `files` restriction in `no-unsanitized` eslint config by default (applies to all files)', () => {
    expect(configResult.getConfigByUnPostfix('no-unsanitized')?.files).toBeUndefined();
  });

  it('has default `ignores` in `no-unsanitized` eslint config', () => {
    const ignores = configResult.getConfigByUnPostfix('no-unsanitized')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `no-unsanitized` eslint config', async () => {
      const configResult = await computeEslintConfig({});

      expect(configResult.getConfigByUnPostfix('no-unsanitized')).toBeUndefined();
    });

    it('creates `no-unsanitized` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig('noUnsanitized');

      expect(configResult.getConfigByUnPostfix('no-unsanitized')).toBeDefined();
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `no-unsanitized` eslint config', async () => {
      const configResult = await computeEslintConfig({}, {reset: true});

      expect(configResult.getConfigByUnPostfix('no-unsanitized')).toBeDefined();
    });

    it('creates `no-unsanitized` eslint config and prints a warning if explicitly enabled', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      const configResult = await computeEslintConfig('noUnsanitized', {reset: true});

      expect(configResult.getConfigByUnPostfix('no-unsanitized')).toBeDefined();

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          `[warn] [eslint-config-un] There is no need to enable \`noUnsanitized\` config because this is the default`,
        ),
      ).toBe(true);
    });

    it('does not create `no-unsanitized` eslint config if explicitly disabled', async () => {
      const configResult = await computeEslintConfig({noUnsanitized: false}, {reset: true});

      expect(configResult.getConfigByUnPostfix('no-unsanitized')).toBeUndefined();
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `no-unsanitized` eslint config', async () => {
      const configResult = await computeEslintConfig(
        {},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(configResult.getConfigByUnPostfix('no-unsanitized')).toBeDefined();
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('noUnsanitized');

  it('enables `no-unsanitized/method` rule by default', () => {
    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('no-unsanitized', 'no-unsanitized/method'),
      ),
    ).toBe(2);
  });

  it('enables `no-unsanitized/property` rule by default', () => {
    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('no-unsanitized', 'no-unsanitized/property'),
      ),
    ).toBe(2);
  });

  it('`no-unsanitized/property` rule fires on unsafe `innerHTML` assignment', async () => {
    const results = await testEslintConfig(
      'noUnsanitized',
      FIXTURES.unsafeProperty,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.unsafeProperty,
      'no-unsanitized/property',
    );

    expect(error?.message).toMatchInlineSnapshot(`"Unsafe assignment to innerHTML"`);
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `no-unsanitized` eslint config', async () => {
      const FILES = ['src/**/*.js'];
      const configResult = await computeEslintConfig({
        noUnsanitized: {files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('no-unsanitized')?.files).toStrictEqual(FILES);
    });

    it('disables `no-unsanitized` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        noUnsanitized: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('no-unsanitized')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `no-unsanitized` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        noUnsanitized: {ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix('no-unsanitized')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `no-unsanitized` eslint config', async () => {
    const configResult = await computeEslintConfig({
      noUnsanitized: {
        overrides: {'no-unsanitized/method': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('no-unsanitized', 'no-unsanitized/method'),
      ),
    ).toBe(0);
    expect(
      getRuleSeverityFromEslintRuleEntry(configResult.getRuleEntry('no-unsanitized', 'no-console')),
    ).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `no-unsanitized` eslint config', async () => {
      const configResult = await computeEslintConfig({
        noUnsanitized: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('no-unsanitized'), (ruleName) =>
          ruleName.startsWith('no-unsanitized/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `no-unsanitized` eslint config', async () => {
      const configResult = await computeEslintConfig({
        noUnsanitized: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('no-unsanitized'), (ruleName) =>
          ruleName.startsWith('no-unsanitized/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

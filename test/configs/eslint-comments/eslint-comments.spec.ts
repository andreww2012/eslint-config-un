describe('basic tests', async () => {
  const configResult = await computeEslintConfig('eslintComments');

  it('loads `eslint-comments` plugin if used', () => {
    expect(configResult.getLoadedPlugin('eslint-comments')).toBeDefined();
  });

  it('creates `eslint-comments` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('eslint-comments')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `eslint-comments` eslint config', async () => {
      const configResult = await computeEslintConfig({});

      expect(configResult.getConfigByUnPostfix('eslint-comments')).toBeUndefined();
    });

    it('creates `eslint-comments` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig({eslintComments: true});

      expect(configResult.getConfigByUnPostfix('eslint-comments')).toBeDefined();
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `eslint-comments` eslint config by default', async () => {
      const configResult = await computeEslintConfig({}, {reset: true});

      expect(configResult.getConfigByUnPostfix('eslint-comments')).toBeDefined();
    });

    it('creates `eslint-comments` eslint config and prints a warning if explicitly enabled', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      await computeEslintConfig({eslintComments: true}, {reset: true});

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          `[warn] [eslint-config-un] There is no need to enable \`eslintComments\` config because this is the default`,
        ),
      ).toBe(true);
    });

    it('does not create `eslint-comments` eslint config if explicitly disabled', async () => {
      const configResult = await computeEslintConfig({eslintComments: false}, {reset: true});

      expect(configResult.getConfigByUnPostfix('eslint-comments')).toBeUndefined();
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `eslint-comments` eslint config', async () => {
      const configResult = await computeEslintConfig(
        {},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(configResult.getConfigByUnPostfix('eslint-comments')).toBeDefined();
    });
  });

  it('has no explicit `files` restriction in `eslint-comments` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('eslint-comments')?.files).toBeUndefined();
  });

  it('has no `ignores` in `eslint-comments` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('eslint-comments')?.ignores).toBeUndefined();
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('eslintComments');

  it('enables `eslint-comments/disable-enable-pair` rule by default', () => {
    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('eslint-comments', 'eslint-comments/disable-enable-pair'),
      ),
    ).toBe(2);
  });

  it('disables `eslint-comments/no-use` rule by default', () => {
    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('eslint-comments', 'eslint-comments/no-use'),
      ),
    ).toBe(0);
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `eslint-comments` eslint config', async () => {
      const FILES = ['src/**/*.js'];
      const configResult = await computeEslintConfig({
        eslintComments: {files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('eslint-comments')?.files).toStrictEqual(FILES);
    });

    it('disables `eslint-comments` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        eslintComments: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('eslint-comments')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `eslint-comments` eslint config', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        eslintComments: {ignores: IGNORES},
      });

      expect(configResult.getConfigByUnPostfix('eslint-comments')?.ignores).to.include.members(
        IGNORES,
      );
    });
  });

  describe('option: `overrides`', () => {
    it('respects `overrides` in `eslint-comments` eslint config', async () => {
      const configResult = await computeEslintConfig({
        eslintComments: {overrides: {'eslint-comments/disable-enable-pair': 0}},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('eslint-comments', 'eslint-comments/disable-enable-pair'),
        ),
      ).toBe(0);
    });
  });

  describe('option: `overridesAny`', () => {
    it('respects `overridesAny` in `eslint-comments` eslint config', async () => {
      const configResult = await computeEslintConfig({
        eslintComments: {overridesAny: {'no-console': 0}},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('eslint-comments', 'no-console'),
        ),
      ).toBe(0);
    });

    it('respects both `overrides` and `overridesAny`', async () => {
      const configResult = await computeEslintConfig({
        eslintComments: {
          overrides: {'eslint-comments/disable-enable-pair': 0},
          overridesAny: {'no-console': 0},
        },
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('eslint-comments', 'eslint-comments/disable-enable-pair'),
        ),
      ).toBe(0);

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('eslint-comments', 'no-console'),
        ),
      ).toBe(0);
    });

    it('puts `overridesAny` after `overrides`', async () => {
      const configResult = await computeEslintConfig({
        eslintComments: {
          overrides: {'eslint-comments/disable-enable-pair': 1},
          overridesAny: {'eslint-comments/disable-enable-pair': 2},
        },
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('eslint-comments', 'eslint-comments/disable-enable-pair'),
        ),
      ).toBe(2);
    });
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `eslint-comments` eslint config', async () => {
      const configResult = await computeEslintConfig({
        eslintComments: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('eslint-comments'), (ruleName) =>
          ruleName.startsWith('eslint-comments/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `eslint-comments` eslint config', async () => {
      const configResult = await computeEslintConfig({
        eslintComments: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('eslint-comments'), (ruleName) =>
          ruleName.startsWith('eslint-comments/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('security');

  it('loads `security` plugin if used', () => {
    expect(configResult.getLoadedPlugin('security')).toBeDefined();
  });

  it('creates `security` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('security')).toBeDefined();
  });

  it('does not create `security` eslint config when disabled', async () => {
    const configResult = await computeEslintConfig({security: false});

    expect(configResult.getConfigByUnPostfix('security')).toBeUndefined();
  });

  it('has no explicit `files` restriction in `security` eslint config by default (applies to all files)', () => {
    expect(configResult.getConfigByUnPostfix('security')?.files).toBeUndefined();
  });

  it('has default `ignores` in `security` eslint config (does not ignore HTML files)', () => {
    const ignores = configResult.getConfigByUnPostfix('security')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.to.include.members(['**/*.htm?(l)']);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('security');

  it('enables `security/detect-bidi-characters` rule by default', () => {
    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('security', 'security/detect-bidi-characters'),
      ),
    ).toBe(2);
  });

  it('disables `security/detect-non-literal-fs-filename` rule by default', () => {
    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('security', 'security/detect-non-literal-fs-filename'),
      ),
    ).toBe(0);
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `security` eslint config', async () => {
      const FILES = ['src/**/*.js'];
      const configResult = await computeEslintConfig({
        security: {files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('security')?.files).toStrictEqual(FILES);
    });

    it('disables `security` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        security: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('security')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `security` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        security: {ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix('security')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  describe('option: `overrides`', () => {
    it('respects `overrides` in `security` eslint config', async () => {
      const configResult = await computeEslintConfig({
        security: {overrides: {'security/detect-child-process': 0}},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('security', 'security/detect-child-process'),
        ),
      ).toBe(0);
    });
  });

  describe('option: `overridesAny`', () => {
    it('respects `overridesAny` in `security` eslint config', async () => {
      const configResult = await computeEslintConfig({
        security: {overridesAny: {'no-console': 0}},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(configResult.getRuleEntry('security', 'no-console')),
      ).toBe(0);
    });

    it('respects both `overrides` and `overridesAny`', async () => {
      const configResult = await computeEslintConfig({
        security: {
          overrides: {'security/detect-child-process': 0},
          overridesAny: {'no-console': 0},
        },
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('security', 'security/detect-child-process'),
        ),
      ).toBe(0);

      expect(
        getRuleSeverityFromEslintRuleEntry(configResult.getRuleEntry('security', 'no-console')),
      ).toBe(0);
    });

    it('puts `overridesAny` after `overrides`', async () => {
      const configResult = await computeEslintConfig({
        security: {
          overrides: {'security/detect-child-process': 1},
          overridesAny: {'security/detect-child-process': 2},
        },
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('security', 'security/detect-child-process'),
        ),
      ).toBe(2);
    });
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `security` eslint config', async () => {
      const configResult = await computeEslintConfig({
        security: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('security'), (ruleName) =>
          ruleName.startsWith('security/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `security` eslint config', async () => {
      const configResult = await computeEslintConfig({
        security: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('security'), (ruleName) =>
          ruleName.startsWith('security/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

const FIXTURES = {
  withSecret: 'with-secret.ts',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('noSecrets');

  it('loads `no-secrets` plugin if used', () => {
    expect(configResult.getLoadedPlugin('no-secrets')).toBeDefined();
  });

  it('creates `no-secrets` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('no-secrets')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `no-secrets` eslint config', async () => {
      const configResult = await computeEslintConfig({});

      expect(configResult.getConfigByUnPostfix('no-secrets')).toBeUndefined();
    });

    it('creates `no-secrets` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig('noSecrets');

      expect(configResult.getConfigByUnPostfix('no-secrets')).toBeDefined();
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `no-secrets` eslint config by default', async () => {
      const configResult = await computeEslintConfig({}, {reset: true});

      expect(configResult.getConfigByUnPostfix('no-secrets')).toBeDefined();
    });

    it('creates `no-secrets` eslint config and prints a warning if explicitly enabled', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      const configResult = await computeEslintConfig('noSecrets', {reset: true});

      expect(configResult.getConfigByUnPostfix('no-secrets')).toBeDefined();

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          `[warn] [eslint-config-un] There is no need to enable \`noSecrets\` config because this is the default`,
        ),
      ).toBe(true);
    });

    it('does not create `no-secrets` eslint config if explicitly disabled', async () => {
      const configResult = await computeEslintConfig({noSecrets: false}, {reset: true});

      expect(configResult.getConfigByUnPostfix('no-secrets')).toBeUndefined();
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `no-secrets` eslint config', async () => {
      const configResult = await computeEslintConfig(
        {},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(configResult.getConfigByUnPostfix('no-secrets')).toBeDefined();
    });
  });

  it('has default `files` in `no-secrets` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('no-secrets')?.files).toMatchInlineSnapshot(
      `["**/*.?([cm])[jt]s?(x)"]`,
    );
  });

  it('has default `ignores` in `no-secrets` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('no-secrets')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('noSecrets');

  it('enables `no-secrets/no-secrets` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('no-secrets', 'no-secrets/no-secrets')).toBe(2);
  });

  it('disables `no-secrets/no-pattern-match` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('no-secrets', 'no-secrets/no-pattern-match')).toBe(0);
  });

  it('`no-secrets/no-secrets` rule fires on a file with a high-entropy string', async () => {
    const results = await testEslintConfig('noSecrets', FIXTURES.withSecret, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.withSecret,
      'no-secrets/no-secrets',
    );

    expect(error?.message).toMatchInlineSnapshot(
      // eslint-disable-next-line no-secrets/no-secrets
      `"Found a string with entropy 5.11 : "WkQTUwGtlCOJXaqR34qicCxjnGEweU7v2mPUBSNA8tHZvxPZ""`,
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `no-secrets` eslint config', async () => {
      const FILES = ['src/**/*.ts'];
      const configResult = await computeEslintConfig({
        noSecrets: {files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('no-secrets')?.files).toStrictEqual(FILES);
    });

    it('disables `no-secrets` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        noSecrets: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('no-secrets')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `no-secrets` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        noSecrets: {ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix('no-secrets')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `no-secrets` eslint config', async () => {
    const configResult = await computeEslintConfig({
      noSecrets: {overrides: {'no-secrets/no-secrets': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('no-secrets', 'no-secrets/no-secrets')).toBe(0);

    expect(configResult.getRuleEntrySeverity('no-secrets', 'no-console')).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `no-secrets` eslint config', async () => {
      const configResult = await computeEslintConfig({
        noSecrets: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('no-secrets'), (ruleName) =>
          ruleName.startsWith('no-secrets/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `no-secrets` eslint config', async () => {
      const configResult = await computeEslintConfig({
        noSecrets: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('no-secrets'), (ruleName) =>
          ruleName.startsWith('no-secrets/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('options', () => {
  describe('option: `noSecretsOptions`', () => {
    it('uses default `tolerance` (4.5) when `noSecretsOptions` is not provided', async () => {
      const configResult = await computeEslintConfig('noSecrets');
      const rule = configResult.getRuleEntry('no-secrets', 'no-secrets/no-secrets');

      expect(rule).toMatchInlineSnapshot(`[2, {"tolerance": 4.5}]`);
    });

    it('uses user-provided `tolerance` in `noSecretsOptions`', async () => {
      const configResult = await computeEslintConfig({
        noSecrets: {noSecretsOptions: {tolerance: 3}},
      });
      const rule = configResult.getRuleEntry('no-secrets', 'no-secrets/no-secrets');

      expect(rule).toMatchInlineSnapshot(`[2, {"tolerance": 3}]`);
    });

    it('uses default severity (error) when `severity` is not provided in `noSecretsOptions`', async () => {
      const configResult = await computeEslintConfig('noSecrets');

      expect(configResult.getRuleEntrySeverity('no-secrets', 'no-secrets/no-secrets')).toBe(2);
    });

    it('uses user-provided `severity` in `noSecretsOptions`', async () => {
      const configResult = await computeEslintConfig({
        noSecrets: {noSecretsOptions: {severity: 'warn'}},
      });

      expect(configResult.getRuleEntrySeverity('no-secrets', 'no-secrets/no-secrets')).toBe(1);
    });
  });
});

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
      await expectConfigState({}, 'no-secrets', false);
    });

    it('creates `no-secrets` eslint config if explicitly enabled', async () => {
      await expectConfigState('noSecrets', 'no-secrets', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `no-secrets` eslint config by default', async () => {
      await expectConfigState({}, 'no-secrets', true, 'default');
    });

    it('creates `no-secrets` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('noSecrets', 'no-secrets', ['noSecrets', true], 'default');
    });

    it('does not create `no-secrets` eslint config if explicitly disabled', async () => {
      await expectConfigState({noSecrets: false}, 'no-secrets', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `no-secrets` eslint config', async () => {
      await expectConfigState({}, 'no-secrets', true, 'misc-enabled');
    });

    it('creates `no-secrets` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('noSecrets', 'no-secrets', ['noSecrets', true], 'misc-enabled');
    });

    it('does not create `no-secrets` eslint config if explicitly disabled', async () => {
      await expectConfigState({noSecrets: false}, 'no-secrets', false, 'misc-enabled');
    });
  });

  it('has default `files` in `no-secrets` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('no-secrets')?.files).toMatchInlineSnapshot(
      '["**/*.?([cm])[jt]s?(x)"]',
    );
  });

  it('has default `ignores` in `no-secrets` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('no-secrets')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('noSecrets');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('no-secrets')).toMatchObject({
      'no-secrets/no-secrets': 2,
      'no-secrets/no-pattern-match': 0,
    });
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
      '"Found a string with entropy 5.11 : "WkQTUwGtlCOJXaqR34qicCxjnGEweU7v2mPUBSNA8tHZvxPZ""',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `no-secrets` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({noSecrets: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('no-secrets')?.files).toStrictEqual(FILES);
    });

    it('disables `no-secrets` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({noSecrets: {files: []}});

      expect(configResult.getConfigByUnPostfix('no-secrets')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `no-secrets` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({noSecrets: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('no-secrets')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
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
});

describe('options', () => {
  describe('option: `noSecretsOptions`', () => {
    it('uses default `tolerance` (4.5) by default', async () => {
      const configResult = await computeEslintConfig('noSecrets');
      const rule = configResult.getRuleEntry('no-secrets', 'no-secrets/no-secrets');

      expect(rule).toMatchInlineSnapshot('[2, {"tolerance": 4.5}]');
    });

    it('uses user-provided `tolerance` in `noSecretsOptions`', async () => {
      const configResult = await computeEslintConfig({
        noSecrets: {noSecretsOptions: {tolerance: 3}},
      });
      const rule = configResult.getRuleEntry('no-secrets', 'no-secrets/no-secrets');

      expect(rule).toMatchInlineSnapshot('[2, {"tolerance": 3}]');
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

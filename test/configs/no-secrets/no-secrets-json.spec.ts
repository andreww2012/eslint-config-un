const FIXTURES = {
  withSecret: 'with-secret.json',
} as const;

describe('no-secrets: sub config `json`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig('noSecrets');

    it('creates `no-secrets/json` eslint config when enabled (default)', () => {
      expect(configResult.getConfigByUnPostfix('no-secrets/json')).toBeDefined();
    });

    it('does not create `no-secrets/json` eslint config when disabled', async () => {
      const configResult = await computeEslintConfig({
        noSecrets: {configJson: false},
      });

      expect(configResult.getConfigByUnPostfix('no-secrets/json')).toBeUndefined();
    });

    it('creates `no-secrets/json` eslint config with default JSON files', () => {
      expect(configResult.getConfigByUnPostfix('no-secrets/json')?.files).toMatchInlineSnapshot(
        '["**/*.json"]',
      );
    });

    it('has default `ignores` in `no-secrets/json` eslint config that always includes `**/package-lock.json`', () => {
      const ignores = configResult.getConfigByUnPostfix('no-secrets/json')?.ignores;

      expect(ignores).toIncludeAllMembers(['**/package-lock.json']);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('noSecrets');

    it('enables `no-secrets/no-secrets` rule by default', () => {
      expect(configResult.getRuleEntrySeverity('no-secrets/json', 'no-secrets/no-secrets')).toBe(2);
    });

    it('`no-secrets/no-secrets` rule fires on a JSON file with a high-entropy string', async () => {
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
      it('uses user-provided `files` in `no-secrets/json` eslint config', async () => {
        const FILES = ['**/*.json'];

        const configResult = await computeEslintConfig({
          noSecrets: {configJson: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('no-secrets/json')?.files).toStrictEqual(FILES);
      });

      it('disables `no-secrets/json` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          noSecrets: {configJson: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('no-secrets/json')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `no-secrets/json` eslint config and always includes `**/package-lock.json`', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          noSecrets: {configJson: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('no-secrets/json')?.ignores;

        expect(ignores).toIncludeAllMembers([...IGNORES, '**/package-lock.json']);
      });
    });

    it('respects `overrides` and `overridesAny` in `no-secrets/json` eslint config', async () => {
      const configResult = await computeEslintConfig({
        noSecrets: {
          configJson: {overrides: {'no-secrets/no-secrets': 0}, overridesAny: {'no-console': 0}},
        },
      });

      expect(configResult.getRuleEntrySeverity('no-secrets/json', 'no-secrets/no-secrets')).toBe(0);
      expect(configResult.getRuleEntrySeverity('no-secrets/json', 'no-console')).toBe(0);
    });
  });
});

const FIXTURES = {
  invalidJson: 'invalid.json',
} as const;

describe('json-schema-validator: sub-config `configJson`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig('jsonSchemaValidator');

    it('creates `json-schema-validator/json` eslint config when enabled (default)', () => {
      expect(configResult.getConfigByUnPostfix('json-schema-validator/json')).toBeDefined();
    });

    it('does not create `json-schema-validator/json` eslint config when disabled', async () => {
      const configResult = await computeEslintConfig({
        jsonSchemaValidator: {configJson: false},
      });

      expect(configResult.getConfigByUnPostfix('json-schema-validator/json')).toBeUndefined();
    });

    it('has default `files` in `json-schema-validator/json` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('json-schema-validator/json')?.files,
      ).toMatchInlineSnapshot(`["**/*.json", "**/*.jsonc", "**/*.json5"]`);
    });

    it('has default `ignores` in `json-schema-validator/json` eslint config', () => {
      const ignores = configResult.getConfigByUnPostfix('json-schema-validator/json')?.ignores;

      expect(ignores?.length).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('jsonSchemaValidator');

    it('enables `json-schema-validator/no-invalid` rule by default in `json-schema-validator/json`', () => {
      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry(
            'json-schema-validator/json',
            'json-schema-validator/no-invalid',
          ),
        ),
      ).toBe(2);
    });

    it('`json-schema-validator/no-invalid` rule fires on a JSON file with a local-schema violation', async () => {
      const results = await testEslintConfig(
        'jsonSchemaValidator',
        FIXTURES.invalidJson,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.invalidJson,
        'json-schema-validator/no-invalid',
      );

      expect(error?.message).toMatchInlineSnapshot(`"Root must have required property 'name'."`);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `json-schema-validator/json` eslint config', async () => {
        const FILES = ['src/**/*.json'];
        const configResult = await computeEslintConfig({
          jsonSchemaValidator: {configJson: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('json-schema-validator/json')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `json-schema-validator/json` eslint config when `files` is empty array', async () => {
        const configResult = await computeEslintConfig({
          jsonSchemaValidator: {configJson: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('json-schema-validator/json')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `json-schema-validator/json` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];
        const configResult = await computeEslintConfig({
          jsonSchemaValidator: {configJson: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('json-schema-validator/json')?.ignores;

        expect(ignores).to.include.members(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `json-schema-validator/json` eslint config', async () => {
      const configResult = await computeEslintConfig({
        jsonSchemaValidator: {
          configJson: {
            overrides: {'json-schema-validator/no-invalid': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry(
            'json-schema-validator/json',
            'json-schema-validator/no-invalid',
          ),
        ),
      ).toBe(0);

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('json-schema-validator/json', 'no-console'),
        ),
      ).toBe(0);
    });

    describe('option: `forceSeverity`', () => {
      it('respects `forceSeverity` set to `error` in `json-schema-validator/json` eslint config', async () => {
        const configResult = await computeEslintConfig({
          jsonSchemaValidator: {configJson: {forceSeverity: 'error'}},
        });

        expect(
          getAllRulesSeverities(
            configResult.getConfigByUnPostfix('json-schema-validator/json'),
            (ruleName) => ruleName.startsWith('json-schema-validator/'),
          ),
        ).toStrictEqual([2]);
      });

      it('respects `forceSeverity` set to `warn` in `json-schema-validator/json` eslint config', async () => {
        const configResult = await computeEslintConfig({
          jsonSchemaValidator: {configJson: {forceSeverity: 'warn'}},
        });

        expect(
          getAllRulesSeverities(
            configResult.getConfigByUnPostfix('json-schema-validator/json'),
            (ruleName) => ruleName.startsWith('json-schema-validator/'),
          ),
        ).toStrictEqual([1]);
      });
    });
  });
});

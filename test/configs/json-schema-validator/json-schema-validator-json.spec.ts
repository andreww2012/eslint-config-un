const FIXTURES = {
  objectWithoutName: 'object-without-name.json',
} as const;

describe('json-schema-validator: sub config `json`', () => {
  describe('basic tests', () => {
    it('creates `json-schema-validator/json` eslint config when enabled (default)', async () => {
      const configResult = await computeEslintConfig('jsonSchemaValidator');

      const config = configResult.getConfigByUnPostfix('json-schema-validator/json');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.json", "**/*.jsonc", "**/*.json5"]');
      expect(config?.ignores?.length).toBeGreaterThan(0);
    });

    it('does not create `json-schema-validator/json` eslint config when disabled', async () => {
      const configResult = await computeEslintConfig({
        jsonSchemaValidator: {configJson: false},
      });

      expect(configResult.getConfigByUnPostfix('json-schema-validator/json')).toBeUndefined();
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('jsonSchemaValidator');

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('json-schema-validator/json')).toMatchObject({
        'json-schema-validator/no-invalid': 2,
      });
    });

    it('`json-schema-validator/no-invalid` rule fires on a JSON file with a local-schema violation', async () => {
      const results = await testEslintConfig(
        'jsonSchemaValidator',
        FIXTURES.objectWithoutName,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.objectWithoutName,
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

      it('disables `json-schema-validator/json` eslint config when set to empty array', async () => {
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

        expect(ignores).toIncludeAllMembers(IGNORES);
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
        configResult.getRuleEntrySeverity(
          'json-schema-validator/json',
          'json-schema-validator/no-invalid',
        ),
      ).toBe(0);
      expect(configResult.getRuleEntrySeverity('json-schema-validator/json', 'no-console')).toBe(0);
    });
  });
});

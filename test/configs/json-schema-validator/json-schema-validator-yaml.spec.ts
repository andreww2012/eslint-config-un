import {GLOB_YML_YAML, GLOB_YML, GLOB_YAML} from '../../../src/constants';

const FIXTURES = {
  invalidYaml: 'invalid.yaml',
} as const;

describe('json-schema-validator: sub-config `configYaml`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig('jsonSchemaValidator');

    it('creates `json-schema-validator/yaml` eslint config when enabled (default)', () => {
      expect(configResult.getConfigByUnPostfix('json-schema-validator/yaml')).toBeDefined();
    });

    it('does not create `json-schema-validator/yaml` eslint config when disabled', async () => {
      const configResult = await computeEslintConfig({
        jsonSchemaValidator: {configYaml: false},
      });

      expect(configResult.getConfigByUnPostfix('json-schema-validator/yaml')).toBeUndefined();
    });

    it('has default `files` in `json-schema-validator/yaml` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('json-schema-validator/yaml')?.files,
      ).toMatchInlineSnapshot(`["**/*.y?(a)ml"]`);
    });

    it('has default `ignores` in `json-schema-validator/yaml` eslint config', () => {
      const ignores = configResult.getConfigByUnPostfix('json-schema-validator/yaml')?.ignores;

      expect(ignores?.length).toBeGreaterThan(0);
      expect(ignores).not.to.include.members([GLOB_YML_YAML, GLOB_YML, GLOB_YAML]);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('jsonSchemaValidator');

    it('enables `json-schema-validator/no-invalid` rule by default in `json-schema-validator/yaml`', () => {
      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry(
            'json-schema-validator/yaml',
            'json-schema-validator/no-invalid',
          ),
        ),
      ).toBe(2);
    });

    it('`json-schema-validator/no-invalid` rule fires on a YAML file with a local-schema violation', async () => {
      const results = await testEslintConfig(
        'jsonSchemaValidator',
        FIXTURES.invalidYaml,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.invalidYaml,
        'json-schema-validator/no-invalid',
      );

      expect(error?.message).toMatchInlineSnapshot(`"Root must have required property 'name'."`);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `json-schema-validator/yaml` eslint config', async () => {
        const FILES = ['src/**/*.yaml'];
        const configResult = await computeEslintConfig({
          jsonSchemaValidator: {configYaml: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('json-schema-validator/yaml')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `json-schema-validator/yaml` eslint config when `files` is empty array', async () => {
        const configResult = await computeEslintConfig({
          jsonSchemaValidator: {configYaml: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('json-schema-validator/yaml')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `json-schema-validator/yaml` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];
        const configResult = await computeEslintConfig({
          jsonSchemaValidator: {configYaml: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('json-schema-validator/yaml')?.ignores;

        expect(ignores).to.include.members(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `json-schema-validator/yaml` eslint config', async () => {
      const configResult = await computeEslintConfig({
        jsonSchemaValidator: {
          configYaml: {
            overrides: {'json-schema-validator/no-invalid': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry(
            'json-schema-validator/yaml',
            'json-schema-validator/no-invalid',
          ),
        ),
      ).toBe(0);

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('json-schema-validator/yaml', 'no-console'),
        ),
      ).toBe(0);
    });

    describe('option: `forceSeverity`', () => {
      it('respects `forceSeverity` set to `error` in `json-schema-validator/yaml` eslint config', async () => {
        const configResult = await computeEslintConfig({
          jsonSchemaValidator: {configYaml: {forceSeverity: 'error'}},
        });

        expect(
          getAllRulesSeverities(
            configResult.getConfigByUnPostfix('json-schema-validator/yaml'),
            (ruleName) => ruleName.startsWith('json-schema-validator/'),
          ),
        ).toStrictEqual([2]);
      });

      it('respects `forceSeverity` set to `warn` in `json-schema-validator/yaml` eslint config', async () => {
        const configResult = await computeEslintConfig({
          jsonSchemaValidator: {configYaml: {forceSeverity: 'warn'}},
        });

        expect(
          getAllRulesSeverities(
            configResult.getConfigByUnPostfix('json-schema-validator/yaml'),
            (ruleName) => ruleName.startsWith('json-schema-validator/'),
          ),
        ).toStrictEqual([1]);
      });
    });
  });
});

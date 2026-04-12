import {GLOB_TOML} from '../../../src/constants';

const FIXTURES = {
  invalidToml: 'invalid.toml',
} as const;

describe('json-schema-validator: sub-config `configToml`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig('jsonSchemaValidator');

    it('creates `json-schema-validator/toml` eslint config when enabled (default)', () => {
      expect(configResult.getConfigByUnPostfix('json-schema-validator/toml')).toBeDefined();
    });

    it('does not create `json-schema-validator/toml` eslint config when disabled', async () => {
      const configResult = await computeEslintConfig({
        jsonSchemaValidator: {configToml: false},
      });

      expect(configResult.getConfigByUnPostfix('json-schema-validator/toml')).toBeUndefined();
    });

    it('has default `files` in `json-schema-validator/toml` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('json-schema-validator/toml')?.files,
      ).toMatchInlineSnapshot('["**/*.toml"]');
    });

    it('has default `ignores` in `json-schema-validator/toml` eslint config', () => {
      const ignores = configResult.getConfigByUnPostfix('json-schema-validator/toml')?.ignores;

      expect(ignores?.length).toBeGreaterThan(0);
      expect(ignores).not.toIncludeAnyMembers([GLOB_TOML]);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('jsonSchemaValidator');

    it('enables `json-schema-validator/no-invalid` rule by default in `json-schema-validator/toml`', () => {
      expect(
        configResult.getRuleEntrySeverity(
          'json-schema-validator/toml',
          'json-schema-validator/no-invalid',
        ),
      ).toBe(2);
    });

    it('`json-schema-validator/no-invalid` rule fires on a TOML file with a local-schema violation', async () => {
      const results = await testEslintConfig(
        'jsonSchemaValidator',
        FIXTURES.invalidToml,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.invalidToml,
        'json-schema-validator/no-invalid',
      );

      expect(error?.message).toMatchInlineSnapshot(`"Root must have required property 'name'."`);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `json-schema-validator/toml` eslint config', async () => {
        const FILES = ['src/**/*.toml'];

        const configResult = await computeEslintConfig({
          jsonSchemaValidator: {configToml: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('json-schema-validator/toml')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `json-schema-validator/toml` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          jsonSchemaValidator: {configToml: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('json-schema-validator/toml')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `json-schema-validator/toml` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          jsonSchemaValidator: {configToml: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('json-schema-validator/toml')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `json-schema-validator/toml` eslint config', async () => {
      const configResult = await computeEslintConfig({
        jsonSchemaValidator: {
          configToml: {
            overrides: {'json-schema-validator/no-invalid': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(
        configResult.getRuleEntrySeverity(
          'json-schema-validator/toml',
          'json-schema-validator/no-invalid',
        ),
      ).toBe(0);
      expect(configResult.getRuleEntrySeverity('json-schema-validator/toml', 'no-console')).toBe(0);
    });
  });
});

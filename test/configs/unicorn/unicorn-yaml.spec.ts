import {GLOB_YML_YAML} from '../../../src/constants';

const FIXTURES = {
  stringWithLowercaseEscape: 'string-with-lowercase-escape.yaml',
} as const;

describe('unicorn: sub config `yaml`', () => {
  describe('basic tests', () => {
    it('does not create `unicorn/yaml` eslint config when the `yaml` config is disabled', async () => {
      const configResult = await computeEslintConfig('unicorn');

      expect(configResult.getConfigByUnPostfix('unicorn/yaml')).toBeUndefined();
    });

    it('creates `unicorn/yaml` eslint config when the `yaml` config is enabled', async () => {
      const configResult = await computeEslintConfig({unicorn: true, yaml: true});

      const config = configResult.getConfigByUnPostfix('unicorn/yaml');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.y?(a)ml"]');
      expect(config?.ignores).not.toIncludeAnyMembers([GLOB_YML_YAML]);
    });

    it('does not create `unicorn/yaml` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({unicorn: {configYaml: false}, yaml: true});

      expect(configResult.getConfigByUnPostfix('unicorn/yaml')).toBeUndefined();
    });

    it('creates `unicorn/yaml` eslint config when set to `true`', async () => {
      const configResult = await computeEslintConfig({unicorn: {configYaml: true}});

      expect(configResult.getConfigByUnPostfix('unicorn/yaml')).toBeDefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig({unicorn: true, yaml: true});

      expect(configResult.getRuleSeverities('unicorn/yaml')).toMatchObject({
        'unicorn/escape-case': 2,
        'unicorn/no-zero-fractions': 0,
      });
    });

    it('`unicorn/escape-case` rule fires on a YAML file with a lowercase escape sequence', async () => {
      const results = await testEslintConfig(
        {unicorn: true, yaml: true},
        FIXTURES.stringWithLowercaseEscape,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.stringWithLowercaseEscape,
        'unicorn/escape-case',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"Use uppercase characters for the value of the escape sequence."',
      );
    });

    it('does not apply the JS-only `unicorn` rules to YAML files', async () => {
      const configResult = await computeEslintConfig({unicorn: true, yaml: true});

      expect(configResult.getRuleEntry('unicorn/yaml', 'unicorn/no-lonely-if')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('unicorn')?.ignores).toIncludeAllMembers([
        GLOB_YML_YAML,
      ]);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `unicorn/yaml` eslint config', async () => {
        const FILES = ['config/**/*.yaml'] as const;

        const configResult = await computeEslintConfig({
          unicorn: {configYaml: {files: FILES}},
          yaml: true,
        });

        expect(configResult.getConfigByUnPostfix('unicorn/yaml')?.files).toStrictEqual(FILES);
      });

      it('disables `unicorn/yaml` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          unicorn: {configYaml: {files: []}},
          yaml: true,
        });

        expect(configResult.getConfigByUnPostfix('unicorn/yaml')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `unicorn/yaml` eslint config and merges them with the implicit defaults', async () => {
        const IGNORES = ['**/vendor/**'] as const;

        const configResult = await computeEslintConfig({
          unicorn: {configYaml: {ignores: IGNORES}},
          yaml: true,
        });

        const ignores = configResult.getConfigByUnPostfix('unicorn/yaml')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `unicorn/yaml` eslint config', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {
          configYaml: {
            overrides: {'unicorn/expiring-todo-comments': 0},
            overridesAny: {'no-console': 0},
          },
        },
        yaml: true,
      });

      expect(configResult.getRuleSeverities('unicorn/yaml')).toMatchObject({
        'unicorn/expiring-todo-comments': 0,
        'no-console': 0,
      });
    });
  });
});

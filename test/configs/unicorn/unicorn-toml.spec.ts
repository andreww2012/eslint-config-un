import {GLOB_TOML} from '../../../src/constants';

const FIXTURES = {
  floatWithZeroFraction: 'float-with-zero-fraction.toml',
} as const;

describe('unicorn: sub config `toml`', () => {
  describe('basic tests', () => {
    it('does not create `unicorn/toml` eslint config when the `toml` config is disabled', async () => {
      const configResult = await computeEslintConfig('unicorn');

      expect(configResult.getConfigByUnPostfix('unicorn/toml')).toBeUndefined();
    });

    it('creates `unicorn/toml` eslint config when the `toml` config is enabled', async () => {
      const configResult = await computeEslintConfig({unicorn: true, toml: true});

      const config = configResult.getConfigByUnPostfix('unicorn/toml');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.toml"]');
      expect(config?.ignores).not.toIncludeAnyMembers([GLOB_TOML]);
    });

    it('does not create `unicorn/toml` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({unicorn: {configToml: false}, toml: true});

      expect(configResult.getConfigByUnPostfix('unicorn/toml')).toBeUndefined();
    });

    it('creates `unicorn/toml` eslint config when set to `true`', async () => {
      const configResult = await computeEslintConfig({unicorn: {configToml: true}});

      expect(configResult.getConfigByUnPostfix('unicorn/toml')).toBeDefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig({unicorn: true, toml: true});

      expect(configResult.getRuleSeverities('unicorn/toml')).toMatchObject({
        'unicorn/no-zero-fractions': 2,
        'unicorn/string-content': 0,
      });
    });

    it('`unicorn/no-zero-fractions` rule fires on a TOML file with a float ending in zero', async () => {
      const results = await testEslintConfig(
        {unicorn: true, toml: true},
        FIXTURES.floatWithZeroFraction,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.floatWithZeroFraction,
        'unicorn/no-zero-fractions',
      );

      expect(error?.message).toMatchInlineSnapshot(`"Don't use a zero fraction in the number."`);
    });

    it('does not apply the JS-only `unicorn` rules to TOML files', async () => {
      const configResult = await computeEslintConfig({unicorn: true, toml: true});

      expect(configResult.getRuleEntry('unicorn/toml', 'unicorn/no-lonely-if')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('unicorn')?.ignores).toIncludeAllMembers([
        GLOB_TOML,
      ]);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `unicorn/toml` eslint config', async () => {
        const FILES = ['config/**/*.toml'] as const;

        const configResult = await computeEslintConfig({
          unicorn: {configToml: {files: FILES}},
          toml: true,
        });

        expect(configResult.getConfigByUnPostfix('unicorn/toml')?.files).toStrictEqual(FILES);
      });

      it('disables `unicorn/toml` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          unicorn: {configToml: {files: []}},
          toml: true,
        });

        expect(configResult.getConfigByUnPostfix('unicorn/toml')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `unicorn/toml` eslint config and merges them with the implicit defaults', async () => {
        const IGNORES = ['**/vendor/**'] as const;

        const configResult = await computeEslintConfig({
          unicorn: {configToml: {ignores: IGNORES}},
          toml: true,
        });

        const ignores = configResult.getConfigByUnPostfix('unicorn/toml')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `unicorn/toml` eslint config', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {
          configToml: {
            overrides: {'unicorn/escape-case': 0},
            overridesAny: {'no-console': 0},
          },
        },
        toml: true,
      });

      expect(configResult.getRuleSeverities('unicorn/toml')).toMatchObject({
        'unicorn/escape-case': 0,
        'no-console': 0,
      });
    });
  });
});

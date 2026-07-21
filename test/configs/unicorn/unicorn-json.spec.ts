import {GLOB_JSON, GLOB_JSON5, GLOB_JSONC} from '../../../src/constants';

const FIXTURES = {
  objectWithTodoComment: 'object-with-todo-comment.jsonc',
} as const;

describe('unicorn: sub config `json`', () => {
  describe('basic tests', () => {
    it('does not create `unicorn/json` eslint config when both the `json` and the `jsonc` configs are disabled', async () => {
      const configResult = await computeEslintConfig('unicorn');

      expect(configResult.getConfigByUnPostfix('unicorn/json')).toBeUndefined();
    });

    it.each(['json', 'jsonc'] as const)(
      'creates `unicorn/json` eslint config when the `%s` config is enabled',
      async (configName) => {
        const configResult = await computeEslintConfig({unicorn: true, [configName]: true});

        const config = configResult.getConfigByUnPostfix('unicorn/json');

        expect(config).toBeDefined();
        expect(config?.files).toMatchInlineSnapshot('["**/*.json", "**/*.jsonc", "**/*.json5"]');
        expect(config?.ignores).not.toIncludeAnyMembers([GLOB_JSON, GLOB_JSONC, GLOB_JSON5]);
      },
    );

    it('does not create `unicorn/json` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({unicorn: {configJson: false}, json: true});

      expect(configResult.getConfigByUnPostfix('unicorn/json')).toBeUndefined();
    });

    it('creates `unicorn/json` eslint config when set to `true`', async () => {
      const configResult = await computeEslintConfig({unicorn: {configJson: true}});

      expect(configResult.getConfigByUnPostfix('unicorn/json')).toBeDefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig({unicorn: true, json: true});

      expect(configResult.getRuleSeverities('unicorn/json')).toMatchObject({
        'unicorn/no-empty-file': 2,
        'unicorn/no-manually-wrapped-comments': 0,
      });
    });

    it('`unicorn/expiring-todo-comments` rule fires on a JSONC file with a TODO comment', async () => {
      const results = await testEslintConfig(
        {
          unicorn: {
            configJson: {
              overrides: {'unicorn/expiring-todo-comments': [2, {allowWarningComments: false}]},
            },
          },
          json: true,
        },
        FIXTURES.objectWithTodoComment,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.objectWithTodoComment,
        'unicorn/expiring-todo-comments',
      );

      expect(error?.message).toMatchInlineSnapshot(`"Unexpected 'todo': 'TODO: rename me'."`);
    });

    it('does not apply the JS-only `unicorn` rules to JSON files', async () => {
      const configResult = await computeEslintConfig({unicorn: true, json: true});

      expect(configResult.getRuleEntry('unicorn/json', 'unicorn/no-lonely-if')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('unicorn')?.ignores).toIncludeAllMembers([
        GLOB_JSON,
        GLOB_JSONC,
        GLOB_JSON5,
      ]);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `unicorn/json` eslint config', async () => {
        const FILES = ['src/**/*.json'];

        const configResult = await computeEslintConfig({
          unicorn: {configJson: {files: FILES}},
          json: true,
        });

        expect(configResult.getConfigByUnPostfix('unicorn/json')?.files).toStrictEqual(FILES);
      });

      it('disables `unicorn/json` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          unicorn: {configJson: {files: []}},
          json: true,
        });

        expect(configResult.getConfigByUnPostfix('unicorn/json')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `unicorn/json` eslint config and merges them with the implicit defaults', async () => {
        const IGNORES = ['**/vendor/**'];

        const configResult = await computeEslintConfig({
          unicorn: {configJson: {ignores: IGNORES}},
          json: true,
        });

        const ignores = configResult.getConfigByUnPostfix('unicorn/json')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `unicorn/json` eslint config', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {
          configJson: {
            overrides: {'unicorn/no-empty-file': 0},
            overridesAny: {'no-console': 0},
          },
        },
        json: true,
      });

      expect(configResult.getRuleSeverities('unicorn/json')).toMatchObject({
        'unicorn/no-empty-file': 0,
        'no-console': 0,
      });
    });
  });
});

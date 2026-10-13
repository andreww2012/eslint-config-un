import {GLOB_SOML} from '../../../src/constants';

const FIXTURES = {
  keyWithTodoComment: 'key-with-todo-comment.soml',
} as const;

describe('unicorn: sub config `soml`', () => {
  describe('basic tests', () => {
    it('does not create `unicorn/soml` eslint config when the `soml` config is disabled', async () => {
      const configResult = await computeEslintConfig('unicorn');

      expect(configResult.getConfigByUnPostfix('unicorn/soml')).toBeUndefined();
    });

    it('creates `unicorn/soml` eslint config when the `soml` config is enabled', async () => {
      const configResult = await computeEslintConfig({unicorn: true, soml: true});

      const config = configResult.getConfigByUnPostfix('unicorn/soml');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.soml"]');
      expect(config?.ignores).not.toIncludeAnyMembers([GLOB_SOML]);
    });

    it('does not create `unicorn/soml` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({unicorn: {configSoml: false}, soml: true});

      expect(configResult.getConfigByUnPostfix('unicorn/soml')).toBeUndefined();
    });

    it('creates `unicorn/soml` eslint config when set to `true`', async () => {
      const configResult = await computeEslintConfig({unicorn: {configSoml: true}});

      expect(configResult.getConfigByUnPostfix('unicorn/soml')).toBeDefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig({unicorn: true, soml: true});

      expect(configResult.getRuleSeverities('unicorn/soml')).toMatchObject({
        'unicorn/expiring-todo-comments': 2,
        'unicorn/numeric-separators-style': 0,
      });
    });

    it('`unicorn/expiring-todo-comments` rule fires on a SOML file with a TODO comment', async () => {
      const results = await testEslintConfig(
        {
          unicorn: {
            configSoml: {
              overrides: {'unicorn/expiring-todo-comments': [2, {allowWarningComments: false}]},
            },
          },
          soml: true,
        },
        FIXTURES.keyWithTodoComment,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.keyWithTodoComment,
        'unicorn/expiring-todo-comments',
      );

      expect(error?.message).toMatchInlineSnapshot(`"Unexpected 'todo': 'TODO: rename me'."`);
    });

    it('does not apply the JS-only `unicorn` rules to SOML files', async () => {
      const configResult = await computeEslintConfig({unicorn: true, soml: true});

      expect(configResult.getRuleEntry('unicorn/soml', 'unicorn/no-lonely-if')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('unicorn')?.ignores).toIncludeAllMembers([
        GLOB_SOML,
      ]);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `unicorn/soml` eslint config', async () => {
        const FILES = ['config/**/*.soml'] as const;

        const configResult = await computeEslintConfig({
          unicorn: {configSoml: {files: FILES}},
          soml: true,
        });

        expect(configResult.getConfigByUnPostfix('unicorn/soml')?.files).toStrictEqual(FILES);
      });

      it('disables `unicorn/soml` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          unicorn: {configSoml: {files: []}},
          soml: true,
        });

        expect(configResult.getConfigByUnPostfix('unicorn/soml')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `unicorn/soml` eslint config and merges them with the implicit defaults', async () => {
        const IGNORES = ['**/vendor/**'] as const;

        const configResult = await computeEslintConfig({
          unicorn: {configSoml: {ignores: IGNORES}},
          soml: true,
        });

        const ignores = configResult.getConfigByUnPostfix('unicorn/soml')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `unicorn/soml` eslint config', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {
          configSoml: {
            overrides: {'unicorn/escape-case': 0},
            overridesAny: {'no-console': 0},
          },
        },
        soml: true,
      });

      expect(configResult.getRuleSeverities('unicorn/soml')).toMatchObject({
        'unicorn/escape-case': 0,
        'no-console': 0,
      });
    });
  });
});

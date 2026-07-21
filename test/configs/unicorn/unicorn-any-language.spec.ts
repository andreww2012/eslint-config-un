const FIXTURES = {
  eslintDisableCommentWithoutRules: 'eslint-disable-comment-without-rules.js',
} as const;

describe('unicorn: sub config `anyLanguage`', () => {
  describe('basic tests', () => {
    it('creates `unicorn/any-language` eslint config by default', async () => {
      const configResult = await computeEslintConfig('unicorn');

      const config = configResult.getConfigByUnPostfix('unicorn/any-language');

      expect(config).toBeDefined();

      expect(config?.files).toBeUndefined();
      expect(config?.ignores).toBeUndefined();
    });

    it('does not create `unicorn/any-language` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({unicorn: {configAnyLanguage: false}});

      expect(configResult.getConfigByUnPostfix('unicorn/any-language')).toBeUndefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig('unicorn');

      expect(configResult.getRuleSeverities('unicorn/any-language')).toMatchObject({
        'unicorn/no-abusive-eslint-disable': 2,
        'unicorn/prefer-https': 0,
      });
    });

    it('does not declare its rules in the main `unicorn` eslint config', async () => {
      const configResult = await computeEslintConfig('unicorn');

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/no-abusive-eslint-disable'),
      ).toBeUndefined();
    });

    it('`unicorn/no-abusive-eslint-disable` rule fires on a disable comment without rule names', async () => {
      const results = await testEslintConfig(
        'unicorn',
        FIXTURES.eslintDisableCommentWithoutRules,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.eslintDisableCommentWithoutRules,
        'unicorn/no-abusive-eslint-disable',
      );

      expect(error?.message).toMatchInlineSnapshot('"Specify the rules you want to disable."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `unicorn/any-language` eslint config', async () => {
        const FILES = ['src/**/*.js'];

        const configResult = await computeEslintConfig({
          unicorn: {configAnyLanguage: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('unicorn/any-language')?.files).toStrictEqual(
          FILES,
        );
      });

      it('disables `unicorn/any-language` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({unicorn: {configAnyLanguage: {files: []}}});

        expect(configResult.getConfigByUnPostfix('unicorn/any-language')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `unicorn/any-language` eslint config', async () => {
        const IGNORES = ['**/vendor/**'];

        const configResult = await computeEslintConfig({
          unicorn: {configAnyLanguage: {ignores: IGNORES}},
        });

        // This config implicitly ignores nothing, so the user-provided ignores are all there is
        expect(configResult.getConfigByUnPostfix('unicorn/any-language')?.ignores).toStrictEqual(
          IGNORES,
        );
      });
    });

    it('respects `overrides` and `overridesAny` in `unicorn/any-language` eslint config', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {
          configAnyLanguage: {
            overrides: {'unicorn/no-abusive-eslint-disable': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('unicorn/any-language')).toMatchObject({
        'unicorn/no-abusive-eslint-disable': 0,
        'no-console': 0,
      });
    });
  });
});

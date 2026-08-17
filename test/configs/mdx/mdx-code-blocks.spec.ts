const FIXTURES = {
  codeBlockWithConsoleCall: 'code-block-with-console-call.mdx',
} as const;

describe('mdx: sub config `codeBlocks`', () => {
  describe('basic tests', () => {
    it('creates `mdx/code-blocks` eslint config by default', async () => {
      const configResult = await computeEslintConfig('mdx');

      const config = configResult.getConfigByUnPostfix('mdx/code-blocks');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot(
        '["**/*.mdx/**/*.{?([cm])[jt]s?(x),vue,json,jsonc,json5,y?(a)ml,toml,htm?(l),css,astro,svelte,graphql,gql,gjs,gts}"]',
      );
      expect(config?.ignores).toBeUndefined();
    });

    it('does not create `mdx/code-blocks` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({mdx: {configCodeBlocks: false}});

      expect(configResult.getConfigByUnPostfix('mdx/code-blocks')).toBeUndefined();
    });

    it('creates `mdx/code-blocks` eslint config when set to `true`', async () => {
      const configResult = await computeEslintConfig({mdx: {configCodeBlocks: true}});

      expect(configResult.getConfigByUnPostfix('mdx/code-blocks')).toBeDefined();
    });

    it('creates `mdx/code-blocks` eslint config when set to an object', async () => {
      const configResult = await computeEslintConfig({mdx: {configCodeBlocks: {}}});

      expect(configResult.getConfigByUnPostfix('mdx/code-blocks')).toBeDefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig('mdx');

      expect(configResult.getRuleSeverities('mdx/code-blocks')).toMatchObject({
        'no-console': 0,
        'prefer-const': 0,
      });
    });

    it('`no-console` rule fires inside a fenced code block when re-enabled via `overrides`', async () => {
      const results = await testEslintConfig(
        {mdx: {configCodeBlocks: {overrides: {'no-console': 2}}}},
        FIXTURES.codeBlockWithConsoleCall,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.codeBlockWithConsoleCall,
        'no-console',
      );

      expect(error?.message).toMatchInlineSnapshot('"Unexpected console statement."');
    });
  });

  // `no-console` is enabled by a raw extra config here, which wins over the `mdx/code-blocks`
  // config disabling it, so what is asserted is purely whether the code block was extracted
  describe('code blocks extraction', () => {
    const EXTRA_CONFIGS = [{name: 'test', rules: {'no-console': 2}}] as const;

    it('extracts fenced code blocks by default', async () => {
      const results = await testEslintConfig('mdx', FIXTURES.codeBlockWithConsoleCall, {
        searchFixturesRelativeToPath: import.meta.dirname,
        un: {extraConfigs: [...EXTRA_CONFIGS]},
      });

      expect(
        findLintMessageFromLintResults(results, FIXTURES.codeBlockWithConsoleCall, 'no-console'),
      ).toBeDefined();
    });

    it('does not extract fenced code blocks when set to `false`', async () => {
      const results = await testEslintConfig(
        {mdx: {configCodeBlocks: false}},
        FIXTURES.codeBlockWithConsoleCall,
        {
          searchFixturesRelativeToPath: import.meta.dirname,
          un: {extraConfigs: [...EXTRA_CONFIGS]},
        },
      );

      expect(
        findLintMessageFromLintResults(results, FIXTURES.codeBlockWithConsoleCall, 'no-console'),
      ).toBeUndefined();
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `mdx/setup/code-blocks-processor` eslint config', async () => {
        const FILES = ['docs/**/*.mdx'];

        const configResult = await computeEslintConfig({
          mdx: {configCodeBlocks: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('mdx/setup/code-blocks-processor')?.files,
        ).toStrictEqual(FILES);
      });

      it('does not apply user-provided `files` to `mdx/code-blocks` eslint config', async () => {
        const FILES = ['docs/**/*.mdx'];

        const configResult = await computeEslintConfig({
          mdx: {configCodeBlocks: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('mdx/code-blocks')?.files).not.toIncludeAnyMembers(
          FILES,
        );
      });

      it('disables `mdx/code-blocks` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({mdx: {configCodeBlocks: {files: []}}});

        expect(configResult.getConfigByUnPostfix('mdx/code-blocks')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `mdx/setup/code-blocks-processor` eslint config and merges them with defaults', async () => {
        const IGNORES = ['CHANGELOG.mdx'];

        const configResult = await computeEslintConfig({
          mdx: {configCodeBlocks: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix(
          'mdx/setup/code-blocks-processor',
        )?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `mdx/code-blocks` eslint config', async () => {
      const configResult = await computeEslintConfig({
        mdx: {
          configCodeBlocks: {
            overrides: {'no-console': 2},
            overridesAny: {'prefer-const': 2},
          },
        },
      });

      expect(configResult.getRuleSeverities('mdx/code-blocks')).toMatchObject({
        'no-console': 2,
        'prefer-const': 2,
      });
    });
  });

  describe('options', () => {
    describe('option: `ignoredLanguages`', () => {
      it('does not create `mdx/code-blocks/ignore` eslint config by default', async () => {
        const configResult = await computeEslintConfig('mdx');

        expect(configResult.getConfigByUnPostfix('mdx/code-blocks/ignore')).toBeUndefined();
      });

      it('creates `mdx/code-blocks/ignore` with correct ignores when array is provided', async () => {
        const configResult = await computeEslintConfig({
          mdx: {configCodeBlocks: {ignoredLanguages: ['python', 'ruby']}},
        });

        expect(
          configResult.getConfigByUnPostfix('mdx/code-blocks/ignore')?.ignores,
        ).toMatchInlineSnapshot('["**/*.mdx/**/*.{python,ruby}"]');
      });
    });

    describe('option: `impliedStrictMode`', () => {
      it('sets `impliedStrict` to `true` in `mdx/code-blocks` `parserOptions` by default', async () => {
        const configResult = await computeEslintConfig('mdx');

        expect(
          configResult.getConfigByUnPostfix('mdx/code-blocks')?.languageOptions?.['parserOptions'],
        ).toStrictEqual({ecmaFeatures: {impliedStrict: true}});
      });

      it('sets `impliedStrict` to `true` in `mdx/code-blocks` `parserOptions` when set to `true`', async () => {
        const configResult = await computeEslintConfig({
          mdx: {configCodeBlocks: {impliedStrictMode: true}},
        });

        expect(
          configResult.getConfigByUnPostfix('mdx/code-blocks')?.languageOptions?.['parserOptions'],
        ).toStrictEqual({ecmaFeatures: {impliedStrict: true}});
      });

      it('sets `impliedStrict` to `false` in `mdx/code-blocks` `parserOptions` when set to `false`', async () => {
        const configResult = await computeEslintConfig({
          mdx: {configCodeBlocks: {impliedStrictMode: false}},
        });

        expect(
          configResult.getConfigByUnPostfix('mdx/code-blocks')?.languageOptions?.['parserOptions'],
        ).toStrictEqual({ecmaFeatures: {impliedStrict: false}});
      });
    });
  });

  describe('disabled rules in embedded code blocks', () => {
    it('disables default rules in `mdx/code-blocks` eslint config', async () => {
      const configResult = await computeEslintConfig('mdx');

      expect(configResult.getRuleEntrySeverity('mdx/code-blocks', 'no-console')).toBe(0);
      expect(configResult.getRuleEntrySeverity('mdx/code-blocks', 'prefer-const')).toBe(0);
    });

    it('does not disable a rule in `mdx/code-blocks` when excluded via `markdownCodeBlocksRules.doNotDisable`', async () => {
      const configResult = await computeEslintConfig('mdx', {
        un: {markdownCodeBlocksRules: {doNotDisable: {'no-console': true}}},
      });

      expect(configResult.getRuleEntry('mdx/code-blocks', 'no-console')).toBeUndefined();
    });

    it('additionally disables a rule in `mdx/code-blocks` when set via `markdownCodeBlocksRules.additionalDisabledRules`', async () => {
      const configResult = await computeEslintConfig('mdx', {
        un: {markdownCodeBlocksRules: {additionalDisabledRules: {'no-shadow': true}}},
      });

      expect(configResult.getRuleEntrySeverity('mdx/code-blocks', 'no-shadow')).toBe(0);
    });

    it('ignores a rule of `markdownCodeBlocksRules.additionalDisabledRules` set to `false`', async () => {
      const configResult = await computeEslintConfig('mdx', {
        un: {markdownCodeBlocksRules: {additionalDisabledRules: {'no-shadow': false}}},
      });

      expect(configResult.getRuleEntry('mdx/code-blocks', 'no-shadow')).toBeUndefined();
    });
  });
});

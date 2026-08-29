const FIXTURES = {
  codeBlockWithConsoleCall: 'code-block-with-console-call.md',
} as const;

describe('markdown: sub config `codeBlocks`', () => {
  describe('basic tests', () => {
    it('creates `markdown/{setup/code-blocks-processor,code-blocks}` eslint configs by default', async () => {
      const configResult = await computeEslintConfig('markdown');

      const processorConfig = configResult.getConfigByUnPostfix('markdown/code-blocks-processor');

      expect(processorConfig?.processor).toBeDefined();
      expect(processorConfig?.files).toMatchInlineSnapshot('["**/*.md"]');

      const config = configResult.getConfigByUnPostfix('markdown/code-blocks');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot(
        '["**/*.md/**/*.{?([cm])[jt]s?(x),vue,json,jsonc,json5,y?(a)ml,toml,htm?(l),css,scss,astro,svelte,graphql,gql,gjs,gts}"]',
      );
      expect(config?.ignores).toBeUndefined();
    });

    it('does not create `markdown/{setup/code-blocks-processor,code-blocks}` eslint configs when set to `false`', async () => {
      const configResult = await computeEslintConfig({markdown: {configCodeBlocks: false}});

      expect(configResult.getConfigByUnPostfix('markdown/code-blocks-processor')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('markdown/code-blocks')).toBeUndefined();
    });

    it('creates `markdown/{setup/code-blocks-processor,code-blocks}` eslint configs when set to `true`', async () => {
      const configResult = await computeEslintConfig({markdown: {configCodeBlocks: true}});

      expect(configResult.getConfigByUnPostfix('markdown/code-blocks-processor')).toBeDefined();
      expect(configResult.getConfigByUnPostfix('markdown/code-blocks')).toBeDefined();
    });

    it('creates `markdown/code-blocks` eslint config when set to an object', async () => {
      const configResult = await computeEslintConfig({markdown: {configCodeBlocks: {}}});

      expect(configResult.getConfigByUnPostfix('markdown/code-blocks')).toBeDefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig('markdown');

      expect(configResult.getRuleSeverities('markdown/code-blocks')).toMatchObject({
        'no-console': 0,
        'prefer-const': 0,
      });
    });

    it('`no-console` rule fires inside a fenced code block when re-enabled via `overrides`', async () => {
      const results = await testEslintConfig(
        {markdown: {configCodeBlocks: {overrides: {'no-console': 2}}}},
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

  // `no-console` is enabled by a raw extra config here, which wins over the `markdown/code-blocks`
  // config disabling it, so what is asserted is purely whether the code block was extracted
  describe('code blocks extraction', () => {
    const EXTRA_CONFIGS = [{name: 'test', rules: {'no-console': 2}}] as const;

    it('extracts fenced code blocks by default', async () => {
      const results = await testEslintConfig('markdown', FIXTURES.codeBlockWithConsoleCall, {
        searchFixturesRelativeToPath: import.meta.dirname,
        un: {extraConfigs: [...EXTRA_CONFIGS]},
      });

      expect(
        findLintMessageFromLintResults(results, FIXTURES.codeBlockWithConsoleCall, 'no-console'),
      ).toBeDefined();
    });

    it('does not extract fenced code blocks when set to `false`', async () => {
      const results = await testEslintConfig(
        {markdown: {configCodeBlocks: false}},
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
      it('uses user-provided `files` in `markdown/code-blocks-processor` eslint config', async () => {
        const FILES = ['docs/**/*.md'];

        const configResult = await computeEslintConfig({
          markdown: {configCodeBlocks: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('markdown/code-blocks-processor')?.files,
        ).toStrictEqual(FILES);
      });

      it('does not apply user-provided `files` to `markdown/code-blocks` eslint config', async () => {
        const FILES = ['docs/**/*.md'];

        const configResult = await computeEslintConfig({
          markdown: {configCodeBlocks: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('markdown/code-blocks')?.files,
        ).not.toIncludeAnyMembers(FILES);
      });

      it('disables both eslint configs when set to empty array', async () => {
        const configResult = await computeEslintConfig({markdown: {configCodeBlocks: {files: []}}});

        expect(configResult.getConfigByUnPostfix('markdown/code-blocks-processor')).toBeUndefined();
        expect(configResult.getConfigByUnPostfix('markdown/code-blocks')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `markdown/code-blocks-processor` eslint config and merges them with defaults', async () => {
        const IGNORES = ['CHANGELOG.md'];

        const configResult = await computeEslintConfig({
          markdown: {configCodeBlocks: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix(
          'markdown/code-blocks-processor',
        )?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `markdown/code-blocks` eslint config', async () => {
      const configResult = await computeEslintConfig({
        markdown: {
          configCodeBlocks: {
            overrides: {'no-console': 2},
            overridesAny: {'prefer-const': 2},
          },
        },
      });

      expect(configResult.getRuleSeverities('markdown/code-blocks')).toMatchObject({
        'no-console': 2,
        'prefer-const': 2,
      });
    });
  });

  describe('options', () => {
    describe('option: `ignoredLanguages`', () => {
      it('does not create `markdown/code-blocks/ignore` eslint config by default', async () => {
        const configResult = await computeEslintConfig('markdown');

        expect(configResult.getConfigByUnPostfix('markdown/code-blocks/ignore')).toBeUndefined();
      });

      it('creates `markdown/code-blocks/ignore` with correct ignores when array is provided', async () => {
        const configResult = await computeEslintConfig({
          markdown: {configCodeBlocks: {ignoredLanguages: ['python', 'ruby']}},
        });

        expect(
          configResult.getConfigByUnPostfix('markdown/code-blocks/ignore')?.ignores,
        ).toMatchInlineSnapshot('["**/*.md/**/*.{python,ruby}"]');
      });
    });

    describe('option: `impliedStrictMode`', () => {
      it('sets `impliedStrict` to `true` in `markdown/code-blocks` `parserOptions` by default', async () => {
        const configResult = await computeEslintConfig('markdown');

        expect(
          configResult.getConfigByUnPostfix('markdown/code-blocks')?.languageOptions?.[
            'parserOptions'
          ],
        ).toStrictEqual({ecmaFeatures: {impliedStrict: true}});
      });

      it('sets `impliedStrict` to `true` in `markdown/code-blocks` `parserOptions` when set to `true`', async () => {
        const configResult = await computeEslintConfig({
          markdown: {configCodeBlocks: {impliedStrictMode: true}},
        });

        expect(
          configResult.getConfigByUnPostfix('markdown/code-blocks')?.languageOptions?.[
            'parserOptions'
          ],
        ).toStrictEqual({ecmaFeatures: {impliedStrict: true}});
      });

      it('sets `impliedStrict` to `false` in `markdown/code-blocks` `parserOptions` when set to `false`', async () => {
        const configResult = await computeEslintConfig({
          markdown: {configCodeBlocks: {impliedStrictMode: false}},
        });

        expect(
          configResult.getConfigByUnPostfix('markdown/code-blocks')?.languageOptions?.[
            'parserOptions'
          ],
        ).toStrictEqual({ecmaFeatures: {impliedStrict: false}});
      });
    });
  });

  describe('disabled rules in embedded code blocks', () => {
    it('disables default rules in `markdown/code-blocks` eslint config', async () => {
      const configResult = await computeEslintConfig('markdown');

      expect(configResult.getRuleEntrySeverity('markdown/code-blocks', 'no-console')).toBe(0);
      expect(configResult.getRuleEntrySeverity('markdown/code-blocks', 'prefer-const')).toBe(0);
    });

    it('does not disable a rule in `markdown/code-blocks` when excluded via `markdownCodeBlocksRules.doNotDisable`', async () => {
      const configResult = await computeEslintConfig('markdown', {
        un: {markdownCodeBlocksRules: {doNotDisable: {'no-console': true}}},
      });

      expect(configResult.getRuleEntry('markdown/code-blocks', 'no-console')).toBeUndefined();
    });

    it('additionally disables a rule in `markdown/code-blocks` when set via `markdownCodeBlocksRules.additionalDisabledRules`', async () => {
      const configResult = await computeEslintConfig('markdown', {
        un: {markdownCodeBlocksRules: {additionalDisabledRules: {'default-case': true}}},
      });

      expect(configResult.getRuleEntrySeverity('markdown/code-blocks', 'default-case')).toBe(0);
    });
  });
});

const FIXTURES = {
  twoSentencesPerLine: 'two-sentences-per-line.md',
} as const;

describe('markdown: sub config `fentencesPerLine`', () => {
  describe('basic tests', () => {
    it('does not create `markdown/sentences-per-line` eslint config by default', async () => {
      const configResult = await computeEslintConfig('markdown');

      expect(configResult.getConfigByUnPostfix('markdown/sentences-per-line')).toBeUndefined();
    });

    it('creates `markdown/sentences-per-line` eslint config when `configSentencesPerLine` is `true`', async () => {
      const configResult = await computeEslintConfig({markdown: {configSentencesPerLine: true}});

      const config = configResult.getConfigByUnPostfix('markdown/sentences-per-line');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.md"]');
    });

    it('creates `markdown/sentences-per-line` eslint config when `configSentencesPerLine` is object', async () => {
      const configResult = await computeEslintConfig({markdown: {configSentencesPerLine: {}}});

      expect(configResult.getConfigByUnPostfix('markdown/sentences-per-line')).toBeDefined();
    });

    it('ignores `LICENSE.md` by default in `markdown/sentences-per-line` eslint config', async () => {
      const configResult = await computeEslintConfig({markdown: {configSentencesPerLine: true}});

      expect(
        configResult.getConfigByUnPostfix('markdown/sentences-per-line')?.ignores,
      ).toIncludeAllMembers(['LICENSE.md']);
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig({
        markdown: {configSentencesPerLine: true},
      });

      expect(configResult.getRuleSeverities('markdown/sentences-per-line')).toMatchObject({
        'sentences-per-line/one': 2,
      });
    });

    it('`sentences-per-line/one` rule fires on a markdown file with two sentences on one line', async () => {
      const results = await testEslintConfig(
        {markdown: {configSentencesPerLine: true}},
        FIXTURES.twoSentencesPerLine,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.twoSentencesPerLine,
        'sentences-per-line/one',
      );

      expect(error?.message).toMatchInlineSnapshot('"Each sentence should be on its own line."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `markdown/sentences-per-line` eslint config', async () => {
        const FILES = ['docs/**/*.md'];

        const configResult = await computeEslintConfig({
          markdown: {configSentencesPerLine: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('markdown/sentences-per-line')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `markdown/sentences-per-line` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          markdown: {configSentencesPerLine: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('markdown/sentences-per-line')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `markdown/sentences-per-line` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          markdown: {configSentencesPerLine: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('markdown/sentences-per-line')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `markdown/sentences-per-line` eslint config', async () => {
      const configResult = await computeEslintConfig({
        markdown: {
          configSentencesPerLine: {
            overrides: {'sentences-per-line/one': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(
        configResult.getRuleEntrySeverity('markdown/sentences-per-line', 'sentences-per-line/one'),
      ).toBe(0);
      expect(configResult.getRuleEntrySeverity('markdown/sentences-per-line', 'no-console')).toBe(
        0,
      );
    });
  });

  describe('options', () => {
    describe('option: `ignoresAdditional`', () => {
      it('ignores `LICENSE.md` by default', async () => {
        const configResult = await computeEslintConfig({markdown: {configSentencesPerLine: true}});

        expect(
          configResult.getConfigByUnPostfix('markdown/sentences-per-line')?.ignores,
        ).toIncludeAllMembers(['LICENSE.md']);
      });

      it('does not ignore `LICENSE.md` when set to `false`', async () => {
        const configResult = await computeEslintConfig({
          markdown: {configSentencesPerLine: {ignoresAdditional: false}},
        });

        expect(
          configResult.getConfigByUnPostfix('markdown/sentences-per-line')?.ignores,
        ).not.toIncludeAnyMembers(['LICENSE.md']);
      });

      it('does not ignore `LICENSE.md` when set to object and `LICENSE.md` set to `false`', async () => {
        const configResult = await computeEslintConfig({
          markdown: {configSentencesPerLine: {ignoresAdditional: {'LICENSE.md': false}}},
        });

        expect(
          configResult.getConfigByUnPostfix('markdown/sentences-per-line')?.ignores,
        ).not.toIncludeAnyMembers(['LICENSE.md']);
      });

      it('ignores `LICENSE.md` when set to object and `LICENSE.md` set to `true`', async () => {
        const configResult = await computeEslintConfig({
          markdown: {configSentencesPerLine: {ignoresAdditional: {'LICENSE.md': true}}},
        });

        expect(
          configResult.getConfigByUnPostfix('markdown/sentences-per-line')?.ignores,
        ).toIncludeAllMembers(['LICENSE.md']);
      });
    });
  });
});

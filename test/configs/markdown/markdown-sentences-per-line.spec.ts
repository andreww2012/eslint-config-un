const FIXTURES = {
  lineWithAbbreviation: 'line-with-abbreviation.md',
  twoSentencesPerLine: 'two-sentences-per-line.md',
} as const;

describe('markdown: sub config `sentencesPerLine`', () => {
  const CHANGESETS_IGNORE = '.changeset/**/*.md';

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

    it('does not ignore changesets by default when `@changesets/cli` is not installed', async () => {
      const configResult = await computeEslintConfig({markdown: {configSentencesPerLine: true}});

      expect(
        configResult.getConfigByUnPostfix('markdown/sentences-per-line')?.ignores,
      ).not.toIncludeAnyMembers([CHANGESETS_IGNORE]);
    });

    it('ignores changesets by default when `@changesets/cli` is installed', async () => {
      addInstalledPackages({'@changesets/cli': '2.29.0'});

      const configResult = await computeEslintConfig({markdown: {configSentencesPerLine: true}});

      expect(
        configResult.getConfigByUnPostfix('markdown/sentences-per-line')?.ignores,
      ).toIncludeAllMembers([CHANGESETS_IGNORE]);
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
        const FILES = ['docs/**/*.md'] as const;

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
      const IGNORES = ['**/fixtures/**'] as const;
      const PARENT_IGNORES = ['CHANGELOG.md'] as const;

      it('inherits the parent config `ignores` and merges them with defaults by default', async () => {
        const configResult = await computeEslintConfig({
          markdown: {ignores: PARENT_IGNORES, configSentencesPerLine: true},
        });

        expect(
          configResult.getConfigByUnPostfix('markdown/sentences-per-line')?.ignores,
        ).toIncludeAllMembers(['LICENSE.md', ...PARENT_IGNORES]);
      });

      it('uses user-provided `ignores` in `markdown/sentences-per-line` eslint config and merges them with defaults', async () => {
        const configResult = await computeEslintConfig({
          markdown: {ignores: PARENT_IGNORES, configSentencesPerLine: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('markdown/sentences-per-line')?.ignores;

        expect(ignores).toIncludeAllMembers(['LICENSE.md', ...IGNORES]);
        expect(ignores).not.toIncludeAnyMembers(PARENT_IGNORES);
      });

      it('replaces the default `ignores` when the function form is used', async () => {
        const configResult = await computeEslintConfig({
          markdown: {configSentencesPerLine: {ignores: () => [...IGNORES]}},
        });

        expect(
          configResult.getConfigByUnPostfix('markdown/sentences-per-line')?.ignores,
        ).toStrictEqual(IGNORES);
      });

      it('allows the function form to drop only some of the default `ignores`', async () => {
        addInstalledPackages({'@changesets/cli': '2.29.0'});

        const configResult = await computeEslintConfig({
          markdown: {
            configSentencesPerLine: {
              ignores: ({ignoresDefault, ignoresImplicit}) => [
                ...ignoresImplicit,
                ...ignoresDefault.filter((pattern) => pattern !== 'LICENSE.md'),
              ],
            },
          },
        });

        const ignores = configResult.getConfigByUnPostfix('markdown/sentences-per-line')?.ignores;

        expect(ignores).toIncludeAllMembers([CHANGESETS_IGNORE]);
        expect(ignores).not.toIncludeAnyMembers(['LICENSE.md']);
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
    describe('option: `options`', () => {
      const OPTIONS = Object.freeze({additionalAbbreviations: ['Mme.']});

      it('does not pass options to `sentences-per-line/one` rule by default', async () => {
        const configResult = await computeEslintConfig({markdown: {configSentencesPerLine: true}});

        expect(
          configResult.getRuleEntryOptions('markdown/sentences-per-line', 'sentences-per-line/one'),
        ).toStrictEqual([]);
      });

      it('passes custom `options` to `sentences-per-line/one` rule when provided', async () => {
        const configResult = await computeEslintConfig({
          markdown: {configSentencesPerLine: {options: OPTIONS}},
        });

        expect(
          configResult.getRuleEntryOptions('markdown/sentences-per-line', 'sentences-per-line/one'),
        ).toStrictEqual([OPTIONS]);
      });

      it('`sentences-per-line/one` rule fires on an unknown abbreviation by default', async () => {
        const results = await testEslintConfig(
          {markdown: {configSentencesPerLine: true}},
          FIXTURES.lineWithAbbreviation,
          import.meta.dirname,
        );

        expect(
          findLintMessageFromLintResults(
            results,
            FIXTURES.lineWithAbbreviation,
            'sentences-per-line/one',
          ),
        ).toBeDefined();
      });

      it('`sentences-per-line/one` rule does not fire on an abbreviation listed in `additionalAbbreviations`', async () => {
        const results = await testEslintConfig(
          {markdown: {configSentencesPerLine: {options: OPTIONS}}},
          FIXTURES.lineWithAbbreviation,
          import.meta.dirname,
        );

        expect(
          findLintMessageFromLintResults(
            results,
            FIXTURES.lineWithAbbreviation,
            'sentences-per-line/one',
          ),
        ).toBeUndefined();
      });
    });
  });
});

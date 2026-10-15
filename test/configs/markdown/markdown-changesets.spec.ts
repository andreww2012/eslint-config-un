const FIXTURES = {
  changesetWithRepeatedLink: '.changeset/repeated-link.md',
} as const;

describe('markdown: sub config `changesets`', () => {
  describe('basic tests', () => {
    it('does not create `markdown/changesets` eslint config by default if `@changesets/cli` is not installed', async () => {
      const configResult = await computeEslintConfig('markdown');

      expect(configResult.getConfigByUnPostfix('markdown/changesets')).toBeUndefined();
    });

    it('creates `markdown/changesets` eslint config by default if `@changesets/cli` is installed', async () => {
      addInstalledPackages({'@changesets/cli': '2.29.0'});

      const configResult = await computeEslintConfig('markdown');

      const config = configResult.getConfigByUnPostfix('markdown/changesets');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('[".changeset/**/*.md"]');
      expect(config?.ignores).toBeUndefined();
    });

    it('does not create `markdown/changesets` eslint config if set to `false` and `@changesets/cli` is installed', async () => {
      addInstalledPackages({'@changesets/cli': '2.29.0'});

      const configResult = await computeEslintConfig({markdown: {configChangesets: false}});

      expect(configResult.getConfigByUnPostfix('markdown/changesets')).toBeUndefined();
    });

    it('creates `markdown/changesets` eslint config if set to `true` and `@changesets/cli` is not installed', async () => {
      const configResult = await computeEslintConfig({markdown: {configChangesets: true}});

      expect(configResult.getConfigByUnPostfix('markdown/changesets')).toBeDefined();
    });

    it('creates `markdown/changesets` eslint config if set to an object', async () => {
      const configResult = await computeEslintConfig({markdown: {configChangesets: {}}});

      expect(configResult.getConfigByUnPostfix('markdown/changesets')).toBeDefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig({
        markdown: {configChangesets: true},
        markdownPreferences: true,
      });

      expect(configResult.getRuleSeverities('markdown/changesets')).toMatchObject({
        'markdown/no-missing-link-fragments': 0,
        'markdown-preferences/prefer-link-reference-definitions': 0,
      });
    });

    describe('`markdown-preferences/prefer-link-reference-definitions`', () => {
      it('does not report a changeset repeating a link', async () => {
        const results = await testEslintConfig(
          {
            markdown: {configChangesets: {files: ['**/.changeset/*.md']}},
            markdownPreferences: true,
          },
          FIXTURES.changesetWithRepeatedLink,
          import.meta.dirname,
        );

        expect(
          findLintMessageFromLintResults(
            results,
            FIXTURES.changesetWithRepeatedLink,
            'markdown-preferences/prefer-link-reference-definitions',
          ),
        ).toBeUndefined();
      });

      it('reports a changeset repeating a link if the sub-config is disabled', async () => {
        const results = await testEslintConfig(
          {markdown: {configChangesets: false}, markdownPreferences: true},
          FIXTURES.changesetWithRepeatedLink,
          import.meta.dirname,
        );

        const error = findLintMessageFromLintResults(
          results,
          FIXTURES.changesetWithRepeatedLink,
          'markdown-preferences/prefer-link-reference-definitions',
        );

        expect(error?.message).toMatchInlineSnapshot(
          '"Use link reference definitions instead of inline links."',
        );
      });
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `markdown/changesets` eslint config', async () => {
        const FILES = ['packages/*/.changeset/*.md'] as const;

        const configResult = await computeEslintConfig({
          markdown: {configChangesets: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('markdown/changesets')?.files).toStrictEqual(
          FILES,
        );
      });

      it('does not create `markdown/changesets` eslint config if set to empty array', async () => {
        const configResult = await computeEslintConfig({markdown: {configChangesets: {files: []}}});

        expect(configResult.getConfigByUnPostfix('markdown/changesets')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `markdown/changesets` eslint config', async () => {
        const IGNORES = ['.changeset/README.md'] as const;

        const configResult = await computeEslintConfig({
          markdown: {configChangesets: {ignores: IGNORES}},
        });

        expect(configResult.getConfigByUnPostfix('markdown/changesets')?.ignores).toStrictEqual(
          IGNORES,
        );
      });
    });

    it('respects `overrides` and `overridesAny` in `markdown/changesets` eslint config', async () => {
      const configResult = await computeEslintConfig({
        markdown: {
          configChangesets: {
            overrides: {'markdown/no-missing-link-fragments': 2},
            overridesAny: {'markdown-preferences/max-len': 1},
          },
        },
        markdownPreferences: true,
      });

      expect(configResult.getRuleSeverities('markdown/changesets')).toMatchObject({
        'markdown/no-missing-link-fragments': 2,
        'markdown-preferences/max-len': 1,
      });
    });
  });
});

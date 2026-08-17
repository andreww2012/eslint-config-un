const FIXTURES = {
  defaultExportInConfigFile: 'default-export.config.js',
} as const;

describe('import: sub config `allowDefaultExport`', () => {
  describe('basic tests', () => {
    it('creates `import/allow-default-export` eslint config by default', async () => {
      const configResult = await computeEslintConfig('import');

      const config = configResult.getConfigByUnPostfix('import/allow-default-export');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot(
        '["**/*.config.?([cm])[jt]s?(x)", "**/.*rc.?([cm])[jt]s?(x)", "**/.*.?([cm])[jt]s?(x)", "**/*.stories.?([cm])[jt]s?(x)", ".storybook/**/*"]',
      );
      expect(config?.ignores?.length).toBeGreaterThan(0);
    });

    it('does not create `import/allow-default-export` eslint config when disabled', async () => {
      const configResult = await computeEslintConfig({import: {configAllowDefaultExport: false}});

      expect(configResult.getConfigByUnPostfix('import/allow-default-export')).toBeUndefined();
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('import');

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('import/allow-default-export')).toMatchObject({
        'import/no-default-export': 0,
      });
    });

    it('does not report `import/no-default-export` in a config file', async () => {
      const results = await testEslintConfig(
        'import',
        FIXTURES.defaultExportInConfigFile,
        import.meta.dirname,
      );

      expect(
        findLintMessageFromLintResults(
          results,
          FIXTURES.defaultExportInConfigFile,
          'import/no-default-export',
        ),
      ).toBeUndefined();
    });

    it('reports `import/no-default-export` in a config file when disabled', async () => {
      const results = await testEslintConfig(
        {import: {configAllowDefaultExport: false}},
        FIXTURES.defaultExportInConfigFile,
        import.meta.dirname,
      );

      expect(
        findLintMessageFromLintResults(
          results,
          FIXTURES.defaultExportInConfigFile,
          'import/no-default-export',
        ),
      ).toBeDefined();
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `import/allow-default-export` eslint config', async () => {
        const FILES = ['scripts/**/*.ts'];

        const configResult = await computeEslintConfig({
          import: {configAllowDefaultExport: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('import/allow-default-export')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `import/allow-default-export` when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          import: {configAllowDefaultExport: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('import/allow-default-export')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` and merges them with defaults', async () => {
        const IGNORES = ['**/vite.config.*'];

        const configResult = await computeEslintConfig({
          import: {configAllowDefaultExport: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('import/allow-default-export')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `import/allow-default-export` eslint config', async () => {
      const configResult = await computeEslintConfig({
        import: {
          configAllowDefaultExport: {
            overrides: {'import/no-default-export': 2},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('import/allow-default-export')).toMatchObject({
        'import/no-default-export': 2,
        'no-console': 0,
      });
    });
  });
});

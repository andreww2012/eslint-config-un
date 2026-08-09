const FIXTURES = {
  reactComponentFileMixedExports: 'react-component-file-mixed-exports.jsx',
  reactComponentFileSingleExport: 'react-component-file-single-export.jsx',
} as const;

beforeEach(() => {
  addInstalledPackages({react: '19.0.0'});
});

describe('react: sub config `refresh`', () => {
  describe('basic tests', () => {
    it('creates `react/refresh` eslint config and loads `react-refresh` plugin by default', async () => {
      const configResult = await computeEslintConfig('react');

      const config = configResult.getConfigByUnPostfix('react/refresh');

      expect(config).toBeDefined();
      expect(configResult.getLoadedPlugin('react-refresh')).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.?([cm])[jt]sx"]');
      expect(config?.ignores?.length).toBeGreaterThan(0);
    });

    it('does not create `react/refresh` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({react: {configRefresh: false}});

      expect(configResult.getConfigByUnPostfix('react/refresh')).toBeUndefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig('react');

      expect(configResult.getRuleSeverities('react/refresh')).toMatchObject({
        'react-refresh/only-export-components': 2,
      });
    });

    it('`react-refresh/only-export-components` rule fires on a file with mixed exports', async () => {
      const result = await testEslintConfig(
        'react',
        FIXTURES.reactComponentFileMixedExports,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        result,
        FIXTURES.reactComponentFileMixedExports,
        'react-refresh/only-export-components',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components."',
      );
    });

    it('`react-refresh/only-export-components` rule does not fire on a file with component-only exports', async () => {
      const result = await testEslintConfig(
        {react: {configRefresh: true}},
        FIXTURES.reactComponentFileSingleExport,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        result,
        FIXTURES.reactComponentFileSingleExport,
        'react-refresh/only-export-components',
      );

      expect(error).toBeUndefined();
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `react/refresh` eslint config', async () => {
        const FILES = ['src/**/*.jsx'];

        const configResult = await computeEslintConfig({react: {configRefresh: {files: FILES}}});

        expect(configResult.getConfigByUnPostfix('react/refresh')?.files).toStrictEqual(FILES);
      });

      it('disables `react/refresh` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({react: {configRefresh: {files: []}}});

        expect(configResult.getConfigByUnPostfix('react/refresh')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `react/refresh` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          react: {configRefresh: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('react/refresh')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `react/refresh` eslint config', async () => {
      const configResult = await computeEslintConfig({
        react: {
          configRefresh: {
            overrides: {'react-refresh/only-export-components': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('react/refresh')).toMatchObject({
        'react-refresh/only-export-components': 0,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `allowExportNames`', () => {
      it('includes remix exports in `allowExportNames` when a `remix` package is installed', async () => {
        addInstalledPackages({'@remix-run/react': '2.0.0'});

        const configResult = await computeEslintConfig('react');

        expect(
          configResult.getRuleEntryOptions('react/refresh', 'react-refresh/only-export-components'),
        ).toMatchObject([
          {
            allowExportNames: expect.arrayContaining([
              'action',
              'headers',
              'links',
              'loader',
              'meta',
            ]) as unknown,
          },
        ]);
      });

      it('includes react-router exports in `allowExportNames` when a `react-router` package is installed', async () => {
        addInstalledPackages({'@react-router/react': '1.0.0'});

        const configResult = await computeEslintConfig('react');

        expect(
          configResult.getRuleEntryOptions('react/refresh', 'react-refresh/only-export-components'),
        ).toMatchObject([
          {allowExportNames: expect.arrayContaining(['action', 'loader']) as unknown},
        ]);
      });

      it('includes next exports in `allowExportNames` when `next` is installed', async () => {
        addInstalledPackages({next: '15.0.0'});

        const configResult = await computeEslintConfig('react');

        expect(
          configResult.getRuleEntryOptions('react/refresh', 'react-refresh/only-export-components'),
        ).toMatchObject([
          {allowExportNames: expect.arrayContaining(['config', 'dynamic']) as unknown},
        ]);
      });

      it('includes user-provided names in `allowExportNames` when set', async () => {
        const ALLOW_EXPORT_NAMES = ['myCustomExport'];

        const configResult = await computeEslintConfig({
          react: {configRefresh: {allowExportNames: ALLOW_EXPORT_NAMES}},
        });

        expect(
          configResult.getRuleEntryOptions('react/refresh', 'react-refresh/only-export-components'),
        ).toMatchObject([{allowExportNames: ALLOW_EXPORT_NAMES}]);
      });
    });

    it('`allowConstantExport` is `true` when `vite` is installed', async () => {
      addInstalledPackages({vite: '5.0.0'});

      const configResult = await computeEslintConfig('react');

      expect(
        configResult.getRuleEntryOptions('react/refresh', 'react-refresh/only-export-components'),
      ).toMatchObject([{allowConstantExport: true}]);
    });

    it('merges user-provided `options` into `react-refresh/only-export-components` rule options', async () => {
      const configResult = await computeEslintConfig({
        react: {configRefresh: {options: {checkJS: true}}},
      });

      expect(
        configResult.getRuleEntryOptions('react/refresh', 'react-refresh/only-export-components'),
      ).toMatchObject([{checkJS: true}]);
    });
  });
});

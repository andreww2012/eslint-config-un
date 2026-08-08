const FIXTURES = {
  reactComponentFileMixedExports: 'react-component-file-mixed-exports.jsx',
  reactComponentFileSingleExport: 'react-component-file-single-export.jsx',
} as const;

beforeEach(() => {
  addInstalledPackages({react: '19.0.0'});
});

describe('react: sub config `refresh`', () => {
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

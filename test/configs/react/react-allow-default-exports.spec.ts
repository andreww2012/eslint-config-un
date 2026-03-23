beforeEach(() => {
  addInstalledPackages({react: '19.0.0'});
});

describe('react: sub config `allowDefaultExportsInJsxFiles`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig('react');

    it('creates `react/allow-default-export-in-jsx-files` eslint config by default', () => {
      expect(
        configResult.getConfigByUnPostfix('react/allow-default-export-in-jsx-files'),
      ).toBeDefined();
    });

    it('does not create `react/allow-default-export-in-jsx-files` eslint config when disabled', async () => {
      const configResult = await computeEslintConfig({
        react: {configAllowDefaultExportsInJsxFiles: false},
      });

      expect(
        configResult.getConfigByUnPostfix('react/allow-default-export-in-jsx-files'),
      ).toBeUndefined();
    });

    it('targets jsx and tsx files by default', () => {
      expect(
        configResult.getConfigByUnPostfix('react/allow-default-export-in-jsx-files')?.files,
      ).toMatchInlineSnapshot('["**/*.?([cm])[jt]sx"]');
    });

    it('has default `ignores` in `react/allow-default-export-in-jsx-files` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('react/allow-default-export-in-jsx-files')?.ignores
          ?.length,
      ).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('react');

    it('disables `import/no-default-export` rule', () => {
      expect(
        configResult.getRuleEntrySeverity(
          'react/allow-default-export-in-jsx-files',
          'import/no-default-export',
        ),
      ).toBe(0);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `react/allow-default-export-in-jsx-files` eslint config', async () => {
        const FILES = ['src/**/*.jsx'];

        const configResult = await computeEslintConfig({
          react: {configAllowDefaultExportsInJsxFiles: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('react/allow-default-export-in-jsx-files')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `react/allow-default-export-in-jsx-files` when `files` is empty array', async () => {
        const configResult = await computeEslintConfig({
          react: {configAllowDefaultExportsInJsxFiles: {files: []}},
        });

        expect(
          configResult.getConfigByUnPostfix('react/allow-default-export-in-jsx-files'),
        ).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` and merges them with defaults', async () => {
        const IGNORES = ['**/stories/**'];

        const configResult = await computeEslintConfig({
          react: {configAllowDefaultExportsInJsxFiles: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix(
          'react/allow-default-export-in-jsx-files',
        )?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });
  });
});

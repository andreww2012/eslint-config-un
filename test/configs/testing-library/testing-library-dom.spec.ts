describe('testing-library: sub config `dom`', () => {
  describe('sub config: `configNoOnlyTests`', async () => {
    const configResult = await computeEslintConfig('testingLibrary');

    it('creates `testing-library/dom/no-only-tests` eslint config by default', () => {
      expect(configResult.getConfigByUnPostfix('testing-library/dom/no-only-tests')).toBeDefined();
    });

    it('`testing-library/dom/no-only-tests` config inherits files from `testing-library/dom`', () => {
      expect(
        configResult.getConfigByUnPostfix('testing-library/dom/no-only-tests')?.files,
      ).toStrictEqual(configResult.getConfigByUnPostfix('testing-library/dom')?.files);
    });

    it('disabling `testing-library/dom` via `files: []` also removes `testing-library/dom/no-only-tests`', async () => {
      const configResult = await computeEslintConfig({testingLibrary: {files: []}});

      expect(
        configResult.getConfigByUnPostfix('testing-library/dom/no-only-tests'),
      ).toBeUndefined();
    });
  });
});

describe('e18e: sub config `performanceImprovements`', () => {
  describe('basic tests', () => {
    it('creates `e18e/performance-improvements` eslint config by default', async () => {
      const configResult = await computeEslintConfig('e18e');

      const config = configResult.getConfigByUnPostfix('e18e/performance-improvements');

      expect(config).toBeDefined();
      expect(config?.files).toBeUndefined();
    });

    it('does not create `e18e/performance-improvements` eslint config when disabled', async () => {
      const configResult = await computeEslintConfig({
        e18e: {configPerformanceImprovements: false},
      });

      expect(configResult.getConfigByUnPostfix('e18e/performance-improvements')).toBeUndefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig('e18e');

      expect(configResult.getRuleSeverities('e18e/performance-improvements')).toMatchObject({
        'e18e/prefer-array-from-map': 2,
        'e18e/prefer-date-now': 2,
      });
    });

    // TODO rule in action test
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `e18e/performance-improvements` eslint config', async () => {
        const FILES = ['src/**/*.js'];

        const configResult = await computeEslintConfig({
          e18e: {configPerformanceImprovements: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('e18e/performance-improvements')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `e18e/performance-improvements` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          e18e: {configPerformanceImprovements: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('e18e/performance-improvements')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `e18e/performance-improvements` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          e18e: {configPerformanceImprovements: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('e18e/performance-improvements')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `e18e/performance-improvements/type-aware` eslint config', async () => {
      const configResult = await computeEslintConfig({
        e18e: {
          configPerformanceImprovements: {
            overrides: {'e18e/prefer-array-from-map': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('e18e/performance-improvements')).toMatchObject({
        'e18e/prefer-array-from-map': 0,
        'no-console': 0,
      });
    });
  });
});

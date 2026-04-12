describe('e18e: sub config `performanceImprovements.typescript`', () => {
  describe('basic tests', () => {
    it('does not create `e18e/performance-improvements/type-aware` eslint config by default (requires `ts` config to be enabled)', async () => {
      const configResult = await computeEslintConfig('e18e');

      expect(
        configResult.getConfigByUnPostfix('e18e/performance-improvements/type-aware'),
      ).toBeUndefined();
    });

    it('creates `e18e/performance-improvements/type-aware` eslint config when `ts` config is enabled', async () => {
      const configResult = await computeEslintConfig({e18e: true, ts: true});

      const config = configResult.getConfigByUnPostfix('e18e/performance-improvements/type-aware');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.?([cm])ts?(x)"]');
      expect(config?.ignores).toIncludeAllMembers(['**/*.md?(x)/**/*.*']);
    });

    it('creates `e18e/performance-improvements/type-aware` eslint config when `configTypescript` is set to `true`', async () => {
      const configResult = await computeEslintConfig({
        e18e: {configPerformanceImprovements: {configTypescript: true}},
      });

      expect(
        configResult.getConfigByUnPostfix('e18e/performance-improvements/type-aware'),
      ).toBeDefined();
    });

    it('does not create `e18e/performance-improvements/type-aware` eslint config when `configTypescript` is set to `false`', async () => {
      const configResult = await computeEslintConfig({
        e18e: {configPerformanceImprovements: {configTypescript: false}},
        ts: true,
      });

      expect(
        configResult.getConfigByUnPostfix('e18e/performance-improvements/type-aware'),
      ).toBeUndefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig({
        e18e: {configPerformanceImprovements: {configTypescript: true}},
      });

      expect(
        configResult.getRuleSeverities('e18e/performance-improvements/type-aware'),
      ).toMatchObject({
        'e18e/no-indexof-equality': 2,
        'e18e/prefer-regex-test': 2,
      });
    });

    // TODO rule in action test
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `e18e/performance-improvements/type-aware` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          e18e: {configPerformanceImprovements: {configTypescript: {files: FILES}}},
        });

        expect(
          configResult.getConfigByUnPostfix('e18e/performance-improvements/type-aware')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `e18e/performance-improvements/type-aware` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          e18e: {configPerformanceImprovements: {configTypescript: {files: []}}},
        });

        expect(
          configResult.getConfigByUnPostfix('e18e/performance-improvements/type-aware'),
        ).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `e18e/performance-improvements/type-aware` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          e18e: {configPerformanceImprovements: {configTypescript: {ignores: IGNORES}}},
        });

        const ignores = configResult.getConfigByUnPostfix(
          'e18e/performance-improvements/type-aware',
        )?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `e18e/performance-improvements/type-aware` eslint config', async () => {
      const configResult = await computeEslintConfig({
        e18e: {
          configPerformanceImprovements: {
            configTypescript: {
              overrides: {'e18e/no-indexof-equality': 0},
              overridesAny: {'no-console': 0},
            },
          },
        },
      });

      expect(
        configResult.getRuleSeverities('e18e/performance-improvements/type-aware'),
      ).toMatchObject({
        'e18e/no-indexof-equality': 0,
        'no-console': 0,
      });
    });
  });
});

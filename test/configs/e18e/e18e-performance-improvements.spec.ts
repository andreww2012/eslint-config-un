describe('e18e: sub config `configPerformanceImprovements`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig('e18e');

    it('creates `e18e/performance-improvements/non-type-aware` eslint config when enabled (default)', () => {
      expect(
        configResult.getConfigByUnPostfix('e18e/performance-improvements/non-type-aware'),
      ).toBeDefined();
    });

    it('does not create `e18e/performance-improvements/non-type-aware` eslint config when disabled', async () => {
      const configResult = await computeEslintConfig({
        e18e: {configPerformanceImprovements: false},
      });

      expect(
        configResult.getConfigByUnPostfix('e18e/performance-improvements/non-type-aware'),
      ).toBeUndefined();
    });

    it('has no explicit `files` restriction in `e18e/performance-improvements/non-type-aware` eslint config by default (applies to all files)', () => {
      expect(
        configResult.getConfigByUnPostfix('e18e/performance-improvements/non-type-aware')?.files,
      ).toBeUndefined();
    });

    it('has default `ignores` in `e18e/performance-improvements/non-type-aware` eslint config', () => {
      const ignores = configResult.getConfigByUnPostfix(
        'e18e/performance-improvements/non-type-aware',
      )?.ignores;

      expect(ignores?.length).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('e18e');

    it('enables `e18e/prefer-array-from-map` rule by default', () => {
      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry(
            'e18e/performance-improvements/non-type-aware',
            'e18e/prefer-array-from-map',
          ),
        ),
      ).toBe(2);
    });

    it('enables `e18e/prefer-date-now` rule by default', () => {
      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry(
            'e18e/performance-improvements/non-type-aware',
            'e18e/prefer-date-now',
          ),
        ),
      ).toBe(2);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `e18e/performance-improvements/non-type-aware` eslint config', async () => {
        const FILES = ['src/**/*.js'];
        const configResult = await computeEslintConfig({
          e18e: {configPerformanceImprovements: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('e18e/performance-improvements/non-type-aware')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `e18e/performance-improvements/non-type-aware` eslint config when `files` is empty array', async () => {
        const configResult = await computeEslintConfig({
          e18e: {configPerformanceImprovements: {files: []}},
        });

        expect(
          configResult.getConfigByUnPostfix('e18e/performance-improvements/non-type-aware'),
        ).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `e18e/performance-improvements/non-type-aware` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];
        const configResult = await computeEslintConfig({
          e18e: {configPerformanceImprovements: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix(
          'e18e/performance-improvements/non-type-aware',
        )?.ignores;

        expect(ignores).to.include.members(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    describe('option: `overrides`', () => {
      it('respects `overrides` in `e18e/performance-improvements/non-type-aware` eslint config', async () => {
        const configResult = await computeEslintConfig({
          e18e: {
            configPerformanceImprovements: {overrides: {'e18e/prefer-array-from-map': 0}},
          },
        });

        expect(
          getRuleSeverityFromEslintRuleEntry(
            configResult.getRuleEntry(
              'e18e/performance-improvements/non-type-aware',
              'e18e/prefer-array-from-map',
            ),
          ),
        ).toBe(0);
      });
    });

    describe('option: `overridesAny`', () => {
      it('respects `overridesAny` in `e18e/performance-improvements/non-type-aware` eslint config', async () => {
        const configResult = await computeEslintConfig({
          e18e: {configPerformanceImprovements: {overridesAny: {'no-console': 0}}},
        });

        expect(
          getRuleSeverityFromEslintRuleEntry(
            configResult.getRuleEntry(
              'e18e/performance-improvements/non-type-aware',
              'no-console',
            ),
          ),
        ).toBe(0);
      });

      it('respects both `overrides` and `overridesAny`', async () => {
        const configResult = await computeEslintConfig({
          e18e: {
            configPerformanceImprovements: {
              overrides: {'e18e/prefer-array-from-map': 0},
              overridesAny: {'no-console': 0},
            },
          },
        });

        expect(
          getRuleSeverityFromEslintRuleEntry(
            configResult.getRuleEntry(
              'e18e/performance-improvements/non-type-aware',
              'e18e/prefer-array-from-map',
            ),
          ),
        ).toBe(0);

        expect(
          getRuleSeverityFromEslintRuleEntry(
            configResult.getRuleEntry(
              'e18e/performance-improvements/non-type-aware',
              'no-console',
            ),
          ),
        ).toBe(0);
      });

      it('puts `overridesAny` after `overrides`', async () => {
        const configResult = await computeEslintConfig({
          e18e: {
            configPerformanceImprovements: {
              overrides: {'e18e/prefer-array-from-map': 1},
              overridesAny: {'e18e/prefer-array-from-map': 0},
            },
          },
        });

        expect(
          getRuleSeverityFromEslintRuleEntry(
            configResult.getRuleEntry(
              'e18e/performance-improvements/non-type-aware',
              'e18e/prefer-array-from-map',
            ),
          ),
        ).toBe(0);
      });
    });

    describe('option: `forceSeverity`', () => {
      it('respects `forceSeverity` set to `warn` in `e18e/performance-improvements/non-type-aware` eslint config', async () => {
        const configResult = await computeEslintConfig({
          e18e: {configPerformanceImprovements: {forceSeverity: 'warn'}},
        });

        expect(
          getAllRulesSeverities(
            configResult.getConfigByUnPostfix('e18e/performance-improvements/non-type-aware'),
            (ruleName) => ruleName.startsWith('e18e/'),
          ),
        ).toStrictEqual([1]);
      });

      it('respects `forceSeverity` set to `error` in `e18e/performance-improvements/non-type-aware` eslint config', async () => {
        const configResult = await computeEslintConfig({
          e18e: {configPerformanceImprovements: {forceSeverity: 'error'}},
        });

        expect(
          getAllRulesSeverities(
            configResult.getConfigByUnPostfix('e18e/performance-improvements/non-type-aware'),
            (ruleName) => ruleName.startsWith('e18e/'),
          ),
        ).toStrictEqual([2]);
      });
    });
  });
});

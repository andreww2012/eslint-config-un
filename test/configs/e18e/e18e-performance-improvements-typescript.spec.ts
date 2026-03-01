describe('e18e: sub config `configPerformanceImprovements.configTypescript`', () => {
  describe('basic tests', async () => {
    it('does not create `e18e/performance-improvements/type-aware` eslint config by default (requires `ts` config to be enabled)', async () => {
      const configResult = await computeEslintConfig('e18e');

      expect(
        configResult.getConfigByUnPostfix('e18e/performance-improvements/type-aware'),
      ).toBeUndefined();
    });

    it('creates `e18e/performance-improvements/type-aware` eslint config when `ts` config is enabled', async () => {
      const configResult = await computeEslintConfig({e18e: true, ts: true});

      expect(
        configResult.getConfigByUnPostfix('e18e/performance-improvements/type-aware'),
      ).toBeDefined();
    });

    it('creates `e18e/performance-improvements/type-aware` eslint config when `configTypescript` is explicitly `true`', async () => {
      const configResult = await computeEslintConfig({
        e18e: {configPerformanceImprovements: {configTypescript: true}},
      });

      expect(
        configResult.getConfigByUnPostfix('e18e/performance-improvements/type-aware'),
      ).toBeDefined();
    });

    it('does not create `e18e/performance-improvements/type-aware` eslint config when `configTypescript` is `false`', async () => {
      const configResult = await computeEslintConfig({
        e18e: {configPerformanceImprovements: {configTypescript: false}},
        ts: true,
      });

      expect(
        configResult.getConfigByUnPostfix('e18e/performance-improvements/type-aware'),
      ).toBeUndefined();
    });

    it('has default TypeScript `files` in `e18e/performance-improvements/type-aware` eslint config', async () => {
      const configResult = await computeEslintConfig({
        e18e: {configPerformanceImprovements: {configTypescript: true}},
      });

      expect(
        configResult.getConfigByUnPostfix('e18e/performance-improvements/type-aware')?.files,
      ).toMatchInlineSnapshot(`["**/*.?([cm])ts?(x)"]`);
    });

    it('has default `ignores` in `e18e/performance-improvements/type-aware` eslint config (includes markdown code blocks)', async () => {
      const configResult = await computeEslintConfig({
        e18e: {configPerformanceImprovements: {configTypescript: true}},
      });

      const ignores = configResult.getConfigByUnPostfix(
        'e18e/performance-improvements/type-aware',
      )?.ignores;

      expect(ignores?.length).toBeGreaterThan(0);
      expect(ignores).to.include.members(['**/*.md?(x)/**/*.*']);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({
      e18e: {configPerformanceImprovements: {configTypescript: true}},
    });

    it('enables `e18e/no-indexof-equality` rule by default', () => {
      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry(
            'e18e/performance-improvements/type-aware',
            'e18e/no-indexof-equality',
          ),
        ),
      ).toBe(2);
    });

    it('enables `e18e/prefer-regex-test` rule by default', () => {
      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry(
            'e18e/performance-improvements/type-aware',
            'e18e/prefer-regex-test',
          ),
        ),
      ).toBe(2);
    });
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

      it('disables `e18e/performance-improvements/type-aware` eslint config when `files` is empty array', async () => {
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

        expect(ignores).to.include.members(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    describe('option: `overrides`', () => {
      it('respects `overrides` in `e18e/performance-improvements/type-aware` eslint config', async () => {
        const configResult = await computeEslintConfig({
          e18e: {
            configPerformanceImprovements: {
              configTypescript: {overrides: {'e18e/no-indexof-equality': 0}},
            },
          },
        });

        expect(
          getRuleSeverityFromEslintRuleEntry(
            configResult.getRuleEntry(
              'e18e/performance-improvements/type-aware',
              'e18e/no-indexof-equality',
            ),
          ),
        ).toBe(0);
      });
    });

    describe('option: `overridesAny`', () => {
      it('respects `overridesAny` in `e18e/performance-improvements/type-aware` eslint config', async () => {
        const configResult = await computeEslintConfig({
          e18e: {
            configPerformanceImprovements: {configTypescript: {overridesAny: {'no-console': 0}}},
          },
        });

        expect(
          getRuleSeverityFromEslintRuleEntry(
            configResult.getRuleEntry('e18e/performance-improvements/type-aware', 'no-console'),
          ),
        ).toBe(0);
      });

      it('respects both `overrides` and `overridesAny`', async () => {
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
          getRuleSeverityFromEslintRuleEntry(
            configResult.getRuleEntry(
              'e18e/performance-improvements/type-aware',
              'e18e/no-indexof-equality',
            ),
          ),
        ).toBe(0);

        expect(
          getRuleSeverityFromEslintRuleEntry(
            configResult.getRuleEntry('e18e/performance-improvements/type-aware', 'no-console'),
          ),
        ).toBe(0);
      });

      it('puts `overridesAny` after `overrides`', async () => {
        const configResult = await computeEslintConfig({
          e18e: {
            configPerformanceImprovements: {
              configTypescript: {
                overrides: {'e18e/no-indexof-equality': 1},
                overridesAny: {'e18e/no-indexof-equality': 0},
              },
            },
          },
        });

        expect(
          getRuleSeverityFromEslintRuleEntry(
            configResult.getRuleEntry(
              'e18e/performance-improvements/type-aware',
              'e18e/no-indexof-equality',
            ),
          ),
        ).toBe(0);
      });
    });

    describe('option: `forceSeverity`', () => {
      it('respects `forceSeverity` set to `warn` in `e18e/performance-improvements/type-aware` eslint config', async () => {
        const configResult = await computeEslintConfig({
          e18e: {
            configPerformanceImprovements: {configTypescript: {forceSeverity: 'warn'}},
          },
        });

        expect(
          getAllRulesSeverities(
            configResult.getConfigByUnPostfix('e18e/performance-improvements/type-aware'),
            (ruleName) => ruleName.startsWith('e18e/'),
          ),
        ).toStrictEqual([1]);
      });

      it('respects `forceSeverity` set to `error` in `e18e/performance-improvements/type-aware` eslint config', async () => {
        const configResult = await computeEslintConfig({
          e18e: {
            configPerformanceImprovements: {configTypescript: {forceSeverity: 'error'}},
          },
        });

        expect(
          getAllRulesSeverities(
            configResult.getConfigByUnPostfix('e18e/performance-improvements/type-aware'),
            (ruleName) => ruleName.startsWith('e18e/'),
          ),
        ).toStrictEqual([2]);
      });
    });
  });
});

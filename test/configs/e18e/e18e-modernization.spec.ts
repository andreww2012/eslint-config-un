describe('e18e: sub config `configModernization`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig('e18e');

    it('creates `e18e/modernization` eslint config when enabled (default)', () => {
      expect(configResult.getConfigByUnPostfix('e18e/modernization')).toBeDefined();
    });

    it('does not create `e18e/modernization` eslint config when disabled', async () => {
      const configResult = await computeEslintConfig({
        e18e: {configModernization: false},
      });

      expect(configResult.getConfigByUnPostfix('e18e/modernization')).toBeUndefined();
    });

    it('has no explicit `files` restriction in `e18e/modernization` eslint config by default (applies to all files)', () => {
      expect(configResult.getConfigByUnPostfix('e18e/modernization')?.files).toBeUndefined();
    });

    it('has default `ignores` in `e18e/modernization` eslint config', () => {
      const ignores = configResult.getConfigByUnPostfix('e18e/modernization')?.ignores;

      expect(ignores?.length).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('e18e');

    it('enables `e18e/prefer-array-at` rule by default', () => {
      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('e18e/modernization', 'e18e/prefer-array-at'),
        ),
      ).toBe(2);
    });

    it('enables `e18e/prefer-object-has-own` rule by default', () => {
      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('e18e/modernization', 'e18e/prefer-object-has-own'),
        ),
      ).toBe(2);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `e18e/modernization` eslint config', async () => {
        const FILES = ['src/**/*.js'];
        const configResult = await computeEslintConfig({
          e18e: {configModernization: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('e18e/modernization')?.files).toStrictEqual(FILES);
      });

      it('disables `e18e/modernization` eslint config when `files` is empty array', async () => {
        const configResult = await computeEslintConfig({
          e18e: {configModernization: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('e18e/modernization')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `e18e/modernization` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];
        const configResult = await computeEslintConfig({
          e18e: {configModernization: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('e18e/modernization')?.ignores;

        expect(ignores).to.include.members(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `e18e/modernization` eslint config', async () => {
      const configResult = await computeEslintConfig({
        e18e: {
          configModernization: {
            overrides: {'e18e/prefer-array-at': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('e18e/modernization', 'e18e/prefer-array-at'),
        ),
      ).toBe(0);

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('e18e/modernization', 'no-console'),
        ),
      ).toBe(0);
    });

    describe('option: `forceSeverity`', () => {
      it('respects `forceSeverity` set to `warn` in `e18e/modernization` eslint config', async () => {
        const configResult = await computeEslintConfig({
          e18e: {configModernization: {forceSeverity: 'warn'}},
        });

        expect(
          getAllRulesSeverities(
            configResult.getConfigByUnPostfix('e18e/modernization'),
            (ruleName) => ruleName.startsWith('e18e/'),
          ),
        ).toStrictEqual([1]);
      });

      it('respects `forceSeverity` set to `error` in `e18e/modernization` eslint config', async () => {
        const configResult = await computeEslintConfig({
          e18e: {configModernization: {forceSeverity: 'error'}},
        });

        expect(
          getAllRulesSeverities(
            configResult.getConfigByUnPostfix('e18e/modernization'),
            (ruleName) => ruleName.startsWith('e18e/'),
          ),
        ).toStrictEqual([2]);
      });
    });
  });
});

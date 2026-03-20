describe('jest: sub config `configTypescript`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig({jest: true, ts: true});

    it('creates `jest/ts` eslint config when `ts` config is enabled', () => {
      expect(configResult.getConfigByUnPostfix('jest/ts')).toBeDefined();
    });

    it('does not create `jest/ts` eslint config when disabled', async () => {
      const configResult = await computeEslintConfig({jest: {configTypescript: false}, ts: true});

      expect(configResult.getConfigByUnPostfix('jest/ts')).toBeUndefined();
    });

    it('does not create `jest/ts` eslint config by default when `ts` config is not enabled', async () => {
      const configResult = await computeEslintConfig('jest');

      expect(configResult.getConfigByUnPostfix('jest/ts')).toBeUndefined();
    });

    it('creates `jest/ts` eslint config with default TypeScript files', () => {
      expect(configResult.getConfigByUnPostfix('jest/ts')?.files).toMatchInlineSnapshot(
        '["**/*.spec.?([cm])ts?(x)", "**/*-spec.?([cm])ts?(x)", "**/*_spec.?([cm])ts?(x)", "**/*.test.?([cm])ts?(x)", "**/__tests__/**/*.?([cm])ts?(x)", "**/__test__/**/*.?([cm])ts?(x)"]',
      );
    });

    it('has default `ignores` in `jest/ts` eslint config', () => {
      expect(configResult.getConfigByUnPostfix('jest/ts')?.ignores?.length).toBeGreaterThan(0);
    });

    it('uses default TypeScript files even when parent `jest` config has explicit `files`', async () => {
      const FILES = ['tests/**/*.spec.ts'];
      const configResult = await computeEslintConfig({jest: {files: FILES}, ts: true});

      expect(configResult.getConfigByUnPostfix('jest/ts')?.files).toMatchInlineSnapshot(
        '["**/*.spec.?([cm])ts?(x)", "**/*-spec.?([cm])ts?(x)", "**/*_spec.?([cm])ts?(x)", "**/*.test.?([cm])ts?(x)", "**/__tests__/**/*.?([cm])ts?(x)", "**/__test__/**/*.?([cm])ts?(x)"]',
      );
    });
  });

  describe('rules', () => {
    it('enables `jest/unbound-method` rule when `ts` config is enabled implicitly', async () => {
      const configResult = await computeEslintConfig({jest: true, ts: true});

      expect(configResult.getRuleEntrySeverity('jest/ts', 'jest/unbound-method')).toBe(2);
    });

    it('enables `jest/unbound-method` rule when `ts` config is enabled explicitly', async () => {
      const configResult = await computeEslintConfig({jest: {configTypescript: true}});

      expect(configResult.getRuleEntrySeverity('jest/ts', 'jest/unbound-method')).toBe(2);
    });

    it('disables `jest/unbound-method` rule when `ts` config is explicitly disabled', async () => {
      const configResult = await computeEslintConfig({jest: {configTypescript: false}});

      expect(configResult.getRuleEntrySeverity('jest/ts', 'jest/unbound-method')).toBe(0);
    });

    it('disables `ts/unbound-method` rule to avoid conflict with `jest/unbound-method`', async () => {
      const configResult = await computeEslintConfig({jest: true, ts: true});

      expect(configResult.getRuleEntrySeverity('jest/ts', 'ts/unbound-method')).toBe(0);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `jest/ts` eslint config', async () => {
        const FILES = ['src/**/*.spec.ts'];
        const configResult = await computeEslintConfig({
          jest: {configTypescript: {files: FILES}},
          ts: true,
        });

        expect(configResult.getConfigByUnPostfix('jest/ts')?.files).toStrictEqual(FILES);
      });

      it('disables `jest/ts` eslint config when `files` is empty array', async () => {
        const configResult = await computeEslintConfig({
          jest: {configTypescript: {files: []}},
          ts: true,
        });

        expect(configResult.getConfigByUnPostfix('jest/ts')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `jest/ts` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];
        const configResult = await computeEslintConfig({
          jest: {configTypescript: {ignores: IGNORES}},
          ts: true,
        });

        const ignores = configResult.getConfigByUnPostfix('jest/ts')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `jest/ts` eslint config', async () => {
      const configResult = await computeEslintConfig({
        jest: {
          configTypescript: {
            overrides: {'jest/no-untyped-mock-factory': 0},
            overridesAny: {'no-console': 0},
          },
        },
        ts: true,
      });

      expect(configResult.getRuleEntrySeverity('jest/ts', 'jest/no-untyped-mock-factory')).toBe(0);
      expect(configResult.getRuleEntrySeverity('jest/ts', 'no-console')).toBe(0);
    });

    describe('option: `forceSeverity`', () => {
      it('respects `forceSeverity` set to `error` in `jest/ts` eslint config', async () => {
        const configResult = await computeEslintConfig({
          jest: {configTypescript: {forceSeverity: 'error'}},
          ts: true,
        });

        expect(
          getAllRulesSeverities(configResult.getConfigByUnPostfix('jest/ts'), (ruleName) =>
            ruleName.startsWith('jest/'),
          ),
        ).toStrictEqual([2]);
      });

      it('respects `forceSeverity` set to `warn` in `jest/ts` eslint config', async () => {
        const configResult = await computeEslintConfig({
          jest: {configTypescript: {forceSeverity: 'warn'}},
          ts: true,
        });

        expect(
          getAllRulesSeverities(configResult.getConfigByUnPostfix('jest/ts'), (ruleName) =>
            ruleName.startsWith('jest/'),
          ),
        ).toStrictEqual([1]);
      });
    });
  });
});

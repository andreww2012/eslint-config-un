describe('jest: sub config `typescript`', () => {
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
        '["**/*[.-_]spec.?([cm])ts?(x)", "**/*.test.?([cm])ts?(x)", "**/__test?(s)__/**/*.?([cm])ts?(x)"]',
      );
    });

    it('has default `ignores` in `jest/ts` eslint config', () => {
      expect(configResult.getConfigByUnPostfix('jest/ts')?.ignores?.length).toBeGreaterThan(0);
    });

    it('uses default TypeScript files even when parent `jest` config has explicit `files`', async () => {
      const FILES = ['tests/**/*.spec.ts'];

      const configResult = await computeEslintConfig({jest: {files: FILES}, ts: true});

      expect(configResult.getConfigByUnPostfix('jest/ts')?.files).toMatchInlineSnapshot(
        '["**/*[.-_]spec.?([cm])ts?(x)", "**/*.test.?([cm])ts?(x)", "**/__test?(s)__/**/*.?([cm])ts?(x)"]',
      );
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig({jest: true, ts: true});

      expect(configResult.getRuleSeverities('jest/ts')).toMatchObject({
        'jest/unbound-method': 2,
        'ts/unbound-method': 0,
      });
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

      it('disables `jest/ts` eslint config when set to empty array', async () => {
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
  });
});

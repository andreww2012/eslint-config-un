beforeEach(() => {
  addInstalledPackages({vitest: '2.0.0'});
});

describe('vitest: sub config `typescript`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig({vitest: true, ts: true});

    it('creates `vitest/ts` eslint config when the `ts` config is enabled', () => {
      expect(configResult.getConfigByUnPostfix('vitest/ts')).toBeDefined();
    });

    it('does not create `vitest/ts` eslint config when the `ts` config is disabled', async () => {
      const configResult = await computeEslintConfig({vitest: true, ts: false});

      expect(configResult.getConfigByUnPostfix('vitest/ts')).toBeUndefined();
    });

    it('creates `vitest/ts` eslint config when set to `true` even if the `ts` config is disabled', async () => {
      const configResult = await computeEslintConfig({
        vitest: {configTypescript: true},
        ts: false,
      });

      expect(configResult.getConfigByUnPostfix('vitest/ts')).toBeDefined();
    });

    it('does not create `vitest/ts` eslint config when set to `false` even if the `ts` config is enabled', async () => {
      const configResult = await computeEslintConfig({
        vitest: {configTypescript: false},
        ts: true,
      });

      expect(configResult.getConfigByUnPostfix('vitest/ts')).toBeUndefined();
    });

    it('has default `files` in `vitest/ts` eslint config', () => {
      expect(configResult.getConfigByUnPostfix('vitest/ts')?.files).toMatchInlineSnapshot(
        '["**/*[.-_]spec.?([cm])ts?(x)", "**/*.test.?([cm])ts?(x)", "**/__test?(s)__/**/*.?([cm])ts?(x)", "**/*.{bench,benchmark}.?([cm])ts?(x)"]',
      );
    });

    it('has default `ignores` in `vitest/ts` eslint config', () => {
      expect(configResult.getConfigByUnPostfix('vitest/ts')?.ignores?.length).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({vitest: true, ts: true});

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('vitest/ts')).toMatchObject({
        'vitest/unbound-method': 2,
        'ts/unbound-method': 0,
      });
    });

    it('does not add `vitest/unbound-method` rule to the main `vitest` eslint config', () => {
      expect(configResult.getRuleEntry('vitest', 'vitest/unbound-method')).toBeUndefined();
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `vitest/ts` eslint config', async () => {
        const FILES = ['tests/**/*.spec.ts'];

        const configResult = await computeEslintConfig({
          vitest: {configTypescript: {files: FILES}},
          ts: true,
        });

        expect(configResult.getConfigByUnPostfix('vitest/ts')?.files).toStrictEqual(FILES);
      });

      it('disables `vitest/ts` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          vitest: {configTypescript: {files: []}},
          ts: true,
        });

        expect(configResult.getConfigByUnPostfix('vitest/ts')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `vitest/ts` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          vitest: {configTypescript: {ignores: IGNORES}},
          ts: true,
        });

        const ignores = configResult.getConfigByUnPostfix('vitest/ts')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `vitest/ts` eslint config', async () => {
      const configResult = await computeEslintConfig({
        vitest: {
          configTypescript: {
            overrides: {'vitest/unbound-method': 0},
            overridesAny: {'no-console': 0},
          },
        },
        ts: true,
      });

      expect(configResult.getRuleSeverities('vitest/ts')).toMatchObject({
        'vitest/unbound-method': 0,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `settings`', () => {
      it('sets plugin settings on `vitest/ts` eslint config', async () => {
        const PLUGIN_SETTINGS = {typecheck: true};

        const configResult = await computeEslintConfig({
          vitest: {settings: PLUGIN_SETTINGS},
          ts: true,
        });

        expect(configResult.getConfigByUnPostfix('vitest/ts')?.settings?.['vitest']).toStrictEqual(
          PLUGIN_SETTINGS,
        );
      });
    });
  });
});

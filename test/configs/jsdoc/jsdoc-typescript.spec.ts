const FIXTURES = {
  typeAnnotatedJsdoc: 'type-annotated-jsdoc.ts',
} as const;

describe('jsdoc: sub config `typescript`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig({jsdoc: true, ts: true});

    it('creates `jsdoc/ts` eslint config when enabled (default when `ts` config is enabled)', () => {
      expect(configResult.getConfigByUnPostfix('jsdoc/ts')).toBeDefined();
    });

    it('does not create `jsdoc/ts` eslint config when disabled', async () => {
      const configResult = await computeEslintConfig({
        jsdoc: {configTypescript: false},
        ts: true,
      });

      expect(configResult.getConfigByUnPostfix('jsdoc/ts')).toBeUndefined();
    });

    it('does not create `jsdoc/ts` eslint config when `jsdoc` is enabled, but `ts` is not', async () => {
      const configResult = await computeEslintConfig({jsdoc: true});

      expect(configResult.getConfigByUnPostfix('jsdoc/ts')).toBeUndefined();
    });

    it('creates `jsdoc/ts` eslint config with default TypeScript files', () => {
      expect(configResult.getConfigByUnPostfix('jsdoc/ts')?.files).toMatchInlineSnapshot(
        '["**/*.?([cm])ts?(x)"]',
      );
    });

    it('has default `ignores` in `jsdoc/ts` eslint config', () => {
      expect(configResult.getConfigByUnPostfix('jsdoc/ts')?.ignores?.length).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({jsdoc: true, ts: true});

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('jsdoc/ts')).toMatchObject({
        'jsdoc/no-types': 2,
        'jsdoc/no-undefined-types': 0,
      });
    });

    it('`jsdoc/no-types` rule fires on type annotations in TypeScript JSDoc comments', async () => {
      const results = await testEslintConfig(
        {jsdoc: true, ts: true},
        FIXTURES.typeAnnotatedJsdoc,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.typeAnnotatedJsdoc,
        'jsdoc/no-types',
      );

      expect(error?.message).toMatchInlineSnapshot('"Types are not permitted on @param."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `jsdoc/ts` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          jsdoc: {configTypescript: {files: FILES}},
          ts: true,
        });

        expect(configResult.getConfigByUnPostfix('jsdoc/ts')?.files).toStrictEqual(FILES);
      });

      it('disables `jsdoc/ts` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          jsdoc: {configTypescript: {files: []}},
          ts: true,
        });

        expect(configResult.getConfigByUnPostfix('jsdoc/ts')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `jsdoc/ts` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          jsdoc: {configTypescript: {ignores: IGNORES}},
          ts: true,
        });

        const ignores = configResult.getConfigByUnPostfix('jsdoc/ts')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `jsdoc/ts` eslint config', async () => {
      const configResult = await computeEslintConfig({
        jsdoc: {
          configTypescript: {overrides: {'jsdoc/no-types': 0}, overridesAny: {'no-console': 0}},
        },
        ts: true,
      });

      expect(configResult.getRuleEntrySeverity('jsdoc/ts', 'jsdoc/no-types')).toBe(0);
      expect(configResult.getRuleEntrySeverity('jsdoc/ts', 'no-console')).toBe(0);
    });
  });

  describe('options', () => {
    describe('option: `settings`', () => {
      const SETTINGS = {ignorePrivate: true, mode: 'jsdoc'} as const;

      it('inherits jsdoc settings from root config by default', async () => {
        const configResult = await computeEslintConfig({
          jsdoc: {settings: SETTINGS},
          ts: true,
        });

        const config = configResult.getConfigByUnPostfix('jsdoc/ts');

        expect(config?.settings?.['jsdoc']).toStrictEqual(SETTINGS);
      });

      it('uses sub-config-specific jsdoc settings when provided', async () => {
        const SUB_SETTINGS = {mode: 'typescript'} as const;

        const configResult = await computeEslintConfig({
          jsdoc: {
            settings: SETTINGS,
            configTypescript: {settings: SUB_SETTINGS},
          },
          ts: true,
        });

        const config = configResult.getConfigByUnPostfix('jsdoc/ts');

        expect(config?.settings?.['jsdoc']).toStrictEqual(SUB_SETTINGS);
      });
    });
  });
});

beforeEach(() => {
  addInstalledPackages({zod: '4.3.5'});
});

describe('zod: sub config `core`', () => {
  describe('basic tests', () => {
    it('creates `zod/core` eslint config and loads `zod-core` plugin by default', async () => {
      const configResult = await computeEslintConfig('zod');

      expect(configResult.getLoadedPlugin('zod-core')).toBeDefined();

      const config = configResult.getConfigByUnPostfix('zod/core');

      expect(config).toBeDefined();
      expect(config?.files).toBeUndefined();
    });

    it('does not create `zod/core` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({zod: {configCore: false}});

      expect(configResult.getConfigByUnPostfix('zod/core')).toBeUndefined();
    });

    it('creates `zod/core` eslint config when set to `true`', async () => {
      const configResult = await computeEslintConfig({zod: {configCore: true}});

      expect(configResult.getConfigByUnPostfix('zod/core')).toBeDefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig('zod');

      expect(configResult.getRuleSeverities('zod/core')).toMatchObject({
        'zod-core/consistent-import': 2,
        'zod-core/consistent-schema-output-type-style': 2,
      });
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `zod/core` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({zod: {configCore: {files: FILES}}});

        expect(configResult.getConfigByUnPostfix('zod/core')?.files).toStrictEqual(FILES);
      });

      it('disables `zod/core` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({zod: {configCore: {files: []}}});

        expect(configResult.getConfigByUnPostfix('zod/core')).toBeUndefined();
      });

      it('inherits parent `files` when sub-config does not specify `files` or `ignores`', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({zod: {files: FILES}});

        expect(configResult.getConfigByUnPostfix('zod/core')?.files).toStrictEqual(FILES);
      });

      it('does not inherit parent `files` when sub-config specifies its own `files`', async () => {
        const PARENT_FILES = ['src/**/*.ts'];
        const SUB_FILES = ['lib/**/*.ts'];

        const configResult = await computeEslintConfig({
          zod: {files: PARENT_FILES, configCore: {files: SUB_FILES}},
        });

        expect(configResult.getConfigByUnPostfix('zod/core')?.files).toStrictEqual(SUB_FILES);
      });

      it('does not inherit parent `files` when sub-config specifies its own `ignores`', async () => {
        const PARENT_FILES = ['src/**/*.ts'];
        const SUB_IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          zod: {files: PARENT_FILES, configCore: {ignores: SUB_IGNORES}},
        });

        expect(configResult.getConfigByUnPostfix('zod/core')?.files).not.toIncludeAnyMembers(
          PARENT_FILES,
        );
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `zod/core` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({zod: {configCore: {ignores: IGNORES}}});

        const ignores = configResult.getConfigByUnPostfix('zod/core')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });

      it('inherits parent `ignores` when sub-config does not specify `files` or `ignores`', async () => {
        const IGNORES = ['**/parent-ignored/**'];

        const configResult = await computeEslintConfig({zod: {ignores: IGNORES}});

        expect(configResult.getConfigByUnPostfix('zod/core')?.ignores).toIncludeAllMembers(IGNORES);
      });

      it('does not inherit parent `ignores` when sub-config specifies its own `ignores`', async () => {
        const PARENT_IGNORES = ['**/parent-ignored/**'];
        const SUB_IGNORES = ['**/sub-ignored/**'];

        const configResult = await computeEslintConfig({
          zod: {ignores: PARENT_IGNORES, configCore: {ignores: SUB_IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('zod/core')?.ignores;

        expect(ignores).toIncludeAllMembers(SUB_IGNORES);
        expect(ignores).not.toIncludeAnyMembers(PARENT_IGNORES);
      });

      it('does not inherit parent `ignores` when sub-config specifies its own `files`', async () => {
        const PARENT_IGNORES = ['**/parent-ignored/**'];
        const SUB_FILES = ['lib/**/*.ts'];

        const configResult = await computeEslintConfig({
          zod: {ignores: PARENT_IGNORES, configCore: {files: SUB_FILES}},
        });

        expect(configResult.getConfigByUnPostfix('zod/core')?.ignores).not.toIncludeAnyMembers(
          PARENT_IGNORES,
        );
      });
    });

    it('respects `overrides` and `overridesAny` in `zod/core` eslint config', async () => {
      const configResult = await computeEslintConfig({
        zod: {
          configCore: {
            overrides: {'zod-core/consistent-import': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('zod/core')).toMatchObject({
        'zod-core/consistent-import': 0,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `enforceConsistentImport`', () => {
      it('inherits parent `false` value, disabling `zod-core/consistent-import`', async () => {
        const configResult = await computeEslintConfig({zod: {enforceConsistentImport: false}});

        expect(configResult.getRuleEntrySeverity('zod/core', 'zod-core/consistent-import')).toBe(0);
      });

      it("inherits parent `'named'` value", async () => {
        const configResult = await computeEslintConfig({
          zod: {enforceConsistentImport: 'named'},
        });

        expect(
          configResult.getRuleEntry('zod/core', 'zod-core/consistent-import'),
        ).toMatchInlineSnapshot('[2, {"syntax": "named"}]');
      });

      it('overrides parent value when set in sub-config', async () => {
        const configResult = await computeEslintConfig({
          zod: {
            enforceConsistentImport: false,
            configCore: {enforceConsistentImport: true},
          },
        });

        expect(configResult.getRuleEntrySeverity('zod', 'zod/consistent-import')).toBe(0);
        expect(configResult.getRuleEntrySeverity('zod/core', 'zod-core/consistent-import')).toBe(2);
      });

      it("overrides parent value when set to `'named'` in sub-config", async () => {
        const configResult = await computeEslintConfig({
          zod: {
            enforceConsistentImport: 'namespace',
            configCore: {enforceConsistentImport: 'named'},
          },
        });

        expect(configResult.getRuleEntry('zod', 'zod/consistent-import')).toMatchInlineSnapshot(
          '[2, {"syntax": "namespace"}]',
        );
        expect(
          configResult.getRuleEntry('zod/core', 'zod-core/consistent-import'),
        ).toMatchInlineSnapshot('[2, {"syntax": "named"}]');
      });
    });
  });
});

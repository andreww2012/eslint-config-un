beforeEach(() => {
  addInstalledPackages({zod: '4.3.5'});
});

describe('zod: sub config `mini`', () => {
  describe('basic tests', () => {
    it('creates `zod/mini` eslint config and loads `zod-mini` plugin by default', async () => {
      const configResult = await computeEslintConfig('zod');

      expect(configResult.getLoadedPlugin('zod-mini')).toBeDefined();

      const config = configResult.getConfigByUnPostfix('zod/mini');

      expect(config).toBeDefined();
      expect(config?.files).toBeUndefined();
    });

    it('does not create `zod/mini` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({zod: {configMini: false}});

      expect(configResult.getConfigByUnPostfix('zod/mini')).toBeUndefined();
    });

    it('creates `zod/mini` eslint config when set to `true`', async () => {
      const configResult = await computeEslintConfig({zod: {configMini: true}});

      expect(configResult.getConfigByUnPostfix('zod/mini')).toBeDefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig('zod');

      expect(configResult.getRuleSeverities('zod/mini')).toMatchObject({
        'zod-mini/consistent-import': 2,
        'zod-mini/consistent-import-source': 0,
      });
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `zod/mini` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({zod: {configMini: {files: FILES}}});

        expect(configResult.getConfigByUnPostfix('zod/mini')?.files).toStrictEqual(FILES);
      });

      it('disables `zod/mini` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({zod: {configMini: {files: []}}});

        expect(configResult.getConfigByUnPostfix('zod/mini')).toBeUndefined();
      });

      it('inherits parent `files` when sub-config does not specify `files` and `ignores`', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({zod: {files: FILES}});

        expect(configResult.getConfigByUnPostfix('zod/mini')?.files).toStrictEqual(FILES);
      });

      it('does not inherit parent `files` when sub-config specifies its own `files`', async () => {
        const PARENT_FILES = ['src/**/*.ts'];
        const SUB_FILES = ['lib/**/*.ts'];

        const configResult = await computeEslintConfig({
          zod: {files: PARENT_FILES, configMini: {files: SUB_FILES}},
        });

        expect(configResult.getConfigByUnPostfix('zod/mini')?.files).toStrictEqual(SUB_FILES);
      });

      it('does not inherit parent `files` when sub-config specifies its own `ignores`', async () => {
        const PARENT_FILES = ['src/**/*.ts'];
        const SUB_IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          zod: {files: PARENT_FILES, configMini: {ignores: SUB_IGNORES}},
        });

        expect(configResult.getConfigByUnPostfix('zod/mini')?.files).not.toIncludeAnyMembers(
          PARENT_FILES,
        );
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `zod/mini` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({zod: {configMini: {ignores: IGNORES}}});

        const ignores = configResult.getConfigByUnPostfix('zod/mini')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });

      it('inherits parent `ignores` when sub-config does not specify `files` or `ignores`', async () => {
        const IGNORES = ['**/parent-ignored/**'];

        const configResult = await computeEslintConfig({zod: {ignores: IGNORES}});

        expect(configResult.getConfigByUnPostfix('zod/mini')?.ignores).toIncludeAllMembers(IGNORES);
      });

      it('does not inherit parent `ignores` when sub-config specifies its own `ignores`', async () => {
        const PARENT_IGNORES = ['**/parent-ignored/**'];
        const SUB_IGNORES = ['**/sub-ignored/**'];

        const configResult = await computeEslintConfig({
          zod: {ignores: PARENT_IGNORES, configMini: {ignores: SUB_IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('zod/mini')?.ignores;

        expect(ignores).toIncludeAllMembers(SUB_IGNORES);
        expect(ignores).not.toIncludeAnyMembers(PARENT_IGNORES);
      });

      it('does not inherit parent `ignores` when sub-config specifies its own `files`', async () => {
        const PARENT_IGNORES = ['**/parent-ignored/**'];
        const SUB_FILES = ['lib/**/*.ts'];

        const configResult = await computeEslintConfig({
          zod: {ignores: PARENT_IGNORES, configMini: {files: SUB_FILES}},
        });

        expect(configResult.getConfigByUnPostfix('zod/mini')?.ignores).not.toIncludeAnyMembers(
          PARENT_IGNORES,
        );
      });
    });

    it('respects `overrides` and `overridesAny` in `zod/mini` eslint config', async () => {
      const configResult = await computeEslintConfig({
        zod: {
          configMini: {
            overrides: {'zod-mini/no-any-schema': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('zod/mini')).toMatchObject({
        'zod-mini/no-any-schema': 0,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `enforceConsistentImport`', () => {
      it('inherits parent `false` value, disabling `zod-mini/consistent-import`', async () => {
        const configResult = await computeEslintConfig({zod: {enforceConsistentImport: false}});

        expect(configResult.getRuleEntrySeverity('zod/mini', 'zod-mini/consistent-import')).toBe(0);
      });

      it("inherits parent `'named'` value", async () => {
        const configResult = await computeEslintConfig({zod: {enforceConsistentImport: 'named'}});

        expect(
          configResult.getRuleEntry('zod/mini', 'zod-mini/consistent-import'),
        ).toMatchInlineSnapshot('[2, {"syntax": "named"}]');
      });

      it('overrides parent value when set in sub-config', async () => {
        const configResult = await computeEslintConfig({
          zod: {
            enforceConsistentImport: false,
            configMini: {enforceConsistentImport: true},
          },
        });

        expect(configResult.getRuleEntrySeverity('zod', 'zod/consistent-import')).toBe(0);
        expect(configResult.getRuleEntrySeverity('zod/mini', 'zod-mini/consistent-import')).toBe(2);
      });

      it("overrides parent value when set to `'named'` in sub-config", async () => {
        const configResult = await computeEslintConfig({
          zod: {
            enforceConsistentImport: 'namespace',
            configMini: {enforceConsistentImport: 'named'},
          },
        });

        expect(configResult.getRuleEntry('zod', 'zod/consistent-import')).toMatchInlineSnapshot(
          '[2, {"syntax": "namespace"}]',
        );
        expect(
          configResult.getRuleEntry('zod/mini', 'zod-mini/consistent-import'),
        ).toMatchInlineSnapshot('[2, {"syntax": "named"}]');
      });
    });

    describe('option: `schemaVariableName`', () => {
      it('inherits parent `false` value, disabling `zod-mini/consistent-schema-var-name`', async () => {
        const configResult = await computeEslintConfig({zod: {schemaVariableName: false}});

        expect(
          configResult.getRuleEntrySeverity('zod/mini', 'zod-mini/consistent-schema-var-name'),
        ).toBe(0);
      });

      it('inherits parent string value', async () => {
        const configResult = await computeEslintConfig({zod: {schemaVariableName: 'Schema'}});

        expect(
          configResult.getRuleEntry('zod/mini', 'zod-mini/consistent-schema-var-name'),
        ).toMatchInlineSnapshot('[2, {"after": "Schema"}]');
      });

      it('overrides parent value when set in sub-config', async () => {
        const configResult = await computeEslintConfig({
          zod: {
            schemaVariableName: 'Zod',
            configMini: {schemaVariableName: 'Schema'},
          },
        });

        expect(
          configResult.getRuleEntry('zod', 'zod/consistent-schema-var-name'),
        ).toMatchInlineSnapshot('[2, {"after": "Zod"}]');
        expect(
          configResult.getRuleEntry('zod/mini', 'zod-mini/consistent-schema-var-name'),
        ).toMatchInlineSnapshot('[2, {"after": "Schema"}]');
      });

      it('overrides parent object value entirely when set to an object in sub-config', async () => {
        const configResult = await computeEslintConfig({
          zod: {
            schemaVariableName: {before: 'My', after: 'Zod'},
            configMini: {schemaVariableName: {after: 'Schema'}},
          },
        });

        expect(
          configResult.getRuleEntry('zod', 'zod/consistent-schema-var-name'),
        ).toMatchInlineSnapshot('[2, {"after": "Zod", "before": "My"}]');
        expect(
          configResult.getRuleEntry('zod/mini', 'zod-mini/consistent-schema-var-name'),
        ).toMatchInlineSnapshot('[2, {"after": "Schema"}]');
      });
    });

    describe('option: `allowedObjectSchemaTypes`', () => {
      it('inherits parent value, restricting `zod-mini/consistent-object-schema-type`', async () => {
        const configResult = await computeEslintConfig({
          zod: {allowedObjectSchemaTypes: {object: false}},
        });

        expect(
          configResult.getRuleEntry('zod/mini', 'zod-mini/consistent-object-schema-type'),
        ).toMatchInlineSnapshot('[2, {"allow": ["looseObject", "strictObject"]}]');
      });

      it('overrides parent value entirely when set in sub-config', async () => {
        const configResult = await computeEslintConfig({
          zod: {
            allowedObjectSchemaTypes: {object: false},
            configMini: {allowedObjectSchemaTypes: {looseObject: false}},
          },
        });

        expect(
          configResult.getRuleEntry('zod', 'zod/consistent-object-schema-type'),
        ).toMatchInlineSnapshot('[2, {"allow": ["looseObject", "strictObject"]}]');
        expect(
          configResult.getRuleEntry('zod/mini', 'zod-mini/consistent-object-schema-type'),
        ).toMatchInlineSnapshot('[2, {"allow": ["object", "strictObject"]}]');
      });

      it('can re-enable a type disabled by parent when set in sub-config', async () => {
        const configResult = await computeEslintConfig({
          zod: {
            allowedObjectSchemaTypes: {object: false},
            configMini: {allowedObjectSchemaTypes: {object: true}},
          },
        });

        expect(
          configResult.getRuleEntrySeverity('zod/mini', 'zod-mini/consistent-object-schema-type'),
        ).toBe(0);
      });
    });
  });
});

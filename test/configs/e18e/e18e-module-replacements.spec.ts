describe('e18e: sub config `configModuleReplacements`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig('e18e');

    it('creates `e18e/module-replacements` eslint config when enabled (default)', () => {
      expect(configResult.getConfigByUnPostfix('e18e/module-replacements')).toBeDefined();
    });

    it('does not create `e18e/module-replacements` eslint config when disabled', async () => {
      const configResult = await computeEslintConfig({
        e18e: {configModuleReplacements: false},
      });

      expect(configResult.getConfigByUnPostfix('e18e/module-replacements')).toBeUndefined();
    });

    it('has default `files` in `e18e/module-replacements` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('e18e/module-replacements')?.files,
      ).toMatchInlineSnapshot(`["**/package.json"]`);
    });

    it('has default `ignores` in `e18e/module-replacements` eslint config', () => {
      const ignores = configResult.getConfigByUnPostfix('e18e/module-replacements')?.ignores;

      expect(ignores?.length).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('e18e');

    it('enables `e18e/ban-dependencies` rule by default', () => {
      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('e18e/module-replacements', 'e18e/ban-dependencies'),
        ),
      ).toBe(2);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `e18e/module-replacements` eslint config', async () => {
        const FILES = ['**/package.json', '**/packages/*/package.json'];
        const configResult = await computeEslintConfig({
          e18e: {configModuleReplacements: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('e18e/module-replacements')?.files).toStrictEqual(
          FILES,
        );
      });

      it('disables `e18e/module-replacements` eslint config when `files` is empty array', async () => {
        const configResult = await computeEslintConfig({
          e18e: {configModuleReplacements: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('e18e/module-replacements')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `e18e/module-replacements` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/package.json'];
        const configResult = await computeEslintConfig({
          e18e: {configModuleReplacements: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('e18e/module-replacements')?.ignores;

        expect(ignores).to.include.members(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    describe('option: `overrides`', () => {
      it('respects `overrides` in `e18e/module-replacements` eslint config', async () => {
        const configResult = await computeEslintConfig({
          e18e: {configModuleReplacements: {overrides: {'e18e/ban-dependencies': 0}}},
        });

        expect(
          getRuleSeverityFromEslintRuleEntry(
            configResult.getRuleEntry('e18e/module-replacements', 'e18e/ban-dependencies'),
          ),
        ).toBe(0);
      });
    });

    describe('option: `overridesAny`', () => {
      it('respects `overridesAny` in `e18e/module-replacements` eslint config', async () => {
        const configResult = await computeEslintConfig({
          e18e: {configModuleReplacements: {overridesAny: {'no-console': 0}}},
        });

        expect(
          getRuleSeverityFromEslintRuleEntry(
            configResult.getRuleEntry('e18e/module-replacements', 'no-console'),
          ),
        ).toBe(0);
      });

      it('respects both `overrides` and `overridesAny`', async () => {
        const configResult = await computeEslintConfig({
          e18e: {
            configModuleReplacements: {
              overrides: {'e18e/ban-dependencies': 0},
              overridesAny: {'no-console': 0},
            },
          },
        });

        expect(
          getRuleSeverityFromEslintRuleEntry(
            configResult.getRuleEntry('e18e/module-replacements', 'e18e/ban-dependencies'),
          ),
        ).toBe(0);

        expect(
          getRuleSeverityFromEslintRuleEntry(
            configResult.getRuleEntry('e18e/module-replacements', 'no-console'),
          ),
        ).toBe(0);
      });

      it('puts `overridesAny` after `overrides`', async () => {
        const configResult = await computeEslintConfig({
          e18e: {
            configModuleReplacements: {
              overrides: {'e18e/ban-dependencies': 1},
              overridesAny: {'e18e/ban-dependencies': 0},
            },
          },
        });

        expect(
          getRuleSeverityFromEslintRuleEntry(
            configResult.getRuleEntry('e18e/module-replacements', 'e18e/ban-dependencies'),
          ),
        ).toBe(0);
      });
    });

    describe('option: `forceSeverity`', () => {
      it('respects `forceSeverity` set to `warn` in `e18e/module-replacements` eslint config', async () => {
        const configResult = await computeEslintConfig({
          e18e: {configModuleReplacements: {forceSeverity: 'warn'}},
        });

        expect(
          getAllRulesSeverities(
            configResult.getConfigByUnPostfix('e18e/module-replacements'),
            (ruleName) => ruleName.startsWith('e18e/'),
          ),
        ).toStrictEqual([1]);
      });

      it('respects `forceSeverity` set to `error` in `e18e/module-replacements` eslint config', async () => {
        const configResult = await computeEslintConfig({
          e18e: {configModuleReplacements: {forceSeverity: 'error'}},
        });

        expect(
          getAllRulesSeverities(
            configResult.getConfigByUnPostfix('e18e/module-replacements'),
            (ruleName) => ruleName.startsWith('e18e/'),
          ),
        ).toStrictEqual([2]);
      });
    });
  });

  describe('options', () => {
    describe('option: `options`', () => {
      it('does not add options to `e18e/ban-dependencies` rule by default', async () => {
        const configResult = await computeEslintConfig('e18e');

        expect(
          configResult.getRuleEntry('e18e/module-replacements', 'e18e/ban-dependencies'),
        ).toMatchInlineSnapshot(`[2]`);
      });

      it('passes custom `options` to `e18e/ban-dependencies` rule when provided', async () => {
        const configResult = await computeEslintConfig({
          e18e: {configModuleReplacements: {options: {modules: ['lodash']}}},
        });

        expect(
          configResult.getRuleEntry('e18e/module-replacements', 'e18e/ban-dependencies'),
        ).toMatchInlineSnapshot(`[2, {"modules": ["lodash"]}]`);
      });
    });
  });
});

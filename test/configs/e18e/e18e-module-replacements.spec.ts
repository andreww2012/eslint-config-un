describe('e18e: sub config `moduleReplacements`', () => {
  describe('basic tests', () => {
    it('creates `e18e/module-replacements` eslint config by default', async () => {
      const configResult = await computeEslintConfig('e18e');

      const config = configResult.getConfigByUnPostfix('e18e/module-replacements');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/package.json"]');
    });

    it('does not create `e18e/module-replacements` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({e18e: {configModuleReplacements: false}});

      expect(configResult.getConfigByUnPostfix('e18e/module-replacements')).toBeUndefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig('e18e');

      expect(configResult.getRuleSeverities('e18e/module-replacements')).toMatchObject({
        'e18e/ban-dependencies': 2,
      });
    });

    // TODO rule in action test
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

      it('disables `e18e/module-replacements` eslint config when set to empty array', async () => {
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

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `e18e/module-replacements` eslint config', async () => {
      const configResult = await computeEslintConfig({
        e18e: {
          configModuleReplacements: {
            overrides: {'e18e/ban-dependencies': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('e18e/module-replacements')).toMatchObject({
        'e18e/ban-dependencies': 0,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `options`', () => {
      it('does not add options to `e18e/ban-dependencies` rule by default', async () => {
        const configResult = await computeEslintConfig('e18e');

        expect(
          configResult.getRuleEntry('e18e/module-replacements', 'e18e/ban-dependencies'),
        ).toMatchInlineSnapshot('2');
      });

      it('passes custom `options` to `e18e/ban-dependencies` rule when provided', async () => {
        const OPTIONS = {modules: ['lodash']};

        const configResult = await computeEslintConfig({
          e18e: {configModuleReplacements: {options: OPTIONS}},
        });

        expect(
          configResult.getRuleEntryOptions('e18e/module-replacements', 'e18e/ban-dependencies'),
        ).toStrictEqual([OPTIONS]);
      });
    });
  });
});

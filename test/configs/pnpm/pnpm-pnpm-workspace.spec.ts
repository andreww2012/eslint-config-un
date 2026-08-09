const FIXTURES = {
  pnpmWorkspace: 'pnpm-workspace.yaml',
  pnpmWorkspaceWithCatalog: 'with-catalog/pnpm-workspace.yaml',
} as const;

describe('pnpm: sub config `pnpmWorkspace`', () => {
  describe('basic tests', () => {
    it('creates `pnpm/pnpm-workspace-yaml` eslint config by default', async () => {
      const configResult = await computeEslintConfig('pnpm');

      const config = configResult.getConfigByUnPostfix('pnpm/pnpm-workspace-yaml');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["pnpm-workspace.yaml"]');
      expect(config?.ignores?.length).toBeGreaterThan(0);
    });

    it('does not create `pnpm/pnpm-workspace-yaml` eslint config when disabled', async () => {
      const configResult = await computeEslintConfig({pnpm: {configPnpmWorkspace: false}});

      expect(configResult.getConfigByUnPostfix('pnpm/pnpm-workspace-yaml')).toBeUndefined();
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('pnpm');

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('pnpm/pnpm-workspace-yaml')).toMatchObject({
        'pnpm/yaml-no-duplicate-catalog-item': 2,
        'pnpm/yaml-enforce-settings': 0,
      });
    });

    it('`pnpm/yaml-no-unused-catalog-item` rule fires on a `pnpm-workspace.yaml` with unused catalog items', async () => {
      const results = await testEslintConfig(
        {pnpm: {configPnpmWorkspace: {files: ['**/pnpm-workspace.yaml']}}},
        FIXTURES.pnpmWorkspaceWithCatalog,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.pnpmWorkspaceWithCatalog,
        'pnpm/yaml-no-unused-catalog-item',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"Catalog item "react:default" is not used in any package.json."',
      );
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `pnpm/pnpm-workspace-yaml` eslint config', async () => {
        const FILES = ['workspace.yaml'];

        const configResult = await computeEslintConfig({
          pnpm: {configPnpmWorkspace: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('pnpm/pnpm-workspace-yaml')?.files).toStrictEqual(
          FILES,
        );
      });

      it('disables `pnpm/pnpm-workspace-yaml` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          pnpm: {configPnpmWorkspace: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('pnpm/pnpm-workspace-yaml')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `pnpm/pnpm-workspace-yaml` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          pnpm: {configPnpmWorkspace: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('pnpm/pnpm-workspace-yaml')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `pnpm/pnpm-workspace-yaml` eslint config', async () => {
      const configResult = await computeEslintConfig({
        pnpm: {
          configPnpmWorkspace: {
            overrides: {'pnpm/yaml-no-duplicate-catalog-item': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(
        configResult.getRuleEntrySeverity(
          'pnpm/pnpm-workspace-yaml',
          'pnpm/yaml-no-duplicate-catalog-item',
        ),
      ).toBe(0);
      expect(configResult.getRuleEntrySeverity('pnpm/pnpm-workspace-yaml', 'no-console')).toBe(0);
    });
  });

  describe('options', () => {
    describe('option: `enforcePnpmWorkspaceSettings`', () => {
      it('disables `pnpm/yaml-enforce-settings` rule by default', async () => {
        const configResult = await computeEslintConfig('pnpm');

        expect(
          configResult.getRuleEntrySeverity(
            'pnpm/pnpm-workspace-yaml',
            'pnpm/yaml-enforce-settings',
          ),
        ).toBe(0);
      });

      it('enables `pnpm/yaml-enforce-settings` rule with options when `enforcePnpmWorkspaceSettings` is provided', async () => {
        const SETTINGS = {requiredFields: ['catalogs']};

        const configResult = await computeEslintConfig({
          pnpm: {configPnpmWorkspace: {enforcePnpmWorkspaceSettings: SETTINGS}},
        });

        expect(
          configResult.getRuleEntryOptions(
            'pnpm/pnpm-workspace-yaml',
            'pnpm/yaml-enforce-settings',
          ),
        ).toStrictEqual([SETTINGS]);
      });
    });
  });
});

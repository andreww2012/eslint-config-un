const FIXTURES = {
  pnpmWorkspace: 'pnpm-workspace.yaml',
  pnpmWorkspaceWithCatalog: 'with-catalog/pnpm-workspace.yaml',
} as const;

describe('pnpm: sub config `configPnpmWorkspace`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig('pnpm');

    it('creates `pnpm/pnpm-workspace-yaml` eslint config when enabled (default)', () => {
      expect(configResult.getConfigByUnPostfix('pnpm/pnpm-workspace-yaml')).toBeDefined();
    });

    it('does not create `pnpm/pnpm-workspace-yaml` eslint config when disabled', async () => {
      const configResult = await computeEslintConfig({pnpm: {configPnpmWorkspace: false}});

      expect(configResult.getConfigByUnPostfix('pnpm/pnpm-workspace-yaml')).toBeUndefined();
    });

    it('has default `files` in `pnpm/pnpm-workspace-yaml` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('pnpm/pnpm-workspace-yaml')?.files,
      ).toMatchInlineSnapshot('["pnpm-workspace.yaml"]');
    });

    it('has default `ignores` in `pnpm/pnpm-workspace-yaml` eslint config', () => {
      const ignores = configResult.getConfigByUnPostfix('pnpm/pnpm-workspace-yaml')?.ignores;

      expect(ignores?.length).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('pnpm');

    it('enables `pnpm/yaml-no-duplicate-catalog-item` rule by default', () => {
      expect(
        configResult.getRuleEntrySeverity(
          'pnpm/pnpm-workspace-yaml',
          'pnpm/yaml-no-duplicate-catalog-item',
        ),
      ).toBe(2);
    });

    it('enables `pnpm/yaml-no-unused-catalog-item` rule by default', () => {
      expect(
        configResult.getRuleEntrySeverity(
          'pnpm/pnpm-workspace-yaml',
          'pnpm/yaml-no-unused-catalog-item',
        ),
      ).toBe(2);
    });

    it('enables `pnpm/yaml-valid-packages` rule by default', () => {
      expect(
        configResult.getRuleEntrySeverity('pnpm/pnpm-workspace-yaml', 'pnpm/yaml-valid-packages'),
      ).toBe(2);
    });

    it('disables `pnpm/yaml-enforce-settings` rule by default', () => {
      expect(
        configResult.getRuleEntrySeverity('pnpm/pnpm-workspace-yaml', 'pnpm/yaml-enforce-settings'),
      ).toBe(0);
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

      it('disables `pnpm/pnpm-workspace-yaml` eslint config when `files` is empty array', async () => {
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

        expect(ignores).to.include.members(IGNORES);
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

    describe('option: `forceSeverity`', () => {
      it('respects `forceSeverity` set to `error` in `pnpm/pnpm-workspace-yaml` eslint config', async () => {
        const configResult = await computeEslintConfig({
          pnpm: {configPnpmWorkspace: {forceSeverity: 'error'}},
        });

        expect(
          getAllRulesSeverities(
            configResult.getConfigByUnPostfix('pnpm/pnpm-workspace-yaml'),
            (ruleName) => ruleName.startsWith('pnpm/'),
          ),
        ).toStrictEqual([2]);
      });

      it('respects `forceSeverity` set to `warn` in `pnpm/pnpm-workspace-yaml` eslint config', async () => {
        const configResult = await computeEslintConfig({
          pnpm: {configPnpmWorkspace: {forceSeverity: 'warn'}},
        });

        expect(
          getAllRulesSeverities(
            configResult.getConfigByUnPostfix('pnpm/pnpm-workspace-yaml'),
            (ruleName) => ruleName.startsWith('pnpm/'),
          ),
        ).toStrictEqual([1]);
      });
    });
  });

  describe('options', () => {
    describe('option: `enforcePnpmWorkspaceSettings`', () => {
      it('disables `pnpm/yaml-enforce-settings` rule when `enforcePnpmWorkspaceSettings` is not provided (default)', async () => {
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

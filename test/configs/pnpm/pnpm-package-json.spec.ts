const FIXTURES = {
  packageJson: 'package.json',
} as const;

describe('pnpm: sub config `packageJson`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig('pnpm');

    it('creates `pnpm/package.json` eslint config when enabled (default)', () => {
      expect(configResult.getConfigByUnPostfix('pnpm/package.json')).toBeDefined();
    });

    it('does not create `pnpm/package.json` eslint config when disabled', async () => {
      const configResult = await computeEslintConfig({pnpm: {configPackageJson: false}});

      expect(configResult.getConfigByUnPostfix('pnpm/package.json')).toBeUndefined();
    });

    it('has default `files` in `pnpm/package.json` eslint config', () => {
      expect(configResult.getConfigByUnPostfix('pnpm/package.json')?.files).toMatchInlineSnapshot(
        '["**/package.json"]',
      );
    });

    it('has default `ignores` in `pnpm/package.json` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('pnpm/package.json')?.ignores?.length,
      ).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('pnpm');

    it('enables `pnpm/json-valid-catalog` rule by default', () => {
      expect(
        configResult.getRuleEntrySeverity('pnpm/package.json', 'pnpm/json-valid-catalog'),
      ).toBe(2);
    });

    it('disables `pnpm/json-enforce-catalog` rule by default', () => {
      expect(
        configResult.getRuleEntrySeverity('pnpm/package.json', 'pnpm/json-enforce-catalog'),
      ).toBe(0);
    });

    it('disables `pnpm/json-prefer-workspace-settings` rule by default', () => {
      expect(
        configResult.getRuleEntrySeverity(
          'pnpm/package.json',
          'pnpm/json-prefer-workspace-settings',
        ),
      ).toBe(0);
    });

    it('`pnpm/json-valid-catalog` rule fires on a `package.json` with a catalog reference to a non-existent entry', async () => {
      const results = await testEslintConfig('pnpm', FIXTURES.packageJson, import.meta.dirname);

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.packageJson,
        'pnpm/json-valid-catalog',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"Catalog "catalog:" for package "react" is not defined in `pnpm-workspace.yaml`."',
      );
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `pnpm/package.json` eslint config', async () => {
        const FILES = ['custom-package.json'];

        const configResult = await computeEslintConfig({
          pnpm: {configPackageJson: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('pnpm/package.json')?.files).toStrictEqual(FILES);
      });

      it('disables `pnpm/package.json` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          pnpm: {configPackageJson: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('pnpm/package.json')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `pnpm/package.json` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          pnpm: {configPackageJson: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('pnpm/package.json')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `pnpm/package.json` eslint config', async () => {
      const configResult = await computeEslintConfig({
        pnpm: {
          configPackageJson: {
            overrides: {'pnpm/json-valid-catalog': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(
        configResult.getRuleEntrySeverity('pnpm/package.json', 'pnpm/json-valid-catalog'),
      ).toBe(0);
      expect(configResult.getRuleEntrySeverity('pnpm/package.json', 'no-console')).toBe(0);
    });
  });

  describe('options', () => {
    describe('option: `enforceCatalog`', () => {
      it('disables `pnpm/json-enforce-catalog` rule by default', async () => {
        const configResult = await computeEslintConfig('pnpm');

        expect(
          configResult.getRuleEntrySeverity('pnpm/package.json', 'pnpm/json-enforce-catalog'),
        ).toBe(0);
      });

      it('enables `pnpm/json-enforce-catalog` rule when set to `true`', async () => {
        const configResult = await computeEslintConfig({
          pnpm: {configPackageJson: {enforceCatalog: true}},
        });

        expect(
          configResult.getRuleEntrySeverity('pnpm/package.json', 'pnpm/json-enforce-catalog'),
        ).toBe(2);
      });

      it('disables `pnpm/json-enforce-catalog` rule when set to `false`', async () => {
        const configResult = await computeEslintConfig({
          pnpm: {configPackageJson: {enforceCatalog: false}},
        });

        expect(
          configResult.getRuleEntrySeverity('pnpm/package.json', 'pnpm/json-enforce-catalog'),
        ).toBe(0);
      });
    });

    describe('option: `preferSettingsInPnpmWorkspaceYaml`', () => {
      it('disables `pnpm/json-prefer-workspace-settings` rule by default', async () => {
        const configResult = await computeEslintConfig('pnpm');

        expect(
          configResult.getRuleEntrySeverity(
            'pnpm/package.json',
            'pnpm/json-prefer-workspace-settings',
          ),
        ).toBe(0);
      });

      it('enables `pnpm/json-prefer-workspace-settings` rule when set to `true`', async () => {
        const configResult = await computeEslintConfig({
          pnpm: {configPackageJson: {preferSettingsInPnpmWorkspaceYaml: true}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'pnpm/package.json',
            'pnpm/json-prefer-workspace-settings',
          ),
        ).toBe(2);
      });

      it('disables `pnpm/json-prefer-workspace-settings` rule when set to `false`', async () => {
        const configResult = await computeEslintConfig({
          pnpm: {configPackageJson: {preferSettingsInPnpmWorkspaceYaml: false}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'pnpm/package.json',
            'pnpm/json-prefer-workspace-settings',
          ),
        ).toBe(0);
      });
    });
  });
});

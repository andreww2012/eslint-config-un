const FIXTURES = {
  avaInDependencies: 'ava-in-dependencies/package.json',
} as const;

beforeEach(() => {
  addInstalledPackages({ava: '6.2.0'});
});

describe('ava: sub config `packageJson`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig('ava');

    it('creates `ava/package.json` eslint config by default', () => {
      expect(configResult.getConfigByUnPostfix('ava/package.json')).toBeDefined();
    });

    it('does not create `ava/package.json` eslint config when disabled', async () => {
      const configResult = await computeEslintConfig({ava: {configPackageJson: false}});

      expect(configResult.getConfigByUnPostfix('ava/package.json')).toBeUndefined();
    });

    it('still creates the main `ava` eslint config when sub config is disabled', async () => {
      const configResult = await computeEslintConfig({ava: {configPackageJson: false}});

      expect(configResult.getConfigByUnPostfix('ava')).toBeDefined();
    });

    it('targets `package.json` files in `ava/package.json` eslint config', () => {
      expect(configResult.getConfigByUnPostfix('ava/package.json')?.files).toMatchInlineSnapshot(
        '["**/package.json"]',
      );
    });

    it('has default `ignores` in `ava/package.json` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('ava/package.json')?.ignores?.length,
      ).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('ava');

    it('enables `ava/no-ava-in-dependencies` rule by default', () => {
      expect(
        configResult.getRuleEntrySeverity('ava/package.json', 'ava/no-ava-in-dependencies'),
      ).toBe(2);
    });

    it('does not add `ava/no-ava-in-dependencies` rule to the main `ava` eslint config', () => {
      expect(configResult.getRuleEntry('ava', 'ava/no-ava-in-dependencies')).toBeUndefined();
    });

    it('`ava/no-ava-in-dependencies` rule fires on a `package.json` with `ava` in `dependencies`', async () => {
      const results = await testEslintConfig(
        'ava',
        FIXTURES.avaInDependencies,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.avaInDependencies,
        'ava/no-ava-in-dependencies',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"`ava` should be in `devDependencies` instead of `dependencies`."',
      );
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `ava/package.json` eslint config', async () => {
        const FILES = ['packages/*/package.json'];

        const configResult = await computeEslintConfig({ava: {configPackageJson: {files: FILES}}});

        expect(configResult.getConfigByUnPostfix('ava/package.json')?.files).toStrictEqual(FILES);
      });

      it('disables `ava/package.json` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({ava: {configPackageJson: {files: []}}});

        expect(configResult.getConfigByUnPostfix('ava/package.json')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `ava/package.json` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          ava: {configPackageJson: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('ava/package.json')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `ava/package.json` eslint config', async () => {
      const configResult = await computeEslintConfig({
        ava: {
          configPackageJson: {
            overrides: {'ava/no-ava-in-dependencies': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('ava/package.json')).toMatchObject({
        'ava/no-ava-in-dependencies': 0,
        'no-console': 0,
      });
    });
  });
});

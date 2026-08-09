const FIXTURES = {
  missingHookDeps: 'missing-hook-deps.jsx',
} as const;

beforeEach(() => {
  addInstalledPackages({react: '19.0.0'});
});

describe('react: sub config `hooks`', () => {
  describe('basic tests', () => {
    it('creates `react/hooks` eslint config by default', async () => {
      const configResult = await computeEslintConfig('react');

      const config = configResult.getConfigByUnPostfix('react/hooks');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.?([cm])[jt]s?(x)"]');
      expect(config?.ignores?.length).toBeGreaterThan(0);
    });

    it('does not create `react/hooks` eslint config when disabled', async () => {
      const configResult = await computeEslintConfig({react: {configHooks: false}});

      expect(configResult.getConfigByUnPostfix('react/hooks')).toBeUndefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig('react');

      expect(configResult.getRuleSeverities('react/hooks')).toMatchObject({
        'react-hooks/exhaustive-deps': 2,
        'react-hooks/unsupported-syntax': 1,
        'react-hooks/hooks': 0,
      });
    });

    it('`react-hooks/exhaustive-deps` rule fires on a component with missing hook dependencies', async () => {
      const results = await testEslintConfig(
        'react',
        FIXTURES.missingHookDeps,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.missingHookDeps,
        'react-hooks/exhaustive-deps',
      );

      expect(error?.message).toMatchInlineSnapshot(
        `"React Hook useEffect has a missing dependency: 'value'. Either include it or remove the dependency array."`,
      );
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `react/hooks` eslint config', async () => {
        const FILES = ['src/**/*.jsx'];

        const configResult = await computeEslintConfig({react: {configHooks: {files: FILES}}});

        expect(configResult.getConfigByUnPostfix('react/hooks')?.files).toStrictEqual(FILES);
      });

      it('disables `react/hooks` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          react: {configHooks: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('react/hooks')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `react/hooks` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({react: {configHooks: {ignores: IGNORES}}});

        const ignores = configResult.getConfigByUnPostfix('react/hooks')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `react/hooks` eslint config', async () => {
      const configResult = await computeEslintConfig({
        react: {
          configHooks: {
            overrides: {'react-hooks/exhaustive-deps': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('react/hooks')).toMatchObject({
        'react-hooks/exhaustive-deps': 0,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `enableReactCompilerRules`', () => {
      it('enables react compiler rules by default', async () => {
        const configResult = await computeEslintConfig('react');

        expect(
          configResult.getRuleEntrySeverity(
            'react/hooks',
            'react-hooks/exhaustive-effect-dependencies',
          ),
        ).toBe(2);
      });

      it('enables react compiler rules when set to `true`', async () => {
        const configResult = await computeEslintConfig({
          react: {configHooks: {enableReactCompilerRules: true}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'react/hooks',
            'react-hooks/exhaustive-effect-dependencies',
          ),
        ).toBe(2);
      });

      it('disables react compiler rules when set to `false`', async () => {
        const configResult = await computeEslintConfig({
          react: {configHooks: {enableReactCompilerRules: false}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'react/hooks',
            'react-hooks/exhaustive-effect-dependencies',
          ),
        ).toBe(0);
      });

      it('does not affect `react-hooks/exhaustive-deps` (non-compiler rule) when set to `false`', async () => {
        const configResult = await computeEslintConfig({
          react: {configHooks: {enableReactCompilerRules: false}},
        });

        expect(
          configResult.getRuleEntrySeverity('react/hooks', 'react-hooks/exhaustive-deps'),
        ).toBe(2);
      });
    });
  });
});

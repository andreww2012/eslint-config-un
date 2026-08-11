const FIXTURES = {
  classComponent: 'class-component.jsx',
} as const;

beforeEach(() => {
  addInstalledPackages({react: '19.0.0'});
});

describe('react: sub config `reactX`', () => {
  describe('basic tests', () => {
    it('creates `react/x` eslint config by default', async () => {
      const configResult = await computeEslintConfig('react');

      const config = configResult.getConfigByUnPostfix('react/x');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.?([cm])[jt]s?(x)"]');
      expect(config?.ignores?.length).toBeGreaterThan(0);
      expect(configResult.getConfigByUnPostfix('react/x/rules-type-aware')).toBeUndefined();
    });

    it('does not create `react/x` eslint config when disabled', async () => {
      const configResult = await computeEslintConfig({react: {configReactX: false}});

      expect(configResult.getConfigByUnPostfix('react/x')).toBeUndefined();
    });

    it('creates `react/x/rules-type-aware` eslint config when `ts` config is enabled', async () => {
      const configResult = await computeEslintConfig({react: true, ts: true});

      expect(configResult.getConfigByUnPostfix('react/x/rules-type-aware')).toBeDefined();
    });

    it('does not create `react/x/rules-type-aware` when explicitly disabled even if `ts` is enabled', async () => {
      const configResult = await computeEslintConfig({
        react: {configReactX: {configTypeAwareRules: false}},
        ts: true,
      });

      expect(configResult.getConfigByUnPostfix('react/x/rules-type-aware')).toBeUndefined();
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('react');

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('react/x')).toMatchObject({
        'eslint-react/no-context-provider': 2,
        'eslint-react/no-class-component': 1,
        'eslint-react/no-unnecessary-use-prefix': 0,
      });
    });

    it('`eslint-react/no-class-component` rule fires on a class component', async () => {
      const results = await testEslintConfig('react', FIXTURES.classComponent, import.meta.dirname);

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.classComponent,
        'eslint-react/no-class-component',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"Avoid using class components. Use function components instead."',
      );
    });

    it('does not load `react-debug` plugin because all its rules are disabled by default', () => {
      expect(configResult.getLoadedPlugin('react-debug')).toBeUndefined();
    });

    it('loads `react-debug` plugin if one of its rules is enabled', async () => {
      const configResultWithDebugRule = await computeEslintConfig({
        react: {configReactX: {overridesAny: {'react-debug/function-component': 2}}},
      });

      expect(configResultWithDebugRule.getLoadedPlugin('react-debug')).toBeDefined();
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `react/x` eslint config', async () => {
        const FILES = ['src/**/*.tsx'];

        const configResult = await computeEslintConfig({react: {configReactX: {files: FILES}}});

        expect(configResult.getConfigByUnPostfix('react/x')?.files).toStrictEqual(FILES);
      });

      it('disables `react/x` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({react: {configReactX: {files: []}}});

        expect(configResult.getConfigByUnPostfix('react/x')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `react/x` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({react: {configReactX: {ignores: IGNORES}}});

        const ignores = configResult.getConfigByUnPostfix('react/x')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `react/x` eslint config', async () => {
      const configResult = await computeEslintConfig({
        react: {
          configReactX: {
            overrides: {'eslint-react/no-class-component': 2},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('react/x')).toMatchObject({
        'eslint-react/no-class-component': 2,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `noLegacyApis`', () => {
      describe('`classComponent`', () => {
        it('enables `eslint-react/no-class-component` with warning severity by default', async () => {
          const configResult = await computeEslintConfig('react');

          expect(
            configResult.getRuleEntrySeverity('react/x', 'eslint-react/no-class-component'),
          ).toBe(1);
        });

        it('enables `eslint-react/no-class-component` with error severity when set to `true`', async () => {
          const configResult = await computeEslintConfig({
            react: {configReactX: {noLegacyApis: {classComponent: true}}},
          });

          expect(
            configResult.getRuleEntrySeverity('react/x', 'eslint-react/no-class-component'),
          ).toBe(2);
        });

        it('disables `eslint-react/no-class-component` when set to `false`', async () => {
          const configResult = await computeEslintConfig({
            react: {configReactX: {noLegacyApis: {classComponent: false}}},
          });

          expect(
            configResult.getRuleEntrySeverity('react/x', 'eslint-react/no-class-component'),
          ).toBe(0);
        });

        it('enables `eslint-react/no-class-component` with warning severity when set to `warn`', async () => {
          const configResult = await computeEslintConfig({
            react: {configReactX: {noLegacyApis: {classComponent: 'warn'}}},
          });

          expect(
            configResult.getRuleEntrySeverity('react/x', 'eslint-react/no-class-component'),
          ).not.toBe(0);
        });
      });

      describe('`Children`', () => {
        it('enables `eslint-react/no-children-count` with error severity by default', async () => {
          const configResult = await computeEslintConfig('react');

          expect(
            configResult.getRuleEntrySeverity('react/x', 'eslint-react/no-children-count'),
          ).toBe(2);
        });

        it('disables children-related rules when set to `false`', async () => {
          const configResult = await computeEslintConfig({
            react: {configReactX: {noLegacyApis: {Children: false}}},
          });

          expect(
            configResult.getRuleEntrySeverity('react/x', 'eslint-react/no-children-count'),
          ).toBe(0);
        });

        it('enables `eslint-react/no-children-count` with warning severity when set to `warn`', async () => {
          const configResult = await computeEslintConfig({
            react: {configReactX: {noLegacyApis: {Children: 'warn'}}},
          });

          expect(
            configResult.getRuleEntrySeverity('react/x', 'eslint-react/no-children-count'),
          ).toBe(1);
        });
      });

      describe('`forwardRef`', () => {
        it('enables `eslint-react/no-forward-ref` with error severity by default (react 19)', async () => {
          const configResult = await computeEslintConfig('react');

          expect(configResult.getRuleEntrySeverity('react/x', 'eslint-react/no-forward-ref')).toBe(
            2,
          );
        });

        it('disables `eslint-react/no-forward-ref` when set to `false`', async () => {
          const configResult = await computeEslintConfig({
            react: {configReactX: {noLegacyApis: {forwardRef: false}}},
          });

          expect(configResult.getRuleEntrySeverity('react/x', 'eslint-react/no-forward-ref')).toBe(
            0,
          );
        });
      });
    });
  });
});

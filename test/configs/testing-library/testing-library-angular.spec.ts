describe('testing-library: sub config `angular`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig({testingLibrary: {configAngular: true}});

    it('creates `testing-library/angular` eslint config when enabled', () => {
      expect(configResult.getConfigByUnPostfix('testing-library/angular')).toBeDefined();
    });

    it('does not create `testing-library/angular` eslint config by default (angular config not enabled)', async () => {
      const configResult = await computeEslintConfig('testingLibrary');

      expect(configResult.getConfigByUnPostfix('testing-library/angular')).toBeUndefined();
    });

    it('creates `testing-library/angular` eslint config when `@angular/core` package is installed', async () => {
      addInstalledPackages({'@angular/core': '19.0.0'});

      const configResult = await computeEslintConfig({testingLibrary: true}, {reset: true});

      expect(configResult.getConfigByUnPostfix('testing-library/angular')).toBeDefined();
    });

    it('has default `files` in `testing-library/angular` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('testing-library/angular')?.files,
      ).toMatchInlineSnapshot(
        '["**/*[.-_]spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__test?(s)__/**/*.?([cm])[jt]s?(x)"]',
      );
    });

    it('has default `ignores` in `testing-library/angular` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('testing-library/angular')?.ignores?.length,
      ).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({testingLibrary: {configAngular: true}});

    it('enables `testing-library/no-container` rule (framework-only)', () => {
      expect(
        configResult.getRuleEntrySeverity(
          'testing-library/angular',
          'testing-library/no-container',
        ),
      ).toBe(2);
    });

    it('enables `testing-library/no-render-in-lifecycle` rule by default', () => {
      expect(
        configResult.getRuleEntrySeverity(
          'testing-library/angular',
          'testing-library/no-render-in-lifecycle',
        ),
      ).toBe(2);
    });

    it('enables `testing-library/no-dom-import` rule with `angular` module option', () => {
      expect(
        configResult.getRuleEntry('testing-library/angular', 'testing-library/no-dom-import'),
      ).toMatchInlineSnapshot('[2, "angular"]');
    });

    it('does NOT include `fireEvent` in `testing-library/await-async-events` event module list (not async for angular)', () => {
      expect(
        configResult.getRuleEntry('testing-library/angular', 'testing-library/await-async-events'),
      ).toMatchInlineSnapshot('[2, {"eventModule": ["userEvent"]}]');
    });

    it('includes `fire-event` in `testing-library/no-await-sync-events` rule options (not async for angular)', () => {
      expect(
        configResult.getRuleEntry(
          'testing-library/angular',
          'testing-library/no-await-sync-events',
        ),
      ).toMatchInlineSnapshot('[2, {"eventModules": ["fire-event"]}]');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `testing-library/angular` eslint config', async () => {
        const FILES = ['src/**/*.spec.ts'];

        const configResult = await computeEslintConfig({
          testingLibrary: {configAngular: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('testing-library/angular')?.files).toStrictEqual(
          FILES,
        );
      });

      it('disables `testing-library/angular` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          testingLibrary: {configAngular: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('testing-library/angular')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `testing-library/angular` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          testingLibrary: {configAngular: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('testing-library/angular')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `testing-library/angular` eslint config', async () => {
      const configResult = await computeEslintConfig({
        testingLibrary: {
          configAngular: {
            overrides: {'testing-library/await-async-queries': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(
        configResult.getRuleEntrySeverity(
          'testing-library/angular',
          'testing-library/await-async-queries',
        ),
      ).toBe(0);
      expect(configResult.getRuleEntrySeverity('testing-library/angular', 'no-console')).toBe(0);
    });
  });

  describe('options', () => {
    describe('option: `allowContainerFirstChild`', () => {
      it('sets `allowContainerFirstChild: true` in `testing-library/no-node-access` rule options by default', async () => {
        const configResult = await computeEslintConfig({testingLibrary: {configAngular: true}});

        expect(
          configResult.getRuleEntry('testing-library/angular', 'testing-library/no-node-access'),
        ).toMatchInlineSnapshot('[2, {"allowContainerFirstChild": true}]');
      });

      it('sets `allowContainerFirstChild: false` in `testing-library/no-node-access` rule options when set to `false`', async () => {
        const configResult = await computeEslintConfig({
          testingLibrary: {configAngular: {allowContainerFirstChild: false}},
        });

        expect(
          configResult.getRuleEntry('testing-library/angular', 'testing-library/no-node-access'),
        ).toMatchInlineSnapshot('[2, {"allowContainerFirstChild": false}]');
      });
    });

    describe('option: `allowTestingFrameworkSetupHook`', () => {
      it('does not add `allowTestingFrameworkSetupHook` option to `testing-library/no-render-in-lifecycle` by default', async () => {
        const configResult = await computeEslintConfig({testingLibrary: {configAngular: true}});

        expect(
          configResult.getRuleEntry(
            'testing-library/angular',
            'testing-library/no-render-in-lifecycle',
          ),
        ).toMatchInlineSnapshot('2');
      });

      it('adds `allowTestingFrameworkSetupHook` option to `testing-library/no-render-in-lifecycle` when provided', async () => {
        const configResult = await computeEslintConfig({
          testingLibrary: {configAngular: {allowTestingFrameworkSetupHook: 'beforeEach'}},
        });

        expect(
          configResult.getRuleEntry(
            'testing-library/angular',
            'testing-library/no-render-in-lifecycle',
          ),
        ).toMatchInlineSnapshot('[2, {"allowTestingFrameworkSetupHook": "beforeEach"}]');
      });
    });

    describe('option: `preferAssertStyle`', () => {
      it('does not enforce assert style by default', async () => {
        const configResult = await computeEslintConfig({testingLibrary: {configAngular: true}});

        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/angular',
            'testing-library/prefer-explicit-assert',
          ),
        ).toBe(0);
        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/angular',
            'testing-library/prefer-implicit-assert',
          ),
        ).toBe(0);
      });

      it('enables `testing-library/prefer-explicit-assert` rule when set to `explicit`', async () => {
        const configResult = await computeEslintConfig({
          testingLibrary: {configAngular: {preferAssertStyle: 'explicit'}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/angular',
            'testing-library/prefer-explicit-assert',
          ),
        ).toBe(2);
        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/angular',
            'testing-library/prefer-implicit-assert',
          ),
        ).toBe(0);
      });

      it('enables `testing-library/prefer-implicit-assert` rule when set to `implicit`', async () => {
        const configResult = await computeEslintConfig({
          testingLibrary: {configAngular: {preferAssertStyle: 'implicit'}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/angular',
            'testing-library/prefer-implicit-assert',
          ),
        ).toBe(2);
        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/angular',
            'testing-library/prefer-explicit-assert',
          ),
        ).toBe(0);
      });
    });

    describe('option: `preferQueryMatchers`', () => {
      it('disables `testing-library/prefer-query-matchers` rule by default', async () => {
        const configResult = await computeEslintConfig({testingLibrary: {configAngular: true}});

        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/angular',
            'testing-library/prefer-query-matchers',
          ),
        ).toBe(0);
      });

      it('enables `testing-library/prefer-query-matchers` rule with provided entries', async () => {
        const MATCHERS = [{matcher: 'toBeVisible', query: 'get'} as const];

        const configResult = await computeEslintConfig({
          testingLibrary: {configAngular: {preferQueryMatchers: MATCHERS}},
        });

        expect(
          configResult.getRuleEntry(
            'testing-library/angular',
            'testing-library/prefer-query-matchers',
          ),
        ).toMatchInlineSnapshot(
          '[2, {"validEntries": [{"matcher": "toBeVisible", "query": "get"}]}]',
        );
      });
    });

    describe('option: `preferUserEventOverFireEvent`', () => {
      it('enables `testing-library/prefer-user-event` rule by default', async () => {
        const configResult = await computeEslintConfig({testingLibrary: {configAngular: true}});

        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/angular',
            'testing-library/prefer-user-event',
          ),
        ).toBe(2);
      });

      it('disables `testing-library/prefer-user-event` rule when set to `false`', async () => {
        const configResult = await computeEslintConfig({
          testingLibrary: {configAngular: {preferUserEventOverFireEvent: false}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/angular',
            'testing-library/prefer-user-event',
          ),
        ).toBe(0);
      });
    });
  });

  describe('sub config: `configNoOnlyTests`', async () => {
    const configResult = await computeEslintConfig({testingLibrary: {configAngular: true}});

    it('creates `testing-library/angular/no-only-tests` eslint config by default', () => {
      expect(
        configResult.getConfigByUnPostfix('testing-library/angular/no-only-tests'),
      ).toBeDefined();
    });

    it('does not create `testing-library/angular/no-only-tests` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        testingLibrary: {configAngular: {configNoOnlyTests: false}},
      });

      expect(
        configResult.getConfigByUnPostfix('testing-library/angular/no-only-tests'),
      ).toBeUndefined();
    });

    it('has default `files` in `testing-library/angular/no-only-tests` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('testing-library/angular/no-only-tests')?.files,
      ).toMatchInlineSnapshot(
        '["**/*[.-_]spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__test?(s)__/**/*.?([cm])[jt]s?(x)"]',
      );
    });

    describe('un options', () => {
      describe('option: `files`', () => {
        it('uses user-provided `files` in `testing-library/angular/no-only-tests`', async () => {
          const FILES = ['src/**/*.spec.ts'];

          const configResult = await computeEslintConfig({
            testingLibrary: {configAngular: {configNoOnlyTests: {files: FILES}}},
          });

          expect(
            configResult.getConfigByUnPostfix('testing-library/angular/no-only-tests')?.files,
          ).toStrictEqual(FILES);
        });

        it('disables `testing-library/angular/no-only-tests` when set to empty array', async () => {
          const configResult = await computeEslintConfig({
            testingLibrary: {configAngular: {configNoOnlyTests: {files: []}}},
          });

          expect(
            configResult.getConfigByUnPostfix('testing-library/angular/no-only-tests'),
          ).toBeUndefined();
        });
      });

      describe('option: `ignores`', () => {
        it('uses user-provided `ignores` in `testing-library/angular/no-only-tests` and merges them with defaults', async () => {
          const IGNORES = ['**/fixtures/**'];

          const configResult = await computeEslintConfig({
            testingLibrary: {configAngular: {configNoOnlyTests: {ignores: IGNORES}}},
          });

          const ignores = configResult.getConfigByUnPostfix(
            'testing-library/angular/no-only-tests',
          )?.ignores;

          expect(ignores).toIncludeAllMembers(IGNORES);
          expect(ignores?.length).toBeGreaterThan(IGNORES.length);
        });
      });

      it('respects `overrides` and `overridesAny` in `testing-library/angular/no-only-tests` eslint config', async () => {
        const configResult = await computeEslintConfig({
          testingLibrary: {
            configAngular: {
              configNoOnlyTests: {
                overrides: {'no-only-tests/no-only-tests': 0},
                overridesAny: {'no-console': 0},
              },
            },
          },
        });

        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/angular/no-only-tests',
            'no-only-tests/no-only-tests',
          ),
        ).toBe(0);
        expect(
          configResult.getRuleEntrySeverity('testing-library/angular/no-only-tests', 'no-console'),
        ).toBe(0);
      });
    });
  });
});

describe('testing-library: sub config `svelte`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig({testingLibrary: {configSvelte: true}});

    it('creates `testing-library/svelte` eslint config when enabled', () => {
      expect(configResult.getConfigByUnPostfix('testing-library/svelte')).toBeDefined();
    });

    it('does not create `testing-library/svelte` eslint config by default (svelte config not enabled)', async () => {
      const configResult = await computeEslintConfig('testingLibrary');

      expect(configResult.getConfigByUnPostfix('testing-library/svelte')).toBeUndefined();
    });

    it('creates `testing-library/svelte` eslint config when `svelte` package is installed', async () => {
      addInstalledPackages({svelte: '5.0.0'});

      const configResult = await computeEslintConfig({testingLibrary: true}, {reset: true});

      expect(configResult.getConfigByUnPostfix('testing-library/svelte')).toBeDefined();
    });

    it('has default `files` in `testing-library/svelte` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('testing-library/svelte')?.files,
      ).toMatchInlineSnapshot(
        '["**/*[.-_]spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__test?(s)__/**/*.?([cm])[jt]s?(x)"]',
      );
    });

    it('has default `ignores` in `testing-library/svelte` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('testing-library/svelte')?.ignores?.length,
      ).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({testingLibrary: {configSvelte: true}});

    it('enables `testing-library/no-container` rule (framework-only)', () => {
      expect(
        configResult.getRuleEntrySeverity('testing-library/svelte', 'testing-library/no-container'),
      ).toBe(2);
    });

    it('includes `fireEvent` in `testing-library/await-async-events` event module list (async for svelte)', () => {
      expect(
        configResult.getRuleEntry('testing-library/svelte', 'testing-library/await-async-events'),
      ).toMatchInlineSnapshot('[2, {"eventModule": ["userEvent", "fireEvent"]}]');
    });

    it('does not include options in `testing-library/no-await-sync-events` rule (fireEvent is async for svelte)', () => {
      expect(
        configResult.getRuleEntryOptions(
          'testing-library/svelte',
          'testing-library/no-await-sync-events',
        ),
      ).toStrictEqual([]);
    });

    it('enables `testing-library/no-manual-cleanup` rule (svelte/react/vue only)', () => {
      expect(
        configResult.getRuleEntrySeverity(
          'testing-library/svelte',
          'testing-library/no-manual-cleanup',
        ),
      ).toBe(2);
    });

    it('does not enable `testing-library/no-unnecessary-act` rule (svelte excluded)', () => {
      expect(
        configResult.getRuleEntrySeverity(
          'testing-library/svelte',
          'testing-library/no-unnecessary-act',
        ),
      ).toBe(0);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `testing-library/svelte` eslint config', async () => {
        const FILES = ['src/**/*.spec.ts'];

        const configResult = await computeEslintConfig({
          testingLibrary: {configSvelte: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('testing-library/svelte')?.files).toStrictEqual(
          FILES,
        );
      });

      it('disables `testing-library/svelte` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          testingLibrary: {configSvelte: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('testing-library/svelte')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `testing-library/svelte` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          testingLibrary: {configSvelte: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('testing-library/svelte')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `testing-library/svelte` eslint config', async () => {
      const configResult = await computeEslintConfig({
        testingLibrary: {
          configSvelte: {
            overrides: {'testing-library/await-async-queries': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(
        configResult.getRuleEntrySeverity(
          'testing-library/svelte',
          'testing-library/await-async-queries',
        ),
      ).toBe(0);
      expect(configResult.getRuleEntrySeverity('testing-library/svelte', 'no-console')).toBe(0);
    });
  });

  describe('options', () => {
    describe('option: `allowContainerFirstChild`', () => {
      it('sets `allowContainerFirstChild: true` in `testing-library/no-node-access` rule options by default', async () => {
        const configResult = await computeEslintConfig({testingLibrary: {configSvelte: true}});

        expect(
          configResult.getRuleEntry('testing-library/svelte', 'testing-library/no-node-access'),
        ).toMatchInlineSnapshot('[2, {"allowContainerFirstChild": true}]');
      });

      it('sets `allowContainerFirstChild: false` in `testing-library/no-node-access` rule options when set to `false`', async () => {
        const configResult = await computeEslintConfig({
          testingLibrary: {configSvelte: {allowContainerFirstChild: false}},
        });

        expect(
          configResult.getRuleEntry('testing-library/svelte', 'testing-library/no-node-access'),
        ).toMatchInlineSnapshot('[2, {"allowContainerFirstChild": false}]');
      });
    });

    describe('option: `preferAssertStyle`', () => {
      it('does not enforce assert style in `testing-library/prefer-explicit-assert` rule by default', async () => {
        const configResult = await computeEslintConfig({testingLibrary: {configSvelte: true}});

        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/svelte',
            'testing-library/prefer-explicit-assert',
          ),
        ).toBe(0);
      });

      it('enables `testing-library/prefer-explicit-assert` rule when set to `explicit`', async () => {
        const configResult = await computeEslintConfig({
          testingLibrary: {configSvelte: {preferAssertStyle: 'explicit'}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/svelte',
            'testing-library/prefer-explicit-assert',
          ),
        ).toBe(2);
      });

      it('enables `testing-library/prefer-implicit-assert` rule when set to `implicit`', async () => {
        const configResult = await computeEslintConfig({
          testingLibrary: {configSvelte: {preferAssertStyle: 'implicit'}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/svelte',
            'testing-library/prefer-implicit-assert',
          ),
        ).toBe(2);
      });
    });

    describe('option: `preferQueryMatchers`', () => {
      it('disables `testing-library/prefer-query-matchers` rule by default', async () => {
        const configResult = await computeEslintConfig({testingLibrary: {configSvelte: true}});

        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/svelte',
            'testing-library/prefer-query-matchers',
          ),
        ).toBe(0);
      });

      it('enables `testing-library/prefer-query-matchers` rule with provided entries', async () => {
        const MATCHERS = [{matcher: 'toBeVisible', query: 'get'} as const];

        const configResult = await computeEslintConfig({
          testingLibrary: {configSvelte: {preferQueryMatchers: MATCHERS}},
        });

        expect(
          configResult.getRuleEntryOptions(
            'testing-library/svelte',
            'testing-library/prefer-query-matchers',
          ),
        ).toStrictEqual([{validEntries: MATCHERS}]);
      });
    });

    describe('option: `preferUserEventOverFireEvent`', () => {
      it('enables `testing-library/prefer-user-event` rule by default', async () => {
        const configResult = await computeEslintConfig({testingLibrary: {configSvelte: true}});

        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/svelte',
            'testing-library/prefer-user-event',
          ),
        ).toBe(2);
      });

      it('disables `testing-library/prefer-user-event` rule when set to `false`', async () => {
        const configResult = await computeEslintConfig({
          testingLibrary: {configSvelte: {preferUserEventOverFireEvent: false}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/svelte',
            'testing-library/prefer-user-event',
          ),
        ).toBe(0);
      });
    });
  });

  describe('sub config: `configNoOnlyTests`', async () => {
    const configResult = await computeEslintConfig({testingLibrary: {configSvelte: true}});

    it('creates `testing-library/svelte/no-only-tests` eslint config by default', () => {
      expect(
        configResult.getConfigByUnPostfix('testing-library/svelte/no-only-tests'),
      ).toBeDefined();
    });

    it('does not create `testing-library/svelte/no-only-tests` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        testingLibrary: {configSvelte: {configNoOnlyTests: false}},
      });

      expect(
        configResult.getConfigByUnPostfix('testing-library/svelte/no-only-tests'),
      ).toBeUndefined();
    });

    it('has default `files` in `testing-library/svelte/no-only-tests` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('testing-library/svelte/no-only-tests')?.files,
      ).toMatchInlineSnapshot(
        '["**/*[.-_]spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__test?(s)__/**/*.?([cm])[jt]s?(x)"]',
      );
    });
  });
});

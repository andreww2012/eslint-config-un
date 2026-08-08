describe('testing-library: sub config `react`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig({testingLibrary: {configReact: true}});

    it('creates `testing-library/react` eslint config when enabled', () => {
      expect(configResult.getConfigByUnPostfix('testing-library/react')).toBeDefined();
    });

    it('creates `testing-library/react` eslint config when `react` package is installed', async () => {
      addInstalledPackages({react: '19.0.0'});

      const configResult = await computeEslintConfig({testingLibrary: true}, {reset: true});

      expect(configResult.getConfigByUnPostfix('testing-library/react')).toBeDefined();
    });

    it('has default `files` in `testing-library/react` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('testing-library/react')?.files,
      ).toMatchInlineSnapshot(
        '["**/*[.-_]spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__test?(s)__/**/*.?([cm])[jt]s?(x)"]',
      );
    });

    it('has default `ignores` in `testing-library/react` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('testing-library/react')?.ignores?.length,
      ).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({testingLibrary: {configReact: true}});

    it('enables `testing-library/no-container` rule (framework-only)', () => {
      expect(
        configResult.getRuleEntrySeverity('testing-library/react', 'testing-library/no-container'),
      ).toBe(2);
    });

    it('includes `fireEvent` in `testing-library/await-async-events` event module list (async for react)', () => {
      expect(
        configResult.getRuleEntry('testing-library/react', 'testing-library/await-async-events'),
      ).toMatchInlineSnapshot('[2, {"eventModule": ["userEvent"]}]');
    });

    it('does not include options in `testing-library/no-await-sync-events` rule (fireEvent is async for react)', () => {
      expect(
        configResult.getRuleEntry('testing-library/react', 'testing-library/no-await-sync-events'),
      ).toMatchInlineSnapshot('[2, {"eventModules": ["fire-event"]}]');
    });

    it('enables `testing-library/no-unnecessary-act` rule (react/marko only)', () => {
      expect(
        configResult.getRuleEntrySeverity(
          'testing-library/react',
          'testing-library/no-unnecessary-act',
        ),
      ).toBe(2);
    });

    it('enables `testing-library/no-manual-cleanup` rule (react/svelte/vue)', () => {
      expect(
        configResult.getRuleEntrySeverity(
          'testing-library/react',
          'testing-library/no-manual-cleanup',
        ),
      ).toBe(2);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `testing-library/react` eslint config', async () => {
        const FILES = ['src/**/*.spec.tsx'];

        const configResult = await computeEslintConfig({
          testingLibrary: {configReact: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('testing-library/react')?.files).toStrictEqual(
          FILES,
        );
      });

      it('disables `testing-library/react` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          testingLibrary: {configReact: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('testing-library/react')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `testing-library/react` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          testingLibrary: {configReact: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('testing-library/react')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `testing-library/react` eslint config', async () => {
      const configResult = await computeEslintConfig({
        testingLibrary: {
          configReact: {
            overrides: {'testing-library/await-async-queries': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(
        configResult.getRuleEntrySeverity(
          'testing-library/react',
          'testing-library/await-async-queries',
        ),
      ).toBe(0);
      expect(configResult.getRuleEntrySeverity('testing-library/react', 'no-console')).toBe(0);
    });
  });

  describe('options', () => {
    describe('option: `allowContainerFirstChild`', () => {
      it('sets `allowContainerFirstChild: true` in `testing-library/no-node-access` rule options by default', async () => {
        const configResult = await computeEslintConfig({testingLibrary: {configReact: true}});

        expect(
          configResult.getRuleEntry('testing-library/react', 'testing-library/no-node-access'),
        ).toMatchInlineSnapshot('[2, {"allowContainerFirstChild": true}]');
      });

      it('sets `allowContainerFirstChild: false` in `testing-library/no-node-access` rule options when set to `false`', async () => {
        const configResult = await computeEslintConfig({
          testingLibrary: {configReact: {allowContainerFirstChild: false}},
        });

        expect(
          configResult.getRuleEntry('testing-library/react', 'testing-library/no-node-access'),
        ).toMatchInlineSnapshot('[2, {"allowContainerFirstChild": false}]');
      });
    });

    describe('option: `consistentDataTestId`', () => {
      it('does not enforce consistent data-testid in `testing-library/consistent-data-testid` rule by default', async () => {
        const configResult = await computeEslintConfig({testingLibrary: {configReact: true}});

        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/react',
            'testing-library/consistent-data-testid',
          ),
        ).toBe(0);
      });

      it('enables `testing-library/consistent-data-testid` rule when provided a pattern', async () => {
        const PATTERN = '^[a-z-]+';

        const configResult = await computeEslintConfig({
          testingLibrary: {configReact: {consistentDataTestId: {testIdPattern: PATTERN}}},
        });

        expect(
          configResult.getRuleEntryOptions(
            'testing-library/react',
            'testing-library/consistent-data-testid',
          ),
        ).toStrictEqual([{testIdPattern: PATTERN}]);
      });
    });

    describe('option: `preferAssertStyle`', () => {
      it('does not enforce assert style in `testing-library/prefer-explicit-assert` rule by default', async () => {
        const configResult = await computeEslintConfig({testingLibrary: {configReact: true}});

        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/react',
            'testing-library/prefer-explicit-assert',
          ),
        ).toBe(0);
      });

      it('enables `testing-library/prefer-explicit-assert` rule when set to `explicit`', async () => {
        const configResult = await computeEslintConfig({
          testingLibrary: {configReact: {preferAssertStyle: 'explicit'}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/react',
            'testing-library/prefer-explicit-assert',
          ),
        ).toBe(2);
      });

      it('enables `testing-library/prefer-implicit-assert` rule when set to `implicit`', async () => {
        const configResult = await computeEslintConfig({
          testingLibrary: {configReact: {preferAssertStyle: 'implicit'}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/react',
            'testing-library/prefer-implicit-assert',
          ),
        ).toBe(2);
      });
    });

    describe('option: `preferQueryMatchers`', () => {
      it('disables `testing-library/prefer-query-matchers` rule by default', async () => {
        const configResult = await computeEslintConfig({testingLibrary: {configReact: true}});

        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/react',
            'testing-library/prefer-query-matchers',
          ),
        ).toBe(0);
      });

      it('enables `testing-library/prefer-query-matchers` rule with provided entries', async () => {
        const MATCHERS = [{matcher: 'toBeVisible', query: 'get'} as const];

        const configResult = await computeEslintConfig({
          testingLibrary: {configReact: {preferQueryMatchers: MATCHERS}},
        });

        expect(
          configResult.getRuleEntryOptions(
            'testing-library/react',
            'testing-library/prefer-query-matchers',
          ),
        ).toStrictEqual([{validEntries: MATCHERS}]);
      });
    });

    describe('option: `preferUserEventOverFireEvent`', () => {
      it('enables `testing-library/prefer-user-event` rule by default', async () => {
        const configResult = await computeEslintConfig({testingLibrary: {configReact: true}});

        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/react',
            'testing-library/prefer-user-event',
          ),
        ).toBe(2);
      });

      it('disables `testing-library/prefer-user-event` rule when set to `false`', async () => {
        const configResult = await computeEslintConfig({
          testingLibrary: {configReact: {preferUserEventOverFireEvent: false}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/react',
            'testing-library/prefer-user-event',
          ),
        ).toBe(0);
      });
    });
  });
});

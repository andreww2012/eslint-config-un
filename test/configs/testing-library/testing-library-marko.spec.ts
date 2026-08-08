describe('testing-library: sub config `marko`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig({testingLibrary: {configMarko: true}});

    it('creates `testing-library/marko` eslint config when enabled', () => {
      expect(configResult.getConfigByUnPostfix('testing-library/marko')).toBeDefined();
    });

    it('does not create `testing-library/marko` eslint config by default (marko not installed)', async () => {
      const configResult = await computeEslintConfig('testingLibrary');

      expect(configResult.getConfigByUnPostfix('testing-library/marko')).toBeUndefined();
    });

    it('creates `testing-library/marko` eslint config when `marko` package is installed', async () => {
      addInstalledPackages({marko: '5.0.0'});

      const configResult = await computeEslintConfig('testingLibrary');

      expect(configResult.getConfigByUnPostfix('testing-library/marko')).toBeDefined();
    });

    it('has default `files` in `testing-library/marko` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('testing-library/marko')?.files,
      ).toMatchInlineSnapshot(
        '["**/*[.-_]spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__test?(s)__/**/*.?([cm])[jt]s?(x)"]',
      );
    });

    it('has default `ignores` in `testing-library/marko` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('testing-library/marko')?.ignores?.length,
      ).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({testingLibrary: {configMarko: true}});

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('testing-library/marko')).toMatchObject({
        'testing-library/no-container': 2,
        'testing-library/no-test-id-queries': 1,
        'testing-library/no-manual-cleanup': 0,
      });
    });

    it('includes `fireEvent` in `testing-library/await-async-events` event module list (async for marko)', () => {
      expect(
        configResult.getRuleEntry('testing-library/marko', 'testing-library/await-async-events'),
      ).toMatchInlineSnapshot('[2, {"eventModule": ["userEvent", "fireEvent"]}]');
    });

    it('does not include options in `testing-library/no-await-sync-events` rule (fireEvent is async for marko)', () => {
      expect(
        configResult.getRuleEntryOptions(
          'testing-library/marko',
          'testing-library/no-await-sync-events',
        ),
      ).toStrictEqual([]);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `testing-library/marko` eslint config', async () => {
        const FILES = ['src/**/*.spec.ts'];

        const configResult = await computeEslintConfig({
          testingLibrary: {configMarko: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('testing-library/marko')?.files).toStrictEqual(
          FILES,
        );
      });

      it('disables `testing-library/marko` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          testingLibrary: {configMarko: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('testing-library/marko')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `testing-library/marko` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          testingLibrary: {configMarko: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('testing-library/marko')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `testing-library/marko` eslint config', async () => {
      const configResult = await computeEslintConfig({
        testingLibrary: {
          configMarko: {
            overrides: {'testing-library/await-async-queries': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(
        configResult.getRuleEntrySeverity(
          'testing-library/marko',
          'testing-library/await-async-queries',
        ),
      ).toBe(0);
      expect(configResult.getRuleEntrySeverity('testing-library/marko', 'no-console')).toBe(0);
    });
  });

  describe('options', () => {
    describe('option: `allowContainerFirstChild`', () => {
      it('sets `allowContainerFirstChild: true` in `testing-library/no-node-access` rule options by default', async () => {
        const configResult = await computeEslintConfig({testingLibrary: {configMarko: true}});

        expect(
          configResult.getRuleEntry('testing-library/marko', 'testing-library/no-node-access'),
        ).toMatchInlineSnapshot('[2, {"allowContainerFirstChild": true}]');
      });

      it('sets `allowContainerFirstChild: false` in `testing-library/no-node-access` rule options when set to `false`', async () => {
        const configResult = await computeEslintConfig({
          testingLibrary: {configMarko: {allowContainerFirstChild: false}},
        });

        expect(
          configResult.getRuleEntry('testing-library/marko', 'testing-library/no-node-access'),
        ).toMatchInlineSnapshot('[2, {"allowContainerFirstChild": false}]');
      });
    });

    describe('option: `preferAssertStyle`', () => {
      it('does not enforce assert style by default', async () => {
        const configResult = await computeEslintConfig({testingLibrary: {configMarko: true}});

        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/marko',
            'testing-library/prefer-explicit-assert',
          ),
        ).toBe(0);
        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/marko',
            'testing-library/prefer-implicit-assert',
          ),
        ).toBe(0);
      });

      it('enables `testing-library/prefer-explicit-assert` rule when set to `explicit`', async () => {
        const configResult = await computeEslintConfig({
          testingLibrary: {configMarko: {preferAssertStyle: 'explicit'}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/marko',
            'testing-library/prefer-explicit-assert',
          ),
        ).toBe(2);
      });

      it('enables `testing-library/prefer-implicit-assert` rule when set to `implicit`', async () => {
        const configResult = await computeEslintConfig({
          testingLibrary: {configMarko: {preferAssertStyle: 'implicit'}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/marko',
            'testing-library/prefer-implicit-assert',
          ),
        ).toBe(2);
      });
    });

    describe('option: `preferQueryMatchers`', () => {
      it('disables `testing-library/prefer-query-matchers` rule by default', async () => {
        const configResult = await computeEslintConfig({testingLibrary: {configMarko: true}});

        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/marko',
            'testing-library/prefer-query-matchers',
          ),
        ).toBe(0);
      });

      it('enables `testing-library/prefer-query-matchers` rule with provided entries', async () => {
        const MATCHERS = [{matcher: 'toBeVisible', query: 'get'} as const];

        const configResult = await computeEslintConfig({
          testingLibrary: {configMarko: {preferQueryMatchers: MATCHERS}},
        });

        expect(
          configResult.getRuleEntryOptions(
            'testing-library/marko',
            'testing-library/prefer-query-matchers',
          ),
        ).toStrictEqual([{validEntries: MATCHERS}]);
      });
    });

    describe('option: `preferUserEventOverFireEvent`', () => {
      it('enables `testing-library/prefer-user-event` rule by default', async () => {
        const configResult = await computeEslintConfig({testingLibrary: {configMarko: true}});

        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/marko',
            'testing-library/prefer-user-event',
          ),
        ).toBe(2);
      });

      it('disables `testing-library/prefer-user-event` rule when set to `false`', async () => {
        const configResult = await computeEslintConfig({
          testingLibrary: {configMarko: {preferUserEventOverFireEvent: false}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'testing-library/marko',
            'testing-library/prefer-user-event',
          ),
        ).toBe(0);
      });
    });
  });
});

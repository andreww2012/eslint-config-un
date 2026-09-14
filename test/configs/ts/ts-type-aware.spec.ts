const FIXTURES = {
  asyncFunctionWithoutAwait: 'async-function-without-await.ts',
  floatingPromise: 'floating-promise.ts',
} as const;

describe('ts: sub config `typeAware`', () => {
  describe('basic tests', () => {
    it('creates `ts/type-aware/rules` eslint config by default', async () => {
      const configResult = await computeEslintConfig('ts');

      const configRules = configResult.getConfigByUnPostfix('ts/type-aware/rules');

      expect(configRules).toBeDefined();
      expect(configRules?.files).toMatchInlineSnapshot('["**/*.?([cm])ts?(x)"]');
    });

    it('keeps the project service set up when set to `false`', async () => {
      const configResult = await computeEslintConfig({ts: {configTypeAware: false}});

      expect(configResult.getConfigByUnPostfix('ts/type-aware/rules')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('parsing/ts/type-aware')).toBeDefined();
    });

    it('keeps `require-await` rule firing on an async function without `await` when set to `false`', async () => {
      const results = await testEslintConfig(
        {js: true, ts: {configTypeAware: false}},
        FIXTURES.asyncFunctionWithoutAwait,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.asyncFunctionWithoutAwait,
        'require-await',
      );

      expect(error?.message).toMatchInlineSnapshot(
        `"Async arrow function has no 'await' expression."`,
      );
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig('ts');

      expect(configResult.getRuleSeverities('ts/type-aware/rules')).toMatchObject({
        'ts/await-thenable': 2,
        'ts/no-deprecated': 1,
        'ts/prefer-nullish-coalescing': 0,
      });
    });

    it('turns off the base rules of type-aware extension rules only in `ts/type-aware/rules` eslint config', async () => {
      const configResult = await computeEslintConfig('ts');

      expect(configResult.getRuleSeverities('ts/type-aware/rules')).toMatchObject({
        'dot-notation': 0,
        'require-await': 0,
      });
      expect(configResult.getRuleSeverities('ts/non-type-aware/rules')).not.toHaveProperty(
        'require-await',
      );
    });

    it('`ts/no-floating-promises` rule fires on an unawaited async call', async () => {
      const results = await testEslintConfig('ts', FIXTURES.floatingPromise, import.meta.dirname);

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.floatingPromise,
        'ts/no-floating-promises',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator."',
      );
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `ts/type-aware/rules` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({ts: {configTypeAware: {files: FILES}}});

        expect(configResult.getConfigByUnPostfix('ts/type-aware/rules')?.files).toStrictEqual(
          FILES,
        );
      });

      it('disables `ts/type-aware/rules` eslint config when set to empty array, but keeps the project service', async () => {
        const configResult = await computeEslintConfig({ts: {configTypeAware: {files: []}}});

        expect(configResult.getConfigByUnPostfix('ts/type-aware/rules')).toBeUndefined();
        expect(configResult.getConfigByUnPostfix('parsing/ts/type-aware')).toBeDefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `ts/type-aware/rules` eslint config and merges them with the implicit defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({ts: {configTypeAware: {ignores: IGNORES}}});

        const config = configResult.getConfigByUnPostfix('ts/type-aware/rules');

        expect(config?.ignores).toIncludeAllMembers(IGNORES);
        expect(config?.ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `ts/type-aware/rules` eslint config', async () => {
      const configResult = await computeEslintConfig({
        ts: {
          configTypeAware: {
            overrides: {'ts/await-thenable': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('ts/type-aware/rules')).toMatchObject({
        'ts/await-thenable': 0,
        'no-console': 0,
      });
    });
  });
});

const FIXTURES = {
  importFromInternal: 'import-from-internal.ts',
} as const;

beforeEach(() => {
  addInstalledPackages({rxjs: '7.8.2'});
});

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('rxjs');

  it('loads `rxjs` plugin if used', () => {
    expect(configResult.getLoadedPlugin('rxjs')).toBeDefined();
  });

  it('creates `rxjs` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('rxjs')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `rxjs` eslint config', async () => {
      await expectConfigState({}, 'rxjs', false);
    });

    it('creates `rxjs` eslint config if explicitly enabled', async () => {
      await expectConfigState('rxjs', 'rxjs', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `rxjs` eslint config when `rxjs` package is installed', async () => {
      await expectConfigState({}, 'rxjs', true, 'default');
    });

    it('creates `rxjs` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('rxjs', 'rxjs', ['rxjs', true], 'default');
    });

    it('does not create `rxjs` eslint config if explicitly disabled', async () => {
      await expectConfigState({rxjs: false}, 'rxjs', false, 'default');
    });

    describe('`rxjs` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `rxjs` eslint config', async () => {
        await expectConfigState({}, 'rxjs', false, 'default');
      });

      it('creates `rxjs` eslint config if explicitly enabled', async () => {
        await expectConfigState('rxjs', 'rxjs', true, 'default');
      });

      it('does not create `rxjs` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({rxjs: false}, 'rxjs', ['rxjs', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `rxjs` eslint config when `rxjs` package is installed', async () => {
      await expectConfigState({}, 'rxjs', true, 'misc-enabled');
    });

    it('creates `rxjs` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('rxjs', 'rxjs', ['rxjs', true], 'misc-enabled');
    });

    it('does not create `rxjs` eslint config if explicitly disabled', async () => {
      await expectConfigState({rxjs: false}, 'rxjs', false, 'misc-enabled');
    });
  });

  it('has no explicit `files` restriction in `rxjs` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('rxjs')?.files).toBeUndefined();
  });

  it('has default `ignores` in `rxjs` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('rxjs')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('rxjs');

  it('enables `rxjs/no-async-subscribe` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('rxjs', 'rxjs/no-async-subscribe')).toBe(2);
  });

  it('disables `rxjs/no-ignored-subscribe` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('rxjs', 'rxjs/no-ignored-subscribe')).toBe(0);
  });

  it('`rxjs/no-internal` rule fires on an import from `rxjs/internal`', async () => {
    const results = await testEslintConfig(
      {rxjs: true, ts: true},
      FIXTURES.importFromInternal,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.importFromInternal,
      'rxjs/no-internal',
    );

    expect(error?.message).toMatchInlineSnapshot('"RxJS imports from internal are forbidden."');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `rxjs` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({rxjs: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('rxjs')?.files).toStrictEqual(FILES);
    });

    it('disables `rxjs` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({rxjs: {files: []}});

      expect(configResult.getConfigByUnPostfix('rxjs')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `rxjs` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({rxjs: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('rxjs')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `rxjs` eslint config', async () => {
    const configResult = await computeEslintConfig({
      rxjs: {overrides: {'rxjs/no-async-subscribe': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('rxjs', 'rxjs/no-async-subscribe')).toBe(0);
    expect(configResult.getRuleEntrySeverity('rxjs', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `banObservables`', () => {
    it('disables `rxjs/ban-observables` rule by default', async () => {
      const configResult = await computeEslintConfig('rxjs');

      expect(configResult.getRuleEntrySeverity('rxjs', 'rxjs/ban-observables')).toBe(0);
    });

    it('enables `rxjs/ban-observables` rule when set to non-empty array', async () => {
      const BANNED_OBSERVABLES = ['Observable'];

      const configResult = await computeEslintConfig({rxjs: {banObservables: BANNED_OBSERVABLES}});

      expect(configResult.getRuleEntryOptions('rxjs', 'rxjs/ban-observables')).toStrictEqual([
        Object.fromEntries(BANNED_OBSERVABLES.map((name) => [name, true])),
      ]);
    });

    it('enables `rxjs/ban-observables` rule when set to non-empty object', async () => {
      const BANNED_OBSERVABLES = {Observable: 'Use Subject instead'};

      const configResult = await computeEslintConfig({rxjs: {banObservables: BANNED_OBSERVABLES}});

      expect(configResult.getRuleEntryOptions('rxjs', 'rxjs/ban-observables')).toStrictEqual([
        BANNED_OBSERVABLES,
      ]);
    });

    it('disables `rxjs/ban-observables` rule when set to empty array', async () => {
      const configResult = await computeEslintConfig({rxjs: {banObservables: []}});

      expect(configResult.getRuleEntrySeverity('rxjs', 'rxjs/ban-observables')).toBe(0);
    });

    it('disables `rxjs/ban-observables` rule when set to empty object', async () => {
      const configResult = await computeEslintConfig({rxjs: {banObservables: {}}});

      expect(configResult.getRuleEntrySeverity('rxjs', 'rxjs/ban-observables')).toBe(0);
    });
  });

  describe('option: `banOperators`', () => {
    it('enables `rxjs/ban-operators` rule with `tap: true` by default', async () => {
      const configResult = await computeEslintConfig('rxjs');

      expect(configResult.getRuleEntryOptions('rxjs', 'rxjs/ban-operators')).toStrictEqual([
        {tap: true},
      ]);
    });

    it('merges user-provided operators with default `tap: true` when set to object', async () => {
      const BANNED_OPERATORS = {switchMap: true};

      const configResult = await computeEslintConfig({
        rxjs: {banOperators: BANNED_OPERATORS},
      });

      expect(configResult.getRuleEntryOptions('rxjs', 'rxjs/ban-operators')).toStrictEqual([
        {tap: true, ...BANNED_OPERATORS},
      ]);
    });

    it('user-provided operators override default ignored ones when set to array', async () => {
      const BANNED_OPERATORS = ['switchMap'];

      const configResult = await computeEslintConfig({
        rxjs: {banOperators: BANNED_OPERATORS},
      });

      expect(configResult.getRuleEntryOptions('rxjs', 'rxjs/ban-operators')).toStrictEqual([
        Object.fromEntries(BANNED_OPERATORS.map((name) => [name, true])),
      ]);
    });

    it('allows overriding `tap` when set to object with `tap: false`', async () => {
      const BANNED_OPERATORS = {tap: false};

      const configResult = await computeEslintConfig({
        rxjs: {banOperators: BANNED_OPERATORS},
      });

      // falsy values get filtered out
      expect(configResult.getRuleEntryOptions('rxjs', 'rxjs/ban-operators')).toStrictEqual([]);
    });

    it('disables `rxjs/ban-operators` rule when set to empty array', async () => {
      const configResult = await computeEslintConfig({rxjs: {banOperators: []}});

      expect(configResult.getRuleEntrySeverity('rxjs', 'rxjs/ban-operators')).toBe(0);
    });

    it('disables `rxjs/ban-operators` rule when option re-enables all operators banned by default', async () => {
      const configResult = await computeEslintConfig({rxjs: {banOperators: {tap: false}}});

      expect(configResult.getRuleEntrySeverity('rxjs', 'rxjs/ban-operators')).toBe(0);
    });
  });

  describe('option: `enforceFinnishNotation`', () => {
    it('disables `rxjs/finnish` and `rxjs/no-finnish` rules by default and `@angular/core` is not installed', async () => {
      const configResult = await computeEslintConfig('rxjs');

      expect(configResult.getRuleEntrySeverity('rxjs', 'rxjs/finnish')).toBe(0);
      expect(configResult.getRuleEntrySeverity('rxjs', 'rxjs/no-finnish')).toBe(0);
    });

    it('enables `rxjs/finnish` rule and disables `rxjs/no-finnish` by default and `@angular/core` is installed', async () => {
      addInstalledPackages({'@angular/core': '15.2.0'});

      const configResult = await computeEslintConfig('rxjs');

      expect(configResult.getRuleEntrySeverity('rxjs', 'rxjs/finnish')).toBe(2);
      expect(configResult.getRuleEntrySeverity('rxjs', 'rxjs/no-finnish')).toBe(0);
    });

    it('enables `rxjs/finnish` rule and disables `rxjs/no-finnish` when set to `true`', async () => {
      const configResult = await computeEslintConfig({rxjs: {enforceFinnishNotation: true}});

      expect(configResult.getRuleEntrySeverity('rxjs', 'rxjs/finnish')).toBe(2);
      expect(configResult.getRuleEntrySeverity('rxjs', 'rxjs/no-finnish')).toBe(0);
    });

    it("enables `rxjs/no-finnish` rule and disables `rxjs/finnish` when set to `'forbid'`", async () => {
      const configResult = await computeEslintConfig({rxjs: {enforceFinnishNotation: 'forbid'}});

      expect(configResult.getRuleEntrySeverity('rxjs', 'rxjs/finnish')).toBe(0);
      expect(configResult.getRuleEntrySeverity('rxjs', 'rxjs/no-finnish')).toBe(2);
    });
  });

  describe('option: `enforceJustInsteadOfOf`', () => {
    it('disables `rxjs/just` rule by default', async () => {
      const configResult = await computeEslintConfig('rxjs');

      expect(configResult.getRuleEntrySeverity('rxjs', 'rxjs/just')).toBe(0);
    });

    it('enables `rxjs/just` rule when set to `true`', async () => {
      const configResult = await computeEslintConfig({rxjs: {enforceJustInsteadOfOf: true}});

      expect(configResult.getRuleEntrySeverity('rxjs', 'rxjs/just')).toBe(2);
    });

    it('disables `rxjs/just` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({rxjs: {enforceJustInsteadOfOf: false}});

      expect(configResult.getRuleEntrySeverity('rxjs', 'rxjs/just')).toBe(0);
    });
  });
});

import {GLOB_CIVET_COMPILED} from '../../../src/constants';

const FIXTURES = {
  debuggerAfterFunction: 'debugger-after-function.civet',
  ifElseWithImplicitReturns: 'if-else-with-implicit-returns.civet',
} as const;

beforeEach(() => {
  addInstalledPackages({'@danielx/civet': '0.11.16'});
});

describe('basic tests', () => {
  it('creates `civet` and `civet/compiled` eslint configs and sets up the processor if set to `true`', async () => {
    const configResult = await computeEslintConfig('civet');

    const config = configResult.getConfigByUnPostfix('civet');

    expect(config).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot('["**/*.civet"]');
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getConfigByUnPostfix('civet/compiled')?.files).toMatchInlineSnapshot(
      '["**/*.civet/**/*.*"]',
    );

    const parsingConfig = configResult.getConfigByUnPostfix('parsing/civet/js');

    expect(parsingConfig?.files).toMatchInlineSnapshot('["**/*.civet"]');
    expect(parsingConfig?.processor).toBeDefined();
  });

  it('does not create `civet` and `civet/compiled` eslint configs and does not set up the processor if set to `false`', async () => {
    const configResult = await computeEslintConfig({civet: false});

    expect(configResult.getConfigByUnPostfix('civet')).toBeUndefined();
    expect(configResult.getConfigByUnPostfix('civet/compiled')).toBeUndefined();
    expect(
      configResult.getConfigsByUnPostfix((name) => name.startsWith('parsing/civet')),
    ).toHaveLength(0);
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `civet` eslint config', async () => {
      await expectConfigState({}, 'civet', false);
    });

    it('creates `civet` eslint config if explicitly enabled', async () => {
      await expectConfigState('civet', 'civet', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    describe('`@danielx/civet` is installed', () => {
      it('creates `civet` eslint config by default', async () => {
        await expectConfigState({}, 'civet', true, 'default');
      });

      it('creates `civet` eslint config and prints a warning if explicitly enabled', async () => {
        await expectConfigState('civet', 'civet', ['civet', true], 'default');
      });

      it('does not create `civet` eslint config if explicitly disabled', async () => {
        await expectConfigState({civet: false}, 'civet', false, 'default');
      });
    });

    describe('`@danielx/civet` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `civet` eslint config', async () => {
        await expectConfigState({}, 'civet', false, 'default');
      });

      it('creates `civet` eslint config if explicitly enabled', async () => {
        await expectConfigState('civet', 'civet', true, 'default');
      });

      it('does not create `civet` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({civet: false}, 'civet', ['civet', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `civet` eslint config when `@danielx/civet` is installed', async () => {
      await expectConfigState({}, 'civet', true, 'misc-enabled');
    });

    it('creates `civet` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState({civet: true}, 'civet', ['civet', true], 'misc-enabled');
    });

    it('does not create `civet` eslint config if explicitly disabled', async () => {
      await expectConfigState({civet: false}, 'civet', false, 'misc-enabled');
    });
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig('civet');

    expect(configResult.getRuleSeverities('civet/compiled')).toMatchObject({
      'no-else-return': 0,
      'unicorn/no-useless-else': 0,
    });
  });

  it('reports the problems of the compiled code at their positions in the Civet file', async () => {
    const results = await testEslintConfig(
      {civet: true, js: true},
      FIXTURES.debuggerAfterFunction,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.debuggerAfterFunction,
      'no-debugger',
    );

    expect({line: error?.line, column: error?.column}).toMatchInlineSnapshot(
      '{"column": 1, "line": 4}',
    );
  });

  it('does not apply type-aware rules to the compiled code', async () => {
    const results = await testEslintConfig(
      {civet: true, js: true, ts: true},
      FIXTURES.debuggerAfterFunction,
      {
        searchFixturesRelativeToPath: import.meta.dirname,
        internalOptions: {},
      },
    );

    expect(results[0]?.messages.filter(({fatal}) => fatal)).toStrictEqual([]);
    expect(
      findLintMessageFromLintResults(results, FIXTURES.debuggerAfterFunction, 'no-debugger'),
    ).toBeDefined();
  });

  it('`no-else-return` does not report the `else` of an `if` with implicit returns', async () => {
    const results = await testEslintConfig(
      {civet: true, js: true},
      FIXTURES.ifElseWithImplicitReturns,
      import.meta.dirname,
    );

    expect(
      findLintMessageFromLintResults(results, FIXTURES.ifElseWithImplicitReturns, 'no-else-return'),
    ).toBeUndefined();
  });

  it('`no-else-return` reports the `else` of an `if` with implicit returns when re-enabled via `overrides`', async () => {
    const results = await testEslintConfig(
      {civet: {overrides: {'no-else-return': 2}}, js: true},
      FIXTURES.ifElseWithImplicitReturns,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.ifElseWithImplicitReturns,
      'no-else-return',
    );

    expect(error?.message).toMatchInlineSnapshot(`"Unnecessary 'else' after 'return'."`);
  });
});

describe('processor', () => {
  it('compiles to TypeScript when `ts` config is enabled', async () => {
    const configResult = await computeEslintConfig({civet: true, ts: true});

    expect(configResult.getConfigByUnPostfix('parsing/civet/ts')?.processor).toBeDefined();
    expect(configResult.getConfigByUnPostfix('parsing/civet/js')).toBeUndefined();
  });

  it('compiles to JavaScript when `ts` config is disabled', async () => {
    const configResult = await computeEslintConfig('civet');

    expect(configResult.getConfigByUnPostfix('parsing/civet/js')?.processor).toBeDefined();
    expect(configResult.getConfigByUnPostfix('parsing/civet/ts')).toBeUndefined();
  });

  it('compiles to the dialect set in `parsing.civet.dialect`', async () => {
    const configResult = await computeEslintConfig(
      {civet: true, ts: true},
      {un: {parsing: {civet: {dialect: 'js'}}}},
    );

    expect(configResult.getConfigByUnPostfix('parsing/civet/js')?.processor).toBeDefined();
    expect(configResult.getConfigByUnPostfix('parsing/civet/ts')).toBeUndefined();
  });

  it.each(['js', 'ts'] as const)(
    'names the compiled `%s` file after the source file, not its absolute path',
    async (dialect) => {
      const configResult = await computeEslintConfig(
        {civet: true},
        {un: {parsing: {civet: {dialect}}}},
      );

      const processor = configResult.getConfigByUnPostfix(`parsing/civet/${dialect}`)?.processor;
      const files =
        typeof processor === 'object'
          ? processor.preprocess?.('x := 1', '/some/ignored/directory/file.civet')
          : undefined;

      expect(files?.map((file) => (typeof file === 'string' ? file : file.filename))).toStrictEqual(
        [`file.civet.${dialect}x`],
      );
    },
  );

  it('does not set up the processor when `parsing.civet` is `false`', async () => {
    const configResult = await computeEslintConfig('civet', {un: {parsing: {civet: false}}});

    expect(
      configResult.getConfigsByUnPostfix((name) => name.startsWith('parsing/civet')),
    ).toHaveLength(0);
    expect(configResult.getConfigByUnPostfix('civet')?.ignores).toIncludeAllMembers(['**/*']);
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `civet` eslint config and the processor follows them', async () => {
      const FILES = ['src/**/*.civet'];

      const configResult = await computeEslintConfig({civet: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('civet')?.files).toStrictEqual(FILES);
      expect(configResult.getConfigByUnPostfix('parsing/civet/js')?.files).toStrictEqual(FILES);
    });

    it('does not use user-provided `files` in `civet/compiled` eslint config', async () => {
      const FILES = ['src/**/*.civet'];

      const configResult = await computeEslintConfig({civet: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('civet/compiled')?.files).toStrictEqual([
        GLOB_CIVET_COMPILED,
      ]);
    });

    it('disables `civet` and `civet/compiled` eslint configs and the processor when set to empty array', async () => {
      const configResult = await computeEslintConfig({civet: {files: []}});

      expect(configResult.getConfigByUnPostfix('civet')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('civet/compiled')).toBeUndefined();
      expect(
        configResult.getConfigsByUnPostfix((name) => name.startsWith('parsing/civet')),
      ).toHaveLength(0);
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `civet` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({civet: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('civet')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `civet/compiled` eslint config', async () => {
    const configResult = await computeEslintConfig({
      civet: {
        overrides: {'no-else-return': 2},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleSeverities('civet/compiled')).toMatchObject({
      'no-else-return': 2,
      'no-console': 0,
    });
  });
});

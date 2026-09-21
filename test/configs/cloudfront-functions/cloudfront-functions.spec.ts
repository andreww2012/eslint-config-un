const FIXTURES = {
  kvsLookup: 'kvs-lookup.js',
  runtimeV2Features: 'runtime-v2-features.js',
  setTimeout: 'set-timeout.js',
  unsupportedApis: 'unsupported-apis.js',
} as const;

const V2_FILES = ['**/cloudfront-v2/**/*.js'];

describe('basic tests', () => {
  it('creates `cloudfront-functions/v2` and `cloudfront-functions/v2/es-features` eslint configs, but not `cloudfront-functions/v1` by default', async () => {
    const configResult = await computeEslintConfig({
      cloudfrontFunctions: {files: V2_FILES},
    });

    const config = configResult.getConfigByUnPostfix('cloudfront-functions/v2');

    expect(config).toBeDefined();
    expect(configResult.getConfigByUnPostfix('cloudfront-functions/v2/es-features')).toBeDefined();
    expect(configResult.getConfigByUnPostfix('cloudfront-functions/v1')).toBeUndefined();
    expect(config?.files).toStrictEqual(V2_FILES);
    expect(config?.ignores?.length).toBeGreaterThan(0);
  });

  it('does not create `cloudfront-functions/v2` eslint config when neither `files` nor `ignores` is provided', async () => {
    const configResult = await computeEslintConfig('cloudfrontFunctions');

    expect(configResult.getConfigByUnPostfix('cloudfront-functions/v2')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `cloudfront-functions/v2` eslint config by default', async () => {
      await expectConfigState({}, 'cloudfront-functions/v2', false);
    });

    it('does not create `cloudfront-functions/v2` eslint config when explicitly enabled without files or ignores', async () => {
      await expectConfigState({cloudfrontFunctions: true}, 'cloudfront-functions/v2', false);
    });

    it('creates `cloudfront-functions/v2` eslint config when explicitly enabled with files', async () => {
      const configResult = await computeEslintConfig({
        cloudfrontFunctions: {files: V2_FILES},
      });

      expect(configResult.getConfigByUnPostfix('cloudfront-functions/v2')).toBeDefined();
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `cloudfront-functions/v2` eslint config', async () => {
      await expectConfigState({}, 'cloudfront-functions/v2', false, 'default');
    });

    it('creates `cloudfront-functions/v2` eslint config when explicitly enabled with files', async () => {
      await expectConfigState(
        {cloudfrontFunctions: {files: V2_FILES}},
        'cloudfront-functions/v2',
        true,
        'default',
      );
    });

    it('does not create `cloudfront-functions/v2` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {cloudfrontFunctions: false},
        'cloudfront-functions/v2',
        ['cloudfrontFunctions', false],
        'default',
      );
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `cloudfront-functions/v2` eslint config (not in misc group)', async () => {
      await expectConfigState({}, 'cloudfront-functions/v2', false, 'misc-enabled');
    });

    it('creates `cloudfront-functions/v2` eslint config when explicitly enabled', async () => {
      await expectConfigState(
        {cloudfrontFunctions: {files: V2_FILES}},
        'cloudfront-functions/v2',
        true,
        'misc-enabled',
      );
    });

    it('does not create `cloudfront-functions/v2` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {cloudfrontFunctions: false},
        'cloudfront-functions/v2',
        ['cloudfrontFunctions', false],
        'misc-enabled',
      );
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig({
    cloudfrontFunctions: {files: V2_FILES},
  });

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('cloudfront-functions/v2')).toMatchObject({
      'no-undef': 2,
      'import/no-unresolved': 0,
    });
  });

  it('does not override `no-var` rule in v2 (let/const is allowed in v2)', () => {
    expect(configResult.getRuleEntry('cloudfront-functions/v2', 'no-var')).toBeUndefined();
  });

  it('turns off Node.js globals missing in CloudFront and defines the available ones', () => {
    expect(configResult.getConfigByUnPostfix('cloudfront-functions/v2')).toMatchObject({
      languageOptions: {
        globals: {
          Buffer: 'readonly',
          console: 'readonly',
          fetch: 'off',
          process: 'off',
          require: 'readonly',
          setTimeout: 'off',
        },
      },
    });
  });

  it('`no-undef` rule fires when `setTimeout` is used', async () => {
    const results = await testEslintConfig(
      {cloudfrontFunctions: {files: ['**/*.js']}},
      FIXTURES.setTimeout,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(results, FIXTURES.setTimeout, 'no-undef');

    expect(error?.message).toMatchInlineSnapshot(`"'setTimeout' is not defined."`);
  });

  it('`no-restricted-syntax` rule fires on `console.log` with multiple arguments, `Object.create` with property descriptors and async function arguments', async () => {
    const results = await testEslintConfig(
      {cloudfrontFunctions: {files: ['**/*.js']}},
      FIXTURES.unsupportedApis,
      import.meta.dirname,
    );

    expect(
      findLintMessageFromLintResults(results, FIXTURES.unsupportedApis, 'no-restricted-syntax', {
        all: true,
      }).map(({message}) => message),
    ).toMatchInlineSnapshot(
      '["Passing multiple arguments to `console.log` is not allowed in CloudFront functions", "Passing property descriptors to `Object.create` is not allowed in CloudFront functions", "Nested async functions and async function arguments are not allowed in CloudFront functions"]',
    );
  });

  it.each([FIXTURES.kvsLookup, FIXTURES.runtimeV2Features])(
    'does not report anything in `%s` when commonly used configs are enabled',
    async (fixture) => {
      const results = await testEslintConfig(
        {
          e18e: true,
          import: true,
          js: true,
          math: true,
          node: true,
          promise: true,
          regexp: true,
          unicorn: true,
          cloudfrontFunctions: {files: ['**/*.js']},
        },
        fixture,
        {
          searchFixturesRelativeToPath: import.meta.dirname,
          // Otherwise type-aware rules would run on `.js` files and crash
          internalOptions: {},
        },
      );

      expect(results[0]?.messages.map(({ruleId}) => ruleId)).toStrictEqual([]);
    },
  );
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `cloudfront-functions/v2` eslint config', async () => {
      const FILES = ['src/**/*.cf.js'];

      const configResult = await computeEslintConfig({cloudfrontFunctions: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('cloudfront-functions/v2')?.files).toStrictEqual(
        FILES,
      );
    });

    it('does not create `cloudfront-functions/v2` eslint config when set to empty array (does not affect `configV1`)', async () => {
      const configResult = await computeEslintConfig({
        cloudfrontFunctions: {files: [], configV1: {files: ['**/*.js']}},
      });

      expect(configResult.getConfigByUnPostfix('cloudfront-functions/v2')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('cloudfront-functions/v1')).toBeDefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `cloudfront-functions/v2` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({
        cloudfrontFunctions: {files: V2_FILES, ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix('cloudfront-functions/v2')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `cloudfront-functions/v2` eslint config', async () => {
    const configResult = await computeEslintConfig({
      cloudfrontFunctions: {
        files: ['**/*.js'],
        overrides: {'no-undef': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('cloudfront-functions/v2', 'no-undef')).toBe(0);
    expect(configResult.getRuleEntrySeverity('cloudfront-functions/v2', 'no-console')).toBe(0);
  });
});

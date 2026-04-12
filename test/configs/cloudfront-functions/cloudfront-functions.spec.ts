const V2_FILES = ['**/cloudfront-v2/**/*.js'];

const FIXTURES = {
  setTimeout: 'set-timeout.js',
} as const;

describe('basic tests', async () => {
  it('does not create `cloudfront-functions/v2` eslint config when neither `files` or `ignores` are provided', async () => {
    const configResult = await computeEslintConfig('cloudfrontFunctions');

    expect(configResult.getConfigByUnPostfix('cloudfront-functions/v2')).toBeUndefined();
  });

  const configResult = await computeEslintConfig({
    cloudfrontFunctions: {files: V2_FILES},
  });

  it('creates `cloudfront-functions/v2` and `cloudfront-functions/v2/es-features` eslint configs, but not `cloudfront-functions/v1`', () => {
    expect(configResult.getConfigByUnPostfix('cloudfront-functions/v2')).toBeDefined();
    expect(configResult.getConfigByUnPostfix('cloudfront-functions/v2/es-features')).toBeDefined();
    expect(configResult.getConfigByUnPostfix('cloudfront-functions/v1')).toBeUndefined();
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

  it('has user-provided `files` in `cloudfront-functions/v2` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('cloudfront-functions/v2')?.files).toStrictEqual(
      V2_FILES,
    );
  });

  it('has default `ignores` in `cloudfront-functions/v2` eslint config', () => {
    expect(
      configResult.getConfigByUnPostfix('cloudfront-functions/v2')?.ignores?.length,
    ).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig({
    cloudfrontFunctions: {files: V2_FILES},
  });

  it('enables `no-restricted-globals` rule by default', () => {
    expect(
      configResult.getRuleEntrySeverity('cloudfront-functions/v2', 'no-restricted-globals'),
    ).toBe(2);
  });

  it('disables `prefer-object-has-own` rule by default', () => {
    expect(
      configResult.getRuleEntrySeverity('cloudfront-functions/v2', 'prefer-object-has-own'),
    ).toBe(0);
  });

  it('does not override `no-var` rule in v2 (let/const is allowed in v2)', () => {
    expect(configResult.getRuleEntry('cloudfront-functions/v2', 'no-var')).toBeUndefined();
  });

  it('`no-restricted-globals` rule fires when `setTimeout` is used', async () => {
    const results = await testEslintConfig(
      {cloudfrontFunctions: {files: ['**/*.js']}},
      FIXTURES.setTimeout,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.setTimeout,
      'no-restricted-globals',
    );

    expect(error?.message).toMatchInlineSnapshot(
      `"Unexpected use of 'setTimeout'. \`setTimeout\` is not allowed in CloudFront functions"`,
    );
  });
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
        overrides: {'no-restricted-globals': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntry('cloudfront-functions/v2', 'no-restricted-globals')).toBe(0);
    expect(configResult.getRuleEntry('cloudfront-functions/v2', 'no-console')).toBe(0);
  });
});

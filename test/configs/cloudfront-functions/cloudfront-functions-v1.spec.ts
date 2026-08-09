const FIXTURES = {
  cloudfrontImport: 'cloudfront-import.js',
} as const;

const V1_FILES = ['**/cloudfront-v1/**/*.js'];

describe('cloudfront functions: sub config `v1`', () => {
  describe('basic tests', () => {
    it('creates `cloudfront-functions/v1` and `cloudfront-functions/v1/es-features` eslint configs, but not `cloudfront-functions/v2` by default', async () => {
      const configResult = await computeEslintConfig({
        cloudfrontFunctions: {configV1: {files: V1_FILES}},
      });

      const config = configResult.getConfigByUnPostfix('cloudfront-functions/v1');

      expect(config).toBeDefined();
      expect(configResult.getConfigByUnPostfix('cloudfront-functions/v2')).toBeUndefined();
      expect(
        configResult.getConfigByUnPostfix('cloudfront-functions/v1/es-features'),
      ).toBeDefined();
      expect(config?.files).toStrictEqual(V1_FILES);
      expect(config?.ignores?.length).toBeGreaterThan(0);
    });

    it('does not create `cloudfront-functions/v1` eslint config when neither `files` or `ignores` are provided', async () => {
      const configResult = await computeEslintConfig({
        cloudfrontFunctions: {configV1: {}},
      });

      expect(configResult.getConfigByUnPostfix('cloudfront-functions/v1')).toBeUndefined();
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({
      cloudfrontFunctions: {configV1: {files: V1_FILES}},
    });

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('cloudfront-functions/v1')).toMatchObject({
        'no-restricted-globals': 2,
        'no-var': 0,
      });
    });

    it("`no-restricted-syntax` rule fires when `require('cloudfront')` is used (not allowed in v1)", async () => {
      const results = await testEslintConfig(
        {cloudfrontFunctions: {configV1: {files: ['**/*.js']}}},
        FIXTURES.cloudfrontImport,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.cloudfrontImport,
        'no-restricted-syntax',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"Only specific modules are allowed to be required in CloudFront functions: `querystring`, `crypto`."',
      );
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `cloudfront-functions/v1` eslint config', async () => {
        const FILES = ['src/**/*.cf-v1.js'];

        const configResult = await computeEslintConfig({
          cloudfrontFunctions: {configV1: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('cloudfront-functions/v1')?.files).toStrictEqual(
          FILES,
        );
      });

      it('does not create `cloudfront-functions/v1` eslint config when `configV1.files` is empty array', async () => {
        const configResult = await computeEslintConfig({
          cloudfrontFunctions: {configV1: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('cloudfront-functions/v1')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('creates `cloudfront-functions/v1` eslint config when `configV1.ignores` is non-empty (even without `files`)', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          cloudfrontFunctions: {configV1: {ignores: IGNORES}},
        });

        expect(configResult.getConfigByUnPostfix('cloudfront-functions/v1')).toBeDefined();
      });

      it('uses user-provided `ignores` in `cloudfront-functions/v1` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          cloudfrontFunctions: {configV1: {files: ['**/*.js'], ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('cloudfront-functions/v1')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `cloudfront-functions/v1` eslint config', async () => {
      const configResult = await computeEslintConfig({
        cloudfrontFunctions: {
          configV1: {
            files: ['**/*.js'],
            overrides: {'no-restricted-globals': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(
        configResult.getRuleEntrySeverity('cloudfront-functions/v1', 'no-restricted-globals'),
      ).toBe(0);
      expect(configResult.getRuleEntrySeverity('cloudfront-functions/v1', 'no-console')).toBe(0);
    });
  });
});

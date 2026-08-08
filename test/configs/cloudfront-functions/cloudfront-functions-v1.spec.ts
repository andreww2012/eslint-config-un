const FIXTURES = {
  cloudfrontImport: 'cloudfront-import.js',
} as const;

const V1_FILES = ['**/cloudfront-v1/**/*.js'];

describe('cloudfront functions: sub config `v1`', () => {
  describe('basic tests', async () => {
    it('does not create `cloudfront-functions/v1` eslint config when neither `files` or `ignores` are provided', async () => {
      const configResult = await computeEslintConfig({
        cloudfrontFunctions: {configV1: {}},
      });

      expect(configResult.getConfigByUnPostfix('cloudfront-functions/v1')).toBeUndefined();
    });

    const configResult = await computeEslintConfig({
      cloudfrontFunctions: {configV1: {files: V1_FILES}},
    });

    it('creates `cloudfront-functions/v1` and `cloudfront-functions/v1/es-features` eslint configs, but not `cloudfront-functions/v2`', () => {
      expect(configResult.getConfigByUnPostfix('cloudfront-functions/v1')).toBeDefined();
      expect(configResult.getConfigByUnPostfix('cloudfront-functions/v2')).toBeUndefined();
      expect(
        configResult.getConfigByUnPostfix('cloudfront-functions/v1/es-features'),
      ).toBeDefined();
    });

    it('has user-provided `files` in `cloudfront-functions/v1` eslint config', () => {
      expect(configResult.getConfigByUnPostfix('cloudfront-functions/v1')?.files).toStrictEqual(
        V1_FILES,
      );
    });

    it('has default `ignores` in `cloudfront-functions/v1` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('cloudfront-functions/v1')?.ignores?.length,
      ).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({
      cloudfrontFunctions: {configV1: {files: V1_FILES}},
    });

    it('enables `no-restricted-globals` rule in `cloudfront-functions/v1` eslint config', () => {
      expect(
        configResult.getRuleEntrySeverity('cloudfront-functions/v1', 'no-restricted-globals'),
      ).toBe(2);
    });

    it('disables `no-var` rule in `cloudfront-functions/v1` eslint config (v1 does not support let/const)', () => {
      expect(configResult.getRuleEntrySeverity('cloudfront-functions/v1', 'no-var')).toBe(0);
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

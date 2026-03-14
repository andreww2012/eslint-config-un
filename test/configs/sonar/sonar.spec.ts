const FIXTURES = {
  usingIncludesOnEmptyArray: 'using-includes-on-empty-array.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('sonar');

  it('loads `sonarjs` plugin if used', () => {
    expect(configResult.getLoadedPlugin('sonarjs')).toBeDefined();
  });

  it('creates `sonar` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('sonar')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `sonar` eslint config', async () => {
      const modeConfigResult = await computeEslintConfig({});

      expect(modeConfigResult.getConfigByUnPostfix('sonar')).toBeUndefined();
    });

    it('creates `sonar` eslint config if explicitly enabled', async () => {
      const modeConfigResult = await computeEslintConfig('sonar');

      expect(modeConfigResult.getConfigByUnPostfix('sonar')).toBeDefined();
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `sonar` eslint config by default', async () => {
      const modeConfigResult = await computeEslintConfig({}, {reset: true});

      expect(modeConfigResult.getConfigByUnPostfix('sonar')).toBeDefined();
    });

    it('creates `sonar` eslint config and prints a warning if explicitly enabled', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      const modeConfigResult = await computeEslintConfig('sonar', {reset: true});

      expect(modeConfigResult.getConfigByUnPostfix('sonar')).toBeDefined();

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          `[warn] [eslint-config-un] There is no need to enable \`sonar\` config because this is the default`,
        ),
      ).toBe(true);
    });

    it('does not create `sonar` eslint config if explicitly disabled', async () => {
      const modeConfigResult = await computeEslintConfig({sonar: false}, {reset: true});

      expect(modeConfigResult.getConfigByUnPostfix('sonar')).toBeUndefined();
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `sonar` eslint config', async () => {
      const modeConfigResult = await computeEslintConfig(
        {},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(modeConfigResult.getConfigByUnPostfix('sonar')).toBeDefined();
    });
  });

  it('has no explicit `files` restriction in `sonar` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('sonar')?.files).toBeUndefined();
  });

  it('has default `ignores` in `sonar` eslint config', () => {
    const ignores = configResult.getConfigByUnPostfix('sonar')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('sonar');

  it('enables `sonarjs/arguments-order` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('sonar', 'sonarjs/arguments-order')).toBe(2);
  });

  it('does not enable `sonarjs/file-header` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('sonar', 'sonarjs/file-header')).toBe(0);
  });

  it('`sonarjs/no-empty-collection` rule works', async () => {
    const results = await testEslintConfig(
      'sonar',
      FIXTURES.usingIncludesOnEmptyArray,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.usingIncludesOnEmptyArray,
      'sonarjs/no-empty-collection',
    );

    expect(error?.message).toMatchInlineSnapshot(
      `"Review this usage of "strings" as it can only be empty here."`,
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('has no implicit default `files` in `sonar` eslint config', async () => {
      const configResult = await computeEslintConfig('sonar');

      expect(configResult.getConfigByUnPostfix('sonar')?.files).toBeUndefined();
    });

    it('uses user-provided `files` in `sonar` eslint config', async () => {
      const FILES = ['src/**/*.{js,ts}'];
      const configResult = await computeEslintConfig({sonar: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('sonar')?.files).toStrictEqual(FILES);
    });

    it('disables `sonar` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({sonar: {files: []}});

      expect(configResult.getConfigByUnPostfix('sonar')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `sonar` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({sonar: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('sonar')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });

    it('empty `ignores` array does not disable `sonar` eslint config', async () => {
      const configResult = await computeEslintConfig({sonar: {ignores: []}});

      expect(configResult.getConfigByUnPostfix('sonar')).toBeDefined();
    });
  });

  it('respects `overrides` and `overridesAny` in `sonar` eslint config', async () => {
    const configResult = await computeEslintConfig({
      sonar: {
        overrides: {'sonarjs/no-nested-incdec': 1},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('sonar', 'sonarjs/no-nested-incdec')).toBe(1);
    expect(configResult.getRuleEntrySeverity('sonar', 'no-console')).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `sonar` eslint config', async () => {
      const configResult = await computeEslintConfig({sonar: {forceSeverity: 'error'}});

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('sonar'), (ruleName) =>
          ruleName.startsWith('sonarjs/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `sonar` eslint config', async () => {
      const configResult = await computeEslintConfig({sonar: {forceSeverity: 'warn'}});

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('sonar'), (ruleName) =>
          ruleName.startsWith('sonarjs/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('options', () => {
  describe('option: `enableAwsRules`', () => {
    it('enables rules specific to `aws-cdk-lib` if set to `true`', async () => {
      const configResult = await computeEslintConfig({sonar: {enableAwsRules: true}});

      expect(configResult.getRuleEntrySeverity('sonar', 'sonarjs/aws-apigateway-public-api')).toBe(
        2,
      );
    });

    it('does not enable rules specific to `aws-cdk-lib` if set to `false`', async () => {
      const configResult = await computeEslintConfig({sonar: {enableAwsRules: false}});

      expect(configResult.getRuleEntrySeverity('sonar', 'sonarjs/aws-apigateway-public-api')).toBe(
        0,
      );
    });

    it('enables rules specific to `aws-cdk-lib` if `aws-cdk-lib` package is detected as installed', async () => {
      addInstalledPackages({'aws-cdk-lib': '2.0.0'});

      const configResult = await computeEslintConfig('sonar');

      expect(configResult.getRuleEntrySeverity('sonar', 'sonarjs/aws-apigateway-public-api')).toBe(
        2,
      );
    });

    it('does not enable rules specific to `aws-cdk-lib` if `aws-cdk-lib` package is not detected as installed', async () => {
      const configResult = await computeEslintConfig('sonar');

      expect(configResult.getRuleEntrySeverity('sonar', 'sonarjs/aws-apigateway-public-api')).toBe(
        0,
      );
    });
  });

  describe('option: `enableHelmetRules`', () => {
    it('enables rules specific to `helmet` if set to `true`', async () => {
      const configResult = await computeEslintConfig({sonar: {enableHelmetRules: true}});

      expect(configResult.getRuleEntrySeverity('sonar', 'sonarjs/content-security-policy')).toBe(2);
    });

    it('does not enable rules specific to `helmet` if set to `false`', async () => {
      const configResult = await computeEslintConfig({sonar: {enableHelmetRules: false}});

      expect(configResult.getRuleEntrySeverity('sonar', 'sonarjs/content-security-policy')).toBe(0);
    });

    it('enables rules specific to `helmet` if `helmet` package is detected as installed', async () => {
      addInstalledPackages({helmet: '7.0.0'});

      const configResult = await computeEslintConfig('sonar');

      expect(configResult.getRuleEntrySeverity('sonar', 'sonarjs/content-security-policy')).toBe(2);
    });

    it('does not enable rules specific to `helmet` if `helmet` package is not detected as installed', async () => {
      const configResult = await computeEslintConfig('sonar');

      expect(configResult.getRuleEntrySeverity('sonar', 'sonarjs/content-security-policy')).toBe(0);
    });
  });

  describe('option: `testsRules`', () => {
    it('enables rules specific to test or assertion libraries if set to `true`', async () => {
      const configResult = await computeEslintConfig({sonar: {testsRules: true}});

      expect(configResult.getRuleEntrySeverity('sonar', 'sonarjs/assertions-in-tests')).toBe(2);
    });

    it('does not enable rules specific to test or assertion libraries if set to `false`', async () => {
      const configResult = await computeEslintConfig({sonar: {testsRules: false}});

      expect(configResult.getRuleEntrySeverity('sonar', 'sonarjs/assertions-in-tests')).toBe(0);
    });
  });
});

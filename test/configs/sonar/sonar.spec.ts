import {GLOB_HTM, GLOB_HTML, GLOB_HTM_HTML} from '../../../src/constants';

const FIXTURES = {
  usingIncludesOnEmptyArray: 'using-includes-on-empty-array.js',
  usingIncludesOnEmptyArrayInsideHtml: 'using-includes-on-empty-array-inside-html.html',
} as const;

describe('basic tests', () => {
  it('creates `sonar` eslint config and loads `sonar` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('sonar');

    const config = configResult.getConfigByUnPostfix('sonar');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();

    const ignores = config?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.toIncludeAnyMembers([GLOB_HTML, GLOB_HTM, GLOB_HTM_HTML]);

    expect(configResult.getLoadedPlugin('sonar')).toBeDefined();
  });

  it('does not create `sonar` eslint config and does not load `sonar` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({sonar: false});

    expect(configResult.getConfigByUnPostfix('sonar')).toBeUndefined();
    expect(configResult.getLoadedPlugin('sonar')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `sonar` eslint config', async () => {
      await expectConfigState({}, 'sonar', false);
    });

    it('creates `sonar` eslint config if explicitly enabled', async () => {
      await expectConfigState('sonar', 'sonar', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `sonar` eslint config by default', async () => {
      await expectConfigState({}, 'sonar', true, 'default');
    });

    it('creates `sonar` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('sonar', 'sonar', ['sonar', true], 'default');
    });

    it('does not create `sonar` eslint config if explicitly disabled', async () => {
      await expectConfigState({sonar: false}, 'sonar', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `sonar` eslint config', async () => {
      await expectConfigState({}, 'sonar', true, 'misc-enabled');
    });

    it('creates `sonar` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('sonar', 'sonar', ['sonar', true], 'misc-enabled');
    });

    it('does not create `sonar` eslint config if explicitly disabled', async () => {
      await expectConfigState({sonar: false}, 'sonar', false, 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('sonar');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('sonar')).toMatchObject({
      'sonar/arguments-order': 2,
      'sonar/no-clear-text-protocols': 1,
      'sonar/file-header': 0,
    });
  });

  it('`sonar/no-empty-collection` rule works', async () => {
    const results = await testEslintConfig(
      'sonar',
      FIXTURES.usingIncludesOnEmptyArray,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.usingIncludesOnEmptyArray,
      'sonar/no-empty-collection',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Review this usage of "strings" as it can only be empty here."',
    );
  });

  it('`sonar/no-empty-collection` rule fires inside a `<script>` tag when `js-inline` config is enabled', async () => {
    const results = await testEslintConfig(
      {sonar: true, jsInline: true},
      FIXTURES.usingIncludesOnEmptyArrayInsideHtml,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.usingIncludesOnEmptyArrayInsideHtml,
      'sonar/no-empty-collection',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Review this usage of "strings" as it can only be empty here."',
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

    it('disables `sonar` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({sonar: {files: []}});

      expect(configResult.getConfigByUnPostfix('sonar')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `sonar` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({sonar: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('sonar')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
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
        overrides: {'sonar/no-nested-incdec': 1},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('sonar', 'sonar/no-nested-incdec')).toBe(1);
    expect(configResult.getRuleEntrySeverity('sonar', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set sonar settings by default', async () => {
      const configResult = await computeEslintConfig('sonar');
      const config = configResult.getConfigByUnPostfix('sonar');

      expect(config?.settings?.['testFileExtensions']).toBeUndefined();
    });

    it('sets sonar settings when `settings` is provided', async () => {
      const SETTINGS = {testFileExtensions: ['.ts'], predefinedGlobals: ['myGlobal']};

      const configResult = await computeEslintConfig('sonar', {
        un: {plugins: {sonar: {settings: SETTINGS}}},
      });
      const config = configResult.getConfigByUnPostfix('sonar');

      expect(config?.settings).toMatchObject(SETTINGS);
    });
  });

  describe('option: `enableAwsRules`', () => {
    it('enables rules specific to `aws-cdk-lib` if set to `true`', async () => {
      const configResult = await computeEslintConfig({sonar: {enableAwsRules: true}});

      expect(configResult.getRuleEntrySeverity('sonar', 'sonar/aws-apigateway-public-api')).toBe(2);
    });

    it('does not enable rules specific to `aws-cdk-lib` if set to `false`', async () => {
      const configResult = await computeEslintConfig({sonar: {enableAwsRules: false}});

      expect(configResult.getRuleEntrySeverity('sonar', 'sonar/aws-apigateway-public-api')).toBe(0);
    });

    it('enables rules specific to `aws-cdk-lib` if `aws-cdk-lib` package is detected as installed', async () => {
      addInstalledPackages({'aws-cdk-lib': '2.0.0'});

      const configResult = await computeEslintConfig('sonar');

      expect(configResult.getRuleEntrySeverity('sonar', 'sonar/aws-apigateway-public-api')).toBe(2);
    });

    it('does not enable rules specific to `aws-cdk-lib` if `aws-cdk-lib` package is not detected as installed', async () => {
      const configResult = await computeEslintConfig('sonar');

      expect(configResult.getRuleEntrySeverity('sonar', 'sonar/aws-apigateway-public-api')).toBe(0);
    });
  });

  describe('option: `enableHelmetRules`', () => {
    it('enables rules specific to `helmet` if set to `true`', async () => {
      const configResult = await computeEslintConfig({sonar: {enableHelmetRules: true}});

      expect(configResult.getRuleEntrySeverity('sonar', 'sonar/content-security-policy')).toBe(2);
    });

    it('does not enable rules specific to `helmet` if set to `false`', async () => {
      const configResult = await computeEslintConfig({sonar: {enableHelmetRules: false}});

      expect(configResult.getRuleEntrySeverity('sonar', 'sonar/content-security-policy')).toBe(0);
    });

    it('enables rules specific to `helmet` if `helmet` package is detected as installed', async () => {
      addInstalledPackages({helmet: '7.0.0'});

      const configResult = await computeEslintConfig('sonar');

      expect(configResult.getRuleEntrySeverity('sonar', 'sonar/content-security-policy')).toBe(2);
    });

    it('does not enable rules specific to `helmet` if `helmet` package is not detected as installed', async () => {
      const configResult = await computeEslintConfig('sonar');

      expect(configResult.getRuleEntrySeverity('sonar', 'sonar/content-security-policy')).toBe(0);
    });
  });

  describe('option: `testsRules`', () => {
    it('enables rules specific to test or assertion libraries if set to `true`', async () => {
      const configResult = await computeEslintConfig({sonar: {testsRules: true}});

      expect(configResult.getRuleEntrySeverity('sonar', 'sonar/assertions-in-tests')).toBe(2);
    });

    it('does not enable rules specific to test or assertion libraries if set to `false`', async () => {
      const configResult = await computeEslintConfig({sonar: {testsRules: false}});

      expect(configResult.getRuleEntrySeverity('sonar', 'sonar/assertions-in-tests')).toBe(0);
    });
  });
});

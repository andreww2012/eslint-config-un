const FIXTURES = {
  oldStyleCdkDisableComment: 'old-style-cdk-disable-comment.ts',
} as const;

beforeEach(() => {
  addInstalledPackages({'aws-cdk-lib': '2.180.0'});
});

describe('basic tests', () => {
  it('creates `aws-cdk` eslint config and loads `awscdk` plugin', async () => {
    const configResult = await computeEslintConfig('awsCdk');
    const config = configResult.getConfigByUnPostfix('aws-cdk');

    expect(config).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot('["**/*.?([cm])ts?(x)"]');
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('awscdk')).toBeDefined();
  });

  it('does not create `aws-cdk` eslint config and does not load `awscdk` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({awsCdk: false});

    expect(configResult.getConfigByUnPostfix('aws-cdk')).toBeUndefined();
    expect(configResult.getLoadedPlugin('awscdk')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `aws-cdk` eslint config', async () => {
      await expectConfigState({}, 'aws-cdk', false);
    });

    it('creates `aws-cdk` eslint config if explicitly enabled', async () => {
      await expectConfigState('awsCdk', 'aws-cdk', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    describe('aws-cdk-lib is installed', () => {
      it('creates `aws-cdk` eslint config by default', async () => {
        await expectConfigState({}, 'aws-cdk', true, 'default');
      });

      it('creates `aws-cdk` eslint config and prints a warning if explicitly enabled', async () => {
        await expectConfigState('awsCdk', 'aws-cdk', ['awsCdk', true], 'default');
      });

      it('does not create `aws-cdk` eslint config if explicitly disabled', async () => {
        await expectConfigState({awsCdk: false}, 'aws-cdk', false, 'default');
      });
    });

    describe('aws-cdk-lib is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `aws-cdk` eslint config', async () => {
        await expectConfigState({}, 'aws-cdk', false, 'default');
      });

      it('creates `aws-cdk` eslint config if explicitly enabled', async () => {
        await expectConfigState('awsCdk', 'aws-cdk', true, 'default');
      });

      it('does not create `aws-cdk` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({awsCdk: false}, 'aws-cdk', ['awsCdk', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `awscdk` eslint config when `aws-cdk-lib` is installed', async () => {
      await expectConfigState({}, 'aws-cdk', true, 'misc-enabled');
    });

    it('creates `awscdk` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('awsCdk', 'aws-cdk', ['awsCdk', true], 'misc-enabled');
    });

    it('does not create `awscdk` eslint config if explicitly disabled', async () => {
      await expectConfigState({awsCdk: false}, 'aws-cdk', false, 'misc-enabled');
    });

    describe('aws-cdk-lib is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `awscdk` eslint config (not in misc group)', async () => {
        await expectConfigState({}, 'aws-cdk', false, 'misc-enabled');
      });

      it('creates `awscdk` eslint config if explicitly enabled', async () => {
        await expectConfigState({awsCdk: true}, 'aws-cdk', true, 'misc-enabled');
      });
    });
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig('awsCdk');

    expect(configResult.getRuleSeverities('aws-cdk')).toMatchObject({
      'awscdk/construct-constructor-property': 2,
      'awscdk/require-props-default-doc': 0,
    });
  });

  it('`awscdk/migrate-disable-comments` rule fires on old-style cdk disable comments', async () => {
    const results = await testEslintConfig('awsCdk', FIXTURES.oldStyleCdkDisableComment, {
      searchFixturesRelativeToPath: import.meta.dirname,
      internalOptions: {skipTypeInfoSplit: false},
    });

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.oldStyleCdkDisableComment,
      'awscdk/migrate-disable-comments',
    );

    expect(error?.message).toMatchInlineSnapshot(
      "\"Replace 'cdk/' with 'awscdk/' in ESLint disable comments.\"",
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `awscdk` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({awsCdk: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('aws-cdk')?.files).toStrictEqual(FILES);
    });

    it('disables `awscdk` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({awsCdk: {files: []}});

      expect(configResult.getConfigByUnPostfix('aws-cdk')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `awscdk` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({awsCdk: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('aws-cdk')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `awscdk` eslint config', async () => {
    const configResult = await computeEslintConfig({
      awsCdk: {
        overrides: {'awscdk/migrate-disable-comments': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleSeverities('aws-cdk')).toMatchObject({
      'awscdk/migrate-disable-comments': 0,
      'no-console': 0,
    });
  });
});

const FIXTURES = {
  assertEqualCall: 'assert-equal-call/test.spec.js',
} as const;

beforeEach(() => {
  addInstalledPackages({qunit: '2.20.0'});
});

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('qunit');

  it('loads `qunit` plugin if used', () => {
    expect(configResult.getLoadedPlugin('qunit')).toBeDefined();
  });

  it('creates `qunit` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('qunit')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `qunit` eslint config', async () => {
      await expectConfigState({}, 'qunit', false);
    });

    it('creates `qunit` eslint config if explicitly enabled', async () => {
      await expectConfigState('qunit', 'qunit', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `qunit` eslint config when `qunit` package is installed', async () => {
      await expectConfigState({}, 'qunit', true, 'default');
    });

    it('creates `qunit` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState('qunit', 'qunit', ['qunit', true], 'default');
    });

    it('does not create `qunit` eslint config if explicitly disabled', async () => {
      await expectConfigState({qunit: false}, 'qunit', false, 'default');
    });

    describe('`qunit` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `qunit` eslint config', async () => {
        await expectConfigState({}, 'qunit', false, 'default');
      });

      it('creates `qunit` eslint config if explicitly enabled', async () => {
        await expectConfigState('qunit', 'qunit', true, 'default');
      });

      it('does not create `qunit` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({qunit: false}, 'qunit', ['qunit', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `qunit` eslint config when `qunit` package is installed', async () => {
      await expectConfigState({}, 'qunit', true, 'misc-enabled');
    });

    it('creates `qunit` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState({qunit: true}, 'qunit', ['qunit', true], 'misc-enabled');
    });

    it('does not create `qunit` eslint config if explicitly disabled', async () => {
      await expectConfigState({qunit: false}, 'qunit', false, 'misc-enabled');
    });
  });

  it('has default `files` in `qunit` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('qunit')?.files).toMatchInlineSnapshot(
      '["**/*[.-_]spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__test?(s)__/**/*.?([cm])[jt]s?(x)"]',
    );
  });

  it('has default `ignores` in `qunit` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('qunit')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('qunit');

  it('enables `qunit/assert-args` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('qunit', 'qunit/assert-args')).toBe(2);
  });

  it('disables `qunit/no-arrow-tests` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('qunit', 'qunit/no-arrow-tests')).toBe(0);
  });

  it('`qunit/no-assert-equal` rule fires on a test with `assert.equal()`', async () => {
    const results = await testEslintConfig('qunit', FIXTURES.assertEqualCall, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.assertEqualCall,
      'qunit/no-assert-equal',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Unexpected assert.equal. Use assert.strictEqual, assert.deepEqual, or assert.propEqual."',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `qunit` eslint config', async () => {
      const FILES = ['tests/**/*.spec.ts'];

      const configResult = await computeEslintConfig({qunit: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('qunit')?.files).toStrictEqual(FILES);
    });

    it('disables `qunit` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({qunit: {files: []}});

      expect(configResult.getConfigByUnPostfix('qunit')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `qunit` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({qunit: {ignores: IGNORES}});
      const ignores = configResult.getConfigByUnPostfix('qunit')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `qunit` eslint config', async () => {
    const configResult = await computeEslintConfig({
      qunit: {overrides: {'qunit/assert-args': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('qunit', 'qunit/assert-args')).toBe(0);
    expect(configResult.getRuleEntrySeverity('qunit', 'no-console')).toBe(0);
  });
});

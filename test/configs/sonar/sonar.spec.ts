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
});

describe('un options', () => {
  describe('`overrides`', async () => {
    const configResult = await computeEslintConfig({
      sonar: {overrides: {'sonarjs/no-nested-incdec': 1}},
    });

    it('respect `overrides`', () => {
      expect(
        JSON.stringify(configResult.getRuleEntry('sonar', 'sonarjs/no-nested-incdec')),
      ).toMatchInlineSnapshot(`"1"`);
    });
  });

  describe('`overridesAny`', () => {
    it('respect `overridesAny`', async () => {
      const configResult = await computeEslintConfig({
        sonar: {overridesAny: {'no-console': 0}},
      });

      expect(
        JSON.stringify(configResult.getRuleEntry('sonar', 'no-console')),
      ).toMatchInlineSnapshot(`"0"`);
    });

    it('respects both `overrides` and `overridesAny`', async () => {
      const configResult = await computeEslintConfig({
        sonar: {
          overrides: {'sonarjs/no-nested-incdec': 1},
          overridesAny: {'no-console': 0},
        },
      });

      expect(
        JSON.stringify(configResult.getRuleEntry('sonar', 'sonarjs/no-nested-incdec')),
      ).toMatchInlineSnapshot(`"1"`);

      expect(
        JSON.stringify(configResult.getRuleEntry('sonar', 'no-console')),
      ).toMatchInlineSnapshot(`"0"`);
    });

    it('puts `overridesAny` after `overrides`', async () => {
      const configResult = await computeEslintConfig({
        sonar: {
          overrides: {'sonarjs/no-nested-incdec': 1},
          overridesAny: {'sonarjs/no-nested-incdec': 2},
        },
      });

      expect(
        JSON.stringify(configResult.getRuleEntry('sonar', 'sonarjs/no-nested-incdec')),
      ).toMatchInlineSnapshot(`"2"`);
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('sonar');

  it('enables `sonarjs/arguments-order` rule by default', () => {
    const ruleEntry = configResult.getRuleEntry('sonar', 'sonarjs/arguments-order');

    expect(JSON.stringify(ruleEntry)).toMatchInlineSnapshot(`"[2]"`);
  });

  it('does not enable `sonarjs/file-header` rule by default', () => {
    const ruleEntry = configResult.getRuleEntry('sonar', 'sonarjs/file-header');

    expect(JSON.stringify(ruleEntry)).toMatchInlineSnapshot(`"[0]"`);
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

describe('options', () => {
  describe('`enableAwsRules`', () => {
    it.todo('enables rules specific to `aws-cdk-lib` if set to `true`');

    it.todo('does not enable rules specific to `aws-cdk-lib` if set to `false`');

    it.todo(
      'enables rules specific to `aws-cdk-lib` if `aws-cdk-lib` package is detected as installed',
    );

    it.todo(
      'does not enable rules specific to `aws-cdk-lib` if `aws-cdk-lib` package is not detected as installed',
    );
  });

  describe('`enableHelmetRules`', () => {
    it.todo('enables rules specific to `helmet` if set to `true`');

    it.todo('does not enable rules specific to `helmet` if set to `false`');

    it.todo('enables rules specific to `helmet` if `helmet` package is detected as installed');

    it.todo(
      'does not enable rules specific to `helmet` if `helmet` package is not detected as installed',
    );
  });

  describe('`testsRules`', () => {
    it.todo('enables rules specific to test or assertion libraries if set to `true`');

    it.todo('does not enable rules specific to test or assertion libraries if set to `false`');
  });
});

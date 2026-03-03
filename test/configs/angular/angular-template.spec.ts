const FIXTURES = {
  twoWayBindingWrong: 'angular-2way-binding-wrong.html',
  twoWayBindingCorrect: 'angular-2way-binding-correct.html',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('angular');

  it('creates `angular/template` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('angular/template')).toBeDefined();
  });

  it('does not create `angular/template` eslint config when `configTemplate` is `false`', async () => {
    const noTemplateConfigResult = await computeEslintConfig({
      angular: {configTemplate: false},
    });

    expect(noTemplateConfigResult.getConfigByUnPostfix('angular/template')).toBeUndefined();
  });

  it('creates `angular/template` eslint config when `configTemplate` is `true` explicitly', async () => {
    const explicitConfigResult = await computeEslintConfig({
      angular: {configTemplate: true},
    });

    expect(explicitConfigResult.getConfigByUnPostfix('angular/template')).toBeDefined();
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('angular');

  it('enables `@angular-eslint/template/banana-in-box` rule by default', () => {
    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('angular/template', '@angular-eslint/template/banana-in-box'),
      ),
    ).toBe(2);
  });

  it('disables `@angular-eslint/template/no-call-expression` rule by default', () => {
    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry(
          'angular/template',
          '@angular-eslint/template/no-call-expression',
        ),
      ),
    ).toBe(0);
  });

  it('triggers `@angular-eslint/template/banana-in-box` on wrong two-way binding syntax', async () => {
    const result = await testEslintConfig(
      'angular',
      FIXTURES.twoWayBindingWrong,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      result,
      FIXTURES.twoWayBindingWrong,
      '@angular-eslint/template/banana-in-box',
    );

    expect(error?.message).toMatchInlineSnapshot(`"Invalid binding syntax. Use [(expr)] instead"`);
  });

  it('does not trigger `@angular-eslint/template/banana-in-box` on correct two-way binding syntax', async () => {
    const result = await testEslintConfig(
      'angular',
      FIXTURES.twoWayBindingCorrect,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      result,
      FIXTURES.twoWayBindingCorrect,
      '@angular-eslint/template/banana-in-box',
    );

    expect(error).toBeUndefined();
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('has default `files` in `angular/template` eslint config', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(configResult.getConfigByUnPostfix('angular/template')?.files).toMatchInlineSnapshot(
        `["**/*.html"]`,
      );
    });

    it('uses user-provided `files` in `angular/template` eslint config', async () => {
      const FILES = ['src/**/*.html'];
      const configResult = await computeEslintConfig({
        angular: {configTemplate: {files: FILES}},
      });

      expect(configResult.getConfigByUnPostfix('angular/template')?.files).toStrictEqual(FILES);
    });

    it('disables `angular/template` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        angular: {configTemplate: {files: []}},
      });

      expect(configResult.getConfigByUnPostfix('angular/template')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `angular/template` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        angular: {configTemplate: {ignores: IGNORES}},
      });

      const ignores = configResult.getConfigByUnPostfix('angular/template')?.ignores;

      expect(ignores).to.include.members(IGNORES);

      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `angular/template` eslint config', async () => {
    const configResult = await computeEslintConfig({
      angular: {
        configTemplate: {
          overrides: {'@angular-eslint/template/banana-in-box': 0},
          overridesAny: {'no-console': 0},
        },
      },
    });

    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('angular/template', '@angular-eslint/template/banana-in-box'),
      ),
    ).toBe(0);

    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('angular/template', 'no-console'),
      ),
    ).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `angular/template` eslint config', async () => {
      const configResult = await computeEslintConfig({
        angular: {configTemplate: {forceSeverity: 'error'}},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('angular/template'), (ruleName) =>
          ruleName.startsWith('@angular-eslint/template/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `angular/template` eslint config', async () => {
      const configResult = await computeEslintConfig({
        angular: {configTemplate: {forceSeverity: 'warn'}},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('angular/template'), (ruleName) =>
          ruleName.startsWith('@angular-eslint/template/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('options', () => {
  describe('option: `a11yRules`', () => {
    it('enables a11y rules at error severity when `a11yRules` is `true` (default)', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('angular/template', '@angular-eslint/template/alt-text'),
        ),
      ).toBe(2);
    });

    it('enables a11y rules at warning severity when `a11yRules` is `"warn"`', async () => {
      const configResult = await computeEslintConfig({
        angular: {configTemplate: {a11yRules: 'warn'}},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('angular/template', '@angular-eslint/template/alt-text'),
        ),
      ).toBe(1);
    });

    it('disables a11y rules when `a11yRules` is `false`', async () => {
      const configResult = await computeEslintConfig({
        angular: {configTemplate: {a11yRules: false}},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('angular/template', '@angular-eslint/template/alt-text'),
        ),
      ).toBe(0);
    });
  });

  describe('option: `preferControlFlow`', () => {
    it('enables `prefer-control-flow` rule when `preferControlFlow` is `true`', async () => {
      const configResult = await computeEslintConfig({
        angular: {configTemplate: {preferControlFlow: true}},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry(
            'angular/template',
            '@angular-eslint/template/prefer-control-flow',
          ),
        ),
      ).toBe(2);
    });

    it('disables `prefer-control-flow` rule when `preferControlFlow` is `false`', async () => {
      const configResult = await computeEslintConfig({
        angular: {configTemplate: {preferControlFlow: false}},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry(
            'angular/template',
            '@angular-eslint/template/prefer-control-flow',
          ),
        ),
      ).toBe(0);
    });
  });

  describe('option: `preferNgSrc`', () => {
    it('disables `prefer-ngsrc` rule by default', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('angular/template', '@angular-eslint/template/prefer-ngsrc'),
        ),
      ).toBe(0);
    });

    it('enables `prefer-ngsrc` rule when `preferNgSrc` is `true`', async () => {
      const configResult = await computeEslintConfig({
        angular: {configTemplate: {preferNgSrc: true}},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('angular/template', '@angular-eslint/template/prefer-ngsrc'),
        ),
      ).toBe(2);
    });
  });

  describe('option: `requireLoopIndexes`', () => {
    it('disables `use-track-by-function` rule by default', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry(
            'angular/template',
            '@angular-eslint/template/use-track-by-function',
          ),
        ),
      ).toBe(0);
    });

    it('enables `use-track-by-function` rule when `requireLoopIndexes` is `true`', async () => {
      const configResult = await computeEslintConfig({
        angular: {configTemplate: {requireLoopIndexes: true}},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry(
            'angular/template',
            '@angular-eslint/template/use-track-by-function',
          ),
        ),
      ).toBe(2);
    });
  });
});

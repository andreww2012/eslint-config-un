const FIXTURES = {
  normalImportBlankLineNormalImport: 'normal-import-blank-line-normal-import.js',
  sideEffectImportBlankLineNormalImport: 'side-effect-import-blank-line-normal-import.js',
  normalImportBlankLineSideEffectImport: 'normal-import-blank-line-side-effect-import.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('stylistic');

  it('loads `@stylistic` plugin if used', () => {
    expect(configResult.getLoadedPlugin('@stylistic')).toBeDefined();
  });

  it('creates `stylistic` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('stylistic')).toBeDefined();
  });

  it('creates `stylistic/spaced-comment` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('stylistic/spaced-comment')).toBeDefined();
  });

  it('does not create `stylistic` eslint configs when disabled', async () => {
    const disabledResult = await computeEslintConfig({stylistic: false});

    expect(disabledResult.getConfigByUnPostfix('stylistic')).toBeUndefined();
    expect(disabledResult.getConfigByUnPostfix('stylistic/spaced-comment')).toBeUndefined();
  });

  it('has no explicit `files` restriction in `stylistic` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('stylistic')?.files).toBeUndefined();
  });

  it('has default `ignores` in `stylistic` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('stylistic')?.ignores?.length).toBeGreaterThan(0);
  });

  it('has no explicit `files` restriction in `stylistic/spaced-comment` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('stylistic/spaced-comment')?.files).toBeUndefined();
  });

  it('`stylistic/spaced-comment` eslint config ignores YAML and HTML files', () => {
    const ignores = configResult.getConfigByUnPostfix('stylistic/spaced-comment')?.ignores;

    expect(ignores).to.include.members(['**/*.y?(a)ml', '**/*.html']);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('stylistic');

  it('enables `@stylistic/padding-line-between-statements` rule by default', () => {
    expect(
      configResult.getRuleEntry('stylistic', '@stylistic/padding-line-between-statements'),
    ).toMatchInlineSnapshot(
      `[2, {"blankLine": "never", "next": "import", "prev": "import"}, {"blankLine": "any", "next": {"selector": "ImportDeclaration[specifiers.length=0]"}, "prev": "import"}, {"blankLine": "any", "next": "import", "prev": {"selector": "ImportDeclaration[specifiers.length=0]"}}]`,
    );
  });

  it('disables `@stylistic/indent` rule by default', () => {
    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('stylistic', '@stylistic/indent'),
      ),
    ).toBe(0);
  });

  it('enables `@stylistic/spaced-comment` in `stylistic/spaced-comment` eslint config', () => {
    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('stylistic/spaced-comment', '@stylistic/spaced-comment'),
      ),
    ).toBe(2);
  });

  it('disables `@stylistic/spaced-comment` in main `stylistic` eslint config', () => {
    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('stylistic', '@stylistic/spaced-comment'),
      ),
    ).toBe(0);
  });

  describe('`@stylistic/padding-line-between-statements` rule behavior', () => {
    const RULE_ID = '@stylistic/padding-line-between-statements';

    it('reports an error for a blank line between two normal imports', async () => {
      const results = await testEslintConfig(
        'stylistic',
        FIXTURES.normalImportBlankLineNormalImport,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.normalImportBlankLineNormalImport,
        RULE_ID,
      );

      expect(error?.message).toMatchInlineSnapshot(
        `"Unexpected blank line before this statement."`,
      );
    });

    it('does not report an error for a blank line between a side-effect import and a normal import', async () => {
      const results = await testEslintConfig(
        'stylistic',
        FIXTURES.sideEffectImportBlankLineNormalImport,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.sideEffectImportBlankLineNormalImport,
        RULE_ID,
      );

      expect(error).toBeUndefined();
    });

    it('does not report an error for a blank line between a normal import and a side-effect import', async () => {
      const results = await testEslintConfig(
        'stylistic',
        FIXTURES.normalImportBlankLineSideEffectImport,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.normalImportBlankLineSideEffectImport,
        RULE_ID,
      );

      expect(error).toBeUndefined();
    });
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `stylistic` and `stylistic/spaced-comment` eslint configs', async () => {
      const FILES = ['src/**/*.js'];
      const configResult = await computeEslintConfig({
        stylistic: {files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('stylistic')?.files).toStrictEqual(FILES);
      expect(configResult.getConfigByUnPostfix('stylistic/spaced-comment')?.files).toStrictEqual(
        FILES,
      );
    });

    it('disables `stylistic` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        stylistic: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('stylistic')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `stylistic` and `stylistic/spaced-comment` eslint configs and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        stylistic: {ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix('stylistic')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);

      const ignoresSpacedComment = configResult.getConfigByUnPostfix(
        'stylistic/spaced-comment',
      )?.ignores;

      expect(ignoresSpacedComment).to.include.members(IGNORES);
      expect(ignoresSpacedComment?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  describe('option: `overrides`', () => {
    it('respects `overrides` in `stylistic` eslint config', async () => {
      const configResult = await computeEslintConfig({
        stylistic: {overrides: {'@stylistic/quotes': 0}},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('stylistic', '@stylistic/quotes'),
        ),
      ).toBe(0);
    });
  });

  describe('option: `overridesAny`', () => {
    it('respects `overridesAny` in `stylistic` eslint config', async () => {
      const configResult = await computeEslintConfig({
        stylistic: {overridesAny: {'no-console': 0}},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(configResult.getRuleEntry('stylistic', 'no-console')),
      ).toBe(0);
    });

    it('respects both `overrides` and `overridesAny`', async () => {
      const configResult = await computeEslintConfig({
        stylistic: {
          overrides: {'@stylistic/quotes': 0},
          overridesAny: {'no-console': 0},
        },
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('stylistic', '@stylistic/quotes'),
        ),
      ).toBe(0);

      expect(
        getRuleSeverityFromEslintRuleEntry(configResult.getRuleEntry('stylistic', 'no-console')),
      ).toBe(0);
    });

    it('puts `overridesAny` after `overrides`', async () => {
      const configResult = await computeEslintConfig({
        stylistic: {
          overrides: {'@stylistic/quotes': 1},
          overridesAny: {'@stylistic/quotes': 0},
        },
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('stylistic', '@stylistic/quotes'),
        ),
      ).toBe(0);
    });
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `stylistic` eslint config', async () => {
      const configResult = await computeEslintConfig({
        stylistic: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('stylistic'), (ruleName) =>
          ruleName.startsWith('@stylistic/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `stylistic` eslint config', async () => {
      const configResult = await computeEslintConfig({
        stylistic: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('stylistic'), (ruleName) =>
          ruleName.startsWith('@stylistic/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('options', () => {
  describe('option: `customizeOptions`', () => {
    const RULE_ID = '@stylistic/quotes';

    it('`quotes` rule entry uses our custom options with `ignoreStringLiterals: true` by default (no `customizeOptions`)', async () => {
      const configResult = await computeEslintConfig('stylistic');

      expect(configResult.getRuleEntry('stylistic', RULE_ID)).toMatchInlineSnapshot(
        `[2, "single", {"allowTemplateLiterals": "avoidEscape", "avoidEscape": true, "ignoreStringLiterals": true}]`,
      );
    });

    it('`quotes` rule entry uses plugin-provided options when `customizeOptions` is set', async () => {
      const configResult = await computeEslintConfig({stylistic: {customizeOptions: {}}});

      expect(configResult.getRuleEntry('stylistic', RULE_ID)).toMatchInlineSnapshot(
        `["error", "single", {"allowTemplateLiterals": "always", "avoidEscape": false}]`,
      );
    });
  });
});

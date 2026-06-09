import {GLOB_HTM_HTML, GLOB_YML_YAML} from '../../../src/constants';

const FIXTURES = {
  normalImportBlankLineNormalImport: 'normal-import-blank-line-normal-import.js',
  sideEffectImportBlankLineNormalImport: 'side-effect-import-blank-line-normal-import.js',
  normalImportBlankLineSideEffectImport: 'normal-import-blank-line-side-effect-import.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('stylistic');

  it('loads `stylistic` plugin if used', () => {
    expect(configResult.getLoadedPlugin('stylistic')).toBeDefined();
  });

  it('creates `stylistic` and `stylistic/spaced-comment` eslint configs', () => {
    expect(configResult.getConfigByUnPostfix('stylistic')).toBeDefined();
    expect(configResult.getConfigByUnPostfix('stylistic/spaced-comment')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `stylistic` eslint configs', async () => {
      await expectConfigState({}, ['stylistic', 'stylistic'], false);
    });

    it('creates `stylistic` eslint configs if explicitly enabled', async () => {
      await expectConfigState('stylistic', ['stylistic', 'stylistic'], true);
    });

    it('does not create `stylistic` eslint configs and prints a warning if explicitly disabled', async () => {
      await expectConfigState({stylistic: false}, ['stylistic', 'stylistic'], ['stylistic', false]);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `stylistic` eslint configs', async () => {
      await expectConfigState({}, ['stylistic', 'stylistic'], true, 'default');
    });

    it('creates `stylistic` eslint configs and prints a warning if explicitly enabled', async () => {
      await expectConfigState(
        'stylistic',
        ['stylistic', 'stylistic'],
        ['stylistic', true],
        'default',
      );
    });

    it('does not create `stylistic` eslint configs if explicitly disabled', async () => {
      await expectConfigState({stylistic: false}, ['stylistic', 'stylistic'], false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `stylistic` eslint configs', async () => {
      await expectConfigState({}, ['stylistic', 'stylistic'], true, 'misc-enabled');
    });

    it('creates `stylistic` eslint configs and prints a warning if explicitly enabled', async () => {
      await expectConfigState(
        {stylistic: true},
        ['stylistic', 'stylistic'],
        ['stylistic', true],
        'misc-enabled',
      );
    });

    it('does not create `stylistic` eslint configs if explicitly disabled', async () => {
      await expectConfigState(
        {stylistic: false},
        ['stylistic', 'stylistic'],
        false,
        'misc-enabled',
      );
    });
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
    const expectedIgnores = [GLOB_YML_YAML, GLOB_HTM_HTML];

    const ignores = configResult.getConfigByUnPostfix('stylistic/spaced-comment')?.ignores;

    expect(ignores).toIncludeAllMembers(expectedIgnores);
    expect(ignores?.length).toBeGreaterThan(expectedIgnores.length);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('stylistic');

  it('enables `stylistic/padding-line-between-statements` rule by default', () => {
    expect(
      configResult.getRuleEntry('stylistic', 'stylistic/padding-line-between-statements'),
    ).toMatchInlineSnapshot(
      '[2, {"blankLine": "never", "next": "import", "prev": "import"}, {"blankLine": "any", "next": {"selector": "ImportDeclaration[specifiers.length=0]"}, "prev": "import"}, {"blankLine": "any", "next": "import", "prev": {"selector": "ImportDeclaration[specifiers.length=0]"}}]',
    );
  });

  it('disables `stylistic/indent` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('stylistic', 'stylistic/indent')).toBe(0);
  });

  it('enables `stylistic/spaced-comment` in `stylistic/spaced-comment` eslint config', () => {
    expect(
      configResult.getRuleEntrySeverity('stylistic/spaced-comment', 'stylistic/spaced-comment'),
    ).toBe(2);
  });

  it('disables `stylistic/spaced-comment` in main `stylistic` eslint config', () => {
    expect(configResult.getRuleEntrySeverity('stylistic', 'stylistic/spaced-comment')).toBe(0);
  });

  describe('`stylistic/padding-line-between-statements` rule behavior', () => {
    it('reports an error for a blank line between two normal imports', async () => {
      const results = await testEslintConfig(
        'stylistic',
        FIXTURES.normalImportBlankLineNormalImport,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.normalImportBlankLineNormalImport,
        'stylistic/padding-line-between-statements',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"Unexpected blank line before this statement."',
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
        'stylistic/padding-line-between-statements',
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
        'stylistic/padding-line-between-statements',
      );

      expect(error).toBeUndefined();
    });
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `stylistic` and `stylistic/spaced-comment` eslint configs', async () => {
      const FILES = ['src/**/*.js'];

      const configResult = await computeEslintConfig({stylistic: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('stylistic')?.files).toStrictEqual(FILES);
      expect(configResult.getConfigByUnPostfix('stylistic/spaced-comment')?.files).toStrictEqual(
        FILES,
      );
    });

    it('disables `stylistic` and `stylistic/spaced-comment` eslint configs when set to empty array', async () => {
      const configResult = await computeEslintConfig({stylistic: {files: []}});

      expect(configResult.getConfigByUnPostfix('stylistic')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('stylistic/spaced-comment')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `stylistic` and `stylistic/spaced-comment` eslint configs and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({stylistic: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('stylistic')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);

      const ignoresSpacedComment = configResult.getConfigByUnPostfix(
        'stylistic/spaced-comment',
      )?.ignores;

      expect(ignoresSpacedComment).toIncludeAllMembers(IGNORES);
      expect(ignoresSpacedComment?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `stylistic` eslint config', async () => {
    const configResult = await computeEslintConfig({
      stylistic: {
        overrides: {'stylistic/quotes': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('stylistic', 'stylistic/quotes')).toBe(0);
    expect(configResult.getRuleEntrySeverity('stylistic', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `customizeOptions`', () => {
    it('`stylistic/quotes` rule entry uses our custom options with `ignoreStringLiterals: true` by default (no `customizeOptions`)', async () => {
      const configResult = await computeEslintConfig('stylistic');

      expect(configResult.getRuleEntry('stylistic', 'stylistic/quotes')).toMatchInlineSnapshot(
        '[2, "single", {"allowTemplateLiterals": "avoidEscape", "avoidEscape": true, "ignoreStringLiterals": true}]',
      );
    });

    it('`stylistic/quotes` rule entry uses plugin-provided options when `customizeOptions` is set', async () => {
      const configResult = await computeEslintConfig({stylistic: {customizeOptions: {}}});

      expect(configResult.getRuleEntry('stylistic', 'stylistic/quotes')).toMatchInlineSnapshot(
        '["error", "single", {"allowTemplateLiterals": "always", "avoidEscape": false}]',
      );
    });
  });
});

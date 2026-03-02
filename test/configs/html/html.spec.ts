describe('basic tests', async () => {
  const configResult = await computeEslintConfig('html');

  it('loads `@html-eslint` plugin if used', () => {
    expect(configResult.getLoadedPlugin('@html-eslint')).toBeDefined();
  });

  it('creates `html` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('html')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `html` eslint config', async () => {
      const configResult = await computeEslintConfig({});

      expect(configResult.getConfigByUnPostfix('html')).toBeUndefined();
    });

    it('creates `html` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig({html: true});

      expect(configResult.getConfigByUnPostfix('html')).toBeDefined();
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `html` eslint config by default (when angular is not installed)', async () => {
      const configResult = await computeEslintConfig({}, {reset: true});

      expect(configResult.getConfigByUnPostfix('html')).toBeDefined();
    });

    it('creates `html` eslint config and prints a warning if explicitly enabled', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      await computeEslintConfig({html: true}, {reset: true});

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          `[warn] [eslint-config-un] There is no need to enable \`html\` config because this is the default`,
        ),
      ).toBe(true);
    });

    it('does not create `html` eslint config if explicitly disabled', async () => {
      const configResult = await computeEslintConfig({html: false}, {reset: true});

      expect(configResult.getConfigByUnPostfix('html')).toBeUndefined();
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `html` eslint config', async () => {
      const configResult = await computeEslintConfig(
        {},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(configResult.getConfigByUnPostfix('html')).toBeDefined();
    });
  });

  it('has default `files` in `html` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('html')?.files).toMatchInlineSnapshot(
      `["**/*.htm?(l)"]`,
    );
  });

  it('has default `ignores` in `html` eslint config', () => {
    const ignores = configResult.getConfigByUnPostfix('html')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).to.not.include.members(['**/*.htm?(l)']);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('html');

  it('enables `@html-eslint/no-duplicate-attrs` rule by default', () => {
    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('html', '@html-eslint/no-duplicate-attrs'),
      ),
    ).toBe(2);
  });

  it('disables `@html-eslint/no-inline-styles` rule by default', () => {
    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('html', '@html-eslint/no-inline-styles'),
      ),
    ).toBe(0);
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `html` eslint config', async () => {
      const FILES = ['src/**/*.html'];
      const configResult = await computeEslintConfig({
        html: {files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('html')?.files).toStrictEqual(FILES);
    });

    it('disables `html` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        html: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('html')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `html` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        html: {ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix('html')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  describe('option: `overrides`', () => {
    it('respects `overrides` in `html` eslint config', async () => {
      const configResult = await computeEslintConfig({
        html: {overrides: {'@html-eslint/no-duplicate-attrs': 0}},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('html', '@html-eslint/no-duplicate-attrs'),
        ),
      ).toBe(0);
    });
  });

  describe('option: `overridesAny`', () => {
    it('respects `overridesAny` in `html` eslint config', async () => {
      const configResult = await computeEslintConfig({
        html: {overridesAny: {'no-console': 0}},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(configResult.getRuleEntry('html', 'no-console')),
      ).toBe(0);
    });

    it('respects both `overrides` and `overridesAny`', async () => {
      const configResult = await computeEslintConfig({
        html: {
          overrides: {'@html-eslint/no-duplicate-attrs': 0},
          overridesAny: {'no-console': 0},
        },
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('html', '@html-eslint/no-duplicate-attrs'),
        ),
      ).toBe(0);

      expect(
        getRuleSeverityFromEslintRuleEntry(configResult.getRuleEntry('html', 'no-console')),
      ).toBe(0);
    });

    it('puts `overridesAny` after `overrides`', async () => {
      const configResult = await computeEslintConfig({
        html: {
          overrides: {'@html-eslint/no-duplicate-attrs': 1},
          overridesAny: {'@html-eslint/no-duplicate-attrs': 2},
        },
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('html', '@html-eslint/no-duplicate-attrs'),
        ),
      ).toBe(2);
    });
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `html` eslint config', async () => {
      const configResult = await computeEslintConfig({
        html: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('html'), (ruleName) =>
          ruleName.startsWith('@html-eslint/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `html` eslint config', async () => {
      const configResult = await computeEslintConfig({
        html: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('html'), (ruleName) =>
          ruleName.startsWith('@html-eslint/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set html settings when not provided', async () => {
      const configResult = await computeEslintConfig('html');
      const config = configResult.getConfigByUnPostfix('html');

      expect(config?.settings?.['html']).toBeUndefined();
    });

    it('sets html settings when provided', async () => {
      const configResult = await computeEslintConfig({
        html: {settings: {templateLiterals: {tags: ['html'], comments: ['html']}}},
      });
      const config = configResult.getConfigByUnPostfix('html');

      expect(config?.settings?.['html']).toStrictEqual({
        templateLiterals: {tags: ['html'], comments: ['html']},
      });
    });
  });

  describe('option: `parserOptions`', () => {
    it('does not set parserOptions when not provided', async () => {
      const configResult = await computeEslintConfig('html');
      const config = configResult.getConfigByUnPostfix('html');

      expect(config?.languageOptions?.['parserOptions']).toBeUndefined();
    });

    it('sets parserOptions when provided', async () => {
      const PARSER_OPTIONS = {frontmatter: true};

      const configResult = await computeEslintConfig({
        html: {parserOptions: PARSER_OPTIONS},
      });
      const config = configResult.getConfigByUnPostfix('html');

      expect(config?.languageOptions?.['parserOptions']).toStrictEqual(PARSER_OPTIONS);
    });
  });

  describe('option: `disallowedHtmlTags`', () => {
    it('restricts default invalid html tags in `no-restricted-tags` by default', async () => {
      const configResult = await computeEslintConfig('html');
      const ruleEntry = configResult.getRuleEntry('html', '@html-eslint/no-restricted-tags');

      expect(ruleEntry).toMatchInlineSnapshot(
        `[2, {"tagPatterns": ["^acronym$", "^big$", "^center$", "^content$", "^dir$", "^font$", "^frame$", "^frameset$", "^image$", "^marquee$", "^menuitem$", "^nobr$", "^noembed$", "^noframes$", "^param$", "^plaintext$", "^rb$", "^rtc$", "^shadow$", "^strike$", "^tt$", "^xmp$", "^applet$", "^bgsound$", "^blink$", "^isindex$", "^keygen$", "^multicol$", "^nextid$", "^spacer$", "^basefont$", "^listing$", "^command$", "^element$"]}]`,
      );
    });

    it('adds custom disallowed tags to `no-restricted-tags` rule', async () => {
      const configResult = await computeEslintConfig({
        html: {disallowedHtmlTags: {iframe: true}},
      });
      const ruleEntry = configResult.getRuleEntry('html', '@html-eslint/no-restricted-tags');

      expect(ruleEntry).toMatchInlineSnapshot(
        `[2, {"tagPatterns": ["^acronym$", "^big$", "^center$", "^content$", "^dir$", "^font$", "^frame$", "^frameset$", "^image$", "^marquee$", "^menuitem$", "^nobr$", "^noembed$", "^noframes$", "^param$", "^plaintext$", "^rb$", "^rtc$", "^shadow$", "^strike$", "^tt$", "^xmp$", "^applet$", "^bgsound$", "^blink$", "^isindex$", "^keygen$", "^multicol$", "^nextid$", "^spacer$", "^basefont$", "^listing$", "^command$", "^element$", "^iframe$"]}]`,
      );
    });

    it('allows a previously-restricted invalid tag when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        html: {disallowedHtmlTags: {font: false}},
      });
      const ruleEntry = configResult.getRuleEntry('html', '@html-eslint/no-restricted-tags');

      expect(ruleEntry).toMatchInlineSnapshot(
        `[2, {"tagPatterns": ["^acronym$", "^big$", "^center$", "^content$", "^dir$", "^frame$", "^frameset$", "^image$", "^marquee$", "^menuitem$", "^nobr$", "^noembed$", "^noframes$", "^param$", "^plaintext$", "^rb$", "^rtc$", "^shadow$", "^strike$", "^tt$", "^xmp$", "^applet$", "^bgsound$", "^blink$", "^isindex$", "^keygen$", "^multicol$", "^nextid$", "^spacer$", "^basefont$", "^listing$", "^command$", "^element$"]}]`,
      );
    });
  });
});

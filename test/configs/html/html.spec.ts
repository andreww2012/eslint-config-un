import {GLOB_HTM, GLOB_HTML, GLOB_HTM_HTML} from '../../../src/constants';

const FIXTURES = {
  elementWithRepeatedAttribute: 'element-with-repeated-attribute.html',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('html');

  it('loads `html` plugin if used', () => {
    expect(configResult.getLoadedPlugin('html')).toBeDefined();
  });

  it('creates `html` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('html')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `html` eslint config', async () => {
      await expectConfigState({}, 'html', false);
    });

    it('creates `html` eslint config if explicitly enabled', async () => {
      await expectConfigState('html', 'html', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `html` eslint config by default (when angular is not installed)', async () => {
      await expectConfigState({}, 'html', true, 'default');
    });

    it('creates `html` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('html', 'html', ['html', true], 'default');
    });

    it('does not create `html` eslint config if explicitly disabled', async () => {
      await expectConfigState({html: false}, 'html', false, 'default');
    });

    describe('`angular` config is enabled', () => {
      beforeEach(() => {
        addInstalledPackages({'@angular/core': '19.0.0'});
      });

      it('does not create `html` eslint config', async () => {
        await expectConfigState({}, 'html', false, 'default');
      });

      it('creates `html` eslint config if explicitly enabled', async () => {
        await expectConfigState('html', 'html', true, 'default');
      });

      it('does not create `html` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({html: false}, 'html', ['html', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `html` eslint config', async () => {
      await expectConfigState({}, 'html', true, 'misc-enabled');
    });

    it('creates `html` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('html', 'html', ['html', true], 'misc-enabled');
    });

    it('does not create `html` eslint config if explicitly disabled', async () => {
      await expectConfigState({html: false}, 'html', false, 'misc-enabled');
    });
  });

  it('has default `files` in `html` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('html')?.files).toMatchInlineSnapshot(
      '["**/*.htm?(l)"]',
    );
  });

  it('has default `ignores` in `html` eslint config', () => {
    const ignores = configResult.getConfigByUnPostfix('html')?.ignores;

    expect(configResult.getConfigByUnPostfix('html')?.ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.toIncludeAnyMembers([GLOB_HTML, GLOB_HTM, GLOB_HTM_HTML]);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('html');

  it('enables `html/no-duplicate-attrs` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('html', 'html/no-duplicate-attrs')).toBe(2);
  });

  it('disables `html/no-inline-styles` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('html', 'html/no-inline-styles')).toBe(0);
  });

  it('`html/no-duplicate-attrs` rule fires on an element with a repeated attribute', async () => {
    const results = await testEslintConfig(
      'html',
      FIXTURES.elementWithRepeatedAttribute,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.elementWithRepeatedAttribute,
      'html/no-duplicate-attrs',
    );

    expect(error?.message).toMatchInlineSnapshot(`"The attribute 'id' is duplicated."`);
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `html` eslint config', async () => {
      const FILES = ['src/**/*.html'];

      const configResult = await computeEslintConfig({html: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('html')?.files).toStrictEqual(FILES);
    });

    it('disables `html` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({html: {files: []}});

      expect(configResult.getConfigByUnPostfix('html')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `html` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({html: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('html')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `html` eslint config', async () => {
    const configResult = await computeEslintConfig({
      html: {overrides: {'html/no-duplicate-attrs': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('html', 'html/no-duplicate-attrs')).toBe(0);
    expect(configResult.getRuleEntrySeverity('html', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set html settings by default', async () => {
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
    it('does not set parserOptions by default', async () => {
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
      const ruleEntry = configResult.getRuleEntry('html', 'html/no-restricted-tags');

      expect(ruleEntry).toMatchInlineSnapshot(
        '[2, {"tagPatterns": ["^acronym$", "^big$", "^center$", "^content$", "^dir$", "^font$", "^frame$", "^frameset$", "^image$", "^marquee$", "^menuitem$", "^nobr$", "^noembed$", "^noframes$", "^param$", "^plaintext$", "^rb$", "^rtc$", "^shadow$", "^strike$", "^tt$", "^xmp$", "^applet$", "^bgsound$", "^blink$", "^isindex$", "^keygen$", "^multicol$", "^nextid$", "^spacer$", "^basefont$", "^listing$", "^command$", "^element$"]}]',
      );
    });

    it('adds custom disallowed tags to `html/no-restricted-tags` rule', async () => {
      const configResult = await computeEslintConfig({
        html: {disallowedHtmlTags: {iframe: true}},
      });
      const ruleEntry = configResult.getRuleEntry('html', 'html/no-restricted-tags');

      expect(ruleEntry).toMatchInlineSnapshot(
        '[2, {"tagPatterns": ["^acronym$", "^big$", "^center$", "^content$", "^dir$", "^font$", "^frame$", "^frameset$", "^image$", "^marquee$", "^menuitem$", "^nobr$", "^noembed$", "^noframes$", "^param$", "^plaintext$", "^rb$", "^rtc$", "^shadow$", "^strike$", "^tt$", "^xmp$", "^applet$", "^bgsound$", "^blink$", "^isindex$", "^keygen$", "^multicol$", "^nextid$", "^spacer$", "^basefont$", "^listing$", "^command$", "^element$", "^iframe$"]}]',
      );
    });

    it('allows a previously-restricted invalid tag when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        html: {disallowedHtmlTags: {font: false}},
      });
      const ruleEntry = configResult.getRuleEntry('html', 'html/no-restricted-tags');

      expect(ruleEntry).toMatchInlineSnapshot(
        '[2, {"tagPatterns": ["^acronym$", "^big$", "^center$", "^content$", "^dir$", "^frame$", "^frameset$", "^image$", "^marquee$", "^menuitem$", "^nobr$", "^noembed$", "^noframes$", "^param$", "^plaintext$", "^rb$", "^rtc$", "^shadow$", "^strike$", "^tt$", "^xmp$", "^applet$", "^bgsound$", "^blink$", "^isindex$", "^keygen$", "^multicol$", "^nextid$", "^spacer$", "^basefont$", "^listing$", "^command$", "^element$"]}]',
      );
    });
  });
});

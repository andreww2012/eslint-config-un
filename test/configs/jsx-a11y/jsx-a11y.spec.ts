const FIXTURES = {
  imgWithoutAlt: 'img-without-alt.tsx',
} as const;

describe('basic tests', () => {
  it('creates `jsx-a11y` eslint config and loads `jsx-a11y` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('jsxA11y');

    const config = configResult.getConfigByUnPostfix('jsx-a11y');

    expect(config).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot('["**/*.?([cm])[jt]sx"]');
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('jsx-a11y')).toBeDefined();
  });

  it('does not create `jsx-a11y` eslint config and does not load `jsx-a11y` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({jsxA11y: false});

    expect(configResult.getConfigByUnPostfix('jsx-a11y')).toBeUndefined();
    expect(configResult.getLoadedPlugin('jsx-a11y')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `jsx-a11y` eslint config', async () => {
      await expectConfigState({}, 'jsx-a11y', false);
    });

    it('creates `jsx-a11y` eslint config if explicitly enabled', async () => {
      await expectConfigState('jsxA11y', 'jsx-a11y', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `jsx-a11y` eslint config by default', async () => {
      await expectConfigState({}, 'jsx-a11y', true, 'default');
    });

    it('creates `jsx-a11y` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('jsxA11y', 'jsx-a11y', ['jsxA11y', true], 'default');
    });

    it('does not create `jsx-a11y` eslint config if explicitly disabled', async () => {
      await expectConfigState({jsxA11y: false}, 'jsx-a11y', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `jsx-a11y` eslint config', async () => {
      await expectConfigState({}, 'jsx-a11y', true, 'misc-enabled');
    });

    it('creates `jsx-a11y` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('jsxA11y', 'jsx-a11y', ['jsxA11y', true], 'misc-enabled');
    });

    it('does not create `jsx-a11y` eslint config if explicitly disabled', async () => {
      await expectConfigState({jsxA11y: false}, 'jsx-a11y', false, 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('jsxA11y');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('jsx-a11y')).toMatchObject({
      'jsx-a11y/alt-text': 2,
      'jsx-a11y/anchor-ambiguous-text': 1,
      'jsx-a11y/html-has-lang': 0,
    });
  });

  it('`jsx-a11y/alt-text` rule fires on an image without alt text', async () => {
    const results = await testEslintConfig('jsxA11y', FIXTURES.imgWithoutAlt, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.imgWithoutAlt,
      'jsx-a11y/alt-text',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"img elements must have an alt prop, either with meaningful text, or an empty string for decorative images."',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `jsx-a11y` eslint config', async () => {
      const FILES = ['src/**/*.tsx'];

      const configResult = await computeEslintConfig({jsxA11y: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('jsx-a11y')?.files).toStrictEqual(FILES);
    });

    it('disables `jsx-a11y` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({jsxA11y: {files: []}});

      expect(configResult.getConfigByUnPostfix('jsx-a11y')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `jsx-a11y` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({jsxA11y: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('jsx-a11y')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `jsx-a11y` eslint config', async () => {
    const configResult = await computeEslintConfig({
      jsxA11y: {overrides: {'jsx-a11y/alt-text': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('jsx-a11y', 'jsx-a11y/alt-text')).toBe(0);
    expect(configResult.getRuleEntrySeverity('jsx-a11y', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set `jsx-a11y-x` settings by default', async () => {
      const configResult = await computeEslintConfig('jsxA11y');
      const config = configResult.getConfigByUnPostfix('jsx-a11y');

      expect(config?.settings?.['jsx-a11y-x']).toBeUndefined();
    });

    it('sets `jsx-a11y-x` settings when provided', async () => {
      const SETTINGS = {components: {CustomImg: 'img'}} as const;

      const configResult = await computeEslintConfig({jsxA11y: {settings: SETTINGS}});
      const config = configResult.getConfigByUnPostfix('jsx-a11y');

      expect(config?.settings?.['jsx-a11y-x']).toStrictEqual(SETTINGS);
    });
  });

  describe('option: `altTextCheckForElements`', () => {
    it('includes default elements in `jsx-a11y/alt-text` rule by default', async () => {
      const configResult = await computeEslintConfig('jsxA11y');
      const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/alt-text');

      expect(rule).toMatchInlineSnapshot(
        '[2, {"elements": ["img", "object", "area", "input[type="image"]"]}]',
      );
    });

    it('disables `jsx-a11y/alt-text` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({jsxA11y: {altTextCheckForElements: false}});

      expect(configResult.getRuleEntrySeverity('jsx-a11y', 'jsx-a11y/alt-text')).toBe(0);
    });

    it('adds a custom element to checked elements in `jsx-a11y/alt-text` rule', async () => {
      const configResult = await computeEslintConfig({
        jsxA11y: {altTextCheckForElements: {'custom-img': true}},
      });
      const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/alt-text');

      expect(rule).toMatchInlineSnapshot(
        '[2, {"elements": ["img", "object", "area", "input[type="image"]", "custom-img"]}]',
      );
    });

    it('removes a default element from `jsx-a11y/alt-text` rule when disabled', async () => {
      const configResult = await computeEslintConfig({
        jsxA11y: {altTextCheckForElements: {object: false}},
      });
      const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/alt-text');

      expect(rule).toMatchInlineSnapshot(
        '[2, {"elements": ["img", "area", "input[type="image"]"]}]',
      );
    });
  });

  describe('option: `anchorIsValidCheckedAspects`', () => {
    it('checks default aspects in `jsx-a11y/anchor-is-valid` rule by default', async () => {
      const configResult = await computeEslintConfig('jsxA11y');
      const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/anchor-is-valid');

      expect(rule).toMatchInlineSnapshot('[2, {"aspects": ["noHref", "invalidHref"]}]');
    });

    it('disables `jsx-a11y/anchor-is-valid` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        jsxA11y: {anchorIsValidCheckedAspects: false},
      });

      expect(configResult.getRuleEntrySeverity('jsx-a11y', 'jsx-a11y/anchor-is-valid')).toBe(0);
    });

    it('adds `preferButton` aspect when specified in `anchorIsValidCheckedAspects`', async () => {
      const configResult = await computeEslintConfig({
        jsxA11y: {anchorIsValidCheckedAspects: {preferButton: true}},
      });
      const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/anchor-is-valid');

      expect(rule).toMatchInlineSnapshot(
        '[2, {"aspects": ["noHref", "invalidHref", "preferButton"]}]',
      );
    });

    it('removes a default aspect from `jsx-a11y/anchor-is-valid` rule when disabled', async () => {
      const configResult = await computeEslintConfig({
        jsxA11y: {anchorIsValidCheckedAspects: {noHref: false}},
      });
      const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/anchor-is-valid');

      expect(rule).toMatchInlineSnapshot('[2, {"aspects": ["invalidHref"]}]');
    });
  });

  describe('option: `ambiguousWordsForAnchorText`', () => {
    it('uses default ambiguous words in `jsx-a11y/anchor-ambiguous-text` rule by default', async () => {
      const configResult = await computeEslintConfig('jsxA11y');
      const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/anchor-ambiguous-text');

      expect(rule).toMatchInlineSnapshot(
        '[1, {"words": ["click here", "here", "link", "a link", "learn more"]}]',
      );
    });

    it('disables `jsx-a11y/anchor-ambiguous-text` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        jsxA11y: {ambiguousWordsForAnchorText: false},
      });

      expect(configResult.getRuleEntrySeverity('jsx-a11y', 'jsx-a11y/anchor-ambiguous-text')).toBe(
        0,
      );
    });

    it('uses custom words list when provided via a function', async () => {
      const configResult = await computeEslintConfig({
        jsxA11y: {ambiguousWordsForAnchorText: () => ({words: ['read more']})},
      });
      const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/anchor-ambiguous-text');

      expect(rule).toMatchInlineSnapshot('[1, {"words": ["read more"]}]');
    });

    it('uses `warn` severity (default) when no severity is specified in option', async () => {
      const configResult = await computeEslintConfig({
        jsxA11y: {ambiguousWordsForAnchorText: {words: ['read more']}},
      });

      expect(configResult.getRuleEntrySeverity('jsx-a11y', 'jsx-a11y/anchor-ambiguous-text')).toBe(
        1,
      );
    });

    it('uses `error` severity when `ambiguousWordsForAnchorText.severity` is `error`', async () => {
      const configResult = await computeEslintConfig({
        jsxA11y: {ambiguousWordsForAnchorText: {words: ['read more'], severity: 'error'}},
      });

      expect(configResult.getRuleEntrySeverity('jsx-a11y', 'jsx-a11y/anchor-ambiguous-text')).toBe(
        2,
      );
    });
  });

  describe('option: `imageWords`', () => {
    it('uses `warn` severity for `jsx-a11y/img-redundant-alt` rule by default', async () => {
      const configResult = await computeEslintConfig('jsxA11y');

      expect(configResult.getRuleEntrySeverity('jsx-a11y', 'jsx-a11y/img-redundant-alt')).toBe(1);
    });

    it('disables `jsx-a11y/img-redundant-alt` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({jsxA11y: {imageWords: false}});

      expect(configResult.getRuleEntrySeverity('jsx-a11y', 'jsx-a11y/img-redundant-alt')).toBe(0);
    });

    it('uses custom words in `jsx-a11y/img-redundant-alt` rule when `imageWords.words` is provided', async () => {
      const configResult = await computeEslintConfig({
        jsxA11y: {imageWords: {words: ['snapshot', 'screenshot']}},
      });
      const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/img-redundant-alt');

      expect(rule).toMatchInlineSnapshot('[1, {"words": ["snapshot", "screenshot"]}]');
    });

    it('uses `error` severity in `jsx-a11y/img-redundant-alt` when `imageWords.severity` is `error`', async () => {
      const configResult = await computeEslintConfig({
        jsxA11y: {imageWords: {words: ['snapshot'], severity: 'error'}},
      });

      expect(configResult.getRuleEntrySeverity('jsx-a11y', 'jsx-a11y/img-redundant-alt')).toBe(2);
    });
  });

  describe('option: `hoverInHandlersRequiringOnFocus`', () => {
    it('uses default hover-in handlers in `jsx-a11y/mouse-events-have-key-events` rule by default', async () => {
      const configResult = await computeEslintConfig('jsxA11y');
      const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/mouse-events-have-key-events');

      expect(rule).toMatchInlineSnapshot(
        '[2, {"hoverInHandlers": ["onMouseOver", "onMouseEnter", "onPointerOver", "onPointerEnter"], "hoverOutHandlers": ["onMouseOut", "onMouseLeave", "onPointerOut", "onPointerLeave"]}]',
      );
    });

    it('adds extra hover-in handler when specified in option', async () => {
      const configResult = await computeEslintConfig({
        jsxA11y: {hoverInHandlersRequiringOnFocus: {onDragEnter: true}},
      });
      const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/mouse-events-have-key-events');

      expect(rule).toMatchInlineSnapshot(
        '[2, {"hoverInHandlers": ["onMouseOver", "onMouseEnter", "onPointerOver", "onPointerEnter", "onDragEnter"], "hoverOutHandlers": ["onMouseOut", "onMouseLeave", "onPointerOut", "onPointerLeave"]}]',
      );
    });

    it('removes a default hover-in handler when disabled in option', async () => {
      const configResult = await computeEslintConfig({
        jsxA11y: {hoverInHandlersRequiringOnFocus: {onMouseOver: false}},
      });
      const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/mouse-events-have-key-events');

      expect(rule).toMatchInlineSnapshot(
        '[2, {"hoverInHandlers": ["onMouseEnter", "onPointerOver", "onPointerEnter"], "hoverOutHandlers": ["onMouseOut", "onMouseLeave", "onPointerOut", "onPointerLeave"]}]',
      );
    });
  });

  describe('option: `hoverOutHandlersRequiringOnBlur`', () => {
    it('adds extra hover-out handler when specified in option', async () => {
      const configResult = await computeEslintConfig({
        jsxA11y: {hoverOutHandlersRequiringOnBlur: {onDragLeave: true}},
      });
      const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/mouse-events-have-key-events');

      expect(rule).toMatchInlineSnapshot(
        '[2, {"hoverInHandlers": ["onMouseOver", "onMouseEnter", "onPointerOver", "onPointerEnter"], "hoverOutHandlers": ["onMouseOut", "onMouseLeave", "onPointerOut", "onPointerLeave", "onDragLeave"]}]',
      );
    });

    it('removes a default hover-out handler when disabled in option', async () => {
      const configResult = await computeEslintConfig({
        jsxA11y: {hoverOutHandlersRequiringOnBlur: {onMouseOut: false}},
      });
      const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/mouse-events-have-key-events');

      expect(rule).toMatchInlineSnapshot(
        '[2, {"hoverInHandlers": ["onMouseOver", "onMouseEnter", "onPointerOver", "onPointerEnter"], "hoverOutHandlers": ["onMouseLeave", "onPointerOut", "onPointerLeave"]}]',
      );
    });
  });

  describe('option: `labelAttributes`', () => {
    it('does not include custom label attributes in rules by default', async () => {
      const configResult = await computeEslintConfig('jsxA11y');
      const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/label-has-associated-control');

      expect(rule).toMatchInlineSnapshot('[2, {}]');
    });

    it('passes `labelAttributes` to `jsx-a11y/label-has-associated-control` and `jsx-a11y/control-has-associated-label` rules when provided', async () => {
      const configResult = await computeEslintConfig({
        jsxA11y: {labelAttributes: ['data-label']},
      });

      const labelRule = configResult.getRuleEntry(
        'jsx-a11y',
        'jsx-a11y/label-has-associated-control',
      );
      const controlRule = configResult.getRuleEntry(
        'jsx-a11y',
        'jsx-a11y/control-has-associated-label',
      );

      expect(labelRule).toMatchInlineSnapshot('[2, {"labelAttributes": ["data-label"]}]');
      expect(controlRule).toMatchInlineSnapshot(
        '[2, {"ignoreElements": ["audio", "canvas", "embed", "input", "textarea", "tr", "video", "th", "td"], "ignoreRoles": ["grid", "listbox", "menu", "menubar", "radiogroup", "row", "tablist", "toolbar", "tree", "treegrid"], "labelAttributes": ["data-label"]}]',
      );
    });
  });

  describe('option: `tabbableRoles`', () => {
    it('uses default tabbable roles in `jsx-a11y/interactive-supports-focus` rule by default', async () => {
      const configResult = await computeEslintConfig('jsxA11y');
      const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/interactive-supports-focus');

      expect(rule).toMatchInlineSnapshot(
        '[2, {"tabbable": ["button", "checkbox", "link", "searchbox", "spinbutton", "switch", "textbox"]}]',
      );
    });

    it('uses default roles when set to `false`', async () => {
      const configResult = await computeEslintConfig({jsxA11y: {tabbableRoles: false}});
      const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/interactive-supports-focus');

      expect(rule).toMatchInlineSnapshot(
        '[2, {"tabbable": ["button", "checkbox", "link", "searchbox", "spinbutton", "switch", "textbox"]}]',
      );
    });

    it('removes a role from `jsx-a11y/interactive-supports-focus` rule when disabled in option', async () => {
      const configResult = await computeEslintConfig({
        jsxA11y: {tabbableRoles: {button: false}},
      });
      const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/interactive-supports-focus');

      expect(rule).toMatchInlineSnapshot(
        '[2, {"tabbable": ["checkbox", "link", "searchbox", "spinbutton", "switch", "textbox"]}]',
      );
    });

    it('adds an extra role to `jsx-a11y/interactive-supports-focus` rule when specified in option', async () => {
      const configResult = await computeEslintConfig({
        jsxA11y: {tabbableRoles: {combobox: true}},
      });
      const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/interactive-supports-focus');

      expect(rule).toMatchInlineSnapshot(
        '[2, {"tabbable": ["button", "checkbox", "link", "searchbox", "spinbutton", "switch", "textbox", "combobox"]}]',
      );
    });
  });

  describe('option: `customComponents`', () => {
    describe('`imgElements`', () => {
      it('does not include custom img components in rules by default', async () => {
        const configResult = await computeEslintConfig('jsxA11y');
        const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/alt-text');

        expect(rule).toMatchInlineSnapshot(
          '[2, {"elements": ["img", "object", "area", "input[type="image"]"]}]',
        );
      });

      it('passes `imgElements` to `jsx-a11y/alt-text` and `jsx-a11y/img-redundant-alt` rules', async () => {
        const configResult = await computeEslintConfig({
          jsxA11y: {customComponents: {imgElements: ['CustomImg', 'AppImage']}},
        });

        const altText = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/alt-text');
        const imgRedundantAlt = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/img-redundant-alt');

        expect(altText).toMatchInlineSnapshot(
          '[2, {"elements": ["img", "object", "area", "input[type="image"]"], "img": ["CustomImg", "AppImage"]}]',
        );

        expect(imgRedundantAlt).toMatchInlineSnapshot(
          '[1, {"components": ["CustomImg", "AppImage"]}]',
        );
      });
    });

    describe('`links`', () => {
      it('does not include custom link components in rules by default', async () => {
        const configResult = await computeEslintConfig('jsxA11y');
        const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/anchor-has-content');

        expect(rule).toMatchInlineSnapshot('[2, {}]');
      });

      it('passes `links` to `jsx-a11y/anchor-has-content` and `jsx-a11y/anchor-is-valid` rules', async () => {
        const configResult = await computeEslintConfig({
          jsxA11y: {customComponents: {links: ['RouterLink', 'AppLink']}},
        });

        const anchorHasContent = configResult.getRuleEntry(
          'jsx-a11y',
          'jsx-a11y/anchor-has-content',
        );
        const anchorIsValid = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/anchor-is-valid');

        expect(anchorHasContent).toMatchInlineSnapshot(
          '[2, {"components": ["RouterLink", "AppLink"]}]',
        );

        expect(anchorIsValid).toMatchInlineSnapshot(
          '[2, {"aspects": ["noHref", "invalidHref"], "components": ["RouterLink", "AppLink"]}]',
        );
      });
    });

    describe('`controls`', () => {
      it('passes `controls` to `jsx-a11y/control-has-associated-label` and `jsx-a11y/label-has-associated-control` rules', async () => {
        const configResult = await computeEslintConfig({
          jsxA11y: {customComponents: {controls: ['CustomInput', 'AppSelect']}},
        });

        const controlRule = configResult.getRuleEntry(
          'jsx-a11y',
          'jsx-a11y/control-has-associated-label',
        );
        const labelRule = configResult.getRuleEntry(
          'jsx-a11y',
          'jsx-a11y/label-has-associated-control',
        );

        expect(controlRule).toMatchInlineSnapshot(
          '[2, {"controlComponents": ["CustomInput", "AppSelect"], "ignoreElements": ["audio", "canvas", "embed", "input", "textarea", "tr", "video", "th", "td"], "ignoreRoles": ["grid", "listbox", "menu", "menubar", "radiogroup", "row", "tablist", "toolbar", "tree", "treegrid"]}]',
        );

        expect(labelRule).toMatchInlineSnapshot(
          '[2, {"controlComponents": ["CustomInput", "AppSelect"]}]',
        );
      });
    });

    describe('`labels`', () => {
      it('passes `labels` to `jsx-a11y/label-has-associated-control` rule', async () => {
        const configResult = await computeEslintConfig({
          jsxA11y: {customComponents: {labels: ['FormLabel', 'AppLabel']}},
        });
        const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/label-has-associated-control');

        expect(rule).toMatchInlineSnapshot('[2, {"labelComponents": ["FormLabel", "AppLabel"]}]');
      });
    });

    describe('`headings`', () => {
      it('does not include custom heading components in `jsx-a11y/heading-has-content` rule by default', async () => {
        const configResult = await computeEslintConfig('jsxA11y');
        const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/heading-has-content');

        expect(rule).toMatchInlineSnapshot('[2, {}]');
      });

      it('passes `headings` to `jsx-a11y/heading-has-content` rule', async () => {
        const configResult = await computeEslintConfig({
          jsxA11y: {customComponents: {headings: ['AppHeading', 'SectionTitle']}},
        });
        const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/heading-has-content');

        expect(rule).toMatchInlineSnapshot(
          '[2, {"inputComponents": ["AppHeading", "SectionTitle"]}]',
        );
      });
    });

    describe('`audioElements`, `videoElements`, `trackElements`', () => {
      it('does not include custom media components in `jsx-a11y/media-has-caption` rule by default', async () => {
        const configResult = await computeEslintConfig('jsxA11y');
        const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/media-has-caption');

        expect(rule).toMatchInlineSnapshot('[1, {}]');
      });

      it('passes audio/video/track components to `jsx-a11y/media-has-caption` rule', async () => {
        const configResult = await computeEslintConfig({
          jsxA11y: {
            customComponents: {
              audioElements: ['AudioPlayer'],
              videoElements: ['VideoPlayer'],
              trackElements: ['TrackComponent'],
            },
          },
        });
        const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/media-has-caption');

        expect(rule).toMatchInlineSnapshot(
          '[1, {"audio": ["AudioPlayer"], "track": ["TrackComponent"], "video": ["VideoPlayer"]}]',
        );
      });
    });

    describe('`areaElements`', () => {
      it('passes `areaElements` to `jsx-a11y/alt-text` rule', async () => {
        const configResult = await computeEslintConfig({
          jsxA11y: {customComponents: {areaElements: ['AppArea']}},
        });
        const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/alt-text');

        expect(rule).toMatchInlineSnapshot(
          '[2, {"area": ["AppArea"], "elements": ["img", "object", "area", "input[type="image"]"]}]',
        );
      });
    });

    describe('`inputTypeImageElements`', () => {
      it('passes `inputTypeImageElements` to `jsx-a11y/alt-text` rule', async () => {
        const configResult = await computeEslintConfig({
          jsxA11y: {customComponents: {inputTypeImageElements: ['ImageInput']}},
        });
        const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/alt-text');

        expect(rule).toMatchInlineSnapshot(
          '[2, {"elements": ["img", "object", "area", "input[type="image"]"], "input[type="image"]": ["ImageInput"]}]',
        );
      });
    });

    describe('`inputs`', () => {
      it('does not include custom input components in `jsx-a11y/autocomplete-valid` rule by default', async () => {
        const configResult = await computeEslintConfig('jsxA11y');
        const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/autocomplete-valid');

        expect(rule).toMatchInlineSnapshot('[2, {}]');
      });

      it('passes `inputs` to `jsx-a11y/autocomplete-valid` rule', async () => {
        const configResult = await computeEslintConfig({
          jsxA11y: {customComponents: {inputs: ['CustomInput', 'AppInput']}},
        });
        const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/autocomplete-valid');

        expect(rule).toMatchInlineSnapshot('[2, {"inputComponents": ["CustomInput", "AppInput"]}]');
      });
    });

    describe('`objectElements`', () => {
      it('passes `objectElements` to `jsx-a11y/alt-text` rule', async () => {
        const configResult = await computeEslintConfig({
          jsxA11y: {customComponents: {objectElements: ['AppObject']}},
        });
        const rule = configResult.getRuleEntry('jsx-a11y', 'jsx-a11y/alt-text');

        expect(rule).toMatchInlineSnapshot(
          '[2, {"elements": ["img", "object", "area", "input[type="image"]"], "object": ["AppObject"]}]',
        );
      });
    });
  });
});

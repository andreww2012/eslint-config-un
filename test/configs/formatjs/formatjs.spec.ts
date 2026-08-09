const FIXTURES = {
  withEmoji: 'with-emoji.js',
} as const;

beforeEach(() => {
  addInstalledPackages({'@formatjs/icu-messageformat-parser': '6.0.0'});
});

describe('basic tests', () => {
  it('creates `formatjs` eslint config and loads `formatjs` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('formatJs');

    const config = configResult.getConfigByUnPostfix('formatjs');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('formatjs')).toBeDefined();
  });

  it('does not create `formatjs` eslint config and does not load `formatjs` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({formatJs: false});

    expect(configResult.getConfigByUnPostfix('formatjs')).toBeUndefined();
    expect(configResult.getLoadedPlugin('formatjs')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `formatjs` eslint config', async () => {
      await expectConfigState({}, 'formatjs', false);
    });

    it('creates `formatjs` eslint config if explicitly enabled', async () => {
      await expectConfigState('formatJs', 'formatjs', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `formatjs` eslint config', async () => {
      await expectConfigState({}, 'formatjs', true, 'default');
    });

    it('does not create `formatjs` eslint config if explicitly disabled', async () => {
      await expectConfigState({formatJs: false}, 'formatjs', false, 'default');
    });

    it('creates `formatjs` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('formatJs', 'formatjs', ['formatJs', true], 'default');
    });

    describe('`@formatjs/icu-messageformat-parser` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `formatjs` eslint config', async () => {
        await expectConfigState({}, 'formatjs', false, 'default');
      });

      it('creates `formatjs` eslint config if explicitly enabled', async () => {
        await expectConfigState('formatJs', 'formatjs', true, 'default');
      });

      it('does not create `formatjs` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({formatJs: false}, 'formatjs', ['formatJs', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `formatjs` eslint config', async () => {
      await expectConfigState({}, 'formatjs', true, 'misc-enabled');
    });

    it('creates `formatjs` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('formatJs', 'formatjs', ['formatJs', true], 'misc-enabled');
    });

    it('does not create `formatjs` eslint config if explicitly disabled', async () => {
      await expectConfigState({formatJs: false}, 'formatjs', false, 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('formatJs');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('formatjs')).toMatchObject({
      'formatjs/enforce-default-message': 2,
      'formatjs/no-camel-case': 0,
    });
  });

  it('`formatjs/no-emoji` rule fires when a message contains an emoji', async () => {
    const results = await testEslintConfig('formatJs', FIXTURES.withEmoji, import.meta.dirname);

    const error = findLintMessageFromLintResults(results, FIXTURES.withEmoji, 'formatjs/no-emoji');

    expect(error?.message).toMatchInlineSnapshot('"Emojis are not allowed"');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `formatjs` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({formatJs: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('formatjs')?.files).toStrictEqual(FILES);
    });

    it('disables `formatjs` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({formatJs: {files: []}});

      expect(configResult.getConfigByUnPostfix('formatjs')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `formatjs` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({formatJs: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('formatjs')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `formatjs` eslint config', async () => {
    const configResult = await computeEslintConfig({
      formatJs: {
        overrides: {'formatjs/no-emoji': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('formatjs', 'formatjs/no-emoji')).toBe(0);
    expect(configResult.getRuleEntrySeverity('formatjs', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set `formatjs` settings by default', async () => {
      const configResult = await computeEslintConfig('formatJs');

      expect(configResult.getConfigByUnPostfix('formatjs')?.settings?.['formatjs']).toBeUndefined();
    });

    it('sets `formatjs` settings when provided', async () => {
      const SETTINGS = {
        additionalFunctionNames: ['$t'],
        additionalComponentNames: ['Trans'],
      };

      const configResult = await computeEslintConfig({
        formatJs: {settings: SETTINGS},
      });

      expect(configResult.getConfigByUnPostfix('formatjs')?.settings?.['formatjs']).toStrictEqual(
        SETTINGS,
      );
    });
  });

  describe('option: `enforceDefaultMessage`', () => {
    it("enforces default message with `'anything'` option by default", async () => {
      const configResult = await computeEslintConfig('formatJs');

      expect(
        configResult.getRuleEntry('formatjs', 'formatjs/enforce-default-message'),
      ).toMatchInlineSnapshot('[2, "anything"]');
    });

    it("enforces default message with `'literal'` when set to `'literal'`", async () => {
      const configResult = await computeEslintConfig({
        formatJs: {enforceDefaultMessage: 'literal'},
      });

      expect(
        configResult.getRuleEntry('formatjs', 'formatjs/enforce-default-message'),
      ).toMatchInlineSnapshot('[2, "literal"]');
    });

    it('disables `formatjs/enforce-default-message` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        formatJs: {enforceDefaultMessage: false},
      });

      expect(
        configResult.getRuleEntrySeverity('formatjs', 'formatjs/enforce-default-message'),
      ).toBe(0);
    });
  });

  describe('option: `enforceDescription`', () => {
    it("enforces description with `'anything'` option by default", async () => {
      const configResult = await computeEslintConfig('formatJs');

      expect(
        configResult.getRuleEntry('formatjs', 'formatjs/enforce-description'),
      ).toMatchInlineSnapshot('[2, "anything"]');
    });

    it("enforces description with `'literal'` when set to `'literal'`", async () => {
      const configResult = await computeEslintConfig({
        formatJs: {enforceDescription: 'literal'},
      });

      expect(
        configResult.getRuleEntry('formatjs', 'formatjs/enforce-description'),
      ).toMatchInlineSnapshot('[2, "literal"]');
    });

    it('disables `formatjs/enforce-description` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        formatJs: {enforceDescription: false},
      });

      expect(configResult.getRuleEntrySeverity('formatjs', 'formatjs/enforce-description')).toBe(0);
    });
  });

  describe('option: `enforceId`', () => {
    it('does not enforce ID and reports missing ID (`enforce-id: off`, `no-id: error`) by default', async () => {
      const configResult = await computeEslintConfig('formatJs');

      expect(configResult.getRuleEntrySeverity('formatjs', 'formatjs/enforce-id')).toBe(0);
      expect(configResult.getRuleEntrySeverity('formatjs', 'formatjs/no-id')).toBe(2);
    });

    it('enables `formatjs/enforce-id` rule and keeps `formatjs/no-id` rule enabled when set to `always`', async () => {
      const configResult = await computeEslintConfig({formatJs: {enforceId: 'always'}});

      expect(configResult.getRuleEntrySeverity('formatjs', 'formatjs/enforce-id')).toBe(2);
      expect(configResult.getRuleEntrySeverity('formatjs', 'formatjs/no-id')).toBe(2);
    });

    it('disables both `formatjs/enforce-id` and `formatjs/no-id` rules when set to `never`', async () => {
      const configResult = await computeEslintConfig({formatJs: {enforceId: 'never'}});

      expect(configResult.getRuleEntrySeverity('formatjs', 'formatjs/enforce-id')).toBe(0);
      expect(configResult.getRuleEntrySeverity('formatjs', 'formatjs/no-id')).toBe(0);
    });
  });

  describe('option: `enforcePluralRules`', () => {
    it('enforces `{other: true}` plural rule by default', async () => {
      const configResult = await computeEslintConfig('formatJs');

      expect(
        configResult.getRuleEntry('formatjs', 'formatjs/enforce-plural-rules'),
      ).toMatchInlineSnapshot('[2, {"other": true}]');
    });

    it('merges user-provided plural rules with default `{other: true}`', async () => {
      const configResult = await computeEslintConfig({
        formatJs: {enforcePluralRules: {one: true, other: false}},
      });

      expect(
        configResult.getRuleEntry('formatjs', 'formatjs/enforce-plural-rules'),
      ).toMatchInlineSnapshot('[2, {"one": true, "other": false}]');
    });
  });

  describe('option: `icuElementsBlocklist`', () => {
    it('disables `formatjs/blocklist-elements` rule by default', async () => {
      const configResult = await computeEslintConfig('formatJs');

      expect(configResult.getRuleEntrySeverity('formatjs', 'formatjs/blocklist-elements')).toBe(0);
    });

    it('enables `formatjs/blocklist-elements` rule when truthy values are specified', async () => {
      const configResult = await computeEslintConfig({
        formatJs: {icuElementsBlocklist: {select: true}},
      });

      expect(
        configResult.getRuleEntry('formatjs', 'formatjs/blocklist-elements'),
      ).toMatchInlineSnapshot('[2, ["select"]]');
    });

    it('does not enable `formatjs/blocklist-elements` rule when only falsy values are specified', async () => {
      const configResult = await computeEslintConfig({
        formatJs: {icuElementsBlocklist: {select: false}},
      });

      expect(configResult.getRuleEntrySeverity('formatjs', 'formatjs/blocklist-elements')).toBe(0);
    });
  });
});

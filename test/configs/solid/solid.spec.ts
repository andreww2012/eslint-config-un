const FIXTURES = {
  jsxWithInnerHtmlProp: 'jsx-with-inner-html-prop.js',
} as const;

beforeEach(() => {
  addInstalledPackages({'solid-js': '1.8.0'});
});

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('solid');

  it('loads `solid` plugin if used', () => {
    expect(configResult.getLoadedPlugin('solid')).toBeDefined();
  });

  it('creates `solid` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('solid')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `solid` eslint config', async () => {
      await expectConfigState({}, 'solid', false);
    });

    it('creates `solid` eslint config if explicitly enabled', async () => {
      await expectConfigState('solid', 'solid', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `solid` eslint config when `solid-js` is installed', async () => {
      await expectConfigState({}, 'solid', true, 'default');
    });

    it('creates `solid` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState('solid', 'solid', ['solid', true], 'default');
    });

    it('does not create `solid` eslint config if explicitly disabled', async () => {
      await expectConfigState({solid: false}, 'solid', false, 'default');
    });

    describe('`solid-js` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `solid` eslint config', async () => {
        await expectConfigState({}, 'solid', false, 'default');
      });

      it('creates `solid` eslint config if explicitly enabled', async () => {
        await expectConfigState('solid', 'solid', true, 'default');
      });

      it('does not create `solid` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({solid: false}, 'solid', ['solid', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `solid` eslint config when `solid-js` is installed', async () => {
      await expectConfigState({}, 'solid', true, 'misc-enabled');
    });

    it('creates `solid` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState({solid: true}, 'solid', ['solid', true], 'misc-enabled');
    });

    it('does not create `solid` eslint config if explicitly disabled', async () => {
      await expectConfigState({solid: false}, 'solid', false, 'misc-enabled');
    });
  });

  it('has no explicit `files` restriction in `solid` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('solid')?.files).toBeUndefined();
  });

  it('has default `ignores` in `solid` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('solid')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('solid');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('solid')).toMatchObject({
      'solid/no-destructure': 2,
      'solid/event-handlers': 1,
      'solid/no-proxy-apis': 0,
    });
  });

  it('sets `typescriptEnabled: false` in `solid/jsx-no-undef` rule when ts config is disabled', () => {
    expect(configResult.getRuleEntryOptions('solid', 'solid/jsx-no-undef')).toMatchObject([
      {typescriptEnabled: false},
    ]);
  });

  it('sets `typescriptEnabled: true` in `solid/jsx-no-undef` rule when ts config is enabled', async () => {
    const tsConfigResult = await computeEslintConfig({solid: true, ts: true});

    expect(tsConfigResult.getRuleEntryOptions('solid', 'solid/jsx-no-undef')).toMatchObject([
      {typescriptEnabled: true},
    ]);
  });

  it('sets `warnOnSpread: false` in `solid/event-handlers` rule when `solid-js` version is unknown', () => {
    expect(configResult.getRuleEntryOptions('solid', 'solid/event-handlers')).toMatchObject([
      {warnOnSpread: false},
    ]);
  });

  it('sets `warnOnSpread: true` in `solid/event-handlers` rule when `solid-js` version is < 1.6', async () => {
    addInstalledPackages({'solid-js': '1.5.0'});

    const result = await computeEslintConfig('solid');

    expect(result.getRuleEntryOptions('solid', 'solid/event-handlers')).toMatchObject([
      {warnOnSpread: true},
    ]);
  });

  it('sets `warnOnSpread: false` in `solid/event-handlers` rule when `solid-js` version is >= 1.6', async () => {
    addInstalledPackages({'solid-js': '1.8.0'});

    const result = await computeEslintConfig('solid');

    expect(result.getRuleEntryOptions('solid', 'solid/event-handlers')).toMatchObject([
      {warnOnSpread: false},
    ]);
  });

  it('uses warn severity for `solid/no-react-specific-props` rule when `solid-js` version is < 1.4', async () => {
    addInstalledPackages({'solid-js': '1.3.0'});

    const result = await computeEslintConfig('solid');

    expect(result.getRuleEntrySeverity('solid', 'solid/no-react-specific-props')).toBe(1);
  });

  it('uses error severity for `solid/no-react-specific-props` rule when `solid-js` version is >= 1.4', async () => {
    addInstalledPackages({'solid-js': '1.4.0'});

    const result = await computeEslintConfig('solid');

    expect(result.getRuleEntrySeverity('solid', 'solid/no-react-specific-props')).toBe(2);
  });

  it('`solid/no-innerhtml` rule fires on JSX element with `innerHTML` prop', async () => {
    const results = await testEslintConfig(
      'solid',
      FIXTURES.jsxWithInnerHtmlProp,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.jsxWithInnerHtmlProp,
      'solid/no-innerhtml',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"The innerHTML attribute is dangerous; passing unsanitized input can lead to security vulnerabilities."',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `solid` eslint config', async () => {
      const FILES = ['src/**/*.tsx'];

      const configResult = await computeEslintConfig({solid: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('solid')?.files).toStrictEqual(FILES);
    });

    it('disables `solid` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({solid: {files: []}});

      expect(configResult.getConfigByUnPostfix('solid')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `solid` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({solid: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('solid')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `solid` eslint config', async () => {
    const configResult = await computeEslintConfig({
      solid: {overrides: {'solid/no-destructure': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('solid', 'solid/no-destructure')).toBe(0);
    expect(configResult.getRuleEntrySeverity('solid', 'no-console')).toBe(0);
  });
});

import {ERROR, OFF, type RuleSeverity} from '../../../src/constants';

const FIXTURES = {
  jsxWithInnerHtmlProp: 'jsx-with-inner-html-prop.js',
} as const;

beforeEach(() => {
  addInstalledPackages({'solid-js': '1.8.0'});
});

describe('basic tests', () => {
  it('creates `solid` eslint config and loads `solid` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('solid');

    const config = configResult.getConfigByUnPostfix('solid');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();
    expect(config?.ignores?.length).toBeGreaterThan(0);
    expect(config?.settings).toStrictEqual({solid: {version: 1}});

    expect(configResult.getLoadedPlugin('solid')).toBeDefined();
  });

  it('does not create `solid` eslint config and does not load `solid` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({solid: false});

    expect(configResult.getConfigByUnPostfix('solid')).toBeUndefined();
    expect(configResult.getLoadedPlugin('solid')).toBeUndefined();
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
});

const someSolid2OnlyRuleEntries = (severity: RuleSeverity = ERROR) => ({
  'solid/no-single-arg-create-effect': severity,
  'solid/removed-api': severity,
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

  it('disables the Solid 2.0 rules when `solid-js` version is unknown', () => {
    expect(configResult.getRuleSeverities('solid')).toMatchObject(someSolid2OnlyRuleEntries(OFF));
  });

  it('disables the Solid 2.0 rules when `solid-js` version is < 2', async () => {
    addInstalledPackages({'solid-js': '1.8.0'});

    const result = await computeEslintConfig('solid');

    expect(result.getRuleSeverities('solid')).toMatchObject(someSolid2OnlyRuleEntries(OFF));
  });

  it('enables the Solid 2.0 rules when `solid-js` version is >= 2', async () => {
    addInstalledPackages({'solid-js': '2.0.0'});

    const result = await computeEslintConfig('solid');

    expect(result.getRuleSeverities('solid')).toMatchObject(someSolid2OnlyRuleEntries());
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

describe('options', () => {
  describe('option: `settings`', () => {
    it('sets `version` to the installed `solid-js` major version by default', async () => {
      const configResult = await computeEslintConfig('solid');

      expect(configResult.getConfigByUnPostfix('solid')?.settings).toStrictEqual({
        solid: {version: 1},
      });
    });

    it('does not set `settings.solid` when `solid-js` version is unknown', async () => {
      setInstalledPackages({});

      const configResult = await computeEslintConfig('solid');

      expect(configResult.getConfigByUnPostfix('solid')?.settings).toBeUndefined();
    });

    it('uses user-provided `version` when option is `2`', async () => {
      const SOLID_VERSION_USER_PROVIDED = 2;

      const configResult = await computeEslintConfig({
        solid: {settings: {version: SOLID_VERSION_USER_PROVIDED}},
      });

      expect(configResult.getConfigByUnPostfix('solid')?.settings).toStrictEqual({
        solid: {version: SOLID_VERSION_USER_PROVIDED},
      });
    });

    it('enables the Solid 2.0 rules when `version` is `2` and installed `solid-js` version is < 2', async () => {
      const configResult = await computeEslintConfig({solid: {settings: {version: 2}}});

      expect(configResult.getRuleSeverities('solid')).toMatchObject(someSolid2OnlyRuleEntries());
    });

    it('disables the Solid 2.0 rules when `version` is `1` and installed `solid-js` version is >= 2', async () => {
      addInstalledPackages({'solid-js': '2.0.0'});

      const configResult = await computeEslintConfig({solid: {settings: {version: 1}}});

      expect(configResult.getRuleSeverities('solid')).toMatchObject(someSolid2OnlyRuleEntries(OFF));
    });

    it('passes only the major part of `version` to the plugin when option is a full version', async () => {
      const configResult = await computeEslintConfig({solid: {settings: {version: '2.1.3'}}});

      expect(configResult.getConfigByUnPostfix('solid')?.settings).toStrictEqual({
        solid: {version: 2},
      });
    });

    it('enables the Solid 2.0 rules when `version` is a full 2.x version', async () => {
      const configResult = await computeEslintConfig({solid: {settings: {version: '2.1.3'}}});

      expect(configResult.getRuleSeverities('solid')).toMatchObject(someSolid2OnlyRuleEntries());
    });

    it('takes the minor part of `version` into account in `solid/event-handlers` rule options', async () => {
      const configResult = await computeEslintConfig({solid: {settings: {version: '1.5.7'}}});

      expect(configResult.getRuleEntryOptions('solid', 'solid/event-handlers')).toMatchObject([
        {warnOnSpread: true},
      ]);
    });

    it('takes the minor part of `version` into account in `solid/no-react-specific-props` rule severity', async () => {
      const configResult = await computeEslintConfig({solid: {settings: {version: '1.3.9'}}});

      expect(configResult.getRuleEntrySeverity('solid', 'solid/no-react-specific-props')).toBe(1);
    });

    it('borrows the minor part of the installed `solid-js` version when `version` names only the major', async () => {
      addInstalledPackages({'solid-js': '1.9.0'});

      const configResult = await computeEslintConfig({solid: {settings: {version: 1}}});

      expect(configResult.getRuleEntrySeverity('solid', 'solid/no-react-specific-props')).toBe(2);
    });

    it('treats a major-only `version` as `x.0` when the installed `solid-js` major version differs', async () => {
      addInstalledPackages({'solid-js': '2.0.0'});

      const configResult = await computeEslintConfig({solid: {settings: {version: 1}}});

      expect(configResult.getRuleEntrySeverity('solid', 'solid/no-react-specific-props')).toBe(1);
    });

    it('treats a major-only `version` as `x.0` when `solid-js` is not installed', async () => {
      setInstalledPackages({});

      const configResult = await computeEslintConfig({solid: {settings: {version: 1}}});

      expect(configResult.getRuleEntrySeverity('solid', 'solid/no-react-specific-props')).toBe(1);
    });
  });
});

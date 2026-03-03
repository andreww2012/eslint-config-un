describe('basic tests', async () => {
  const configResult = await computeEslintConfig('perfectionist');

  it('does not load `perfectionist` plugin in the default configuration', () => {
    expect(configResult.getLoadedPlugin('perfectionist')).toBeUndefined();
  });

  it('creates `perfectionist` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('perfectionist')).toBeDefined();
  });

  it('does not enable any rules by default', () => {
    expect(
      [
        ...new Set(
          Object.values(configResult.getConfigByUnPostfix('perfectionist')?.rules || {}).map(
            (ruleEntry) => JSON.stringify(ruleEntry),
          ),
        ),
      ].toString(),
    ).toMatchInlineSnapshot(`"[0],0"`);
  });
});

describe('un options', () => {
  it('respects `overrides` and `overridesAny` in `perfectionist` eslint config', async () => {
    const configResult = await computeEslintConfig({
      perfectionist: {
        overrides: {'perfectionist/sort-classes': 1},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('perfectionist', 'perfectionist/sort-classes'),
      ),
    ).toBe(1);

    expect(
      getRuleSeverityFromEslintRuleEntry(configResult.getRuleEntry('perfectionist', 'no-console')),
    ).toBe(0);
  });
});

describe('options', () => {
  describe('`settings`', async () => {
    const PLUGIN_SETTINGS = {ignoreCase: false};

    const configResult = await computeEslintConfig({perfectionist: {settings: PLUGIN_SETTINGS}});

    it('sets plugin settings on `perfectionist` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist')?.settings?.['perfectionist'],
      ).toStrictEqual(PLUGIN_SETTINGS);
    });
  });
});

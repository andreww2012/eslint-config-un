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
  describe('`overrides`', async () => {
    const configResult = await computeEslintConfig({
      perfectionist: {overrides: {'perfectionist/sort-classes': 1}},
    });

    it('respect `overrides`', () => {
      expect(
        JSON.stringify(configResult.getRuleEntry('perfectionist', 'perfectionist/sort-classes')),
      ).toMatchInlineSnapshot(`"1"`);
    });
  });

  describe('`overridesAny`', () => {
    it('respect `overridesAny`', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {overridesAny: {'sort-imports': 0}},
      });

      expect(
        JSON.stringify(configResult.getRuleEntry('perfectionist', 'sort-imports')),
      ).toMatchInlineSnapshot(`"0"`);
    });

    it('respects both `overrides` and `overridesAny`', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {
          overrides: {'perfectionist/sort-classes': 1},
          overridesAny: {'sort-imports': 0},
        },
      });

      expect(
        JSON.stringify(configResult.getRuleEntry('perfectionist', 'perfectionist/sort-classes')),
      ).toMatchInlineSnapshot(`"1"`);

      expect(
        JSON.stringify(configResult.getRuleEntry('perfectionist', 'sort-imports')),
      ).toMatchInlineSnapshot(`"0"`);
    });

    it('puts `overridesAny` after `overrides`', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {
          overrides: {'perfectionist/sort-classes': 1},
          overridesAny: {'perfectionist/sort-classes': 2},
        },
      });

      expect(
        JSON.stringify(configResult.getRuleEntry('perfectionist', 'perfectionist/sort-classes')),
      ).toMatchInlineSnapshot(`"2"`);
    });
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

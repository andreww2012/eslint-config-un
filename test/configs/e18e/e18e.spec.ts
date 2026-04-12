describe('basic tests', () => {
  it('creates `e18e` eslint configs and loads `e18e` plugin by default', async () => {
    const configResult = await computeEslintConfig('e18e');

    expect(configResult.getLoadedPlugin('e18e')).toBeDefined();
    expect(
      configResult
        .getConfigsByUnPostfix((config) => config.startsWith('e18e/'))
        .map(({name}) => name),
    ).toMatchInlineSnapshot(
      '["e18e/modernization", "e18e/module-replacements", "e18e/performance-improvements/non-type-aware"]',
    );
  });

  it('does not create `e18e` eslint configs and does not load `e18e` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({e18e: false});

    expect(configResult.getLoadedPlugin('e18e')).toBeUndefined();
    expect(
      configResult
        .getConfigsByUnPostfix((config) => config.startsWith('e18e/'))
        .map(({name}) => name),
    ).toStrictEqual([]);
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `e18e` eslint config', async () => {
      await expectConfigState({}, 'e18e/modernization', false);
    });

    it('creates `e18e` eslint config if explicitly enabled', async () => {
      await expectConfigState('e18e', 'e18e/modernization', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `e18e` eslint config', async () => {
      await expectConfigState({}, 'e18e/modernization', false, 'default');
    });

    it('creates `e18e` eslint config if explicitly enabled', async () => {
      await expectConfigState('e18e', 'e18e/modernization', true, 'default');
    });

    it('does not create `e18e` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({e18e: false}, 'e18e/modernization', ['e18e', false], 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `e18e` eslint config', async () => {
      await expectConfigState({}, 'e18e/modernization', true, 'misc-enabled');
    });

    it('creates `e18e` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState({e18e: true}, 'e18e/modernization', ['e18e', true], 'misc-enabled');
    });

    it('does not create `e18e` eslint config if explicitly disabled', async () => {
      await expectConfigState({e18e: false}, 'e18e/modernization', false, 'misc-enabled');
    });
  });
});

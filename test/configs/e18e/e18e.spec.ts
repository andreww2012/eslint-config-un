describe('basic tests', async () => {
  const configResult = await computeEslintConfig('e18e');

  it('loads `e18e` plugin if used', () => {
    expect(configResult.getLoadedPlugin('e18e')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('creates `e18e` eslint configs if explicitly enabled', () => {
      expect(
        configResult
          .getConfigsByUnPostfix((config) => config.startsWith('e18e/'))
          .map(({name}) => name),
      ).toMatchInlineSnapshot(
        `["e18e/modernization", "e18e/module-replacements", "e18e/performance-improvements/non-type-aware"]`,
      );
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `e18e` eslint configs', async () => {
      const configResult = await computeEslintConfig({}, {reset: true});

      expect(
        configResult.getConfigsByUnPostfix((config) => config.startsWith('e18e/')),
      ).toStrictEqual([]);
    });

    it('creates `e18e` eslint configs if explicitly enabled', async () => {
      const configResult = await computeEslintConfig({e18e: true}, {reset: true});

      expect(
        configResult
          .getConfigsByUnPostfix((config) => config.startsWith('e18e/'))
          .map(({name}) => name),
      ).toMatchInlineSnapshot(
        `["e18e/modernization", "e18e/module-replacements", "e18e/performance-improvements/non-type-aware", "e18e/performance-improvements/type-aware"]`,
      );
    });

    it('does not create `e18e` eslint configs and prints a warning if explicitly disabled', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      const configResult = await computeEslintConfig({e18e: false}, {reset: true});

      expect(configResult.getConfigByUnPostfix('e18e/modernization')).toBeUndefined();

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          `[warn] [eslint-config-un] There is no need to disable \`e18e\` config because this is the default`,
        ),
      ).toBe(true);
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `e18e` eslint configs', async () => {
      const configResult = await computeEslintConfig(
        {},
        {un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(
        configResult
          .getConfigsByUnPostfix((config) => config.startsWith('e18e/'))
          .map(({name}) => name),
      ).toMatchInlineSnapshot(
        `["e18e/modernization", "e18e/module-replacements", "e18e/performance-improvements/non-type-aware", "e18e/performance-improvements/type-aware"]`,
      );
    });

    it('creates `e18e` eslint configs and prints a warning if explicitly enabled', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      const configResult = await computeEslintConfig(
        {e18e: true},
        {un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(
        configResult
          .getConfigsByUnPostfix((config) => config.startsWith('e18e/'))
          .map(({name}) => name),
      ).toMatchInlineSnapshot(
        `["e18e/modernization", "e18e/module-replacements", "e18e/performance-improvements/non-type-aware", "e18e/performance-improvements/type-aware"]`,
      );

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          `[warn] [eslint-config-un] There is no need to enable \`e18e\` config because this is the default`,
        ),
      ).toBe(true);
    });
  });
});

describe('options', () => {
  describe('option: `configModernization`', () => {
    it('creates `e18e/modernization` eslint config when `configModernization` is `true` (default)', async () => {
      const configResult = await computeEslintConfig({e18e: {configModernization: true}});

      expect(configResult.getConfigByUnPostfix('e18e/modernization')).toBeDefined();
    });

    it('does not create `e18e/modernization` eslint config when `configModernization` is `false`', async () => {
      const configResult = await computeEslintConfig({e18e: {configModernization: false}});

      expect(configResult.getConfigByUnPostfix('e18e/modernization')).toBeUndefined();
    });
  });

  describe('option: `configModuleReplacements`', () => {
    it('creates `e18e/module-replacements` eslint config when `configModuleReplacements` is `true` (default)', async () => {
      const configResult = await computeEslintConfig({e18e: {configModuleReplacements: true}});

      expect(configResult.getConfigByUnPostfix('e18e/module-replacements')).toBeDefined();
    });

    it('does not create `e18e/module-replacements` eslint config when `configModuleReplacements` is `false`', async () => {
      const configResult = await computeEslintConfig({e18e: {configModuleReplacements: false}});

      expect(configResult.getConfigByUnPostfix('e18e/module-replacements')).toBeUndefined();
    });
  });

  describe('option: `configPerformanceImprovements`', () => {
    it('creates `e18e/performance-improvements/non-type-aware` eslint config when `configPerformanceImprovements` is `true` (default)', async () => {
      const configResult = await computeEslintConfig({
        e18e: {configPerformanceImprovements: true},
      });

      expect(
        configResult.getConfigByUnPostfix('e18e/performance-improvements/non-type-aware'),
      ).toBeDefined();
    });

    it('does not create `e18e/performance-improvements/non-type-aware` eslint config when `configPerformanceImprovements` is `false`', async () => {
      const configResult = await computeEslintConfig({
        e18e: {configPerformanceImprovements: false},
      });

      expect(
        configResult.getConfigByUnPostfix('e18e/performance-improvements/non-type-aware'),
      ).toBeUndefined();
    });
  });
});

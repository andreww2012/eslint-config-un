const FIXTURES = {
  anonymousArrowDefaultExport: 'anonymous-arrow-default-export.js',
} as const;

describe('basic tests', () => {
  it('creates `arrow-return-style` eslint config and loads `arrow-return-style` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('arrowReturnStyle');

    const config = configResult.getConfigByUnPostfix('arrow-return-style');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('arrow-return-style')).toBeDefined();
  });

  it('does not create `arrow-return-style` eslint config and does not load `arrow-return-style` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({arrowReturnStyle: false});

    expect(configResult.getConfigByUnPostfix('arrow-return-style')).toBeUndefined();
    expect(configResult.getLoadedPlugin('arrow-return-style')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `arrow-return-style` eslint config', async () => {
      await expectConfigState({}, 'arrow-return-style', false);
    });

    it('creates `arrow-return-style` eslint config if explicitly enabled', async () => {
      await expectConfigState('arrowReturnStyle', 'arrow-return-style', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `arrow-return-style` eslint config by default', async () => {
      await expectConfigState({}, 'arrow-return-style', true, 'default');
    });

    it('creates `arrow-return-style` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState(
        'arrowReturnStyle',
        'arrow-return-style',
        ['arrowReturnStyle', true],
        'default',
      );
    });

    it('does not create `arrow-return-style` eslint config if explicitly disabled', async () => {
      await expectConfigState({arrowReturnStyle: false}, 'arrow-return-style', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `arrow-return-style` eslint config', async () => {
      await expectConfigState({}, 'arrow-return-style', true, 'misc-enabled');
    });

    it('creates `arrow-return-style` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState(
        {arrowReturnStyle: true},
        'arrow-return-style',
        ['arrowReturnStyle', true],
        'misc-enabled',
      );
    });

    it('does not create `arrow-return-style` eslint config if explicitly disabled', async () => {
      await expectConfigState(
        {arrowReturnStyle: false},
        'arrow-return-style',
        false,
        'misc-enabled',
      );
    });
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig('arrowReturnStyle');

    expect(configResult.getRuleSeverities('arrow-return-style')).toMatchObject({
      'arrow-return-style/arrow-return-style': 0,
      'arrow-return-style/no-export-default-arrow': 2,
    });
  });

  it('`arrow-return-style/no-export-default-arrow` rule fires on an anonymous arrow function as default export', async () => {
    const results = await testEslintConfig(
      'arrowReturnStyle',
      FIXTURES.anonymousArrowDefaultExport,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.anonymousArrowDefaultExport,
      'arrow-return-style/no-export-default-arrow',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Disallow export default anonymous arrow function"',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `arrow-return-style` eslint config', async () => {
      const FILES = ['src/**/*.{js,ts}'];

      const configResult = await computeEslintConfig({arrowReturnStyle: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('arrow-return-style')?.files).toStrictEqual(FILES);
    });

    it('disables `arrow-return-style` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({arrowReturnStyle: {files: []}});

      expect(configResult.getConfigByUnPostfix('arrow-return-style')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `arrow-return-style` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({arrowReturnStyle: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('arrow-return-style')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `arrow-return-style` eslint config', async () => {
    const configResult = await computeEslintConfig({
      arrowReturnStyle: {
        overrides: {'arrow-return-style/arrow-return-style': 2},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleSeverities('arrow-return-style')).toMatchObject({
      'arrow-return-style/arrow-return-style': 2,
      'no-console': 0,
    });
  });
});

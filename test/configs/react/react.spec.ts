const FIXTURES = {
  multipleComponents: 'multiple-components.jsx',
} as const;

const INSTALLED_REACT_VERSION = '19.0.0';

beforeEach(() => {
  addInstalledPackages({react: INSTALLED_REACT_VERSION});
});

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('react');

  it('loads `react`, `@eslint-react` and `react-hooks` plugins', () => {
    expect(configResult.getLoadedPlugin('react')).toBeDefined();
    expect(configResult.getLoadedPlugin('@eslint-react')).toBeDefined();
    expect(configResult.getLoadedPlugin('react-hooks')).toBeDefined();
  });

  it('creates `react/{plugin-original,x,hooks,allow-default-export-in-jsx-files,refresh,you-might-not-need-an-effect}` eslint configs', () => {
    expect(configResult.getConfigByUnPostfix('react/plugin-original')).toBeDefined();
    expect(configResult.getConfigByUnPostfix('react/x')).toBeDefined();
    expect(configResult.getConfigByUnPostfix('react/hooks')).toBeDefined();
    expect(
      configResult.getConfigByUnPostfix('react/allow-default-export-in-jsx-files'),
    ).toBeDefined();
    expect(configResult.getConfigByUnPostfix('react/refresh')).toBeDefined();
    expect(configResult.getConfigByUnPostfix('react/you-might-not-need-an-effect')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `react/plugin-original` eslint config', async () => {
      await expectConfigState({}, 'react/plugin-original', false);
    });

    it('creates `react/plugin-original` eslint config if explicitly enabled', async () => {
      await expectConfigState('react', 'react/plugin-original', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `react/plugin-original` eslint config', async () => {
      await expectConfigState({}, 'react/plugin-original', true, 'default');
    });

    it('creates `react/plugin-original` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('react', 'react/plugin-original', ['react', true], 'default');
    });

    it('does not create `react/plugin-original` eslint config if explicitly disabled', async () => {
      await expectConfigState({react: false}, 'react/plugin-original', false, 'default');
    });

    describe('`react` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `react/plugin-original` eslint config', async () => {
        await expectConfigState({}, 'react/plugin-original', false, 'default');
      });

      it('creates `react/plugin-original` eslint config if explicitly enabled', async () => {
        await expectConfigState('react', 'react/plugin-original', true, 'default');
      });

      it('does not create `react/plugin-original` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState(
          {react: false},
          'react/plugin-original',
          ['react', false],
          'default',
        );
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `react/plugin-original` eslint config', async () => {
      await expectConfigState({}, 'react/plugin-original', true, 'misc-enabled');
    });

    it('creates `react/plugin-original` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('react', 'react/plugin-original', ['react', true], 'misc-enabled');
    });

    it('does not create `react/plugin-original` eslint config if explicitly disabled', async () => {
      await expectConfigState({react: false}, 'react/plugin-original', false, 'misc-enabled');
    });
  });

  it('has default `files` in `react/plugin-original` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('react/plugin-original')?.files).toMatchInlineSnapshot(
      '["**/*.?([cm])[jt]s?(x)"]',
    );
  });

  it('has default `ignores` in `react/plugin-original` eslint config', () => {
    expect(
      configResult.getConfigByUnPostfix('react/plugin-original')?.ignores?.length,
    ).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('react');

  it('enables `react/no-multi-comp` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('react/plugin-original', 'react/no-multi-comp')).toBe(
      2,
    );
  });

  it('disables `react/boolean-prop-naming` rule by default', () => {
    expect(
      configResult.getRuleEntrySeverity('react/plugin-original', 'react/boolean-prop-naming'),
    ).toBe(0);
  });

  it('`react/no-multi-comp` rule fires on a file with multiple components', async () => {
    const results = await testEslintConfig(
      'react',
      FIXTURES.multipleComponents,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.multipleComponents,
      'react/no-multi-comp',
    );

    expect(error?.message).toMatchInlineSnapshot('"Declare only one React component per file"');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `react/plugin-original` eslint config', async () => {
      const FILES = ['src/**/*.jsx'];

      const configResult = await computeEslintConfig({react: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('react/plugin-original')?.files).toStrictEqual(
        FILES,
      );
    });

    it('disables `react/plugin-original` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({react: {files: []}});

      expect(configResult.getConfigByUnPostfix('react/plugin-original')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `react/plugin-original` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({react: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('react/plugin-original')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `react/plugin-original` eslint config', async () => {
    const configResult = await computeEslintConfig({
      react: {overrides: {'react/no-multi-comp': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('react/plugin-original', 'react/no-multi-comp')).toBe(
      0,
    );
    expect(configResult.getRuleEntrySeverity('react/plugin-original', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set custom `react` settings by default', async () => {
      const configResult = await computeEslintConfig('react');

      expect(
        configResult.getConfigByUnPostfix('react/plugin-original')?.settings?.['react'],
      ).toStrictEqual({version: INSTALLED_REACT_VERSION});
    });

    it('merges user-provided `settings` with auto-detected react version', async () => {
      const EXTRA_SETTINGS = {pragma: 'Preact', fragment: 'Fragment'};

      const configResult = await computeEslintConfig({
        react: {settings: EXTRA_SETTINGS},
      });

      expect(
        configResult.getConfigByUnPostfix('react/plugin-original')?.settings?.['react'],
      ).toStrictEqual({version: INSTALLED_REACT_VERSION, fragment: 'Fragment', pragma: 'Preact'});
    });
  });

  describe('option: `pluginX`', () => {
    it('disables `react/jsx-no-comment-textnodes` in `react/plugin-original` when `pluginX` is `prefer` by default', async () => {
      const configResult = await computeEslintConfig('react');

      expect(
        configResult.getRuleEntrySeverity(
          'react/plugin-original',
          'react/jsx-no-comment-textnodes',
        ),
      ).toBe(0);
    });

    it('enables `react/jsx-no-comment-textnodes` in `react/plugin-original` when set to `never`', async () => {
      const configResult = await computeEslintConfig({react: {pluginX: 'never'}});

      expect(
        configResult.getRuleEntrySeverity(
          'react/plugin-original',
          'react/jsx-no-comment-textnodes',
        ),
      ).toBe(2);
    });

    it('enables `react/jsx-no-comment-textnodes` in `react/plugin-original` when set to `avoid`', async () => {
      const configResult = await computeEslintConfig({react: {pluginX: 'avoid'}});

      expect(
        configResult.getRuleEntrySeverity(
          'react/plugin-original',
          'react/jsx-no-comment-textnodes',
        ),
      ).toBe(2);
    });

    it('disables `react/jsx-no-comment-textnodes` in `react/plugin-original` when set to `only`', async () => {
      const configResult = await computeEslintConfig({react: {pluginX: 'only'}});

      expect(
        configResult.getRuleEntrySeverity(
          'react/plugin-original',
          'react/jsx-no-comment-textnodes',
        ),
      ).toBe(0);
    });
  });

  describe('option: `reactVersion`', () => {
    it('enables `react/no-unsafe` when `reactVersion` is 17 and `pluginX` is `never`', async () => {
      const configResult = await computeEslintConfig({react: {reactVersion: 17, pluginX: 'never'}});

      expect(configResult.getRuleEntrySeverity('react/plugin-original', 'react/no-unsafe')).toBe(1);
    });

    it('disables `react/no-unsafe` when `reactVersion` is 16', async () => {
      const configResult = await computeEslintConfig({react: {reactVersion: 16}});

      expect(configResult.getRuleEntrySeverity('react/plugin-original', 'react/no-unsafe')).toBe(0);
    });

    it('disables `react/forbid-foreign-prop-types` when `reactVersion` is 19', async () => {
      const configResult = await computeEslintConfig({react: {reactVersion: 19}});

      expect(
        configResult.getRuleEntrySeverity(
          'react/plugin-original',
          'react/forbid-foreign-prop-types',
        ),
      ).toBe(0);
    });

    it('enables `react/forbid-foreign-prop-types` when `reactVersion` is 18', async () => {
      const configResult = await computeEslintConfig({react: {reactVersion: 18}});

      expect(
        configResult.getRuleEntrySeverity(
          'react/plugin-original',
          'react/forbid-foreign-prop-types',
        ),
      ).toBe(2);
    });
  });

  describe('option: `newJsxTransform`', () => {
    it('disables `react/jsx-uses-react` by default', async () => {
      const configResult = await computeEslintConfig('react');

      expect(
        configResult.getRuleEntrySeverity('react/plugin-original', 'react/jsx-uses-react'),
      ).toBe(0);
    });

    it('enables `react/jsx-uses-react` when set to `false` and `pluginX` is `never`', async () => {
      const configResult = await computeEslintConfig({
        react: {newJsxTransform: false, pluginX: 'never'},
      });

      expect(
        configResult.getRuleEntrySeverity('react/plugin-original', 'react/jsx-uses-react'),
      ).toBe(2);
    });
  });

  describe('option: `disallowedElements`', () => {
    it('includes deprecated html elements in `react/forbid-elements` by default', async () => {
      const configResult = await computeEslintConfig('react');

      expect(
        configResult.getRuleEntryOptions('react/plugin-original', 'react/forbid-elements')[0],
      ).toMatchObject({forbid: expect.arrayContaining(['center', 'marquee', 'font']) as unknown});
    });

    it('adds user-specified elements to `react/forbid-elements` forbid list', async () => {
      const configResult = await computeEslintConfig({react: {disallowedElements: {pre: true}}});

      expect(
        configResult.getRuleEntryOptions('react/plugin-original', 'react/forbid-elements')[0],
      ).toMatchObject({forbid: expect.arrayContaining(['center', 'pre']) as unknown});
    });

    it('re-allows default-disallowed elements when `disallowedElements` sets them to `false`', async () => {
      const configResult = await computeEslintConfig({
        react: {disallowedElements: {center: false}},
      });

      expect(
        configResult.getRuleEntryOptions('react/plugin-original', 'react/forbid-elements')[0],
      ).toMatchObject({forbid: expect.not.arrayContaining(['center']) as unknown});
    });

    it('adds custom error message when `disallowedElements` value is a string', async () => {
      const ELEMENT = 'div';
      const MESSAGE = 'Use our <Box> component instead';

      const configResult = await computeEslintConfig({
        react: {disallowedElements: {[ELEMENT]: MESSAGE}},
      });

      expect(
        configResult.getRuleEntryOptions('react/plugin-original', 'react/forbid-elements')[0],
      ).toMatchObject({
        forbid: expect.arrayContaining([{element: ELEMENT, message: MESSAGE}]) as unknown,
      });
    });
  });

  describe('option: `shorthandBoolean`', () => {
    it('uses `never` value and warning severity for `react/jsx-boolean-value` by default and `pluginX` is `never`', async () => {
      const configResult = await computeEslintConfig({react: {pluginX: 'never'}});

      expect(
        configResult.getRuleEntry('react/plugin-original', 'react/jsx-boolean-value'),
      ).toMatchInlineSnapshot('[1, "never"]');
    });

    it('uses `always` value and warning severity for `react/jsx-boolean-value` when set to `avoid` and `pluginX` is `never`', async () => {
      const configResult = await computeEslintConfig({
        react: {shorthandBoolean: 'avoid', pluginX: 'never'},
      });

      expect(
        configResult.getRuleEntry('react/plugin-original', 'react/jsx-boolean-value'),
      ).toMatchInlineSnapshot('[1, "always"]');
    });

    it('uses `never` value and error severity for `react/jsx-boolean-value` when set to `prefer-error` and `pluginX` is `never`', async () => {
      const configResult = await computeEslintConfig({
        react: {shorthandBoolean: 'prefer-error', pluginX: 'never'},
      });

      expect(
        configResult.getRuleEntry('react/plugin-original', 'react/jsx-boolean-value'),
      ).toMatchInlineSnapshot('[2, "never"]');
    });

    it('uses `always` value and error severity for `react/jsx-boolean-value` when set to `avoid-error` and `pluginX` is `never`', async () => {
      const configResult = await computeEslintConfig({
        react: {shorthandBoolean: 'avoid-error', pluginX: 'never'},
      });

      expect(
        configResult.getRuleEntry('react/plugin-original', 'react/jsx-boolean-value'),
      ).toMatchInlineSnapshot('[2, "always"]');
    });

    it('disables `react/jsx-boolean-value` when set to `off` and `pluginX` is `never`', async () => {
      const configResult = await computeEslintConfig({
        react: {shorthandBoolean: 'off', pluginX: 'never'},
      });

      expect(
        configResult.getRuleEntrySeverity('react/plugin-original', 'react/jsx-boolean-value'),
      ).toBe(0);
    });
  });

  describe('option: `shorthandFragment`', () => {
    it('uses `syntax` value and warning severity for `react/jsx-fragments` by default and `pluginX` is `never`', async () => {
      const configResult = await computeEslintConfig({react: {pluginX: 'never'}});

      expect(
        configResult.getRuleEntry('react/plugin-original', 'react/jsx-fragments'),
      ).toMatchInlineSnapshot('[1, "syntax"]');
    });

    it('uses `element` value and warning severity for `react/jsx-fragments` when set to `avoid` and `pluginX` is `never`', async () => {
      const configResult = await computeEslintConfig({
        react: {shorthandFragment: 'avoid', pluginX: 'never'},
      });

      expect(
        configResult.getRuleEntry('react/plugin-original', 'react/jsx-fragments'),
      ).toMatchInlineSnapshot('[1, "element"]');
    });

    it('uses `element` value and error severity for `react/jsx-fragments` when set to `avoid-error` and `pluginX` is `never`', async () => {
      const configResult = await computeEslintConfig({
        react: {shorthandFragment: 'avoid-error', pluginX: 'never'},
      });

      expect(
        configResult.getRuleEntry('react/plugin-original', 'react/jsx-fragments'),
      ).toMatchInlineSnapshot('[2, "element"]');
    });

    it('disables `react/jsx-fragments` when set to `off` and `pluginX` is `never`', async () => {
      const configResult = await computeEslintConfig({
        react: {shorthandFragment: 'off', pluginX: 'never'},
      });

      expect(
        configResult.getRuleEntrySeverity('react/plugin-original', 'react/jsx-fragments'),
      ).toBe(0);
    });
  });
});

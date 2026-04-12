const FIXTURES = {
  invalidElementName: 'invalid-element-name/index.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('webComponents');

  it('loads `wc` plugin if used', () => {
    expect(configResult.getLoadedPlugin('wc')).toBeDefined();
  });

  it('creates `web-components` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('web-components')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `web-components` eslint config', async () => {
      await expectConfigState({}, 'web-components', false);
    });

    it('creates `web-components` eslint config if explicitly enabled', async () => {
      await expectConfigState('webComponents', 'web-components', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `web-components` eslint config', async () => {
      await expectConfigState({}, 'web-components', false, 'default');
    });

    it('creates `web-components` eslint config if explicitly enabled', async () => {
      await expectConfigState('webComponents', 'web-components', true, 'default');
    });

    it('does not create `web-components` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {webComponents: false},
        'web-components',
        ['webComponents', false],
        'default',
      );
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `web-components` eslint config', async () => {
      await expectConfigState({}, 'web-components', false, 'misc-enabled');
    });

    it('creates `web-components` eslint config if explicitly enabled', async () => {
      await expectConfigState({webComponents: true}, 'web-components', true, 'misc-enabled');
    });

    it('does not create `web-components` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {webComponents: false},
        'web-components',
        ['webComponents', false],
        'misc-enabled',
      );
    });
  });

  it('has no explicit `files` restriction in `web-components` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('web-components')?.files).toBeUndefined();
  });

  it('has default `ignores` in `web-components` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('web-components')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('webComponents');

  it('enables `wc/no-constructor-attributes` rule by default', () => {
    expect(
      configResult.getRuleEntrySeverity('web-components', 'wc/no-constructor-attributes'),
    ).toBe(2);
  });

  it('disables `wc/define-tag-after-class-definition` rule by default', () => {
    expect(
      configResult.getRuleEntrySeverity('web-components', 'wc/define-tag-after-class-definition'),
    ).toBe(0);
  });

  it('`wc/no-invalid-element-name` rule fires on a file with an invalid custom element name', async () => {
    const results = await testEslintConfig(
      'webComponents',
      FIXTURES.invalidElementName,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.invalidElementName,
      'wc/no-invalid-element-name',
    );

    expect(error?.message).toMatchInlineSnapshot(
      `"Element name is invalid and should follow the HTML standard's recommendations(https://html.spec.whatwg.org/multipage/custom-elements.html#prod-potentialcustomelementname). Name must contain a hyphen/dash"`,
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `web-components` eslint config', async () => {
      const FILES = ['src/**/*.js', 'src/**/*.ts'];

      const configResult = await computeEslintConfig({webComponents: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('web-components')?.files).toStrictEqual(FILES);
    });

    it('disables `web-components` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({webComponents: {files: []}});

      expect(configResult.getConfigByUnPostfix('web-components')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `web-components` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({webComponents: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('web-components')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `web-components` eslint config', async () => {
    const configResult = await computeEslintConfig({
      webComponents: {
        overrides: {'wc/no-constructor-attributes': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      configResult.getRuleEntrySeverity('web-components', 'wc/no-constructor-attributes'),
    ).toBe(0);
    expect(configResult.getRuleEntrySeverity('web-components', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set `wc` settings by default', async () => {
      const configResult = await computeEslintConfig('webComponents');
      const config = configResult.getConfigByUnPostfix('web-components');

      expect(config?.settings?.['wc']).toBeUndefined();
    });

    it('sets `wc` settings when `settings` is provided', async () => {
      const SETTINGS = {elementBaseClasses: ['LitElement', 'PolymerElement']};

      const configResult = await computeEslintConfig({
        webComponents: {settings: SETTINGS},
      });

      const config = configResult.getConfigByUnPostfix('web-components');

      expect(config?.settings?.['wc']).toStrictEqual(SETTINGS);
    });
  });
});

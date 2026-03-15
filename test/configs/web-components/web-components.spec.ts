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
      const configResult = await computeEslintConfig({});

      expect(configResult.getConfigByUnPostfix('web-components')).toBeUndefined();
    });

    it('creates `web-components` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig('webComponents');

      expect(configResult.getConfigByUnPostfix('web-components')).toBeDefined();
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `web-components` eslint config', async () => {
      const configResult = await computeEslintConfig({}, {reset: true});

      expect(configResult.getConfigByUnPostfix('web-components')).toBeUndefined();
    });

    it('creates `web-components` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig('webComponents', {reset: true});

      expect(configResult.getConfigByUnPostfix('web-components')).toBeDefined();
    });

    it('does not create `web-components` eslint config and prints a warning if explicitly disabled', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      const configResult = await computeEslintConfig({webComponents: false}, {reset: true});

      expect(configResult.getConfigByUnPostfix('web-components')).toBeUndefined();

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          '[warn] [eslint-config-un] There is no need to disable `webComponents` config because this is the default',
        ),
      ).toBe(true);
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `web-components` eslint config', async () => {
      const configResult = await computeEslintConfig(
        {},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(configResult.getConfigByUnPostfix('web-components')).toBeUndefined();
    });
  });

  it('has no explicit `files` restriction in `web-components` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('web-components')?.files).toBeUndefined();
  });

  it('has default `ignores` in `web-components` eslint config', () => {
    const ignores = configResult.getConfigByUnPostfix('web-components')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
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

    it('disables `web-components` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({webComponents: {files: []}});

      expect(configResult.getConfigByUnPostfix('web-components')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `web-components` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({webComponents: {ignores: IGNORES}});
      const ignores = configResult.getConfigByUnPostfix('web-components')?.ignores;

      expect(ignores).to.include.members(IGNORES);
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

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `web-components` eslint config', async () => {
      const configResult = await computeEslintConfig({webComponents: {forceSeverity: 'error'}});

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('web-components'), (ruleName) =>
          ruleName.startsWith('wc/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `web-components` eslint config', async () => {
      const configResult = await computeEslintConfig({webComponents: {forceSeverity: 'warn'}});

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('web-components'), (ruleName) =>
          ruleName.startsWith('wc/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set `wc` settings when `settings` is not provided', async () => {
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

const FIXTURES = {
  htmlAttributeWithQuotedTemplateExpression: 'html-attribute-with-quoted-template-expression.ts',
} as const;

beforeEach(() => {
  addInstalledPackages({lit: '3.0.0'});
});

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('lit');

  it('loads `lit` plugin', () => {
    expect(configResult.getLoadedPlugin('lit')).toBeDefined();
  });

  it('loads `lit-a11y` plugin', () => {
    expect(configResult.getLoadedPlugin('lit-a11y')).toBeDefined();
  });

  it('creates `lit` and `lit-a11y` eslint configs', () => {
    expect(configResult.getConfigByUnPostfix('lit')).toBeDefined();
    expect(configResult.getConfigByUnPostfix('lit-a11y')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `lit` eslint config', async () => {
      await expectConfigState({}, 'lit', false);
    });

    it('creates `lit` eslint config if explicitly enabled', async () => {
      await expectConfigState('lit', 'lit', true);
    });

    it('does not create `lit` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({lit: false}, 'lit', ['lit', false]);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    describe('lit is installed', () => {
      it('creates `lit` eslint config', async () => {
        await expectConfigState({}, 'lit', true, 'default');
      });

      it('creates `lit` eslint config and prints a warning if explicitly enabled', async () => {
        await expectConfigState('lit', 'lit', ['lit', true], 'default');
      });

      it('does not create `lit` eslint config if explicitly disabled', async () => {
        await expectConfigState({lit: false}, 'lit', false, 'default');
      });
    });

    describe('lit is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `lit` eslint config', async () => {
        await expectConfigState({}, 'lit', false, 'default');
      });

      it('creates `lit` eslint config if explicitly enabled', async () => {
        await expectConfigState('lit', 'lit', true, 'default');
      });

      it('does not create `lit` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({lit: false}, 'lit', ['lit', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    describe('lit is installed', () => {
      it('creates `lit` eslint config', async () => {
        await expectConfigState({}, 'lit', true, 'misc-enabled');
      });

      it('creates `lit` eslint config and prints a warning if explicitly enabled', async () => {
        await expectConfigState({lit: true}, 'lit', ['lit', true], 'misc-enabled');
      });

      it('does not create `lit` eslint config if explicitly disabled', async () => {
        await expectConfigState({lit: false}, 'lit', false, 'misc-enabled');
      });
    });

    describe('lit is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `lit` eslint config', async () => {
        await expectConfigState({}, 'lit', false, 'misc-enabled');
      });

      it('does not create `lit` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({lit: false}, 'lit', ['lit', false], 'misc-enabled');
      });
    });
  });

  it('has no explicit `files` restriction in `lit` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('lit')?.files).toBeUndefined();
  });

  it('has default `ignores` in `lit` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('lit')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('lit');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('lit')).toMatchObject({
      'lit/attribute-names': 2,
      'lit/ban-attributes': 0,
    });
  });

  it('`lit/quoted-expressions` rule fires on a template with a quoted expression', async () => {
    const results = await testEslintConfig(
      'lit',
      FIXTURES.htmlAttributeWithQuotedTemplateExpression,
      {
        // `.ts` files are not matched by any other config, so we need to add an extra config to match them
        un: {extraConfigs: [{files: ['**/*.ts']}]},
        searchFixturesRelativeToPath: import.meta.dirname,
      },
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.htmlAttributeWithQuotedTemplateExpression,
      'lit/quoted-expressions',
    );

    expect(error?.message).toMatchInlineSnapshot(
      // eslint-disable-next-line no-template-curly-in-string, un/no-multiple-consecutive-spaces
      '"Expressions must not be quoted inside templates  (e.g. `foo="${bar}"`)"',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `lit` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({lit: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('lit')?.files).toStrictEqual(FILES);
    });

    it('disables `lit` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({lit: {files: []}});

      expect(configResult.getConfigByUnPostfix('lit')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `lit` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({lit: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('lit')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `lit` eslint config', async () => {
    const configResult = await computeEslintConfig({
      lit: {overrides: {'lit/attribute-names': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('lit', 'lit/attribute-names')).toBe(0);
    expect(configResult.getRuleEntrySeverity('lit', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set plugin settings when lit is enabled without options', async () => {
      const configResult = await computeEslintConfig('lit');

      expect(configResult.getConfigByUnPostfix('lit')?.settings?.['lit']).toBeUndefined();
    });

    it('assigns `elementBaseClasses` to `lit` settings property', async () => {
      const ELEMENT_BASE_CLASSES = {elementBaseClasses: ['MyBaseElement']};

      const configResult = await computeEslintConfig({
        lit: {settings: ELEMENT_BASE_CLASSES},
      });

      expect(configResult.getConfigByUnPostfix('lit')?.settings?.['lit']).toStrictEqual(
        ELEMENT_BASE_CLASSES,
      );
    });
  });
});

const FIXTURES = {
  eslintRuleUsingMessage: 'eslint-rule-using-message.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('eslintPlugin');

  it('loads `eslint-plugin` plugin if used', () => {
    expect(configResult.getLoadedPlugin('eslint-plugin')).toBeDefined();
  });

  it('creates `eslint-plugin` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('eslint-plugin')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `eslint-plugin` eslint config', async () => {
      await expectConfigState({}, 'eslint-plugin', false);
    });

    it('creates `eslint-plugin` eslint config if explicitly enabled', async () => {
      await expectConfigState('eslintPlugin', 'eslint-plugin', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `eslint-plugin` eslint config', async () => {
      await expectConfigState({}, 'eslint-plugin', false, 'default');
    });

    it('creates `eslint-plugin` eslint config if explicitly enabled', async () => {
      await expectConfigState('eslintPlugin', 'eslint-plugin', true, 'default');
    });

    it('does not create `eslint-plugin` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {eslintPlugin: false},
        'eslint-plugin',
        ['eslintPlugin', false],
        'default',
      );
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `eslint-plugin` eslint config', async () => {
      await expectConfigState({}, 'eslint-plugin', false, 'misc-enabled');
    });

    it('creates `eslint-plugin` eslint config if explicitly enabled', async () => {
      await expectConfigState({eslintPlugin: true}, 'eslint-plugin', true, 'misc-enabled');
    });

    it('does not create `eslint-plugin` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {eslintPlugin: false},
        'eslint-plugin',
        ['eslintPlugin', false],
        'misc-enabled',
      );
    });
  });

  it('has no explicit `files` restriction in `eslint-plugin` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('eslint-plugin')?.files).toBeUndefined();
  });

  it('has default `ignores` in `eslint-plugin` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('eslint-plugin')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('eslintPlugin');

  it('enables `eslint-plugin/fixer-return` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('eslint-plugin', 'eslint-plugin/fixer-return')).toBe(
      2,
    );
  });

  it('disables `eslint-plugin/require-meta-docs-description` rule by default', () => {
    expect(
      configResult.getRuleEntrySeverity(
        'eslint-plugin',
        'eslint-plugin/require-meta-docs-description',
      ),
    ).toBe(0);
  });

  it('`eslint-plugin/prefer-message-ids` rule fires on a rule using a message string', async () => {
    const results = await testEslintConfig(
      'eslintPlugin',
      FIXTURES.eslintRuleUsingMessage,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.eslintRuleUsingMessage,
      'eslint-plugin/prefer-message-ids',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"`meta.messages` must contain at least one violation message."',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `eslint-plugin` eslint config', async () => {
      const FILES = ['src/rules/**/*.js'];

      const configResult = await computeEslintConfig({eslintPlugin: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('eslint-plugin')?.files).toStrictEqual(FILES);
    });

    it('disables `eslint-plugin` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({eslintPlugin: {files: []}});

      expect(configResult.getConfigByUnPostfix('eslint-plugin')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `eslint-plugin` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({eslintPlugin: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('eslint-plugin')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `eslint-plugin` eslint config', async () => {
    const configResult = await computeEslintConfig({
      eslintPlugin: {
        overrides: {'eslint-plugin/fixer-return': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('eslint-plugin', 'eslint-plugin/fixer-return')).toBe(
      0,
    );
    expect(configResult.getRuleEntrySeverity('eslint-plugin', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `metaProperties`', () => {
    describe('property: `replacedBy`', () => {
      it('enables `eslint-plugin/no-meta-replaced-by` rule when `replacedBy` is `"disallow"`', async () => {
        const configResult = await computeEslintConfig({
          eslintPlugin: {metaProperties: {replacedBy: 'disallow'}},
        });

        expect(
          configResult.getRuleEntrySeverity('eslint-plugin', 'eslint-plugin/no-meta-replaced-by'),
        ).toBe(2);
      });

      it('disables `eslint-plugin/no-meta-replaced-by` rule by default (`"not-disallow"`)', async () => {
        const configResult = await computeEslintConfig('eslintPlugin');

        expect(
          configResult.getRuleEntrySeverity('eslint-plugin', 'eslint-plugin/no-meta-replaced-by'),
        ).toBe(0);
      });
    });

    describe('property: `schemaDefaultProperties`', () => {
      it('enables `eslint-plugin/no-meta-schema-default` rule when `schemaDefaultProperties` is `"disallow"`', async () => {
        const configResult = await computeEslintConfig({
          eslintPlugin: {metaProperties: {schemaDefaultProperties: 'disallow'}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'eslint-plugin',
            'eslint-plugin/no-meta-schema-default',
          ),
        ).toBe(2);
      });

      it('disables `eslint-plugin/no-meta-schema-default` rule by default (`"not-disallow"`)', async () => {
        const configResult = await computeEslintConfig('eslintPlugin');

        expect(
          configResult.getRuleEntrySeverity(
            'eslint-plugin',
            'eslint-plugin/no-meta-schema-default',
          ),
        ).toBe(0);
      });
    });

    describe('property: `defaultOptions`', () => {
      it('enables `eslint-plugin/require-meta-default-options` rule when `defaultOptions` is `"enforce"`', async () => {
        const configResult = await computeEslintConfig({
          eslintPlugin: {metaProperties: {defaultOptions: 'enforce'}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'eslint-plugin',
            'eslint-plugin/require-meta-default-options',
          ),
        ).toBe(2);
      });

      it('disables `eslint-plugin/require-meta-default-options` rule by default (`"not-enforce"`)', async () => {
        const configResult = await computeEslintConfig('eslintPlugin');

        expect(
          configResult.getRuleEntrySeverity(
            'eslint-plugin',
            'eslint-plugin/require-meta-default-options',
          ),
        ).toBe(0);
      });
    });

    describe('property: `docsDescription`', () => {
      it('enables `eslint-plugin/require-meta-docs-description` rule when `docsDescription` is `"enforce"`', async () => {
        const configResult = await computeEslintConfig({
          eslintPlugin: {metaProperties: {docsDescription: 'enforce'}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'eslint-plugin',
            'eslint-plugin/require-meta-docs-description',
          ),
        ).toBe(2);
      });

      it('disables `eslint-plugin/require-meta-docs-description` rule by default (`"not-enforce"`)', async () => {
        const configResult = await computeEslintConfig('eslintPlugin');

        expect(
          configResult.getRuleEntrySeverity(
            'eslint-plugin',
            'eslint-plugin/require-meta-docs-description',
          ),
        ).toBe(0);
      });
    });

    describe('property: `docsRecommended`', () => {
      it('enables `eslint-plugin/require-meta-docs-recommended` rule when `docsRecommended` is `"enforce"`', async () => {
        const configResult = await computeEslintConfig({
          eslintPlugin: {metaProperties: {docsRecommended: 'enforce'}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'eslint-plugin',
            'eslint-plugin/require-meta-docs-recommended',
          ),
        ).toBe(2);
      });

      it('disables `eslint-plugin/require-meta-docs-recommended` rule by default (`"not-enforce"`)', async () => {
        const configResult = await computeEslintConfig('eslintPlugin');

        expect(
          configResult.getRuleEntrySeverity(
            'eslint-plugin',
            'eslint-plugin/require-meta-docs-recommended',
          ),
        ).toBe(0);
      });
    });

    describe('property: `docsUrl`', () => {
      it('enables `eslint-plugin/require-meta-docs-url` rule when `docsUrl` is `"enforce"`', async () => {
        const configResult = await computeEslintConfig({
          eslintPlugin: {metaProperties: {docsUrl: 'enforce'}},
        });

        expect(
          configResult.getRuleEntrySeverity('eslint-plugin', 'eslint-plugin/require-meta-docs-url'),
        ).toBe(2);
      });

      it('disables `eslint-plugin/require-meta-docs-url` rule by default (`"not-enforce"`)', async () => {
        const configResult = await computeEslintConfig('eslintPlugin');

        expect(
          configResult.getRuleEntrySeverity('eslint-plugin', 'eslint-plugin/require-meta-docs-url'),
        ).toBe(0);
      });
    });

    describe('property: `fixable`', () => {
      it('enables `eslint-plugin/require-meta-fixable` rule by default (`"enforce"`)', async () => {
        const configResult = await computeEslintConfig('eslintPlugin');

        expect(
          configResult.getRuleEntrySeverity('eslint-plugin', 'eslint-plugin/require-meta-fixable'),
        ).toBe(2);
      });

      it('disables `eslint-plugin/require-meta-fixable` rule when `fixable` is `"not-enforce"`', async () => {
        const configResult = await computeEslintConfig({
          eslintPlugin: {metaProperties: {fixable: 'not-enforce'}},
        });

        expect(
          configResult.getRuleEntrySeverity('eslint-plugin', 'eslint-plugin/require-meta-fixable'),
        ).toBe(0);
      });
    });

    describe('property: `hasSuggestions`', () => {
      it('enables `eslint-plugin/require-meta-has-suggestions` rule by default (`"enforce"`)', async () => {
        const configResult = await computeEslintConfig('eslintPlugin');

        expect(
          configResult.getRuleEntrySeverity(
            'eslint-plugin',
            'eslint-plugin/require-meta-has-suggestions',
          ),
        ).toBe(2);
      });

      it('disables `eslint-plugin/require-meta-has-suggestions` rule when `hasSuggestions` is `"not-enforce"`', async () => {
        const configResult = await computeEslintConfig({
          eslintPlugin: {metaProperties: {hasSuggestions: 'not-enforce'}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'eslint-plugin',
            'eslint-plugin/require-meta-has-suggestions',
          ),
        ).toBe(0);
      });
    });

    describe('property: `schema`', () => {
      it('enables `eslint-plugin/require-meta-schema` rule by default (`"enforce"`)', async () => {
        const configResult = await computeEslintConfig('eslintPlugin');

        expect(
          configResult.getRuleEntrySeverity('eslint-plugin', 'eslint-plugin/require-meta-schema'),
        ).toBe(2);
      });

      it('disables `eslint-plugin/require-meta-schema` rule when `schema` is `"not-enforce"`', async () => {
        const configResult = await computeEslintConfig({
          eslintPlugin: {metaProperties: {schema: 'not-enforce'}},
        });

        expect(
          configResult.getRuleEntrySeverity('eslint-plugin', 'eslint-plugin/require-meta-schema'),
        ).toBe(0);
      });
    });

    describe('property: `schemaDescriptions`', () => {
      it('enables `eslint-plugin/require-meta-schema-description` rule when `schemaDescriptions` is `"enforce"`', async () => {
        const configResult = await computeEslintConfig({
          eslintPlugin: {metaProperties: {schemaDescriptions: 'enforce'}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'eslint-plugin',
            'eslint-plugin/require-meta-schema-description',
          ),
        ).toBe(2);
      });

      it('disables `eslint-plugin/require-meta-schema-description` rule by default (`"not-enforce"`)', async () => {
        const configResult = await computeEslintConfig('eslintPlugin');

        expect(
          configResult.getRuleEntrySeverity(
            'eslint-plugin',
            'eslint-plugin/require-meta-schema-description',
          ),
        ).toBe(0);
      });
    });

    describe('property: `type`', () => {
      it('enables `eslint-plugin/require-meta-type` rule by default (`"enforce"`)', async () => {
        const configResult = await computeEslintConfig('eslintPlugin');

        expect(
          configResult.getRuleEntrySeverity('eslint-plugin', 'eslint-plugin/require-meta-type'),
        ).toBe(2);
      });

      it('disables `eslint-plugin/require-meta-type` rule when `type` is `"not-enforce"`', async () => {
        const configResult = await computeEslintConfig({
          eslintPlugin: {metaProperties: {type: 'not-enforce'}},
        });

        expect(
          configResult.getRuleEntrySeverity('eslint-plugin', 'eslint-plugin/require-meta-type'),
        ).toBe(0);
      });
    });
  });
});

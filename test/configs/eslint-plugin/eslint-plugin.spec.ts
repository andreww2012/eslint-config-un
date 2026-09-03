const FIXTURES = {
  eslintRuleUsingMessage: 'eslint-rule-using-message.js',
} as const;

describe('basic tests', () => {
  it('creates `eslint-plugin` eslint config and loads `eslint-plugin` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('eslintPlugin');

    const config = configResult.getConfigByUnPostfix('eslint-plugin');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('eslint-plugin')).toBeDefined();
  });

  it('does not create `eslint-plugin` eslint config and does not load `eslint-plugin` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({eslintPlugin: false});

    expect(configResult.getConfigByUnPostfix('eslint-plugin')).toBeUndefined();
    expect(configResult.getLoadedPlugin('eslint-plugin')).toBeUndefined();
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
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('eslintPlugin');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('eslint-plugin')).toMatchObject({
      'eslint-plugin/fixer-return': 2,
      'eslint-plugin/require-meta-docs-description': 0,
    });
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
  describe('option: `settings`', () => {
    it('does not set eslint-plugin settings by default', async () => {
      const configResult = await computeEslintConfig('eslintPlugin');
      const config = configResult.getConfigByUnPostfix('eslint-plugin');

      expect(config?.settings?.['eslint-plugin']).toBeUndefined();
    });

    it('sets eslint-plugin settings when `settings` is provided', async () => {
      const SETTINGS = {ruleTesterConstructors: ['MyRuleTester']} as const;

      const configResult = await computeEslintConfig('eslintPlugin', {
        un: {plugins: {'eslint-plugin': {settings: SETTINGS}}},
      });
      const config = configResult.getConfigByUnPostfix('eslint-plugin');

      expect(config?.settings?.['eslint-plugin']).toStrictEqual(SETTINGS);
    });

    it('sets eslint-plugin settings on the `rule-tests` sub-config too', async () => {
      const SETTINGS = {ruleTesterConstructors: ['MyRuleTester']} as const;

      const configResult = await computeEslintConfig(
        {eslintPlugin: {configRuleTests: true}},
        {un: {plugins: {'eslint-plugin': {settings: SETTINGS}}}},
      );

      expect(
        configResult.getConfigByUnPostfix('eslint-plugin/rule-tests')?.settings?.['eslint-plugin'],
      ).toStrictEqual(SETTINGS);
    });
  });

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

  describe('option: `schemaCompletenessChecks`', () => {
    const RULE_NAME = 'eslint-plugin/no-incomplete-meta-schema';

    it('enables `eslint-plugin/no-incomplete-meta-schema` rule with the default checks by default', async () => {
      const configResult = await computeEslintConfig('eslintPlugin');

      expect(configResult.getRuleEntryParsed('eslint-plugin', RULE_NAME)).toStrictEqual({
        options: [
          {
            checks: {
              boundedTuples: false,
              explicitAdditionalProperties: true,
              explicitItems: false,
              typedItems: false,
            },
          },
        ],
        severity: 2,
      });
    });

    it('enables `eslint-plugin/no-incomplete-meta-schema` rule with the default checks when option is `true`', async () => {
      const configResult = await computeEslintConfig({
        eslintPlugin: {schemaCompletenessChecks: true},
      });

      expect(configResult.getRuleEntryOptions('eslint-plugin', RULE_NAME)).toStrictEqual([
        {
          checks: {
            boundedTuples: false,
            explicitAdditionalProperties: true,
            explicitItems: false,
            typedItems: false,
          },
        },
      ]);
    });

    it('disables `eslint-plugin/no-incomplete-meta-schema` rule when option is `false`', async () => {
      const configResult = await computeEslintConfig({
        eslintPlugin: {schemaCompletenessChecks: false},
      });

      expect(configResult.getRuleEntryParsed('eslint-plugin', RULE_NAME)).toStrictEqual({
        severity: 0,
        options: [],
      });
    });

    it('enables all the checks when option is `all`', async () => {
      const configResult = await computeEslintConfig({
        eslintPlugin: {schemaCompletenessChecks: 'all'},
      });

      expect(configResult.getRuleEntryParsed('eslint-plugin', RULE_NAME)).toStrictEqual({
        options: [
          {
            checks: {
              boundedTuples: true,
              explicitAdditionalProperties: true,
              explicitItems: true,
              typedItems: true,
            },
          },
        ],
        severity: 2,
      });
    });

    it('overrides the default checks when option is an array', async () => {
      const configResult = await computeEslintConfig({
        eslintPlugin: {schemaCompletenessChecks: ['explicitItems', 'typedItems']},
      });

      expect(configResult.getRuleEntryParsed('eslint-plugin', RULE_NAME)).toStrictEqual({
        options: [
          {
            checks: {
              boundedTuples: false,
              explicitAdditionalProperties: false,
              explicitItems: true,
              typedItems: true,
            },
          },
        ],
        severity: 2,
      });
    });

    it('disables `eslint-plugin/no-incomplete-meta-schema` rule when option is an empty array', async () => {
      const configResult = await computeEslintConfig({
        eslintPlugin: {schemaCompletenessChecks: []},
      });

      expect(configResult.getRuleEntryParsed('eslint-plugin', RULE_NAME)).toStrictEqual({
        severity: 0,
        options: [],
      });
    });

    it('merges with the default checks when option is an object', async () => {
      const configResult = await computeEslintConfig({
        eslintPlugin: {schemaCompletenessChecks: {explicitItems: true}},
      });

      expect(configResult.getRuleEntryParsed('eslint-plugin', RULE_NAME)).toStrictEqual({
        severity: 2,
        options: [
          {
            checks: {
              boundedTuples: false,
              explicitAdditionalProperties: true,
              explicitItems: true,
              typedItems: false,
            },
          },
        ],
      });
    });

    it('disables `eslint-plugin/no-incomplete-meta-schema` rule when the only default check is disabled by an object', async () => {
      const configResult = await computeEslintConfig({
        eslintPlugin: {schemaCompletenessChecks: {explicitAdditionalProperties: false}},
      });

      expect(configResult.getRuleEntryParsed('eslint-plugin', RULE_NAME)).toStrictEqual({
        severity: 0,
        options: [],
      });
    });
  });
});

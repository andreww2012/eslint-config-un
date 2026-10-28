const FIXTURES = {
  exportedSchemaWithoutSuffix: 'exported-schema-without-suffix.js',
  looseObjectSchema: 'loose-object-schema.js',
  namedImport: 'named-import.js',
  parseAtModuleScopeAndInFunction: 'parse-at-module-scope-and-in-function.js',
} as const;

beforeEach(() => {
  addInstalledPackages({valibot: '1.5.0'});
});

describe('basic tests', () => {
  it('creates `valibot` eslint config and loads `valibot` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('valibot');

    const config = configResult.getConfigByUnPostfix('valibot');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('valibot')).toBeDefined();
  });

  it('does not create `valibot` eslint config and does not load `valibot` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({valibot: false});

    expect(configResult.getConfigByUnPostfix('valibot')).toBeUndefined();
    expect(configResult.getLoadedPlugin('valibot')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `valibot` eslint config', async () => {
      await expectConfigState({}, 'valibot', false);
    });

    it('creates `valibot` eslint config if explicitly enabled', async () => {
      await expectConfigState('valibot', 'valibot', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    describe('`valibot` is installed', () => {
      it('creates `valibot` eslint config by default', async () => {
        await expectConfigState({}, 'valibot', true, 'default');
      });

      it('creates `valibot` eslint config and prints a warning if explicitly enabled', async () => {
        await expectConfigState('valibot', 'valibot', ['valibot', true], 'default');
      });

      it('does not create `valibot` eslint config if explicitly disabled', async () => {
        await expectConfigState({valibot: false}, 'valibot', false, 'default');
      });
    });

    describe('`valibot` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `valibot` eslint config', async () => {
        await expectConfigState({}, 'valibot', false, 'default');
      });

      it('creates `valibot` eslint config if explicitly enabled', async () => {
        await expectConfigState('valibot', 'valibot', true, 'default');
      });

      it('does not create `valibot` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({valibot: false}, 'valibot', ['valibot', false], 'default');
      });
    });

    it('does not create `valibot` eslint config when an unsupported `valibot` v0 is installed', async () => {
      setInstalledPackages({valibot: '0.42.1'});

      await expectConfigState({}, 'valibot', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `valibot` eslint config when `valibot` is installed', async () => {
      await expectConfigState({}, 'valibot', true, 'misc-enabled');
    });

    it('creates `valibot` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState({valibot: true}, 'valibot', ['valibot', true], 'misc-enabled');
    });

    it('does not create `valibot` eslint config if explicitly disabled', async () => {
      await expectConfigState({valibot: false}, 'valibot', false, 'misc-enabled');
    });
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig('valibot');

    expect(configResult.getRuleSeverities('valibot')).toMatchObject({
      'valibot/no-unchecked-safe-parse': 2,
      'valibot/no-any-schema': 1,
      'valibot/require-issue-messages': 0,
    });
  });

  it('allows unguarded calls at module scope in `valibot/no-unguarded-parse` rule', async () => {
    const configResult = await computeEslintConfig('valibot');

    expect(
      configResult.getRuleEntry('valibot', 'valibot/no-unguarded-parse'),
    ).toMatchInlineSnapshot('[2, {"allowAtModuleScope": true}]');
  });

  it('`valibot/no-unguarded-parse` rule fires on an unguarded `parse()` call in a function only', async () => {
    const results = await testEslintConfig(
      'valibot',
      FIXTURES.parseAtModuleScopeAndInFunction,
      import.meta.dirname,
    );

    const errors = findLintMessageFromLintResults(
      results,
      FIXTURES.parseAtModuleScopeAndInFunction,
      'valibot/no-unguarded-parse',
      {all: true},
    );

    expect(errors.map(({line}) => line)).toStrictEqual([5]);
    expect(errors[0]?.message).toMatchInlineSnapshot(
      '"Wrap Valibot parse() in a try/catch block or switch to safeParse() for recoverable validation."',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `valibot` eslint config', async () => {
      const FILES = ['src/**/*.ts'] as const;

      const configResult = await computeEslintConfig({valibot: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('valibot')?.files).toStrictEqual(FILES);
    });

    it('disables `valibot` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({valibot: {files: []}});

      expect(configResult.getConfigByUnPostfix('valibot')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `valibot` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'] as const;

      const configResult = await computeEslintConfig({valibot: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('valibot')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `valibot` eslint config', async () => {
    const configResult = await computeEslintConfig({
      valibot: {
        overrides: {'valibot/no-unchecked-safe-parse': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleSeverities('valibot')).toMatchObject({
      'valibot/no-unchecked-safe-parse': 0,
      'no-console': 0,
    });
  });
});

describe('options', () => {
  describe('option: `allowedObjectSchemaTypes`', () => {
    it('disables `valibot/no-loose-object` rule by default', async () => {
      const configResult = await computeEslintConfig('valibot');

      expect(configResult.getRuleEntrySeverity('valibot', 'valibot/no-loose-object')).toBe(0);
    });

    it('enables `valibot/no-loose-object` rule with the rest of the types when some are disallowed via object', async () => {
      const configResult = await computeEslintConfig({
        valibot: {allowedObjectSchemaTypes: {looseObject: false}},
      });

      expect(configResult.getRuleEntry('valibot', 'valibot/no-loose-object')).toMatchInlineSnapshot(
        '[2, {"allow": ["object", "strictObject"]}]',
      );
    });

    it('disallows the types set to `undefined` via object in `valibot/no-loose-object` rule', async () => {
      const configResult = await computeEslintConfig({
        valibot: {allowedObjectSchemaTypes: {looseObject: undefined}},
      });

      expect(configResult.getRuleEntry('valibot', 'valibot/no-loose-object')).toMatchInlineSnapshot(
        '[2, {"allow": ["object", "strictObject"]}]',
      );
    });

    it('enables `valibot/no-loose-object` rule with the listed types when option is an array', async () => {
      const configResult = await computeEslintConfig({
        valibot: {allowedObjectSchemaTypes: ['strictObject', 'strictObject']},
      });

      expect(configResult.getRuleEntry('valibot', 'valibot/no-loose-object')).toMatchInlineSnapshot(
        '[2, {"allow": ["strictObject"]}]',
      );
    });

    it('disables `valibot/no-loose-object` rule when all types are listed in array', async () => {
      const configResult = await computeEslintConfig({
        valibot: {allowedObjectSchemaTypes: ['object', 'looseObject', 'strictObject']},
      });

      expect(configResult.getRuleEntrySeverity('valibot', 'valibot/no-loose-object')).toBe(0);
    });

    it('disables `valibot/no-loose-object` rule when option is an empty array', async () => {
      const configResult = await computeEslintConfig({valibot: {allowedObjectSchemaTypes: []}});

      expect(configResult.getRuleEntrySeverity('valibot', 'valibot/no-loose-object')).toBe(0);
    });

    it('disables `valibot/no-loose-object` rule when all types are disallowed', async () => {
      const configResult = await computeEslintConfig({
        valibot: {
          allowedObjectSchemaTypes: {object: false, looseObject: false, strictObject: false},
        },
      });

      expect(configResult.getRuleEntrySeverity('valibot', 'valibot/no-loose-object')).toBe(0);
    });

    it('`valibot/no-loose-object` rule fires on a disallowed object schema type', async () => {
      const results = await testEslintConfig(
        {valibot: {allowedObjectSchemaTypes: {looseObject: false}}},
        FIXTURES.looseObjectSchema,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.looseObjectSchema,
        'valibot/no-loose-object',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"Avoid Valibot looseObject() here. Allowed object schema constructors: object(), strictObject()."',
      );
    });
  });

  describe('option: `enforceConsistentImport`', () => {
    it('enforces namespace import in `valibot/consistent-import` rule by default', async () => {
      const configResult = await computeEslintConfig('valibot');

      expect(
        configResult.getRuleEntry('valibot', 'valibot/consistent-import'),
      ).toMatchInlineSnapshot('2');
    });

    it('enforces namespace import in `valibot/consistent-import` rule when option is `true`', async () => {
      const configResult = await computeEslintConfig({valibot: {enforceConsistentImport: true}});

      expect(
        configResult.getRuleEntry('valibot', 'valibot/consistent-import'),
      ).toMatchInlineSnapshot('2');
    });

    it('disables `valibot/consistent-import` rule when option is `false`', async () => {
      const configResult = await computeEslintConfig({valibot: {enforceConsistentImport: false}});

      expect(configResult.getRuleEntrySeverity('valibot', 'valibot/consistent-import')).toBe(0);
    });

    it('enforces namespace import in `valibot/consistent-import` rule when option is `namespace`', async () => {
      const configResult = await computeEslintConfig({
        valibot: {enforceConsistentImport: 'namespace'},
      });

      expect(
        configResult.getRuleEntry('valibot', 'valibot/consistent-import'),
      ).toMatchInlineSnapshot('[2, {"style": "namespace"}]');
    });

    it('enforces named imports in `valibot/consistent-import` rule when option is `named`', async () => {
      const configResult = await computeEslintConfig({valibot: {enforceConsistentImport: 'named'}});

      expect(
        configResult.getRuleEntry('valibot', 'valibot/consistent-import'),
      ).toMatchInlineSnapshot('[2, {"style": "named"}]');
    });

    it('passes the object to `valibot/consistent-import` rule as is', async () => {
      const RULE_OPTIONS = {namespaceAlias: 'valibot'} as const;

      const configResult = await computeEslintConfig({
        valibot: {enforceConsistentImport: RULE_OPTIONS},
      });

      expect(
        configResult.getRuleEntryOptions('valibot', 'valibot/consistent-import'),
      ).toStrictEqual([RULE_OPTIONS]);
    });

    it('`valibot/consistent-import` rule fires on named imports by default', async () => {
      const results = await testEslintConfig('valibot', FIXTURES.namedImport, import.meta.dirname);

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.namedImport,
        'valibot/consistent-import',
      );

      expect(error?.message).toMatchInlineSnapshot(
        `"Use a namespace Valibot import like \`import * as v from 'valibot'\`."`,
      );
    });

    it('`valibot/consistent-import` rule does not fire on named imports when option is `named`', async () => {
      const results = await testEslintConfig(
        {valibot: {enforceConsistentImport: 'named'}},
        FIXTURES.namedImport,
        import.meta.dirname,
      );

      expect(results[0]?.messages).toStrictEqual([]);
    });
  });

  describe('option: `schemaNamingConvention`', () => {
    it('disables `valibot/consistent-schema-convention` rule by default', async () => {
      const configResult = await computeEslintConfig('valibot');

      expect(
        configResult.getRuleEntrySeverity('valibot', 'valibot/consistent-schema-convention'),
      ).toBe(0);
    });

    it('disables `valibot/consistent-schema-convention` rule when option is `false`', async () => {
      const configResult = await computeEslintConfig({valibot: {schemaNamingConvention: false}});

      expect(
        configResult.getRuleEntrySeverity('valibot', 'valibot/consistent-schema-convention'),
      ).toBe(0);
    });

    it('enables `valibot/consistent-schema-convention` rule with its defaults when option is `true`', async () => {
      const configResult = await computeEslintConfig({valibot: {schemaNamingConvention: true}});

      expect(
        configResult.getRuleEntry('valibot', 'valibot/consistent-schema-convention'),
      ).toMatchInlineSnapshot('2');
    });

    it('enforces the suffix convention in `valibot/consistent-schema-convention` rule when option is `suffix`', async () => {
      const configResult = await computeEslintConfig({valibot: {schemaNamingConvention: 'suffix'}});

      expect(
        configResult.getRuleEntry('valibot', 'valibot/consistent-schema-convention'),
      ).toMatchInlineSnapshot('[2, {"convention": "suffix"}]');
    });

    it('enforces the same name convention in `valibot/consistent-schema-convention` rule when option is `sameName`', async () => {
      const configResult = await computeEslintConfig({
        valibot: {schemaNamingConvention: 'sameName'},
      });

      expect(
        configResult.getRuleEntry('valibot', 'valibot/consistent-schema-convention'),
      ).toMatchInlineSnapshot('[2, {"convention": "same-name"}]');
    });

    it('passes the object to `valibot/consistent-schema-convention` rule as is', async () => {
      const RULE_OPTIONS = {scope: 'all', schemaSuffix: 'Validator'} as const;

      const configResult = await computeEslintConfig({
        valibot: {schemaNamingConvention: RULE_OPTIONS},
      });

      expect(
        configResult.getRuleEntryOptions('valibot', 'valibot/consistent-schema-convention'),
      ).toStrictEqual([RULE_OPTIONS]);
    });

    it('`valibot/consistent-schema-convention` rule fires on an exported schema without suffix when option is `suffix`', async () => {
      const results = await testEslintConfig(
        {valibot: {schemaNamingConvention: 'suffix'}},
        FIXTURES.exportedSchemaWithoutSuffix,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.exportedSchemaWithoutSuffix,
        'valibot/consistent-schema-convention',
      );

      expect(error?.message).toMatchInlineSnapshot(
        `"Rename this schema binding to 'UserSchema' to follow the 'suffix' naming convention."`,
      );
    });

    it('`valibot/consistent-schema-convention` rule does not fire on an exported schema without suffix when option is `sameName`', async () => {
      const results = await testEslintConfig(
        {valibot: {schemaNamingConvention: 'sameName'}},
        FIXTURES.exportedSchemaWithoutSuffix,
        import.meta.dirname,
      );

      expect(results[0]?.messages).toStrictEqual([]);
    });
  });
});

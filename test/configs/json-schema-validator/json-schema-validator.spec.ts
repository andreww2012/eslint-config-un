const FIXTURES = {
  objectWithoutName: 'object-without-name.json',
} as const;

describe('basic tests', () => {
  it('creates `json-schema-validator/js-ts` eslint config and loads `json-schema-validator` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('jsonSchemaValidator');

    const config = configResult.getConfigByUnPostfix('json-schema-validator/js-ts');

    expect(config).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot('["**/*.?([cm])[jt]s?(x)"]');
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('json-schema-validator')).toBeDefined();
  });

  it('does not create `json-schema-validator/js-ts` eslint config and does not load `json-schema-validator` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({jsonSchemaValidator: false});

    expect(configResult.getConfigByUnPostfix('json-schema-validator/js-ts')).toBeUndefined();
    expect(configResult.getLoadedPlugin('json-schema-validator')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `json-schema-validator/js-ts` eslint config', async () => {
      await expectConfigState({}, 'json-schema-validator/js-ts', false);
    });

    it('creates `json-schema-validator/js-ts` eslint config if explicitly enabled', async () => {
      await expectConfigState('jsonSchemaValidator', 'json-schema-validator/js-ts', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `json-schema-validator/js-ts` eslint config', async () => {
      await expectConfigState({}, 'json-schema-validator/js-ts', false, 'default');
    });

    it('creates `json-schema-validator/js-ts` eslint config if explicitly enabled', async () => {
      await expectConfigState(
        'jsonSchemaValidator',
        'json-schema-validator/js-ts',
        true,
        'default',
      );
    });

    it('does not create `json-schema-validator/js-ts` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {jsonSchemaValidator: false},
        'json-schema-validator/js-ts',
        ['jsonSchemaValidator', false],
        'default',
      );
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `json-schema-validator/js-ts` eslint config', async () => {
      await expectConfigState({}, 'json-schema-validator/js-ts', true, 'misc-enabled');
    });

    it('creates `json-schema-validator/js-ts` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState(
        'jsonSchemaValidator',
        'json-schema-validator/js-ts',
        ['jsonSchemaValidator', true],
        'misc-enabled',
      );
    });

    it('does not create `json-schema-validator/js-ts` eslint config if explicitly disabled', async () => {
      await expectConfigState(
        {jsonSchemaValidator: false},
        'json-schema-validator/js-ts',
        false,
        'misc-enabled',
      );
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('jsonSchemaValidator');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('json-schema-validator/js-ts')).toMatchObject({
      'json-schema-validator/no-invalid': 2,
    });
  });

  it('`json-schema-validator/no-invalid` rule fires on a JSON file with a local-schema violation', async () => {
    const results = await testEslintConfig(
      'jsonSchemaValidator',
      FIXTURES.objectWithoutName,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.objectWithoutName,
      'json-schema-validator/no-invalid',
    );

    expect(error?.message).toMatchInlineSnapshot(`"Root must have required property 'name'."`);
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `json-schema-validator/js-ts` eslint config', async () => {
      const FILES = ['src/**/*.js'];

      const configResult = await computeEslintConfig({jsonSchemaValidator: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('json-schema-validator/js-ts')?.files).toStrictEqual(
        FILES,
      );
    });

    it('disables `json-schema-validator/js-ts` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({jsonSchemaValidator: {files: []}});

      expect(configResult.getConfigByUnPostfix('json-schema-validator/js-ts')).toBeUndefined();
    });

    it('does not disable json/yaml/toml sub-configs when set to empty array', async () => {
      const configResult = await computeEslintConfig({jsonSchemaValidator: {files: []}});

      expect(configResult.getConfigByUnPostfix('json-schema-validator/json')).toBeDefined();
      expect(configResult.getConfigByUnPostfix('json-schema-validator/yaml')).toBeDefined();
      expect(configResult.getConfigByUnPostfix('json-schema-validator/toml')).toBeDefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `json-schema-validator/js-ts` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({jsonSchemaValidator: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('json-schema-validator/js-ts')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `json-schema-validator/js-ts` eslint config', async () => {
    const configResult = await computeEslintConfig({
      jsonSchemaValidator: {
        overrides: {'json-schema-validator/no-invalid': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      configResult.getRuleEntrySeverity(
        'json-schema-validator/js-ts',
        'json-schema-validator/no-invalid',
      ),
    ).toBe(0);
    expect(configResult.getRuleEntrySeverity('json-schema-validator/js-ts', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set `json-schema-validator` settings by default', async () => {
      const configResult = await computeEslintConfig('jsonSchemaValidator');
      const config = configResult.getConfigByUnPostfix('json-schema-validator/js-ts');

      expect(config?.settings?.['json-schema-validator']).toBeUndefined();
    });

    it('sets `json-schema-validator` settings when provided', async () => {
      const SETTINGS = {http: {requestOptions: {timeout: 5000}}} as const;

      const configResult = await computeEslintConfig('jsonSchemaValidator', {
        un: {plugins: {'json-schema-validator': {settings: SETTINGS}}},
      });
      const config = configResult.getConfigByUnPostfix('json-schema-validator/js-ts');

      expect(config?.settings?.['json-schema-validator']).toStrictEqual(SETTINGS);
    });

    it('propagates `json-schema-validator` settings to json/yaml/toml sub-configs', async () => {
      const SETTINGS = {http: {requestOptions: {timeout: 5000}}} as const;

      const configResult = await computeEslintConfig('jsonSchemaValidator', {
        un: {plugins: {'json-schema-validator': {settings: SETTINGS}}},
      });

      expect(
        configResult.getConfigByUnPostfix('json-schema-validator/json')?.settings?.[
          'json-schema-validator'
        ],
      ).toStrictEqual(SETTINGS);
      expect(
        configResult.getConfigByUnPostfix('json-schema-validator/yaml')?.settings?.[
          'json-schema-validator'
        ],
      ).toStrictEqual(SETTINGS);
      expect(
        configResult.getConfigByUnPostfix('json-schema-validator/toml')?.settings?.[
          'json-schema-validator'
        ],
      ).toStrictEqual(SETTINGS);
    });
  });
});

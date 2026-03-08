const FIXTURES = {
  invalidJson: 'invalid.json',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('jsonSchemaValidator');

  it('loads `json-schema-validator` plugin if used', () => {
    expect(configResult.getLoadedPlugin('json-schema-validator')).toBeDefined();
  });

  it('creates `json-schema-validator/js-ts` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('json-schema-validator/js-ts')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `json-schema-validator/js-ts` eslint config', async () => {
      const configResult = await computeEslintConfig({});

      expect(configResult.getConfigByUnPostfix('json-schema-validator/js-ts')).toBeUndefined();
    });

    it('creates `json-schema-validator/js-ts` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig('jsonSchemaValidator');

      expect(configResult.getConfigByUnPostfix('json-schema-validator/js-ts')).toBeDefined();
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `json-schema-validator/js-ts` eslint config', async () => {
      const configResult = await computeEslintConfig({}, {reset: true});

      expect(configResult.getConfigByUnPostfix('json-schema-validator/js-ts')).toBeUndefined();
    });

    it('creates `json-schema-validator/js-ts` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig('jsonSchemaValidator', {reset: true});

      expect(configResult.getConfigByUnPostfix('json-schema-validator/js-ts')).toBeDefined();
    });

    it('does not create `json-schema-validator/js-ts` eslint config and prints a warning if explicitly disabled', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      const configResult = await computeEslintConfig({jsonSchemaValidator: false}, {reset: true});

      expect(configResult.getConfigByUnPostfix('json-schema-validator/js-ts')).toBeUndefined();

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          `[warn] [eslint-config-un] There is no need to disable \`jsonSchemaValidator\` config because this is the default`,
        ),
      ).toBe(true);
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `json-schema-validator/js-ts` eslint config', async () => {
      const configResult = await computeEslintConfig(
        {},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(configResult.getConfigByUnPostfix('json-schema-validator/js-ts')).toBeDefined();
    });
  });

  it('has default `files` in `json-schema-validator/js-ts` eslint config', () => {
    expect(
      configResult.getConfigByUnPostfix('json-schema-validator/js-ts')?.files,
    ).toMatchInlineSnapshot(`["**/*.?([cm])[jt]s?(x)"]`);
  });

  it('has default `ignores` in `json-schema-validator/js-ts` eslint config', () => {
    const ignores = configResult.getConfigByUnPostfix('json-schema-validator/js-ts')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('jsonSchemaValidator');

  it('enables `json-schema-validator/no-invalid` rule by default in `json-schema-validator/js-ts`', () => {
    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry(
          'json-schema-validator/js-ts',
          'json-schema-validator/no-invalid',
        ),
      ),
    ).toBe(2);
  });

  it('`json-schema-validator/no-invalid` rule fires on a JSON file with a local-schema violation', async () => {
    const results = await testEslintConfig(
      'jsonSchemaValidator',
      FIXTURES.invalidJson,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.invalidJson,
      'json-schema-validator/no-invalid',
    );

    expect(error?.message).toMatchInlineSnapshot(`"Root must have required property 'name'."`);
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `json-schema-validator/js-ts` eslint config', async () => {
      const FILES = ['src/**/*.js'];
      const configResult = await computeEslintConfig({
        jsonSchemaValidator: {files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('json-schema-validator/js-ts')?.files).toStrictEqual(
        FILES,
      );
    });

    it('disables `json-schema-validator/js-ts` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        jsonSchemaValidator: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('json-schema-validator/js-ts')).toBeUndefined();
    });

    it('does not disable json/yaml/toml sub-configs when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        jsonSchemaValidator: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('json-schema-validator/json')).toBeDefined();
      expect(configResult.getConfigByUnPostfix('json-schema-validator/yaml')).toBeDefined();
      expect(configResult.getConfigByUnPostfix('json-schema-validator/toml')).toBeDefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `json-schema-validator/js-ts` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        jsonSchemaValidator: {ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix('json-schema-validator/js-ts')?.ignores;

      expect(ignores).to.include.members(IGNORES);
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
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry(
          'json-schema-validator/js-ts',
          'json-schema-validator/no-invalid',
        ),
      ),
    ).toBe(0);

    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('json-schema-validator/js-ts', 'no-console'),
      ),
    ).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `json-schema-validator/js-ts` eslint config', async () => {
      const configResult = await computeEslintConfig({
        jsonSchemaValidator: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(
          configResult.getConfigByUnPostfix('json-schema-validator/js-ts'),
          (ruleName) => ruleName.startsWith('json-schema-validator/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `json-schema-validator/js-ts` eslint config', async () => {
      const configResult = await computeEslintConfig({
        jsonSchemaValidator: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(
          configResult.getConfigByUnPostfix('json-schema-validator/js-ts'),
          (ruleName) => ruleName.startsWith('json-schema-validator/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set `json-schema-validator` settings when not provided', async () => {
      const configResult = await computeEslintConfig('jsonSchemaValidator');
      const config = configResult.getConfigByUnPostfix('json-schema-validator/js-ts');

      expect(config?.settings?.['json-schema-validator']).toBeUndefined();
    });

    it('sets `json-schema-validator` settings when provided', async () => {
      const SETTINGS = {http: {requestOptions: {timeout: 5000}}} as const;

      const configResult = await computeEslintConfig({
        jsonSchemaValidator: {settings: SETTINGS},
      });
      const config = configResult.getConfigByUnPostfix('json-schema-validator/js-ts');

      expect(config?.settings?.['json-schema-validator']).toStrictEqual(SETTINGS);
    });

    it('propagates `json-schema-validator` settings to json/yaml/toml sub-configs', async () => {
      const SETTINGS = {http: {requestOptions: {timeout: 5000}}} as const;

      const configResult = await computeEslintConfig({
        jsonSchemaValidator: {settings: SETTINGS},
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

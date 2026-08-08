const FIXTURES = {
  missingHeader: 'missing-header.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('headers');

  it('loads `headers` plugin if used', () => {
    expect(configResult.getLoadedPlugin('headers')).toBeDefined();
  });

  it('creates `headers` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('headers')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `headers` eslint config', async () => {
      await expectConfigState({}, 'headers', false);
    });

    it('creates `headers` eslint config if explicitly enabled', async () => {
      await expectConfigState('headers', 'headers', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `headers` eslint config', async () => {
      await expectConfigState({}, 'headers', false, 'default');
    });

    it('creates `headers` eslint config if explicitly enabled', async () => {
      await expectConfigState('headers', 'headers', true, 'default');
    });

    it('does not create `headers` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({headers: false}, 'headers', ['headers', false], 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `headers` eslint config', async () => {
      await expectConfigState({}, 'headers', false, 'misc-enabled');
    });

    it('creates `headers` eslint config if explicitly enabled', async () => {
      await expectConfigState({headers: true}, 'headers', true, 'misc-enabled');
    });

    it('does not create `headers` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({headers: false}, 'headers', ['headers', false], 'misc-enabled');
    });
  });

  it('has no explicit `files` restriction in `headers` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('headers')?.files).toBeUndefined();
  });

  it('has default `ignores` in `headers` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('headers')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('headers');

  it('enables `headers/header-format` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('headers', 'headers/header-format')).toBe(2);
  });

  it('`headers/header-format` rule fires on a file missing the required header', async () => {
    const results = await testEslintConfig(
      {headers: {options: {source: 'string', content: 'Copyright Acme'}}},
      FIXTURES.missingHeader,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.missingHeader,
      'headers/header-format',
    );

    expect(error?.message).toMatchInlineSnapshot('"No header found."');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `headers` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({headers: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('headers')?.files).toStrictEqual(FILES);
    });

    it('disables `headers` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({headers: {files: []}});

      expect(configResult.getConfigByUnPostfix('headers')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `headers` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({headers: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('headers')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `headers` eslint config', async () => {
    const configResult = await computeEslintConfig({
      headers: {overrides: {'headers/header-format': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('headers', 'headers/header-format')).toBe(0);
    expect(configResult.getRuleEntrySeverity('headers', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `options`', () => {
    it('does not pass extra options to `headers/header-format` rule by default', async () => {
      const configResult = await computeEslintConfig('headers');

      expect(configResult.getRuleEntryOptions('headers', 'headers/header-format')).toStrictEqual(
        [],
      );
    });

    it('passes provided options to `headers/header-format` rule when `options` is set', async () => {
      const OPTIONS = {source: 'string' as const, content: 'Copyright'};

      const configResult = await computeEslintConfig({
        headers: {options: OPTIONS},
      });

      expect(configResult.getRuleEntryOptions('headers', 'headers/header-format')).toStrictEqual([
        OPTIONS,
      ]);
    });
  });
});

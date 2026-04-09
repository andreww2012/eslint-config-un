const FIXTURES = {
  namedZodImport: 'named-zod-import.js',
} as const;

describe('basic tests', () => {
  it('creates `import-zod` eslint config and loads `import-zod` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('importZod');

    const config = configResult.getConfigByUnPostfix('import-zod');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();

    expect(configResult.getLoadedPlugin('import-zod')).toBeDefined();
  });

  it('does not create `import-zod` eslint config and does not load `import-zod` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({importZod: false});

    expect(configResult.getConfigByUnPostfix('import-zod')).toBeUndefined();

    expect(configResult.getLoadedPlugin('import-zod')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `import-zod` eslint config', async () => {
      await expectConfigState({}, 'import-zod', false);
    });

    it('creates `import-zod` eslint config if explicitly enabled', async () => {
      await expectConfigState('importZod', 'import-zod', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `import-zod` eslint config', async () => {
      await expectConfigState({}, 'import-zod', false, 'default');
    });

    it('creates `import-zod` eslint config if explicitly enabled', async () => {
      await expectConfigState('importZod', 'import-zod', true, 'default');
    });

    it('does not create `import-zod` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({importZod: false}, 'import-zod', ['importZod', false], 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `import-zod` eslint config', async () => {
      await expectConfigState({}, 'import-zod', false, 'misc-enabled');
    });

    it('creates `import-zod` eslint config if explicitly enabled', async () => {
      await expectConfigState({importZod: true}, 'import-zod', true, 'misc-enabled');
    });

    it('does not create `import-zod` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {importZod: false},
        'import-zod',
        ['importZod', false],
        'misc-enabled',
      );
    });
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig('importZod');

    expect(configResult.getRuleSeverities('import-zod')).toMatchObject({
      'import-zod/prefer-zod-namespace': 2,
    });
  });

  it('`import-zod/prefer-zod-namespace` rule fires on named zod import', async () => {
    const results = await testEslintConfig(
      'importZod',
      FIXTURES.namedZodImport,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.namedZodImport,
      'import-zod/prefer-zod-namespace',
    );

    expect(error?.message).toMatchInlineSnapshot(
      `"Import zod as a namespace (import * as z from "zod") instead of destructuring its exports or using default imports"`,
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `import-zod` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({importZod: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('import-zod')?.files).toStrictEqual(FILES);
    });

    it('disables `import-zod` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({importZod: {files: []}});

      expect(configResult.getConfigByUnPostfix('import-zod')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `import-zod` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({importZod: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('import-zod')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `import-zod` eslint config', async () => {
    const configResult = await computeEslintConfig({
      importZod: {
        overrides: {'import-zod/prefer-zod-namespace': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleSeverities('import-zod')).toMatchObject({
      'import-zod/prefer-zod-namespace': 0,
      'no-console': 0,
    });
  });
});

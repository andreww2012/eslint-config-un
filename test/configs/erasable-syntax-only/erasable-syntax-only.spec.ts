const FIXTURES = {
  enum: 'enum.ts',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('erasableSyntaxOnly');

  it('loads `erasable-syntax-only` plugin if used', () => {
    expect(configResult.getLoadedPlugin('erasable-syntax-only')).toBeDefined();
  });

  it('creates `erasable-syntax-only` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('erasable-syntax-only')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `erasable-syntax-only` eslint config', async () => {
      await expectConfigState({}, 'erasable-syntax-only', false);
    });

    it('creates `erasable-syntax-only` eslint config if explicitly enabled', async () => {
      await expectConfigState('erasableSyntaxOnly', 'erasable-syntax-only', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `erasable-syntax-only` eslint config', async () => {
      await expectConfigState({}, 'erasable-syntax-only', false, 'default');
    });

    it('creates `erasable-syntax-only` eslint config if explicitly enabled', async () => {
      await expectConfigState('erasableSyntaxOnly', 'erasable-syntax-only', true, 'default');
    });

    it('does not create `erasable-syntax-only` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {erasableSyntaxOnly: false},
        'erasable-syntax-only',
        ['erasableSyntaxOnly', false],
        'default',
      );
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `erasable-syntax-only` eslint config', async () => {
      await expectConfigState({}, 'erasable-syntax-only', false, 'misc-enabled');
    });

    it('creates `erasable-syntax-only` eslint config if explicitly enabled', async () => {
      await expectConfigState(
        {erasableSyntaxOnly: true},
        'erasable-syntax-only',
        true,
        'misc-enabled',
      );
    });

    it('does not create `erasable-syntax-only` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {erasableSyntaxOnly: false},
        'erasable-syntax-only',
        ['erasableSyntaxOnly', false],
        'misc-enabled',
      );
    });
  });

  it('has default `files` in `erasable-syntax-only` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('erasable-syntax-only')?.files).toMatchInlineSnapshot(
      '["**/*.?([cm])ts?(x)"]',
    );
  });

  it('has default `ignores` in `erasable-syntax-only` eslint config', () => {
    expect(
      configResult.getConfigByUnPostfix('erasable-syntax-only')?.ignores?.length,
    ).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('erasableSyntaxOnly');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('erasable-syntax-only')).toMatchObject({
      'erasable-syntax-only/enums': 2,
      'erasable-syntax-only/import-aliases': 2,
    });
  });

  it('`erasable-syntax-only/enums` rule does not fire without `ts` config (file fails to parse)', async () => {
    const results = await testEslintConfig(
      {erasableSyntaxOnly: true},
      FIXTURES.enum,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.enum,
      'erasable-syntax-only/enums',
    );

    expect(error?.message).toMatchInlineSnapshot(`"Parsing error: The keyword 'enum' is reserved"`);
  });

  it('`erasable-syntax-only/enums` rule fires on a file with a TypeScript enum', async () => {
    const results = await testEslintConfig(
      {erasableSyntaxOnly: true, ts: true},
      FIXTURES.enum,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.enum,
      'erasable-syntax-only/enums',
    );

    expect(error?.message).toMatchInlineSnapshot(
      `"This enum will not be allowed under TypeScript's --erasableSyntaxOnly."`,
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `erasable-syntax-only` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({erasableSyntaxOnly: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('erasable-syntax-only')?.files).toStrictEqual(FILES);
    });

    it('disables `erasable-syntax-only` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({erasableSyntaxOnly: {files: []}});

      expect(configResult.getConfigByUnPostfix('erasable-syntax-only')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `erasable-syntax-only` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({erasableSyntaxOnly: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('erasable-syntax-only')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `erasable-syntax-only` eslint config', async () => {
    const configResult = await computeEslintConfig({
      erasableSyntaxOnly: {
        overrides: {'erasable-syntax-only/enums': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      configResult.getRuleEntrySeverity('erasable-syntax-only', 'erasable-syntax-only/enums'),
    ).toBe(0);
    expect(configResult.getRuleEntrySeverity('erasable-syntax-only', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `allowedSyntax`', () => {
    describe('`enums`', () => {
      it('disables `erasable-syntax-only/enums` rule when `allowedSyntax.enums` is `true`', async () => {
        const configResult = await computeEslintConfig({
          erasableSyntaxOnly: {allowedSyntax: {enums: true}},
        });

        expect(
          configResult.getRuleEntrySeverity('erasable-syntax-only', 'erasable-syntax-only/enums'),
        ).toBe(0);
      });

      it('enables `erasable-syntax-only/enums` rule when `allowedSyntax.enums` is `false` (default)', async () => {
        const configResult = await computeEslintConfig({
          erasableSyntaxOnly: {allowedSyntax: {enums: false}},
        });

        expect(
          configResult.getRuleEntrySeverity('erasable-syntax-only', 'erasable-syntax-only/enums'),
        ).toBe(2);
      });
    });

    describe('`importAliases`', () => {
      it('disables `erasable-syntax-only/import-aliases` rule when `allowedSyntax.importAliases` is `true`', async () => {
        const configResult = await computeEslintConfig({
          erasableSyntaxOnly: {allowedSyntax: {importAliases: true}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'erasable-syntax-only',
            'erasable-syntax-only/import-aliases',
          ),
        ).toBe(0);
      });

      it('enables `erasable-syntax-only/import-aliases` rule when `allowedSyntax.importAliases` is `false` (default)', async () => {
        const configResult = await computeEslintConfig({
          erasableSyntaxOnly: {allowedSyntax: {importAliases: false}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'erasable-syntax-only',
            'erasable-syntax-only/import-aliases',
          ),
        ).toBe(2);
      });
    });

    describe('`namespaces`', () => {
      it('disables `erasable-syntax-only/namespaces` rule when `allowedSyntax.namespaces` is `true`', async () => {
        const configResult = await computeEslintConfig({
          erasableSyntaxOnly: {allowedSyntax: {namespaces: true}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'erasable-syntax-only',
            'erasable-syntax-only/namespaces',
          ),
        ).toBe(0);
      });

      it('enables `erasable-syntax-only/namespaces` rule when `allowedSyntax.namespaces` is `false` (default)', async () => {
        const configResult = await computeEslintConfig({
          erasableSyntaxOnly: {allowedSyntax: {namespaces: false}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'erasable-syntax-only',
            'erasable-syntax-only/namespaces',
          ),
        ).toBe(2);
      });
    });

    describe('`parameterProperties`', () => {
      it('disables `erasable-syntax-only/parameter-properties` rule when `allowedSyntax.parameterProperties` is `true`', async () => {
        const configResult = await computeEslintConfig({
          erasableSyntaxOnly: {allowedSyntax: {parameterProperties: true}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'erasable-syntax-only',
            'erasable-syntax-only/parameter-properties',
          ),
        ).toBe(0);
      });

      it('enables `erasable-syntax-only/parameter-properties` rule when `allowedSyntax.parameterProperties` is `false` (default)', async () => {
        const configResult = await computeEslintConfig({
          erasableSyntaxOnly: {allowedSyntax: {parameterProperties: false}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'erasable-syntax-only',
            'erasable-syntax-only/parameter-properties',
          ),
        ).toBe(2);
      });
    });
  });
});

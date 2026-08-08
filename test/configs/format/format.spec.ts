const FIXTURES = {
  doubleQuotes: 'double-quotes.js',
  markdownListWithAsterisk: 'markdown-list-with-asterisk.md',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('format');

  it('loads `format` plugin if used', () => {
    expect(configResult.getLoadedPlugin('format')).toBeDefined();
  });

  it('creates `format/prettier` eslint config and does not create other `format/*` eslint configs', () => {
    expect(configResult.getConfigByUnPostfix('format/prettier')).toBeDefined();
    expect(
      configResult.getConfigsByUnPostfix(
        (configName) => configName.startsWith('format/') && configName !== 'format/prettier',
      ),
    ).toBeEmpty();
  });

  it('supports array notation to create multiple format eslint configs', async () => {
    const configResult = await computeEslintConfig({
      format: [{formatter: 'prettier'}, {formatter: ['dprint', {language: 'typescript'}]}],
    });

    expect(configResult.getConfigByUnPostfix('format/prettier#0')).toBeDefined();
    expect(configResult.getConfigByUnPostfix('format/dprint#1')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `format/prettier` eslint config', async () => {
      await expectConfigState({}, 'format/prettier', false);
    });

    it('creates `format/prettier` eslint config if explicitly enabled', async () => {
      await expectConfigState('format', 'format/prettier', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `format/prettier` eslint config', async () => {
      await expectConfigState({}, 'format/prettier', false, 'default');
    });

    it('creates `format/prettier` eslint config if explicitly enabled', async () => {
      await expectConfigState('format', 'format/prettier', true, 'default');
    });

    it('does not create `format/prettier` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({format: false}, 'format/prettier', ['format', false], 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `format/prettier` eslint config', async () => {
      await expectConfigState({}, 'format/prettier', false, 'misc-enabled');
    });

    it('creates `format/prettier` eslint config if explicitly enabled', async () => {
      await expectConfigState({format: true}, 'format/prettier', true, 'misc-enabled');
    });

    it('does not create `format/prettier` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {format: false},
        'format/prettier',
        ['format', false],
        'misc-enabled',
      );
    });
  });

  it('has no explicit `files` restriction in `format/prettier` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('format/prettier')?.files).toBeUndefined();
  });

  it('has no `ignores` in `format/prettier` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('format/prettier')?.ignores).toBeUndefined();
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('format');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('format/prettier')).toMatchObject({
      'format/prettier': 2,
    });
  });

  it('enables only `format/prettier` rule by default', () => {
    expect(configResult.getConfigByUnPostfix('format/prettier')?.rules).toMatchInlineSnapshot(
      '{"format/prettier": 2}',
    );
  });

  it('`format/prettier` rule fires on a file with double quotes', async () => {
    const results = await testEslintConfig(
      {format: {formatter: ['prettier', {singleQuote: true, parser: 'babel'}]}},
      FIXTURES.doubleQuotes,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(results, FIXTURES.doubleQuotes, 'format/prettier');

    expect(error?.message).toMatchInlineSnapshot(`"Replace \`"hello"\` with \`'hello'\`"`);
  });

  it('`format/oxfmt` rule fires on a file with double quotes', async () => {
    const results = await testEslintConfig(
      {format: {formatter: ['oxfmt', {singleQuote: true, parser: 'babel'}]}},
      FIXTURES.doubleQuotes,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(results, FIXTURES.doubleQuotes, 'format/oxfmt');

    expect(error?.message).toMatchInlineSnapshot(`"Replace \`"hello"\` with \`'hello'\`"`);
  });

  it('`format/dprint` rule fires on a file with unformatted markdown', async () => {
    const results = await testEslintConfig(
      {
        format: {
          files: ['**/*.md'],
          formatter: ['dprint', {language: 'markdown'}],
          usePlainParser: true,
        },
      },
      FIXTURES.markdownListWithAsterisk,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.markdownListWithAsterisk,
      'format/dprint',
    );

    expect(error?.message).toMatchInlineSnapshot('"Replace `*` with `-`"');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `format/prettier` eslint config', async () => {
      const FILES = ['**/*.js'];

      const configResult = await computeEslintConfig({format: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('format/prettier')?.files).toStrictEqual(FILES);
    });

    it('disables `format/prettier` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({format: {files: []}});

      expect(configResult.getConfigByUnPostfix('format/prettier')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `format/prettier` eslint config', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({format: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('format/prettier')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
    });
  });

  it('respects `overrides` and `overridesAny` in `format/prettier` eslint config', async () => {
    const configResult = await computeEslintConfig({
      format: {overrides: {'format/prettier': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('format/prettier', 'format/prettier')).toBe(0);
    expect(configResult.getRuleEntrySeverity('format/prettier', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `formatter`', () => {
    it('defaults to `prettier` and creates `format/prettier` eslint config', async () => {
      const configResult = await computeEslintConfig('format');

      expect(configResult.getConfigByUnPostfix('format/prettier')).toBeDefined();
    });

    it('creates `format/prettier` eslint config when `formatter` is set to `prettier`', async () => {
      const configResult = await computeEslintConfig({format: {formatter: 'prettier'}});

      expect(configResult.getConfigByUnPostfix('format/prettier')).toBeDefined();
    });

    it('creates `format/dprint` eslint config when `formatter` is set to `dprint`', async () => {
      const configResult = await computeEslintConfig({
        format: {formatter: ['dprint', {language: 'typescript'}]},
      });

      expect(configResult.getConfigByUnPostfix('format/dprint')).toBeDefined();
      expect(configResult.getRuleEntrySeverity('format/dprint', 'format/dprint')).toBe(2);
      expect(configResult.getRuleEntrySeverity('format/dprint', 'format/prettier')).toBe(0);
      expect(configResult.getRuleEntrySeverity('format/dprint', 'format/oxfmt')).toBe(0);
    });

    it('creates `format/oxfmt` eslint config when `formatter` is set to `oxfmt`', async () => {
      const configResult = await computeEslintConfig({format: {formatter: 'oxfmt'}});

      expect(configResult.getConfigByUnPostfix('format/oxfmt')).toBeDefined();
      expect(configResult.getRuleEntrySeverity('format/oxfmt', 'format/oxfmt')).toBe(2);
      expect(configResult.getRuleEntrySeverity('format/oxfmt', 'format/prettier')).toBe(0);
      expect(configResult.getRuleEntrySeverity('format/oxfmt', 'format/dprint')).toBe(0);
    });

    it("passes options to `format/oxfmt` rule when `formatter` is `['oxfmt', options]`", async () => {
      const OPTIONS = {printWidth: 100};

      const configResult = await computeEslintConfig({
        format: {formatter: ['oxfmt', OPTIONS]},
      });

      expect(configResult.getRuleEntryOptions('format/oxfmt', 'format/oxfmt')).toStrictEqual([
        OPTIONS,
      ]);
    });

    it("passes options to `format/prettier` rule when `formatter` is `['prettier', options]`", async () => {
      const OPTIONS = {singleQuote: false, printWidth: 120};

      const configResult = await computeEslintConfig({
        format: {formatter: ['prettier', OPTIONS]},
      });

      expect(configResult.getRuleEntryOptions('format/prettier', 'format/prettier')).toStrictEqual([
        OPTIONS,
      ]);
    });

    it("passes options to `format/dprint` rule when `formatter` is `['dprint', options]`", async () => {
      const OPTIONS = {
        plugins: [],
        typescript: 'https://plugins.dprint.dev/typescript-0.93.0.wasm',
      };

      const configResult = await computeEslintConfig({
        format: {formatter: ['dprint', OPTIONS]},
      });

      expect(configResult.getRuleEntryOptions('format/dprint', 'format/dprint')).toStrictEqual([
        OPTIONS,
      ]);
    });
  });

  describe('option: `usePlainParser`', () => {
    it('does not set `eslint-parser-plain` parser by default', async () => {
      const configResult = await computeEslintConfig('format');

      expect(
        configResult.getConfigByUnPostfix('format/prettier')?.languageOptions?.['parser'],
      ).toBeUndefined();
    });

    it('sets `eslint-parser-plain` parser when set to `true`', async () => {
      const configResult = await computeEslintConfig({format: {usePlainParser: true}});

      expect(
        configResult.getConfigByUnPostfix('format/prettier')?.languageOptions?.['parser'],
      ).toBeDefined();
    });
  });
});

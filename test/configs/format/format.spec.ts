const FIXTURES = {
  doubleQuotes: 'double-quotes.js',
  doubleQuotesNextToPrettierConfig: 'prettier-config/double-quotes.js',
  markdownListWithAsterisk: 'markdown-list-with-asterisk.md',
  unclosedCssBlock: 'unclosed-block.css',
  xml: 'element.xml',
} as const;

beforeEach(() => {
  addInstalledPackages({prettier: '3.9.9'});
});

describe('basic tests', () => {
  it('creates only the `format/prettier` eslint config and loads `format` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('format');

    const config = configResult.getConfigByUnPostfix('format/prettier');

    expect(config).toBeDefined();
    expect(
      configResult.getConfigsByUnPostfix(
        (configName) => configName.startsWith('format/') && configName !== 'format/prettier',
      ),
    ).toBeEmpty();
    expect(config?.files).toBeUndefined();
    expect(config?.ignores).toBeUndefined();

    expect(configResult.getLoadedPlugin('format')).toBeDefined();
  });

  it('does not create any `format/*` eslint config and does not load `format` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({format: false});

    expect(
      configResult.getConfigsByUnPostfix((configName) => configName.startsWith('format/')),
    ).toBeEmpty();

    expect(configResult.getLoadedPlugin('format')).toBeUndefined();
  });

  it('supports array notation to create multiple format eslint configs', async () => {
    addInstalledPackages({'@dprint/formatter': '0.5.1'});

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
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig('format');

    expect(configResult.getRuleSeverities('format/prettier')).toMatchObject({
      'format/prettier': 2,
    });
  });

  it('enables only `format/prettier` rule by default', async () => {
    const configResult = await computeEslintConfig('format');

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

  it('`format/prettier` rule reads the Prettier config applying to the file', async () => {
    const results = await testEslintConfig(
      'format',
      FIXTURES.doubleQuotesNextToPrettierConfig,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.doubleQuotesNextToPrettierConfig,
      'format/prettier',
    );

    expect(error?.message).toMatchInlineSnapshot(`"Replace \`"hello"\` with \`'hello'\`"`);
  });

  it('`format/prettier` rule reports a parsing error of the formatter', async () => {
    const results = await testEslintConfig(
      {format: {files: ['**/*.css'], usePlainParser: true}},
      FIXTURES.unclosedCssBlock,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.unclosedCssBlock,
      'format/prettier',
    );

    expect(error?.message).toMatchInlineSnapshot('"Parsing error: CssSyntaxError: Unclosed block"');
    expect(error?.line).toBe(1);
  });

  it('`format/oxfmt` rule fires on a file with double quotes', async () => {
    addInstalledPackages({oxfmt: '0.72.0'});

    const results = await testEslintConfig(
      {format: {formatter: ['oxfmt', {singleQuote: true, parser: 'babel'}]}},
      FIXTURES.doubleQuotes,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(results, FIXTURES.doubleQuotes, 'format/oxfmt');

    expect(error?.message).toMatchInlineSnapshot(`"Replace \`"hello"\` with \`'hello'\`"`);
  });

  it('`format/oxfmt` rule ignores a file oxfmt does not support', async () => {
    addInstalledPackages({oxfmt: '0.72.0'});

    const results = await testEslintConfig(
      {format: {files: ['**/*.xml'], formatter: 'oxfmt', usePlainParser: true}},
      FIXTURES.xml,
      import.meta.dirname,
    );

    expect(results[0]?.messages).toStrictEqual([]);
  });

  it('`format/dprint` rule fires on a file with unformatted markdown', async () => {
    addInstalledPackages({'@dprint/formatter': '0.5.1'});

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

  it('`format/dprint` rule reports a failure of the formatter', async () => {
    addInstalledPackages({'@dprint/formatter': '0.5.1'});

    const results = await testEslintConfig(
      {
        format: {
          files: ['**/*.md'],
          formatter: ['dprint', {language: 'missing-plugin.wasm'}],
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

    expect(error?.message).toStartWith('Failed to format the code: ENOENT');
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
    it('defaults to `prettier` and creates `format/prettier` eslint config when `oxfmt` is not installed', async () => {
      const configResult = await computeEslintConfig('format');

      expect(configResult.getConfigByUnPostfix('format/prettier')).toBeDefined();
    });

    it('defaults to `oxfmt` and creates `format/oxfmt` eslint config when `oxfmt` is installed and `prettier` is not', async () => {
      setInstalledPackages({oxfmt: '0.72.0'});

      const configResult = await computeEslintConfig('format');

      expect(configResult.getConfigByUnPostfix('format/oxfmt')).toBeDefined();
      expect(configResult.getConfigByUnPostfix('format/prettier')).toBeUndefined();
    });

    it('defaults to `prettier` and creates `format/prettier` eslint config when both `prettier` and `oxfmt` are installed', async () => {
      addInstalledPackages({oxfmt: '0.72.0'});

      const configResult = await computeEslintConfig('format');

      expect(configResult.getConfigByUnPostfix('format/prettier')).toBeDefined();
      expect(configResult.getConfigByUnPostfix('format/oxfmt')).toBeUndefined();
    });

    it('creates `format/prettier` eslint config when `formatter` is set to `prettier`', async () => {
      const configResult = await computeEslintConfig({format: {formatter: 'prettier'}});

      expect(configResult.getConfigByUnPostfix('format/prettier')).toBeDefined();
    });

    it('creates `format/dprint` eslint config when `formatter` is set to `dprint`', async () => {
      addInstalledPackages({'@dprint/formatter': '0.5.1'});

      const configResult = await computeEslintConfig({
        format: {formatter: ['dprint', {language: 'typescript'}]},
      });

      expect(configResult.getConfigByUnPostfix('format/dprint')).toBeDefined();
      expect(configResult.getRuleEntrySeverity('format/dprint', 'format/dprint')).toBe(2);
      expect(configResult.getRuleEntrySeverity('format/dprint', 'format/prettier')).toBe(0);
      expect(configResult.getRuleEntrySeverity('format/dprint', 'format/oxfmt')).toBe(0);
    });

    it('creates `format/oxfmt` eslint config when `formatter` is set to `oxfmt`', async () => {
      addInstalledPackages({oxfmt: '0.72.0'});

      const configResult = await computeEslintConfig({format: {formatter: 'oxfmt'}});

      expect(configResult.getConfigByUnPostfix('format/oxfmt')).toBeDefined();
      expect(configResult.getRuleEntrySeverity('format/oxfmt', 'format/oxfmt')).toBe(2);
      expect(configResult.getRuleEntrySeverity('format/oxfmt', 'format/prettier')).toBe(0);
      expect(configResult.getRuleEntrySeverity('format/oxfmt', 'format/dprint')).toBe(0);
    });

    it("passes options to `format/oxfmt` rule when `formatter` is `['oxfmt', options]`", async () => {
      addInstalledPackages({oxfmt: '0.72.0'});
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
      addInstalledPackages({'@dprint/formatter': '0.5.1'});
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

    it('does not create any `format/*` eslint config and prints a warning when the formatter is not installed', async () => {
      setInstalledPackages({});
      using stderrSpy = vi.spyOn(process.stderr, 'write').mockReturnValue(true);

      const configResult = await computeEslintConfig({format: {formatter: 'oxfmt'}});

      expect(
        configResult.getConfigsByUnPostfix((configName) => configName.startsWith('format/')),
      ).toBeEmpty();
      expect(stderrSpy.mock.calls.flat().join('')).toContain(
        '[format] `oxfmt` package is not installed',
      );
    });
  });

  describe('option: `readFormatterConfig`', () => {
    it('lets `format/prettier` rule read the Prettier config by default', async () => {
      const configResult = await computeEslintConfig('format');

      expect(configResult.getRuleEntryOptions('format/prettier', 'format/prettier')).toStrictEqual(
        [],
      );
    });

    it('stops `format/prettier` rule from reading the Prettier config when set to `false`', async () => {
      const OPTIONS = {printWidth: 120};

      const configResult = await computeEslintConfig({
        format: {formatter: ['prettier', OPTIONS], readFormatterConfig: false},
      });

      expect(configResult.getRuleEntryOptions('format/prettier', 'format/prettier')).toStrictEqual([
        OPTIONS,
        {readConfig: false},
      ]);
    });

    it('ignores the Prettier config applying to the file when set to `false`', async () => {
      const results = await testEslintConfig(
        {format: {readFormatterConfig: false}},
        FIXTURES.doubleQuotesNextToPrettierConfig,
        import.meta.dirname,
      );

      expect(
        findLintMessageFromLintResults(
          results,
          FIXTURES.doubleQuotesNextToPrettierConfig,
          'format/prettier',
        ),
      ).toBeUndefined();
    });

    it('does not change `format/oxfmt` rule options when set to `false`', async () => {
      addInstalledPackages({oxfmt: '0.72.0'});

      const configResult = await computeEslintConfig({
        format: {formatter: 'oxfmt', readFormatterConfig: false},
      });

      expect(configResult.getRuleEntryOptions('format/oxfmt', 'format/oxfmt')).toStrictEqual([]);
    });
  });

  describe('option: `usePlainParser`', () => {
    it('does not set `eslint-parser-plain` parser by default', async () => {
      const configResult = await computeEslintConfig('format');

      expect(configResult.getConfigByUnPostfix('parsing/plain')).toBeUndefined();
    });

    it('sets `eslint-parser-plain` parser on the `files` of the config when set to `true`', async () => {
      const FILES = ['**/*.xml'];

      const configResult = await computeEslintConfig({
        format: [{files: FILES, usePlainParser: true}],
      });

      const config = configResult.getConfigByUnPostfix('parsing/plain');

      expect(config?.languageOptions?.['parser']).toBeDefined();
      expect(config?.files).toStrictEqual(FILES);
    });

    it('sets no parser up when the config specifies no `files`, which would parse the whole project as plain text', async () => {
      const configResult = await computeEslintConfig({format: {usePlainParser: true}});

      expect(configResult.getConfigByUnPostfix('parsing/plain')).toBeUndefined();
    });
  });
});

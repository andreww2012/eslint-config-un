import {GLOB_SOML} from '../../../src/constants';

const FIXTURES = {
  quotedKey: 'quoted-key.soml',
  placeholderValue: 'placeholder-value.soml',
  codeBlockWithQuotedKeyAndPlaceholderMd: 'soml-code-block-with-quoted-key-and-placeholder.md',
  mixedKeysAndStringValues: 'mixed-keys-and-string-values.soml',
} as const;

beforeEach(() => {
  addInstalledPackages({'soml-lang': '0.0.5'});
});

describe('basic tests', () => {
  it('creates `soml` and `parsing/soml` eslint configs and loads `soml` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('soml');

    const config = configResult.getConfigByUnPostfix('soml');

    expect(config).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot('["**/*.soml"]');

    const ignores = config?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.toIncludeAnyMembers([GLOB_SOML]);

    const parsingConfig = configResult.getConfigByUnPostfix('parsing/soml');

    expect(parsingConfig?.files).toMatchInlineSnapshot('["**/*.soml"]');
    expect(parsingConfig?.language).toMatchInlineSnapshot('"soml/soml"');

    expect(configResult.getLoadedPlugin('soml')).toBeDefined();
  });

  it('does not create `soml` and `parsing/soml` eslint configs and does not load `soml` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({soml: false});

    expect(configResult.getConfigByUnPostfix('soml')).toBeUndefined();
    expect(configResult.getConfigByUnPostfix('parsing/soml')).toBeUndefined();
    expect(configResult.getLoadedPlugin('soml')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `soml` eslint config', async () => {
      await expectConfigState({}, 'soml', false);
    });

    it('creates `soml` eslint config if explicitly enabled', async () => {
      await expectConfigState('soml', 'soml', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    describe('`soml-lang` is installed', () => {
      it('creates `soml` eslint config by default', async () => {
        await expectConfigState({}, 'soml', true, 'default');
      });

      it('creates `soml` eslint config and prints a warning if explicitly enabled', async () => {
        await expectConfigState('soml', 'soml', ['soml', true], 'default');
      });

      it('does not create `soml` eslint config if explicitly disabled', async () => {
        await expectConfigState({soml: false}, 'soml', false, 'default');
      });
    });

    describe('`soml-lang` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `soml` eslint config', async () => {
        await expectConfigState({}, 'soml', false, 'default');
      });

      it('creates `soml` eslint config if explicitly enabled', async () => {
        await expectConfigState('soml', 'soml', true, 'default');
      });

      it('does not create `soml` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({soml: false}, 'soml', ['soml', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `soml` eslint config when `soml-lang` is installed', async () => {
      await expectConfigState({}, 'soml', true, 'misc-enabled');
    });

    it('creates `soml` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState({soml: true}, 'soml', ['soml', true], 'misc-enabled');
    });

    it('does not create `soml` eslint config if explicitly disabled', async () => {
      await expectConfigState({soml: false}, 'soml', false, 'misc-enabled');
    });
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig('soml');

    expect(configResult.getRuleSeverities('soml')).toMatchObject({
      'soml/prefer-bare-keys': 2,
      'soml/sort-keys': 0,
    });
  });

  describe('mixed keys and string values', async () => {
    const results = await testEslintConfig(
      'soml',
      FIXTURES.mixedKeysAndStringValues,
      import.meta.dirname,
    );

    it('`soml/no-dotted-key-collisions` reports a dotted key next to its object', () => {
      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.mixedKeysAndStringValues,
        'soml/no-dotted-key-collisions',
      );

      expect(error?.message).toMatchInlineSnapshot(
        `"\`'server.port'\` is a key of its own, not \`port\` in the object \`server\`, because SOML does not split keys at \`.\`. Move it into \`server\`."`,
      );
    });

    it('`soml/no-escapes-in-literal-strings` reports an escape in a literal string', () => {
      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.mixedKeysAndStringValues,
        'soml/no-escapes-in-literal-strings',
      );

      expect(error?.message).toMatchInlineSnapshot(
        `"A literal string, \`'…'\`, has no escapes, so \`\\n\` is a backslash and \`n\`. Use a \`"…"\` string for escapes."`,
      );
    });

    it('`soml/no-quoted-values-in-arrays` reports a quoted number in an integer array', () => {
      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.mixedKeysAndStringValues,
        'soml/no-quoted-values-in-arrays',
      );

      expect(error?.message).toMatchInlineSnapshot(
        `"\`'443'\` is a string, but this array holds ints."`,
      );
    });

    it('`soml/no-surrounding-whitespace-in-keys` reports whitespace around a key', () => {
      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.mixedKeysAndStringValues,
        'soml/no-surrounding-whitespace-in-keys',
      );

      expect(error?.message).toMatchInlineSnapshot(
        `"The whitespace at the start or end of \`' name '\` is part of the key, so a program that reads \`name\` does not find it."`,
      );
    });

    it('`soml/prefer-block-strings` reports a string spanning three lines', () => {
      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.mixedKeysAndStringValues,
        'soml/prefer-block-strings',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"A string of three lines or more is easier to read as a block string."',
      );
    });

    it('`soml/prefer-block-strings` is disabled by `noStylisticRules` while problem rules remain enabled', async () => {
      const resultsWithoutStylisticRules = await testEslintConfig(
        {soml: true, noStylisticRules: true},
        FIXTURES.mixedKeysAndStringValues,
        import.meta.dirname,
      );

      expect(
        findLintMessageFromLintResults(
          resultsWithoutStylisticRules,
          FIXTURES.mixedKeysAndStringValues,
          'soml/prefer-block-strings',
        ),
      ).toBeUndefined();
      expect(
        resultsWithoutStylisticRules.flatMap((result) =>
          result.messages.map((message) => message.ruleId),
        ),
      ).toIncludeAllMembers([
        'soml/no-dotted-key-collisions',
        'soml/no-escapes-in-literal-strings',
        'soml/no-quoted-values-in-arrays',
        'soml/no-surrounding-whitespace-in-keys',
      ]);
    });
  });

  it('`soml/prefer-bare-keys` rule fires on a .soml file with a quoted key', async () => {
    const results = await testEslintConfig('soml', FIXTURES.quotedKey, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.quotedKey,
      'soml/prefer-bare-keys',
    );

    expect(error?.message).toMatchInlineSnapshot('"The key `name` does not need quotes."');
  });

  it('`soml/no-placeholder-values` rule fires on a .soml file with a placeholder value', async () => {
    const results = await testEslintConfig('soml', FIXTURES.placeholderValue, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.placeholderValue,
      'soml/no-placeholder-values',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"`changeme` looks like a placeholder. Set the real value, or leave the member out."',
    );
  });

  describe('code blocks inside .md files', async () => {
    const results = await testEslintConfig(
      {soml: true, markdown: true},
      FIXTURES.codeBlockWithQuotedKeyAndPlaceholderMd,
      import.meta.dirname,
    );

    it('`soml/prefer-bare-keys` rule fires on a quoted key', () => {
      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.codeBlockWithQuotedKeyAndPlaceholderMd,
        'soml/prefer-bare-keys',
      );

      expect(error?.message).toMatchInlineSnapshot('"The key `name` does not need quotes."');
    });

    it('`soml/no-placeholder-values` rule does not fire on a placeholder value', () => {
      expect(
        findLintMessageFromLintResults(
          results,
          FIXTURES.codeBlockWithQuotedKeyAndPlaceholderMd,
          'soml/no-placeholder-values',
        ),
      ).toBeUndefined();
    });
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `soml` eslint config', async () => {
      const FILES = ['config/**/*.soml'] as const;

      const configResult = await computeEslintConfig({soml: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('soml')?.files).toStrictEqual(FILES);
    });

    it('disables `soml` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({soml: {files: []}});

      expect(configResult.getConfigByUnPostfix('soml')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `soml` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'] as const;

      const configResult = await computeEslintConfig({soml: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('soml')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `soml` eslint config', async () => {
    const configResult = await computeEslintConfig({
      soml: {
        overrides: {'soml/prefer-bare-keys': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleSeverities('soml')).toMatchObject({
      'soml/prefer-bare-keys': 0,
      'no-console': 0,
    });
  });
});

import {GLOB_HTM, GLOB_HTML, GLOB_HTM_HTML, GLOB_TS_X, GLOB_YML_YAML} from '../../../src/constants';

const FIXTURES = {
  typescriptSyntax: 'typescript-syntax.ts',
  usedConsoleLog: 'used-console-log.js',
} as const;

describe('basic tests', () => {
  it('creates `js`, `js/stylistic_spaced-comment` and `js/disable-in-ts-files` eslint configs if set to `true`', async () => {
    const configResult = await computeEslintConfig('js');

    const config = configResult.getConfigByUnPostfix('js');

    expect(config).toBeDefined();
    expect(configResult.getConfigByUnPostfix('js/stylistic_spaced-comment')).toBeDefined();
    expect(config?.files).toBeUndefined();
    expect(
      configResult.getConfigByUnPostfix('js/disable-in-ts-files')?.files,
    ).toMatchInlineSnapshot('["**/*.?([cm])ts?(x)"]');

    const ignores = config?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.toIncludeAnyMembers([GLOB_HTML, GLOB_HTM, GLOB_HTM_HTML]);

    expect(
      configResult.getConfigByUnPostfix('js/stylistic_spaced-comment')?.ignores,
    ).toIncludeAllMembers([...(ignores || []), GLOB_YML_YAML, GLOB_HTM_HTML]);
  });

  it('does not create `js`, `js/stylistic_spaced-comment` and `js/disable-in-ts-files` eslint configs if set to `false`', async () => {
    const configResult = await computeEslintConfig({js: false});

    expect(configResult.getConfigByUnPostfix('js')).toBeUndefined();
    expect(configResult.getConfigByUnPostfix('js/stylistic_spaced-comment')).toBeUndefined();
    expect(configResult.getConfigByUnPostfix('js/disable-in-ts-files')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `js` eslint config', async () => {
      await expectConfigState({}, 'js', false);
    });

    it('creates `js` eslint config if explicitly enabled', async () => {
      await expectConfigState('js', 'js', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `js` eslint config', async () => {
      await expectConfigState({}, 'js', true, 'default');
    });

    it('creates `js` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('js', 'js', ['js', true], 'default');
    });

    it('does not create `js` eslint config if explicitly disabled', async () => {
      await expectConfigState({js: false}, 'js', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `js` eslint config', async () => {
      await expectConfigState({}, 'js', true, 'misc-enabled');
    });

    it('creates `js` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState({js: true}, 'js', ['js', true], 'misc-enabled');
    });

    it('does not create `js` eslint config if explicitly disabled', async () => {
      await expectConfigState({js: false}, 'js', false, 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('js');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('js')).toMatchObject({
      'no-console': 2,
      'no-await-in-loop': 1,
      'no-magic-numbers': 0,
    });
  });

  it('`no-console` rule fires on a file with console.log', async () => {
    const results = await testEslintConfig('js', FIXTURES.usedConsoleLog, import.meta.dirname);

    const error = findLintMessageFromLintResults(results, FIXTURES.usedConsoleLog, 'no-console');

    expect(error?.message).toMatchInlineSnapshot(
      '"Unexpected console statement. Only these console methods are allowed: warn, error."',
    );
  });

  describe('in TypeScript files', () => {
    it('turns off the rules misfiring on TypeScript syntax, but not the ones working there', () => {
      const severities = configResult.getRuleSeverities('js/disable-in-ts-files');

      expect(severities).toMatchObject({
        'no-undef': 0,
        'no-unused-vars': 0,
      });
      expect(severities).not.toHaveProperty('require-await');
    });

    it('turns off the rules regardless of whether `ts` config is enabled', async () => {
      const configResultWithTs = await computeEslintConfig({js: true, ts: true});

      expect(configResult.getConfigByUnPostfix('js/disable-in-ts-files')).toBeDefined();
      expect(configResultWithTs.getConfigByUnPostfix('js/disable-in-ts-files')).toBeDefined();
    });

    it('does not report TypeScript syntax the `ts` config does not lint', async () => {
      const results = await testEslintConfig(
        {js: true, ts: {files: []}},
        FIXTURES.typescriptSyntax,
        import.meta.dirname,
      );

      expect(results[0]?.messages.map(({ruleId}) => ruleId)).toStrictEqual([]);
    });
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `js` and `js/stylistic_spaced-comment` eslint configs', async () => {
      const FILES = ['src/**/*.js'];

      const configResult = await computeEslintConfig({js: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('js')?.files).toStrictEqual(FILES);
      expect(configResult.getConfigByUnPostfix('js/stylistic_spaced-comment')?.files).toStrictEqual(
        FILES,
      );
    });

    it('disables `js` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({js: {files: []}});

      expect(configResult.getConfigByUnPostfix('js')).toBeUndefined();
    });
  });

  it('does not apply user-provided `files` and `ignores` to `js/disable-in-ts-files` eslint config', async () => {
    const IGNORES = ['**/fixtures/**'];

    const configResult = await computeEslintConfig({
      js: {files: ['src/**/*.js'], ignores: IGNORES},
    });

    const config = configResult.getConfigByUnPostfix('js/disable-in-ts-files');

    expect(config?.files).toStrictEqual([GLOB_TS_X]);
    expect(config?.ignores || []).not.toIncludeAnyMembers(IGNORES);
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `js` and `js/stylistic_spaced-comment` eslint configs and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({js: {ignores: IGNORES}});

      const ignoresFromJs = configResult.getConfigByUnPostfix('js')?.ignores;

      expect(ignoresFromJs).toIncludeAllMembers(IGNORES);
      expect(ignoresFromJs?.length).toBeGreaterThan(IGNORES.length);

      const ignoresFromStylisticNoSpacedComment = configResult.getConfigByUnPostfix(
        'js/stylistic_spaced-comment',
      )?.ignores;

      expect(ignoresFromStylisticNoSpacedComment).toIncludeAllMembers(IGNORES);
      expect(ignoresFromStylisticNoSpacedComment?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `js` eslint config', async () => {
    const configResult = await computeEslintConfig({
      js: {
        overrides: {'no-console': 0},
        overridesAny: {'no-eval': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('js', 'no-console')).toBe(0);
    expect(configResult.getRuleEntrySeverity('js', 'no-eval')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `allowedConsoleMethods`', () => {
    it('allows `warn` and `error` console methods by default', async () => {
      const configResult = await computeEslintConfig('js');

      expect(configResult.getRuleEntry('js', 'no-console')).toMatchInlineSnapshot(
        '[2, {"allow": ["warn", "error"]}]',
      );
    });

    it('adds extra console methods when specified', async () => {
      const configResult = await computeEslintConfig({
        js: {allowedConsoleMethods: {log: true}},
      });

      expect(configResult.getRuleEntry('js', 'no-console')).toMatchInlineSnapshot(
        '[2, {"allow": ["warn", "error", "log"]}]',
      );
    });

    it('removes a method when set to false', async () => {
      const configResult = await computeEslintConfig({
        js: {allowedConsoleMethods: {warn: false}},
      });

      expect(configResult.getRuleEntry('js', 'no-console')).toMatchInlineSnapshot(
        '[2, {"allow": ["error"]}]',
      );
    });

    it('disallows all console methods when all defaults are set to false', async () => {
      const configResult = await computeEslintConfig({
        js: {allowedConsoleMethods: {warn: false, error: false}},
      });

      expect(configResult.getRuleEntry('js', 'no-console')).toMatchInlineSnapshot('[2, {}]');
    });
  });

  describe('option: `arrowFunctionBodyStyle`', () => {
    it('disables `arrow-body-style` rule when option is not set', async () => {
      const configResult = await computeEslintConfig('js');

      expect(configResult.getRuleEntrySeverity('js', 'arrow-body-style')).toBe(0);
    });

    it('disables `arrow-body-style` rule by default', async () => {
      const configResult = await computeEslintConfig({js: {arrowFunctionBodyStyle: false}});

      expect(configResult.getRuleEntrySeverity('js', 'arrow-body-style')).toBe(0);
    });

    it('enables `arrow-body-style` rule with the default rule options when option is `true`', async () => {
      const configResult = await computeEslintConfig({js: {arrowFunctionBodyStyle: true}});

      expect(configResult.getRuleEntry('js', 'arrow-body-style')).toMatchInlineSnapshot(
        '[2, "as-needed"]',
      );
    });

    it('enables `arrow-body-style` rule when option is `always`', async () => {
      const configResult = await computeEslintConfig({js: {arrowFunctionBodyStyle: 'always'}});

      expect(configResult.getRuleEntry('js', 'arrow-body-style')).toMatchInlineSnapshot(
        '[2, "always"]',
      );
    });

    it('enables `arrow-body-style` rule when option is `as-needed`', async () => {
      const configResult = await computeEslintConfig({js: {arrowFunctionBodyStyle: 'as-needed'}});

      expect(configResult.getRuleEntry('js', 'arrow-body-style')).toMatchInlineSnapshot(
        '[2, "as-needed"]',
      );
    });

    it('enables `arrow-body-style` rule when option is `never`', async () => {
      const configResult = await computeEslintConfig({js: {arrowFunctionBodyStyle: 'never'}});

      expect(configResult.getRuleEntry('js', 'arrow-body-style')).toMatchInlineSnapshot(
        '[2, "never"]',
      );
    });

    it('passes all the rule options when option is an array', async () => {
      const configResult = await computeEslintConfig({
        js: {arrowFunctionBodyStyle: ['as-needed', {requireReturnForObjectLiteral: true}]},
      });

      expect(configResult.getRuleEntry('js', 'arrow-body-style')).toMatchInlineSnapshot(
        '[2, "as-needed", {"requireReturnForObjectLiteral": true}]',
      );
    });
  });
});

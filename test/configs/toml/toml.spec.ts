import {GLOB_TOML} from '../../../src/constants';

const FIXTURES = {
  wrongIndent: 'wrong-indent.toml',
  mixedTypeArray: 'mixed-type-array.toml',
  tooManyFractionalSeconds: 'too-many-fractional-seconds.toml',
} as const;

describe('basic tests', () => {
  it('creates `toml` eslint config and loads `toml` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('toml');

    const config = configResult.getConfigByUnPostfix('toml');

    expect(config).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot('["**/*.toml"]');

    const ignores = config?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).toIncludeAllMembers(['**/Cargo.lock']);
    expect(ignores).not.toIncludeAnyMembers([GLOB_TOML]);

    expect(configResult.getLoadedPlugin('toml')).toBeDefined();
  });

  it('does not create `toml` eslint config and does not load `toml` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({toml: false});

    expect(configResult.getConfigByUnPostfix('toml')).toBeUndefined();
    expect(configResult.getLoadedPlugin('toml')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `toml` eslint config', async () => {
      await expectConfigState({}, 'toml', false);
    });

    it('creates `toml` eslint config if explicitly enabled', async () => {
      await expectConfigState('toml', 'toml', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `toml` eslint config', async () => {
      await expectConfigState({}, 'toml', false, 'default');
    });

    it('creates `toml` eslint config if explicitly enabled', async () => {
      await expectConfigState('toml', 'toml', true, 'default');
    });

    it('does not create `toml` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({toml: false}, 'toml', ['toml', false], 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `toml` eslint config', async () => {
      await expectConfigState({}, 'toml', true, 'misc-enabled');
    });

    it('creates `toml` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState({toml: true}, 'toml', ['toml', true], 'misc-enabled');
    });

    it('does not create `toml` eslint config if explicitly disabled', async () => {
      await expectConfigState({toml: false}, 'toml', false, 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('toml');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('toml')).toMatchObject({
      'toml/indent': 2,
      'toml/no-mixed-type-in-array': 0,
    });
  });

  it('`toml/indent` rule fires on a .toml file with wrong indentation', async () => {
    const results = await testEslintConfig('toml', FIXTURES.wrongIndent, import.meta.dirname);

    const error = findLintMessageFromLintResults(results, FIXTURES.wrongIndent, 'toml/indent');

    expect(error?.message).toMatchInlineSnapshot(
      '"Expected indentation of 0 spaces but found 1 spaces."',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `toml` eslint config', async () => {
      const FILES = ['app/**/*.toml'];

      const configResult = await computeEslintConfig({toml: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('toml')?.files).toStrictEqual(FILES);
    });

    it('disables `toml` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({toml: {files: []}});

      expect(configResult.getConfigByUnPostfix('toml')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('includes user-provided `ignores` in `toml` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({toml: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('toml')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `toml` eslint config', async () => {
    const configResult = await computeEslintConfig({
      toml: {overrides: {'toml/indent': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('toml', 'toml/indent')).toBe(0);
    expect(configResult.getRuleEntrySeverity('toml', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `noMixedTypeInArray`', () => {
    it('disables `toml/no-mixed-type-in-array` rule when `false` (default)', async () => {
      const configResult = await computeEslintConfig({
        toml: {noMixedTypeInArray: false},
      });

      expect(configResult.getRuleEntrySeverity('toml', 'toml/no-mixed-type-in-array')).toBe(0);
    });

    it('enables `toml/no-mixed-type-in-array` rule when `true`', async () => {
      const configResult = await computeEslintConfig({
        toml: {noMixedTypeInArray: true},
      });

      expect(configResult.getRuleEntrySeverity('toml', 'toml/no-mixed-type-in-array')).toBe(2);
    });

    it('`toml/no-mixed-type-in-array` rule fires on a file with mixed types in array', async () => {
      const results = await testEslintConfig(
        {toml: {noMixedTypeInArray: true}},
        FIXTURES.mixedTypeArray,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.mixedTypeArray,
        'toml/no-mixed-type-in-array',
      );

      expect(error?.message).toMatchInlineSnapshot('"Data types may not be mixed in an array."');
    });
  });

  describe('option: `noNonDecimalIntegerExceptions`', () => {
    it('allows hexadecimal integers by default', async () => {
      const configResult = await computeEslintConfig('toml');

      expect(
        configResult.getRuleEntry('toml', 'toml/no-non-decimal-integer'),
      ).toMatchInlineSnapshot('[2, {"allowHexadecimal": true}]');
    });

    it('disallows hexadecimal integers when set to `{allowHexadecimal: false}`', async () => {
      const configResult = await computeEslintConfig({
        toml: {noNonDecimalIntegerExceptions: {allowHexadecimal: false}},
      });

      expect(
        configResult.getRuleEntry('toml', 'toml/no-non-decimal-integer'),
      ).toMatchInlineSnapshot('[2, {"allowHexadecimal": false}]');
    });
  });

  describe('option: `maxPrecisionOfFractionalSeconds`', () => {
    it('uses default of 3 for `toml/precision-of-fractional-seconds` rule by default', async () => {
      const configResult = await computeEslintConfig('toml');

      expect(
        configResult.getRuleEntry('toml', 'toml/precision-of-fractional-seconds'),
      ).toMatchInlineSnapshot('[2, {"max": 3}]');
    });

    it('uses custom value for `toml/precision-of-fractional-seconds` rule', async () => {
      const configResult = await computeEslintConfig({
        toml: {maxPrecisionOfFractionalSeconds: 6},
      });

      expect(
        configResult.getRuleEntry('toml', 'toml/precision-of-fractional-seconds'),
      ).toMatchInlineSnapshot('[2, {"max": 6}]');
    });

    it('`toml/precision-of-fractional-seconds` rule fires on a file with too many fractional digits', async () => {
      const results = await testEslintConfig(
        'toml',
        FIXTURES.tooManyFractionalSeconds,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.tooManyFractionalSeconds,
        'toml/precision-of-fractional-seconds',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"Precision of fractional seconds greater than 3 are forbidden."',
      );
    });
  });

  describe('option: `maxIntegerPrecisionBits`', () => {
    it('uses default of 64 bits for `toml/precision-of-integer` rule by default', async () => {
      const configResult = await computeEslintConfig('toml');

      expect(configResult.getRuleEntry('toml', 'toml/precision-of-integer')).toMatchInlineSnapshot(
        '[2, {"maxBit": 64}]',
      );
    });

    it('uses custom value for `toml/precision-of-integer` rule', async () => {
      const configResult = await computeEslintConfig({
        toml: {maxIntegerPrecisionBits: 32},
      });

      expect(configResult.getRuleEntry('toml', 'toml/precision-of-integer')).toMatchInlineSnapshot(
        '[2, {"maxBit": 32}]',
      );
    });
  });

  describe('option: `ignoresAdditional`', () => {
    it('ignores `**/Cargo.lock` by default', async () => {
      const configResult = await computeEslintConfig('toml');

      expect(configResult.getConfigByUnPostfix('toml')?.ignores).toIncludeAllMembers([
        '**/Cargo.lock',
      ]);
    });

    it('does not ignore `**/Cargo.lock` when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        toml: {ignoresAdditional: false},
      });

      expect(configResult.getConfigByUnPostfix('toml')?.ignores).not.toIncludeAnyMembers([
        '**/Cargo.lock',
      ]);
    });
  });
});

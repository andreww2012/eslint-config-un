const NO_UNSAFE_RULES = [
  'ts/no-unsafe-argument',
  'ts/no-unsafe-assignment',
  'ts/no-unsafe-call',
  'ts/no-unsafe-enum-comparison',
  'ts/no-unsafe-member-access',
  'ts/no-unsafe-return',
] as const;

describe('ts: sub config `disableNoUnsafe`', () => {
  describe('basic tests', () => {
    it('does not create `ts/disable-no-unsafe` eslint config by default', async () => {
      const configResult = await computeEslintConfig('ts');

      expect(configResult.getConfigByUnPostfix('ts/disable-no-unsafe')).toBeUndefined();
    });

    it('does not create `ts/disable-no-unsafe` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({ts: {configDisableNoUnsafe: false}});

      expect(configResult.getConfigByUnPostfix('ts/disable-no-unsafe')).toBeUndefined();
    });

    it('creates `ts/disable-no-unsafe` eslint config when set to `true`', async () => {
      const configResult = await computeEslintConfig({ts: {configDisableNoUnsafe: true}});

      expect(configResult.getConfigByUnPostfix('ts/disable-no-unsafe')).toBeDefined();
    });

    it('has no explicit `files` restriction in `ts/disable-no-unsafe` eslint config by default', async () => {
      const configResult = await computeEslintConfig({ts: {configDisableNoUnsafe: true}});

      expect(configResult.getConfigByUnPostfix('ts/disable-no-unsafe')?.files).toBeUndefined();
    });

    it('has default `ignores` in `ts/disable-no-unsafe` eslint config', async () => {
      const configResult = await computeEslintConfig({ts: {configDisableNoUnsafe: true}});

      expect(
        configResult.getConfigByUnPostfix('ts/disable-no-unsafe')?.ignores?.length,
      ).toBeGreaterThan(0);
    });
  });

  describe('rules', () => {
    it('enables `ts/no-unsafe-*` rules as warnings when the sub config is not enabled', async () => {
      const configResult = await computeEslintConfig('ts');

      expect(configResult.getRuleSeverities('ts/type-aware/rules')).toMatchObject(
        Object.fromEntries(NO_UNSAFE_RULES.map((rule) => [rule, 1])),
      );
    });

    it('disables `ts/no-unsafe-*` rules in `ts/disable-no-unsafe` eslint config when set to `true`', async () => {
      const configResult = await computeEslintConfig({ts: {configDisableNoUnsafe: true}});

      expect(configResult.getRuleSeverities('ts/disable-no-unsafe')).toMatchObject(
        Object.fromEntries(NO_UNSAFE_RULES.map((rule) => [rule, 0])),
      );
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `ts/disable-no-unsafe` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          ts: {configDisableNoUnsafe: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('ts/disable-no-unsafe')?.files).toStrictEqual(
          FILES,
        );
      });

      it('disables `ts/disable-no-unsafe` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({ts: {configDisableNoUnsafe: {files: []}}});

        expect(configResult.getConfigByUnPostfix('ts/disable-no-unsafe')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `ts/disable-no-unsafe` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          ts: {configDisableNoUnsafe: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('ts/disable-no-unsafe')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` in `ts/disable-no-unsafe` eslint config', async () => {
      const configResult = await computeEslintConfig({
        ts: {configDisableNoUnsafe: {overrides: {'ts/no-unsafe-call': 'error'}}},
      });

      expect(configResult.getRuleSeverities('ts/disable-no-unsafe')).toMatchObject({
        ...Object.fromEntries(NO_UNSAFE_RULES.map((rule) => [rule, 0])),
        'ts/no-unsafe-call': 2,
      });
    });
  });
});

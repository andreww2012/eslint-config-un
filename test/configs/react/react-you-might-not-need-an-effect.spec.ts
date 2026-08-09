const FIXTURES = {
  effectCopyingPropIntoState: 'effect-copying-prop-into-state.jsx',
} as const;

beforeEach(() => {
  addInstalledPackages({react: '19.0.0'});
});

describe('react: sub config `youMightNotNeedAnEffect`', () => {
  describe('basic tests', () => {
    it('creates `react/you-might-not-need-an-effect` eslint config by default', async () => {
      const configResult = await computeEslintConfig('react');

      const config = configResult.getConfigByUnPostfix('react/you-might-not-need-an-effect');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.?([cm])[jt]s?(x)"]');
      expect(config?.ignores?.length).toBeGreaterThan(0);
    });

    it('does not create `react/you-might-not-need-an-effect` eslint config when disabled', async () => {
      const configResult = await computeEslintConfig({
        react: {configYouMightNotNeedAnEffect: false},
      });

      expect(
        configResult.getConfigByUnPostfix('react/you-might-not-need-an-effect'),
      ).toBeUndefined();
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('react');

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('react/you-might-not-need-an-effect')).toMatchObject({
        'react-you-might-not-need-an-effect/no-adjust-state-on-prop-change': 2,
        'react-you-might-not-need-an-effect/no-chain-state-updates': 2,
      });
    });

    it('`react-you-might-not-need-an-effect/no-derived-state` rule fires on an effect copying a prop into state', async () => {
      const results = await testEslintConfig(
        'react',
        FIXTURES.effectCopyingPropIntoState,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.effectCopyingPropIntoState,
        'react-you-might-not-need-an-effect/no-derived-state',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"Avoid storing derived state. Instead, compute "derivedTitle" directly during render."',
      );
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `react/you-might-not-need-an-effect` eslint config', async () => {
        const FILES = ['src/**/*.tsx'];

        const configResult = await computeEslintConfig({
          react: {configYouMightNotNeedAnEffect: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('react/you-might-not-need-an-effect')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `react/you-might-not-need-an-effect` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          react: {configYouMightNotNeedAnEffect: {files: []}},
        });

        expect(
          configResult.getConfigByUnPostfix('react/you-might-not-need-an-effect'),
        ).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          react: {configYouMightNotNeedAnEffect: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix(
          'react/you-might-not-need-an-effect',
        )?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `react/you-might-not-need-an-effect` eslint config', async () => {
      const configResult = await computeEslintConfig({
        react: {
          configYouMightNotNeedAnEffect: {
            overrides: {'react-you-might-not-need-an-effect/no-derived-state': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('react/you-might-not-need-an-effect')).toMatchObject({
        'react-you-might-not-need-an-effect/no-derived-state': 0,
        'no-console': 0,
      });
    });
  });
});

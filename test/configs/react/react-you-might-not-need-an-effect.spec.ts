beforeEach(() => {
  addInstalledPackages({react: '19.0.0'});
});

describe('react: sub config `youMightNotNeedAnEffect`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig('react');

    it('creates `react/you-might-not-need-an-effect` eslint config by default', () => {
      expect(configResult.getConfigByUnPostfix('react/you-might-not-need-an-effect')).toBeDefined();
    });

    it('does not create `react/you-might-not-need-an-effect` eslint config when disabled', async () => {
      const configResult = await computeEslintConfig({
        react: {configYouMightNotNeedAnEffect: false},
      });

      expect(
        configResult.getConfigByUnPostfix('react/you-might-not-need-an-effect'),
      ).toBeUndefined();
    });

    it('has default `files` in `react/you-might-not-need-an-effect` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('react/you-might-not-need-an-effect')?.files,
      ).toMatchInlineSnapshot('["**/*.?([cm])[jt]s?(x)"]');
    });

    it('has default `ignores` in `react/you-might-not-need-an-effect` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('react/you-might-not-need-an-effect')?.ignores?.length,
      ).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('react');

    it('enables `react-you-might-not-need-an-effect/no-adjust-state-on-prop-change` rule by default', () => {
      expect(
        configResult.getRuleEntrySeverity(
          'react/you-might-not-need-an-effect',
          'react-you-might-not-need-an-effect/no-adjust-state-on-prop-change',
        ),
      ).toBe(2);
    });

    it('disables `react-you-might-not-need-an-effect/no-pass-ref-to-parent` rule by default', () => {
      expect(
        configResult.getRuleEntrySeverity(
          'react/you-might-not-need-an-effect',
          'react-you-might-not-need-an-effect/no-pass-ref-to-parent',
        ),
      ).toBe(0);
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

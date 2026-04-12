const FIXTURES = {
  imgWithoutAlt: 'img-without-alt.ts',
} as const;

beforeEach(() => {
  addInstalledPackages({lit: '3.0.0'});
});

describe('lit: sub config `a11y`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig('lit');

    it('creates `lit-a11y` eslint config by default', () => {
      expect(configResult.getConfigByUnPostfix('lit-a11y')).toBeDefined();
    });

    it('does not create `lit-a11y` eslint config when `configA11y` is `false`', async () => {
      const configResult = await computeEslintConfig({lit: {configA11y: false}});

      expect(configResult.getConfigByUnPostfix('lit-a11y')).toBeUndefined();
    });

    it('creates `lit-a11y` eslint config when `configA11y` is `true` explicitly', async () => {
      const configResult = await computeEslintConfig({lit: {configA11y: true}});

      expect(configResult.getConfigByUnPostfix('lit-a11y')).toBeDefined();
    });

    it('has default `files` in `lit-a11y` eslint config', () => {
      expect(configResult.getConfigByUnPostfix('lit-a11y')?.files).toMatchInlineSnapshot(
        '["**/*.?([cm])[jt]sx"]',
      );
    });

    it('has default `ignores` in `lit-a11y` eslint config', () => {
      expect(configResult.getConfigByUnPostfix('lit-a11y')?.ignores?.length).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('lit');

    it('enables `lit-a11y/accessible-name` rule by default', () => {
      expect(configResult.getRuleEntrySeverity('lit-a11y', 'lit-a11y/accessible-name')).toBe(2);
    });

    it('does not add `lit-a11y/anchor-has-content` rule (not applicable to Lit)', () => {
      expect(configResult.getRuleEntry('lit-a11y', 'lit-a11y/anchor-has-content')).toBeUndefined();
    });

    it('enables `lit-a11y/alt-text` rule by default', () => {
      expect(configResult.getRuleEntrySeverity('lit-a11y', 'lit-a11y/alt-text')).toBe(2);
    });

    it('`lit-a11y/alt-text` rule fires on image without alt text', async () => {
      const results = await testEslintConfig(
        {lit: {configA11y: {files: ['**/*.ts']}}},
        FIXTURES.imgWithoutAlt,
        {searchFixturesRelativeToPath: import.meta.dirname},
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.imgWithoutAlt,
        'lit-a11y/alt-text',
      );

      expect(error?.message).toMatchInlineSnapshot('"<img> elements must have an alt attribute."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `lit-a11y` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          lit: {configA11y: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('lit-a11y')?.files).toStrictEqual(FILES);
      });

      it('disables `lit-a11y` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          lit: {configA11y: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('lit-a11y')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `lit-a11y` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          lit: {configA11y: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('lit-a11y')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `lit-a11y` eslint config', async () => {
      const configResult = await computeEslintConfig({
        lit: {
          configA11y: {
            overrides: {'lit-a11y/accessible-name': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleEntrySeverity('lit-a11y', 'lit-a11y/accessible-name')).toBe(0);
      expect(configResult.getRuleEntrySeverity('lit-a11y', 'no-console')).toBe(0);
    });
  });

  describe('options', () => {
    describe('option: `settings`', () => {
      it('does not set plugin settings when lit-a11y is enabled without options', async () => {
        const configResult = await computeEslintConfig('lit');

        expect(
          configResult.getConfigByUnPostfix('lit-a11y')?.settings?.['litHtmlSources'],
        ).toBeUndefined();
      });

      it('assigns `litHtmlSources` directly to settings object when provided', async () => {
        const configResult = await computeEslintConfig({
          lit: {configA11y: {settings: {litHtmlSources: true}}},
        });

        expect(configResult.getConfigByUnPostfix('lit-a11y')?.settings?.['litHtmlSources']).toBe(
          true,
        );
      });
    });
  });
});

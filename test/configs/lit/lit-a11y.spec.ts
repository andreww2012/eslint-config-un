const FIXTURES = {
  imgWithoutAlt: 'img-without-alt.ts',
} as const;

beforeEach(() => {
  addInstalledPackages({lit: '3.0.0'});
});

describe('lit: sub config `a11y`', () => {
  describe('basic tests', () => {
    it('creates `lit-a11y` eslint config by default', async () => {
      const configResult = await computeEslintConfig('lit');

      const config = configResult.getConfigByUnPostfix('lit-a11y');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.?([cm])[jt]sx"]');
      expect(config?.ignores?.length).toBeGreaterThan(0);
    });

    it('does not create `lit-a11y` eslint config when `configA11y` is `false`', async () => {
      const configResult = await computeEslintConfig({lit: {configA11y: false}});

      expect(configResult.getConfigByUnPostfix('lit-a11y')).toBeUndefined();
    });

    it('creates `lit-a11y` eslint config when `configA11y` is `true` explicitly', async () => {
      const configResult = await computeEslintConfig({lit: {configA11y: true}});

      expect(configResult.getConfigByUnPostfix('lit-a11y')).toBeDefined();
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('lit');

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('lit-a11y')).toMatchObject({
        'lit-a11y/accessible-name': 2,
        'lit-a11y/img-redundant-alt': 1,
      });
    });

    it('does not add `lit-a11y/anchor-has-content` rule (not applicable to Lit)', () => {
      expect(configResult.getRuleEntry('lit-a11y', 'lit-a11y/anchor-has-content')).toBeUndefined();
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
        const configResult = await computeEslintConfig(
          {
            lit: {configA11y: true},
          },
          {un: {plugins: {'lit-a11y': {settings: {litHtmlSources: true}}}}},
        );

        expect(configResult.getConfigByUnPostfix('lit-a11y')?.settings?.['litHtmlSources']).toBe(
          true,
        );
      });
    });
  });
});

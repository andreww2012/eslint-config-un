const FIXTURES = {
  missingAlt: 'missing-alt.astro',
} as const;

describe('astro: sub config `jsxA11y`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig('astro');

    it('creates `jsx-a11y/astro` eslint config by default', () => {
      expect(configResult.getConfigByUnPostfix('jsx-a11y/astro')).toBeDefined();
    });

    it('does not create `jsx-a11y/astro` eslint config when set to `false`', async () => {
      const disabledConfigResult = await computeEslintConfig({astro: {configJsxA11y: false}});

      expect(disabledConfigResult.getConfigByUnPostfix('jsx-a11y/astro')).toBeUndefined();
    });

    it('has default `files` in `jsx-a11y/astro` eslint config', () => {
      expect(configResult.getConfigByUnPostfix('jsx-a11y/astro')?.files).toMatchInlineSnapshot(
        '["**/*.astro"]',
      );
    });

    it('inherits `files` from parent `astro` config when `configJsxA11y` is enabled', async () => {
      const FILES = ['src/**/*.astro'];

      const inheritedConfigResult = await computeEslintConfig({
        astro: {files: FILES, configJsxA11y: true},
      });

      expect(inheritedConfigResult.getConfigByUnPostfix('jsx-a11y/astro')?.files).toStrictEqual(
        FILES,
      );
    });

    it('has default `ignores` in `jsx-a11y/astro` eslint config', () => {
      expect(configResult.getConfigByUnPostfix('jsx-a11y/astro')?.ignores?.length).toBeGreaterThan(
        0,
      );
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('astro');

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('jsx-a11y/astro')).toMatchObject({
        'astro/jsx-a11y/alt-text': 2,
        'astro/jsx-a11y/anchor-ambiguous-text': 1,
        'astro/jsx-a11y/mouse-events-have-key-events': 0,
      });
    });

    it('`astro/jsx-a11y/alt-text` rule fires on an image without alt text', async () => {
      const results = await testEslintConfig('astro', FIXTURES.missingAlt, import.meta.dirname);

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.missingAlt,
        'astro/jsx-a11y/alt-text',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"If you want to use astro/jsx-a11y/alt-text rule, you need to install eslint-plugin-jsx-a11y."',
      );
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `jsx-a11y/astro` eslint config', async () => {
        const FILES = ['src/**/*.astro'];

        const configResult = await computeEslintConfig({
          astro: {configJsxA11y: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('jsx-a11y/astro')?.files).toStrictEqual(FILES);
      });

      it('disables `jsx-a11y/astro` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          astro: {configJsxA11y: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('jsx-a11y/astro')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `jsx-a11y/astro` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          astro: {configJsxA11y: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('jsx-a11y/astro')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `jsx-a11y/astro` eslint config', async () => {
      const configResult = await computeEslintConfig({
        astro: {
          configJsxA11y: {
            overrides: {'astro/jsx-a11y/alt-text': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleEntrySeverity('jsx-a11y/astro', 'astro/jsx-a11y/alt-text')).toBe(
        0,
      );

      expect(configResult.getRuleEntrySeverity('jsx-a11y/astro', 'no-console')).toBe(0);
    });
  });

  describe('options', () => {
    describe('option: `settings`', () => {
      it('does not set `jsx-a11y-x` settings by default', async () => {
        const configResult = await computeEslintConfig('astro');

        expect(
          configResult.getConfigByUnPostfix('jsx-a11y/astro')?.settings?.['jsx-a11y-x'],
        ).toBeUndefined();
      });

      it('sets `jsx-a11y-x` settings when set', async () => {
        const SETTINGS = {components: {CardLink: 'a'}};

        const configResult = await computeEslintConfig({
          astro: {configJsxA11y: {settings: SETTINGS}},
        });

        expect(
          configResult.getConfigByUnPostfix('jsx-a11y/astro')?.settings?.['jsx-a11y-x'],
        ).toStrictEqual(SETTINGS);
      });
    });

    describe('option: `ambiguousWordsForAnchorText`', () => {
      it('enables `astro/jsx-a11y/anchor-ambiguous-text` as warning by default', async () => {
        const configResult = await computeEslintConfig('astro');

        expect(
          configResult.getRuleEntrySeverity(
            'jsx-a11y/astro',
            'astro/jsx-a11y/anchor-ambiguous-text',
          ),
        ).toBe(1);
      });

      it('disables `astro/jsx-a11y/anchor-ambiguous-text` when set to `false`', async () => {
        const configResult = await computeEslintConfig({
          astro: {configJsxA11y: {ambiguousWordsForAnchorText: false}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'jsx-a11y/astro',
            'astro/jsx-a11y/anchor-ambiguous-text',
          ),
        ).toBe(0);
      });

      it('sets `astro/jsx-a11y/anchor-ambiguous-text` severity to error when set to configured', async () => {
        const configResult = await computeEslintConfig({
          astro: {
            configJsxA11y: {
              ambiguousWordsForAnchorText: {
                words: ['read more'],
                severity: 'error',
              },
            },
          },
        });

        expect(
          configResult.getRuleEntrySeverity(
            'jsx-a11y/astro',
            'astro/jsx-a11y/anchor-ambiguous-text',
          ),
        ).toBe(2);
      });
    });

    describe('option: `altTextCheckForElements`', () => {
      it('enables `astro/jsx-a11y/alt-text` by default', async () => {
        const configResult = await computeEslintConfig('astro');

        expect(configResult.getRuleEntrySeverity('jsx-a11y/astro', 'astro/jsx-a11y/alt-text')).toBe(
          2,
        );
      });

      it('disables `astro/jsx-a11y/alt-text` when set to `false`', async () => {
        const configResult = await computeEslintConfig({
          astro: {configJsxA11y: {altTextCheckForElements: false}},
        });

        expect(configResult.getRuleEntrySeverity('jsx-a11y/astro', 'astro/jsx-a11y/alt-text')).toBe(
          0,
        );
      });
    });
  });
});

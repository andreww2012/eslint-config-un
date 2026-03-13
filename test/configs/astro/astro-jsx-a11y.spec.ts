const FIXTURES = {
  missingAlt: 'missing-alt.astro',
} as const;

describe('astro: sub config `configJsxA11y`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig('astro');

    it('creates `jsx-a11y/astro` eslint config by default when astro is enabled', () => {
      expect(configResult.getConfigByUnPostfix('jsx-a11y/astro')).toBeDefined();
    });

    it('does not create `jsx-a11y/astro` eslint config when `configJsxA11y` is disabled', async () => {
      const disabledConfigResult = await computeEslintConfig({astro: {configJsxA11y: false}});

      expect(disabledConfigResult.getConfigByUnPostfix('jsx-a11y/astro')).toBeUndefined();
    });

    it('has default `files` in `jsx-a11y/astro` eslint config', () => {
      expect(configResult.getConfigByUnPostfix('jsx-a11y/astro')?.files).toMatchInlineSnapshot(
        `["**/*.astro"]`,
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

    it('enables `astro/jsx-a11y/alt-text` rule by default', () => {
      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('jsx-a11y/astro', 'astro/jsx-a11y/alt-text'),
        ),
      ).toBe(2);
    });

    it('disables `astro/jsx-a11y/mouse-events-have-key-events` rule by default', () => {
      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry(
            'jsx-a11y/astro',
            'astro/jsx-a11y/mouse-events-have-key-events',
          ),
        ),
      ).toBe(0);
    });

    it('`astro/jsx-a11y/alt-text` rule fires on an image without alt text', async () => {
      const results = await testEslintConfig('astro', FIXTURES.missingAlt, import.meta.dirname);

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.missingAlt,
        'astro/jsx-a11y/alt-text',
      );

      expect(error?.message).toMatchInlineSnapshot(
        `"If you want to use astro/jsx-a11y/alt-text rule, you need to install eslint-plugin-jsx-a11y."`,
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

      it('disables `jsx-a11y/astro` eslint config when `files` is empty array', async () => {
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

        expect(ignores).to.include.members(IGNORES);
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

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('jsx-a11y/astro', 'astro/jsx-a11y/alt-text'),
        ),
      ).toBe(0);

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('jsx-a11y/astro', 'no-console'),
        ),
      ).toBe(0);
    });

    describe('option: `forceSeverity`', () => {
      it('respects `forceSeverity` set to `error` in `jsx-a11y/astro` eslint config', async () => {
        const configResult = await computeEslintConfig({
          astro: {configJsxA11y: {forceSeverity: 'error'}},
        });

        expect(
          getAllRulesSeverities(configResult.getConfigByUnPostfix('jsx-a11y/astro'), (ruleName) =>
            ruleName.startsWith('astro/jsx-a11y/'),
          ),
        ).toStrictEqual([2]);
      });

      it('respects `forceSeverity` set to `warn` in `jsx-a11y/astro` eslint config', async () => {
        const configResult = await computeEslintConfig({
          astro: {configJsxA11y: {forceSeverity: 'warn'}},
        });

        expect(
          getAllRulesSeverities(configResult.getConfigByUnPostfix('jsx-a11y/astro'), (ruleName) =>
            ruleName.startsWith('astro/jsx-a11y/'),
          ),
        ).toStrictEqual([1]);
      });
    });
  });

  describe('options', () => {
    describe('option: `settings`', () => {
      it('does not set `jsx-a11y-x` settings when `configJsxA11y` is enabled without options', async () => {
        const configResult = await computeEslintConfig('astro');

        expect(
          configResult.getConfigByUnPostfix('jsx-a11y/astro')?.settings?.['jsx-a11y-x'],
        ).toBeUndefined();
      });

      it('sets `jsx-a11y-x` settings when `settings` is provided', async () => {
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
          getRuleSeverityFromEslintRuleEntry(
            configResult.getRuleEntry('jsx-a11y/astro', 'astro/jsx-a11y/anchor-ambiguous-text'),
          ),
        ).toBe(1);
      });

      it('disables `astro/jsx-a11y/anchor-ambiguous-text` when set to `false`', async () => {
        const configResult = await computeEslintConfig({
          astro: {configJsxA11y: {ambiguousWordsForAnchorText: false}},
        });

        expect(
          getRuleSeverityFromEslintRuleEntry(
            configResult.getRuleEntry('jsx-a11y/astro', 'astro/jsx-a11y/anchor-ambiguous-text'),
          ),
        ).toBe(0);
      });

      it('sets `astro/jsx-a11y/anchor-ambiguous-text` severity to error when configured', async () => {
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
          getRuleSeverityFromEslintRuleEntry(
            configResult.getRuleEntry('jsx-a11y/astro', 'astro/jsx-a11y/anchor-ambiguous-text'),
          ),
        ).toBe(2);
      });
    });

    describe('option: `altTextCheckForElements`', () => {
      it('enables `astro/jsx-a11y/alt-text` by default', async () => {
        const configResult = await computeEslintConfig('astro');

        expect(
          getRuleSeverityFromEslintRuleEntry(
            configResult.getRuleEntry('jsx-a11y/astro', 'astro/jsx-a11y/alt-text'),
          ),
        ).toBe(2);
      });

      it('disables `astro/jsx-a11y/alt-text` when set to `false`', async () => {
        const configResult = await computeEslintConfig({
          astro: {configJsxA11y: {altTextCheckForElements: false}},
        });

        expect(
          getRuleSeverityFromEslintRuleEntry(
            configResult.getRuleEntry('jsx-a11y/astro', 'astro/jsx-a11y/alt-text'),
          ),
        ).toBe(0);
      });
    });
  });
});

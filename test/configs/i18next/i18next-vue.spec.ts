const FIXTURES = {
  templateWithPlainTextAndAttributes: 'template-with-plain-text-and-attributes.vue',
} as const;

beforeEach(() => {
  addInstalledPackages({i18next: '26.0.0'});
});

describe('i18next: sub config `vue`', () => {
  describe('basic tests', () => {
    it('creates `i18next/vue` eslint config when `vue` config is enabled', async () => {
      const configResult = await computeEslintConfig({i18next: true, vue: true});

      const config = configResult.getConfigByUnPostfix('i18next/vue');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.vue"]');
      expect(config?.ignores?.length).toBeGreaterThan(0);
    });

    it('does not create `i18next/vue` eslint config when `vue` config is not enabled', async () => {
      const configResult = await computeEslintConfig('i18next');

      expect(configResult.getConfigByUnPostfix('i18next/vue')).toBeUndefined();
    });

    it('creates `i18next/vue` eslint config by default when `vue` package is installed', async () => {
      addInstalledPackages({vue: '3.5.0'});

      await expectConfigState({}, 'i18next/vue', true, 'default');
    });

    it('creates `i18next/vue` eslint config when set to `true`, regardless of `vue` config', async () => {
      const configResult = await computeEslintConfig({i18next: {configVue: true}});

      expect(configResult.getConfigByUnPostfix('i18next/vue')).toBeDefined();
    });

    it('does not create `i18next/vue` eslint config when set to `false`, regardless of `vue` config', async () => {
      const configResult = await computeEslintConfig({i18next: {configVue: false}, vue: true});

      expect(configResult.getConfigByUnPostfix('i18next/vue')).toBeUndefined();
    });

    it('creates `i18next/vue` eslint config when `files` of the parent config is an empty array', async () => {
      const configResult = await computeEslintConfig({i18next: {files: []}, vue: true});

      expect(configResult.getConfigByUnPostfix('i18next')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('i18next/vue')).toBeDefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig({i18next: true, vue: true});

      expect(configResult.getRuleSeverities('i18next/vue')).toMatchObject({
        'i18next/no-literal-string': 2,
      });
    });

    it('sets up `i18next/no-literal-string` for Vue templates', async () => {
      const configResult = await computeEslintConfig({i18next: true, vue: true});

      expect(
        configResult.getRuleEntry('i18next/vue', 'i18next/no-literal-string'),
      ).toMatchInlineSnapshot(
        '[2, {"framework": "vue", "jsx-attributes": {"exclude": [".*"]}, "mode": "vue-template-only"}]',
      );
    });

    it('keeps `i18next/no-literal-string` out of the type information eslint config', async () => {
      const configResult = await computeEslintConfig(
        {i18next: true, vue: true},
        {internalOptions: {}},
      );

      expect(configResult.getRuleSeverities('i18next/vue')).toMatchObject({
        'i18next/no-literal-string': 2,
      });
      expect(configResult.getConfigByUnPostfix('i18next/vue/@type-information')).toBeUndefined();
    });

    it('`i18next/no-literal-string` rule fires on plain text in Vue templates, but not on attribute values', async () => {
      const results = await testEslintConfig(
        {i18next: true, vue: true},
        FIXTURES.templateWithPlainTextAndAttributes,
        import.meta.dirname,
      );

      const errors = findLintMessageFromLintResults(
        results,
        FIXTURES.templateWithPlainTextAndAttributes,
        'i18next/no-literal-string',
        {all: true},
      );

      expect(errors.map(({message}) => message)).toMatchInlineSnapshot(
        '["disallow literal string: <div class="container" title="Tooltip">Hello world</div>"]',
      );
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `i18next/vue` eslint config', async () => {
        const FILES = ['src/**/*.vue'];

        const configResult = await computeEslintConfig({
          i18next: {configVue: {files: FILES}},
          vue: true,
        });

        expect(configResult.getConfigByUnPostfix('i18next/vue')?.files).toStrictEqual(FILES);
      });

      it('disables `i18next/vue` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          i18next: {configVue: {files: []}},
          vue: true,
        });

        expect(configResult.getConfigByUnPostfix('i18next/vue')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `i18next/vue` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          i18next: {configVue: {ignores: IGNORES}},
          vue: true,
        });

        const ignores = configResult.getConfigByUnPostfix('i18next/vue')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `i18next/vue` eslint config', async () => {
      const configResult = await computeEslintConfig({
        i18next: {
          configVue: {
            overrides: {'i18next/no-literal-string': 0},
            overridesAny: {'no-console': 0},
          },
        },
        vue: true,
      });

      expect(configResult.getRuleSeverities('i18next/vue')).toMatchObject({
        'i18next/no-literal-string': 0,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `options`', () => {
      it('inherits `options` of the parent config, except `framework`, `mode` and `jsx-attributes`', async () => {
        const configResult = await computeEslintConfig({
          i18next: {
            options: {
              framework: 'react',
              mode: 'all',
              'jsx-attributes': {exclude: ['className']},
              callees: {exclude: ['logger.*']},
            },
          },
          vue: true,
        });

        expect(
          configResult.getRuleEntry('i18next/vue', 'i18next/no-literal-string'),
        ).toMatchInlineSnapshot(
          '[2, {"callees": {"exclude": ["logger.*"]}, "framework": "vue", "jsx-attributes": {"exclude": [".*"]}, "mode": "vue-template-only"}]',
        );
      });

      it('overrides both the inherited and the Vue template options with the provided ones', async () => {
        const configResult = await computeEslintConfig({
          i18next: {
            options: {message: 'Translate me'},
            configVue: {options: {message: 'Translate me in Vue', mode: 'all'}},
          },
          vue: true,
        });

        expect(
          configResult.getRuleEntry('i18next/vue', 'i18next/no-literal-string'),
        ).toMatchInlineSnapshot(
          '[2, {"framework": "vue", "jsx-attributes": {"exclude": [".*"]}, "message": "Translate me in Vue", "mode": "all"}]',
        );
      });
    });
  });
});

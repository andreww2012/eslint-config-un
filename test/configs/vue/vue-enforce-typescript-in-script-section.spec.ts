const FIXTURES = {
  scriptWithoutLang: 'script-without-lang.vue',
  scriptWithLangTs: 'script-with-lang-ts.vue',
} as const;

beforeEach(() => {
  addInstalledPackages({vue: '3.5.0'});
});

describe('vue: sub config `enforceTypescriptInScriptSection`', () => {
  describe('basic tests', () => {
    it('does not create `vue/enforce-typescript-in-script-section` eslint config by default (when `ts` config is disabled)', async () => {
      const configResult = await computeEslintConfig('vue');

      expect(
        configResult.getConfigByUnPostfix('vue/enforce-typescript-in-script-section'),
      ).toBeUndefined();
    });

    it('creates `vue/enforce-typescript-in-script-section` eslint config when `ts` config is enabled', async () => {
      const configResult = await computeEslintConfig({vue: true, ts: true});

      expect(
        configResult.getConfigByUnPostfix('vue/enforce-typescript-in-script-section'),
      ).toBeDefined();
    });

    it('creates `vue/enforce-typescript-in-script-section` eslint config when set to `true`', async () => {
      const configResult = await computeEslintConfig({
        vue: {configEnforceTypescriptInScriptSection: true},
      });

      expect(
        configResult.getConfigByUnPostfix('vue/enforce-typescript-in-script-section'),
      ).toBeDefined();
    });

    it('does not create `vue/enforce-typescript-in-script-section` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        vue: {configEnforceTypescriptInScriptSection: false},
        ts: true,
      });

      expect(
        configResult.getConfigByUnPostfix('vue/enforce-typescript-in-script-section'),
      ).toBeUndefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig({
        vue: {configEnforceTypescriptInScriptSection: true},
      });

      expect(
        configResult.getRuleSeverities('vue/enforce-typescript-in-script-section'),
      ).toMatchObject({
        'vue/block-lang': 2,
      });
    });

    it('`vue/block-lang` rule fires when `<script>` is missing `lang="ts"`', async () => {
      const results = await testEslintConfig(
        {vue: {configEnforceTypescriptInScriptSection: true}},
        FIXTURES.scriptWithoutLang,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.scriptWithoutLang,
        'vue/block-lang',
      );

      expect(error?.message).toMatchInlineSnapshot(
        `"The 'lang' attribute of '<script>' is missing."`,
      );
    });

    it('does not trigger `vue/block-lang` when `<script lang="ts">` is present', async () => {
      const results = await testEslintConfig(
        {vue: {configEnforceTypescriptInScriptSection: true}},
        FIXTURES.scriptWithLangTs,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.scriptWithLangTs,
        'vue/block-lang',
      );

      expect(error).toBeUndefined();
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('disables `vue/enforce-typescript-in-script-section` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          vue: {configEnforceTypescriptInScriptSection: {files: []}},
        });

        expect(
          configResult.getConfigByUnPostfix('vue/enforce-typescript-in-script-section'),
        ).toBeUndefined();
      });
    });

    it('respects `overrides` and `overridesAny` in `vue/enforce-typescript-in-script-section` eslint config', async () => {
      const configResult = await computeEslintConfig({
        vue: {
          configEnforceTypescriptInScriptSection: {
            overrides: {'vue/block-lang': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(
        configResult.getRuleSeverities('vue/enforce-typescript-in-script-section'),
      ).toMatchObject({
        'vue/block-lang': 0,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `typescriptRules`', () => {
      it('flows vue files into `ts/type-aware/setup` eslint config by default', async () => {
        const FILES = ['src/**/*.vue'];

        const configResult = await computeEslintConfig({
          vue: {configEnforceTypescriptInScriptSection: {files: FILES}},
          ts: true,
        });

        expect(configResult.getConfigByUnPostfix('ts/type-aware/setup')?.files).toIncludeAllMembers(
          FILES,
        );
      });

      it('does not flow vue files into `ts/type-aware/setup` when set to `only-non-type-aware`', async () => {
        const FILES = ['src/**/*.vue'];

        const configResult = await computeEslintConfig({
          vue: {
            configEnforceTypescriptInScriptSection: {
              files: FILES,
              typescriptRules: 'only-non-type-aware',
            },
          },
          ts: true,
        });

        expect(
          configResult.getConfigByUnPostfix('ts/type-aware/setup')?.files,
        ).not.toIncludeAnyMembers(FILES);
      });

      it('does not flow vue files into `ts` eslint configs when set to `false`', async () => {
        const FILES = ['src/**/*.vue'];

        const configResult = await computeEslintConfig({
          vue: {configEnforceTypescriptInScriptSection: {files: FILES, typescriptRules: false}},
          ts: true,
        });

        expect(
          configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.files,
        ).not.toIncludeAnyMembers(FILES);
        expect(
          configResult.getConfigByUnPostfix('ts/type-aware/setup')?.files,
        ).not.toIncludeAnyMembers(FILES);
      });
    });
  });
});

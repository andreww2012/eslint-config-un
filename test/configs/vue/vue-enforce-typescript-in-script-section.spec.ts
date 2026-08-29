const FIXTURES = {
  scriptWithoutLang: 'script-without-lang.vue',
  scriptWithLangTs: 'script-with-lang-ts.vue',
} as const;

beforeEach(() => {
  addInstalledPackages({vue: '3.5.0'});
});

describe('vue: sub config `enforceTypescriptInScriptSection`', () => {
  describe('basic tests', () => {
    it('creates `vue/enforce-typescript-in-script-section` eslint config, uses parent config `files` and `ignores` and enforces `ts` lang for <script> sections when `ts` config is enabled', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({vue: {ignores: IGNORES}, ts: true});

      const config = configResult.getConfigByUnPostfix('vue/enforce-typescript-in-script-section');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.vue"]');
      expect(config?.ignores).toIncludeAllMembers(IGNORES);

      expect(
        configResult.getRuleEntryOptions(
          'vue/enforce-typescript-in-script-section',
          'vue/block-lang',
        ),
      ).toStrictEqual([{script: {lang: 'ts'}}]);
    });

    it('creates `vue/enforce-typescript-in-script-section` eslint config even when `ts` config is disabled, but does not enforce `ts` lang for <script> sections', async () => {
      const configResult = await computeEslintConfig('vue');

      expect(
        configResult.getRuleEntryOptions(
          'vue/enforce-typescript-in-script-section',
          'vue/block-lang',
        ),
      ).toMatchObject([{script: {allowNoLang: true}}]);
    });

    it('creates `vue/enforce-typescript-in-script-section` eslint config and enforces `ts` lang when set to `true`', async () => {
      const configResult = await computeEslintConfig({
        vue: {configEnforceTypescriptInScriptSection: true},
      });

      expect(
        configResult.getRuleEntryOptions(
          'vue/enforce-typescript-in-script-section',
          'vue/block-lang',
        ),
      ).toStrictEqual([{script: {lang: 'ts'}}]);
    });

    it('creates `vue/enforce-typescript-in-script-section` eslint config, but does not enforce `ts` lang when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        vue: {configEnforceTypescriptInScriptSection: false},
        ts: true,
      });

      expect(
        configResult.getRuleEntryOptions(
          'vue/enforce-typescript-in-script-section',
          'vue/block-lang',
        ),
      ).toMatchObject([{script: {allowNoLang: true}}]);
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
      it('uses user-provided `files` in `vue/enforce-typescript-in-script-section` eslint config', async () => {
        const FILES = ['src/**/*.vue'];

        const configResult = await computeEslintConfig({
          vue: {configEnforceTypescriptInScriptSection: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('vue/enforce-typescript-in-script-section')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `vue/enforce-typescript-in-script-section` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          vue: {configEnforceTypescriptInScriptSection: {files: []}},
        });

        expect(
          configResult.getConfigByUnPostfix('vue/enforce-typescript-in-script-section'),
        ).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `vue/enforce-typescript-in-script-section` eslint config and merges them with the implicit defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          vue: {configEnforceTypescriptInScriptSection: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix(
          'vue/enforce-typescript-in-script-section',
        )?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
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
      it('flows vue files into the type information entry by default', async () => {
        const FILES = ['src/**/*.vue'];

        const configResult = await computeEslintConfig({
          vue: {configEnforceTypescriptInScriptSection: {files: FILES}},
          ts: true,
        });

        expect(
          configResult.getConfigByUnPostfix('parsing/ts/type-aware')?.files,
        ).toIncludeAllMembers(FILES);
      });

      it('does not flow vue files into the type information entry when set to `only-non-type-aware`', async () => {
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
          configResult.getConfigByUnPostfix('parsing/ts/type-aware')?.files,
        ).not.toIncludeAnyMembers(FILES);
      });

      it('does not flow vue files into `ts` eslint configs when set to `false`', async () => {
        const FILES = ['src/**/*.vue'];

        const configResult = await computeEslintConfig({
          vue: {configEnforceTypescriptInScriptSection: {files: FILES, typescriptRules: false}},
          ts: true,
        });

        expect(configResult.getConfigByUnPostfix('parsing/ts')?.files).not.toIncludeAnyMembers(
          FILES,
        );
        expect(
          configResult.getConfigByUnPostfix('parsing/ts/type-aware')?.files,
        ).not.toIncludeAnyMembers(FILES);
      });
    });
  });
});

const FIXTURES = {
  scriptWithoutLang: 'script-without-lang.svelte',
} as const;

beforeEach(() => {
  addInstalledPackages({svelte: '5.34.3'});
});

describe('svelte: sub config `enforceTypescriptInScriptSection`', () => {
  describe('basic tests', () => {
    it('creates `svelte/enforce-typescript-in-script-section` eslint config, uses parent config `files` and `ignores` and enforces `ts` lang for <script> sections when `ts` config is enabled', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({svelte: {ignores: IGNORES}, ts: true});

      const config = configResult.getConfigByUnPostfix(
        'svelte/enforce-typescript-in-script-section',
      );

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.svelte"]');
      expect(config?.ignores).toIncludeAllMembers(IGNORES);

      expect(
        configResult.getRuleEntryOptions(
          'svelte/enforce-typescript-in-script-section',
          'svelte/block-lang',
        ),
      ).toStrictEqual([{script: ['ts']}]);
    });

    it('creates `svelte/enforce-typescript-in-script-section` eslint config even when `ts` config is disabled, but does not enforce `ts` lang for <script> sections', async () => {
      const configResult = await computeEslintConfig('svelte');

      expect(
        configResult.getRuleEntryOptions(
          'svelte/enforce-typescript-in-script-section',
          'svelte/block-lang',
        ),
      ).toStrictEqual([{script: ['ts', null]}]);
    });

    it('creates `svelte/enforce-typescript-in-script-section` eslint config and enforces `ts` lang when set to `true`', async () => {
      const configResult = await computeEslintConfig({
        svelte: {configEnforceTypescriptInScriptSection: true},
      });

      expect(
        configResult.getRuleEntryOptions(
          'svelte/enforce-typescript-in-script-section',
          'svelte/block-lang',
        ),
      ).toStrictEqual([{script: ['ts']}]);
    });

    it('creates `svelte/enforce-typescript-in-script-section` eslint config, but does not enforce `ts` lang when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        svelte: {configEnforceTypescriptInScriptSection: false},
        ts: true,
      });

      expect(
        configResult.getRuleEntryOptions(
          'svelte/enforce-typescript-in-script-section',
          'svelte/block-lang',
        ),
      ).toStrictEqual([{script: ['ts', null]}]);
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig({
        svelte: {configEnforceTypescriptInScriptSection: true},
      });

      expect(
        configResult.getRuleSeverities('svelte/enforce-typescript-in-script-section'),
      ).toMatchObject({
        'svelte/block-lang': 2,
      });
    });

    it('`svelte/block-lang` rule fires when `<script>` is missing `lang="ts"`', async () => {
      const results = await testEslintConfig(
        {svelte: {configEnforceTypescriptInScriptSection: true}},
        FIXTURES.scriptWithoutLang,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.scriptWithoutLang,
        'svelte/block-lang',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"The lang attribute of the <script> block should be "ts"."',
      );
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `svelte/enforce-typescript-in-script-section` eslint config', async () => {
        const FILES = ['src/**/*.svelte'];

        const configResult = await computeEslintConfig({
          svelte: {configEnforceTypescriptInScriptSection: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('svelte/enforce-typescript-in-script-section')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `svelte/enforce-typescript-in-script-section` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          svelte: {configEnforceTypescriptInScriptSection: {files: []}},
        });

        expect(
          configResult.getConfigByUnPostfix('svelte/enforce-typescript-in-script-section'),
        ).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `svelte/enforce-typescript-in-script-section` eslint config and merges them with the implicit defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          svelte: {configEnforceTypescriptInScriptSection: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix(
          'svelte/enforce-typescript-in-script-section',
        )?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `svelte/enforce-typescript-in-script-section` eslint config', async () => {
      const configResult = await computeEslintConfig({
        svelte: {
          configEnforceTypescriptInScriptSection: {
            overrides: {'svelte/block-lang': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(
        configResult.getRuleSeverities('svelte/enforce-typescript-in-script-section'),
      ).toMatchObject({
        'svelte/block-lang': 0,
        'no-console': 0,
      });
    });
  });
});

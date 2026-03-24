const FIXTURES = {
  scriptWithoutLang: 'script-without-lang.svelte',
} as const;

describe('svelte: sub config `enforceTypescriptInScriptSection`', () => {
  describe('basic tests', () => {
    it('still creates `svelte/enforce-typescript-in-script-section` eslint config even if sub config is not enabled (special case)', async () => {
      const configResult = await computeEslintConfig('svelte');

      expect(
        configResult.getConfigByUnPostfix('svelte/enforce-typescript-in-script-section'),
      ).toBeDefined();
    });

    it('creates `svelte/enforce-typescript-in-script-section` eslint config by default when `ts` config is enabled', async () => {
      const configResult = await computeEslintConfig({svelte: true, ts: true});

      expect(
        configResult.getConfigByUnPostfix('svelte/enforce-typescript-in-script-section'),
      ).toBeDefined();
    });

    it('still creates `svelte/enforce-typescript-in-script-section` eslint config even when explicitly set to `false`', async () => {
      const configResult = await computeEslintConfig({
        svelte: {configEnforceTypescriptInScriptSection: false},
      });

      expect(
        configResult.getConfigByUnPostfix('svelte/enforce-typescript-in-script-section'),
      ).toBeDefined();
    });

    it('triggers `svelte/block-lang` when `<script>` is missing `lang="ts"`', async () => {
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

  describe('rules', () => {
    it('enables `svelte/block-lang` rule by default and only allows `ts` lang', async () => {
      const configResult = await computeEslintConfig({
        svelte: {configEnforceTypescriptInScriptSection: true},
      });

      expect(
        configResult.getRuleEntry(
          'svelte/enforce-typescript-in-script-section',
          'svelte/block-lang',
        ),
      ).toMatchInlineSnapshot(`[2, {"script": ["ts"]}]`);
    });

    it('still enables `svelte/block-lang` rule, but allows `ts` or no lang when sub-config is not enabled', async () => {
      const configResult = await computeEslintConfig('svelte');

      expect(
        configResult.getRuleEntry(
          'svelte/enforce-typescript-in-script-section',
          'svelte/block-lang',
        ),
      ).toMatchInlineSnapshot(`[2, {"script": ["ts", null]}]`);
    });
  });
});

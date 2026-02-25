const FIXTURES = {
  scriptWithoutLang: 'script-without-lang.vue',
  scriptWithLangTs: 'script-with-lang-ts.vue',
} as const;

describe('vue: sub config `enforceTypescriptInScriptSection`', () => {
  it('triggers vue/block-lang when <script> is missing lang="ts"', async () => {
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

  it('does not trigger vue/block-lang when <script lang="ts"> is present', async () => {
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

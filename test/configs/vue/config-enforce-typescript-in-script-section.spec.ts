describe('vue: sub config `enforceTypescriptInScriptSection`', () => {
  const fixtureFileName = 'script-without-lang.vue';

  it('triggers vue/block-lang when <script> is missing lang="ts"', async () => {
    const results = await testEslintConfig(
      {vue: {configEnforceTypescriptInScriptSection: true}},
      fixtureFileName,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(results, fixtureFileName, 'vue/block-lang');

    expect(error).toBeDefined();
  });

  it('does not trigger vue/block-lang when <script lang="ts"> is present', async () => {
    const fixtureFileName = 'script-with-lang-ts.vue';

    const results = await testEslintConfig(
      {vue: {configEnforceTypescriptInScriptSection: true}},
      fixtureFileName,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(results, fixtureFileName, 'vue/block-lang');

    expect(error).toBeUndefined();
  });
});

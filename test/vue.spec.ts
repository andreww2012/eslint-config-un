describe('vue config', () => {
  it('triggers vue/no-useless-mustaches for string literals in mustaches', async () => {
    const fixtureFileName = 'template-with-useless-mustache.vue';

    const results = await testEslintConfig('vue', `vue/${fixtureFileName}`);

    const error = findLintMessageFromLintResults(
      results,
      fixtureFileName,
      'vue/no-useless-mustaches',
    );

    expect(error).toBeDefined();
  });

  it('does not trigger vue/no-useless-mustaches for plain text', async () => {
    const fixtureFileName = 'template-without-useless-mustache.vue';

    const results = await testEslintConfig('vue', `vue/${fixtureFileName}`);

    const error = findLintMessageFromLintResults(
      results,
      fixtureFileName,
      'vue/no-useless-mustaches',
    );

    expect(error).toBeUndefined();
  });
});

describe('sub config `enforceTypescriptInScriptSection`', () => {
  const fixtureFileName = 'script-without-lang.vue';

  it('triggers vue/block-lang when <script> is missing lang="ts"', async () => {
    const results = await testEslintConfig(
      {vue: {configEnforceTypescriptInScriptSection: true}},
      `vue/${fixtureFileName}`,
    );

    const error = findLintMessageFromLintResults(results, fixtureFileName, 'vue/block-lang');

    expect(error).toBeDefined();
  });

  it('does not trigger vue/block-lang when <script lang="ts"> is present', async () => {
    const fixtureFileName = 'script-with-lang-ts.vue';

    const results = await testEslintConfig(
      {vue: {configEnforceTypescriptInScriptSection: true}},
      `vue/${fixtureFileName}`,
    );

    const error = findLintMessageFromLintResults(results, fixtureFileName, 'vue/block-lang');

    expect(error).toBeUndefined();
  });
});

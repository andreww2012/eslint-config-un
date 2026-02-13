describe('vue config', () => {
  it('triggers vue/no-useless-mustaches for string literals in mustaches', async () => {
    const fixtureFileName = 'template-with-useless-mustache.vue';

    const results = await testEslintConfig('vue', fixtureFileName, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      fixtureFileName,
      'vue/no-useless-mustaches',
    );

    expect(error).toBeDefined();
  });

  it('does not trigger vue/no-useless-mustaches for plain text', async () => {
    const fixtureFileName = 'template-without-useless-mustache.vue';

    const results = await testEslintConfig('vue', fixtureFileName, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      fixtureFileName,
      'vue/no-useless-mustaches',
    );

    expect(error).toBeUndefined();
  });
});

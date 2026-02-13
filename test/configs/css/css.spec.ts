describe('css config', () => {
  it('lints .css files and triggers css rules', async () => {
    const fixtureFileName = 'css-empty-block.css';

    const results = await testEslintConfig(
      {
        css: true,
      },
      fixtureFileName,
      import.meta.dirname,
    );

    const cssNoEmptyBlocksError = findLintMessageFromLintResults(
      results,
      fixtureFileName,
      'css/no-empty-blocks',
    );

    expect(cssNoEmptyBlocksError).toBeDefined();
  });
});

describe('css config', () => {
  it('lints .css files and triggers css rules', async () => {
    const results = await testEslintConfig(
      {
        css: true,
      },
      'css-empty-block.css',
    );

    const cssNoEmptyBlocksError = findLintMessageFromLintResults(
      results,
      'css-empty-block.css',
      'css/no-empty-blocks',
    );

    expect(cssNoEmptyBlocksError).toBeDefined();
  });
});

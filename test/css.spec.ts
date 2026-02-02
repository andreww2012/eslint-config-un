describe('css config', () => {
  it('lints .css files and triggers css rules', async () => {
    const results = await testEslintConfig(
      {
        css: true,
      },
      'css-empty-block.css',
    );

    const cssNoEmptyBlocksError = results[0]?.messages.find(
      (msg) => msg.ruleId === 'css/no-empty-blocks',
    );

    expect(cssNoEmptyBlocksError).toBeDefined();
  });
});

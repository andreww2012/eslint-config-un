const FIXTURES = {
  cssEmptyBlock: 'css-empty-block.css',
} as const;

describe('css config', () => {
  it('lints .css files and triggers css rules', async () => {
    const results = await testEslintConfig('css', FIXTURES.cssEmptyBlock, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.cssEmptyBlock,
      'css/no-empty-blocks',
    );

    expect(error?.message).toMatchInlineSnapshot(`"Unexpected empty block found."`);
  });
});

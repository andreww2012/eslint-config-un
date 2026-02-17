const FIXTURES = {
  usingBracketsToGetLastArrayElement: 'using-brackets-to-get-last-array-element.js',
  usingAtToGetLastArrayElement: 'using-at-to-get-last-array-element.js',
} as const;

describe('e18e config', () => {
  it('should trigger e18e/prefer-array-at on outdated array access', async () => {
    const result = await testEslintConfig(
      'e18e',
      FIXTURES.usingBracketsToGetLastArrayElement,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      result,
      FIXTURES.usingBracketsToGetLastArrayElement,
      'e18e/prefer-array-at',
    );

    expect(error?.message).toMatchInlineSnapshot(`"Use .at(-1) instead of [arr.length - 1]"`);
  });

  it('should not trigger e18e/prefer-array-at on correct .at() usage', async () => {
    const result = await testEslintConfig(
      'e18e',
      FIXTURES.usingAtToGetLastArrayElement,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      result,
      FIXTURES.usingAtToGetLastArrayElement,
      'e18e/prefer-array-at',
    );

    expect(error).toBeUndefined();
  });
});

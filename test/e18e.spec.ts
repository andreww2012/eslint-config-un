describe('e18e config', () => {
  it('should trigger e18e/prefer-array-at on outdated array access', async () => {
    const result = await testEslintConfig({e18e: true}, 'e18e-array-at-violation.js');

    const message = findLintMessageFromLintResults(
      result,
      'e18e-array-at-violation.js',
      'e18e/prefer-array-at',
    );

    expect(message).toBeDefined();
    expect(message?.message).toContain('at');
  });

  it('should not trigger e18e/prefer-array-at on correct .at() usage', async () => {
    const result = await testEslintConfig({e18e: true}, 'e18e-array-at-correct.js');

    const message = findLintMessageFromLintResults(
      result,
      'e18e-array-at-correct.js',
      'e18e/prefer-array-at',
    );

    expect(message).toBeUndefined();
  });
});

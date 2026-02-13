describe('e18e config', () => {
  it('should trigger e18e/prefer-array-at on outdated array access', async () => {
    const fixtureFilePath = 'using-brackets-to-get-last-array-element.js';

    const result = await testEslintConfig({e18e: true}, fixtureFilePath, import.meta.dirname);

    const message = findLintMessageFromLintResults(result, fixtureFilePath, 'e18e/prefer-array-at');

    expect(message).toBeDefined();
    expect(message?.message).toContain('at');
  });

  it('should not trigger e18e/prefer-array-at on correct .at() usage', async () => {
    const fixtureFilePath = 'using-at-to-get-last-array-element.js';

    const result = await testEslintConfig({e18e: true}, fixtureFilePath, import.meta.dirname);

    const message = findLintMessageFromLintResults(result, fixtureFilePath, 'e18e/prefer-array-at');

    expect(message).toBeUndefined();
  });
});

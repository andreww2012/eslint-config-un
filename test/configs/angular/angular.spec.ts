describe('angular config', () => {
  it('should trigger @angular-eslint/template/banana-in-box on wrong syntax', async () => {
    const fixtureFileName = 'angular-2way-binding-wrong.html';

    const result = await testEslintConfig({angular: true}, fixtureFileName, import.meta.dirname);

    const message = findLintMessageFromLintResults(
      result,
      fixtureFileName,
      '@angular-eslint/template/banana-in-box',
    );

    expect(message).toBeDefined();
  });

  it('should not trigger @angular-eslint/template/banana-in-box on correct syntax', async () => {
    const fixtureFileName = 'angular-2way-binding-correct.html';

    const result = await testEslintConfig({angular: true}, fixtureFileName, import.meta.dirname);

    const message = findLintMessageFromLintResults(
      result,
      fixtureFileName,
      '@angular-eslint/template/banana-in-box',
    );

    expect(message).toBeUndefined();
  });
});

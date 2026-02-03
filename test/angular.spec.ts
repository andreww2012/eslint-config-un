describe('angular config', () => {
  it('should trigger @angular-eslint/template/banana-in-box on wrong syntax', async () => {
    const result = await testEslintConfig({angular: true}, 'angular-banana-in-box-wrong.html');

    const message = result
      .find((r) => r.filePath.endsWith('angular-banana-in-box-wrong.html'))
      ?.messages.find((m) => m.ruleId === '@angular-eslint/template/banana-in-box');

    expect(message).toBeDefined();
  });

  it('should not trigger @angular-eslint/template/banana-in-box on correct syntax', async () => {
    const result = await testEslintConfig({angular: true}, 'angular-banana-in-box-correct.html');

    const message = result
      .find((r) => r.filePath.endsWith('angular-banana-in-box-correct.html'))
      ?.messages.find((m) => m.ruleId === '@angular-eslint/template/banana-in-box');

    expect(message).toBeUndefined();
  });
});

const FIXTURES = {
  twoWayBindingWrong: 'angular-2way-binding-wrong.html',
  twoWayBindingCorrect: 'angular-2way-binding-correct.html',
} as const;

describe('angular config', () => {
  it('should trigger @angular-eslint/template/banana-in-box on wrong syntax', async () => {
    const result = await testEslintConfig(
      'angular',
      FIXTURES.twoWayBindingWrong,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      result,
      FIXTURES.twoWayBindingWrong,
      '@angular-eslint/template/banana-in-box',
    );

    expect(error?.message).toMatchInlineSnapshot(`"Invalid binding syntax. Use [(expr)] instead"`);
  });

  it('should not trigger @angular-eslint/template/banana-in-box on correct syntax', async () => {
    const result = await testEslintConfig(
      'angular',
      FIXTURES.twoWayBindingCorrect,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      result,
      FIXTURES.twoWayBindingCorrect,
      '@angular-eslint/template/banana-in-box',
    );

    expect(error).toBeUndefined();
  });
});

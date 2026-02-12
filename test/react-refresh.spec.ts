describe('react/refresh config', () => {
  it('should trigger react-refresh/only-export-components on mixed exports', async () => {
    const result = await testEslintConfig({react: true}, 'react-refresh-mixed-exports.jsx');

    const message = findLintMessageFromLintResults(
      result,
      'react-refresh-mixed-exports.jsx',
      'react-refresh/only-export-components',
    );

    expect(message).toBeDefined();
  });

  it('should not trigger react-refresh/only-export-components on component-only exports', async () => {
    const result = await testEslintConfig(
      {react: {configRefresh: true}},
      'react-refresh-component-only.jsx',
    );

    const message = findLintMessageFromLintResults(
      result,
      'react-refresh-component-only.jsx',
      'react-refresh/only-export-components',
    );

    expect(message).toBeUndefined();
  });
});

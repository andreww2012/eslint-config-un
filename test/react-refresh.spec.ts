describe('react/refresh config', () => {
  it('should trigger react-refresh/only-export-components on mixed exports', async () => {
    const result = await testEslintConfig({react: true}, 'react-refresh-mixed-exports.jsx');

    const message = result
      .find((r) => r.filePath.endsWith('react-refresh-mixed-exports.jsx'))
      ?.messages.find((m) => m.ruleId === 'react-refresh/only-export-components');

    expect(message).toBeDefined();
  });

  it('should not trigger react-refresh/only-export-components on component-only exports', async () => {
    const result = await testEslintConfig(
      {react: {configRefresh: true}},
      'react-refresh-component-only.jsx',
    );

    const message = result
      .find((r) => r.filePath.endsWith('react-refresh-component-only.jsx'))
      ?.messages.find((m) => m.ruleId === 'react-refresh/only-export-components');

    expect(message).toBeUndefined();
  });
});

describe('react: sub config `refresh`', () => {
  it('should trigger react-refresh/only-export-components on mixed exports', async () => {
    const fixtureFileName = 'react-component-file-mixed-exports.jsx';

    const result = await testEslintConfig({react: true}, fixtureFileName, import.meta.dirname);

    const message = findLintMessageFromLintResults(
      result,
      fixtureFileName,
      'react-refresh/only-export-components',
    );

    expect(message).toBeDefined();
  });

  it('should not trigger react-refresh/only-export-components on component-only exports', async () => {
    const fixtureName = 'react-component-file-single-export.jsx';

    const result = await testEslintConfig(
      {react: {configRefresh: true}},
      fixtureName,
      import.meta.dirname,
    );

    const message = findLintMessageFromLintResults(
      result,
      fixtureName,
      'react-refresh/only-export-components',
    );

    expect(message).toBeUndefined();
  });
});

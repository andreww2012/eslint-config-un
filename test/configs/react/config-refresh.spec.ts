const FIXTURES = {
  reactComponentFileMixedExports: 'react-component-file-mixed-exports.jsx',
  reactComponentFileSingleExport: 'react-component-file-single-export.jsx',
} as const;

describe('react: sub config `refresh`', () => {
  it('should trigger react-refresh/only-export-components on mixed exports', async () => {
    const result = await testEslintConfig(
      'react',
      FIXTURES.reactComponentFileMixedExports,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      result,
      FIXTURES.reactComponentFileMixedExports,
      'react-refresh/only-export-components',
    );

    expect(error?.message).toMatchInlineSnapshot(`"Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components."`);
  });

  it('should not trigger react-refresh/only-export-components on component-only exports', async () => {
    const result = await testEslintConfig(
      {react: {configRefresh: true}},
      FIXTURES.reactComponentFileSingleExport,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      result,
      FIXTURES.reactComponentFileSingleExport,
      'react-refresh/only-export-components',
    );

    expect(error).toBeUndefined();
  });
});

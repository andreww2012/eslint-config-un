const FIXTURES = {
  usingIncludesOnEmptyArray: 'using-includes-on-empty-array.js',
  usingIncludesOnNonEmptyArray: 'using-includes-on-non-empty-array.js',
} as const;

describe('sonar config', () => {
  it('triggers sonarjs/no-empty-collection for empty collections', async () => {
    const results = await testEslintConfig(
      'sonar',
      FIXTURES.usingIncludesOnEmptyArray,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.usingIncludesOnEmptyArray,
      'sonarjs/no-empty-collection',
    );

    expect(error?.message).toMatchInlineSnapshot(
      `"Review this usage of "strings" as it can only be empty here."`,
    );
  });

  it('does not trigger sonarjs/no-empty-collection for filled collections', async () => {
    const results = await testEslintConfig(
      'sonar',
      FIXTURES.usingIncludesOnNonEmptyArray,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.usingIncludesOnNonEmptyArray,
      'sonarjs/no-empty-collection',
    );

    expect(error).toBeUndefined();
  });
});

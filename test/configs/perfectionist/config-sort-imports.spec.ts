const FIXTURES = {
  unsortedImports: 'unsorted-imports.js',
} as const;

it('does not create `perfectionist/sort-imports` eslint config by default', async () => {
  const configResult = await computeEslintConfig('perfectionist');

  expect(configResult.getConfigByUnPostfix('perfectionist/sort-imports')).toBeUndefined();
});

it('creates `perfectionist/sort-imports` eslint config and enables the corresponding rule when the sub config is enabled', async () => {
  const config = await computeEslintConfig({perfectionist: {configSortImports: true}});

  expect(
    JSON.stringify(config.getRuleEntry('perfectionist/sort-imports', 'perfectionist/sort-imports')),
  ).toMatchInlineSnapshot(`"[2]"`);
});

it('`perfectionist/sort-imports` rule works', async () => {
  const results = await testEslintConfig(
    {perfectionist: {configSortImports: true}},
    FIXTURES.unsortedImports,
    import.meta.dirname,
  );

  const error = findLintMessageFromLintResults(
    results,
    FIXTURES.unsortedImports,
    'perfectionist/sort-imports',
  );

  expect(error?.message).toMatchInlineSnapshot(
    `"Expected "express-session" to come before "node:fs/promises"."`,
  );
});

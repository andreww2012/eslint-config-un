const FIXTURES = {
  plainObjectJson: 'plain-object.json',
} as const;

const getRulesWithLanguages = (
  configResult: Awaited<ReturnType<typeof computeEslintConfig>>,
): string[] =>
  Object.entries(configResult.getConfigByUnPostfix('global-setup/plugins')?.plugins || {}).flatMap(
    ([pluginPrefix, plugin]) =>
      Object.entries(plugin.rules || {})
        .filter(([, {meta}]) => meta != null && 'languages' in meta)
        .map(([ruleName]) => `${pluginPrefix}/${ruleName}`),
  );

describe('rule `meta.languages` is removed from the registered plugins', () => {
  it('leaves no rule declaring it', async () => {
    const configResult = await computeEslintConfig({}, {reset: true});

    expect(getRulesWithLanguages(configResult)).toBeEmpty();
  });

  it('leaves the rules declaring it alone when the `keepRuleMetaLanguages` internal option is set', async () => {
    const configResult = await computeEslintConfig(
      {},
      {reset: true, internalOptions: {skipTypeInfoSplit: true, keepRuleMetaLanguages: true}},
    );

    expect(getRulesWithLanguages(configResult).length).toBeGreaterThan(0);
  });

  it('does not prevent enabling a rule on a file of a language it does not declare', async () => {
    const results = await testEslintConfig(
      {unicorn: true, json: {overridesAny: {'unicorn/no-lonely-if': 2}}},
      FIXTURES.plainObjectJson,
    );

    expect(results[0]?.messages).toBeEmpty();
  });
});

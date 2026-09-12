const FIXTURES = {
  dialogElement: 'dialog-element.html',
} as const;

const USE_BASELINE_RULES = [
  {configName: 'css', eslintConfigName: 'css', ruleName: 'css/use-baseline'},
  {configName: 'html', eslintConfigName: 'html', ruleName: 'html/use-baseline'},
  {configName: 'react', eslintConfigName: 'react/html', ruleName: 'html-react/use-baseline'},
  {configName: 'svelte', eslintConfigName: 'svelte/html', ruleName: 'html-svelte/use-baseline'},
  {
    configName: 'angular',
    eslintConfigName: 'angular/template/html',
    ruleName: 'html-angular/use-baseline',
  },
] as const;

describe('option: `baselineAvailability`', () => {
  describe.each(USE_BASELINE_RULES)('`$ruleName`', ({configName, eslintConfigName, ruleName}) => {
    it('does not set `available` rule option by default', async () => {
      const configResult = await computeEslintConfig(configName);

      expect(configResult.getRuleEntryOptions(eslintConfigName, ruleName)).toStrictEqual([{}]);
    });

    it('sets `available` rule option when option is `newly`', async () => {
      const configResult = await computeEslintConfig(configName, {
        un: {baselineAvailability: 'newly'},
      });

      expect(configResult.getRuleEntryOptions(eslintConfigName, ruleName)).toStrictEqual([
        {available: 'newly'},
      ]);
    });

    it('sets `available` rule option when option is a year', async () => {
      const configResult = await computeEslintConfig(configName, {
        un: {baselineAvailability: 2023},
      });

      expect(configResult.getRuleEntryOptions(eslintConfigName, ruleName)).toStrictEqual([
        {available: 2023},
      ]);
    });
  });

  it('merges `available` with the other `css/use-baseline` rule options', async () => {
    const configResult = await computeEslintConfig(
      {css: {allowedFeatures: {properties: ['zoom']}}},
      {un: {baselineAvailability: 'newly'}},
    );

    expect(configResult.getRuleEntryOptions('css', 'css/use-baseline')).toStrictEqual([
      {available: 'newly', allowProperties: ['zoom']},
    ]);
  });

  it('`html/use-baseline` rule does not fire on an element that became Baseline before the default availability', async () => {
    const result = await testEslintConfig('html', FIXTURES.dialogElement, import.meta.dirname);

    expect(
      findLintMessageFromLintResults(result, FIXTURES.dialogElement, 'html/use-baseline'),
    ).toBeUndefined();
  });

  it('`html/use-baseline` rule fires on an element that became Baseline after the year the option is set to', async () => {
    const result = await testEslintConfig('html', FIXTURES.dialogElement, {
      searchFixturesRelativeToPath: import.meta.dirname,
      un: {baselineAvailability: 2021},
    });

    const error = findLintMessageFromLintResults(
      result,
      FIXTURES.dialogElement,
      'html/use-baseline',
    );

    expect(error?.message).toMatchInlineSnapshot(
      `"Element '<dialog>' is not a 2021 available baseline feature."`,
    );
  });
});

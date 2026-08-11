type PluginRenames = ((Parameters<typeof computeEslintConfig>[1] & {})['un'] & {})['pluginRenames'];

const computeUnicornConfig = (pluginRenames?: PluginRenames) =>
  computeEslintConfig('unicorn', {un: {pluginRenames}});

const getPluginPrefixes = async (pluginRenames: PluginRenames) =>
  Object.keys(
    (await computeUnicornConfig(pluginRenames)).getConfigByUnPostfix('global-setup/plugins')
      ?.plugins || {},
  );

const getConfigRuleNames = async (pluginRenames?: PluginRenames) =>
  Object.keys(
    (await computeUnicornConfig(pluginRenames)).getConfigByUnPostfix('unicorn')?.rules || {},
  );

describe('option: `pluginRenames`', () => {
  it('registers the plugin under the new prefix', async () => {
    await expect(getPluginPrefixes({unicorn: 'unicorn-renamed'})).resolves.toContain(
      'unicorn-renamed',
    );
  });

  it('renames the prefix of every rule of the plugin', async () => {
    const originalRuleNames = await getConfigRuleNames();

    await expect(getConfigRuleNames({unicorn: 'unicorn-renamed'})).resolves.toStrictEqual(
      originalRuleNames.map((ruleName) => ruleName.replaceAll('unicorn/', 'unicorn-renamed/')),
    );
  });

  it('still expects the old prefix in `overrides`', async () => {
    const configResult = await computeEslintConfig(
      {unicorn: {overrides: {'unicorn/no-null': 0}}},
      {un: {pluginRenames: {unicorn: 'unicorn-renamed'}}},
    );

    expect(configResult.getRuleEntrySeverity('unicorn', 'unicorn-renamed/no-null')).toBe(0);
  });

  it('allows swapping the prefixes of two plugins', async () => {
    const processOutput = spyOnProcessOutput();

    await expect(getPluginPrefixes({unicorn: 'import', import: 'unicorn'})).resolves.toContain(
      'import',
    );
    expect(processOutput.exit).not.toHaveBeenCalled();
  });

  describe('invalid new prefixes', () => {
    let processOutput: ReturnType<typeof spyOnProcessOutput>;

    beforeEach(() => {
      processOutput = spyOnProcessOutput();
    });

    it.each([
      {
        reason: 'clashes with a default plugin prefix',
        pluginRenames: {unicorn: 'import'},
        reported: 'import',
      },
      {
        reason: 'duplicates another new prefix',
        pluginRenames: {unicorn: 'renamed', import: 'renamed'},
        reported: 'renamed',
      },
      {
        reason: 'is an empty string',
        pluginRenames: {unicorn: ''},
        reported: '<empty string>',
      },
      {
        reason: 'is the reserved `disable-autofix` prefix',
        pluginRenames: {unicorn: 'disable-autofix'},
        reported: 'disable-autofix',
      },
    ])('reports a new prefix that $reason and exits', async ({pluginRenames, reported}) => {
      await getPluginPrefixes(pluginRenames);

      expect(processOutput.exit).toHaveBeenCalledWith(1);
      expect(processOutput.getStderrOutput()).toContain(`Invalid plugin renames: ${reported}`);
    });

    it('keeps the original prefix when the new one is an empty string', async () => {
      await expect(getPluginPrefixes({unicorn: ''})).resolves.toContain('unicorn');
    });
  });
});

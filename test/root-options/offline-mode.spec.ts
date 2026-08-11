const OFFLINE_MODE_CONFIG_NAME = 'offline-mode';

const computeOfflineModeConfig = async (offlineMode: boolean) =>
  (await computeEslintConfig({}, {un: {offlineMode}})).getConfigByUnPostfix(
    OFFLINE_MODE_CONFIG_NAME,
  );

describe('option: `offlineMode`', () => {
  it('does not create a respective config when disabled', async () => {
    await expect(computeOfflineModeConfig(false)).resolves.toBeUndefined();
  });

  it('turns off every rule it lists when enabled', async () => {
    expect(getAllRulesSeverities(await computeOfflineModeConfig(true))).toStrictEqual([0]);
  });

  it('lists the rules that may perform network requests', async () => {
    expect(Object.keys((await computeOfflineModeConfig(true))?.rules || {})).toStrictEqual(
      expect.arrayContaining([
        'markdown-links/no-dead-urls',
        'json-schema-validator/no-invalid',
        'node-dependencies/no-deprecated',
        'lockfile/integrity',
      ]),
    );
  });

  it('puts the config last so that it wins over the configs enabling those rules', async () => {
    const configResult = await computeEslintConfig({lockfile: true}, {un: {offlineMode: true}});

    expect(configResult.getRuleEntrySeverity('lockfile', 'lockfile/integrity')).not.toBe(0);
    expect(configResult.config.at(-1)?.name).toBe(`eslint-config-un/${OFFLINE_MODE_CONFIG_NAME}`);
  });
});

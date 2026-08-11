import {LOADABLE_PLUGIN_PREFIXES_LIST} from '../../src/loaders';

const getPluginPrefixes = async (
  loadPluginsOnDemand: ((Parameters<
    typeof computeEslintConfig
  >[1] & {})['un'] & {})['loadPluginsOnDemand'],
) =>
  Object.keys(
    (await computeEslintConfig('unicorn', {un: {loadPluginsOnDemand}})).getConfigByUnPostfix(
      'global-setup/plugins',
    )?.plugins || {},
  );

describe('option: `loadPluginsOnDemand`', () => {
  it('loads only the plugins used by the enabled configs by default', async () => {
    await expect(getPluginPrefixes(undefined)).resolves.toStrictEqual([
      'unicorn',
      'disable-autofix',
    ]);
  });

  it('loads every loadable plugin when set to `false`', async () => {
    await expect(getPluginPrefixes(false)).resolves.toStrictEqual([
      ...LOADABLE_PLUGIN_PREFIXES_LIST,
      'disable-autofix',
    ]);
  });

  it('loads the plugins listed in `alwaysLoad` in addition to the used ones', async () => {
    await expect(getPluginPrefixes({alwaysLoad: ['regexp']})).resolves.toStrictEqual([
      'unicorn',
      'regexp',
      'disable-autofix',
    ]);
  });
});

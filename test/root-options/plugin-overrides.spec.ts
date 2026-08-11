import type {EslintPlugin} from '../../src/eslint/eslint-types';

const DEV_PLUGIN = {
  meta: {name: 'eslint-plugin-case-police', version: '0.0.0-dev'},
  rules: {
    'dev-only-rule': {meta: {type: 'problem', schema: []}, create: () => ({})},
  },
} satisfies EslintPlugin;

const getCasePolicePlugin = async (
  pluginOverrides: ((Parameters<typeof computeEslintConfig>[1] & {})['un'] & {})['pluginOverrides'],
) =>
  (await computeEslintConfig('casePolice', {un: {pluginOverrides}})).getLoadedPlugin('case-police');

describe('option: `pluginOverrides`', () => {
  it('loads the installed plugin when the option is not set', async () => {
    const plugin = await getCasePolicePlugin(undefined);

    expect(plugin?.meta?.version).not.toBe(DEV_PLUGIN.meta.version);
  });

  it('registers the provided plugin instead of the installed one', async () => {
    const plugin = await getCasePolicePlugin({'case-police': DEV_PLUGIN});

    expect(plugin?.meta?.version).toBe(DEV_PLUGIN.meta.version);
    expect(Object.keys(plugin?.rules || {})).toStrictEqual(['dev-only-rule']);
  });

  it('accepts a promise of the plugin', async () => {
    const plugin = await getCasePolicePlugin({'case-police': Promise.resolve(DEV_PLUGIN)});

    expect(plugin?.meta?.version).toBe(DEV_PLUGIN.meta.version);
  });

  it('accepts a function returning the plugin', async () => {
    const plugin = await getCasePolicePlugin({'case-police': () => DEV_PLUGIN});

    expect(plugin?.meta?.version).toBe(DEV_PLUGIN.meta.version);
  });

  it('accepts a function returning a promise of the plugin', async () => {
    const plugin = await getCasePolicePlugin({'case-police': () => Promise.resolve(DEV_PLUGIN)});

    expect(plugin?.meta?.version).toBe(DEV_PLUGIN.meta.version);
  });

  it('is keyed by the canonical prefix even when the plugin is renamed', async () => {
    const configResult = await computeEslintConfig('casePolice', {
      un: {
        pluginOverrides: {'case-police': DEV_PLUGIN},
        pluginRenames: {'case-police': 'case-police-renamed'},
      },
    });

    expect(configResult.getLoadedPlugin('case-police')?.meta?.version).toBe(
      DEV_PLUGIN.meta.version,
    );
  });
});

import type {EslintPlugin} from '../../src/eslint/eslint-types';

type PluginsOption = ((Parameters<typeof computeEslintConfig>[1] & {})['un'] & {})['plugins'];

const DEV_PLUGIN = {
  meta: {name: 'eslint-plugin-case-police', version: '0.0.0-dev'},
  rules: {
    'dev-only-rule': {meta: {type: 'problem', schema: []}, create: () => ({})},
  },
} satisfies EslintPlugin;

const computeUnicornConfig = (plugins?: PluginsOption) =>
  computeEslintConfig('unicorn', {un: {plugins}});

const getPluginPrefixes = async (plugins: PluginsOption) =>
  Object.keys(
    (await computeUnicornConfig(plugins)).getConfigByUnPostfix('global-setup/plugins')?.plugins ||
      {},
  );

const getConfigRuleNames = async (plugins?: PluginsOption) =>
  Object.keys((await computeUnicornConfig(plugins)).getConfigByUnPostfix('unicorn')?.rules || {});

const getCasePolicePlugin = async (plugins: PluginsOption) =>
  (await computeEslintConfig('casePolice', {un: {plugins}})).getLoadedPlugin('case-police');

describe('option: `plugins`', () => {
  describe('`prefix`', () => {
    it('registers the plugin under the new prefix', async () => {
      await expect(getPluginPrefixes({unicorn: {prefix: 'unicorn-renamed'}})).resolves.toContain(
        'unicorn-renamed',
      );
    });

    it('renames the prefix of every rule of the plugin', async () => {
      const originalRuleNames = await getConfigRuleNames();

      await expect(
        getConfigRuleNames({unicorn: {prefix: 'unicorn-renamed'}}),
      ).resolves.toStrictEqual(
        originalRuleNames.map((ruleName) => ruleName.replaceAll('unicorn/', 'unicorn-renamed/')),
      );
    });

    it('still expects the canonical prefix in `overrides`', async () => {
      const configResult = await computeEslintConfig(
        {unicorn: {overrides: {'unicorn/no-null': 0}}},
        {un: {plugins: {unicorn: {prefix: 'unicorn-renamed'}}}},
      );

      expect(configResult.getRuleEntrySeverity('unicorn', 'unicorn-renamed/no-null')).toBe(0);
    });

    it('allows swapping the prefixes of two plugins', async () => {
      const processOutput = spyOnProcessOutput();

      await expect(
        getPluginPrefixes({unicorn: {prefix: 'import'}, import: {prefix: 'unicorn'}}),
      ).resolves.toContain('import');
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
          plugins: {unicorn: {prefix: 'import'}},
          reported: 'import',
        },
        {
          reason: 'duplicates another new prefix',
          plugins: {unicorn: {prefix: 'renamed'}, import: {prefix: 'renamed'}},
          reported: 'renamed',
        },
        {
          reason: 'is an empty string',
          plugins: {unicorn: {prefix: ''}},
          reported: '<empty string>',
        },
        {
          reason: 'is the reserved `disable-autofix` prefix',
          plugins: {unicorn: {prefix: 'disable-autofix'}},
          reported: 'disable-autofix',
        },
      ])('reports a new prefix that $reason and exits', async ({plugins, reported}) => {
        await getPluginPrefixes(plugins);

        expect(processOutput.exit).toHaveBeenCalledWith(1);
        expect(processOutput.getStderrOutput()).toContain(`Invalid plugin renames: ${reported}`);
      });

      it('keeps the original prefix when the new one is an empty string', async () => {
        await expect(getPluginPrefixes({unicorn: {prefix: ''}})).resolves.toContain('unicorn');
      });
    });
  });

  describe('`plugin`', () => {
    it('loads the installed plugin when the option is not set', async () => {
      const plugin = await getCasePolicePlugin(undefined);

      expect(plugin?.meta?.version).not.toBe(DEV_PLUGIN.meta.version);
    });

    it('registers the provided plugin instead of the installed one', async () => {
      const plugin = await getCasePolicePlugin({'case-police': {plugin: DEV_PLUGIN}});

      expect(plugin?.meta?.version).toBe(DEV_PLUGIN.meta.version);
      expect(Object.keys(plugin?.rules || {})).toStrictEqual(['dev-only-rule']);
    });

    it('accepts a promise of the plugin', async () => {
      const plugin = await getCasePolicePlugin({
        'case-police': {plugin: Promise.resolve(DEV_PLUGIN)},
      });

      expect(plugin?.meta?.version).toBe(DEV_PLUGIN.meta.version);
    });

    it('accepts a function returning the plugin', async () => {
      const plugin = await getCasePolicePlugin({'case-police': {plugin: () => DEV_PLUGIN}});

      expect(plugin?.meta?.version).toBe(DEV_PLUGIN.meta.version);
    });

    it('accepts a function returning a promise of the plugin', async () => {
      const plugin = await getCasePolicePlugin({
        'case-police': {plugin: () => Promise.resolve(DEV_PLUGIN)},
      });

      expect(plugin?.meta?.version).toBe(DEV_PLUGIN.meta.version);
    });

    it('is keyed by the canonical prefix even when the plugin is renamed', async () => {
      const configResult = await computeEslintConfig('casePolice', {
        un: {plugins: {'case-police': {plugin: DEV_PLUGIN, prefix: 'case-police-renamed'}}},
      });

      expect(configResult.getLoadedPlugin('case-police')?.meta?.version).toBe(
        DEV_PLUGIN.meta.version,
      );
    });
  });
});

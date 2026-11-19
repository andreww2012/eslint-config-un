import type {EslintConfigUnOptions, ExtraPluginsType} from '../../src/config-un/shared';
import type {EslintPlugin} from '../../src/eslint/eslint-types';
import {getLoadedPluginsWithExtraPlugins} from '../helpers/extra-plugins';

const EXTRA_PLUGIN: Readonly<EslintPlugin> = {
  rules: {'my-rule': {meta: {type: 'problem', schema: []}, create: () => ({})}},
};

const getPluginPrefixes = async <const ExtraPlugins extends ExtraPluginsType>(
  options: EslintConfigUnOptions<ExtraPlugins>,
) => Object.keys(await getLoadedPluginsWithExtraPlugins(options));

describe('option: `extraPlugins`', () => {
  it('registers the plugin when one of its rules is used and every loadable plugin is loaded', async () => {
    await expect(
      getPluginPrefixes({
        loadPluginsOnDemand: false,
        extraPlugins: {extra: EXTRA_PLUGIN},
        extraConfigs: [{rules: {'extra/my-rule': 'error'}}],
      }),
    ).resolves.toContain('extra');
  });

  it('registers the plugin when one of its rules is used', async () => {
    await expect(
      getPluginPrefixes({
        extraPlugins: {extra: EXTRA_PLUGIN},
        extraConfigs: [{rules: {'extra/my-rule': 'error'}}],
      }),
    ).resolves.toContain('extra');
  });

  it('does not register the plugin when none of its rules is used', async () => {
    await expect(getPluginPrefixes({extraPlugins: {extra: EXTRA_PLUGIN}})).resolves.not.toContain(
      'extra',
    );
  });

  it('accepts a function returning the plugin', async () => {
    await expect(
      getPluginPrefixes({
        extraPlugins: {extra: () => EXTRA_PLUGIN},
        extraConfigs: [{rules: {'extra/my-rule': 'error'}}],
      }),
    ).resolves.toContain('extra');
  });

  describe('invalid prefixes', () => {
    let processOutput: ReturnType<typeof spyOnProcessOutput>;

    beforeEach(() => {
      processOutput = spyOnProcessOutput();
    });

    it('reports a prefix of a built-in plugin and exits', async () => {
      await getPluginPrefixes({extraPlugins: {unicorn: EXTRA_PLUGIN}});

      expect(processOutput.exit).toHaveBeenCalledWith(1);
      expect(processOutput.getStderrOutput()).toContain('Invalid extra plugin prefixes');
    });

    it('reports a prefix taken by the `plugins` option and exits', async () => {
      await getPluginPrefixes({
        plugins: {unicorn: {prefix: 'unicorn-renamed'}},
        extraPlugins: {'unicorn-renamed': EXTRA_PLUGIN},
      });

      expect(processOutput.exit).toHaveBeenCalledWith(1);
      expect(processOutput.getStderrOutput()).toContain('Invalid extra plugin prefixes');
    });
  });
});

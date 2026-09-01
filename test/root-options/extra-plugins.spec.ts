import {eslintConfigInternal} from '../../src/config-un/config';
import type {EslintConfigUnOptions, ExtraPluginsType} from '../../src/config-un/shared';
import type {EslintPlugin} from '../../src/eslint/eslint-types';

const EXTRA_PLUGIN = {
  rules: {'my-rule': {meta: {type: 'problem', schema: []}, create: () => ({})}},
} satisfies EslintPlugin;

/**
 * The shared `computeEslintConfig` helper cannot be used here: it deliberately does not take the
 * extra plugins as a generic parameter, without which the prefixes they add are unknown to the
 * option types; instantiating those types per call site is prohibitively expensive
 */
const getPluginPrefixes = async <const ExtraPlugins extends ExtraPluginsType>(
  options: EslintConfigUnOptions<ExtraPlugins>,
) => {
  const config = await eslintConfigInternal(
    {defaultConfigsStatus: 'all-disabled', offlineMode: false, cacheConfigs: false, ...options},
    {disableWarnings: true, skipTypeInfoSplit: true},
  );

  return Object.keys(
    config.find(({name}) => name === 'eslint-config-un/global-setup/plugins')?.plugins || {},
  );
};

describe('option: `extraPlugins`', () => {
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

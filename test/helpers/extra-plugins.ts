import {eslintConfigInternal} from '../../src/config-un/config';
import type {EslintConfigUnOptions, ExtraPluginsType} from '../../src/config-un/shared';

/**
 * Returns the plugins of the config generated from the options, which may have `extraPlugins`.
 *
 * The shared `computeEslintConfig` helper cannot be used with extra plugins: it deliberately does
 * not take them as a generic parameter, without which the prefixes they add are unknown to the
 * option types; instantiating those types per call site is prohibitively expensive
 */
export const getLoadedPluginsWithExtraPlugins = async <const ExtraPlugins extends ExtraPluginsType>(
  options: EslintConfigUnOptions<ExtraPlugins>,
) => {
  const config = await eslintConfigInternal(
    {defaultConfigsStatus: 'all-disabled', offlineMode: false, cacheConfigs: false, ...options},
    {disableWarnings: true, skipTypeInfoSplit: true},
  );

  return config.find(({name}) => name === 'eslint-config-un/global-setup/plugins')?.plugins || {};
};

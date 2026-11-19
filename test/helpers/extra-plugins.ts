import {eslintConfigInternal} from '../../src/config-un/config';
import type {
  EslintConfigUnInternalOptions,
  EslintConfigUnOptions,
  ExtraPluginsType,
} from '../../src/config-un/shared';
import type {OmitStrict} from '../../src/types';

const INTERNAL_OPTIONS: Readonly<OmitStrict<EslintConfigUnInternalOptions, 'testMode'>> = {
  disableWarnings: true,
  skipTypeInfoSplit: true,
};

/**
 * Returns the plugins of the config generated from the options, which may have `extraPlugins`
 */
export const getLoadedPluginsWithExtraPlugins = async <const ExtraPlugins extends ExtraPluginsType>(
  options: EslintConfigUnOptions<ExtraPlugins>,
) => {
  // The shared `computeEslintConfig` helper doesn't know the prefixes the extra plugins add: taking
  // them as a type parameter would make type checking too slow
  const config = await eslintConfigInternal(
    {defaultConfigsStatus: 'all-disabled', offlineMode: false, cacheConfigs: false, ...options},
    INTERNAL_OPTIONS,
  );

  return config.find(({name}) => name === 'eslint-config-un/global-setup/plugins')?.plugins || {};
};

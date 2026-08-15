import {ERROR, GLOB_JSON, GLOB_TS_X, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [Nx](https://nx.dev) specific rules.
 *
 * 📁 Default `files`: <code>**&#47;*.?([cm])ts?(x)</code>
 */
export interface NxEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'nx'> {
  /**
   * @default false
   */
  enforceModuleBoundaries?: boolean | GetRuleOptions<'nx', 'enforce-module-boundaries'>;
}

export default defineUnConfig<NxEslintConfigOptions>('nx', {enabledBy: {package: 'nx'}})((
  context,
  optionsRaw,
) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    enforceModuleBoundaries: false,
  });

  const {enforceModuleBoundaries} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'nx');

  configBuilder
    ?.addConfig([
      'nx',
      {
        filesDefault: [GLOB_TS_X],
      },
    ])
    .addRule(
      'enforce-module-boundaries',
      enforceModuleBoundaries ? ERROR : OFF,
      typeof enforceModuleBoundaries === 'object' ? [enforceModuleBoundaries] : [],
    )
    .addOverrides();

  const configBuilderJson = context.createConfigBuilder(optionsResolved, 'nx');

  configBuilderJson
    ?.addConfig([
      'nx/json',
      {
        filesDefault: [GLOB_JSON],
        language: ['jsonc', 'x'],
      },
    ])
    .addRule('dependency-checks', ERROR) /** @since 16.4.0 */
    .addRule('enforce-module-boundaries', OFF) /** @since 16.0.0 */
    .addRule('nx-plugin-checks', ERROR) /** @since 16.0.0 */
    .enableConfigTesterForPlugin('nx')
    .addOverrides();

  return {
    configs: [configBuilder, configBuilderJson],
    optionsResolved,
  };
});

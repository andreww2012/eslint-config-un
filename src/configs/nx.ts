import {ERROR, GLOB_JSON, GLOB_TS_X, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

export interface NxEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, 'nx'> {
  /**
   * @default false
   */
  enforceModuleBoundaries?: boolean | GetRuleOptions<'nx', 'enforce-module-boundaries'>;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    enforceModuleBoundaries: false,
  } satisfies NxEslintConfigOptions);

  const {enforceModuleBoundaries} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'nx');

  configBuilder
    ?.addConfig([
      'nx',
      {
        includeDefaultFilesAndIgnores: true,
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
        includeDefaultFilesAndIgnores: true,
        filesDefault: [GLOB_JSON],
        parser: 'jsonc-eslint-parser',
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
}) satisfies UnConfigFn<'nx'>;

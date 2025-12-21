import {ERROR, GLOB_JS_TS_X, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

export interface BarrelFilesEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, 'barrel-files'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(
    optionsRaw,
    {} satisfies Partial<BarrelFilesEslintConfigOptions>,
  );

  const configBuilder = context.createConfigBuilder(optionsResolved, 'barrel-files');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'barrel-files',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: [GLOB_JS_TS_X],
      },
    ])
    .addRule('avoid-barrel-files', OFF) /** @since 1.0.0 */
    .addRule('avoid-importing-barrel-files', OFF) /** @since 2.0.0 */
    .addRule('avoid-namespace-import', OFF) /** @since 1.0.0 */
    .addRule('avoid-re-export-all', ERROR) /** @since 2.0.0 */
    .enableConfigTesterForPlugin('barrel-files')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'barrelFiles'>;

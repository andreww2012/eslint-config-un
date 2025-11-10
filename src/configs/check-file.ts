import {OFF} from '../constants';
import type {FlatConfigEntryFilesOrIgnores} from '../eslint';
import {generatePackageToLoadProperty} from '../loaders';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

export interface CheckFileEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends UnConfigOptions<ExtraPlugins, 'check-file'> {
  /**
   * Allows to which files should `eslint-processor-check-file` processor be applied.
   * This might be necessary if some files are not processed by other processors
   * but still require linting by this config's plugin.
   */
  configEnableCheckFileProcessor?: FlatConfigEntryFilesOrIgnores;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies CheckFileEslintConfigOptions);

  const {configEnableCheckFileProcessor} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'check-file');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['check-file', {includeDefaultFilesAndIgnores: true}])
    .addRule('filename-blocklist', OFF) /** @since 2.0.0 */
    .addRule('filename-naming-convention', OFF) /** @since 1.0.0 */
    .addRule('folder-match-with-fex', OFF) /** @since 1.0.0 */
    .addRule('folder-naming-convention', OFF) /** @since 1.1.0 */
    .addRule('no-index', OFF) /** @since 1.0.0 */
    .enableConfigTesterForPlugin('check-file')
    .addOverrides();

  const configBuilderEnableCheckFileProcessor = configEnableCheckFileProcessor
    ? context.createConfigBuilder(configEnableCheckFileProcessor, null)
    : null;

  configBuilderEnableCheckFileProcessor?.addConfig(
    ['check-file/processor', {includeDefaultFilesAndIgnores: true}],
    // @ts-expect-error Type '{ [packageToLoadSymbol]: ...' has no properties in common with type 'FlatConfigEntryForBuilder'.
    {
      ...generatePackageToLoadProperty('processor', 'checkFileProcessor'),
    },
  );

  return {
    configs: [configBuilder, configBuilderEnableCheckFileProcessor],
    optionsResolved,
  };
}) satisfies UnConfigFn<'checkFile'>;

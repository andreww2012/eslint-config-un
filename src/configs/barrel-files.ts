import {ERROR, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * An ESLint plugin related to "barrel files" usage.
 *
 * 📁 Default `files`: <code>**&#47;*.?([cm])[jt]s?(x)</code>
 */
export interface BarrelFilesEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'barrel-files'> {}

export default defineUnConfig<BarrelFilesEslintConfigOptions>(
  'barrelFiles',
  false,
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'barrel-files');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig('barrel-files')
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
});

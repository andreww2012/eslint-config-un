import {GLOB_JS_TS_X, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface AntfuEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'antfu'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(
    optionsRaw,
    {} satisfies Partial<AntfuEslintConfigOptions>,
  );

  const configBuilder = context.createConfigBuilder(optionsResolved, 'antfu');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'antfu',
      {
        includeDefaultFilesAndIgnores: true,
        filesDefault: [GLOB_JS_TS_X],
      },
    ])
    .addRule('consistent-chaining', OFF) /** @since 2.4.0 */
    .addRule('consistent-list-newline', OFF) /** @since 1.0.0-beta.5 */
    .addRule('curly', OFF) /** @since 2.3.0 */
    .addRule('if-newline', OFF) /** @since 0.19.4 */
    .addRule('import-dedupe', OFF) /** @since 0.21.0 */
    .addRule('indent-unindent', OFF) /** @since 2.2.0 */
    .addRule('no-import-dist', OFF) /** @since 2.1.0 */
    .addRule('no-import-node-modules-by-path', OFF) /** @since 0.40.0 */
    .addRule('no-top-level-await', OFF) /** @since 2.7.0 */
    .addRule('no-ts-export-equal', OFF) /** @since 0.39.0 */
    .addRule('top-level-function', OFF) /** @since 0.38.0 */
    .enableConfigTesterForPlugin('antfu')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'antfu'>;

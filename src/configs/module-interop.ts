import {ERROR, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface ModuleInteropEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'module-interop'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'module-interop');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig('module-interop')
    .addRule('no-import-cjs', OFF) /** @since 0.1.0 */
    .addRule('no-require-esm', OFF) /** @since 0.1.0 */
    .addRule('prefer-json-modules', ERROR) /** @since 0.3.0 */ // 🟢
    .enableConfigTesterForPlugin('module-interop')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'moduleInterop'>;

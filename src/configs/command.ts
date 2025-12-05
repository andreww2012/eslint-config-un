import {ERROR} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

export interface CommandEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, 'command'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(
    optionsRaw,
    {} satisfies Partial<CommandEslintConfigOptions>,
  );

  const configBuilder = context.createConfigBuilder(optionsResolved, 'command');

  configBuilder
    ?.addConfig(['command', {includeDefaultFilesAndIgnores: true}])
    .addRule('command', ERROR) /** @since 0.0.0 */
    .enableConfigTesterForPlugin('command')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'command'>;

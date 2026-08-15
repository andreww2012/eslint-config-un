import {ERROR} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * An ESLint plugin serving as a codemod triggered by special comments.
 *
 * 📁 Default `files`: all files
 */
export interface CommandEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'command'> {}

export default defineUnConfig<CommandEslintConfigOptions>(
  'command',
  false,
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'command');

  configBuilder
    ?.addConfig('command')
    .addRule('command', ERROR) /** @since 0.0.0 */
    .enableConfigTesterForPlugin('command')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});

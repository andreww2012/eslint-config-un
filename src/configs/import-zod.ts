import {ERROR} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface ImportZodEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'import-zod'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies ImportZodEslintConfigOptions);

  const configBuilder = context.createConfigBuilder(optionsResolved, 'import-zod');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['import-zod', {includeDefaultFilesAndIgnores: true}])
    .addRule('prefer-zod-namespace', ERROR) /** @since 0.1.0 */ // 🟢
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'importZod'>;

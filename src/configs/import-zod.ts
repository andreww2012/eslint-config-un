import {ERROR} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * An ESLint plugin to enforce namespace imports for zod.
 * See
 * [this Zod issue comment](https://github.com/colinhacks/zod/issues/4433#issuecomment-2921500831)
 * why this might be needed.
 *
 * **Note:** you should probably use `zod` config instead, which includes the similar rule
 * and bunch of others zod rules.
 *
 * 📁 Default `files`: all files
 */
export interface ImportZodEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'import-zod'> {}

export default defineUnConfig<ImportZodEslintConfigOptions>(
  'importZod',
  false,
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'import-zod');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig('import-zod')
    .addRule('prefer-zod-namespace', ERROR) /** @since 0.1.0 */ // 🟢
    .enableConfigTesterForPlugin('import-zod')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});

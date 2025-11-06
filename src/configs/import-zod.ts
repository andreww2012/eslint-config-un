import {ERROR} from '../constants';
import {type ExtraPluginsType, type UnConfigOptions, assignDefaults, defineUnConfig} from './index';

export interface ImportZodEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends UnConfigOptions<ExtraPlugins, 'import-zod'> {}

export default defineUnConfig('importZod', (context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies ImportZodEslintConfigOptions);

  const configBuilder = context.createConfigBuilder(optionsResolved, 'import-zod');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['import-zod', {includeDefaultFilesAndIgnores: true}])
    .addRule('prefer-zod-namespace', ERROR) // 🟢
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});

import {ERROR} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface ImportZodEslintConfigOptions extends UnConfigOptions<'import-zod'> {}

export const importZodUnConfig: UnConfigFn<'importZod'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.importZod;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies ImportZodEslintConfigOptions);

  const configBuilder = createConfigBuilder(context, optionsResolved, 'import-zod');

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
};

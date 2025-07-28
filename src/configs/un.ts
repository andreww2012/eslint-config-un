import {ERROR, GLOB_TSX} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface UnEslintConfigOptions extends UnConfigOptions<'un'> {}

export const unUnConfig: UnConfigFn<'un'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.un;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies UnEslintConfigOptions);

  const configBuilder = createConfigBuilder(context, optionsResolved, 'un');

  configBuilder
    ?.addConfig([
      'un',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: [GLOB_TSX],
      },
    ])
    .addRule('prefer-early-return', ERROR)
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

import {ERROR} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface UnnecessaryAbstractionsEslintConfigOptions
  extends UnConfigOptions<'unnecessary-abstractions'> {}

export const unnecessaryAbstractionsUnConfig: UnConfigFn<'unnecessaryAbstractions'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.unnecessaryAbstractions;
  const optionsResolved = assignDefaults(
    optionsRaw,
    {} satisfies UnnecessaryAbstractionsEslintConfigOptions,
  );

  const configBuilder = createConfigBuilder(context, optionsResolved, 'unnecessary-abstractions');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['unnecessary-abstractions', {includeDefaultFilesAndIgnores: true}])
    .addRule('no-ternary-wrappers', ERROR)
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

import {ERROR, OFF, WARNING} from '../constants';
import {type ConfigSharedOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface PromiseEslintConfigOptions extends ConfigSharedOptions<'promise'> {}

export const promiseUnConfig: UnConfigFn<'promise'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.promise;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies PromiseEslintConfigOptions);

  const configBuilder = createConfigBuilder(context, optionsResolved, 'promise');

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig(['promise', {includeDefaultFilesAndIgnores: true}])
    .addRule('always-return', ERROR, [{ignoreLastCallback: true}]) // 🟢
    .addRule('avoid-new', OFF)
    .addRule('catch-or-return', ERROR, [{allowThenStrict: true, allowFinally: true}]) // 🟢
    .addRule('no-callback-in-promise', ERROR) // 🟡
    .addRule('no-multiple-resolved', WARNING)
    .addRule('no-native', OFF)
    .addRule('no-nesting', WARNING) // 🟡
    .addRule('no-new-statics', ERROR) // 🟢
    .addRule('no-promise-in-callback', WARNING) // 🟡
    .addRule('no-return-in-finally', ERROR) // 🟡
    .addRule('no-return-wrap', ERROR, [{allowReject: true}]) // 🟢
    .addRule('param-names', ERROR) // 🟢
    .addRule('prefer-await-to-callbacks', OFF)
    .addRule('prefer-await-to-then', OFF)
    .addRule('prefer-catch', ERROR)
    .addRule('spec-only', ERROR)
    .addRule('valid-params', ERROR) // 🟡
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

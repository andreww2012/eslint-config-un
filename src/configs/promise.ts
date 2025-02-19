// @ts-expect-error no typings
import eslintPluginPromise from 'eslint-plugin-promise';
import {ERROR, WARNING} from '../constants';
import {ConfigEntryBuilder, type ConfigSharedOptions, type FlatConfigEntry} from '../eslint';
import type {InternalConfigOptions} from './index';

export interface PromiseEslintConfigOptions extends ConfigSharedOptions<'promise'> {}

export const promiseEslintConfig = (
  options: PromiseEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const builder = new ConfigEntryBuilder<'promise'>(options, internalOptions);

  builder
    .addConfig(['promise', {includeDefaultFilesAndIgnores: true}])
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    .addBulkRules(eslintPluginPromise.configs.recommended.rules)
    .addRule('promise/always-return', ERROR, [{ignoreLastCallback: true}])
    // .addRule('avoid-new', OFF)
    .addRule('promise/catch-or-return', ERROR, [
      {
        allowThenStrict: true,
        allowFinally: true,
      },
    ])
    .addRule('promise/no-callback-in-promise', ERROR) // Default: warn
    .addRule('promise/no-multiple-resolved', WARNING)
    // .addRule('promise/no-native', OFF)
    .addRule('promise/no-nesting', WARNING)
    // .addRule('promise/no-new-statics', ERROR)
    .addRule('promise/no-promise-in-callback', WARNING)
    .addRule('promise/no-return-in-finally', ERROR) // Default: warn
    .addRule('promise/no-return-wrap', ERROR, [{allowReject: true}])
    // .addRule('promise/param-names', ERROR)
    // .addRule('promise/prefer-await-to-callbacks', OFF)
    // .addRule('promise/prefer-await-to-then', OFF)
    .addRule('promise/prefer-catch', ERROR)
    .addRule('promise/spec-only', ERROR)
    .addRule('promise/valid-params', ERROR) // Default: warn
    .addOverrides();

  return builder.getAllConfigs();
};

import eslintPluginPromise from 'eslint-plugin-promise';
import {ERROR, WARNING} from '../constants';
import {ConfigEntryBuilder, type ConfigSharedOptions, type FlatConfigEntry} from '../eslint';
import type {InternalConfigOptions} from './index';

export interface PromiseEslintConfigOptions extends ConfigSharedOptions<'promise'> {}

export const promiseEslintConfig = (
  options: PromiseEslintConfigOptions,
  internalOptions: InternalConfigOptions,
): FlatConfigEntry[] => {
  const builder = new ConfigEntryBuilder('promise', options, internalOptions);

  builder
    .addConfig(['promise', {includeDefaultFilesAndIgnores: true}])
    // @ts-expect-error no proper types
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    .addBulkRules(eslintPluginPromise.configs.recommended.rules)
    .addRule('always-return', ERROR, [{ignoreLastCallback: true}])
    // .addRule('avoid-new', OFF)
    .addRule('catch-or-return', ERROR, [
      {
        allowThenStrict: true,
        allowFinally: true,
      },
    ])
    .addRule('no-callback-in-promise', ERROR) // Default: warn
    .addRule('no-multiple-resolved', WARNING)
    // .addRule('no-native', OFF)
    .addRule('no-nesting', WARNING)
    // .addRule('no-new-statics', ERROR)
    .addRule('no-promise-in-callback', WARNING)
    .addRule('no-return-in-finally', ERROR) // Default: warn
    .addRule('no-return-wrap', ERROR, [{allowReject: true}])
    // .addRule('param-names', ERROR)
    // .addRule('prefer-await-to-callbacks', OFF)
    // .addRule('prefer-await-to-then', OFF)
    .addRule('prefer-catch', ERROR)
    .addRule('spec-only', ERROR)
    .addRule('valid-params', ERROR) // Default: warn
    .addOverrides();

  return builder.getAllConfigs();
};

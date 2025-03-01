// @ts-expect-error no typings
import * as eslintPluginQwik from 'eslint-plugin-qwik';
import {ERROR, GLOB_JS_TS_X, OFF} from '../constants';
import {ConfigEntryBuilder, type ConfigSharedOptions, type FlatConfigEntry} from '../eslint';
import type {InternalConfigOptions} from './index';

export interface QwikEslintConfigOptions extends ConfigSharedOptions<'qwik'> {
  routesDir?: string;
}

export const qwikEslintConfig = (
  options: QwikEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const {routesDir} = options;

  const builder = new ConfigEntryBuilder<'qwik'>(options, internalOptions);

  // Legend:
  // 🟣 - error in recommended
  // 🟢 - error in strict

  builder
    .addConfig([
      'qwik',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: [GLOB_JS_TS_X],
      },
    ])
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    .addBulkRules(eslintPluginQwik.configs.strict.rules)
    // .addRule('qwik/use-method-usage', ERROR) // 🟣🟢
    // .addRule('qwik/valid-lexical-scope', ERROR) // 🟣🟢
    .addRule('qwik/loader-location', ERROR, [{routesDir}]) // 🟢
    // .addRule('qwik/no-react-props', ERROR) // 🟣🟢
    // .addRule('qwik/prefer-classlist', ERROR) // 🟢
    // .addRule('qwik/jsx-no-script-url', ERROR) // 🟢
    .addRule('qwik/jsx-key', ERROR, [
      {
        checkFragmentShorthand: true, // Default: false
        // checkKeyMustBeforeSpread: true, // Doesn't do anything :)
        warnOnDuplicates: true, // Default: false
      },
    ]) // 🟢
    // TODO not sure if this is useful - `no-unused-vars` should catch the same problems?
    // .addRule('qwik/unused-server', ERROR) // 🟣🟢
    .addRule('qwik/jsx-img', OFF) // 🟢
    // .addRule('qwik/jsx-a', ERROR) // 🟢
    // .addRule('qwik/no-use-visible-task', ERROR) // 🟢
    .addOverrides();

  return builder.getAllConfigs();
};

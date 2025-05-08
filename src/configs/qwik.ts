import {ERROR, GLOB_JS_TS_X, OFF} from '../constants';
import {ConfigEntryBuilder, type ConfigSharedOptions} from '../eslint';
import {pluginsLoaders} from '../plugins';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface QwikEslintConfigOptions extends ConfigSharedOptions<'qwik'> {
  routesDir?: string;
}

export const qwikUnConfig: UnConfigFn<'qwik'> = async (context) => {
  const eslintPluginQwik = await pluginsLoaders.qwik();

  const optionsRaw = context.rootOptions.configs?.qwik;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies QwikEslintConfigOptions);

  const {routesDir} = optionsResolved;

  const configBuilder = new ConfigEntryBuilder('qwik', optionsResolved, context);

  // Legend:
  // 🟣 - error in recommended
  // 🟢 - error in strict

  configBuilder
    .addConfig([
      'qwik',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: [GLOB_JS_TS_X],
      },
    ])
    // @ts-expect-error no proper types
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    .addBulkRules(eslintPluginQwik.configs.strict.rules)
    // .addRule('use-method-usage', ERROR) // 🟣🟢
    // .addRule('valid-lexical-scope', ERROR) // 🟣🟢
    .addRule('loader-location', ERROR, [{routesDir}]) // 🟢
    // .addRule('no-react-props', ERROR) // 🟣🟢
    // .addRule('prefer-classlist', ERROR) // 🟢
    // .addRule('jsx-no-script-url', ERROR) // 🟢
    .addRule('jsx-key', ERROR, [
      {
        checkFragmentShorthand: true, // Default: false
        // checkKeyMustBeforeSpread: true, // Doesn't do anything :)
        warnOnDuplicates: true, // Default: false
      },
    ]) // 🟢
    // TODO not sure if this is useful - `no-unused-vars` should catch the same problems?
    // .addRule('unused-server', ERROR) // 🟣🟢
    .addRule('jsx-img', OFF) // 🟢
    // .addRule('jsx-a', ERROR) // 🟢
    // .addRule('no-use-visible-task', ERROR) // 🟢
    .addOverrides();

  return {
    configs: configBuilder.getAllConfigs(),
    optionsResolved,
  };
};

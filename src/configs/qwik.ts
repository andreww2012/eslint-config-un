import {ERROR, GLOB_JS_TS_X, OFF} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface QwikEslintConfigOptions extends UnConfigOptions<'qwik'> {
  routesDir?: string;
}

export const qwikUnConfig: UnConfigFn<'qwik'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.qwik;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies QwikEslintConfigOptions);

  const {routesDir} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'qwik');

  // Legend:
  // 🟢 - in recommended
  // 🟣 - in strict

  configBuilder
    ?.addConfig([
      'qwik',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: [GLOB_JS_TS_X],
      },
    ])
    .addRule('jsx-key', ERROR, [
      {
        checkFragmentShorthand: true, // Default: false
        // checkKeyMustBeforeSpread: true, // Doesn't do anything :)
        warnOnDuplicates: true, // Default: false
      },
    ]) // 🟣
    .addRule('jsx-a', ERROR) // 🟣
    .addRule('jsx-img', OFF) // 🟣
    .addRule('jsx-no-script-url', ERROR) // 🟣
    .addRule('loader-location', ERROR, [{routesDir}]) // 🟣
    .addRule('no-react-props', ERROR) // 🟢🟣
    .addRule('no-use-visible-task', ERROR) // 🟣
    .addRule('prefer-classlist', ERROR) // 🟣
    // TODO not sure if this is useful - `no-unused-vars` should catch the same problems?
    .addRule('unused-server', ERROR) // 🟢🟣
    .addRule('use-method-usage', ERROR) // 🟢🟣
    .addRule('valid-lexical-scope', ERROR) // 🟢🟣
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

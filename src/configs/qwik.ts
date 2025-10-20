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
    .addRule('jsx-a', ERROR) /** @since 1.2.11 */ // 🟣
    .addRule('jsx-img', OFF) /** @since 1.1.0 */ // 🟣
    .addRule('jsx-key', ERROR, [
      {
        checkFragmentShorthand: true, // Default: false
        // checkKeyMustBeforeSpread: true, // Doesn't do anything :)
        warnOnDuplicates: true, // Default: false
      },
    ]) /** @since 0.22.0 */ // 🟣
    .addRule('jsx-no-script-url', ERROR) /** @since 0.22.0 */ // 🟣
    .addRule('loader-location', ERROR, [{routesDir}]) /** @since 0.17.0 */ // 🟣
    .addRule('no-react-props', ERROR) /** @since 0.22.0 */ // 🟢🟣
    .addRule('no-use-visible-task', ERROR) /** @since 1.3.0 */ // 🟣
    .addRule('prefer-classlist', ERROR) /** @since 0.22.0 */ // 🟣
    // TODO not sure if this is useful - `no-unused-vars` should catch the same problems?
    .addRule('unused-server', ERROR) /** @since 0.24.0 */ // 🟢🟣
    .addRule('use-method-usage', ERROR) /** @since 0.102.0 */ // 🟢🟣
    .addRule('valid-lexical-scope', ERROR) /** @since 0.0.26 */ // 🟢🟣
    .enableConfigTesterForPlugin('qwik')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

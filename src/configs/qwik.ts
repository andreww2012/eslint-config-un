import {ERROR, GLOB_JS_TS_X, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [qwik](https://qwik.dev) specific rules.
 *
 * 📁 Default `files`: <code>**&#47;*.?([cm])[jt]s?(x)</code>
 */
export interface QwikEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'qwik'> {
  routesDir?: string;
}

export default defineUnConfig<QwikEslintConfigOptions>('qwik', {
  enabledBy: {packages: ['@builder.io/qwik', '@qwik.dev/core']},
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {routesDir} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'qwik');

  // Legend:
  // 🟢 - in recommended
  // 🟣 - in strict

  configBuilder
    ?.addConfig([
      'qwik',
      {
        filesDefault: [GLOB_JS_TS_X],
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
    .addRule('loader-location', ERROR, routesDir == null ? [] : [{routesDir}]) /** @since 0.17.0 */ // 🟣
    .addRule('no-async-prevent-default', ERROR) /** @since 1.19.1 */ // 🟢🟣 (warns)
    .addRule('no-react-props', ERROR) /** @since 0.22.0 */ // 🟢🟣
    .addRule('no-use-visible-task', ERROR) /** @since 1.3.0 */ // 🟣
    .addRule('prefer-classlist', ERROR) /** @since 0.22.0 */ // 🟣
    // TODO not sure if this is useful - `no-unused-vars` should catch the same problems?
    .addRule('unused-server', ERROR) /** @since 0.24.0 */ // 🟢🟣
    .addRule('use-method-usage', ERROR) /** @since 0.102.0 */ // 🟢🟣
    // TODO requires type information
    .addRule('valid-lexical-scope', ERROR) /** @since 0.0.26 */ // 🟢🟣
    .enableConfigTesterForPlugin('qwik')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});

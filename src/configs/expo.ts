import {ERROR, GLOB_JS_TS_X, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [Expo](https://expo.dev) specific rules.
 *
 * 📁 Default `files`: <code>**&#47;*.?([cm])[jt]s?(x)</code>
 */
export interface ExpoEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'expo'> {}

export default defineUnConfig<ExpoEslintConfigOptions>('expo', {
  enabledBy: {package: 'expo'},
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'expo');

  // Legend:
  // 🔴 - NOT in the official `eslint-config-expo` config

  configBuilder
    ?.addConfig(['expo', {filesDefault: [GLOB_JS_TS_X]}])
    .addRule('no-dynamic-env-var', ERROR) /** @since 0.0.1-canary-20240327-a7302d9 */
    .addRule('no-env-var-destructuring', ERROR) /** @since 0.0.1-canary-20240327-a7302d9 */
    // Only relevant on the New Architecture, and `boxShadow` support on Android starts at v9
    .addRule('prefer-box-shadow', OFF) /** @since 0.2.0-canary-20250722-599a28f */ // 🔴
    .addRule('use-dom-exports', ERROR) /** @since 0.2.0-canary-20250722-599a28f */
    .enableConfigTesterForPlugin('expo')
    .addOverrides();
});

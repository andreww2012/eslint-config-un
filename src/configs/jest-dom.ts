import {ERROR, GLOB_JS_TS_X_EXTENSION, OFF} from '../constants';
import {generateDefaultTestFiles} from './shared';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [`@testing-library/jest-dom`](https://github.com/testing-library/jest-dom/blob/HEAD/README.md)
 * specific rules.
 * Note that, contrary to its name, this package can be used with other testing libraries, for
 * example `vitest`, so it doesn't belong to any top-level config.
 *
 * 📁 Default `files`:
 * - <code>**&#47;*{[._-]spec,.test}.?([cm])[jt]s?(x)</code>
 * - <code>\*\*&#47;_\_test?(s)__/*\*&#47;\*.?([cm])[jt]s?(x)</code>
 */
export interface JestDomEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'jest-dom'> {}

export default defineUnConfig<JestDomEslintConfigOptions>('jestDom', {
  enabledBy: {package: '@testing-library/jest-dom'},
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const defaultJestDomFiles = generateDefaultTestFiles(GLOB_JS_TS_X_EXTENSION);

  const configBuilder = context.createConfigBuilder(optionsResolved, 'jest-dom');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'jest-dom',
      {
        filesDefault: defaultJestDomFiles,
      },
    ])
    .addRule('prefer-checked', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('prefer-empty', ERROR) /** @since 2.0.0 */ // 🟢
    .addRule('prefer-enabled-disabled', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('prefer-focus', ERROR) /** @since 1.4.0 */ // 🟢
    .addRule('prefer-in-document', ERROR) /** @since 3.3.0 */ // 🟢
    .addRule('prefer-pressed', OFF) /** @since 5.7.0 */
    .addRule('prefer-required', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('prefer-to-have-attribute', ERROR) /** @since 1.2.0 */ // 🟢
    .addRule('prefer-to-have-class', ERROR) /** @since 3.6.0 */ // 🟢
    .addRule('prefer-to-have-style', ERROR) /** @since 3.2.0 */ // 🟢
    .addRule('prefer-to-have-text-content', ERROR) /** @since 2.1.0 */ // 🟢
    .addRule('prefer-to-have-value', ERROR) /** @since 3.5.0 */ // 🟢
    .enableConfigTesterForPlugin('jest-dom')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});

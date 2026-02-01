import {ERROR, GLOB_JS_TS_X_EXTENSION} from '../constants';
import {RULES_TO_DISABLE_IN_TEST_FILES, generateDefaultTestFiles} from './shared';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface JestDomEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'jest-dom'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(
    optionsRaw,
    {} satisfies Partial<JestDomEslintConfigOptions>,
  );

  const defaultJestDomFiles = generateDefaultTestFiles(GLOB_JS_TS_X_EXTENSION);

  const configBuilder = context.createConfigBuilder(optionsResolved, 'jest-dom');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'jest-dom',
      {
        includeDefaultFilesAndIgnores: true,
        filesDefault: defaultJestDomFiles,
      },
    ])
    .addRule('prefer-checked', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('prefer-empty', ERROR) /** @since 2.0.0 */ // 🟢
    .addRule('prefer-enabled-disabled', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('prefer-focus', ERROR) /** @since 1.4.0 */ // 🟢
    .addRule('prefer-in-document', ERROR) /** @since 3.3.0 */ // 🟢
    .addRule('prefer-required', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('prefer-to-have-attribute', ERROR) /** @since 1.2.0 */ // 🟢
    .addRule('prefer-to-have-class', ERROR) /** @since 3.6.0 */ // 🟢
    .addRule('prefer-to-have-style', ERROR) /** @since 3.2.0 */ // 🟢
    .addRule('prefer-to-have-text-content', ERROR) /** @since 2.1.0 */ // 🟢
    .addRule('prefer-to-have-value', ERROR) /** @since 3.5.0 */ // 🟢
    .disableBulkRules(RULES_TO_DISABLE_IN_TEST_FILES)
    .enableConfigTesterForPlugin('jest-dom')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'jestDom'>;

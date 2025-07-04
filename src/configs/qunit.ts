// cspell:ignore jsdump propequal
import {ERROR, GLOB_JS_TS_X_EXTENSION, OFF, WARNING} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import {
  type NoOnlyTestsSubConfigDisabledByDefault,
  generateConfigNoOnlyTestsBuilder,
  generateDefaultTestFiles,
} from './shared';
import type {UnConfigFn} from './index';

export interface QunitEslintConfigOptions
  extends UnConfigOptions<'qunit'>,
    NoOnlyTestsSubConfigDisabledByDefault {
  /**
   * [`eslint-plugin-qunit`](https://npmjs.com/eslint-plugin-qunit) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `qunit` property and applied to the specified `files` and `ignores`.
   */
  settings?: Record<string, unknown>;
}

export const qunitUnConfig: UnConfigFn<'qunit'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.qunit;
  const optionsResolved = assignDefaults(optionsRaw, {
    configNoOnlyTests: false, // has `no-only` rule
  } satisfies QunitEslintConfigOptions);

  const {settings: pluginSettings, configNoOnlyTests} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'qunit');

  const configFilesFallback = generateDefaultTestFiles(GLOB_JS_TS_X_EXTENSION);

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(
      [
        'qunit',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: configFilesFallback,
        },
      ],
      {
        ...(pluginSettings && {
          settings: {
            qunit: pluginSettings,
          },
        }),
      },
    )
    .addRule('assert-args', ERROR) // 🟢
    .addRule('literal-compare-order', ERROR) // 🟢
    .addRule('no-arrow-tests', OFF)
    .addRule('no-assert-equal', ERROR) // 🟢
    .addRule('no-assert-equal-boolean', ERROR) // 🟢
    .addRule('no-assert-logical-expression', ERROR) // 🟢
    .addRule('no-assert-ok', WARNING)
    .addRule('no-async-in-loops', ERROR) // 🟢
    .addRule('no-async-module-callbacks', ERROR) // 🟢
    .addRule('no-async-test', ERROR) // 🟢
    .addRule('no-commented-tests', WARNING) // 🟢
    .addRule('no-compare-relation-boolean', ERROR) // 🟢
    .addRule('no-conditional-assertions', ERROR) // 🟢
    .addRule('no-early-return', ERROR) // 🟢
    .addRule('no-global-assertions', ERROR) // 🟢
    .addRule('no-global-expect', ERROR) // 🟢
    .addRule('no-global-module-test', ERROR) // 🟢
    .addRule('no-global-stop-start', ERROR) // 🟢
    .addRule('no-hooks-from-ancestor-modules', ERROR) // 🟢
    .addRule('no-identical-names', ERROR) // 🟢
    .addRule('no-init', ERROR) // 🟢
    .addRule('no-jsdump', ERROR) // 🟢
    .addRule('no-loose-assertions', WARNING)
    .addRule('no-negated-ok', ERROR) // 🟢
    .addRule('no-nested-tests', ERROR) // 🟢
    .addRule('no-ok-equality', ERROR) // 🟢
    .addRule('no-only', ERROR) // 🟢
    .addRule('no-qunit-push', ERROR) // 🟢
    .addRule('no-qunit-start-in-tests', ERROR) // 🟢
    .addRule('no-qunit-stop', ERROR) // 🟢
    .addRule('no-reassign-log-callbacks', ERROR) // 🟢
    .addRule('no-reset', ERROR) // 🟢
    .addRule('no-setup-teardown', ERROR) // 🟢
    .addRule('no-skip', ERROR)
    .addRule('no-test-expect-argument', ERROR) // 🟢
    .addRule('no-throws-string', ERROR) // 🟢
    .addRule('require-expect', ERROR) // 🟢
    .addRule('require-object-in-propequal', ERROR) // 🟢
    .addRule('resolve-async', ERROR) // 🟢
    .addOverrides();

  const configBuilderNoOnlyTests = generateConfigNoOnlyTestsBuilder(
    context,
    'qunit',
    configNoOnlyTests,
    optionsResolved,
    {filesFallback: configFilesFallback},
  );

  return {
    configs: [configBuilder, configBuilderNoOnlyTests],
    optionsResolved,
  };
};

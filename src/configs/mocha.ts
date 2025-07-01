import globals from 'globals';
import {ERROR, GLOB_JS_TS_X_EXTENSION, OFF, WARNING} from '../constants';
import {type GetRuleOptions, type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import {
  type NoOnlyTestsSubConfigEnabledByDefault,
  generateConfigNoOnlyTestsBuilder,
  generateDefaultTestFiles,
} from './shared';
import type {UnConfigFn} from './index';

export interface MochaEslintConfigOptions
  extends UnConfigOptions<'mocha'>,
    NoOnlyTestsSubConfigEnabledByDefault {
  /**
   * [`eslint-plugin-mocha`](https://npmjs.com/eslint-plugin-mocha) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `mocha/*` property and applied to the specified `files` and `ignores`.
   */
  settings?: {
    additionalCustomNames?: {
      name: string;
      type: 'config' | 'hook' | 'suite' | 'testCase';
      interface: 'BDD' | 'TDD' | 'exports';
    }[];
  };

  /**
   * Affected rules:
   * - [`consistent-interface`](https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/docs/rules/consistent-interface.md)
   */
  enforceInterface?: GetRuleOptions<'mocha', 'consistent-interface'>[0]['interface'];

  /**
   * Enforce the max number of top-level suites in a single file.
   *
   * Affected rules:
   * - [`max-top-level-suites`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/max-top-level-suites.md)
   * @default 1
   */
  maxTopLevelSuites?: number;
}

export const mochaUnConfig: UnConfigFn<'mocha'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.mocha;
  const optionsResolved = assignDefaults(optionsRaw, {
    configNoOnlyTests: true,
    maxTopLevelSuites: 1,
  } satisfies MochaEslintConfigOptions);

  const {
    settings: pluginSettings,
    configNoOnlyTests,
    enforceInterface,
    maxTopLevelSuites,
  } = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'mocha');

  const configFilesFallback = generateDefaultTestFiles(GLOB_JS_TS_X_EXTENSION);

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig(
      [
        'mocha',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: configFilesFallback,
        },
      ],
      {
        languageOptions: {
          globals: globals.mocha,
        },
        ...(pluginSettings && {
          settings: {
            ...Object.fromEntries(
              Object.entries(pluginSettings).map(([name, value]) => [`mocha/${name}`, value]),
            ),
          },
        }),
      },
    )
    .addRule(
      'consistent-interface',
      enforceInterface == null ? OFF : ERROR,
      enforceInterface == null ? [] : [{interface: enforceInterface}],
    )
    .addRule('consistent-spacing-between-blocks', OFF) // 🟢
    .addRule('handle-done-callback', ERROR) // 🟢
    .addRule('max-top-level-suites', ERROR, [{limit: maxTopLevelSuites}])
    .addRule('no-async-suite', ERROR) // 🟢
    .addRule('no-empty-title', ERROR) // 🟢
    .addRule('no-exclusive-tests', ERROR) // 🟡
    .addRule('no-exports', ERROR) // 🟢
    .addRule('no-global-tests', ERROR) // 🟢
    .addRule('no-hooks', OFF)
    .addRule('no-hooks-for-single-case', WARNING)
    .addRule('no-identical-title', ERROR) // 🟢
    .addRule('no-mocha-arrows', ERROR) // 🟢
    .addRule('no-nested-tests', ERROR) // 🟢
    .addRule('no-pending-tests', ERROR) // 🟡☺
    .addRule('no-return-and-callback', ERROR) // 🟢
    .addRule('no-return-from-async', ERROR)
    .addRule('no-setup-in-describe', ERROR) // 🟢
    .addRule('no-sibling-hooks', ERROR) // 🟢
    .addRule('no-synchronous-tests', OFF)
    .addRule('no-top-level-hooks', ERROR) // 🟡
    .addRule('prefer-arrow-callback', OFF)
    .addRule('valid-suite-title', OFF)
    .addRule('valid-test-title', OFF)
    .addOverrides();

  const configBuilderNoOnlyTests = generateConfigNoOnlyTestsBuilder(
    context,
    'mocha',
    configNoOnlyTests,
    optionsResolved,
    {filesFallback: configFilesFallback},
  );

  return {
    configs: [configBuilder, configBuilderNoOnlyTests],
    optionsResolved,
  };
};

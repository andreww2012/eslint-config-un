import {ERROR, GLOB_JS_TS_X_EXTENSION, OFF, WARNING} from '../constants';
import {type FlatConfigEntryForBuilder, type UnConfigOptions, createConfigBuilder} from '../eslint';
import {pluginsLoaders} from '../plugins';
import {assignDefaults} from '../utils';
import {
  type JestEslintConfigOptions,
  generateConsistentTestItOptions,
  generateDefaultTestFiles,
} from './jest';
import type {UnConfigFn} from './index';

// prefer-describe-function-title 1.1.41
export interface VitestEslintConfigOptions
  extends UnConfigOptions<'vitest'>,
    // TODO options jsdocs contain jest-related information
    Pick<
      JestEslintConfigOptions,
      | 'testDefinitionKeyword'
      | 'maxAssertionCalls'
      | 'maxNestedDescribes'
      | 'restrictedMethods'
      | 'restrictedMatchers'
      | 'asyncMatchers'
      | 'minAndMaxExpectArgs'
    > {
  /**
   * `@vitest/eslint-plugin` plugin settings that will be applied to the specified `files` and `ignores`.
   */
  settings?: {
    /**
     * You must set this to `true` if you're using [type testing vitest feature](https://vitest.dev/guide/testing-types).
     * @see https://github.com/vitest-dev/eslint-plugin-vitest?tab=readme-ov-file#enabling-with-type-testing
     */
    typecheck?: boolean;
  };
}

export const vitestUnConfig: UnConfigFn<'vitest'> = async (context) => {
  const eslintPluginVitest = await pluginsLoaders.vitest();

  const optionsRaw = context.rootOptions.configs?.vitest;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies VitestEslintConfigOptions);

  const {
    settings: pluginSettings,
    maxAssertionCalls,
    maxNestedDescribes,
    restrictedMethods,
    restrictedMatchers,
    asyncMatchers,
    minAndMaxExpectArgs,
  } = optionsResolved;

  const defaultVitestEslintConfig: FlatConfigEntryForBuilder = {
    ...(pluginSettings && {
      settings: {
        vitest: pluginSettings,
      },
    }),
    languageOptions: {
      // TODO why `eslint-plugin-vitest-globals` is used instead of this?
      globals: eslintPluginVitest.environments.env.globals,
    },
  };

  const defaultVitestFiles = generateDefaultTestFiles(GLOB_JS_TS_X_EXTENSION);

  const hasRestrictedMethods = Object.keys(restrictedMethods || {}).length > 0;
  const hasRestrictedMatchers = Object.keys(restrictedMatchers || {}).length > 0;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'vitest');

  // Legend:
  // 🟢 - in recommended

  // TODO sync settings with `jest` config?
  configBuilder
    ?.addConfig(
      ['vitest', {includeDefaultFilesAndIgnores: true, filesFallback: defaultVitestFiles}],
      defaultVitestEslintConfig,
    )
    .addRule('consistent-test-filename', OFF)
    .addRule(
      'consistent-test-it',
      optionsResolved.testDefinitionKeyword === false ? OFF : ERROR,
      generateConsistentTestItOptions(optionsResolved),
    )
    .addRule('expect-expect', ERROR) // 🟢
    .addRule('max-expects', maxAssertionCalls == null ? OFF : ERROR, [{max: maxAssertionCalls}])
    .addRule('max-nested-describe', maxNestedDescribes == null ? OFF : ERROR, [
      {max: maxNestedDescribes},
    ])
    .addRule('no-alias-methods', ERROR) // (warns in all)
    .addRule('no-commented-out-tests', WARNING) // 🟢
    .addRule('no-conditional-expect', ERROR) // (warns in all)
    .addRule('no-conditional-in-test', OFF) // (warns in all)
    .addRule('no-conditional-tests', ERROR) // (warns in all)
    .addRule('no-disabled-tests', WARNING) // (warns in all)
    // TODO enabled in `jest`
    .addRule('no-done-callback', OFF) // (warns in all, deprecated)
    .addRule('no-duplicate-hooks', ERROR) // (warns in all)
    .addRule('no-focused-tests', ERROR) // (warns in all)
    .addRule('no-hooks', OFF) // (warns in all)
    .addRule('no-identical-title', ERROR) // 🟢
    .addRule('no-import-node-test', ERROR) // 🟢
    .addRule('no-interpolation-in-snapshots', ERROR) // (warns in all)
    .addRule('no-large-snapshots', OFF) // (warns in all)
    .addRule('no-mocks-import', ERROR) // (warns in all)
    .addRule('no-restricted-matchers', hasRestrictedMatchers ? ERROR : OFF, [
      restrictedMatchers || {},
    ])
    .addRule('no-restricted-vi-methods', hasRestrictedMethods ? ERROR : OFF, [
      restrictedMethods || {},
    ])
    .addRule('no-standalone-expect', ERROR) // (warns in all)
    .addRule('no-test-prefixes', ERROR) // (warns in all)
    .addRule('no-test-return-statement', ERROR) // (warns in all)
    .addRule('prefer-called-with', OFF) // (warns in all)
    .addRule('prefer-comparison-matcher', ERROR) // (warns in all)
    .addRule('prefer-describe-function-title', ERROR) // >=1.1.41
    .addRule('prefer-each', WARNING) // (warns in all)
    .addRule('prefer-equality-matcher', ERROR) // (warns in all)
    .addRule('prefer-expect-assertions', OFF) // (warns in all)
    .addRule('prefer-expect-resolves', ERROR) // (warns in all)
    .addRule('prefer-hooks-in-order', ERROR) // (warns in all)
    .addRule('prefer-hooks-on-top', ERROR) // (warns in all)
    .addRule('prefer-lowercase-title', ERROR) // (warns in all)
    .addRule('prefer-mock-promise-shorthand', ERROR) // (warns in all)
    .addRule('prefer-snapshot-hint', OFF) // (warns in all)
    .addRule('prefer-spy-on', ERROR) // (warns in all)
    .addRule('prefer-strict-equal', WARNING) // (warns in all)
    .addRule('prefer-strict-boolean-matchers', OFF) // >=1.1.26
    .addRule('prefer-to-be', ERROR) // (warns in all)
    .addRule('prefer-to-be-falsy', OFF) // (warns in all)
    .addRule('prefer-to-be-object', ERROR) // (warns in all)
    .addRule('prefer-to-be-truthy', OFF) // (warns in all)
    .addRule('prefer-to-contain', ERROR) // (warns in all)
    .addRule('prefer-to-have-length', ERROR) // (warns in all)
    .addRule('prefer-todo', WARNING) // (warns in all)
    .addRule('require-hook', WARNING) // (warns in all)
    .addRule('require-local-test-context-for-concurrent-snapshots', ERROR) // 🟢
    .addRule('require-mock-type-parameters', WARNING) // >=1.1.27
    .addRule('require-to-throw-message', OFF) // (warns in all)
    .addRule('require-top-level-describe', OFF) // (warns in all)
    .addRule('valid-describe-callback', ERROR) // 🟢
    .addRule('valid-expect', ERROR, [
      {
        alwaysAwait: true, // Default: false
        ...(asyncMatchers?.length && {asyncMatchers}),
        ...(minAndMaxExpectArgs?.[0] != null &&
          minAndMaxExpectArgs[0] >= 0 && {
            minArgs: minAndMaxExpectArgs[0],
          }),
        ...(minAndMaxExpectArgs?.[1] != null &&
          minAndMaxExpectArgs[1] >= 0 && {
            maxArgs: minAndMaxExpectArgs[1],
          }),
      },
    ]) // 🟢
    .addRule('valid-title', ERROR) // 🟢
    .addRule('valid-expect-in-promise', ERROR) // (warns in all)
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

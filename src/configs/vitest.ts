import eslintPluginVitest from '@vitest/eslint-plugin';
import {ERROR, GLOB_JS_TS_X_EXTENSION, OFF, WARNING} from '../constants';
import {
  ConfigEntryBuilder,
  type ConfigSharedOptions,
  type FlatConfigEntry,
  type FlatConfigEntryForBuilder,
} from '../eslint';
import {type JestEslintConfigOptions, generateDefaultTestFiles} from './jest';
import type {InternalConfigOptions} from './index';

export interface VitestEslintConfigOptions
  extends ConfigSharedOptions<'vitest'>,
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

export const vitestEslintConfig = (
  options: VitestEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const {
    settings: pluginSettings,
    testDefinitionKeyword,
    maxAssertionCalls,
    maxNestedDescribes,
    restrictedMethods,
    restrictedMatchers,
    asyncMatchers,
    minAndMaxExpectArgs,
  } = options;

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

  const builder = new ConfigEntryBuilder<'vitest'>(options, internalOptions);

  // Legend:
  // 🟢 - in Recommended

  builder.addConfig('vitest/setup', {
    plugins: {
      vitest: eslintPluginVitest,
    },
  });

  // TODO sync settings with `jest` config?
  builder
    .addConfig(
      [
        'vitest',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: defaultVitestFiles,
        },
      ],
      {
        ...defaultVitestEslintConfig,
      },
    )
    .addBulkRules(eslintPluginVitest.configs.recommended.rules)
    // .addRule('vitest/consistent-test-filename', OFF)
    .addRule('vitest/consistent-test-it', testDefinitionKeyword === false ? OFF : ERROR, [
      {
        fn: 'it',
        withinDescribe: 'it',
        ...testDefinitionKeyword,
      },
    ])
    // .addRule('vitest/expect-expect', ERROR) // 🟢
    .addRule('vitest/max-expects', maxAssertionCalls == null ? OFF : ERROR, [
      {max: maxAssertionCalls},
    ])
    .addRule('vitest/max-nested-describe', maxNestedDescribes == null ? OFF : ERROR, [
      {max: maxNestedDescribes},
    ])
    .addRule('vitest/no-alias-methods', ERROR) // (warns in all)
    .addRule('vitest/no-commented-out-tests', WARNING) // 🟢 (errors)
    .addRule('vitest/no-conditional-expect', ERROR) // (warns in all)
    // .addRule('vitest/no-conditional-in-test', OFF) // (warns in all)
    .addRule('vitest/no-conditional-tests', ERROR) // (warns in all)
    .addRule('vitest/no-disabled-tests', WARNING) // (warns in all)
    // TODO enabled in `jest`
    // .addRule('vitest/no-done-callback', OFF) // (warns in all, deprecated)
    .addRule('vitest/no-duplicate-hooks', ERROR) // (warns in all)
    .addRule('vitest/no-focused-tests', ERROR) // (warns in all)
    // .addRule('vitest/no-hooks', OFF) // (warns in all)
    // .addRule('vitest/no-identical-title', ERROR) // 🟢
    // .addRule('vitest/no-import-node-test', ERROR) // 🟢
    .addRule('vitest/no-interpolation-in-snapshots', ERROR) // (warns in all)
    // .addRule('vitest/no-large-snapshots', OFF) // (warns in all)
    .addRule('vitest/no-mocks-import', ERROR) // (warns in all)
    .addRule('vitest/no-restricted-matchers', hasRestrictedMatchers ? ERROR : OFF, [
      restrictedMatchers || {},
    ])
    .addRule('vitest/no-restricted-vi-methods', hasRestrictedMethods ? ERROR : OFF, [
      restrictedMethods || {},
    ])
    .addRule('vitest/no-standalone-expect', ERROR) // (warns in all)
    .addRule('vitest/no-test-prefixes', ERROR) // (warns in all)
    .addRule('vitest/no-test-return-statement', ERROR) // (warns in all)
    // .addRule('vitest/prefer-called-with', OFF) // (warns in all)
    .addRule('vitest/prefer-comparison-matcher', ERROR) // (warns in all)
    .addRule('vitest/prefer-each', WARNING) // (warns in all)
    .addRule('vitest/prefer-equality-matcher', ERROR) // (warns in all)
    // .addRule('vitest/prefer-expect-assertions', OFF) // (warns in all)
    .addRule('vitest/prefer-expect-resolves', ERROR) // (warns in all)
    .addRule('vitest/prefer-hooks-in-order', ERROR) // (warns in all)
    .addRule('vitest/prefer-hooks-on-top', ERROR) // (warns in all)
    .addRule('vitest/prefer-lowercase-title', ERROR) // (warns in all)
    .addRule('vitest/prefer-mock-promise-shorthand', ERROR) // (warns in all)
    // .addRule('vitest/prefer-snapshot-hint', OFF) // (warns in all)
    .addRule('vitest/prefer-spy-on', ERROR) // (warns in all)
    .addRule('vitest/prefer-strict-equal', WARNING) // (warns in all)
    // .addRule('vitest/prefer-strict-boolean-matchers', OFF) // >=1.1.26
    .addRule('vitest/prefer-to-be', ERROR) // (warns in all)
    .addRule('vitest/prefer-to-be-falsy', ERROR) // (off in all)
    .addRule('vitest/prefer-to-be-object', ERROR) // (warns in all)
    .addRule('vitest/prefer-to-be-truthy', ERROR) // (off in all)
    .addRule('vitest/prefer-to-contain', ERROR) // (warns in all)
    .addRule('vitest/prefer-to-have-length', ERROR) // (warns in all)
    .addRule('vitest/prefer-todo', WARNING) // (warns in all)
    .addRule('vitest/require-hook', WARNING) // (warns in all)
    // .addRule('vitest/require-local-test-context-for-concurrent-snapshots', ERROR) // 🟢
    .addRule('vitest/require-mock-type-parameters', WARNING) // >=1.1.27
    .addRule('vitest/require-to-throw-message', OFF) // (warns in all)
    .addRule('vitest/require-top-level-describe', OFF) // (warns in all)
    // .addRule('vitest/valid-describe-callback', ERROR) // 🟢
    .addRule('vitest/valid-expect', ERROR, [
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
    // .addRule('vitest/valid-title', ERROR) // 🟢
    .addRule('vitest/valid-expect-in-promise', ERROR); // (warns in all)

  return builder.getAllConfigs();
};

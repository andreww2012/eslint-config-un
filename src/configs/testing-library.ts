import {ERROR, GLOB_JS_TS_X_EXTENSION, OFF, WARNING} from '../constants';
import type {ObjectValues, OmitStrict, PickKeysStartingWith, PrettifyDeep} from '../types';
import {doesPackageExist, objectEntriesUnsafe} from '../utils';
import {
  type NoOnlyTestsSubConfigEnabledByDefault,
  generateConfigNoOnlyTestsBuilder,
  generateDefaultTestFiles,
} from './shared';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

interface SharedConfigOptions<ExtraPlugins extends ExtraPluginsType> extends UnFlatConfigEntryBase<
  ExtraPlugins,
  'testing-library'
> {
  /**
   * By default, [`no-node-access` rule](https://github.com/testing-library/eslint-plugin-testing-library/blob/HEAD/docs/rules/no-node-access.md) is enabled,
   * which disallows DOM traversal using native HTML methods and properties.
   * This option allows the use of `firstChild` property
   * [to get the root element of the rendered element](https://testing-library.com/docs/react-testing-library/api/#container-1).
   * @default true
   */
  allowContainerFirstChild?: boolean;

  /**
   * Affected rule:
   * - [`no-render-in-lifecycle`](https://github.com/testing-library/eslint-plugin-testing-library/blob/HEAD/docs/rules/no-render-in-lifecycle.md)
   */
  allowTestingFrameworkSetupHook?: GetRuleOptions<
    'testing-library',
    'no-render-in-lifecycle'
  >['allowTestingFrameworkSetupHook'];

  /**
   * - `explicit`: enables [`prefer-explicit-assert` rule](https://github.com/testing-library/eslint-plugin-testing-library/blob/HEAD/docs/rules/prefer-explicit-assert.md).
   * - `implicit`: enables [`prefer-implicit-assert` rule](https://github.com/testing-library/eslint-plugin-testing-library/blob/HEAD/docs/rules/prefer-implicit-assert.md).
   *
   * By default, assert style is not enforced.
   */
  preferAssertStyle?: 'explicit' | 'implicit';

  /**
   * Affected rule:
   * - [`prefer-query-matchers`](https://github.com/testing-library/eslint-plugin-testing-library/blob/HEAD/docs/rules/prefer-query-matchers.md)
   */
  preferQueryMatchers?: PrettifyDeep<
    (GetRuleOptions<'testing-library', 'prefer-query-matchers'>['validEntries'] & {})[number][]
  >;

  /**
   * Affected rule:
   * - [`prefer-user-event`](https://github.com/testing-library/eslint-plugin-testing-library/blob/HEAD/docs/rules/prefer-user-event.md)
   * @default true
   */
  preferUserEventOverFireEvent?: boolean | GetRuleOptions<'testing-library', 'prefer-user-event'>;
}

interface ReactSubConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends SharedConfigOptions<ExtraPlugins>, NoOnlyTestsSubConfigEnabledByDefault<ExtraPlugins> {
  /**
   * Affected rule:
   * - [`consistent-data-testid`](https://github.com/testing-library/eslint-plugin-testing-library/blob/HEAD/docs/rules/consistent-data-testid.md)
   */
  consistentDataTestId?: GetRuleOptions<'testing-library', 'consistent-data-testid'>;
}

export interface TestingLibraryEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends OmitStrict<SharedConfigOptions<ExtraPlugins>, 'allowTestingFrameworkSetupHook'> {
  /**
   * @default <=> `angular` config is enabled
   */
  configAngular?:
    | boolean
    | (SharedConfigOptions<ExtraPlugins> & NoOnlyTestsSubConfigEnabledByDefault<ExtraPlugins>);

  /**
   * @default <=> `marko` package is installed
   */
  configMarko?:
    | boolean
    | (SharedConfigOptions<ExtraPlugins> & NoOnlyTestsSubConfigEnabledByDefault<ExtraPlugins>);

  /**
   * @default <=> `react` config is enabled
   */
  configReact?: boolean | ReactSubConfigOptions<ExtraPlugins>;

  /**
   * @default <=> `svelte` config is enabled
   */
  configSvelte?:
    | boolean
    | (SharedConfigOptions<ExtraPlugins> & NoOnlyTestsSubConfigEnabledByDefault<ExtraPlugins>);

  /**
   * @default <=> `vue` config is enabled
   */
  configVue?:
    | boolean
    | (SharedConfigOptions<ExtraPlugins> & NoOnlyTestsSubConfigEnabledByDefault<ExtraPlugins>);

  /**
   * Disable root (DOM) config if any framework config is enabled.
   * @default true
   */
  disableRootConfigIfFrameworkConfigIsEnabled?: boolean;
}

type SupportedModules = keyof {
  [K in keyof TestingLibraryEslintConfigOptions as K extends `config${infer ModuleName}`
    ? Lowercase<ModuleName>
    : never]: unknown;
};

export default (async (context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configAngular: context.configsMeta.angular.enabled,
    configMarko: await doesPackageExist('marko'),
    configReact: context.configsMeta.react.enabled,
    configSvelte: context.configsMeta.svelte.enabled,
    configVue: context.configsMeta.vue.enabled,
    disableRootConfigIfFrameworkConfigIsEnabled: true,
  });

  const {
    configAngular,
    configMarko,
    configReact,
    configSvelte,
    configVue,
    disableRootConfigIfFrameworkConfigIsEnabled,
  } = optionsResolved;

  type AllPossibleOptions = ObjectValues<
    PickKeysStartingWith<TestingLibraryEslintConfigOptions, 'config'>
  > & {};
  const generateConfigsForModule = (
    module: 'dom' | SupportedModules,
    options: AllPossibleOptions,
  ) => {
    if (!options) {
      return [];
    }

    const isForFramework = module !== 'dom';
    // eslint-disable-next-line unicorn/prefer-includes-over-repeated-comparisons
    const isFireEventAsync = module === 'marko' || module === 'svelte' || module === 'vue';

    const moduleOptionsResolved = assignDefaults(options, {
      configNoOnlyTests: true,
      allowContainerFirstChild: true,
      preferUserEventOverFireEvent: true,
    });

    const {
      configNoOnlyTests,
      allowContainerFirstChild,
      allowTestingFrameworkSetupHook,
      preferQueryMatchers,
      preferUserEventOverFireEvent,
    } = moduleOptionsResolved;

    const configBuilder = context.createConfigBuilder(moduleOptionsResolved, 'testing-library');

    const configFilesFallback = generateDefaultTestFiles(GLOB_JS_TS_X_EXTENSION);

    // Legend:
    // 🟣 - in dom
    // 🔴 - in angular
    // 🟡 - in marko
    // 🔵 - in react
    // 🟠 - in svelte
    // 🟢 - in vue
    // 🩷 - in all the above
    // 💚 - in all the above, except `dom`

    // 1.2.0 prefer-expect-query-by
    // 2.0.0 no-get-by-for-checking-element-not-present
    // 3.0.0 no-wait-for-empty-callback
    // 3.0.0 prefer-wait-for
    // 3.5.0 no-render-in-setup
    // 4.0.0-alpha.0 no-multiple-assertions-wait-for
    // 4.0.0-alpha.0 no-side-effects-wait-for

    configBuilder
      ?.addConfig([
        `testing-library/${module}`,
        {
          includeDefaultFilesAndIgnores: true,
          filesDefault: configFilesFallback,
        },
      ])
      .addRule('await-async-events', ERROR, [
        {eventModule: ['userEvent', ...(isFireEventAsync ? ['fireEvent' as const] : [])]},
      ]) /** @since 1.0.0 */ /** @aka await-fire-event */ /** @aka await-async-event */ // 🩷
      .addRule('await-async-queries', ERROR) /** @since 1.0.0 */ /** @aka await-async-query */ // 🩷
      .addRule('await-async-utils', ERROR) /** @since 2.0.0 */ // 🩷
      // Plugin only supports `@testing-library/react`
      .addRule(
        'consistent-data-testid',
        module === 'react' &&
          'consistentDataTestId' in moduleOptionsResolved &&
          moduleOptionsResolved.consistentDataTestId
          ? ERROR
          : OFF,
        'consistentDataTestId' in moduleOptionsResolved &&
          moduleOptionsResolved.consistentDataTestId
          ? [moduleOptionsResolved.consistentDataTestId]
          : [],
      ) /** @since 1.4.0 */
      .addRule(
        'no-await-sync-events',
        ERROR,
        isFireEventAsync ? [] : [{eventModules: ['fire-event']}],
      ) /** @since 3.10.0 */ // 🟣🔴🔵
      .addRule('no-await-sync-queries', ERROR) /** @since 1.0.0 */ /** @aka no-await-sync-query */ // 🩷
      .addRule('no-container', isForFramework ? ERROR : OFF) /** @since 4.0.0-alpha.0 */ // 💚
      .addRule('no-debugging-utils', isForFramework ? ERROR : OFF) /** @since 5.0.0-alpha.2 */ // 💚(warns)
      .addRule(
        'no-dom-import',
        isForFramework ? ERROR : OFF,
        isForFramework ? [module] : [],
      ) /** @since 1.0.0 */ // 💚
      .addRule('no-global-regexp-flag-in-query', ERROR) /** @since 5.2.0 */ // 🩷
      .addRule(
        'no-manual-cleanup',
        // eslint-disable-next-line unicorn/prefer-includes-over-repeated-comparisons
        module === 'react' || module === 'svelte' || module === 'vue' ? ERROR : OFF,
      ) /** @since 2.1.0 */ // 🔵🟠🟢
      .addRule('no-node-access', ERROR, [{allowContainerFirstChild}]) /** @since 4.0.0-alpha.0 */ // 🩷
      .addRule('no-promise-in-fire-event', ERROR) /** @since 4.0.0-alpha.0 */ // 🩷
      .addRule(
        'no-render-in-lifecycle',
        isForFramework ? ERROR : OFF,
        allowTestingFrameworkSetupHook ? [{allowTestingFrameworkSetupHook}] : [],
      ) /** @since 6.0.0-alpha.2 */ // 💚
      .addRule('no-test-id-queries', WARNING) /** @since 7.2.0 */
      .addRule(
        'no-unnecessary-act',
        module === 'marko' || module === 'react' ? ERROR : OFF,
      ) /** @since 4.3.0 */ // 🟡🔵
      .addRule('no-wait-for-multiple-assertions', ERROR) /** @since 4.0.0-beta.1 */ // 🩷
      .addRule('no-wait-for-side-effects', ERROR) /** @since 4.0.0-beta.1 */ // 🩷
      .addRule('no-wait-for-snapshot', ERROR) /** @since 3.8.0 */ // 🩷
      .addRule(
        'prefer-explicit-assert',
        moduleOptionsResolved.preferAssertStyle === 'explicit' ? ERROR : OFF,
      ) /** @since 1.3.0 */
      .addRule('prefer-find-by', ERROR) /** @since 3.2.0 */ // 🩷
      .addRule(
        'prefer-implicit-assert',
        moduleOptionsResolved.preferAssertStyle === 'implicit' ? ERROR : OFF,
      ) /** @since 6.1.0 */
      .addRule('prefer-presence-queries', ERROR) /** @since 3.0.0 */ // 🩷
      .addRule('prefer-query-by-disappearance', ERROR) /** @since 4.8.0 */ // 🩷
      .addRule(
        'prefer-query-matchers',
        preferQueryMatchers?.length ? ERROR : OFF,
        preferQueryMatchers?.length ? [{validEntries: preferQueryMatchers}] : [],
      ) /** @since 5.11.0 */
      .addRule('prefer-screen-queries', ERROR) /** @since 3.0.0 */ // 🩷
      .addRule(
        'prefer-user-event',
        preferUserEventOverFireEvent ? ERROR : OFF,
        typeof preferUserEventOverFireEvent === 'object' ? [preferUserEventOverFireEvent] : [],
      ) /** @since 4.0.0-alpha.0 */
      .addRule('prefer-user-event-setup', ERROR) /** @since 7.14.0 */
      .addRule(
        'render-result-naming-convention',
        isForFramework ? ERROR : OFF,
      ) /** @since 4.0.0-alpha.0 */ // 💚
      .enableConfigTesterForPlugin('testing-library')
      .addOverrides();

    const configBuilderNoOnlyTests = generateConfigNoOnlyTestsBuilder(
      context,
      `testing-library/${module}`,
      configNoOnlyTests,
      moduleOptionsResolved,
      {filesDefault: configFilesFallback},
    );

    return [configBuilder, configBuilderNoOnlyTests];
  };

  const isAnyFrameworkConfigEnabled = Boolean(
    configAngular || configMarko || configReact || configSvelte || configVue,
  );

  return {
    configs: [
      ...generateConfigsForModule(
        'dom',
        isAnyFrameworkConfigEnabled && disableRootConfigIfFrameworkConfigIsEnabled
          ? false
          : optionsResolved,
      ),
      ...objectEntriesUnsafe({
        angular: configAngular,
        marko: configMarko,
        react: configReact,
        svelte: configSvelte,
        vue: configVue,
      } satisfies Record<SupportedModules, AllPossibleOptions>).flatMap(([module, options]) =>
        generateConfigsForModule(module, options),
      ),
    ],
    optionsResolved,
  };
}) satisfies UnConfigFn<'testingLibrary'>;

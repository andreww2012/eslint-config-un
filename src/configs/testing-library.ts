// cspell:ignore marko
import {ERROR, GLOB_JS_TS_X_EXTENSION, OFF, WARNING} from '../constants';
import {type GetRuleOptions, type UnConfigOptions, createConfigBuilder} from '../eslint';
import type {
  ObjectValues,
  OmitIndexSignature,
  PickKeysStartingWith,
  Prettify,
  PrettifyShallow,
} from '../types';
import {assignDefaults, doesPackageExist} from '../utils';
import {generateDefaultTestFiles} from './shared';
import type {UnConfigFn} from './index';

type SharedConfigOptions = PrettifyShallow<
  {
    /**
     * By default, [`no-node-access` rule](https://github.com/testing-library/eslint-plugin-testing-library/blob/HEAD/docs/rules/no-node-access.md) is enabled,
     * which disallows DOM traversal using native HTML methods and properties.
     * This option allows the use of `firstChild` property
     * [to get the root element of the rendered element](https://testing-library.com/docs/react-testing-library/api/#container-1).
     * @default true
     */
    allowContainerFirstChild?: boolean;

    /**
     * Affected rules:
     * - [`no-render-in-lifecycle`](https://github.com/testing-library/eslint-plugin-testing-library/blob/HEAD/docs/rules/no-render-in-lifecycle.md)
     */
    allowTestingFrameworkSetupHook?: (GetRuleOptions<
      'testing-library',
      'no-render-in-lifecycle'
    >[0] & {})['allowTestingFrameworkSetupHook'];

    /**
     * - `explicit`: enables [`prefer-explicit-assert` rule](https://github.com/testing-library/eslint-plugin-testing-library/blob/HEAD/docs/rules/prefer-explicit-assert.md).
     * - `implicit`: enables [`prefer-implicit-assert` rule](https://github.com/testing-library/eslint-plugin-testing-library/blob/HEAD/docs/rules/prefer-implicit-assert.md).
     *
     * By default, assert style is not enforced.
     */
    preferAssertStyle?: 'explicit' | 'implicit';

    /**
     * Affected rules:
     * - [`prefer-query-matchers`](https://github.com/testing-library/eslint-plugin-testing-library/blob/HEAD/docs/rules/prefer-query-matchers.md)
     */
    preferQueryMatchers?: Prettify<
      OmitIndexSignature<
        ((GetRuleOptions<
          'testing-library',
          'prefer-query-matchers'
        >[0] & {})['validEntries'] & {})[number]
      >[]
    >;

    /**
     * Affected rules:
     * - [`prefer-user-event`](https://github.com/testing-library/eslint-plugin-testing-library/blob/HEAD/docs/rules/prefer-user-event.md)
     * @default true
     */
    preferUserEventOverFireEvent?:
      | boolean
      | PrettifyShallow<
          OmitIndexSignature<GetRuleOptions<'testing-library', 'prefer-user-event'>[0] & {}>
        >;
  } & UnConfigOptions<'testing-library'>
>;

export interface TestingLibraryEslintConfigOptions
  extends Omit<SharedConfigOptions, 'allowTestingFrameworkSetupHook'> {
  /**
   * @default <=> `angular` config is enabled
   */
  configAngular?: boolean | SharedConfigOptions;

  /**
   * @default <=> `marko` package is installed
   */
  configMarko?: boolean | SharedConfigOptions;

  /**
   * @default <=> `react` config is enabled
   */
  configReact?:
    | boolean
    | PrettifyShallow<
        {
          /**
           * Affected rules:
           * - [`consistent-data-testid`](https://github.com/testing-library/eslint-plugin-testing-library/blob/HEAD/docs/rules/consistent-data-testid.md)
           */
          consistentDataTestId?: GetRuleOptions<'testing-library', 'consistent-data-testid'>[0];
        } & SharedConfigOptions
      >;

  /**
   * @default <=> `svelte` config is enabled
   */
  configSvelte?: boolean | SharedConfigOptions;

  /**
   * @default <=> `vue` config is enabled
   */
  configVue?: boolean | SharedConfigOptions;

  /**
   * Disable root (DOM) config if any framework config is enabled.
   * @default true
   */
  disableRootConfigIfFrameworkConfigIsEnabled?: boolean;
}

export const testingLibraryUnConfig: UnConfigFn<'testingLibrary'> = async (context) => {
  const optionsRaw = context.rootOptions.configs?.testingLibrary;
  const optionsResolved = assignDefaults(optionsRaw, {
    configAngular: context.configsMeta.angular.enabled,
    configMarko: await doesPackageExist('marko'),
    configReact: context.configsMeta.react.enabled,
    configSvelte: context.configsMeta.svelte.enabled,
    configVue: context.configsMeta.vue.enabled,
    disableRootConfigIfFrameworkConfigIsEnabled: true,
  } satisfies TestingLibraryEslintConfigOptions);

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
    module: 'dom' | 'angular' | 'marko' | 'react' | 'svelte' | 'vue',
    options: AllPossibleOptions,
  ) => {
    const isForFramework = module !== 'dom';
    const isFireEvenAsync = module === 'marko' || module === 'svelte' || module === 'vue';

    const moduleOptionsResolved = assignDefaults(options, {
      allowContainerFirstChild: true,
      preferUserEventOverFireEvent: true,
    } satisfies AllPossibleOptions);

    const {
      allowContainerFirstChild,
      allowTestingFrameworkSetupHook,
      preferQueryMatchers,
      preferUserEventOverFireEvent,
    } = moduleOptionsResolved;

    const configBuilder = createConfigBuilder(context, moduleOptionsResolved, 'testing-library');

    // Legend:
    // 🟣 - in dom
    // 🔴 - in angular
    // 🟡 - in marko
    // 🔵 - in react
    // 🟠 - in svelte
    // 🟢 - in vue
    // 🩷 - in all the above
    // 💚 - in all the above, except `dom`

    configBuilder
      ?.addConfig([
        'testing-library',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: generateDefaultTestFiles(GLOB_JS_TS_X_EXTENSION),
        },
      ])
      .addRule('await-async-events', ERROR, [
        {eventModule: ['userEvent', ...(isFireEvenAsync ? ['fireEvent' as const] : [])]},
      ]) // 🩷
      .addRule('await-async-queries', ERROR) // 🩷
      .addRule('await-async-utils', ERROR) // 🩷
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
      )
      .addRule(
        'no-await-sync-events',
        ERROR,
        isFireEvenAsync ? [] : [{eventModules: ['fire-event']}],
      ) // 🟣🔴🔵
      .addRule('no-await-sync-queries', ERROR) // 🩷
      .addRule('no-container', isForFramework ? ERROR : OFF) // 💚
      .addRule('no-debugging-utils', isForFramework ? ERROR : OFF) // 💚(warns)
      .addRule('no-dom-import', isForFramework ? ERROR : OFF, isForFramework ? [module] : []) // 💚
      .addRule('no-global-regexp-flag-in-query', ERROR) // 🩷
      .addRule(
        'no-manual-cleanup',
        module === 'react' || module === 'svelte' || module === 'vue' ? ERROR : OFF,
      ) // 🔵🟠🟢
      .addRule('no-node-access', ERROR, [{allowContainerFirstChild}]) // 🩷
      .addRule('no-promise-in-fire-event', ERROR) // 🩷
      .addRule(
        'no-render-in-lifecycle',
        isForFramework ? ERROR : OFF,
        allowTestingFrameworkSetupHook ? [{allowTestingFrameworkSetupHook}] : [],
      ) // 💚
      .addRule('no-test-id-queries', WARNING)
      .addRule('no-unnecessary-act', module === 'marko' || module === 'react' ? ERROR : OFF) // 🟡🔵
      .addRule('no-wait-for-multiple-assertions', ERROR) // 🩷
      .addRule('no-wait-for-side-effects', ERROR) // 🩷
      .addRule('no-wait-for-snapshot', ERROR) // 🩷
      .addRule(
        'prefer-explicit-assert',
        moduleOptionsResolved.preferAssertStyle === 'explicit' ? ERROR : OFF,
      )
      .addRule('prefer-find-by', ERROR) // 🩷
      .addRule(
        'prefer-implicit-assert',
        moduleOptionsResolved.preferAssertStyle === 'implicit' ? ERROR : OFF,
      )
      .addRule('prefer-presence-queries', ERROR) // 🩷
      .addRule('prefer-query-by-disappearance', ERROR) // 🩷
      .addRule(
        'prefer-query-matchers',
        preferQueryMatchers?.length ? ERROR : OFF,
        preferQueryMatchers?.length ? [{validEntries: preferQueryMatchers}] : [],
      )
      .addRule('prefer-screen-queries', ERROR) // 🩷
      .addRule(
        'prefer-user-event',
        preferUserEventOverFireEvent ? ERROR : OFF,
        typeof preferUserEventOverFireEvent === 'object' ? [preferUserEventOverFireEvent] : [],
      )
      .addRule('render-result-naming-convention', isForFramework ? ERROR : OFF) // 💚
      .addOverrides();

    return configBuilder;
  };

  const isAnyFrameworkConfigEnabled = Boolean(
    configAngular || configMarko || configReact || configSvelte || configVue,
  );

  return {
    configs: [
      generateConfigsForModule(
        'dom',
        isAnyFrameworkConfigEnabled && disableRootConfigIfFrameworkConfigIsEnabled
          ? false
          : optionsResolved,
      ),
      generateConfigsForModule('angular', configAngular),
      generateConfigsForModule('marko', configMarko),
      generateConfigsForModule('react', configReact),
      generateConfigsForModule('svelte', configSvelte),
      generateConfigsForModule('vue', configVue),
    ],
    optionsResolved,
  };
};

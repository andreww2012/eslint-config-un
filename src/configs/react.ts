import {
  ERROR,
  GLOB_JSX_TSX,
  GLOB_JS_TS_X,
  OFF,
  REACT_ROUTER_PACKAGES,
  REMIX_PACKAGES,
  type RuleSeverity,
  WARNING,
} from '../constants';
import type {EslintFlatConfigEntry} from '../eslint/eslint-types';
import type {OmitStrict, PickDistributed, Prettify} from '../types';
import {allUnionMembers} from '../utils';
import {noRestrictedHtmlElementsDefault} from './shared';
import {
  type ExtraPluginsType,
  type GetRuleNamesInPlugin,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  type UnRulesConfigPartial,
  assignDefaults,
  defineUnConfig,
} from './index';

interface EslintPluginReactSettings {
  /**
   * Regex for Component Factory to use, default to `createReactClass`
   */
  createClass?: string;

  /**
   * Pragma to use, default to `React`
   */
  pragma?: string;

  /**
   * Fragment to use (may be a property of `pragma`), default to `Fragment`
   */
  fragment?: string;

  /**
   * React version. `detect` automatically picks the version you have installed.
   * You can also use `16.0`, `16.3`, etc, if you want to override the detected value.
   * Defaults to the `defaultVersion` setting and warns if missing, and to `detect` in the future
   */
  version?: string;

  /**
   * Default React version to use when the version you have installed cannot be detected.
   * If not provided, defaults to the latest React version.
   */
  defaultVersion?: string;

  /**
   * Flow version
   */
  flowVersion?: string;

  /**
   * The names of any function used to wrap `propTypes`, e.g. `forbidExtraProps`. If this isn't set, any `propTypes` wrapped in a function will be skipped.
   */
  propWrapperFunctions?: (
    | string
    | {
        property: string;
        object?: string;

        /**
         * For rules that check exact prop wrappers
         */
        exact?: boolean;
      }
  )[];

  /**
   * The name of any function used to wrap components, e.g. Mobx `observer` function. If this isn't set, components wrapped by these functions will be skipped.
   */
  componentWrapperFunctions?: (
    | string
    | {
        property: string;

        /**
         * Using `<pragma>` sets `object` to whatever value `settings.react.pragma` is set to
         */
        object?: string;
      }
  )[];

  /**
   * Components used as alternatives to `<form>` for forms, eg. `<Form endpoint={ url } />`
   */
  formComponents?: (string | {name: string; formAttribute: string | string[]})[];

  /**
   * Components used as alternatives to `<a>` for linking, eg. `<Link to={ url } />`
   */
  linkComponents?: (string | {name: string; linkAttribute: string | string[]})[];
}

interface EslintPluginReactXSettings {
  /**
   * A regex pattern matching custom hooks treated as effect hooks.
   * @see https://eslint-react.xyz/docs/configuration/configure-analyzer#additionaleffecthooks
   */
  additionalEffectHooks?: string;

  /**
   * A regex pattern matching custom hooks treated as ref hooks.
   * @see https://eslint-react.xyz/docs/configuration/configure-analyzer#additionalrefhooks
   */
  additionalRefHooks?: string;

  /**
   * A regex pattern matching custom hooks treated as state hooks
   * @see https://eslint-react.xyz/docs/configuration/configure-analyzer#additionalstatehooks
   */
  additionalStateHooks?: string;

  /**
   * React version. Automatically set by eslint-config-un if detected
   * @see https://eslint-react.xyz/docs/configuration/configure-analyzer#version
   */
  version?: string;

  /**
   * Customizes the React module import source. Useful for non-standard distributions
   * @see https://eslint-react.xyz/docs/configuration/configure-analyzer#importsource
   */
  importSource?: string;

  /**
   * Defines the prop used for polymorphic components
   * @see https://eslint-react.xyz/docs/configuration/configure-analyzer#polymorphicpropname
   */
  polymorphicPropName?: string;
}

type EslintPluginReactDomRules =
  | 'checked-requires-onchange-or-readonly'
  | 'forbid-dom-props'
  | 'no-invalid-html-attribute'
  | 'no-is-mounted';

type ReactXTypeAwareRules =
  | 'no-implicit-children'
  | 'no-implicit-key'
  | 'no-implicit-ref'
  | 'no-leaked-conditional-rendering'
  | 'no-unused-props';

interface ReactXSubConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, UnRulesConfigPartial<'eslint-react'>> {
  /**
   * [`@eslint-react/eslint-plugin`](https://npmx.dev/@eslint-react/eslint-plugin) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
   * that will be assigned to `react-x` property
   * and applied to the resolved `files` and `ignores` of this config.
   *
   * Note that they will be merged with `{version: <detected by us React version>}`.
   */
  settings?: EslintPluginReactXSettings;

  /**
   * By default, usage of [any of the legacy React APIs](https://react.dev/reference/react/legacy),
   * including [deprecated lifecycle methods](https://react.dev/reference/react/Component#componentwillmount),
   * will be reported. Using this option, you can allow some of them or change
   * the severity of the problems.
   *
   * The default severity is `error`, with the only exception of `classComponent`, which
   * is `warn`.
   *
   * Affects the following rules (`eslint-react` prefix is implied):
   * - `Children`: [`eslint-react/no-children-count`](https://eslint-react.xyz/docs/rules/no-children-count), [`eslint-react/no-children-for-each`](https://eslint-react.xyz/docs/rules/no-children-for-each), [`eslint-react/no-children-map`](https://eslint-react.xyz/docs/rules/no-children-map), [`eslint-react/no-children-only`](https://eslint-react.xyz/docs/rules/no-children-only), [`eslint-react/no-children-to-array`](https://eslint-react.xyz/docs/rules/no-children-to-array)
   * - `cloneElement`: [`eslint-react/no-clone-element`](https://eslint-react.xyz/docs/rules/no-clone-element)
   * - `classComponent`: [`eslint-react/no-class-component`](https://eslint-react.xyz/docs/rules/no-class-component)
   * - `createRef`: [`eslint-react/no-create-ref`](https://eslint-react.xyz/docs/rules/no-create-ref)
   * - `forwardRef`: [`eslint-react/no-forward-ref`](https://eslint-react.xyz/docs/rules/no-forward-ref)
   * - `componentWillMount`: [`eslint-react/no-component-will-mount`](https://eslint-react.xyz/docs/rules/no-component-will-mount)
   * - `componentWillReceiveProps`: [`eslint-react/no-component-will-receive-props`](https://eslint-react.xyz/docs/rules/no-component-will-receive-props)
   * - `componentWillUpdate`: [`eslint-react/no-component-will-update`](https://eslint-react.xyz/docs/rules/no-component-will-update)
   */
  noLegacyApis?: Partial<
    Record<
      | 'Children'
      | 'cloneElement'
      | 'classComponent'
      // | 'createElement'
      | 'createRef'
      | 'forwardRef'
      // | 'isValidElement'
      // | 'PureComponent'
      | 'componentWillMount'
      | 'componentWillReceiveProps'
      | 'componentWillUpdate',
      boolean | 'warn'
    >
  >;

  /**
   * By default will be applied to same files specified in `ts/configTypeAware` sub-config.
   * @default true <=> `ts` config is enabled
   */
  configTypeAwareRules?:
    | boolean
    | UnFlatConfigEntryBase<
        ExtraPlugins,
        Pick<UnRulesConfigPartial<'eslint-react'>, `eslint-react/${ReactXTypeAwareRules}`>
      >;
}

interface HooksSubConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'react-hooks'> {
  /**
   * [`eslint-plugin-react-hooks`](https://npmx.dev/eslint-plugin-react-hooks) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
   * that will be assigned to `react-hooks` property
   * and applied to the resolved `files` and `ignores` of this config.
   */
  settings?: {
    /**
     * A regular expression with custom effect hooks.
     */
    additionalEffectHooks?: string;
  };

  /**
   * @default true
   */
  enableReactCompilerRules?: boolean;
}

interface RefreshSubConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'react-refresh'> {
  /**
   * "If you use a framework that handles HMR of some specific exports, you can use this option to avoid warning for them." - plugin docs
   *
   * Note that we detect some frameworks and add their exports to this list automatically.
   * Names specified here will be added to the final list, not overwrite it.
   * - **Remix**: see [supported exports](https://v2.remix.run/docs/discussion/hot-module-replacement#supported-exports).
   * Detected by checking if *any* of the following packages are installed:
   * `@remix-run/{react,node,serve,dev}`.
   * - **React router**: see [supported exports](https://reactrouter.com/explanation/hot-module-replacement#supported-exports).
   * Detected packages: `@react-router/{react,node,serve,dev}`.
   * - **NextJS**: adds various user exported functions and variables
   * if `next` package is installed.
   */
  allowExportNames?: string[];

  /**
   * Other rule's options. Will be merged with options generated by our config.
   */
  options?: Prettify<
    OmitStrict<GetRuleOptions<'react-refresh', 'only-export-components'>, 'allowExportNames'>
  >;
}

/**
 * [React](https://react.dev) specific rules.
 *
 * 📁 Default `files`: <code>**&#47;*.?([cm])[jt]s?(x)</code>
 *
 * 🧩 Plugin(s):
 * - [`eslint-plugin-react`](https://npmx.dev/eslint-plugin-react)
 * - [`@eslint-react/eslint-plugin`](https://npmx.dev/@eslint-react/eslint-plugin)
 * **with `eslint-react` prefix**
 * - [`eslint-plugin-react-hooks`](https://npmx.dev/eslint-plugin-react-hooks)
 *
 * Since `eslint-plugin-react` and `@eslint-react/eslint-plugin` have some overlapping rules,
 * and `eslint-plugin-react` has some rules that are not relevant in modern codebases,
 * there exists an option to control which rules from which plugins, if any, will be used.
 * Refer to `pluginX` option JSDoc for more details.
 *
 * - `allowDefaultExportsInJsxFiles`: micro config to allow default exports in all JSX files.
 * - `reactX`: runtime agnostic ("X") and "Name Convention" rules from `@eslint-react/eslint-plugin`.
 * - `hooks`: rules from `eslint-plugin-react-hooks` as well as "Hooks Extra" rules from `@eslint-react/eslint-plugin`.
 * - `dom`: DOM specific rules from both `@eslint-react/eslint-plugin` and `eslint-plugin-react`.
 * - `refresh`: rules from `eslint-plugin-react-refresh`.
 * - `youMightNotNeedAnEffect`: rules from `eslint-plugin-react-you-might-not-need-an-effect`.
 */
export interface ReactEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'react'> {
  /**
   * [`eslint-plugin-react`](https://npmx.dev/eslint-plugin-react) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
   * that will be assigned to `react` property
   * and applied to the resolved `files` and `ignores` of this config.
   *
   * Note that they will be merged with `{version: <detected by us React version>}` to avoid
   * `Warning: React version not specified in eslint-plugin-react settings.` log message
   * when running ESLint.
   */
  settings?: EslintPluginReactSettings;

  /**
   * Enables or specifies the configuration for
   * [`@eslint-react/eslint-plugin`](https://npmx.dev/@eslint-react/eslint-plugin) plugin.
   *
   * Only includes
   * [runtime agnostic ("X")](https://eslint-react.xyz/docs/rules#x-rules) and
   * ["Naming Convention"](https://eslint-react.xyz/docs/rules#naming-convention-rules)
   * rules.
   *
   * Disabling this sub-config does not stop all the rules from `@eslint-react/eslint-plugin`
   * from being used in other sub-configs. If you for some reason do not want to use this plugin's
   * rules altogether, set `pluginX` option to `never` on `react` config.
   *
   * By default will use the same `files` and `ignores` as the parent config.
   * @default true
   */
  configReactX?: boolean | ReactXSubConfigOptions<ExtraPlugins>;

  /**
   * Enables or specifies the configuration for
   * [`eslint-plugin-react-hooks`](https://npmx.dev/eslint-plugin-react-hooks) plugin,
   * as well as `eslint-react/no-direct-set-state-in-use-effect` rule from `@eslint-react/eslint-plugin`
   * (unless `pluginX` option is set to `never` on `react` config).
   *
   * By default will use the same `files` and `ignores` as the parent config.
   * @default true
   */
  configHooks?: boolean | HooksSubConfigOptions<ExtraPlugins>;

  /**
   * Enables or specifies the configuration for DOM specific rules from
   * [`@eslint-react/eslint-plugin`](https://npmx.dev/@eslint-react/eslint-plugin) and
   * [`eslint-plugin-react`](https://npmx.dev/eslint-plugin-react) plugins.
   *
   * To avoid including the rules from any of these plugins, set `pluginX` option to
   * `never` or `avoid` to completely ignore `@eslint-react/eslint-plugin` or
   * `eslint-plugin-react` rules respectively.
   *
   * By default will use the same `files` and `ignores` as the parent config.
   * @default true <=> `react-dom` package is installed
   */
  configDom?:
    | boolean
    | UnFlatConfigEntryBase<
        ExtraPlugins,
        'eslint-react' | Pick<UnRulesConfigPartial<'react'>, `react/${EslintPluginReactDomRules}`>
      >;

  /**
   * Enables or specifies the configuration for
   * [`eslint-plugin-react-refresh`](https://npmx.dev/eslint-plugin-react-refresh) plugin.
   *
   * - By default will be applied to JSX files only, as per the plugin recommendation.
   * - Will set `allowConstantExport: true` if `vite` package is installed.
   * @default true
   */
  configRefresh?: boolean | RefreshSubConfigOptions<ExtraPlugins>;

  /**
   * By default, default exports will be allowed in all JSX files
   * @default true
   */
  configAllowDefaultExportsInJsxFiles?:
    | boolean
    | UnFlatConfigEntryBase<
        ExtraPlugins,
        PickDistributed<UnRulesConfigPartial, 'import/no-default-export'>
      >;

  /**
   * Enables or specifies the configuration for
   * [`eslint-plugin-react-you-might-not-need-an-effect?activeTab=readme`](https://npmx.dev/eslint-plugin-react-you-might-not-need-an-effect?activeTab=readme)
   * plugin.
   *
   * By default will use the same `files` and `ignores` as the parent config.
   * @default true
   */
  configYouMightNotNeedAnEffect?:
    boolean | UnFlatConfigEntryBase<ExtraPlugins, 'react-you-might-not-need-an-effect'>;

  /**
   * Controls how rules from [@eslint-react/eslint-plugin](https://npmx.dev/@eslint-react/eslint-plugin) and [`eslint-plugin-react`](https://npmx.dev/eslint-plugin-react) are used.
   * - `prefer`: if the same(-ish) rule exists both in `@eslint-react/eslint-plugin`
   * and `eslint-plugin-react` (the full list is below), use the one from
   * `@eslint-react/eslint-plugin`. Use all the other unique rules from both of these plugins.
   * - `avoid`: same as `prefer`, but `eslint-plugin-react`'s version is preferred.
   * - `only`: do not use `eslint-plugin-react` at all.
   * - `never`: do not use `@eslint-react/eslint-plugin` at all.
   *
   * ### The list of "double implementation" rules
   * `@eslint-react/eslint-plugin` name(s)                   | `eslint-plugin-react` name(s)
   * ------------------------------------------------------- | -----------------------------
   * `no-access-state-in-setstate`                           | `no-access-state-in-setstate`
   * `no-array-index-key`                                    | `no-array-index-key`
   * `no-children-prop`                                      | `no-children-prop`
   * `no-comment-textnodes`                                  | `jsx-no-comment-textnodes`
   * `no-direct-mutation-state`                              | `no-direct-mutation-state`
   * `no-duplicate-key`, `no-missing-key`                    | `jsx-key`
   * `no-leaked-conditional-rendering`                       | `jsx-no-leaked-render`
   * `no-missing-{component,context}-display-name`           | `display-name`
   * `no-nested-component-definitions`                       | `no-unstable-nested-components`
   * `no-redundant-should-component-update`                  | `no-redundant-should-component-update`
   * `no-set-state-in-component-did-mount`                   | `no-did-mount-set-state`
   * `no-set-state-in-component-did-update`                  | `no-did-update-set-state`
   * `no-set-state-in-component-will-update`                 | `no-will-update-set-state`
   * `no-unstable-context-value`                             | `jsx-no-constructed-context-values`
   * `no-unstable-default-props`                             | `no-object-type-as-default-prop`
   * `no-unused-class-component-members`                     | `no-unused-class-component-methods`
   * `no-unused-state`                                       | `no-unused-state`
   * `jsx-no-useless-fragment`                               | `jsx-no-useless-fragment`
   * `prefer-destructuring-assignment`                       | `destructuring-assignment`
   * `dom-no-dangerously-set-innerhtml`                      | `no-danger`
   * `dom-no-dangerously-set-innerhtml-with-children`        | `no-danger-with-children`
   * `dom-no-find-dom-node`                                  | `no-find-dom-node`
   * `dom-no-missing-button-type`                            | `button-has-type`
   * `dom-no-missing-iframe-sandbox`                         | `iframe-missing-sandbox`
   * `dom-no-namespace`                                      | `no-namespace`
   * `dom-no-render-return-value`                            | `no-render-return-value`
   * `dom-no-script-url`                                     | `jsx-no-script-url`
   * `dom-no-unknown-property`                               | `no-unknown-property`
   * `dom-no-unsafe-iframe-sandbox`                          | `iframe-missing-sandbox`
   * `dom-no-unsafe-target-blank`                            | `jsx-no-target-blank`
   * `dom-no-void-elements-with-children`                    | `void-dom-elements-no-children`
   * `dom-no-string-style-prop`                              | `style-prop-object`
   * @default 'prefer'
   */
  pluginX?: 'prefer' | 'avoid' | 'only' | 'never';

  /**
   * Detected automatically from a major version of the installed version of
   * `react` package, but can also be specified manually here.
   */
  reactVersion?: number;

  /**
   * A flag indicating
   * [the new JSX Transform](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)
   * is used. Affects some rules only from `eslint-plugin-react` plugin.
   * @default true <=> React version is 17 or higher
   */
  newJsxTransform?: boolean;

  /**
   * A list of disallowed React or HTML elements. Pass `true` to disallow or `string` to also
   * provide a custom error message.
   *
   * By default, all deprecated or non-standard HTML tags are disallowed. Pass `false` to re-allow any of them.
   *
   * Affected rule:
   * - [`react/forbid-elements`](https://github.com/jsx-eslint/eslint-plugin-react/blob/HEAD/docs/rules/forbid-elements.md)
   * @example {center: false, pre: true, button: 'use <Button> instead'}
   */
  disallowedElements?: Partial<Record<string, boolean | string>>;

  /**
   * Whether to prefer or avoid boolean shorthand syntax in JSX (i.e. `<foo bar />` over `<foo bar={true} />`).
   * - `prefer`/`avoid`: prefer/avoid boolean shorthand syntax, use `warn` severity.
   * - `prefer-error`/`avoid-error`: prefer/avoid boolean shorthand syntax, use `error` severity.
   * - `off`: allow both syntaxes.
   *
   * Affected rule:
   * - [`react/jsx-boolean-value`](https://github.com/jsx-eslint/eslint-plugin-react/blob/HEAD/docs/rules/jsx-boolean-value.md)
   * @default 'prefer'
   */
  shorthandBoolean?: 'prefer' | 'prefer-error' | 'avoid' | 'avoid-error' | 'off';

  /**
   * Whether to prefer or avoid Fragment shorthand syntax in JSX (i.e. `<>...</>` over `<Fragment>...</Fragment>`).
   * - `prefer`/`avoid`: prefer/avoid Fragment shorthand syntax, use `warn` severity.
   * - `prefer-error`/`avoid-error`: prefer/avoid Fragment shorthand syntax, use `error` severity.
   * - `off`: allow both syntaxes.
   *
   * Affected rule:
   * - [`react/jsx-fragments`](https://github.com/jsx-eslint/eslint-plugin-react/blob/HEAD/docs/rules/jsx-fragments.md)
   * @default true
   */
  shorthandFragment?: 'prefer' | 'prefer-error' | 'avoid' | 'avoid-error' | 'off';
}

const LATEST_REACT_VERSION = 19;
const JSX_FILE_EXTENSIONS = ['.jsx', '.tsx', '.cjsx', '.mjsx', '.ctsx', '.mtsx'];

const getSeverity = (severity: boolean | 'warn' = true) =>
  severity === 'warn' ? WARNING : severity ? ERROR : OFF;

const NO_ACCESS_STATE_IN_SETSTATE_SEVERITY = ERROR;
const NO_ARRAY_INDEX_KEY_SEVERITY = WARNING;
const NO_CHILDREN_PROP_SEVERITY = ERROR;
const NO_COMMENT_TEXTNODES_SEVERITY = ERROR;
const NO_DIRECT_MUTATION_STATE_SEVERITY = ERROR;
const NO_DUPLICATE_OR_MISSING_KEY_SEVERITY = ERROR;
const NO_LEAKED_CONDITIONAL_RENDERING_SEVERITY = ERROR;
const NO_MISSING_COMPONENT_OR_CONTEXT_DISPLAY_NAME_SEVERITY = WARNING;
const NO_NESTED_COMPONENT_DEFINITIONS_SEVERITY = ERROR;
const NO_SET_STATE_IN_COMPONENT_DID_MOUNT_SEVERITY = WARNING;
const NO_SET_STATE_IN_COMPONENT_DID_UPDATE_SEVERITY = WARNING;
const NO_SET_STATE_IN_COMPONENT_WILL_UPDATE_SEVERITY = WARNING;
const NO_UNSTABLE_CONTEXT_VALUE_SEVERITY = WARNING;
const NO_UNSTABLE_DEFAULT_PROPS_SEVERITY = WARNING;
const NO_UNUSED_CLASS_COMPONENT_MEMBERS_SEVERITY = WARNING;
const NO_UNUSED_STATE_SEVERITY = WARNING;
const NO_USELESS_FRAGMENT_SEVERITY = WARNING;

const REMIX_AND_REACT_ROUTER_EXPORTS: readonly string[] = [
  'action',
  'headers',
  'links',
  'loader',
  'meta',
];
const NEXT_EXPORTS: readonly string[] = [
  'config', // https://nextjs.org/docs/pages/building-your-application/routing/api-routes#custom-config
  'dynamic', // https://nextjs.org/docs/app/guides/migrating-to-cache-components#dynamic--force-dynamic
  'dynamicParams', // https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/dynamicParams
  'experimental_ppr', // https://nextjs.org/docs/app/guides/migrating-to-cache-components#experimental_ppr
  'fetchCache', // https://nextjs.org/docs/app/guides/caching-without-cache-components#fetchcache
  'generateMetadata', // https://nextjs.org/docs/app/api-reference/functions/generate-metadata
  'generateImageMetadata', // https://nextjs.org/docs/app/api-reference/functions/generate-image-metadata
  'generateSitemaps', // https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps
  'generateStaticParams', // https://nextjs.org/docs/app/api-reference/functions/generate-static-params
  'generateViewport', // https://nextjs.org/docs/app/api-reference/functions/generate-viewport#generateviewport-function
  'maxDuration', // https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/maxDuration
  'metadata', // https://nextjs.org/docs/app/getting-started/metadata-and-og-images#static-metadata
  'preferredRegion', // https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/preferredRegion
  'revalidate', // https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#version-history
  'runtime', // https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/runtime
  'viewport', // https://nextjs.org/docs/app/api-reference/functions/generate-viewport
];

const REACT_ORIGINAL_DOM_RULES = new Set<string>([
  'button-has-type',
  'checked-requires-onchange-or-readonly',
  'forbid-dom-props',
  'iframe-missing-sandbox',
  'jsx-no-script-url',
  'jsx-no-target-blank',
  'no-invalid-html-attribute',
  'no-danger',
  'no-danger-with-children',
  'no-find-dom-node',
  'no-is-mounted',
  'no-namespace',
  'no-render-return-value',
  'no-unknown-property',
  'void-dom-elements-no-children',
] satisfies GetRuleNamesInPlugin<'react'>[]);

const REACT_X_TYPE_AWARE_RULES = new Set<string>(
  allUnionMembers<ReactXTypeAwareRules>()([
    'no-implicit-children',
    'no-implicit-key',
    'no-implicit-ref',
    'no-leaked-conditional-rendering',
    'no-unused-props',
  ] satisfies GetRuleNamesInPlugin<'eslint-react'>[]),
);

const DEFAULT_FILES = [GLOB_JS_TS_X];

export default defineUnConfig<ReactEslintConfigOptions, ['ts']>('react', {
  enabledBy: {package: 'react'},
  needs: ['ts'],
})((context, optionsRaw, {ts: tsConfigResult}) => {
  const tsFilesTypeAware = tsConfigResult?.filesTypeAware || [];
  const tsIgnoresTypeAware = tsConfigResult?.ignoresTypeAware || [];

  const isReactDomInstalled = context.packagesInfo['react-dom'] != null;
  const isRemixOrReactRouterInstalled = [...REMIX_PACKAGES, ...REACT_ROUTER_PACKAGES].some(
    (packageName) => context.packagesInfo[packageName] != null,
  );
  const isViteInstalled = context.packagesInfo.vite != null;

  const reactPackageInfo = context.packagesInfo.react;

  const optionsResolved = assignDefaults(optionsRaw, {
    configAllowDefaultExportsInJsxFiles: true,
    configHooks: true,
    configReactX: true,
    configDom: isReactDomInstalled,
    configRefresh: true,
    configYouMightNotNeedAnEffect: true,
    pluginX: 'prefer',
    shorthandBoolean: 'prefer',
    shorthandFragment: 'prefer',
    reactVersion: reactPackageInfo?.versions.major ?? LATEST_REACT_VERSION,
  });

  const {
    files: parentConfigFiles,
    ignores: parentConfigIgnores,
    settings: pluginSettings,
    configAllowDefaultExportsInJsxFiles,
    configHooks,
    configReactX,
    configDom,
    configRefresh,
    configYouMightNotNeedAnEffect,
    pluginX,
    shorthandBoolean,
    shorthandFragment,
    reactVersion: reactMajorVersion,
  } = optionsResolved;

  const reactFullVersion = String(
    (optionsRaw && typeof optionsRaw === 'object' ? optionsRaw.reactVersion : null) ??
      reactPackageInfo?.versions.full ??
      optionsResolved.reactVersion,
  );

  const isMinVersion17 = reactMajorVersion >= 17;
  const isMinVersion19 = reactMajorVersion >= 19;

  optionsResolved.newJsxTransform ??= isMinVersion17;
  const {newJsxTransform} = optionsResolved;

  const isConfigXDisabled = configReactX === false;
  const isReactEnabled = pluginX !== 'only';
  const isReactXEnabled = pluginX !== 'never';
  const isReactPreferred = pluginX === 'avoid' || pluginX === 'never';
  const isReactXPreferred = pluginX === 'prefer' || pluginX === 'only';

  const getDoubleRuleName = <
    A extends GetRuleNamesInPlugin<'eslint-react'>,
    B extends GetRuleNamesInPlugin<'react'>,
  >(
    nameXUnprefixed: A,
    nameOriginal: B,
  ) => {
    const prefix = isReactXPreferred ? 'eslint-react' : 'react';
    const name = isReactXPreferred ? nameXUnprefixed : nameOriginal;
    return [prefix, name] as const;
  };
  const getDoubleRuleSeverity = (severity: RuleSeverity, isXRule?: boolean) =>
    (isReactXPreferred && !isReactXEnabled) ||
    (isReactPreferred && !isReactEnabled) ||
    (!isReactXPreferred && isXRule === true) ||
    (!isReactPreferred && isXRule === false)
      ? OFF
      : severity;
  const getXRuleSeverity = (severity: RuleSeverity) => (isReactXEnabled ? severity : OFF);

  const configReactXOptions = typeof configReactX === 'object' ? configReactX : {};

  const reactOriginalSettings = isReactEnabled
    ? ({
        version: reactFullVersion,
        ...pluginSettings,
      } satisfies EslintPluginReactSettings)
    : null;
  const reactXSettings = isReactXEnabled
    ? ({
        version: reactFullVersion,
        ...configReactXOptions.settings,
      } satisfies EslintPluginReactXSettings)
    : null;

  const extraFlatConfigForReactOriginal: EslintFlatConfigEntry = {
    // Copied from https://github.com/jsx-eslint/eslint-plugin-react/blob/e6b5b41191690ee166d0cca1e9db27092b910f03/index.js#L86
    ...(isReactEnabled &&
      newJsxTransform && {
        languageOptions: {
          parserOptions: {
            jsxPragma: null, // for @typescript/eslint-parser
          },
        },
      }),
  };

  const configBuilderReactOriginal = context.createConfigBuilder(optionsResolved, 'react');

  const noUnsafeClassComponentMethodsSeverity = isMinVersion17 ? WARNING : OFF;

  // Legend:
  // 🟢 - in recommended
  // Check rule usage: https://github.com/search?q=path%3A%2F.*eslint%5B%5E%5C%2F%5D*%24%2F+%22react%2Fboolean-prop-naming%22&type=code

  configBuilderReactOriginal
    ?.addConfig(
      [
        'react/plugin-original',
        {
          filesDefault: DEFAULT_FILES,
          settings: {
            react: reactOriginalSettings,
          },
        },
      ],
      extraFlatConfigForReactOriginal,
    )
    .addRule('boolean-prop-naming', OFF) /** @since 7.2.0 */
    .addRule('default-props-match-prop-types', ERROR) /** @since 7.1.0 */
    .addRule('destructuring-assignment', OFF) /** @since 7.5.0 */
    .addRule(
      'display-name',
      getDoubleRuleSeverity(NO_MISSING_COMPONENT_OR_CONTEXT_DISPLAY_NAME_SEVERITY, false),
    ) /** @since 1.1.0 */ // 🟢
    .addRule('forbid-component-props', OFF) /** @since 6.1.0 */
    .addRule('forbid-elements', ERROR, [
      {
        forbid: Object.entries({
          ...noRestrictedHtmlElementsDefault,
          ...optionsResolved.disallowedElements,
        })
          .map(([element, isDisallowedOrErrorMessage]) =>
            typeof isDisallowedOrErrorMessage === 'string'
              ? {element, message: isDisallowedOrErrorMessage}
              : isDisallowedOrErrorMessage
                ? element
                : null,
          )
          .filter((v) => v != null),
      },
    ]) /** @since 6.10.0 */
    .addRule('forbid-foreign-prop-types', isMinVersion19 ? OFF : ERROR) /** @since 6.10.0 */ // propTypes only rule
    .addRule('forbid-prop-types', OFF) /** @since 3.5.0 */ // propTypes only rule
    .addRule('forward-ref-uses-ref', ERROR) /** @since 7.36.0 */
    .addRule('function-component-definition', ERROR, [
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ]) /** @since 7.18.0 */
    .addRule('hook-use-state', ERROR, [{allowDestructuredState: true}]) /** @since 7.29.0 */
    .addRule(
      'jsx-boolean-value',
      shorthandBoolean === 'prefer-error' || shorthandBoolean === 'avoid-error'
        ? ERROR
        : shorthandBoolean === 'prefer' || shorthandBoolean === 'avoid'
          ? WARNING
          : OFF,
      [shorthandBoolean === 'prefer-error' || shorthandBoolean === 'prefer' ? 'never' : 'always'],
    ) /** @since 2.1.0 */
    .addRule('jsx-child-element-spacing', OFF) /** @since 7.6.0 */
    .addRule('jsx-closing-bracket-location', OFF) /** @since 3.3.0 */
    .addRule('jsx-closing-tag-location', OFF) /** @since 7.1.0 */
    .addRule('jsx-curly-brace-presence', WARNING, [
      {props: 'never', children: 'never', propElementValues: 'always'},
    ]) /** @since 7.4.0-rc.0 */
    .addRule('jsx-curly-newline', OFF) /** @since 7.14.0 */
    .addRule('jsx-curly-spacing', OFF) /** @since 2.7.0 */
    .addRule('jsx-equals-spacing', OFF) /** @since 3.16.0 */
    .addRule('jsx-filename-extension', WARNING, [
      {
        extensions: JSX_FILE_EXTENSIONS,
        ignoreFilesWithoutCode: true,
      },
    ]) /** @since 5.2.0 */
    .addRule('jsx-first-prop-new-line', OFF) /** @since 5.0.0 */
    .addRule(
      'jsx-fragments',
      shorthandFragment === 'prefer-error' || shorthandFragment === 'avoid-error'
        ? ERROR
        : shorthandFragment === 'prefer' || shorthandFragment === 'avoid'
          ? WARNING
          : OFF,
      [
        shorthandFragment === 'prefer-error' || shorthandFragment === 'prefer'
          ? 'syntax'
          : 'element',
      ],
    ) /** @since 7.12.0 */
    .addRule('jsx-handler-names', OFF) /** @since 3.11.0 */
    .addRule('jsx-indent', OFF) /** @since 3.14.0 */
    .addRule('jsx-indent-props', OFF) /** @since 3.3.0 */
    .addRule('jsx-key', getDoubleRuleSeverity(NO_DUPLICATE_OR_MISSING_KEY_SEVERITY, true), [
      {
        checkFragmentShorthand: true,
        checkKeyMustBeforeSpread: true,
        warnOnDuplicates: true,
      },
    ]) /** @since 3.9.0 */ // 🟢
    .addRule('jsx-max-depth', OFF) /** @since 7.7.0 */
    .addRule('jsx-max-props-per-line', OFF) /** @since 3.2.0 */
    .addRule('jsx-newline', OFF) /** @since 7.22.0 */
    .addRule('jsx-no-bind', ERROR, [
      {allowArrowFunctions: true, ignoreRefs: true},
    ]) /** @since 3.7.0 */
    .addRule(
      'jsx-no-comment-textnodes',
      getDoubleRuleSeverity(NO_COMMENT_TEXTNODES_SEVERITY, false),
    ) /** @since 5.2.0 */ /** @aka no-comment-textnodes */ // 🟢
    .addRule(
      'jsx-no-constructed-context-values',
      getDoubleRuleSeverity(NO_UNSTABLE_CONTEXT_VALUE_SEVERITY, false),
    ) /** @since 7.22.0 */
    .addRule('jsx-no-duplicate-props', ERROR) /** @since 3.0.0 */ // 🟢
    // 🤔 Has many issues like https://github.com/jsx-eslint/eslint-plugin-react/issues/3292
    .addRule(
      'jsx-no-leaked-render',
      isReactXEnabled && !isConfigXDisabled
        ? OFF
        : getDoubleRuleSeverity(NO_LEAKED_CONDITIONAL_RENDERING_SEVERITY, false),
    ) /** @since 7.30.0 */
    // 🤔 From my understanding a rather niche rule, mostly useful in i18n apps
    .addRule('jsx-no-literals', OFF) /** @since 3.2.0 */
    .addRule('jsx-no-undef', ERROR) /** @since 1.6.0 */ // 🟢
    .addRule(
      'jsx-no-useless-fragment',
      getDoubleRuleSeverity(NO_USELESS_FRAGMENT_SEVERITY, false),
      [{allowExpressions: true}],
    ) /** @since 7.15.0 */
    .addRule('jsx-one-expression-per-line', OFF) /** @since 7.5.0 */
    .addRule('jsx-pascal-case', WARNING, [{allowNamespace: true}]) /** @since 3.10.0 */
    .addRule('jsx-props-no-multi-spaces', OFF) /** @since 7.9.0 */
    .addRule('jsx-props-no-spread-multi', ERROR) /** @since 7.35.0 */
    .addRule('jsx-props-no-spreading', ERROR, [
      {custom: 'ignore' /* Only enforced on HTML elements */},
    ]) /** @since 7.13.0 */
    .addRule('jsx-sort-props', OFF) /** @since 2.0.0 */
    .addRule('jsx-tag-spacing', OFF) /** @since 6.7.0 */
    .addRule('jsx-uses-react', newJsxTransform ? OFF : ERROR) /** @since 1.4.0 */ // 🟢
    .addRule('jsx-uses-vars', ERROR) /** @since 1.5.0 */ // 🟢
    .addRule('jsx-wrap-multilines', OFF) /** @since 1.1.0 */ /** @aka wrap-multilines */
    .addRule(
      'no-access-state-in-setstate',
      getDoubleRuleSeverity(NO_ACCESS_STATE_IN_SETSTATE_SEVERITY, false),
    ) /** @since 7.5.0 */
    .addRule('no-adjacent-inline-elements', OFF) /** @since 7.18.0 */
    .addRule(
      'no-array-index-key',
      getDoubleRuleSeverity(NO_ARRAY_INDEX_KEY_SEVERITY, false),
    ) /** @since 6.8.0 */
    .addRule('no-arrow-function-lifecycle', ERROR) /** @since 7.27.0 */
    .addRule(
      'no-children-prop',
      getDoubleRuleSeverity(NO_CHILDREN_PROP_SEVERITY, false),
    ) /** @since 6.3.0 */ // 🟢
    // TODO
    .addRule('no-deprecated', ERROR) /** @since 3.12.0 */ // 🟢
    .addRule(
      'no-did-mount-set-state',
      getDoubleRuleSeverity(NO_SET_STATE_IN_COMPONENT_DID_MOUNT_SEVERITY, false),
    ) /** @since 1.3.0 */
    .addRule(
      'no-did-update-set-state',
      getDoubleRuleSeverity(NO_SET_STATE_IN_COMPONENT_DID_UPDATE_SEVERITY, false),
    ) /** @since 1.3.0 */
    .addRule(
      'no-direct-mutation-state',
      getDoubleRuleSeverity(NO_DIRECT_MUTATION_STATE_SEVERITY, false),
    ) /** @since 3.5.0 */ // 🟢
    .addRule('no-multi-comp', ERROR) /** @since 1.0.0 */
    .addRule(
      'no-object-type-as-default-prop',
      getDoubleRuleSeverity(NO_UNSTABLE_DEFAULT_PROPS_SEVERITY, false),
    ) /** @since 7.32.0 */
    .addRule('no-redundant-should-component-update', ERROR) /** @since 7.1.0 */
    .addRule('no-set-state', OFF) /** @since 3.3.0 */
    .addRule('no-string-refs', ERROR, [{noTemplateLiterals: true}]) /** @since 3.13.0 */ // 🟢
    .addRule('no-this-in-sfc', ERROR) /** @since 7.6.0 */
    .addRule('no-typos', ERROR) /** @since 7.2.0 */
    .addRule('no-unescaped-entities', OFF) /** @since 6.7.0 */ // 🟢
    .addRule(
      'no-unsafe',
      getDoubleRuleSeverity(noUnsafeClassComponentMethodsSeverity, false),
    ) /** @since 7.10.0 */ // 🟢(off)
    .addRule(
      'no-unstable-nested-components',
      getDoubleRuleSeverity(NO_NESTED_COMPONENT_DEFINITIONS_SEVERITY, false),
      [{allowAsProps: true}],
    ) /** @since 7.23.0 */
    .addRule(
      'no-unused-class-component-methods',
      getDoubleRuleSeverity(NO_UNUSED_CLASS_COMPONENT_MEMBERS_SEVERITY, false),
    ) /** @since 7.27.0 */
    .addRule('no-unused-prop-types', WARNING) /** @since 6.2.0 */
    .addRule(
      'no-unused-state',
      getDoubleRuleSeverity(NO_UNUSED_STATE_SEVERITY, false),
    ) /** @since 7.2.0 */
    .addRule(
      'no-will-update-set-state',
      getDoubleRuleSeverity(NO_SET_STATE_IN_COMPONENT_WILL_UPDATE_SEVERITY, false),
    ) /** @since 7.0.0-rc.0 */
    .addRule('prefer-es6-class', ERROR) /** @since 3.6.0 */
    .addRule('prefer-exact-props', OFF) /** @since 7.25.0 */ // propTypes only rule
    .addRule('prefer-read-only-props', OFF) /** @since 7.13.0 */
    .addRule('prefer-stateless-function', ERROR) /** @since 4.2.0 */
    .addRule('prop-types', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('react-in-jsx-scope', newJsxTransform ? OFF : ERROR) /** @since 1.4.0 */ // 🟢
    .addRule('require-default-props', OFF) /** @since 6.8.0 */
    .addRule('require-optimization', OFF) /** @since 5.2.0 */
    // TODO disable in ts?
    .addRule('require-render-return', ERROR) /** @since 4.3.0 */ // 🟢
    .addRule('self-closing-comp', OFF) /** @since 1.2.0 */
    .addRule('sort-comp', ERROR) /** @since 2.3.0 */
    .addRule('sort-default-props', OFF) /** @since 7.32.0 */ // propTypes only rule
    .addRule('sort-prop-types', OFF) /** @since 4.0.0-rc.0 */ // propTypes only rule
    .addRule('state-in-constructor', ERROR, ['never']) /** @since 7.13.0 */
    .addRule('static-property-placement', ERROR) /** @since 7.13.0 */
    .addRule('style-prop-object', OFF) /** @since 6.2.0 */
    .enableConfigTesterForPlugin('react', {
      /* v8 ignore next */
      rulesToSkipInConfig: (ruleName) => REACT_ORIGINAL_DOM_RULES.has(ruleName),
    })
    .addOverrides();

  const configBuilderAllowDefaultExportsInJsxFiles = context.createConfigBuilder(
    configAllowDefaultExportsInJsxFiles,
    null,
  );
  configBuilderAllowDefaultExportsInJsxFiles
    ?.addConfig([
      'react/allow-default-export-in-jsx-files',
      {
        filesDefault: [GLOB_JSX_TSX],
      },
    ])
    .disableAnyRule('import', 'no-default-export')
    .addOverrides();

  const configBuilderHooks = context.createConfigBuilder(configHooks, 'react-hooks');
  const configHooksOptions = typeof configHooks === 'object' ? configHooks : {};
  const {enableReactCompilerRules = true} = configHooksOptions;

  const reactCompilerRulesSeverity = enableReactCompilerRules ? ERROR : OFF;
  const reactCompilerRulesWarnSeverity = enableReactCompilerRules ? WARNING : OFF;

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)
  // 🟣 - in recommended-latest

  configBuilderHooks
    ?.addConfig([
      'react/hooks',
      {
        filesDefault: parentConfigFiles || DEFAULT_FILES,
        ignoresDefault: parentConfigIgnores,
        settings: {
          'react-hooks': configHooksOptions.settings,
        },
      },
    ])
    // Severity of react compiler rules correspond to the recommended ones from https://github.com/react/react/blob/bf45a68dd35ed08860b6a70fed641dfe6d7d290d/compiler/packages/babel-plugin-react-compiler/src/CompilerError.ts#L777
    .addRule('capitalized-calls', reactCompilerRulesSeverity) /** @since 6.1.0 */
    .addRule('config', reactCompilerRulesSeverity) /** @since 6.1.0 */ // 🟢
    .addRule('error-boundaries', reactCompilerRulesSeverity) /** @since 6.1.0 */ // 🟢
    .addRule('exhaustive-deps', ERROR) /** @since 1.1.0-rc.0 */ // 🟡
    .addRule('exhaustive-effect-dependencies', reactCompilerRulesSeverity) /** @since 6.1.0 */
    .addRule('fbt', reactCompilerRulesSeverity) /** @since 6.1.0 */
    .addRule('gating', reactCompilerRulesSeverity) /** @since 6.1.0 */ // 🟢
    .addRule('globals', reactCompilerRulesSeverity) /** @since 6.1.0 */ // 🟢
    // Almost the same as `rules-of-hooks`, see https://github.com/react/react/blob/614a945d9d1031fadcf211a632cb2d7fda495a4f/compiler/packages/babel-plugin-react-compiler/src/CompilerError.ts#L840
    .addRule('hooks', OFF) /** @since 6.1.0 */
    .addRule('immutability', reactCompilerRulesSeverity) /** @since 6.1.0 */ // 🟢
    .addRule('incompatible-library', reactCompilerRulesSeverity) /** @since 6.1.0 */ // 🟡
    .addRule('invariant', reactCompilerRulesSeverity) /** @since 6.1.0 */
    .addRule('memo-dependencies', reactCompilerRulesSeverity) /** @since 6.1.0 */
    .addRule('memoized-effect-dependencies', reactCompilerRulesSeverity) /** @since 6.1.0 */
    .addRule('no-deriving-state-in-effects', reactCompilerRulesSeverity) /** @since 6.1.0 */
    .addRule('preserve-manual-memoization', reactCompilerRulesSeverity) /** @since 6.1.0 */ // 🟢
    .addRule('purity', reactCompilerRulesSeverity) /** @since 6.1.0 */ // 🟢
    .addRule('refs', reactCompilerRulesSeverity) /** @since 6.1.0 */ // 🟢
    .addRule('rule-suppression', reactCompilerRulesSeverity) /** @since 6.1.0 */
    .addRule('rules-of-hooks', ERROR) /** @since 0.0.0 */ // 🟢
    .addRule('set-state-in-effect', reactCompilerRulesSeverity) /** @since 6.1.0 */ // 🟢
    .addRule('set-state-in-render', reactCompilerRulesSeverity) /** @since 6.1.0 */ // 🟢
    .addRule('static-components', reactCompilerRulesSeverity) /** @since 6.1.0 */ // 🟢
    .addRule('syntax', reactCompilerRulesSeverity) /** @since 6.1.0 */
    .addRule('todo', OFF) /** @since 6.1.0 */
    .addRule('unsupported-syntax', reactCompilerRulesWarnSeverity) /** @since 6.1.0 */ // 🟡
    .addRule('use-memo', reactCompilerRulesWarnSeverity) /** @since 6.1.0 */ // 🟢
    .addRule('void-use-memo', reactCompilerRulesSeverity) /** @since 7.0.0 */ // 🟣
    .enableConfigTesterForPlugin('react-hooks')
    .addOverrides();

  const {
    noLegacyApis = {},
    configTypeAwareRules: configReactXTypeAwareRules = context.configsMeta.ts.enabled,
  } = configReactXOptions;

  const configBuilderReactX = context.createConfigBuilder(configReactX, 'eslint-react');

  // Legend:
  // 🟢 - in recommended, severity is `error`
  // 🟡 - in recommended, severity is `warn`
  // 🔄️ - Name of the same rule in `eslint-plugin-react` that will be disabled if `configReactX` is enabled (name is also same if it is not specified)
  // 💭 - Requires type information
  // 🔢 - min React version in which the rule works (otherwise does nothing)

  configBuilderReactX
    ?.addConfig([
      'react/x',
      {
        filesDefault: parentConfigFiles || DEFAULT_FILES,
        ignoresDefault: parentConfigIgnores,
        settings: {
          'react-x': reactXSettings,
        },
      },
    ])
    .markCategory('X')
    .addRule('error-boundaries', ERROR) /** @since 3.0.0-beta.0 */ // 🟢
    .addRule('exhaustive-deps', ERROR) /** @since 3.0.0-beta.0 */ // 🟡
    .addRule('globals', ERROR) /** @since 5.3.1-beta.0 */
    .addRule('immutability', ERROR) /** @since 3.0.0-beta.31 */
    .addRule(
      'jsx-no-children-prop',
      getDoubleRuleSeverity(NO_CHILDREN_PROP_SEVERITY, true),
    ) /** @since 0.8.6 */ // 🔄️
    .addRule('jsx-no-children-prop-with-children', ERROR) /** @since 4.0.0-beta.1 */ // 🟢
    .addRule(
      'jsx-no-comment-textnodes',
      getDoubleRuleSeverity(NO_COMMENT_TEXTNODES_SEVERITY, true),
    ) /** @since 0.7.0 */ /** @aka no-comment-textnodes */ // 🟡 🔄️`jsx-no-comment-textnodes`
    .addRule('jsx-no-key-after-spread', ERROR) /** @since 1.49.0 */ // 🟡
    .addRule('jsx-no-leaked-dollar', ERROR) /** @since 4.2.3 */
    .addRule('jsx-no-leaked-semicolon', ERROR) /** @since 4.2.3 */ // 🟡
    .addRule(
      'jsx-no-useless-fragment',
      getDoubleRuleSeverity(NO_USELESS_FRAGMENT_SEVERITY, true),
    ) /** @since 0.5.9 */ // 🔄️`jsx-no-useless-fragment`
    .addRule(
      'no-access-state-in-setstate',
      getDoubleRuleSeverity(NO_ACCESS_STATE_IN_SETSTATE_SEVERITY, true),
    ) /** @since 0.10.11-beta.2 */ // 🟢 🔄️
    .addRule(
      'no-array-index-key',
      getDoubleRuleSeverity(NO_ARRAY_INDEX_KEY_SEVERITY, true),
    ) /** @since 0.3.6 */ // 🟡 🔄️
    .addRule('no-children-count', getSeverity(noLegacyApis.Children)) /** @since 0.8.4 */ // 🟡
    .addRule('no-children-for-each', getSeverity(noLegacyApis.Children)) /** @since 0.8.4 */ // 🟡
    .addRule('no-children-map', getSeverity(noLegacyApis.Children)) /** @since 0.8.4 */ // 🟡
    .addRule('no-children-only', getSeverity(noLegacyApis.Children)) /** @since 0.8.4 */ // 🟡
    .addRule('no-children-to-array', getSeverity(noLegacyApis.Children)) /** @since 0.8.4 */ // 🟡
    .addRule(
      'no-class-component',
      getSeverity(noLegacyApis.classComponent ?? 'warn'),
    ) /** @since 0.5.4 */
    .addRule('no-clone-element', getSeverity(noLegacyApis.cloneElement)) /** @since 0.5.7 */ // 🟡
    .addRule(
      'no-component-will-mount',
      getSeverity(noLegacyApis.componentWillMount),
    ) /** @since 0.9.1 */ // 🟢
    .addRule(
      'no-component-will-receive-props',
      getSeverity(noLegacyApis.componentWillReceiveProps),
    ) /** @since 0.9.2 */ // 🟢
    .addRule(
      'no-component-will-update',
      getSeverity(noLegacyApis.componentWillUpdate),
    ) /** @since 0.9.2 */ // 🟢
    .addRule('no-context-provider', ERROR) /** @since 1.19.0 */ // 🟡 🔢19.0.0
    .addRule('no-create-ref', getSeverity(noLegacyApis.createRef)) /** @since 0.5.5 */ // 🟢
    .addRule(
      'no-direct-mutation-state',
      getDoubleRuleSeverity(NO_DIRECT_MUTATION_STATE_SEVERITY, true),
    ) /** @since 0.9.3 */ // 🟢 🔄️
    .addRule(
      'no-duplicate-key',
      getDoubleRuleSeverity(NO_DUPLICATE_OR_MISSING_KEY_SEVERITY, true),
    ) /** @since 0.3.6 */ // 🔄️`jsx-key` (`warnOnDuplicates` option)
    // "In React 19, forwardRef is no longer necessary. Pass ref as a prop instead."
    .addRule('no-forward-ref', getSeverity(noLegacyApis.forwardRef)) /** @since 1.18.0 */ // 🟡 🔢19.0.0
    .addRule(
      'no-missing-component-display-name',
      getDoubleRuleSeverity(NO_MISSING_COMPONENT_OR_CONTEXT_DISPLAY_NAME_SEVERITY, true),
    ) /** @since 0.8.8 */ // 🔄️`display-name`
    .addRule(
      'no-missing-context-display-name',
      getDoubleRuleSeverity(NO_MISSING_COMPONENT_OR_CONTEXT_DISPLAY_NAME_SEVERITY, true),
    ) /** @since 1.27.0 */ // 🔄️`display-name` (`checkContextObjects` option)
    .addRule(
      'no-missing-key',
      getDoubleRuleSeverity(NO_DUPLICATE_OR_MISSING_KEY_SEVERITY, true),
    ) /** @since 0.3.5 */ // 🟢 🔄️`jsx-key`
    .addRule('no-misused-capture-owner-stack', ERROR) /** @since 1.45.0 */
    .addRule(
      'no-nested-component-definitions',
      getDoubleRuleSeverity(NO_NESTED_COMPONENT_DEFINITIONS_SEVERITY, true),
    ) /** @since 0.3.3 */ /** @aka no-nested-components */ /** @aka no-unstable-nested-components */ // 🟢 🔄️`no-unstable-nested-components`
    .addRule('no-nested-lazy-component-declarations', ERROR) /** @since 1.45.0 */ // 🟢
    .addRule(
      'no-set-state-in-component-did-mount',
      getDoubleRuleSeverity(NO_SET_STATE_IN_COMPONENT_DID_MOUNT_SEVERITY, true),
    ) /** @since 0.9.2 */ // 🟡 🔄️`no-did-mount-set-state`
    .addRule(
      'no-set-state-in-component-did-update',
      getDoubleRuleSeverity(NO_SET_STATE_IN_COMPONENT_DID_UPDATE_SEVERITY, true),
    ) /** @since 0.9.2 */ // 🟡 🔄️`no-did-update-set-state`
    .addRule(
      'no-set-state-in-component-will-update',
      getDoubleRuleSeverity(NO_SET_STATE_IN_COMPONENT_WILL_UPDATE_SEVERITY, true),
    ) /** @since 0.9.2 */ // 🟡 🔄️`no-will-update-set-state`
    .addRule(
      'no-unnecessary-use-prefix',
      getXRuleSeverity(OFF),
    ) /** @since 0.8.8-beta.0 */ /** @aka no-useless-custom-hooks */ /** @aka no-redundant-custom-hook */ /** @aka ensure-custom-hooks-using-other-hooks */ // 🟡
    .addRule(
      'no-unsafe-component-will-mount',
      getDoubleRuleSeverity(noUnsafeClassComponentMethodsSeverity, true),
    ) /** @since 0.9.1 */ // 🟡 🔄️`no-unsafe`
    .addRule(
      'no-unsafe-component-will-receive-props',
      getDoubleRuleSeverity(noUnsafeClassComponentMethodsSeverity, true),
    ) /** @since 0.9.2 */ // 🟡 🔄️`no-unsafe`
    .addRule(
      'no-unsafe-component-will-update',
      getDoubleRuleSeverity(noUnsafeClassComponentMethodsSeverity, true),
    ) /** @since 0.9.2 */ // 🟡 🔄️`no-unsafe`
    .addRule(
      'no-unstable-context-value',
      getDoubleRuleSeverity(NO_UNSTABLE_CONTEXT_VALUE_SEVERITY, true),
    ) /** @since 0.3.0 */ /** @aka no-constructed-context-value */ // 🟡 🔄️`jsx-no-constructed-context-values`
    .addRule(
      'no-unstable-default-props',
      getDoubleRuleSeverity(NO_UNSTABLE_DEFAULT_PROPS_SEVERITY, true),
    ) // 🟡 🔄️`no-object-type-as-default-prop`
    .addRule(
      'no-unused-class-component-members',
      getDoubleRuleSeverity(NO_UNUSED_CLASS_COMPONENT_MEMBERS_SEVERITY, true),
    ) /** @since 0.10.5-beta.0 */ // 🟡 🔄️`no-unused-class-component-methods`
    .addRule(
      'no-unused-state',
      getDoubleRuleSeverity(NO_UNUSED_STATE_SEVERITY, true),
    ) /** @since 0.10.7 */ // 🟡 🔄️
    .addRule('no-use-context', WARNING) /** @since 1.26.0 */ // 🟡 🔢19.0.0
    .addRule('purity', ERROR) /** @since 3.0.0-beta.1 */ // 🟡
    .addRule('refs', ERROR) /** @since 3.0.0-beta.12 */
    .addRule('rsc-function-definition', ERROR) /** @since 4.0.0-beta.1 */ // 🟢
    .addRule('rules-of-hooks', ERROR) /** @since 3.0.0-beta.0 */ // 🟢
    .addRule(
      'set-state-in-effect',
      getXRuleSeverity(WARNING),
    ) /** @since 1.5.26 */ /** @aka no-direct-set-state-in-use-layout-effect (until 2.0.0) */ /** @aka no-direct-set-state-in-use-effect (until 3.0.0) */ // 🟡
    .addRule('set-state-in-render', ERROR) /** @since 3.0.0-beta.0 */ // 🟢
    .addRule('static-components', ERROR) /** @since 3.0.0-beta.29 */ // 🟢
    .addRule('unsupported-syntax', ERROR) /** @since 1.51.0 */ // 🟢
    .addRule('use-memo', ERROR) /** @since 3.0.0-beta.20 */ // 🟢
    .addRule('use-state', getXRuleSeverity(WARNING)) /** @since 0.9.6 */ // 🟡
    .markCategory('Naming Convention')
    .addRule('naming-convention-context-name', WARNING) /** @since 1.29.0 */ // 🟡
    .addRule('naming-convention-id-name', WARNING) /** @since 4.0.0-beta.1 */ // 🟡
    .addRule('naming-convention-ref-name', ERROR) /** @since 2.5.0 */ // 🟡
    .markCategory('Debug')
    .addAnyRule('react-debug', 'function-component', OFF) /** @since 0.3.0 */
    .addAnyRule('react-debug', 'hook', OFF) /** @since 1.13.0 */
    .addAnyRule('react-debug', 'is-from-react', OFF) /** @since 1.10.0 */
    .addAnyRule('react-debug', 'jsx', OFF) /** @since 1.41.0 */
    .enableConfigTesterForPlugin('eslint-react', {
      /* v8 ignore start */
      rulesToSkipInConfig: (ruleName) =>
        REACT_X_TYPE_AWARE_RULES.has(ruleName) ||
        ['x', 'dom', 'web-api'].some((prefix) => ruleName.startsWith(`${prefix}-`)) ||
        ruleName === 'jsx-no-namespace',
      /* v8 ignore stop */
    })
    .addOverrides();

  const configBuilderReactXTypeAware = context.createConfigBuilder(
    tsFilesTypeAware.length === 0 ? false : configReactXTypeAwareRules,
    'eslint-react',
  );
  configBuilderReactXTypeAware
    ?.addConfig([
      'react/x/rules-type-aware',
      {
        filesDefault: tsFilesTypeAware,
        ignoresDefault: tsIgnoresTypeAware,
      },
    ])
    .addRule('no-implicit-children', ERROR) /** @since 3.0.0-beta.76 */ // 💭
    .addRule('no-implicit-key', ERROR) /** @since 1.5.0-beta.0 */ // 💭
    .addRule('no-implicit-ref', ERROR) /** @since 3.0.0-beta.76 */ // 💭
    .addRule(
      'no-leaked-conditional-rendering',
      getDoubleRuleSeverity(NO_LEAKED_CONDITIONAL_RENDERING_SEVERITY, true),
    ) /** @since 0.3.0 */ // 🟡💭 🔄️`jsx-no-leaked-render` (worse)
    .addRule('no-unused-props', WARNING) /** @since 2.0.0 */ // 💭
    .enableConfigTesterForPlugin('eslint-react', {
      /* v8 ignore next */
      rulesToSkipInConfig: (ruleName) => !REACT_X_TYPE_AWARE_RULES.has(ruleName),
    })
    .addOverrides();

  const configBuilderDom = context.createConfigBuilder(configDom, 'eslint-react');
  configBuilderDom
    ?.addConfig(
      [
        'react/dom',
        {
          filesDefault: parentConfigFiles || DEFAULT_FILES,
          ignoresDefault: parentConfigIgnores,
          settings: {
            react: reactOriginalSettings,
            'react-x': reactXSettings,
          },
        },
      ],
      extraFlatConfigForReactOriginal,
    )
    .addAnyRule(
      ...getDoubleRuleName('dom-no-dangerously-set-innerhtml', 'no-danger'),
      getDoubleRuleSeverity(ERROR),
    ) /** @since 0.3.0 */ /** @since 2.7.0 */ // 🟡 🔄️`no-danger`
    .addAnyRule(
      ...getDoubleRuleName(
        'dom-no-dangerously-set-innerhtml-with-children',
        'no-danger-with-children',
      ),
      getDoubleRuleSeverity(ERROR),
    ) /** @since 0.3.0 */ /** @since 6.1.0 */ // 🟢 🔄️`no-danger-with-children`
    // Deprecated API, removed in v19
    .addAnyRule(
      ...getDoubleRuleName('dom-no-find-dom-node', 'no-find-dom-node'),
      getDoubleRuleSeverity(ERROR),
    ) /** @since 0.8.11 */ /** @since 6.0.0-alpha.2 */ // 🟢 🔄️
    .addRule('dom-no-flush-sync', getXRuleSeverity(ERROR)) /** @since 1.28.0 */ // 🟢
    // Deprecated API, removed in v19
    .addRule('dom-no-hydrate', getXRuleSeverity(ERROR)) /** @since 1.35.0 */ // 🟢 🔢18.0.0
    .addAnyRule(
      ...getDoubleRuleName('dom-no-missing-button-type', 'button-has-type'),
      getDoubleRuleSeverity(ERROR),
    ) /** @since 0.6.1 */ /** @since 7.5.0 */ // 🟡 🔄️`button-has-type`
    .addAnyRule(
      ...getDoubleRuleName('dom-no-missing-iframe-sandbox', 'iframe-missing-sandbox'),
      getDoubleRuleSeverity(ERROR),
    ) /** @since 0.6.1 */ /** @since 7.29.0 */ // 🟡 🔄️`iframe-missing-sandbox`
    .addAnyRule(
      ...getDoubleRuleName('jsx-no-namespace', 'no-namespace'),
      getDoubleRuleSeverity(ERROR),
    ) /** @since 0.5.5 */ /** @since 7.26.0 */ // 🟢 🔄️
    // Deprecated API, removed in v19
    .addRule('dom-no-render', getXRuleSeverity(ERROR)) /** @since 1.35.0 */ // 🟢 🔢18.0.0
    .addAnyRule(
      ...getDoubleRuleName('dom-no-render-return-value', 'no-render-return-value'),
      getDoubleRuleSeverity(ERROR),
    ) /** @since 0.8.12 */ /** @since 5.2.0 */ // 🟢 🔄️
    .addAnyRule(
      ...getDoubleRuleName('dom-no-script-url', 'jsx-no-script-url'),
      getDoubleRuleSeverity(ERROR),
    ) /** @since 0.3.8 */ /** @since 7.18.0 */ // 🟡 🔄️`jsx-no-script-url`
    .addAnyRule(
      ...getDoubleRuleName('dom-no-unknown-property', 'no-unknown-property'),
      getDoubleRuleSeverity(ERROR),
      [{requireDataLowercase: true}],
    ) /** @since 1.16.1 */ /** @since 2.0.0 */ // 🔄️
    .addAnyRule(
      ...getDoubleRuleName('dom-no-unsafe-iframe-sandbox', 'iframe-missing-sandbox'),
      getDoubleRuleSeverity(ERROR),
    ) /** @since 0.6.1 */ /** @since 7.29.0 */ // 🟡 🔄️`iframe-missing-sandbox`
    .addAnyRule(
      ...getDoubleRuleName('dom-no-unsafe-target-blank', 'jsx-no-target-blank'),
      getDoubleRuleSeverity(ERROR),
    ) /** @since 0.6.2 */ /** @since 5.1.0 */ // 🟡 🔄️`jsx-no-target-blank`
    // React 19 docs: "In earlier React Canary versions, this API was part of React DOM and called useFormState."
    .addRule('dom-no-use-form-state', getXRuleSeverity(ERROR)) /** @since 1.35.0 */ // 🟢 🔢19.0.0
    .addAnyRule(
      ...getDoubleRuleName('dom-no-string-style-prop', 'style-prop-object'),
      getDoubleRuleSeverity(OFF),
    ) /** @since 20.0.0 */ /** @since 6.2.0 */ // 🟢 🔄️`style-prop-object`
    .addAnyRule(
      ...getDoubleRuleName('dom-no-void-elements-with-children', 'void-dom-elements-no-children'),
      getDoubleRuleSeverity(ERROR),
    ) /** @since 1.22.0 */ /** @aka no-children-in-void-dom-elements */ /** @since 6.10.0 */ // 🟢 🔄️`void-dom-elements-no-children`
    .markCategory('Web API')
    .addRule('web-api-no-leaked-event-listener', getXRuleSeverity(ERROR)) /** @since 4.0.0-beta.1 */ // 🟡
    .addRule('web-api-no-leaked-fetch', getXRuleSeverity(ERROR)) /** @since 1.11.0 */ // 🟡
    .addRule('web-api-no-leaked-intersection-observer', getXRuleSeverity(ERROR)) /** @since 5.9.0 */ // 🟡
    .addRule('web-api-no-leaked-interval', getXRuleSeverity(ERROR)) /** @since 1.11.0 */ // 🟡
    .addRule('web-api-no-leaked-resize-observer', getXRuleSeverity(ERROR)) /** @since 1.13.0 */ // 🟡
    .addRule('web-api-no-leaked-timeout', getXRuleSeverity(ERROR)) /** @since 1.11.0 */ // 🟡
    .markCategory('DOM (eslint-plugin-react)')
    .addAnyRule('react', 'checked-requires-onchange-or-readonly', ERROR, [
      {ignoreMissingProperties: true},
    ]) /** @since 7.34.0 */
    .addAnyRule('react', 'forbid-dom-props', OFF) /** @since 7.6.0 */
    .addAnyRule('react', 'no-invalid-html-attribute', ERROR) /** @since 7.27.0 */
    .addAnyRule('react', 'no-is-mounted', ERROR) /** @since 3.12.0 */ // 🟢
    .addOverrides();

  const configBuilderRefresh = context.createConfigBuilder(configRefresh, 'react-refresh');
  const configReactRefreshOptions = typeof configRefresh === 'object' ? configRefresh : {};
  configBuilderRefresh
    ?.addConfig([
      'react/refresh',
      {
        filesDefault: [GLOB_JSX_TSX],
      },
    ])
    .addRule('only-export-components', ERROR, [
      {
        allowExportNames: [
          ...(isRemixOrReactRouterInstalled ? REMIX_AND_REACT_ROUTER_EXPORTS : []),
          ...(context.packagesInfo.next ? NEXT_EXPORTS : []),
          ...(configReactRefreshOptions.allowExportNames || []),
        ],
        allowConstantExport: isViteInstalled,
        ...configReactRefreshOptions.options,
      },
    ]) /** @since 0.1.0 */
    .enableConfigTesterForPlugin('react-refresh')
    .addOverrides();

  const configBuilderYouMightNotNeedAnEffect = context.createConfigBuilder(
    configYouMightNotNeedAnEffect,
    'react-you-might-not-need-an-effect',
  );
  configBuilderYouMightNotNeedAnEffect
    ?.addConfig([
      'react/you-might-not-need-an-effect',
      {
        filesDefault: parentConfigFiles || DEFAULT_FILES,
        ignoresDefault: parentConfigIgnores,
      },
    ])
    .addRule('no-adjust-state-on-prop-change', ERROR) /** @since 0.5.0 */ // 🟡 (renamed, original rules added in 0.4.5)
    .addRule('no-chain-state-updates', ERROR) /** @since 0.3.0 */ // 🟡
    .addRule('no-derived-state', ERROR) /** @since 0.3.0 */ // 🟡
    .addRule('no-event-handler', ERROR) /** @since 0.3.0 */ // 🟡
    .addRule('no-external-store-subscription', ERROR) /** @since 0.11.0 */ // 🟡
    .addRule('no-initialize-state', ERROR) /** @since 0.3.0 */ // 🟡
    .addRule('no-pass-data-to-parent', ERROR) /** @since 0.4.0 */ // 🟡
    .addRule('no-pass-live-state-to-parent', ERROR) /** @since 0.3.0 */ // 🟡
    .addRule('no-reset-all-state-on-prop-change', ERROR) /** @since 0.5.0 */ // 🟡 (renamed, original rules added in 0.3.0)
    .enableConfigTesterForPlugin('react-you-might-not-need-an-effect')
    .addOverrides();

  return {
    configs: [
      configBuilderReactOriginal,
      configBuilderAllowDefaultExportsInJsxFiles,
      configBuilderHooks,
      configBuilderReactX,
      configBuilderReactXTypeAware,
      configBuilderDom,
      configBuilderRefresh,
      configBuilderYouMightNotNeedAnEffect,
    ],
    optionsResolved,
  };
});

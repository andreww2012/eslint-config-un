import {
  ERROR,
  GLOB_JS_TS_X,
  GLOB_JS_TS_X_ONLY,
  OFF,
  type RuleSeverity,
  WARNING,
} from '../constants';
import type {DistributedPick, OmitStrict, Prettify} from '../types';
import {doesPackageExist} from '../utils';
import {noRestrictedHtmlElementsDefault} from './shared';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type RuleNamesForPlugin,
  type RulesRecordPartial,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
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
   * @see https://eslint-react.xyz/docs/configuration/configure-analyzer#version
   */
  version?: string;

  /**
   * @see https://eslint-react.xyz/docs/configuration/configure-analyzer#importsource
   */
  importSource?: string;

  /**
   * @see https://eslint-react.xyz/docs/configuration/configure-analyzer#polymorphicpropname
   */
  polymorphicPropName?: string;
}

type EslintPluginReactDomRules =
  | 'checked-requires-onchange-or-readonly'
  | 'forbid-dom-props'
  | 'no-invalid-html-attribute'
  | 'no-is-mounted';

type ReactXTypeAwareRules = 'no-leaked-conditional-rendering' | 'prefer-read-only-props';

interface ReactXSubConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends UnConfigOptions<
    ExtraPlugins,
    OmitStrict<RulesRecordPartial<'@eslint-react'>, `@eslint-react/${ReactXTypeAwareRules}`>
  > {
  /**
   * [`@eslint-react/eslint-plugin`](https://npmjs.com/@eslint-react/eslint-plugin) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `react-x` property and applied to the specified `files` and `ignores`.
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
   * Affects the following rules (`@eslint-react` prefix is implied):
   * - `Children`: [`no-children-count`](https://eslint-react.xyz/docs/rules/no-children-count), [`no-children-for-each`](https://eslint-react.xyz/docs/rules/no-children-for-each), [`no-children-map`](https://eslint-react.xyz/docs/rules/no-children-map), [`no-children-only`](https://eslint-react.xyz/docs/rules/no-children-only), [`no-children-to-array`](https://eslint-react.xyz/docs/rules/no-children-to-array)
   * - `cloneElement`: [`no-clone-element`](https://eslint-react.xyz/docs/rules/no-clone-element)
   * - `classComponent`: [`no-class-component`](https://eslint-react.xyz/docs/rules/no-class-component)
   * - `createRef`: [`no-create-ref`](https://eslint-react.xyz/docs/rules/no-create-ref)
   * - `forwardRef`: [`no-forward-ref`](https://eslint-react.xyz/docs/rules/no-forward-ref)
   * - `componentWillMount`: [`no-component-will-mount`](https://eslint-react.xyz/docs/rules/no-component-will-mount)
   * - `componentWillReceiveProps`: [`no-component-will-receive-props`](https://eslint-react.xyz/docs/rules/no-component-will-receive-props)
   * - `componentWillUpdate`: [`no-component-will-update`](https://eslint-react.xyz/docs/rules/no-component-will-update)
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
    | UnConfigOptions<
        ExtraPlugins,
        Pick<RulesRecordPartial<'@eslint-react'>, `@eslint-react/${ReactXTypeAwareRules}`>
      >;
}

interface HooksSubConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends UnConfigOptions<ExtraPlugins, 'react-hooks' | '@eslint-react/hooks-extra'> {
  /**
   * [`eslint-plugin-react-hooks`](https://npmjs.com/eslint-plugin-react-hooks) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `react-hooks` property and applied to the specified `files` and `ignores`.
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

interface RefreshSubConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends UnConfigOptions<ExtraPlugins, 'react-refresh'> {
  /**
   * "If you use a framework that handles HMR of some specific exports, you can use this option to avoid warning for them." - plugin docs
   *
   * Note that we detect some frameworks and add their exports to this list automatically.
   * Names specified here will be added to the final list, not overwrite it.
   * - **Remix**: see [supported exports](https://remix.run/docs/en/main/discussion/hot-module-replacement#supported-exports).
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

export interface ReactEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends UnConfigOptions<ExtraPlugins, 'react'> {
  /**
   * [`eslint-plugin-react`](https://npmjs.com/eslint-plugin-react) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `react` property and applied to the specified `files` and `ignores`.
   *
   * Note that they will be merged with `{version: <detected by us React version>}` to avoid
   * `Warning: React version not specified in eslint-plugin-react settings.` log message
   * when running ESLint.
   */
  settings?: EslintPluginReactSettings;

  /**
   * Enables or specifies the configuration for the [`@eslint-react/eslint-plugin`](https://npmjs.com/@eslint-react/eslint-plugin) plugin.
   *
   * Only includes [runtime agnostic ("X")](https://eslint-react.xyz/docs/rules/overview#x-rules) and ["Naming Convention"](https://eslint-react.xyz/docs/rules/overview#naming-convention-rules) rules.
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
   * Enables or specifies the configuration for the [`eslint-plugin-react-hooks`](https://npmjs.com/eslint-plugin-react-hooks) plugin, as well as ["Hooks Extra" rules from `@eslint-react/eslint-plugin`](https://eslint-react.xyz/docs/rules/overview#hooks-extra-rules)
   * (unless `pluginX` option is set to `never` on `react` config).
   *
   * By default will use the same `files` and `ignores` as the parent config.
   * @default true
   */
  configHooks?: boolean | HooksSubConfigOptions<ExtraPlugins>;

  /**
   * Enables or specifies the configuration for DOM specific rules from [`@eslint-react/eslint-plugin`](https://npmjs.com/@eslint-react/eslint-plugin) and [`eslint-plugin-react`](https://npmjs.com/eslint-plugin-react).
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
    | UnConfigOptions<
        ExtraPlugins,
        | '@eslint-react/dom'
        | Pick<RulesRecordPartial<'react'>, `react/${EslintPluginReactDomRules}`>
      >;

  /**
   * Enables or specifies the configuration for the [`eslint-plugin-react-refresh`](https://npmjs.com/eslint-plugin-react-refresh) plugin.
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
    | UnConfigOptions<
        ExtraPlugins,
        DistributedPick<RulesRecordPartial, 'import/no-default-export'>
      >;

  /**
   * Enables or specifies the configuration for the [`eslint-plugin-react-you-might-not-need-an-effect?activeTab=readme`](https://npmjs.com/eslint-plugin-react-you-might-not-need-an-effect?activeTab=readme) plugin.
   *
   * By default will use the same `files` and `ignores` as the parent config.
   * @default true
   */
  configYouMightNotNeedAnEffect?:
    | boolean
    | UnConfigOptions<ExtraPlugins, 'react-you-might-not-need-an-effect'>;

  /**
   * Controls how rules from [@eslint-react/eslint-plugin](https://npmjs.com/@eslint-react/eslint-plugin) and [`eslint-plugin-react`](https://npmjs.com/eslint-plugin-react) are used.
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
   * `jsx-no-duplicate-props`                                | `jsx-no-duplicate-props`
   * `jsx-no-undef`                                          | `jsx-no-undef`
   * `jsx-uses-react`                                        | `jsx-uses-react`
   * `jsx-uses-vars`                                         | `jsx-uses-vars`
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
   * `no-string-refs`                                        | `no-string-refs`
   * `no-unstable-context-value`                             | `jsx-no-constructed-context-values`
   * `no-unstable-default-props`                             | `no-object-type-as-default-prop`
   * `no-unused-class-component-members`                     | `no-unused-class-component-methods`
   * `no-unused-state`                                       | `no-unused-state`
   * `no-useless-forward-ref`                                | `forward-ref-uses-ref`
   * `no-useless-fragment`                                   | `jsx-no-useless-fragment`
   * `prefer-destructuring-assignment`                       | `destructuring-assignment`
   * `prefer-read-only-props`                                | `prefer-read-only-props`
   * `prefer-shorthand-boolean`, `avoid-shorthand-boolean`   | `jsx-boolean-value`
   * `prefer-shorthand-fragment`, `avoid-shorthand-fragment` | `jsx-fragments`
   * `naming-convention/component-name`                      | `jsx-pascal-case`
   * `naming-convention/filename-extension`                  | `jsx-filename-extension`
   * `naming-convention/use-state`                           | `hook-use-state`
   * `dom/no-dangerously-set-innerhtml`                      | `no-danger`
   * `dom/no-dangerously-set-innerhtml-with-children`        | `no-danger-with-children`
   * `dom/no-find-dom-node`                                  | `no-find-dom-node`
   * `dom/no-missing-button-type`                            | `button-has-type`
   * `dom/no-missing-iframe-sandbox`                         | `iframe-missing-sandbox`
   * `dom/no-namespace`                                      | `no-namespace`
   * `dom/no-render-return-value`                            | `no-render-return-value`
   * `dom/no-script-url`                                     | `jsx-no-script-url`
   * `dom/no-unknown-property`                               | `no-unknown-property`
   * `dom/no-unsafe-iframe-sandbox`                          | `iframe-missing-sandbox`
   * `dom/no-unsafe-target-blank`                            | `jsx-no-target-blank`
   * `dom/no-void-elements-with-children`                    | `void-dom-elements-no-children`
   * `dom/no-string-style-prop`                              | `style-prop-object`
   * @default 'prefer'
   */
  pluginX?: 'prefer' | 'avoid' | 'only' | 'never';

  /**
   * Detected automatically from a major version of the installed version of
   * `react` package, but can also be specified manually here.
   */
  reactVersion?: number;

  /**
   * A flag indicating [the new JSX Transform](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html) is used. Affects some rules only from `eslint-plugin-react` plugin.
   * @default true <=> React version is 17 or higher
   */
  newJsxTransform?: boolean;

  /**
   * A list of disallowed React or HTML elements. Pass `true` to disallow or `string` to also
   * provide a custom error message.
   *
   * By default, all deprecated or non-standard HTML tags are disallowed. Pass `false` to re-allow any of them.
   *
   * Affects the options of the following rules:
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
   * Affects the following rules:
   * - [`@eslint-react/prefer-shorthand-boolean`](https://eslint-react.xyz/docs/rules/prefer-shorthand-boolean)
   * - [`@eslint-react/avoid-shorthand-boolean`](https://eslint-react.xyz/docs/rules/avoid-shorthand-boolean)
   * - [`jsx-boolean-value`](https://github.com/jsx-eslint/eslint-plugin-react/blob/HEAD/docs/rules/jsx-boolean-value.md)
   * @default 'prefer'
   */
  shorthandBoolean?: 'prefer' | 'prefer-error' | 'avoid' | 'avoid-error' | 'off';

  /**
   * Whether to prefer or avoid Fragment shorthand syntax in JSX (i.e. `<>...</>` over `<Fragment>...</Fragment>`).
   * - `prefer`/`avoid`: prefer/avoid Fragment shorthand syntax, use `warn` severity.
   * - `prefer-error`/`avoid-error`: prefer/avoid Fragment shorthand syntax, use `error` severity.
   * - `off`: allow both syntaxes.
   *
   * Affects the following rules:
   * - [`@eslint-react/prefer-shorthand-fragment`](https://eslint-react.xyz/docs/rules/prefer-shorthand-fragment)
   * - [`@eslint-react/avoid-shorthand-fragment`](https://eslint-react.xyz/docs/rules/avoid-shorthand-fragment)
   * - [`jsx-fragments`](https://github.com/jsx-eslint/eslint-plugin-react/blob/HEAD/docs/rules/jsx-fragments.md)
   * @default true
   */
  shorthandFragment?: 'prefer' | 'prefer-error' | 'avoid' | 'avoid-error' | 'off';
}

const LATEST_REACT_VERSION = 19;
const JSX_FILE_EXTENSIONS = ['.jsx', '.tsx', '.cjsx', '.mjsx', '.ctsx', '.mtsx'];

const getSeverity = (severity: boolean | 'warn' = true) =>
  severity === 'warn' ? WARNING : severity ? ERROR : OFF;

const JSX_NO_DUPLICATE_PROPS_SEVERITY = ERROR;
const JSX_NO_UNDEF_SEVERITY = ERROR;
const JSX_USES_REACT_SEVERITY = ERROR;
const JSX_USES_VARS_SEVERITY = ERROR;
const NO_ACCESS_STATE_IN_SETSTATE_SEVERITY = ERROR;
const NO_ARRAY_INDEX_KEY_SEVERITY = WARNING;
const NO_CHILDREN_PROP_SEVERITY = ERROR;
const NO_COMMENT_TEXTNODES_SEVERITY = ERROR;
const NO_DIRECT_MUTATION_STATE_SEVERITY = ERROR;
const NO_DUPLICATE_OR_MISSING_KEY_SEVERITY = ERROR;
const NO_LEAKED_CONDITIONAL_RENDERING_SEVERITY = ERROR;
const NO_MISSING_COMPONENT_OR_CONTEXT_DISPLAY_NAME_SEVERITY = WARNING;
const NO_NESTED_COMPONENT_DEFINITIONS_SEVERITY = ERROR;
const NO_REDUNDANT_SHOULD_COMPONENT_UPDATE_SEVERITY = ERROR;
const NO_SET_STATE_IN_COMPONENT_DID_MOUNT_SEVERITY = WARNING;
const NO_SET_STATE_IN_COMPONENT_DID_UPDATE_SEVERITY = WARNING;
const NO_SET_STATE_IN_COMPONENT_WILL_UPDATE_SEVERITY = WARNING;
const NO_STRING_REFS_SEVERITY = ERROR;
const NO_UNSTABLE_CONTEXT_VALUE_SEVERITY = WARNING;
const NO_UNSTABLE_DEFAULT_PROPS_SEVERITY = WARNING;
const NO_UNUSED_CLASS_COMPONENT_MEMBERS_SEVERITY = WARNING;
const NO_UNUSED_STATE_SEVERITY = WARNING;
const NO_USELESS_FORWARD_REF_SEVERITY = ERROR;
const NO_USELESS_FRAGMENT_SEVERITY = WARNING;
const PREFER_DESTRUCTURING_ASSIGNMENT_SEVERITY = OFF;
const PREFER_READ_ONLY_PROPS_SEVERITY = OFF;
const COMPONENT_NAME_SEVERITY = WARNING;
const FILENAME_EXTENSION_SEVERITY = WARNING;
const USE_STATE_SEVERITY = ERROR;

const REMIX_PACKAGES: readonly string[] = ['react', 'node', 'serve', 'dev'].map(
  (packageName) => `@remix-run/${packageName}`,
);
const REACT_ROUTER_PACKAGES: readonly string[] = ['react', 'node', 'serve', 'dev'].map(
  (packageName) => `@react-router/${packageName}`,
);

const REMIX_AND_REACT_ROUTER_EXPORTS: readonly string[] = [
  'action',
  'headers',
  'links',
  'loader',
  'meta',
];
const NEXT_EXPORTS: readonly string[] = [
  'config', // https://nextjs.org/docs/pages/building-your-application/routing/api-routes#custom-config
  'dynamic', // https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic
  'dynamicParams', // https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamicparams
  'experimental_ppr', // https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#experimental_ppr
  'fetchCache', // https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#fetchcache
  'generateMetadata', // https://nextjs.org/docs/app/api-reference/functions/generate-metadata
  'generateImageMetadata', // https://nextjs.org/docs/app/api-reference/functions/generate-image-metadata
  'generateSitemaps', // https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps
  'generateStaticParams', // https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#generatestaticparams
  'generateViewport', // https://nextjs.org/docs/app/api-reference/functions/generate-viewport#generateviewport-function
  'maxDuration', // https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#maxduration
  'metadata', // https://nextjs.org/docs/app/building-your-application/optimizing/metadata
  'preferredRegion', // https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#preferredregion
  'revalidate', // https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
  'runtime', // https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#runtime
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
] satisfies RuleNamesForPlugin<'react'>[]);

const REACT_X_TYPE_AWARE_RULES = new Set<string>([
  'no-leaked-conditional-rendering',
  'no-unused-props',
  'prefer-read-only-props',
] satisfies RuleNamesForPlugin<'@eslint-react'>[]);

const REACT_X_HOOKS_RULES = new Set<string>([
  'no-unnecessary-use-callback',
  'no-unnecessary-use-memo',
  'no-unnecessary-use-prefix',
  'prefer-use-state-lazy-initialization',
] satisfies RuleNamesForPlugin<'@eslint-react'>[]);

const DEFAULT_FILES = [GLOB_JS_TS_X];

export default (async (context, optionsRaw, {tsFilesTypeAware, tsIgnoresTypeAware}) => {
  const reactPackageInfo = context.packagesInfo.react;

  const optionsResolved = assignDefaults(optionsRaw, {
    configAllowDefaultExportsInJsxFiles: true,
    configHooks: true,
    configReactX: true,
    configDom: await doesPackageExist('react-dom'),
    configRefresh: true,
    configYouMightNotNeedAnEffect: true,
    pluginX: 'prefer',
    shorthandBoolean: 'prefer',
    shorthandFragment: 'prefer',
    reactVersion: reactPackageInfo?.versions.major ?? LATEST_REACT_VERSION,
  } satisfies ReactEslintConfigOptions);

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
    A extends RuleNamesForPlugin<'@eslint-react/dom'>,
    B extends RuleNamesForPlugin<'react'> = A & RuleNamesForPlugin<'react'>,
  >(
    nameXUnprefixed: A,
    nameOriginal?: B,
  ) => {
    const prefix = isReactXPreferred ? '@eslint-react/dom' : 'react';
    const name = isReactXPreferred ? nameXUnprefixed : (nameOriginal ?? nameXUnprefixed);
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

  const configBuilderSetup = context.createConfigBuilder({}, '', false);
  configBuilderSetup?.addConfig('react/setup', {
    settings: {
      ...(isReactEnabled && {
        react: {
          version: reactFullVersion,
          ...pluginSettings,
        } satisfies EslintPluginReactSettings,
      }),
      ...(isReactXEnabled && {
        'react-x': {
          version: reactFullVersion,
          ...configReactXOptions.settings,
        } satisfies EslintPluginReactXSettings,
      }),
    },
    // Copied from https://github.com/jsx-eslint/eslint-plugin-react/blob/e6b5b41191690ee166d0cca1e9db27092b910f03/index.js#L86
    ...(isReactEnabled &&
      newJsxTransform && {
        languageOptions: {
          parserOptions: {
            jsxPragma: null, // for @typescript/eslint-parser
          },
        },
      }),
  });

  const configBuilderReactOriginal = context.createConfigBuilder(optionsResolved, 'react');

  const noUnsafeClassComponentMethodsSeverity = isMinVersion17 ? WARNING : OFF;
  const booleanShorthandSeverity =
    shorthandBoolean === 'prefer-error' || shorthandBoolean === 'avoid-error'
      ? ERROR
      : shorthandBoolean === 'prefer' || shorthandBoolean === 'avoid'
        ? WARNING
        : OFF;
  const fragmentShorthandSeverity =
    shorthandBoolean === 'prefer-error' || shorthandFragment === 'avoid-error'
      ? ERROR
      : shorthandFragment === 'prefer' || shorthandFragment === 'avoid'
        ? WARNING
        : OFF;

  // Legend:
  // 🟢 - in recommended
  // 🟠 - rule from `eslint-config-prettier`
  // Check rule usage: https://github.com/search?q=path%3A%2F.*eslint%5B%5E%5C%2F%5D*%24%2F+%22react%2Fboolean-prop-naming%22&type=code

  configBuilderReactOriginal
    ?.addConfig([
      'react/plugin-original',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: DEFAULT_FILES,
      },
    ])
    .addRule('boolean-prop-naming', OFF) /** @since 7.2.0 */
    .addRule('default-props-match-prop-types', ERROR) /** @since 7.1.0 */
    .addRule(
      'destructuring-assignment',
      getDoubleRuleSeverity(PREFER_DESTRUCTURING_ASSIGNMENT_SEVERITY, false),
    ) /** @since 7.5.0 */
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
    .addRule(
      'forward-ref-uses-ref',
      getDoubleRuleSeverity(NO_USELESS_FORWARD_REF_SEVERITY, false),
    ) /** @since 7.36.0 */
    .addRule('function-component-definition', ERROR, [
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ]) /** @since 7.18.0 */
    .addRule('hook-use-state', getDoubleRuleSeverity(USE_STATE_SEVERITY, false), [
      {allowDestructuredState: true},
    ]) /** @since 7.29.0 */
    .addRule('jsx-boolean-value', getDoubleRuleSeverity(booleanShorthandSeverity, false), [
      shorthandBoolean === 'prefer-error' || shorthandBoolean === 'prefer' ? 'never' : 'always',
    ]) /** @since 2.1.0 */
    .addRule('jsx-child-element-spacing', OFF) /** @since 7.6.0 */ // 🟠
    .addRule('jsx-closing-bracket-location', OFF) /** @since 3.3.0 */ // 🟠
    .addRule('jsx-closing-tag-location', OFF) /** @since 7.1.0 */ // 🟠
    .addRule('jsx-curly-brace-presence', WARNING, [
      {props: 'never', children: 'never', propElementValues: 'always'},
    ]) /** @since 7.4.0-rc.0 */
    .addRule('jsx-curly-newline', OFF) /** @since 7.14.0 */ // 🟠
    .addRule('jsx-curly-spacing', OFF) /** @since 2.7.0 */ // 🟠
    .addRule('jsx-equals-spacing', OFF) /** @since 3.16.0 */ // 🟠
    .addRule('jsx-filename-extension', getDoubleRuleSeverity(FILENAME_EXTENSION_SEVERITY, false), [
      {
        extensions: JSX_FILE_EXTENSIONS,
        ignoreFilesWithoutCode: true,
      },
    ]) /** @since 5.2.0 */
    .addRule('jsx-first-prop-new-line', OFF) /** @since 5.0.0 */ // 🟠
    .addRule('jsx-fragments', getDoubleRuleSeverity(fragmentShorthandSeverity, false), [
      shorthandFragment === 'prefer-error' || shorthandFragment === 'prefer' ? 'syntax' : 'element',
    ]) /** @since 7.12.0 */
    .addRule('jsx-handler-names', OFF) /** @since 3.11.0 */
    .addRule('jsx-indent', OFF) /** @since 3.14.0 */ // 🟠
    .addRule('jsx-indent-props', OFF) /** @since 3.3.0 */ // 🟠
    .addRule('jsx-key', getDoubleRuleSeverity(NO_DUPLICATE_OR_MISSING_KEY_SEVERITY, true), [
      {
        checkFragmentShorthand: true,
        checkKeyMustBeforeSpread: true,
        warnOnDuplicates: true,
      },
    ]) /** @since 3.9.0 */ // 🟢
    .addRule('jsx-max-depth', OFF) /** @since 7.7.0 */
    .addRule('jsx-max-props-per-line', OFF) /** @since 3.2.0 */ // 🟠
    .addRule('jsx-newline', OFF) /** @since 7.22.0 */ // 🟠
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
    .addRule(
      'jsx-no-duplicate-props',
      getDoubleRuleSeverity(JSX_NO_DUPLICATE_PROPS_SEVERITY, false),
    ) /** @since 3.0.0 */ // 🟢
    // 🤔 Has many issues like https://github.com/jsx-eslint/eslint-plugin-react/issues/3292
    .addRule(
      'jsx-no-leaked-render',
      isReactXEnabled && !isConfigXDisabled
        ? OFF
        : getDoubleRuleSeverity(NO_LEAKED_CONDITIONAL_RENDERING_SEVERITY, false),
    ) /** @since 7.30.0 */
    // 🤔 From my understanding a rather niche rule, mostly useful in i18n apps
    .addRule('jsx-no-literals', OFF) /** @since 3.2.0 */
    .addRule(
      'jsx-no-undef',
      getDoubleRuleSeverity(JSX_NO_UNDEF_SEVERITY, false),
    ) /** @since 1.6.0 */ // 🟢
    .addRule(
      'jsx-no-useless-fragment',
      getDoubleRuleSeverity(NO_USELESS_FRAGMENT_SEVERITY, false),
      [{allowExpressions: true}],
    ) /** @since 7.15.0 */
    .addRule('jsx-one-expression-per-line', OFF) /** @since 7.5.0 */ // 🟠
    .addRule('jsx-pascal-case', getDoubleRuleSeverity(COMPONENT_NAME_SEVERITY, false), [
      {allowNamespace: true},
    ]) /** @since 3.10.0 */
    .addRule('jsx-props-no-multi-spaces', OFF) /** @since 7.9.0 */ // 🟠
    .addRule('jsx-props-no-spread-multi', ERROR) /** @since 7.35.0 */
    .addRule('jsx-props-no-spreading', ERROR, [
      {custom: 'ignore' /* Only enforced on HTML elements */},
    ]) /** @since 7.13.0 */
    .addRule('jsx-sort-props', OFF) /** @since 2.0.0 */
    .addRule('jsx-tag-spacing', OFF) /** @since 6.7.0 */ // 🟠
    .addRule(
      'jsx-uses-react',
      newJsxTransform ? OFF : getDoubleRuleSeverity(JSX_USES_REACT_SEVERITY, false),
    ) /** @since 1.4.0 */ // 🟢
    .addRule(
      'jsx-uses-vars',
      getDoubleRuleSeverity(JSX_USES_VARS_SEVERITY, false),
    ) /** @since 1.5.0 */ // 🟢
    .addRule('jsx-wrap-multilines', OFF) /** @since 1.1.0 */ /** @aka wrap-multilines */ // 🟠
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
    .addRule(
      'no-redundant-should-component-update',
      getDoubleRuleSeverity(NO_REDUNDANT_SHOULD_COMPONENT_UPDATE_SEVERITY, false),
    ) /** @since 7.1.0 */
    .addRule('no-set-state', OFF) /** @since 3.3.0 */
    .addRule('no-string-refs', getDoubleRuleSeverity(NO_STRING_REFS_SEVERITY, false), [
      {noTemplateLiterals: true},
    ]) /** @since 3.13.0 */ // 🟢
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
    .addRule(
      'prefer-read-only-props',
      getDoubleRuleSeverity(PREFER_READ_ONLY_PROPS_SEVERITY, false),
    ) /** @since 7.13.0 */
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
        includeDefaultFilesAndIgnores: true,
        filesFallback: [GLOB_JS_TS_X_ONLY],
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
    ?.addConfig(
      [
        'react/hooks',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: parentConfigFiles || DEFAULT_FILES,
          ignoresFallback: parentConfigIgnores,
        },
      ],
      {
        ...(configHooksOptions.settings && {
          settings: {
            'react-hooks': configHooksOptions.settings,
          },
        }),
      },
    )
    // Severity of react compiler rules correspond to the recommended ones from https://github.com/facebook/react/blob/614a945d9d1031fadcf211a632cb2d7fda495a4f/compiler/packages/babel-plugin-react-compiler/src/CompilerError.ts#L715
    .addRule('automatic-effect-dependencies', reactCompilerRulesSeverity) /** @since 6.1.0 */
    .addRule('capitalized-calls', reactCompilerRulesSeverity) /** @since 6.1.0 */
    .addRule('component-hook-factories', reactCompilerRulesSeverity) /** @since 6.1.0 */ // 🟢
    .addRule('config', reactCompilerRulesSeverity) /** @since 6.1.0 */ // 🟢
    .addRule('error-boundaries', reactCompilerRulesSeverity) /** @since 6.1.0 */ // 🟢
    .addRule('exhaustive-deps', ERROR) /** @since 1.1.0-rc.0 */ // 🟡
    .addRule('fbt', reactCompilerRulesSeverity) /** @since 6.1.0 */
    .addRule('fire', reactCompilerRulesSeverity) /** @since 6.1.0 */
    .addRule('gating', reactCompilerRulesSeverity) /** @since 6.1.0 */ // 🟢
    .addRule('globals', reactCompilerRulesSeverity) /** @since 6.1.0 */ // 🟢
    // Almost the same as `rules-of-hooks`, see https://github.com/facebook/react/blob/614a945d9d1031fadcf211a632cb2d7fda495a4f/compiler/packages/babel-plugin-react-compiler/src/CompilerError.ts#L840
    .addRule('hooks', OFF) /** @since 6.1.0 */
    .addRule('immutability', reactCompilerRulesSeverity) /** @since 6.1.0 */ // 🟢
    .addRule('incompatible-library', reactCompilerRulesSeverity) /** @since 6.1.0 */ // 🟡
    .addRule('invariant', reactCompilerRulesSeverity) /** @since 6.1.0 */
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
    .addAnyRule(
      '@eslint-react/hooks-extra',
      'no-direct-set-state-in-use-effect',
      getXRuleSeverity(WARNING),
    ) /** @since 1.5.26 */ /** @aka no-direct-set-state-in-use-layout-effect (until 2.0.0) */ // 🟡
    .addAnyRule(
      '@eslint-react',
      'no-unnecessary-use-callback',
      getXRuleSeverity(ERROR),
    ) /** @since 0.8.6-beta.6 */ /** @aka ensure-use-callback-has-non-empty-deps */
    .addAnyRule(
      '@eslint-react',
      'no-unnecessary-use-memo',
      getXRuleSeverity(ERROR),
    ) /** @since 0.8.6-beta.6 */ /** @aka ensure-use-memo-has-non-empty-deps */
    .addAnyRule(
      '@eslint-react',
      'no-unnecessary-use-prefix',
      getXRuleSeverity(OFF),
    ) /** @since 0.8.8-beta.0 */ /** @aka no-useless-custom-hooks */ /** @aka no-redundant-custom-hook */ /** @aka ensure-custom-hooks-using-other-hooks */ // 🟡
    .addAnyRule(
      '@eslint-react',
      'prefer-use-state-lazy-initialization',
      getXRuleSeverity(WARNING),
    ) /** @since 0.9.6 */ // 🟡
    .enableConfigTesterForPlugin('react-hooks')
    .addOverrides();

  const {
    noLegacyApis = {},
    configTypeAwareRules: configReactXTypeAwareRules = context.configsMeta.ts.enabled,
  } = configReactXOptions;

  const configBuilderReactX = context.createConfigBuilder(configReactX, '@eslint-react');

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
        includeDefaultFilesAndIgnores: true,
        filesFallback: parentConfigFiles || DEFAULT_FILES,
        ignoresFallback: parentConfigIgnores,
      },
    ])
    .markCategory('X')
    .addRule('jsx-dollar', WARNING) /** @since 2.3.0 */
    .addRule('jsx-key-before-spread', ERROR) /** @since 1.49.0 */ // 🟡
    .addRule(
      'jsx-no-comment-textnodes',
      getDoubleRuleSeverity(NO_COMMENT_TEXTNODES_SEVERITY, true),
    ) /** @since 0.7.0 */ /** @aka no-comment-textnodes */ // 🟡 🔄️`jsx-no-comment-textnodes`
    .addRule(
      'jsx-no-duplicate-props',
      getDoubleRuleSeverity(JSX_NO_DUPLICATE_PROPS_SEVERITY, true),
    ) /** @since 1.16.1 */ /** @aka no-duplicate-props */ // 🟡 🔄️
    .addRule('jsx-no-iife', OFF) /** @since 1.51.0 */
    .addRule(
      'jsx-no-undef',
      getDoubleRuleSeverity(JSX_NO_UNDEF_SEVERITY, true),
    ) /** @since 1.38.0 */ // 🔄️
    .addRule('jsx-shorthand-boolean', getDoubleRuleSeverity(booleanShorthandSeverity, true), [
      shorthandBoolean === 'prefer-error' || shorthandBoolean === 'prefer' ? 1 : -1,
    ]) /** @since 2.0.0 */ // 🔄️`jsx-boolean-value`
    .addRule('jsx-shorthand-fragment', getDoubleRuleSeverity(fragmentShorthandSeverity, true), [
      shorthandFragment === 'prefer-error' || shorthandFragment === 'prefer' ? 1 : -1,
    ]) /** @since 2.0.0 */ // 🔄️`jsx-fragments`
    // "This rule does nothing when using the New JSX Transform or if the `no-unused-vars` rule is not enabled."
    .addRule(
      'jsx-uses-react',
      getDoubleRuleSeverity(JSX_USES_REACT_SEVERITY, true),
    ) /** @since 1.40.0 */ // 🟡 🔄️
    // "This rule only has an effect when the `no-unused-vars` rule is enabled."
    .addRule(
      'jsx-uses-vars',
      getDoubleRuleSeverity(JSX_USES_VARS_SEVERITY, true),
    ) /** @since 1.16.1 */ /** @aka use-jsx-vars */ // 🟡 🔄️
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
    .addRule(
      'no-children-prop',
      getDoubleRuleSeverity(NO_CHILDREN_PROP_SEVERITY, true),
    ) /** @since 0.8.6 */ // 🔄️
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
    // `defaultProps` removed in v19 (will be silently ignored)
    .addRule('no-default-props', isMinVersion19 ? ERROR : WARNING) /** @since 1.5.29 */ // 🟢
    .addRule(
      'no-direct-mutation-state',
      getDoubleRuleSeverity(NO_DIRECT_MUTATION_STATE_SEVERITY, true),
    ) /** @since 0.9.3 */ // 🟢 🔄️
    .addRule(
      'no-duplicate-key',
      getDoubleRuleSeverity(NO_DUPLICATE_OR_MISSING_KEY_SEVERITY, true),
    ) /** @since 0.3.6 */ // 🟢 🔄️`jsx-key` (`warnOnDuplicates` option)
    // By default, this rule forbids snake_case props (props containing underscores)
    .addRule('no-forbidden-props', WARNING) /** @since 2.0.0 */ // 🟡
    // "In React 19, forwardRef is no longer necessary. Pass ref as a prop instead."
    .addRule('no-forward-ref', getSeverity(noLegacyApis.forwardRef)) /** @since 1.18.0 */ // 🟡 🔢19.0.0
    .addRule(
      'no-implicit-key',
      WARNING,
    ) /** @since 0.6.1 */ /** @aka no-spreading-key */ /** @aka no-spreading-key */ // 🟡
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
    // `propTypes` removed in v19 (will be silently ignored)
    .addRule('no-prop-types', isMinVersion19 ? ERROR : WARNING) /** @since 1.5.29 */ // 🟢
    .addRule(
      'no-redundant-should-component-update',
      getDoubleRuleSeverity(NO_REDUNDANT_SHOULD_COMPONENT_UPDATE_SEVERITY, true),
    ) /** @since 0.9.0 */ // 🟢 🔄️
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
      'no-string-refs',
      getDoubleRuleSeverity(NO_STRING_REFS_SEVERITY, true),
    ) /** @since 0.3.9 */ // 🟢 🔄️
    .addRule('no-unnecessary-key', ERROR) /** @since 20.0.0 */
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
    .addRule(
      'no-useless-forward-ref',
      getDoubleRuleSeverity(NO_USELESS_FORWARD_REF_SEVERITY, true),
    ) /** @since 1.33.0 */ /** @aka no-comment-textnodes */ // 🟡 🔄️`forward-ref-uses-ref`
    .addRule(
      'no-useless-fragment',
      getDoubleRuleSeverity(NO_USELESS_FRAGMENT_SEVERITY, true),
    ) /** @since 0.5.9 */ // 🔄️`jsx-no-useless-fragment`
    .addRule(
      'prefer-destructuring-assignment',
      getDoubleRuleSeverity(PREFER_DESTRUCTURING_ASSIGNMENT_SEVERITY, true),
    ) /** @since 0.5.5 */ // 🔄️`destructuring-assignment`
    // TODO why?
    .addRule(
      'prefer-namespace-import',
      OFF,
    ) /** @since 2.0.0 */ /** @aka prefer-react-namespace-import */
    .markCategory('Naming Convention')
    .addAnyRule(
      '@eslint-react/naming-convention',
      'component-name',
      getDoubleRuleSeverity(COMPONENT_NAME_SEVERITY, true),
    ) /** @since 0.7.0 */ // 🔄️`jsx-pascal-case`
    .addAnyRule('@eslint-react/naming-convention', 'context-name', WARNING) /** @since 1.29.0 */ // 🟡
    .addAnyRule('@eslint-react/naming-convention', 'filename', OFF) /** @since 0.3.0 */
    .addAnyRule(
      '@eslint-react/naming-convention',
      'filename-extension',
      getDoubleRuleSeverity(FILENAME_EXTENSION_SEVERITY, true),
      [{allow: 'always', extensions: JSX_FILE_EXTENSIONS}],
    ) /** @since 0.3.0 */ // 🔄️`jsx-filename-extension`
    .addAnyRule(
      '@eslint-react/naming-convention',
      'use-state',
      getDoubleRuleSeverity(USE_STATE_SEVERITY, true),
    ) /** @since 0.9.3 */ // 🔄️`hook-use-state`
    .markCategory('Debug')
    .addAnyRule('@eslint-react/debug', 'class-component', OFF) /** @since 0.3.3 */
    .addAnyRule('@eslint-react/debug', 'function-component', OFF) /** @since 0.3.0 */
    .addAnyRule('@eslint-react/debug', 'hook', OFF) /** @since 1.13.0 */
    .addAnyRule('@eslint-react/debug', 'is-from-react', OFF) /** @since 1.10.0 */
    .addAnyRule('@eslint-react/debug', 'jsx', OFF) /** @since 1.41.0 */
    .enableConfigTesterForPlugin('@eslint-react', {
      rulesToSkipInConfig: (ruleName) =>
        REACT_X_TYPE_AWARE_RULES.has(ruleName) || REACT_X_HOOKS_RULES.has(ruleName),
    })
    .addOverrides();

  const configBuilderReactXTypeAware = context.createConfigBuilder(
    tsFilesTypeAware.length === 0 ? false : configReactXTypeAwareRules,
    '@eslint-react',
  );
  configBuilderReactXTypeAware
    ?.addConfig([
      'react/x/rules-type-aware',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: tsFilesTypeAware,
        ignoresFallback: tsIgnoresTypeAware,
      },
    ])
    .addRule(
      'no-leaked-conditional-rendering',
      getDoubleRuleSeverity(NO_LEAKED_CONDITIONAL_RENDERING_SEVERITY, true),
    ) /** @since 0.3.0 */ // 🟡 🔄️`jsx-no-leaked-render` (worse) 💭
    .addRule('no-unused-props', WARNING) /** @since 2.0.0 */ // 💭
    .addRule(
      'prefer-read-only-props',
      getDoubleRuleSeverity(PREFER_READ_ONLY_PROPS_SEVERITY, true),
    ) /** @since 1.5.22 */ // 🔄️ 💭
    .enableConfigTesterForPlugin('@eslint-react', {
      rulesToSkipInConfig: (ruleName) => !REACT_X_TYPE_AWARE_RULES.has(ruleName),
    })
    .addOverrides();

  const configBuilderDom = context.createConfigBuilder(configDom, null);
  configBuilderDom
    ?.addConfig([
      'react/dom',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: parentConfigFiles || DEFAULT_FILES,
        ignoresFallback: parentConfigIgnores,
      },
    ])
    .addAnyRule(
      ...getDoubleRuleName('no-dangerously-set-innerhtml', 'no-danger'),
      getDoubleRuleSeverity(ERROR),
    ) /** @since 0.3.0 */ /** @since 2.7.0 */ // 🟡 🔄️`no-danger`
    .addAnyRule(
      ...getDoubleRuleName('no-dangerously-set-innerhtml-with-children', 'no-danger-with-children'),
      getDoubleRuleSeverity(ERROR),
    ) /** @since 0.3.0 */ /** @since 6.1.0 */ // 🟢 🔄️`no-danger-with-children`
    // Deprecated API, removed in v19
    .addAnyRule(
      ...getDoubleRuleName('no-find-dom-node'),
      getDoubleRuleSeverity(ERROR),
    ) /** @since 0.8.11 */ /** @since 6.0.0-alpha.2 */ // 🟢 🔄️
    .addAnyRule('@eslint-react/dom', 'no-flush-sync', getXRuleSeverity(ERROR)) /** @since 1.28.0 */ // 🟢
    // Deprecated API, removed in v19
    .addAnyRule('@eslint-react/dom', 'no-hydrate', getXRuleSeverity(ERROR)) /** @since 1.35.0 */ // 🟢 🔢18.0.0
    .addAnyRule(
      ...getDoubleRuleName('no-missing-button-type', 'button-has-type'),
      getDoubleRuleSeverity(ERROR),
    ) /** @since 0.6.1 */ /** @since 7.5.0 */ // 🟡 🔄️`button-has-type`
    .addAnyRule(
      ...getDoubleRuleName('no-missing-iframe-sandbox', 'iframe-missing-sandbox'),
      getDoubleRuleSeverity(ERROR),
    ) /** @since 0.6.1 */ /** @since 7.29.0 */ // 🟡 🔄️`iframe-missing-sandbox`
    .addAnyRule(
      ...getDoubleRuleName('no-namespace'),
      getDoubleRuleSeverity(ERROR),
    ) /** @since 0.5.5 */ /** @since 7.26.0 */ // 🟢 🔄️
    // Deprecated API, removed in v19
    .addAnyRule('@eslint-react/dom', 'no-render', getXRuleSeverity(ERROR)) /** @since 1.35.0 */ // 🟢 🔢18.0.0
    .addAnyRule(
      ...getDoubleRuleName('no-render-return-value'),
      getDoubleRuleSeverity(ERROR),
    ) /** @since 0.8.12 */ /** @since 5.2.0 */ // 🟢 🔄️
    .addAnyRule(
      ...getDoubleRuleName('no-script-url', 'jsx-no-script-url'),
      getDoubleRuleSeverity(ERROR),
    ) /** @since 0.3.8 */ /** @since 7.18.0 */ // 🟡 🔄️`jsx-no-script-url`
    .addAnyRule(...getDoubleRuleName('no-unknown-property'), getDoubleRuleSeverity(ERROR), [
      {requireDataLowercase: true},
    ]) /** @since 1.16.1 */ /** @since 2.0.0 */ // 🔄️
    .addAnyRule(
      ...getDoubleRuleName('no-unsafe-iframe-sandbox', 'iframe-missing-sandbox'),
      getDoubleRuleSeverity(ERROR),
    ) /** @since 0.6.1 */ /** @since 7.29.0 */ // 🟡 🔄️`iframe-missing-sandbox`
    .addAnyRule(
      ...getDoubleRuleName('no-unsafe-target-blank', 'jsx-no-target-blank'),
      getDoubleRuleSeverity(ERROR),
    ) /** @since 0.6.2 */ /** @since 5.1.0 */ // 🟡 🔄️`jsx-no-target-blank`
    // React 19 docs: "In earlier React Canary versions, this API was part of React DOM and called useFormState."
    .addAnyRule(
      '@eslint-react/dom',
      'no-use-form-state',
      getXRuleSeverity(ERROR),
    ) /** @since 1.35.0 */ // 🟢 🔢19.0.0
    .addAnyRule(
      ...getDoubleRuleName('no-string-style-prop', 'style-prop-object'),
      getDoubleRuleSeverity(OFF),
    ) /** @since 20.0.0 */ /** @since 6.2.0 */ // 🟢 🔄️`style-prop-object`
    .addAnyRule(
      ...getDoubleRuleName('no-void-elements-with-children', 'void-dom-elements-no-children'),
      getDoubleRuleSeverity(ERROR),
    ) /** @since 1.22.0 */ /** @aka no-children-in-void-dom-elements */ /** @since 6.10.0 */ // 🟢 🔄️`void-dom-elements-no-children`
    // TODO why?
    .addAnyRule('@eslint-react/dom', 'prefer-namespace-import', OFF) /** @since 2.0.0 */
    .markCategory('Web API')
    .addAnyRule(
      '@eslint-react/web-api',
      'no-leaked-event-listener',
      getXRuleSeverity(ERROR),
    ) /** @since 1.11.0 */ // 🟡
    .addAnyRule(
      '@eslint-react/web-api',
      'no-leaked-interval',
      getXRuleSeverity(ERROR),
    ) /** @since 1.11.0 */ // 🟡
    .addAnyRule(
      '@eslint-react/web-api',
      'no-leaked-resize-observer',
      getXRuleSeverity(ERROR),
    ) /** @since 1.13.0 */ // 🟡
    .addAnyRule(
      '@eslint-react/web-api',
      'no-leaked-timeout',
      getXRuleSeverity(ERROR),
    ) /** @since 1.11.0 */ // 🟡
    .markCategory('DOM (eslint-plugin-react)')
    .addAnyRule('react', 'checked-requires-onchange-or-readonly', ERROR, [
      {ignoreMissingProperties: true},
    ]) /** @since 7.34.0 */
    .addAnyRule('react', 'forbid-dom-props', OFF) /** @since 7.6.0 */
    .addAnyRule('react', 'no-invalid-html-attribute', ERROR) /** @since 7.27.0 */
    .addAnyRule('react', 'no-is-mounted', ERROR) /** @since 3.12.0 */ // 🟢
    .addOverrides();

  const isRemixOrReactRouterInstalled = (
    await Promise.all(
      [...REMIX_PACKAGES, ...REACT_ROUTER_PACKAGES].map((module) => doesPackageExist(module)),
    )
  ).some(Boolean);

  const configBuilderRefresh = context.createConfigBuilder(configRefresh, 'react-refresh');
  const configReactRefreshOptions = typeof configRefresh === 'object' ? configRefresh : {};
  configBuilderRefresh
    ?.addConfig([
      'react/refresh',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: [GLOB_JS_TS_X_ONLY],
      },
    ])
    .addRule('only-export-components', ERROR, [
      {
        allowExportNames: [
          ...(isRemixOrReactRouterInstalled ? REMIX_AND_REACT_ROUTER_EXPORTS : []),
          ...(context.packagesInfo.next ? NEXT_EXPORTS : []),
          ...(configReactRefreshOptions.allowExportNames || []),
        ],
        allowConstantExport: await doesPackageExist('vite'),
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
        includeDefaultFilesAndIgnores: true,
        filesFallback: parentConfigFiles || DEFAULT_FILES,
        ignoresFallback: parentConfigIgnores,
      },
    ])
    .addRule('no-adjust-state-on-prop-change', ERROR) /** @since 0.5.0 */ // 🟡 (renamed, original rules added in 0.4.5)
    .addRule('no-chain-state-updates', ERROR) /** @since 0.3.0 */ // 🟡
    .addRule('no-derived-state', ERROR) /** @since 0.3.0 */ // 🟡
    .addRule('no-empty-effect', ERROR) /** @since 0.3.0 */ // 🟡
    .addRule('no-event-handler', ERROR) /** @since 0.3.0 */ // 🟡
    .addRule('no-initialize-state', ERROR) /** @since 0.3.0 */ // 🟡
    .addRule('no-manage-parent', ERROR) /** @since 0.3.1 */ // 🟡
    .addRule('no-pass-data-to-parent', ERROR) /** @since 0.4.0 */ // 🟡
    .addRule('no-pass-live-state-to-parent', ERROR) /** @since 0.3.0 */ // 🟡
    .addRule('no-pass-ref-to-parent', OFF) /** @since 0.7.0 */ // 🟡
    .addRule('no-reset-all-state-on-prop-change', ERROR) /** @since 0.5.0 */ // 🟡 (renamed, original rules added in 0.3.0)
    .enableConfigTesterForPlugin('react-you-might-not-need-an-effect')
    .addOverrides();

  return {
    configs: [
      configBuilderSetup,
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
}) satisfies UnConfigFn<
  'react',
  {
    tsFilesTypeAware: string[];
    tsIgnoresTypeAware: string[];
  }
> as UnConfigFn<
  'react',
  {
    tsFilesTypeAware: string[];
    tsIgnoresTypeAware: string[];
  }
>;

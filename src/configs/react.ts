import {
  ERROR,
  GLOB_JS_TS_X,
  GLOB_JS_TS_X_ONLY,
  OFF,
  type RuleSeverity,
  WARNING,
} from '../constants';
import {
  type GetRuleOptions,
  type RuleNamesForPlugin,
  type RulesRecordPartial,
  type UnConfigOptions,
  createConfigBuilder,
} from '../eslint';
import type {DistributedPick, PrettifyShallow} from '../types';
import {assignDefaults, doesPackageExist} from '../utils';
import {noRestrictedHtmlElementsDefault} from './shared';
import type {UnConfigFn} from './index';

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

export interface ReactEslintConfigOptions extends UnConfigOptions<'react'> {
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
  configReactX?:
    | boolean
    | UnConfigOptions<
        Omit<RulesRecordPartial<'@eslint-react'>, `@eslint-react/${ReactXTypeAwareRules}`>,
        {
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
                Pick<RulesRecordPartial<'@eslint-react'>, `@eslint-react/${ReactXTypeAwareRules}`>
              >;
        }
      >;

  /**
   * Enables or specifies the configuration for the [`eslint-plugin-react-hooks`](https://npmjs.com/eslint-plugin-react-hooks) plugin, as well as ["Hooks Extra" rules from `@eslint-react/eslint-plugin`](https://eslint-react.xyz/docs/rules/overview#hooks-extra-rules)
   * (unless `pluginX` option is set to `never` on `react` config).
   *
   * By default will use the same `files` and `ignores` as the parent config.
   * @default true
   */
  configHooks?:
    | boolean
    | (UnConfigOptions<'react-hooks' | '@eslint-react/hooks-extra'> & {
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
      });

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
  configRefresh?:
    | boolean
    | UnConfigOptions<
        'react-refresh',
        {
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
          options?: PrettifyShallow<
            Omit<
              GetRuleOptions<'react-refresh', 'only-export-components'>[0] & {},
              'allowExportNames'
            >
          >;
        }
      >;

  /**
   * By default, default exports will be allowed in all JSX files
   * @default true
   */
  configAllowDefaultExportsInJsxFiles?:
    | boolean
    | UnConfigOptions<DistributedPick<RulesRecordPartial, 'import/no-default-export'>>;

  /**
   * Enables or specifies the configuration for the [`eslint-plugin-react-you-might-not-need-an-effect?activeTab=readme`](https://npmjs.com/eslint-plugin-react-you-might-not-need-an-effect?activeTab=readme) plugin.
   *
   * By default will use the same `files` and `ignores` as the parent config.
   * @default true
   */
  configYouMightNotNeedAnEffect?: boolean | UnConfigOptions<'react-you-might-not-need-an-effect'>;

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

export const reactUnConfig: UnConfigFn<
  'react',
  unknown,
  [
    {
      tsFilesTypeAware: string[];
      tsIgnoresTypeAware: string[];
    },
  ]
> = async (context, {tsFilesTypeAware, tsIgnoresTypeAware}) => {
  const reactPackageInfo = context.packagesInfo.react;

  const optionsRaw = context.rootOptions.configs?.react;
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

  const configBuilderSetup = createConfigBuilder(context, {}, '', false);
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

  const configBuilderReactOriginal = createConfigBuilder(context, optionsResolved, 'react');

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
    .addRule('boolean-prop-naming', OFF)
    .addRule('default-props-match-prop-types', ERROR)
    .addRule(
      'destructuring-assignment',
      getDoubleRuleSeverity(PREFER_DESTRUCTURING_ASSIGNMENT_SEVERITY, false),
    )
    .addRule(
      'display-name',
      getDoubleRuleSeverity(NO_MISSING_COMPONENT_OR_CONTEXT_DISPLAY_NAME_SEVERITY, false),
    ) // 🟢
    .addRule('forbid-component-props', OFF)
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
    ])
    .addRule('forbid-foreign-prop-types', isMinVersion19 ? OFF : ERROR) // propTypes only rule
    .addRule('forbid-prop-types', OFF) // propTypes only rule
    .addRule('forward-ref-uses-ref', getDoubleRuleSeverity(NO_USELESS_FORWARD_REF_SEVERITY, false))
    .addRule('function-component-definition', ERROR, [
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ])
    .addRule('hook-use-state', getDoubleRuleSeverity(USE_STATE_SEVERITY, false), [
      {allowDestructuredState: true},
    ])
    .addRule('jsx-boolean-value', getDoubleRuleSeverity(booleanShorthandSeverity, false), [
      shorthandBoolean === 'prefer-error' || shorthandBoolean === 'prefer' ? 'never' : 'always',
    ])
    .addRule('jsx-child-element-spacing', OFF) // 🟠
    .addRule('jsx-closing-bracket-location', OFF) // 🟠
    .addRule('jsx-closing-tag-location', OFF) // 🟠
    .addRule('jsx-curly-brace-presence', WARNING, [
      {props: 'never', children: 'never', propElementValues: 'always'},
    ])
    .addRule('jsx-curly-newline', OFF) // 🟠
    .addRule('jsx-curly-spacing', OFF) // 🟠
    .addRule('jsx-equals-spacing', OFF) // 🟠
    .addRule('jsx-filename-extension', getDoubleRuleSeverity(FILENAME_EXTENSION_SEVERITY, false), [
      {
        extensions: JSX_FILE_EXTENSIONS,
        ignoreFilesWithoutCode: true,
      },
    ])
    .addRule('jsx-first-prop-new-line', OFF) // 🟠
    .addRule('jsx-fragments', getDoubleRuleSeverity(fragmentShorthandSeverity, false), [
      shorthandFragment === 'prefer-error' || shorthandFragment === 'prefer' ? 'syntax' : 'element',
    ])
    .addRule('jsx-handler-names', OFF)
    .addRule('jsx-indent', OFF) // 🟠
    .addRule('jsx-indent-props', OFF) // 🟠
    .addRule('jsx-key', getDoubleRuleSeverity(NO_DUPLICATE_OR_MISSING_KEY_SEVERITY, true), [
      {
        checkFragmentShorthand: true,
        checkKeyMustBeforeSpread: true,
        warnOnDuplicates: true,
      },
    ]) // 🟢
    .addRule('jsx-max-depth', OFF)
    .addRule('jsx-max-props-per-line', OFF) // 🟠
    .addRule('jsx-newline', OFF) // 🟠
    .addRule('jsx-no-bind', ERROR, [{allowArrowFunctions: true, ignoreRefs: true}])
    .addRule(
      'jsx-no-comment-textnodes',
      getDoubleRuleSeverity(NO_COMMENT_TEXTNODES_SEVERITY, false),
    ) // 🟢
    .addRule(
      'jsx-no-constructed-context-values',
      getDoubleRuleSeverity(NO_UNSTABLE_CONTEXT_VALUE_SEVERITY, false),
    )
    .addRule(
      'jsx-no-duplicate-props',
      getDoubleRuleSeverity(JSX_NO_DUPLICATE_PROPS_SEVERITY, false),
    ) // 🟢
    // 🤔 Has many issues like https://github.com/jsx-eslint/eslint-plugin-react/issues/3292
    .addRule(
      'jsx-no-leaked-render',
      isReactXEnabled && !isConfigXDisabled
        ? OFF
        : getDoubleRuleSeverity(NO_LEAKED_CONDITIONAL_RENDERING_SEVERITY, false),
    )
    // 🤔 From my understanding a rather niche rule, mostly useful in i18n apps
    .addRule('jsx-no-literals', OFF)
    .addRule('jsx-no-undef', getDoubleRuleSeverity(JSX_NO_UNDEF_SEVERITY, false)) // 🟢
    .addRule(
      'jsx-no-useless-fragment',
      getDoubleRuleSeverity(NO_USELESS_FRAGMENT_SEVERITY, false),
      [{allowExpressions: true}],
    )
    .addRule('jsx-one-expression-per-line', OFF) // 🟠
    .addRule('jsx-pascal-case', getDoubleRuleSeverity(COMPONENT_NAME_SEVERITY, false), [
      {allowNamespace: true},
    ])
    .addRule('jsx-props-no-multi-spaces', OFF) // 🟠
    .addRule('jsx-props-no-spread-multi', ERROR)
    .addRule('jsx-props-no-spreading', ERROR, [
      {custom: 'ignore' /* Only enforced on HTML elements */},
    ])
    .addRule('jsx-sort-props', OFF)
    .addRule('jsx-tag-spacing', OFF) // 🟠
    .addRule(
      'jsx-uses-react',
      newJsxTransform ? OFF : getDoubleRuleSeverity(JSX_USES_REACT_SEVERITY, false),
    ) // 🟢
    .addRule('jsx-uses-vars', getDoubleRuleSeverity(JSX_USES_VARS_SEVERITY, false)) // 🟢
    .addRule('jsx-wrap-multilines', OFF) // 🟠
    .addRule(
      'no-access-state-in-setstate',
      getDoubleRuleSeverity(NO_ACCESS_STATE_IN_SETSTATE_SEVERITY, false),
    )
    .addRule('no-adjacent-inline-elements', OFF)
    .addRule('no-array-index-key', getDoubleRuleSeverity(NO_ARRAY_INDEX_KEY_SEVERITY, false))
    .addRule('no-arrow-function-lifecycle', ERROR)
    .addRule('no-children-prop', getDoubleRuleSeverity(NO_CHILDREN_PROP_SEVERITY, false)) // 🟢
    // TODO
    .addRule('no-deprecated', ERROR) // 🟢
    .addRule(
      'no-did-mount-set-state',
      getDoubleRuleSeverity(NO_SET_STATE_IN_COMPONENT_DID_MOUNT_SEVERITY, false),
    )
    .addRule(
      'no-did-update-set-state',
      getDoubleRuleSeverity(NO_SET_STATE_IN_COMPONENT_DID_UPDATE_SEVERITY, false),
    )
    .addRule(
      'no-direct-mutation-state',
      getDoubleRuleSeverity(NO_DIRECT_MUTATION_STATE_SEVERITY, false),
    ) // 🟢
    .addRule('no-multi-comp', ERROR)
    .addRule(
      'no-object-type-as-default-prop',
      getDoubleRuleSeverity(NO_UNSTABLE_DEFAULT_PROPS_SEVERITY, false),
    )
    .addRule(
      'no-redundant-should-component-update',
      getDoubleRuleSeverity(NO_REDUNDANT_SHOULD_COMPONENT_UPDATE_SEVERITY, false),
    )
    .addRule('no-set-state', OFF)
    .addRule('no-string-refs', getDoubleRuleSeverity(NO_STRING_REFS_SEVERITY, false), [
      {noTemplateLiterals: true},
    ]) // 🟢
    .addRule('no-this-in-sfc', ERROR)
    .addRule('no-typos', ERROR)
    .addRule('no-unescaped-entities', OFF) // 🟢
    .addRule('no-unsafe', getDoubleRuleSeverity(noUnsafeClassComponentMethodsSeverity, false)) // 🟢(off)
    .addRule(
      'no-unstable-nested-components',
      getDoubleRuleSeverity(NO_NESTED_COMPONENT_DEFINITIONS_SEVERITY, false),
      [{allowAsProps: true}],
    )
    .addRule(
      'no-unused-class-component-methods',
      getDoubleRuleSeverity(NO_UNUSED_CLASS_COMPONENT_MEMBERS_SEVERITY, false),
    )
    .addRule('no-unused-prop-types', WARNING)
    .addRule('no-unused-state', getDoubleRuleSeverity(NO_UNUSED_STATE_SEVERITY, false))
    .addRule(
      'no-will-update-set-state',
      getDoubleRuleSeverity(NO_SET_STATE_IN_COMPONENT_WILL_UPDATE_SEVERITY, false),
    )
    .addRule('prefer-es6-class', ERROR)
    .addRule('prefer-exact-props', OFF) // propTypes only rule
    .addRule(
      'prefer-read-only-props',
      getDoubleRuleSeverity(PREFER_READ_ONLY_PROPS_SEVERITY, false),
    )
    .addRule('prefer-stateless-function', ERROR)
    .addRule('prop-types', ERROR) // 🟢
    .addRule('react-in-jsx-scope', newJsxTransform ? OFF : ERROR) // 🟢
    .addRule('require-default-props', OFF)
    .addRule('require-optimization', OFF)
    // TODO disable in ts?
    .addRule('require-render-return', ERROR) // 🟢
    .addRule('self-closing-comp', OFF)
    .addRule('sort-comp', ERROR)
    .addRule('sort-default-props', OFF) // propTypes only rule
    .addRule('sort-prop-types', OFF) // propTypes only rule
    .addRule('state-in-constructor', ERROR, ['never'])
    .addRule('static-property-placement', ERROR)
    .addRule('style-prop-object', OFF)
    .enableConfigTesterForPlugin('react', {
      rulesToSkipInConfig: (ruleName) => REACT_ORIGINAL_DOM_RULES.has(ruleName),
    })
    .addOverrides();

  const configBuilderAllowDefaultExportsInJsxFiles = createConfigBuilder(
    context,
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

  const configBuilderHooks = createConfigBuilder(context, configHooks, 'react-hooks');
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
    .addRule('exhaustive-deps', ERROR) // 🟡
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
    .addRule('rules-of-hooks', ERROR) // 🟢
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
    ) // 🟡
    .addAnyRule(
      '@eslint-react/hooks-extra',
      'no-direct-set-state-in-use-effect',
      getXRuleSeverity(WARNING),
    ) /** @since 2.0.0 */ /** @aka no-direct-set-state-in-use-layout-effect */
    .addAnyRule('@eslint-react', 'no-unnecessary-use-callback', getXRuleSeverity(ERROR))
    .addAnyRule('@eslint-react', 'no-unnecessary-use-memo', getXRuleSeverity(ERROR))
    .addAnyRule('@eslint-react', 'no-unnecessary-use-prefix', getXRuleSeverity(OFF)) // 🟡
    .addAnyRule('@eslint-react', 'prefer-use-state-lazy-initialization', getXRuleSeverity(WARNING)) // 🟡
    .enableConfigTesterForPlugin('react-hooks')
    .addOverrides();

  const {
    noLegacyApis = {},
    configTypeAwareRules: configReactXTypeAwareRules = context.configsMeta.ts.enabled,
  } = configReactXOptions;

  const configBuilderReactX = createConfigBuilder(context, configReactX, '@eslint-react');

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
    .addRule('jsx-key-before-spread', ERROR) // 🟡
    .addRule(
      'jsx-no-comment-textnodes',
      getDoubleRuleSeverity(NO_COMMENT_TEXTNODES_SEVERITY, true),
    ) /** @since 2.0.0 */ /** @aka no-comment-textnodes */ // 🟡 🔄️`jsx-no-comment-textnodes`
    .addRule('jsx-no-duplicate-props', getDoubleRuleSeverity(JSX_NO_DUPLICATE_PROPS_SEVERITY, true)) // 🟡 🔄️
    .addRule('jsx-no-iife', OFF) /** @since 1.51.0 */
    .addRule('jsx-no-undef', getDoubleRuleSeverity(JSX_NO_UNDEF_SEVERITY, true)) // 🔄️
    .addRule('jsx-shorthand-boolean', getDoubleRuleSeverity(booleanShorthandSeverity, true), [
      shorthandBoolean === 'prefer-error' || shorthandBoolean === 'prefer' ? 1 : -1,
    ]) /** @since 2.0.0 */ // 🔄️`jsx-boolean-value`
    .addRule('jsx-shorthand-fragment', getDoubleRuleSeverity(fragmentShorthandSeverity, true), [
      shorthandFragment === 'prefer-error' || shorthandFragment === 'prefer' ? 1 : -1,
    ]) /** @since 2.0.0 */ // 🔄️`jsx-fragments`
    // "This rule does nothing when using the New JSX Transform or if the `no-unused-vars` rule is not enabled."
    .addRule('jsx-uses-react', getDoubleRuleSeverity(JSX_USES_REACT_SEVERITY, true)) // 🟡 🔄️
    // "This rule only has an effect when the `no-unused-vars` rule is enabled."
    .addRule('jsx-uses-vars', getDoubleRuleSeverity(JSX_USES_VARS_SEVERITY, true)) // 🟡 🔄️
    .addRule(
      'no-access-state-in-setstate',
      getDoubleRuleSeverity(NO_ACCESS_STATE_IN_SETSTATE_SEVERITY, true),
    ) // 🟢 🔄️
    .addRule('no-array-index-key', getDoubleRuleSeverity(NO_ARRAY_INDEX_KEY_SEVERITY, true)) // 🟡 🔄️
    .addRule('no-children-count', getSeverity(noLegacyApis.Children)) // 🟡
    .addRule('no-children-for-each', getSeverity(noLegacyApis.Children)) // 🟡
    .addRule('no-children-map', getSeverity(noLegacyApis.Children)) // 🟡
    .addRule('no-children-only', getSeverity(noLegacyApis.Children)) // 🟡
    .addRule('no-children-prop', getDoubleRuleSeverity(NO_CHILDREN_PROP_SEVERITY, true)) // 🔄️
    .addRule('no-children-to-array', getSeverity(noLegacyApis.Children)) // 🟡
    .addRule('no-class-component', getSeverity(noLegacyApis.classComponent ?? 'warn'))
    .addRule('no-clone-element', getSeverity(noLegacyApis.cloneElement)) // 🟡
    .addRule('no-component-will-mount', getSeverity(noLegacyApis.componentWillMount)) // 🟢
    .addRule('no-component-will-receive-props', getSeverity(noLegacyApis.componentWillReceiveProps)) // 🟢
    .addRule('no-component-will-update', getSeverity(noLegacyApis.componentWillUpdate)) // 🟢
    .addRule('no-context-provider', ERROR) // 🟡 🔢19.0.0
    .addRule('no-create-ref', getSeverity(noLegacyApis.createRef)) // 🟢
    // `defaultProps` removed in v19 (will be silently ignored)
    .addRule('no-default-props', isMinVersion19 ? ERROR : WARNING) // 🟢
    .addRule(
      'no-direct-mutation-state',
      getDoubleRuleSeverity(NO_DIRECT_MUTATION_STATE_SEVERITY, true),
    ) // 🟢 🔄️
    .addRule('no-duplicate-key', getDoubleRuleSeverity(NO_DUPLICATE_OR_MISSING_KEY_SEVERITY, true)) // 🟢 🔄️`jsx-key` (`warnOnDuplicates` option)
    // By default, this rule forbids snake_case props (props containing underscores)
    .addRule('no-forbidden-props', WARNING) /** @since 2.0.0 */ // 🟡
    // "In React 19, forwardRef is no longer necessary. Pass ref as a prop instead."
    .addRule('no-forward-ref', getSeverity(noLegacyApis.forwardRef)) // 🟡 🔢19.0.0
    .addRule('no-implicit-key', WARNING) // 🟡
    .addRule(
      'no-missing-component-display-name',
      getDoubleRuleSeverity(NO_MISSING_COMPONENT_OR_CONTEXT_DISPLAY_NAME_SEVERITY, true),
    ) // 🔄️`display-name`
    .addRule(
      'no-missing-context-display-name',
      getDoubleRuleSeverity(NO_MISSING_COMPONENT_OR_CONTEXT_DISPLAY_NAME_SEVERITY, true),
    ) // 🔄️`display-name` (`checkContextObjects` option)
    .addRule('no-missing-key', getDoubleRuleSeverity(NO_DUPLICATE_OR_MISSING_KEY_SEVERITY, true)) // 🟢 🔄️`jsx-key`
    .addRule('no-misused-capture-owner-stack', ERROR)
    .addRule(
      'no-nested-component-definitions',
      getDoubleRuleSeverity(NO_NESTED_COMPONENT_DEFINITIONS_SEVERITY, true),
    ) // 🟢 🔄️`no-unstable-nested-components`
    .addRule('no-nested-lazy-component-declarations', ERROR) // 🟢
    // `propTypes` removed in v19 (will be silently ignored)
    .addRule('no-prop-types', isMinVersion19 ? ERROR : WARNING) // 🟢
    .addRule(
      'no-redundant-should-component-update',
      getDoubleRuleSeverity(NO_REDUNDANT_SHOULD_COMPONENT_UPDATE_SEVERITY, true),
    ) // 🟢 🔄️
    .addRule(
      'no-set-state-in-component-did-mount',
      getDoubleRuleSeverity(NO_SET_STATE_IN_COMPONENT_DID_MOUNT_SEVERITY, true),
    ) // 🟡 🔄️`no-did-mount-set-state`
    .addRule(
      'no-set-state-in-component-did-update',
      getDoubleRuleSeverity(NO_SET_STATE_IN_COMPONENT_DID_UPDATE_SEVERITY, true),
    ) // 🟡 🔄️`no-did-update-set-state`
    .addRule(
      'no-set-state-in-component-will-update',
      getDoubleRuleSeverity(NO_SET_STATE_IN_COMPONENT_WILL_UPDATE_SEVERITY, true),
    ) // 🟡 🔄️`no-will-update-set-state`
    .addRule('no-string-refs', getDoubleRuleSeverity(NO_STRING_REFS_SEVERITY, true)) // 🟢 🔄️
    .addRule('no-unnecessary-key', ERROR) /** @since 20.0.0 */
    .addRule(
      'no-unsafe-component-will-mount',
      getDoubleRuleSeverity(noUnsafeClassComponentMethodsSeverity, true),
    ) // 🟡 🔄️`no-unsafe`
    .addRule(
      'no-unsafe-component-will-receive-props',
      getDoubleRuleSeverity(noUnsafeClassComponentMethodsSeverity, true),
    ) // 🟡 🔄️`no-unsafe`
    .addRule(
      'no-unsafe-component-will-update',
      getDoubleRuleSeverity(noUnsafeClassComponentMethodsSeverity, true),
    ) // 🟡 🔄️`no-unsafe`
    .addRule(
      'no-unstable-context-value',
      getDoubleRuleSeverity(NO_UNSTABLE_CONTEXT_VALUE_SEVERITY, true),
    ) // 🟡 🔄️`jsx-no-constructed-context-values`
    .addRule(
      'no-unstable-default-props',
      getDoubleRuleSeverity(NO_UNSTABLE_DEFAULT_PROPS_SEVERITY, true),
    ) // 🟡 🔄️`no-object-type-as-default-prop`
    .addRule(
      'no-unused-class-component-members',
      getDoubleRuleSeverity(NO_UNUSED_CLASS_COMPONENT_MEMBERS_SEVERITY, true),
    ) // 🟡 🔄️`no-unused-class-component-methods`
    .addRule('no-unused-state', getDoubleRuleSeverity(NO_UNUSED_STATE_SEVERITY, true)) // 🟡 🔄️
    .addRule('no-use-context', WARNING) // 🟡 🔢19.0.0
    .addRule('no-useless-forward-ref', getDoubleRuleSeverity(NO_USELESS_FORWARD_REF_SEVERITY, true)) // 🟡 🔄️`forward-ref-uses-ref`
    .addRule('no-useless-fragment', getDoubleRuleSeverity(NO_USELESS_FRAGMENT_SEVERITY, true)) // 🔄️`jsx-no-useless-fragment`
    .addRule(
      'prefer-destructuring-assignment',
      getDoubleRuleSeverity(PREFER_DESTRUCTURING_ASSIGNMENT_SEVERITY, true),
    ) // 🔄️`destructuring-assignment`
    // TODO why?
    .addRule('prefer-namespace-import', OFF) /** @since 2.0.0 */ /** @aka prefer-namespace-import */
    .markCategory('Naming Convention')
    .addAnyRule(
      '@eslint-react/naming-convention',
      'component-name',
      getDoubleRuleSeverity(COMPONENT_NAME_SEVERITY, true),
    ) // 🔄️`jsx-pascal-case`
    .addAnyRule('@eslint-react/naming-convention', 'context-name', WARNING) // 🟡
    .addAnyRule('@eslint-react/naming-convention', 'filename', OFF)
    .addAnyRule(
      '@eslint-react/naming-convention',
      'filename-extension',
      getDoubleRuleSeverity(FILENAME_EXTENSION_SEVERITY, true),
      [{allow: 'always', extensions: JSX_FILE_EXTENSIONS}],
    ) // 🔄️`jsx-filename-extension`
    .addAnyRule(
      '@eslint-react/naming-convention',
      'use-state',
      getDoubleRuleSeverity(USE_STATE_SEVERITY, true),
    ) // 🔄️`hook-use-state`
    .markCategory('Debug')
    .addAnyRule('@eslint-react/debug', 'class-component', OFF)
    .addAnyRule('@eslint-react/debug', 'function-component', OFF)
    .addAnyRule('@eslint-react/debug', 'hook', OFF)
    .addAnyRule('@eslint-react/debug', 'is-from-react', OFF)
    .addAnyRule('@eslint-react/debug', 'jsx', OFF)
    .enableConfigTesterForPlugin('@eslint-react', {
      rulesToSkipInConfig: (ruleName) =>
        REACT_X_TYPE_AWARE_RULES.has(ruleName) || REACT_X_HOOKS_RULES.has(ruleName),
    })
    .addOverrides();

  const configBuilderReactXTypeAware = createConfigBuilder(
    context,
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
    ) // 🟡 🔄️`jsx-no-leaked-render` (worse) 💭
    .addRule('no-unused-props', WARNING) /** @since 20.0.0 */ // 💭
    .addRule('prefer-read-only-props', getDoubleRuleSeverity(PREFER_READ_ONLY_PROPS_SEVERITY, true)) // 🔄️ 💭
    .enableConfigTesterForPlugin('@eslint-react', {
      rulesToSkipInConfig: (ruleName) => !REACT_X_TYPE_AWARE_RULES.has(ruleName),
    })
    .addOverrides();

  const configBuilderDom = createConfigBuilder(context, configDom, null);
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
    ) // 🟡 🔄️`no-danger`
    .addAnyRule(
      ...getDoubleRuleName('no-dangerously-set-innerhtml-with-children', 'no-danger-with-children'),
      getDoubleRuleSeverity(ERROR),
    ) // 🟢 🔄️`no-danger-with-children`
    // Deprecated API, removed in v19
    .addAnyRule(...getDoubleRuleName('no-find-dom-node'), getDoubleRuleSeverity(ERROR)) // 🟢 🔄️
    .addAnyRule('@eslint-react/dom', 'no-flush-sync', getXRuleSeverity(ERROR)) // 🟢
    // Deprecated API, removed in v19
    .addAnyRule('@eslint-react/dom', 'no-hydrate', getXRuleSeverity(ERROR)) // 🟢 🔢18.0.0
    .addAnyRule(
      ...getDoubleRuleName('no-missing-button-type', 'button-has-type'),
      getDoubleRuleSeverity(ERROR),
    ) // 🟡 🔄️`button-has-type`
    .addAnyRule(
      ...getDoubleRuleName('no-missing-iframe-sandbox', 'iframe-missing-sandbox'),
      getDoubleRuleSeverity(ERROR),
    ) // 🟡 🔄️`iframe-missing-sandbox`
    .addAnyRule(...getDoubleRuleName('no-namespace'), getDoubleRuleSeverity(ERROR)) // 🟢 🔄️
    // Deprecated API, removed in v19
    .addAnyRule('@eslint-react/dom', 'no-render', getXRuleSeverity(ERROR)) // 🟢 🔢18.0.0
    .addAnyRule(...getDoubleRuleName('no-render-return-value'), getDoubleRuleSeverity(ERROR)) // 🟢 🔄️
    .addAnyRule(
      ...getDoubleRuleName('no-script-url', 'jsx-no-script-url'),
      getDoubleRuleSeverity(ERROR),
    ) // 🟡 🔄️`jsx-no-script-url`
    .addAnyRule(...getDoubleRuleName('no-unknown-property'), getDoubleRuleSeverity(ERROR), [
      {requireDataLowercase: true},
    ]) // 🔄️
    .addAnyRule(
      ...getDoubleRuleName('no-unsafe-iframe-sandbox', 'iframe-missing-sandbox'),
      getDoubleRuleSeverity(ERROR),
    ) // 🟡 🔄️`iframe-missing-sandbox`
    .addAnyRule(
      ...getDoubleRuleName('no-unsafe-target-blank', 'jsx-no-target-blank'),
      getDoubleRuleSeverity(ERROR),
    ) // 🟡 🔄️`jsx-no-target-blank`
    // React 19 docs: "In earlier React Canary versions, this API was part of React DOM and called useFormState."
    .addAnyRule('@eslint-react/dom', 'no-use-form-state', getXRuleSeverity(ERROR)) // 🟢 🔢19.0.0
    .addAnyRule(
      ...getDoubleRuleName('no-string-style-prop', 'style-prop-object'),
      getDoubleRuleSeverity(OFF),
    ) /** @since 20.0.0 */ // 🟢 🔄️`style-prop-object`
    .addAnyRule(
      ...getDoubleRuleName('no-void-elements-with-children', 'void-dom-elements-no-children'),
      getDoubleRuleSeverity(ERROR),
    ) // 🟢 🔄️`void-dom-elements-no-children`
    // TODO why?
    .addAnyRule('@eslint-react/dom', 'prefer-namespace-import', OFF) /** @since 2.0.0 */
    .markCategory('Web API')
    .addAnyRule('@eslint-react/web-api', 'no-leaked-event-listener', getXRuleSeverity(ERROR)) // 🟡
    .addAnyRule('@eslint-react/web-api', 'no-leaked-interval', getXRuleSeverity(ERROR)) // 🟡
    .addAnyRule('@eslint-react/web-api', 'no-leaked-resize-observer', getXRuleSeverity(ERROR)) // 🟡
    .addAnyRule('@eslint-react/web-api', 'no-leaked-timeout', getXRuleSeverity(ERROR)) // 🟡
    .markCategory('DOM (eslint-plugin-react)')
    .addAnyRule('react', 'checked-requires-onchange-or-readonly', ERROR, [
      {ignoreMissingProperties: true},
    ])
    .addAnyRule('react', 'forbid-dom-props', OFF)
    .addAnyRule('react', 'no-invalid-html-attribute', ERROR)
    .addAnyRule('react', 'no-is-mounted', ERROR) // 🟢
    .addOverrides();

  const isRemixOrReactRouterInstalled = (
    await Promise.all(
      [...REMIX_PACKAGES, ...REACT_ROUTER_PACKAGES].map((module) => doesPackageExist(module)),
    )
  ).some(Boolean);

  const configBuilderRefresh = createConfigBuilder(context, configRefresh, 'react-refresh');
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
    ])
    .enableConfigTesterForPlugin('react-refresh')
    .addOverrides();

  const configBuilderYouMightNotNeedAnEffect = createConfigBuilder(
    context,
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
};

import {getPackageInfoSync, isPackageExists} from 'local-pkg';
import {
  ERROR,
  GLOB_JS_TS_X,
  GLOB_JS_TS_X_ONLY,
  OFF,
  type RuleSeverity,
  WARNING,
} from '../constants';
import {
  type AllEslintRulesWithoutDisableAutofix,
  type AllRulesWithPrefix,
  type AllRulesWithPrefixUnprefixedNames,
  ConfigEntryBuilder,
  type ConfigSharedOptions,
  type DisableAutofixPrefix,
  type FlatConfigEntry,
} from '../eslint';
import {getPackageMajorVersion} from '../utils';
import {noRestrictedHtmlElementsDefault} from './vue';
import type {InternalConfigOptions} from './index';

// Copied from https://eslint-react.xyz/docs/configuration/configure-analyzer#properties
interface CustomReactComponent {
  name: string;
  as?: string;
  attributes?: {
    name: string;
    as?: string;
    defaultValue?: string;
  }[];
}

// Copied from https://eslint-react.xyz/docs/configuration/configure-analyzer#properties
type ReactBuiltInHookName =
  | 'use'
  | 'useActionState'
  | 'useCallback'
  | 'useContext'
  | 'useDebugValue'
  | 'useDeferredValue'
  | 'useEffect'
  | 'useFormStatus'
  | 'useId'
  | 'useImperativeHandle'
  | 'useInsertionEffect'
  | 'useLayoutEffect'
  | 'useMemo'
  | 'useOptimistic'
  | 'useReducer'
  | 'useRef'
  | 'useState'
  | 'useSyncExternalStore'
  | 'useTransition';

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
   * @see https://eslint-react.xyz/docs/configuration/configure-analyzer#skipimportcheck
   */
  skipImportCheck?: boolean;

  /**
   * @see https://eslint-react.xyz/docs/configuration/configure-analyzer#polymorphicpropname
   */
  polymorphicPropName?: string;

  /**
   * @see https://eslint-react.xyz/docs/configuration/configure-analyzer#additionalcomponents-experimental
   */
  additionalComponents?: CustomReactComponent[];

  /**
   * @see https://eslint-react.xyz/docs/configuration/configure-analyzer#additionalhooks-experimental
   */
  additionalHooks?: Record<ReactBuiltInHookName, string[]>;
}

type AllReactEslintRules = AllRulesWithPrefix<'react', true>;

type EslintPluginReactDomRules =
  | 'checked-requires-onchange-or-readonly'
  | 'forbid-dom-props'
  | 'no-invalid-html-attribute'
  | 'no-is-mounted';

export interface ReactEslintConfigOptions extends ConfigSharedOptions<'react'> {
  /**
   * [`eslint-plugin-react`](https://www.npmjs.com/package/eslint-plugin-react) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `react` property and applied to the specified `files` and `ignores`.
   *
   * Note that they will be merged with `{version: <detected by us React version>}` to avoid
   * `Warning: React version not specified in eslint-plugin-react settings.` log message
   * when running ESLint.
   */
  settings?: EslintPluginReactSettings;

  /**
   * Enables or specifies the configuration for the [`@eslint-react/eslint-plugin`](https://www.npmjs.com/package/@eslint-react/eslint-plugin) plugin.
   *
   * Only includes [runtime agnostic ("X") rules](https://eslint-react.xyz/docs/rules/overview#x-rules).
   *
   * By default will use the same `files` and `ignores` as the parent config.
   * @default true
   */
  configReactX?:
    | boolean
    | (ConfigSharedOptions<'@eslint-react'> & {
        /**
         * [`@eslint-react/eslint-plugin`](https://www.npmjs.com/package/@eslint-react/eslint-plugin) plugin
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
      });

  /**
   * Enables or specifies the configuration for the [`eslint-plugin-react-hooks`](https://www.npmjs.com/package/eslint-plugin-react-hooks) plugin, as well as [hooks rules from `@eslint-react/eslint-plugin`](https://eslint-react.xyz/docs/rules/overview#hooks-extra-rules).
   *
   * By default will use the same `files` and `ignores` as the parent config.
   * @default true
   */
  configHooks?: boolean | ConfigSharedOptions<'react-hooks' | '@eslint-react/hooks-extra'>;

  /**
   * Enables or specifies the configuration for DOM specific rules from [`@eslint-react/eslint-plugin`](https://www.npmjs.com/package/@eslint-react/eslint-plugin) and [`eslint-plugin-react`](https://www.npmjs.com/package/eslint-plugin-react).
   *
   * By default will use the same `files` and `ignores` as the parent config.
   * @default true <=> `react-dom` package is installed
   */
  configDom?:
    | boolean
    | ConfigSharedOptions<
        | '@eslint-react/dom'
        | Pick<
            AllReactEslintRules,
            `${'' | `${DisableAutofixPrefix}/`}react/${EslintPluginReactDomRules}` &
              keyof AllReactEslintRules
          >
      >;

  /**
   * Controls how rules from [@eslint-react/eslint-plugin](https://www.npmjs.com/package/@eslint-react/eslint-plugin) and [`eslint-plugin-react`](https://www.npmjs.com/package/eslint-plugin-react) are used.
   * - `prefer`: if the same(-ish) rule exists both in `@eslint-react/eslint-plugin`
   * and `eslint-plugin-react`, use the one from `@eslint-react/eslint-plugin`.
   * Use all the other unique rules from both of these plugins.
   * - `avoid`: same as `prefer`, but `eslint-plugin-react`'s version is preferred.
   * - `only`: do not use `eslint-plugin-react` at all.
   * - `never`: do not use `@eslint-react/eslint-plugin` at all.
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
const PREFER_SHORTHAND_BOOLEAN_SEVERITY = WARNING;
const PREFER_SHORTHAND_FRAGMENT_SEVERITY = WARNING;
const COMPONENT_NAME_SEVERITY = WARNING;
const FILENAME_EXTENSION_SEVERITY = WARNING;
const USE_STATE_SEVERITY = ERROR;

export const reactEslintConfig = (
  options: ReactEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const reactPackageInfo = getPackageInfoSync('react');
  const reactMajorVersion: number =
    options.reactVersion ?? getPackageMajorVersion(reactPackageInfo) ?? LATEST_REACT_VERSION;
  const reactFullVersion = String(
    options.reactVersion ?? reactPackageInfo?.version ?? LATEST_REACT_VERSION,
  );

  const isMinVersion17 = reactMajorVersion >= 17;
  const isMinVersion19 = reactMajorVersion >= 19;

  const {
    files: parentConfigFiles,
    ignores: parentConfigIgnores,
    settings: pluginSettings,
    newJsxTransform = isMinVersion17,
    configHooks = true,
    configReactX = true,
    configDom = isPackageExists('react-dom'),
    pluginX = 'prefer',
  } = options;

  const isConfigXDisabled = configReactX === false;
  const isReactEnabled = pluginX !== 'only';
  const isReactXEnabled = pluginX !== 'never';
  const isReactPreferred = pluginX === 'avoid' || pluginX === 'never';
  const isReactXPreferred = pluginX === 'prefer' || pluginX === 'only';

  const getDoubleRuleName = <
    A extends AllRulesWithPrefixUnprefixedNames<'@eslint-react'>,
    B extends
      AllRulesWithPrefixUnprefixedNames<'react'> = (A extends `${string}/${infer UnprefixedRuleName}`
      ? UnprefixedRuleName
      : A) &
      AllRulesWithPrefixUnprefixedNames<'react'>,
  >(
    nameX: A,
    nameOriginal?: B,
  ) => {
    const nameXUnprefixed = nameX.match(/^(?:[^/]+\/)?(.*)$/)?.[1] as A;
    const result =
      `${isReactXPreferred ? '@eslint-react/' : 'react/'}${isReactXPreferred ? nameXUnprefixed : (nameOriginal ?? nameXUnprefixed)}` as const;
    return result as typeof result & keyof AllEslintRulesWithoutDisableAutofix;
  };
  const getDoubleRuleSeverity = (severity: RuleSeverity, isXRule?: boolean) =>
    (isReactXPreferred && !isReactXEnabled) ||
    (isReactPreferred && !isReactEnabled) ||
    (!isReactXEnabled && isXRule === true) ||
    (!isReactEnabled && isXRule === false)
      ? OFF
      : severity;
  const getXRuleSeverity = (severity: RuleSeverity) => (isReactXEnabled ? severity : OFF);

  const NO_UNSAFE_CLASS_COMPONENT_METHODS_SEVERITY = isMinVersion17 ? WARNING : OFF;

  const configReactXOptions = typeof configReactX === 'object' ? configReactX : {};

  const builderSetup = new ConfigEntryBuilder(null, {}, internalOptions);
  builderSetup.addConfig('react/setup', {
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

  // Legend:
  // 🟢 - in Recommended
  // 💅 - Stylistic rule disabled in `eslint-config-prettier`: https://github.com/prettier/eslint-config-prettier/blob/f12309bbca9fb051b53fcece9a8491a1222235c8/index.js#L234
  // Check rule usage: https://github.com/search?q=path%3A%2F.*eslint%5B%5E%5C%2F%5D*%24%2F+%22react%2Fboolean-prop-naming%22&type=code

  const builderReactOriginal = new ConfigEntryBuilder('react', options, internalOptions);

  builderReactOriginal
    .addConfig([
      'react/plugin-original',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: [GLOB_JS_TS_X],
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
          ...options.disallowedElements,
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
    .addRule('jsx-boolean-value', getDoubleRuleSeverity(PREFER_SHORTHAND_BOOLEAN_SEVERITY, false))
    .addRule('jsx-child-element-spacing', OFF) // 💅
    .addRule('jsx-closing-bracket-location', OFF) // 💅
    .addRule('jsx-closing-tag-location', OFF) // 💅
    .addRule('jsx-curly-brace-presence', WARNING, [
      {props: 'never', children: 'never', propElementValues: 'always'},
    ])
    .addRule('jsx-curly-spacing', OFF) // 💅
    .addRule('jsx-curly-newline', OFF) // 💅
    .addRule('jsx-equals-spacing', OFF) // 💅
    .addRule('jsx-filename-extension', getDoubleRuleSeverity(FILENAME_EXTENSION_SEVERITY, false), [
      {
        extensions: JSX_FILE_EXTENSIONS,
        ignoreFilesWithoutCode: true,
      },
    ])
    .addRule('jsx-first-prop-new-line', OFF) // 💅
    .addRule('jsx-fragments', getDoubleRuleSeverity(PREFER_SHORTHAND_FRAGMENT_SEVERITY, false))
    .addRule('jsx-handler-names', OFF)
    .addRule('jsx-indent-props', OFF) // 💅
    .addRule('jsx-indent', OFF) // 💅
    .addRule('jsx-key', getDoubleRuleSeverity(NO_DUPLICATE_OR_MISSING_KEY_SEVERITY, true), [
      {
        checkFragmentShorthand: true,
        checkKeyMustBeforeSpread: true,
        warnOnDuplicates: true,
      },
    ]) // 🟢
    .addRule('jsx-max-depth', OFF)
    .addRule('jsx-max-props-per-line', OFF) // 💅
    .addRule('jsx-newline', OFF) // 💅
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
    .addRule('jsx-one-expression-per-line', OFF) // 💅
    .addRule('jsx-pascal-case', getDoubleRuleSeverity(COMPONENT_NAME_SEVERITY, false), [
      {allowNamespace: true},
    ])
    .addRule('jsx-props-no-multi-spaces', OFF) // 💅
    .addRule('jsx-props-no-spread-multi', ERROR)
    .addRule('jsx-props-no-spreading', ERROR, [
      {custom: 'ignore' /* Only enforced on HTML elements */},
    ])
    .addRule('jsx-sort-props', OFF)
    .addRule('jsx-tag-spacing', OFF) // 💅
    .addRule(
      'jsx-uses-react',
      newJsxTransform ? OFF : getDoubleRuleSeverity(JSX_USES_REACT_SEVERITY, false),
    ) // 🟢
    .addRule('jsx-uses-vars', getDoubleRuleSeverity(JSX_USES_VARS_SEVERITY, false)) // 🟢
    .addRule('jsx-wrap-multilines', OFF) // 💅
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
    .addRule('no-unsafe', getDoubleRuleSeverity(NO_UNSAFE_CLASS_COMPONENT_METHODS_SEVERITY, false)) // 🟢(off)
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
    .addOverrides();

  // TODO
  builderReactOriginal
    .addConfig([
      'react/allow-default-export-in-jsx-files',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: [GLOB_JS_TS_X_ONLY],
      },
    ])
    .addAnyRule('import/no-default-export', OFF);

  const configHooksOptions = typeof configHooks === 'object' ? configHooks : {};
  const builderHooks = new ConfigEntryBuilder(null, configHooksOptions, internalOptions);
  builderHooks
    .addConfig([
      'react/hooks',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: parentConfigFiles || [GLOB_JS_TS_X],
        ignoresFallback: parentConfigIgnores,
      },
    ])
    .addRule('react-hooks/exhaustive-deps', ERROR)
    .addRule('react-hooks/rules-of-hooks', ERROR)
    .addRule(
      '@eslint-react/hooks-extra/no-direct-set-state-in-use-effect',
      getXRuleSeverity(WARNING),
    ) // 🟡
    .addRule(
      '@eslint-react/hooks-extra/no-direct-set-state-in-use-layout-effect',
      getXRuleSeverity(WARNING),
    )
    .addRule('@eslint-react/hooks-extra/no-unnecessary-use-callback', getXRuleSeverity(ERROR))
    .addRule('@eslint-react/hooks-extra/no-unnecessary-use-memo', getXRuleSeverity(ERROR))
    .addRule('@eslint-react/hooks-extra/no-unnecessary-use-prefix', getXRuleSeverity(OFF)) // 🟡
    .addRule(
      '@eslint-react/hooks-extra/prefer-use-state-lazy-initialization',
      getXRuleSeverity(WARNING),
    ) // 🟡
    .addOverrides();

  // Legend:
  // 🟢 - in Recommended, severity is `error`
  // 🟡 - in Recommended, severity is `warn`
  // 🔄️ - Name of the same rule in `eslint-plugin-react` that will be disabled if `configReactX` is enabled (name is also same if it is not specified)
  // 💭 - Requires type information
  // 🔢 - min React version in which the rule works (otherwise does nothing)

  const {noLegacyApis = {}} = configReactXOptions;

  const builderReactX = new ConfigEntryBuilder(
    '@eslint-react',
    configReactXOptions,
    internalOptions,
  );
  builderReactX
    .addConfig([
      'react/x',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: parentConfigFiles || [GLOB_JS_TS_X],
        ignoresFallback: parentConfigIgnores,
      },
    ])
    // === X rules ===
    .addRule('jsx-no-duplicate-props', getDoubleRuleSeverity(JSX_NO_DUPLICATE_PROPS_SEVERITY, true)) // 🟡 🔄️
    .addRule('jsx-no-undef', getDoubleRuleSeverity(JSX_NO_UNDEF_SEVERITY, true)) // 🔄️
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
    .addRule('no-comment-textnodes', getDoubleRuleSeverity(NO_COMMENT_TEXTNODES_SEVERITY, true)) // 🟡 🔄️`jsx-no-comment-textnodes`
    .addRule('no-complex-conditional-rendering', OFF)
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
    // "In React 19, forwardRef is no longer necessary. Pass ref as a prop instead."
    .addRule('no-forward-ref', getSeverity(noLegacyApis.forwardRef)) // 🟡 🔢19.0.0
    .addRule('no-implicit-key', WARNING) // 🟡
    .addRule(
      'no-leaked-conditional-rendering',
      getDoubleRuleSeverity(NO_LEAKED_CONDITIONAL_RENDERING_SEVERITY, true),
    ) // 🟡 🔄️`jsx-no-leaked-render` (worse) 💭
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
    .addRule(
      'no-unsafe-component-will-mount',
      getDoubleRuleSeverity(NO_UNSAFE_CLASS_COMPONENT_METHODS_SEVERITY, true),
    ) // 🟡 🔄️`no-unsafe`
    .addRule(
      'no-unsafe-component-will-receive-props',
      getDoubleRuleSeverity(NO_UNSAFE_CLASS_COMPONENT_METHODS_SEVERITY, true),
    ) // 🟡 🔄️`no-unsafe`
    .addRule(
      'no-unsafe-component-will-update',
      getDoubleRuleSeverity(NO_UNSAFE_CLASS_COMPONENT_METHODS_SEVERITY, true),
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
    .addRule('prefer-react-namespace-import', OFF)
    .addRule('prefer-read-only-props', getDoubleRuleSeverity(PREFER_READ_ONLY_PROPS_SEVERITY, true)) // 🔄️ 💭
    .addRule(
      'prefer-shorthand-boolean',
      getDoubleRuleSeverity(PREFER_SHORTHAND_BOOLEAN_SEVERITY, true),
    ) // 🔄️`jsx-boolean-value`
    .addRule(
      'prefer-shorthand-fragment',
      getDoubleRuleSeverity(PREFER_SHORTHAND_FRAGMENT_SEVERITY, true),
    ) // 🔄️`jsx-fragments`
    .addRule('avoid-shorthand-boolean', OFF) // 🔄️`jsx-boolean-value`
    .addRule('avoid-shorthand-fragment', OFF) // 🔄️`jsx-fragments`
    // TODO
    // === Naming Convention rules ===
    .addRule(
      'naming-convention/component-name',
      getDoubleRuleSeverity(COMPONENT_NAME_SEVERITY, true),
    ) // 🔄️`jsx-pascal-case`
    .addRule('naming-convention/context-name', WARNING) // 🟡
    .addRule('naming-convention/filename', OFF)
    .addRule(
      'naming-convention/filename-extension',
      getDoubleRuleSeverity(FILENAME_EXTENSION_SEVERITY, true),
      [{allow: 'always', extensions: JSX_FILE_EXTENSIONS}],
    ) // 🔄️`jsx-filename-extension`
    .addRule('naming-convention/use-state', getDoubleRuleSeverity(USE_STATE_SEVERITY, true)) // 🔄️`hook-use-state`
    // === Debug rules ===
    .addRule('debug/class-component', OFF)
    .addRule('debug/function-component', OFF)
    .addRule('debug/hook', OFF)
    .addRule('debug/is-from-react', OFF)
    .addRule('debug/jsx', OFF)
    .addOverrides();

  const configReactDomOptions = typeof configDom === 'object' ? configDom : {};
  const builderDom = new ConfigEntryBuilder(null, configReactDomOptions, internalOptions);
  builderDom
    .addConfig([
      'react/dom',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: parentConfigFiles || [GLOB_JS_TS_X],
        ignoresFallback: parentConfigIgnores,
      },
    ])
    .addRule(
      getDoubleRuleName('dom/no-dangerously-set-innerhtml', 'no-danger'),
      getDoubleRuleSeverity(ERROR),
    ) // 🟡 🔄️`no-danger`
    .addRule(
      getDoubleRuleName(
        'dom/no-dangerously-set-innerhtml-with-children',
        'no-danger-with-children',
      ),
      getDoubleRuleSeverity(ERROR),
    ) // 🟢 🔄️`no-danger-with-children`
    // TODO deprecated API, removed in v19
    .addRule(getDoubleRuleName('dom/no-find-dom-node'), getDoubleRuleSeverity(ERROR)) // 🟢 🔄️
    .addRule('@eslint-react/dom/no-flush-sync', getXRuleSeverity(ERROR)) // 🟢
    // TODO deprecated API, removed in v19
    .addRule('@eslint-react/dom/no-hydrate', getXRuleSeverity(ERROR)) // 🟢 🔢18.0.0
    .addRule(
      getDoubleRuleName('dom/no-missing-button-type', 'button-has-type'),
      getDoubleRuleSeverity(ERROR),
    ) // 🟡 🔄️`button-has-type`
    .addRule(
      getDoubleRuleName('dom/no-missing-iframe-sandbox', 'iframe-missing-sandbox'),
      getDoubleRuleSeverity(ERROR),
    ) // 🟡 🔄️`iframe-missing-sandbox`
    .addRule(getDoubleRuleName('dom/no-namespace'), getDoubleRuleSeverity(ERROR)) // 🟢 🔄️
    // TODO deprecated API, removed in v19
    .addRule('@eslint-react/dom/no-render', getXRuleSeverity(ERROR)) // 🟢 🔢18.0.0
    .addRule(getDoubleRuleName('dom/no-render-return-value'), getDoubleRuleSeverity(ERROR)) // 🟢 🔄️
    .addRule(
      getDoubleRuleName('dom/no-script-url', 'jsx-no-script-url'),
      getDoubleRuleSeverity(ERROR),
    ) // 🟡 🔄️`jsx-no-script-url`
    // TODO `options` type is `any[]`
    .addRule(getDoubleRuleName('dom/no-unknown-property'), getDoubleRuleSeverity(ERROR), [
      {requireDataLowercase: true},
    ]) // 🔄️
    .addRule(
      getDoubleRuleName('dom/no-unsafe-iframe-sandbox', 'iframe-missing-sandbox'),
      getDoubleRuleSeverity(ERROR),
    ) // 🟡 🔄️`iframe-missing-sandbox`
    .addRule(
      getDoubleRuleName('dom/no-unsafe-target-blank', 'jsx-no-target-blank'),
      getDoubleRuleSeverity(ERROR),
    ) // 🟡 🔄️`jsx-no-target-blank`
    // React 19 docs: "In earlier React Canary versions, this API was part of React DOM and called useFormState."
    .addRule('@eslint-react/dom/no-use-form-state', getXRuleSeverity(ERROR)) // 🟢 🔢19.0.0
    .addRule(
      getDoubleRuleName('dom/no-void-elements-with-children', 'void-dom-elements-no-children'),
      getDoubleRuleSeverity(ERROR),
    ) // 🟢 🔄️`void-dom-elements-no-children`
    // === Web API rules ===
    .addRule('@eslint-react/web-api/no-leaked-event-listener', getXRuleSeverity(ERROR)) // 🟡
    .addRule('@eslint-react/web-api/no-leaked-interval', getXRuleSeverity(ERROR)) // 🟡
    .addRule('@eslint-react/web-api/no-leaked-resize-observer', getXRuleSeverity(ERROR)) // 🟡
    .addRule('@eslint-react/web-api/no-leaked-timeout', getXRuleSeverity(ERROR)) // 🟡
    // === eslint-plugin-react DOM rules ===
    .addRule('react/checked-requires-onchange-or-readonly', ERROR, [
      {ignoreMissingProperties: true},
    ])
    .addRule('react/forbid-dom-props', OFF)
    .addRule('react/no-invalid-html-attribute', ERROR)
    .addRule('react/no-is-mounted', ERROR) // 🟢
    .addOverrides();

  return [
    ...builderSetup.getAllConfigs(),
    ...builderReactOriginal.getAllConfigs(),
    ...(configHooks === false ? [] : builderHooks.getAllConfigs()),
    ...(isConfigXDisabled ? [] : builderReactX.getAllConfigs()),
    ...(configDom === false ? [] : builderDom.getAllConfigs()),
  ];
};

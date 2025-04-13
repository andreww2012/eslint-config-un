import {getPackageInfoSync} from 'local-pkg';
import {ERROR, GLOB_JS_TS_X, GLOB_JS_TS_X_ONLY, OFF, WARNING} from '../constants';
import {ConfigEntryBuilder, type ConfigSharedOptions, type FlatConfigEntry} from '../eslint';
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
   * Enables or specifies the configuration for the [`eslint-plugin-react-hooks`](https://www.npmjs.com/package/eslint-plugin-react-hooks) plugin.
   *
   * By default will use the same `files` and `ignores` as the parent config.
   * @default true
   */
  configHooks?: boolean | ConfigSharedOptions<'react-hooks'>;

  /**
   * Detected automatically from a major version of the installed version of
   * `react` package, but can also be specified manually here.
   */
  reactVersion?: number;

  /**
   * A flag indicating [the new JSX Transform](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html) is used.
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
  } = options;

  const isXDisabled = options.configReactX === false;

  const builder = new ConfigEntryBuilder('react', options, internalOptions);

  // Legend:
  // 🟢 - in Recommended
  // 💅 - Stylistic rule disabled in `eslint-config-prettier`: https://github.com/prettier/eslint-config-prettier/blob/f12309bbca9fb051b53fcece9a8491a1222235c8/index.js#L234
  // Check rule usage: https://github.com/search?q=path%3A%2F.*eslint%5B%5E%5C%2F%5D*%24%2F+%22react%2Fboolean-prop-naming%22&type=code

  builder
    .addConfig(
      [
        'react',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: [GLOB_JS_TS_X],
        },
      ],
      {
        settings: {
          react: {
            version: reactFullVersion,
            ...pluginSettings,
          } satisfies EslintPluginReactSettings,
        },
        // Copied from https://github.com/jsx-eslint/eslint-plugin-react/blob/e6b5b41191690ee166d0cca1e9db27092b910f03/index.js#L86
        ...(newJsxTransform && {
          languageOptions: {
            parserOptions: {
              jsxPragma: null, // for @typescript/eslint-parser
            },
          },
        }),
      },
    )
    .addRule('boolean-prop-naming', OFF)
    .addRule('button-has-type', ERROR)
    .addRule('checked-requires-onchange-or-readonly', ERROR, [{ignoreMissingProperties: true}])
    .addRule('default-props-match-prop-types', ERROR)
    .addRule('destructuring-assignment', OFF)
    .addRule('display-name', WARNING) // 🟢
    .addRule('forbid-component-props', OFF)
    .addRule('forbid-dom-props', OFF)
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
    .addRule('forbid-foreign-prop-types', ERROR)
    .addRule('forbid-prop-types', OFF)
    .addRule('forward-ref-uses-ref', ERROR)
    .addRule('function-component-definition', ERROR, [
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ])
    .addRule('hook-use-state', ERROR, [{allowDestructuredState: true}])
    .addRule('iframe-missing-sandbox', ERROR)
    .addRule('jsx-boolean-value', WARNING)
    .addRule('jsx-child-element-spacing', OFF) // 💅
    .addRule('jsx-closing-bracket-location', OFF) // 💅
    .addRule('jsx-closing-tag-location', OFF) // 💅
    .addRule('jsx-curly-brace-presence', WARNING, [
      {props: 'never', children: 'never', propElementValues: 'always'},
    ])
    .addRule('jsx-curly-spacing', OFF) // 💅
    .addRule('jsx-curly-newline', OFF) // 💅
    .addRule('jsx-equals-spacing', OFF) // 💅
    .addRule('jsx-filename-extension', WARNING, [
      {
        extensions: JSX_FILE_EXTENSIONS,
        ignoreFilesWithoutCode: true,
      },
    ])
    .addRule('jsx-first-prop-new-line', OFF) // 💅
    .addRule('jsx-fragments', WARNING)
    .addRule('jsx-handler-names', OFF)
    .addRule('jsx-indent-props', OFF) // 💅
    .addRule('jsx-indent', OFF) // 💅
    .addRule('jsx-key', ERROR, [
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
    .addRule('jsx-no-comment-textnodes', ERROR) // 🟢
    .addRule('jsx-no-constructed-context-values', WARNING)
    .addRule('jsx-no-duplicate-props', ERROR) // 🟢
    // 🤔 Has many issues like https://github.com/jsx-eslint/eslint-plugin-react/issues/3292
    .addRule('jsx-no-leaked-render', OFF)
    // 🤔 From my understanding a rather niche rule, mostly useful in i18n apps
    .addRule('jsx-no-literals', OFF)
    .addRule('jsx-no-script-url', ERROR)
    .addRule('jsx-no-target-blank', ERROR) // 🟢
    .addRule('jsx-no-undef', ERROR) // 🟢
    .addRule('jsx-no-useless-fragment', WARNING, [{allowExpressions: true}])
    .addRule('jsx-one-expression-per-line', OFF) // 💅
    .addRule('jsx-pascal-case', WARNING, [{allowNamespace: true}])
    .addRule('jsx-props-no-multi-spaces', OFF) // 💅
    .addRule('jsx-props-no-spread-multi', ERROR)
    // Only enforced on HTML elements
    .addRule('jsx-props-no-spreading', ERROR, [{custom: 'ignore'}])
    .addRule('jsx-sort-props', OFF)
    .addRule('jsx-tag-spacing', OFF) // 💅
    .addRule('jsx-uses-react', newJsxTransform ? OFF : ERROR) // 🟢
    .addRule('jsx-uses-vars', ERROR) // 🟢
    .addRule('jsx-wrap-multilines', OFF) // 💅
    .addRule('no-access-state-in-setstate', ERROR)
    .addRule('no-adjacent-inline-elements', OFF)
    .addRule('no-array-index-key', WARNING)
    .addRule('no-arrow-function-lifecycle', ERROR)
    .addRule('no-children-prop', ERROR) // 🟢
    .addRule('no-danger-with-children', ERROR) // 🟢
    .addRule('no-danger', ERROR)
    .addRule('no-deprecated', ERROR) // 🟢
    .addRule('no-did-mount-set-state', WARNING)
    .addRule('no-did-update-set-state', WARNING)
    .addRule('no-direct-mutation-state', ERROR) // 🟢
    .addRule('no-find-dom-node', ERROR) // 🟢
    .addRule('no-invalid-html-attribute', ERROR)
    .addRule('no-is-mounted', ERROR) // 🟢
    .addRule('no-multi-comp', ERROR)
    .addRule('no-namespace', ERROR)
    .addRule('no-object-type-as-default-prop', WARNING)
    .addRule('no-redundant-should-component-update', ERROR)
    .addRule('no-render-return-value', ERROR) // 🟢
    .addRule('no-set-state', OFF)
    .addRule('no-string-refs', ERROR, [{noTemplateLiterals: true}]) // 🟢
    .addRule('no-this-in-sfc', ERROR)
    .addRule('no-typos', ERROR)
    .addRule('no-unescaped-entities', OFF) // 🟢
    .addRule('no-unknown-property', ERROR, [{requireDataLowercase: true}]) // 🟢
    .addRule('no-unsafe', isMinVersion17 ? WARNING : OFF) // 🟢(off)
    .addRule('no-unstable-nested-components', ERROR, [{allowAsProps: true}])
    .addRule('no-unused-class-component-methods', WARNING)
    .addRule('no-unused-prop-types', WARNING)
    .addRule('no-unused-state', WARNING)
    .addRule('no-will-update-set-state', WARNING)
    .addRule('prefer-es6-class', ERROR)
    .addRule('prefer-exact-props', OFF)
    .addRule('prefer-read-only-props', OFF)
    .addRule('prefer-stateless-function', ERROR)
    .addRule('prop-types', ERROR) // 🟢
    .addRule('react-in-jsx-scope', newJsxTransform ? OFF : ERROR) // 🟢
    .addRule('require-default-props', OFF)
    .addRule('require-optimization', OFF)
    .addRule('require-render-return', ERROR) // 🟢
    .addRule('self-closing-comp', OFF)
    .addRule('sort-comp', ERROR)
    .addRule('sort-default-props', OFF)
    .addRule('sort-prop-types', OFF)
    .addRule('state-in-constructor', ERROR, ['never'])
    .addRule('static-property-placement', ERROR)
    .addRule('style-prop-object', OFF)
    .addRule('void-dom-elements-no-children', ERROR)
    .addOverrides();

  builder
    .addConfig([
      'react/allow-default-export-in-jsx-files',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: [GLOB_JS_TS_X_ONLY],
      },
    ])
    .addAnyRule('import/no-default-export', OFF);

  const configHooksOptions = typeof configHooks === 'object' ? configHooks : {};
  const builderHooks = new ConfigEntryBuilder('react-hooks', configHooksOptions, internalOptions);
  builderHooks
    .addConfig([
      'react/hooks',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: parentConfigFiles || [GLOB_JS_TS_X],
        ignoresFallback: parentConfigIgnores,
      },
    ])
    .addRule('exhaustive-deps', ERROR)
    .addRule('rules-of-hooks', ERROR);

  // Legend:
  // 🟢 - in Recommended, severity is `error`
  // 🟡 - in Recommended, severity is `warn`
  // 🔄️ - Name of the same rule in `eslint-plugin-react` that will be disabled if `configReactX` is enabled (name is also same if it is not specified)
  // 💭 - Requires type information
  // 🔢 - min React version in which the rule works (otherwise does nothing)

  const configReactXOptions = typeof configReactX === 'object' ? configReactX : {};
  const {noLegacyApis = {}} = configReactXOptions;

  const builderReactX = new ConfigEntryBuilder(
    '@eslint-react',
    configReactXOptions,
    internalOptions,
  );
  builderReactX
    .addConfig(
      [
        'react/x',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: parentConfigFiles || [GLOB_JS_TS_X],
          ignoresFallback: parentConfigIgnores,
        },
      ],
      {
        settings: {
          'react-x': {
            version: reactFullVersion,
            ...configReactXOptions.settings,
          } satisfies EslintPluginReactXSettings,
        },
      },
    )
    // === X rules ===
    .addRule('jsx-no-duplicate-props', ERROR) // 🟡 🔄️
    .addRule('jsx-no-undef', ERROR) // 🔄️
    // "This rule does nothing when using the New JSX Transform or if the no-unused-vars rule is not enabled."
    .addRule('jsx-uses-react', ERROR) // 🟡 🔄️
    // "This rule only has an effect when the no-unused-vars rule is enabled."
    .addRule('jsx-uses-vars', ERROR) // 🟡 🔄️
    .addRule('no-access-state-in-setstate', ERROR) // 🟢 🔄️
    .addRule('no-array-index-key', WARNING) // 🟡 🔄️
    .addRule('no-children-count', getSeverity(noLegacyApis.Children)) // 🟡
    .addRule('no-children-for-each', getSeverity(noLegacyApis.Children)) // 🟡
    .addRule('no-children-map', getSeverity(noLegacyApis.Children)) // 🟡
    .addRule('no-children-only', getSeverity(noLegacyApis.Children)) // 🟡
    .addRule('no-children-prop', ERROR) // 🔄️
    .addRule('no-children-to-array', getSeverity(noLegacyApis.Children)) // 🟡
    .addRule('no-class-component', getSeverity(noLegacyApis.classComponent ?? 'warn'))
    .addRule('no-clone-element', getSeverity(noLegacyApis.cloneElement)) // 🟡
    .addRule('no-comment-textnodes', ERROR) // 🟡 🔄️
    .addRule('no-complex-conditional-rendering', OFF)
    .addRule('no-component-will-mount', getSeverity(noLegacyApis.componentWillMount)) // 🟢
    .addRule('no-component-will-receive-props', getSeverity(noLegacyApis.componentWillReceiveProps)) // 🟢
    .addRule('no-component-will-update', getSeverity(noLegacyApis.componentWillUpdate)) // 🟢
    .addRule('no-context-provider', ERROR) // 🟡 🔢19.0.0
    .addRule('no-create-ref', getSeverity(noLegacyApis.createRef)) // 🟢
    // `defaultProps` removed in v19 (will be silently ignored)
    .addRule('no-default-props', isMinVersion19 ? ERROR : WARNING) // 🟢
    .addRule('no-direct-mutation-state', ERROR) // 🟢 🔄️
    .addRule('no-duplicate-key', ERROR) // 🟢 🔄️`jsx-key` (`warnOnDuplicates` option)
    // "In React 19, forwardRef is no longer necessary. Pass ref as a prop instead."
    .addRule('no-forward-ref', getSeverity(noLegacyApis.forwardRef)) // 🟡 🔢19.0.0
    .addRule('no-implicit-key', WARNING) // 🟡
    .addRule('no-leaked-conditional-rendering', ERROR) // 🟡 🔄️`jsx-no-leaked-render` 💭
    .addRule('no-missing-component-display-name', WARNING) // 🔄️`display-name`
    .addRule('no-missing-context-display-name', WARNING) // 🔄️`display-name` (`checkContextObjects` option)
    .addRule('no-missing-key', ERROR) // 🟢 🔄️`jsx-key`
    .addRule('no-misused-capture-owner-stack', ERROR)
    .addRule('no-nested-component-definitions', ERROR) // 🟢 🔄️`no-unstable-nested-components`
    .addRule('no-nested-lazy-component-declarations', ERROR) // 🟢
    // `propTypes` removed in v19 (will be silently ignored)
    .addRule('no-prop-types', isMinVersion19 ? ERROR : WARNING) // 🟢
    .addRule('no-redundant-should-component-update', ERROR) // 🟢 🔄️
    .addRule('no-set-state-in-component-did-mount', WARNING) // 🟡 🔄️`no-did-mount-set-state`
    .addRule('no-set-state-in-component-did-update', WARNING) // 🟡 🔄️`no-did-update-set-state`
    .addRule('no-set-state-in-component-will-update', WARNING) // 🟡 🔄️`no-will-update-set-state`
    .addRule('no-string-refs', ERROR) // 🟢 🔄️
    .addRule('no-unsafe-component-will-mount', isMinVersion17 ? WARNING : OFF) // 🟡 🔄️`no-unsafe`
    .addRule('no-unsafe-component-will-receive-props', isMinVersion17 ? WARNING : OFF) // 🟡 🔄️`no-unsafe`
    .addRule('no-unsafe-component-will-update', isMinVersion17 ? WARNING : OFF) // 🟡 🔄️`no-unsafe`
    .addRule('no-unstable-context-value', WARNING) // 🟡 🔄️`jsx-no-constructed-context-values`
    .addRule('no-unstable-default-props', WARNING) // 🟡 🔄️`no-object-type-as-default-prop`
    .addRule('no-unused-class-component-members', WARNING) // 🟡 🔄️`no-unused-class-component-methods`
    .addRule('no-unused-state', WARNING) // 🟡 🔄️
    .addRule('no-use-context', WARNING) // 🟡 🔢19.0.0
    .addRule('no-useless-forward-ref', ERROR) // 🟡 🔄️`forward-ref-uses-ref`
    .addRule('no-useless-fragment', WARNING) // 🔄️`jsx-no-useless-fragment`
    .addRule('prefer-destructuring-assignment', OFF) // 🔄️`destructuring-assignment`
    // TODO why?
    .addRule('prefer-react-namespace-import', OFF)
    .addRule('prefer-read-only-props', OFF) // 🔄️ 💭
    .addRule('prefer-shorthand-boolean', WARNING) // 🔄️`jsx-boolean-value`
    .addRule('prefer-shorthand-fragment', WARNING) // 🔄️`jsx-fragments`
    .addRule('avoid-shorthand-boolean', OFF) // 🔄️`jsx-boolean-value`
    .addRule('avoid-shorthand-fragment', OFF) // 🔄️`jsx-fragments`
    // === DOM rules ===
    .addRule('dom/no-dangerously-set-innerhtml', ERROR) // 🟡 🔄️`no-danger`
    .addRule('dom/no-dangerously-set-innerhtml-with-children', ERROR) // 🟢 🔄️`no-danger-with-children`
    // TODO deprecated API, removed in v19
    .addRule('dom/no-find-dom-node', ERROR) // 🟢 🔄️
    .addRule('dom/no-flush-sync', ERROR) // 🟢
    // TODO deprecated API, removed in v19
    .addRule('dom/no-hydrate', ERROR) // 🟢 🔢18.0.0
    .addRule('dom/no-missing-button-type', ERROR) // 🟡 🔄️`button-has-type`
    .addRule('dom/no-missing-iframe-sandbox', ERROR) // 🟡 🔄️`iframe-missing-sandbox`
    .addRule('dom/no-namespace', ERROR) // 🟢 🔄️
    // TODO deprecated API, removed in v19
    .addRule('dom/no-render', ERROR) // 🟢 🔢18.0.0
    .addRule('dom/no-render-return-value', ERROR) // 🟢 🔄️
    .addRule('dom/no-script-url', ERROR) // 🟡 🔄️
    .addRule('dom/no-unknown-property', ERROR, [{requireDataLowercase: true}]) // 🔄️
    .addRule('dom/no-unsafe-iframe-sandbox', ERROR) // 🟡 🔄️`iframe-missing-sandbox`
    .addRule('dom/no-unsafe-target-blank', ERROR) // 🟡 🔄️`jsx-no-target-blank`
    // React 19 docs: "In earlier React Canary versions, this API was part of React DOM and called useFormState."
    .addRule('dom/no-use-form-state', ERROR) // 🟢 🔢19.0.0
    .addRule('dom/no-void-elements-with-children', ERROR) // 🟢 🔄️`void-dom-elements-no-children`
    // === Web API rules ===
    .addRule('web-api/no-leaked-event-listener', ERROR) // 🟡
    .addRule('web-api/no-leaked-interval', ERROR) // 🟡
    .addRule('web-api/no-leaked-resize-observer', ERROR) // 🟡
    .addRule('web-api/no-leaked-timeout', ERROR) // 🟡
    // === Hooks Extra rules ===
    .addRule('hooks-extra/no-direct-set-state-in-use-effect', WARNING) // 🟡
    .addRule('hooks-extra/no-direct-set-state-in-use-layout-effect', WARNING)
    .addRule('hooks-extra/no-unnecessary-use-callback', ERROR)
    .addRule('hooks-extra/no-unnecessary-use-memo', ERROR)
    .addRule('hooks-extra/no-unnecessary-use-prefix', OFF) // 🟡
    .addRule('hooks-extra/prefer-use-state-lazy-initialization', WARNING) // 🟡
    // === Naming Convention rules ===
    .addRule('naming-convention/component-name', WARNING) // 🔄️`jsx-pascal-case`
    .addRule('naming-convention/context-name', WARNING) // 🟡
    .addRule('naming-convention/filename', OFF)
    .addRule('naming-convention/filename-extension', WARNING, [
      {allow: 'always', extensions: JSX_FILE_EXTENSIONS},
    ]) // 🔄️`jsx-filename-extension`
    .addRule('naming-convention/use-state', ERROR) // 🔄️`hook-use-state`
    // === Debug rules ===
    .addRule('debug/class-component', OFF)
    .addRule('debug/function-component', OFF)
    .addRule('debug/hook', OFF)
    .addRule('debug/is-from-react', OFF)
    .addRule('debug/jsx', OFF);

  return [
    ...builder.getAllConfigs(),
    ...(configHooks === false ? [] : builderHooks.getAllConfigs()),
    ...(isXDisabled ? [] : builderReactX.getAllConfigs()),
  ];
};

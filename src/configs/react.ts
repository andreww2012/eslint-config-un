import {getPackageInfoSync} from 'local-pkg';
import {ERROR, GLOB_JS_TS_X, GLOB_JS_TS_X_ONLY, OFF, WARNING} from '../constants';
import {ConfigEntryBuilder, type ConfigSharedOptions, type FlatConfigEntry} from '../eslint';
import {getPackageMajorVersion} from '../utils';
import {noRestrictedHtmlElementsDefault} from './vue';
import type {InternalConfigOptions} from './index';

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
  settings?: {
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
  };

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

  const {
    files: parentConfigFiles,
    ignores: parentConfigIgnores,
    settings: pluginSettings,
    newJsxTransform = reactMajorVersion >= 17,
    configHooks = true,
  } = options;

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
          },
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
    .addRule('display-name', ERROR) // 🟢
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
        extensions: ['.jsx', '.tsx', '.cjsx', '.mjsx', '.ctsx', '.mtsx'],
      },
    ])
    .addRule('jsx-first-prop-new-line', OFF) // 💅
    .addRule('jsx-fragments', WARNING)
    .addRule('jsx-handler-names', OFF)
    .addRule('jsx-indent', OFF) // 💅
    .addRule('jsx-indent-props', OFF) // 💅
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
    .addRule('no-object-type-as-default-prop', ERROR)
    .addRule('no-redundant-should-component-update', ERROR)
    .addRule('no-render-return-value', ERROR) // 🟢
    .addRule('no-set-state', OFF)
    .addRule('no-string-refs', ERROR) // 🟢
    .addRule('no-this-in-sfc', ERROR)
    .addRule('no-typos', ERROR)
    .addRule('no-unescaped-entities', OFF) // 🟢
    .addRule('no-unknown-property', ERROR, [{requireDataLowercase: true}]) // 🟢
    .addRule('no-unsafe', reactMajorVersion >= 17 ? ERROR : OFF) // 🟢(off)
    .addRule('no-unstable-nested-components', ERROR, [{allowAsProps: true}])
    .addRule('no-unused-class-component-methods', WARNING)
    .addRule('no-unused-prop-types', WARNING)
    .addRule('no-unused-state', WARNING)
    .addRule('no-will-update-set-state', ERROR)
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

  return [
    ...builder.getAllConfigs(),
    ...(configHooks === false ? [] : builderHooks.getAllConfigs()),
  ];
};

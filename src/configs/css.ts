import type {CSSLanguageOptions} from '@eslint/css';
import {ERROR, GLOB_CSS, GLOB_SCSS, OFF, SASS_PACKAGES, WARNING} from '../constants';
import {generatePackageToLoadProperty, packagesLoaders} from '../loaders';
import {type MaybeFn, getKeysOfTruthyValues} from '../utils';
import {resolveFilesOption} from './shared';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

type CssCustomSyntax = Extract<CSSLanguageOptions['customSyntax'], Record<string, unknown>>;

interface ScssSubConfigOptions<ExtraPlugins extends ExtraPluginsType> extends UnFlatConfigEntryBase<
  ExtraPlugins,
  'css'
> {
  /**
   * Same as the `customSyntax` option of the parent config, but for SCSS files.
   * The parent option is not applied to them, because it would replace the SCSS syntax entirely.
   *
   * Defaults to the SCSS syntax, which is also passed to the function form as `extraSyntax` so
   * that you can extend rather than replace it.
   */
  customSyntax?: MaybeFn<
    CssCustomSyntax,
    [
      {
        /**
         * Default CSS syntax provided by [`@eslint/css`](https://npmx.dev/@eslint/css), which in
         * turn coming from the `/definition-syntax-data` entrypoint of this package.
         */
        defaultSyntax: CssCustomSyntax;

        /**
         * SCSS syntax coming from
         * [`@humanwhocodes/scsstree`](https://npmx.dev/@humanwhocodes/scsstree).
         *
         * NOTE: it will already contain the merged default syntax.
         */
        extraSyntax: CssCustomSyntax;
      },
    ]
  >;
}

/**
 * CSS specific rules.
 *
 * 📁 Default `files`: <code>**&#47;*.css</code>
 */
export interface CssEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'css'> {
  /**
   * A dedicated config entry for SCSS files, parsed with the CSSTree syntax provided by
   * [`@humanwhocodes/scsstree`](https://npmx.dev/@humanwhocodes/scsstree).
   *
   * The following rules are turned off, because they cannot reason about the parts of SCSS that
   * are only resolved once Sass compiles them:
   * - [`css/font-family-fallbacks`](https://github.com/eslint/css/blob/HEAD/docs/rules/font-family-fallbacks.md)
   *   cannot see through the variables and functions font stacks are usually stored in;
   * - [`css/no-invalid-at-rule-placement`](https://github.com/eslint/css/blob/HEAD/docs/rules/no-invalid-at-rule-placement.md)
   *   expects `@import` to come first, while SCSS requires it to come after `@use` and `@forward`;
   * - [`css/no-invalid-at-rules`](https://github.com/eslint/css/blob/HEAD/docs/rules/no-invalid-at-rules.md)
   *   validates declarations inside SCSS block at-rules (`@mixin`, `@include`, `@if`, `@each`,
   *   ...) as descriptors of those at-rules, which rejects any multi-token value;
   * - [`css/no-invalid-properties`](https://github.com/eslint/css/blob/HEAD/docs/rules/no-invalid-properties.md)
   *   does not know what interpolated property names and plain (non-namespaced) SCSS function
   *   calls produce.
   *
   * `@function` is also added to the at-rules allowed by
   * [`css/use-baseline`](https://github.com/eslint/css/blob/HEAD/docs/rules/use-baseline.md),
   * merged with `allowedFeatures.atRules`.
   *
   * 📁 Default `files`: <code>**&#47;*.scss</code>
   * @default true // if `sass` or `sass-embedded` package is installed
   */
  configScss?: boolean | ScssSubConfigOptions<ExtraPlugins>;

  /**
   * From `@eslint/css` plugin docs:
   * > By default, the CSS parser runs in strict mode, which reports all parsing errors.
   * > If you'd like to allow recoverable parsing errors (those that the browser automatically fixes
   * > on its own), you can set the `tolerant` option to `true`.
   *
   * > Setting `tolerant` to `true` is necessary if you are using custom syntax, such as PostCSS
   * > plugins, that aren't part of the standard CSS syntax.
   *
   * Also applied to the `configScss` sub-config.
   * @default false
   */
  tolerantMode?: CSSLanguageOptions['tolerant'];

  /**
   * From `@eslint/css` plugin docs:
   * > The CSS lexer comes prebuilt with a set of known syntax for CSS that is used in rules like
   * > `no-invalid-properties` to validate CSS code.
   * > While this works for most cases, there may be cases when you want to define your own
   * > extensions to CSS, and this can be done using the `customSyntax` language option.
   *
   * > The `customSyntax` option is an object that uses the `CSSTree` format for defining custom
   * > syntax, which allows you to specify at-rules, properties, and some types.
   *
   * If `tailwindcss` is installed, `extraSyntax` will contain the built-in Tailwind syntax that can
   * be used in a function to compose the final syntax.
   * From the docs:
   * > Note: The Tailwind syntax doesn't currently provide for the `theme()` function.
   * > This is a limitation of `CSSTree` that we hope will be resolved soon.
   *
   * NOTE: function passed to `customSyntax` is not the same as
   * [function supported by `@eslint/css`](https://github.com/eslint/css#configuring-custom-syntax).
   * We don't support the latter because it is not cacheable, but that `defaultSyntax` parameter is
   * coming from `@eslint/css-tree/definition-syntax-data`, which you can use manually.
   *
   * NOTE: not applied to the `configScss` sub-config, which has an option of the same name.
   */
  customSyntax?: MaybeFn<
    CssCustomSyntax,
    [
      {
        /**
         * Default CSS syntax provided by `@eslint/css`, which in turn coming from
         * `@eslint/css-tree/definition-syntax-data`.
         */
        defaultSyntax: CssCustomSyntax;

        /**
         * Extra syntax provided by us.
         * Currently may only be TailwindCSS syntax coming from `tailwind-csstree` based on the
         * installed version of `tailwindcss` package.
         *
         * NOTE: it will already contain the merged default syntax, see
         * [implementation](https://github.com/humanwhocodes/tailwind-csstree/tree/907ea0a7e2820c1e29cf26f6f716da002cf0c6bc/src)
         * for details (`tailwindX.js` files specifically).
         */
        extraSyntax?: CssCustomSyntax;
      },
    ]
  >;

  /**
   * Will be merged with the default value.
   * @default {rem: true, em: true}
   */
  allowedFontUnits?: Partial<
    Record<(GetRuleOptions<'css', 'relative-font-units'>['allowUnits'] & {})[number], boolean>
  >;

  /**
   * CSS features that will be ignored by
   * [`css/use-baseline`](https://github.com/eslint/css/blob/HEAD/docs/rules/use-baseline.md).
   * Must be unique.
   */
  allowedFeatures?: {
    [
      K in keyof GetRuleOptions<'css', 'use-baseline'> as K extends `allow${infer T}`
        ? Uncapitalize<T>
        : never
    ]: GetRuleOptions<'css', 'use-baseline'>[K];
  };
}

export interface CssConfigResult {
  optionsResolved: CssEslintConfigOptions;
}

const DEFAULT_FILES = [GLOB_CSS];

/**
 * SCSS ships `@function`, and CSS is shipping an unrelated at-rule of the same name that is not
 * baseline yet
 */
const SCSS_ALLOWED_BASELINE_AT_RULES = ['function'] as const;

export default defineUnConfig<CssEslintConfigOptions, [], CssConfigResult>('css', {
  enabledBy: {packageAbsent: 'stylelint'},
})(async (context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    tolerantMode: false,
    configScss: SASS_PACKAGES.some((packageName) => context.packagesInfo[packageName] != null),
  });
  // Must be resolved because other configs (`betterTailwind`) read these patterns
  optionsResolved.files = resolveFilesOption(optionsResolved.files, DEFAULT_FILES);

  const {tolerantMode, customSyntax, allowedFontUnits, allowedFeatures, configScss} =
    optionsResolved;

  const tailwindPackageInfo = context.packagesInfo.tailwindcss;
  const tailwindMajorVersion = tailwindPackageInfo?.versions.major;

  const cssLanguageOptions =
    tailwindPackageInfo && (tailwindMajorVersion === 3 || tailwindMajorVersion === 4)
      ? generatePackageToLoadProperty(
          'customSyntax',
          ['tailwindCsstree', 'eslintCssTreeSyntax', '_utils'],
          {
            valueTransformFn: {
              fn(
                this: {
                  tailwindMajorVersion: typeof tailwindMajorVersion;
                  customSyntax: typeof customSyntax;
                },
                {tailwindCsstree, eslintCssTreeSyntax: defaultSyntax, _utils: utils},
              ) {
                const tailwindSyntaxFn = tailwindCsstree[`tailwind${this.tailwindMajorVersion}`];
                const tailwindSyntax = tailwindSyntaxFn(
                  // @ts-expect-error This is fine - the type is too strict. In real code, only `types` property is expected to exists which already does (see `tailwindX.js` files at https://github.com/humanwhocodes/tailwind-csstree/tree/907ea0a7e2820c1e29cf26f6f716da002cf0c6bc/src)
                  defaultSyntax,
                );
                return utils.maybeCall(this.customSyntax || tailwindSyntax, {
                  defaultSyntax,
                  extraSyntax: tailwindSyntax,
                });
              },
              scope: {tailwindMajorVersion, customSyntax},
            },
          },
        )
      : customSyntax != null && {
          customSyntax:
            typeof customSyntax === 'function'
              ? customSyntax({
                  defaultSyntax:
                    (await packagesLoaders
                      .eslintCssTreeSyntax(context)
                      .then(({module}) => module)) || {},
                })
              : customSyntax,
        };

  const scssCustomSyntax = typeof configScss === 'object' ? configScss.customSyntax : undefined;
  const scssLanguageOptions = generatePackageToLoadProperty(
    'customSyntax',
    ['scsstree', 'eslintCssTreeSyntax', '_utils'],
    {
      valueTransformFn: {
        fn(
          this: {customSyntax: typeof scssCustomSyntax},
          {scsstree, eslintCssTreeSyntax: defaultSyntax, _utils: utils},
        ) {
          const scssSyntax = scsstree.scss(
            // @ts-expect-error This is fine - the type is too strict. The extension is written to also accept the CSS definition data alone, which is exactly what `@eslint/css` passes it (see https://github.com/humanwhocodes/scsstree/blob/scsstree-v0.1.1/src/scss.js)
            defaultSyntax,
          );
          return utils.maybeCall(this.customSyntax || scssSyntax, {
            defaultSyntax,
            extraSyntax: scssSyntax,
          });
        },
        scope: {customSyntax: scssCustomSyntax},
      },
    },
  );

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)

  (
    [
      ['css', optionsResolved],
      ['css/scss', configScss],
    ] as const
  ).forEach(([configName, options]) => {
    const configBuilder = context.createConfigBuilder(options, 'css');

    const isScss = configName.endsWith('/scss');

    configBuilder
      ?.addConfig(
        [
          configName,
          {
            ...(isScss && {filesDefault: [GLOB_SCSS]}),
            parseWith: 'css',
          },
        ],
        {
          languageOptions: {
            ...(tolerantMode && {
              tolerant: true,
            }),

            ...(isScss ? scssLanguageOptions : cssLanguageOptions),
          },
        },
      )
      // Cannot see through SCSS variables and functions, which is how font stacks are stored
      .addRule('font-family-fallbacks', isScss ? OFF : WARNING) /** @since 0.11.0 */ // 🟢
      .addRule('no-duplicate-imports', ERROR) /** @since 0.1.0 */ // 🟢
      .addRule('no-duplicate-keyframe-selectors', ERROR) /** @since 0.11.0 */ // 🟢
      .addRule('no-empty-blocks', ERROR) /** @since 0.1.0 */ // 🟢
      .addRule('no-important', WARNING) /** @since 0.8.0 */ // 🟢
      // SCSS requires `@import` to come after `@use` and `@forward`
      .addRule('no-invalid-at-rule-placement', isScss ? OFF : ERROR) /** @since 0.10.0 */ // 🟢
      // Declarations inside SCSS block at-rules (`@mixin`, `@include`, `@if`, `@each`, ...) are
      // validated as descriptors of those at-rules, which rejects any multi-token value
      .addRule('no-invalid-at-rules', isScss ? OFF : ERROR) /** @since 0.1.0 */ // 🟢
      .addRule('no-invalid-named-grid-areas', ERROR) /** @since 0.10.0 */ // 🟢
      // Interpolated property names and plain (non-namespaced) SCSS function calls are only known
      // after Sass compiles them
      .addRule(
        'no-invalid-properties',
        isScss ? OFF : ERROR,
        isScss ? undefined : [{allowUnknownVariables: true /** @since 0.10.0 */}],
      ) /** @since 0.1.0 */ // 🟢
      .addRule('no-unmatchable-selectors', ERROR) /** @since 0.14.0 */ // 🟢
      .addRule('prefer-logical-properties', OFF) /** @since 0.5.0 */
      .addRule('relative-font-units', ERROR, [
        {
          allowUnits: getKeysOfTruthyValues({
            rem: true,
            em: true,
            ...allowedFontUnits,
          }),
        },
      ]) /** @since 0.9.0 */
      // We're keeping `warn` severity, see the discussion in this issue and specifically this comment https://github.com/eslint/css/issues/80#issuecomment-2787414430
      .addRule('selector-complexity', OFF) /** @since 0.13.0 */
      .addRule('use-baseline', WARNING, [
        {
          ...((isScss || allowedFeatures?.atRules?.length) && {
            allowAtRules: [
              ...(isScss ? SCSS_ALLOWED_BASELINE_AT_RULES : []),
              ...(allowedFeatures?.atRules || []),
            ],
          }),
          ...(allowedFeatures?.properties?.length && {allowProperties: allowedFeatures.properties}),
          ...(allowedFeatures?.selectors?.length && {allowSelectors: allowedFeatures.selectors}),
        },
      ]) /** @since 0.3.0 */ /** @aka require-baseline */ // 🟡
      .addRule('use-layers', OFF) /** @since 0.3.0 */
      .enableConfigTesterForPlugin('css')
      .addOverrides();
  });

  return {
    optionsResolved,
  };
});

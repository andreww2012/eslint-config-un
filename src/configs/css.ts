import type {CSSLanguageOptions} from '@eslint/css';
import {ERROR, GLOB_CSS, OFF, WARNING} from '../constants';
import {generatePackageToLoadProperty, packagesLoaders} from '../loaders';
import {type MaybeFn, getKeysOfTruthyValues, maybeCall} from '../utils';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

type CssCustomSyntax = Extract<CSSLanguageOptions['customSyntax'], Record<string, unknown>>;

export interface CssEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'css'> {
  /**
   * From `@eslint/css` plugin docs:
   * > By default, the CSS parser runs in strict mode, which reports all parsing errors. If you'd like to allow recoverable parsing errors (those that the browser automatically fixes on its own), you can set the `tolerant` option to `true`.
   *
   * > Setting `tolerant` to `true` is necessary if you are using custom syntax, such as PostCSS plugins, that aren't part of the standard CSS syntax.
   * @default false
   */
  tolerantMode?: CSSLanguageOptions['tolerant'];

  /**
   * From `@eslint/css` plugin docs:
   * > The CSS lexer comes prebuilt with a set of known syntax for CSS that is used in rules like `no-invalid-properties` to validate CSS code. While this works for most cases, there may be cases when you want to define your own extensions to CSS, and this can be done using the `customSyntax` language option.
   *
   * > The `customSyntax` option is an object that uses the `CSSTree` format for defining custom syntax, which allows you to specify at-rules, properties, and some types.
   *
   * If `tailwindcss` is installed, `extraSyntax` will contain the built-in Tailwind syntax
   * that can be used in a function to compose the final syntax. From the docs:
   * > Note: The Tailwind syntax doesn't currently provide for the `theme()` function. This is a limitation of `CSSTree` that we hope will be resolved soon.
   *
   * NOTE: function passed to `customSyntax` is not the same as
   * [function supported by `@eslint/css`](https://github.com/eslint/css#configuring-custom-syntax).
   * We don't support the latter because it is not cacheable, but that `defaultSyntax` parameter
   * is coming from `@eslint/css-tree/definition-syntax-data`, which you can use manually.
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
         * [implementation](https://github.com/humanwhocodes/tailwind-csstree/tree/907ea0a7e2820c1e29cf26f6f716da002cf0c6bc/src) for details (`tailwindX.js` files specifically).
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
   * [`use-baseline`](https://github.com/eslint/css/blob/HEAD/docs/rules/use-baseline.md).
   * Must be unique.
   */
  allowedFeatures?: {
    [K in keyof GetRuleOptions<'css', 'use-baseline'> as K extends `allow${infer T}`
      ? Uncapitalize<T>
      : never]: GetRuleOptions<'css', 'use-baseline'>[K];
  };
}

export default (async (context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    files: [GLOB_CSS], // Need to resolve `files` early
    tolerantMode: false,
  } satisfies CssEslintConfigOptions);

  const {tolerantMode, customSyntax, allowedFontUnits, allowedFeatures} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'css');

  const tailwindPackageInfo = context.packagesInfo.tailwindcss;
  const tailwindMajorVersion = tailwindPackageInfo?.versions.major;

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig(
      [
        'css',
        {
          includeDefaultFilesAndIgnores: true,
          language: ['css', 'css'],
        },
      ],
      {
        languageOptions: {
          ...(tolerantMode && {
            tolerant: true,
          }),

          ...(tailwindPackageInfo && (tailwindMajorVersion === 3 || tailwindMajorVersion === 4)
            ? generatePackageToLoadProperty(
                'customSyntax',
                ['tailwindCsstree', 'eslintCssTreeSyntax'],
                {
                  valueTransformFn: {
                    fn(
                      this: {
                        tailwindMajorVersion: typeof tailwindMajorVersion;
                        customSyntax: typeof customSyntax;
                      },
                      {tailwindCsstree, eslintCssTreeSyntax: defaultSyntax},
                    ) {
                      const tailwindSyntaxFn =
                        tailwindCsstree[`tailwind${this.tailwindMajorVersion}`];
                      const tailwindSyntax = tailwindSyntaxFn(
                        // @ts-expect-error This is fine - the type is too strict. In real code, only `types` property is expected to exists which already does (see `tailwindX.js` files at https://github.com/humanwhocodes/tailwind-csstree/tree/907ea0a7e2820c1e29cf26f6f716da002cf0c6bc/src)
                        defaultSyntax,
                      );
                      return maybeCall(this.customSyntax || tailwindSyntax, {
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
              }),
        },
      },
    )
    .addRule('font-family-fallbacks', WARNING) /** @since 0.11.0 */ // 🟢
    .addRule('no-duplicate-imports', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-duplicate-keyframe-selectors', ERROR) /** @since 0.11.0 */ // 🟢
    .addRule('no-empty-blocks', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-important', WARNING) /** @since 0.8.0 */ // 🟢
    .addRule('no-invalid-at-rule-placement', ERROR) /** @since 0.10.0 */ // 🟢
    .addRule('no-invalid-at-rules', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-invalid-named-grid-areas', ERROR) /** @since 0.10.0 */ // 🟢
    .addRule('no-invalid-properties', ERROR, [
      {
        allowUnknownVariables: true /** @since 0.10.0 */,
      },
    ]) /** @since 0.1.0 */ // 🟢
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
        ...(allowedFeatures?.atRules?.length && {allowAtRules: allowedFeatures.atRules}),
        ...(allowedFeatures?.properties?.length && {allowProperties: allowedFeatures.properties}),
        ...(allowedFeatures?.selectors?.length && {allowSelectors: allowedFeatures.selectors}),
      },
    ]) /** @since 0.3.0 */ /** @aka require-baseline */ // 🟡
    .addRule('use-layers', OFF) /** @since 0.3.0 */
    .enableConfigTesterForPlugin('css')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'css'>;

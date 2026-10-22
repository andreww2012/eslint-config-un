import type {CSSLanguageOptions} from '@eslint/css';
import type {BaselineFeatureId} from '../baseline.gen';
import {
  type CssCustomSyntax,
  type CssCustomSyntaxOption,
  generateTailwindCssSyntaxProperty,
} from '../config-un/css-syntax';
import {ERROR, GLOB_CSS, GLOB_SCSS, OFF, SASS_PACKAGES, WARNING} from '../constants';
import {generatePackageToLoadProperty, packagesLoaders} from '../loaders';
import {type MaybeFn, getKeysOfTruthyValues, isNonEmptyArray} from '../utils';
import {
  generateUseBaselineRuleOptions,
  isBaselineFeatureAvailable,
  resolveFilesOption,
} from './shared';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

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
    readonly [
      {
        /**
         * Default CSS syntax provided by [`@eslint/css`](https://npmx.dev/@eslint/css), which in
         * turn comes from the `/definition-syntax-data` entrypoint of this package.
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

interface UnicornSubConfigOptions<
  ExtraPlugins extends ExtraPluginsType,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'cssicorn'> {
  /**
   * Enforces a consistent order of properties:
   * - `concentric-css`: [Concentric CSS](https://github.com/brandon-rhodes/Concentric-CSS), from
   *   positioning through the box model to typography;
   * - `recess`: the order of
   *   [`stylelint-config-recess-order`](https://npmx.dev/stylelint-config-recess-order), also used
   *   by Bootstrap and Biome;
   * - `clean`: the order of
   *   [`stylelint-config-clean-order`](https://npmx.dev/stylelint-config-clean-order);
   * - `alphabetical`;
   * - an array of property names: the listed ones come first, in this order.
   *
   * `true` is the same as `concentric-css`, `false` disables the check.
   *
   * With `recess` and `clean`, properties missing from the list go last, and empty lines between
   * groups are not enforced.
   *
   * Affected rule:
   * - [`cssicorn/consistent-property-order`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/consistent-property-order.md)
   * @default true
   */
  propertyOrder?:
    | boolean
    | 'recess'
    | 'clean'
    | GetRuleOptions<'cssicorn', 'consistent-property-order'>['order'];

  /**
   * Custom properties to suggest in place of the literal values they hold, as a map from a
   * property name to its value, like `{'--brand-color': '#6750a4'}`.
   * The check is disabled while it's empty.
   *
   * Affected rule:
   * - [`cssicorn/prefer-existing-custom-properties`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/prefer-existing-custom-properties.md)
   */
  customProperties?: GetRuleOptions<
    'cssicorn',
    'prefer-existing-custom-properties'
  >['customProperties'];
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
   * CSS rules from the author of `eslint-plugin-unicorn`, some of which were part of it before
   * v77.0.0.
   *
   * 📁 Default `files`: inherited from the parent config
   *
   * 🧩 Main plugin: [`eslint-cssicorn`](https://npmx.dev/eslint-cssicorn)
   * ([docs](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/readme.md))
   * @default true
   */
  configUnicorn?: boolean | UnicornSubConfigOptions<ExtraPlugins>;

  /**
   * From `@eslint/css` plugin docs:
   * > By default, the CSS parser runs in strict mode, which reports all parsing errors.
   * > If you'd like to allow recoverable parsing errors (those that the browser automatically fixes
   * > on its own), you can set the `tolerant` option to `true`.
   *
   * > Setting `tolerant` to `true` is necessary if you are using custom syntax, such as PostCSS
   * > plugins, that aren't part of the standard CSS syntax.
   *
   * Also applied to the `scss` sub-config.
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
   * NOTE: not applied to the `scss` sub-config, which has an option of the same name.
   */
  customSyntax?: CssCustomSyntaxOption;

  /**
   * Will be merged with the default value.
   *
   * Affected rule:
   * - [`css/relative-font-units`](https://github.com/eslint/css/blob/HEAD/docs/rules/relative-font-units.md)
   * @default {rem: true, em: true}
   */
  allowedFontUnits?: Partial<
    Record<(GetRuleOptions<'css', 'relative-font-units'>['allowUnits'] & {})[number], boolean>
  >;

  /**
   * CSS features that will not be reported.
   * Must be unique.
   *
   * Affected rule:
   * - [`css/use-baseline`](https://github.com/eslint/css/blob/HEAD/docs/rules/use-baseline.md)
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

const DEFAULT_FILES = [GLOB_CSS] as const;

/**
 * SCSS ships `@function`, and CSS is shipping an unrelated at-rule of the same name that is not
 * baseline yet
 */
const SCSS_ALLOWED_BASELINE_AT_RULES = ['function'] as const;

// Leaves out the old IE `filter` hacks listed by Recess
const PROPERTY_NAME_REGEXP = /^[-a-z]+$/;

const loadStylelintPropertyOrder = async (name: 'recess' | 'clean') => {
  const groups =
    name === 'recess'
      ? (await import('stylelint-config-recess-order/groups')).default.map(
          ({properties}) => properties,
        )
      : (await import('stylelint-config-clean-order/property-groups')).propertyGroups;
  // The rule rejects duplicates
  const propertyNames = [...new Set(groups.flat())].filter((propertyName) =>
    PROPERTY_NAME_REGEXP.test(propertyName),
  );
  return isNonEmptyArray(propertyNames) && propertyNames;
};

export default defineUnConfig<CssEslintConfigOptions, readonly [], CssConfigResult>('css', {
  enabledBy: {packageAbsent: 'stylelint'},
})(async (context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    tolerantMode: false,
    configScss: SASS_PACKAGES.some((packageName) => context.packagesInfo[packageName] != null),
    configUnicorn: true,
  });
  // Must be resolved because other configs (`betterTailwind`) read these patterns
  optionsResolved.files = resolveFilesOption(optionsResolved.files, DEFAULT_FILES);

  const {tolerantMode, customSyntax, allowedFontUnits, allowedFeatures, configScss, configUnicorn} =
    optionsResolved;

  // Only the user's own options: the default syntax comes from the parsing entry
  const cssLanguageOptions = {
    ...(tolerantMode && {tolerant: true}),
    ...(customSyntax != null &&
      (generateTailwindCssSyntaxProperty(context, customSyntax) || {
        customSyntax:
          typeof customSyntax === 'function'
            ? customSyntax({
                defaultSyntax:
                  (await packagesLoaders.eslintCssTreeSyntax(context).then(({module}) => module)) ||
                  {},
              })
            : customSyntax,
      })),
  };

  const scssFiles = configScss
    ? resolveFilesOption(typeof configScss === 'object' ? configScss.files : undefined, [GLOB_SCSS])
    : [];

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

  // SCSS is parsed by the CSS language, so its syntax can only be applied on top of the CSS one
  if (scssFiles.length > 0) {
    context.requestParsing('css', {
      kind: 'setUpOnly',
      nameSuffix: 'scss',
      files: scssFiles,
      languageOptions: {
        ...(tolerantMode && {tolerant: true}),
        ...scssLanguageOptions,
      },
    });
  }

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)

  (
    [
      ['', optionsResolved],
      ['scss', configScss],
    ] as const
  ).forEach(([configPostfix, options]) => {
    const configBuilder = context.createConfigBuilder(options, 'css');

    const isScss = configPostfix === 'scss';

    configBuilder
      ?.addConfig([
        ['css', configPostfix].filter(Boolean).join('/'),
        {
          ...(isScss && {filesDefault: [GLOB_SCSS]}),
          parseWith: 'css',
          ...(!isScss && {parseWithLanguageOptions: cssLanguageOptions}),
        },
      ])
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
          ...generateUseBaselineRuleOptions(context),
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

  // Legend:
  // 🔴 - NOT in recommended & unopinionated
  // 🟣 - NOT in unopinionated

  const {propertyOrder, customProperties = {}} = assignDefaults(configUnicorn, {
    propertyOrder: true,
  });
  const propertyOrderResolved =
    propertyOrder === 'recess' || propertyOrder === 'clean'
      ? await loadStylelintPropertyOrder(propertyOrder)
      : propertyOrder === true
        ? 'concentric-css'
        : propertyOrder;

  const errorIfBaselineAvailable = (featureId: BaselineFeatureId) =>
    isBaselineFeatureAvailable(context, featureId) ? ERROR : OFF;

  const hasCustomProperties = Object.keys(customProperties).length > 0;

  const configBuilderUnicorn = context.createConfigBuilder(configUnicorn, 'cssicorn');
  configBuilderUnicorn
    ?.addConfig([
      'css/unicorn',
      {
        filesDefault: optionsResolved.files,
        parseWith: 'css',
      },
    ])
    .addRule('consistent-compound-selector-order', ERROR) /** @since 0.2.0 */ // 🟣
    .addRule('consistent-layer-order', ERROR) /** @since 0.2.0 */ // 🟣
    .addRule(
      'consistent-property-order',
      propertyOrderResolved === false ? OFF : ERROR,
      propertyOrderResolved === false ? [] : [{order: propertyOrderResolved}],
    ) /** @since 0.2.0 */ // 🔴
    .addRule('consistent-value-order', ERROR) /** @since 0.2.0 */ // 🟣
    .addRule('lowercase', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('no-clamped-values', ERROR) /** @since 0.2.0 */ // 🟣
    .addRule('no-declarations-after-nested-rules', ERROR) /** @since 0.1.0 */
    .addRule('no-deprecated-features', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('no-descending-specificity', OFF) /** @since 0.1.0 */ // 🔴
    .addRule('no-disabled-pinch-zoom', ERROR) /** @since 0.2.0 */ // 🟣
    .addRule('no-duplicate-at-rule-definitions', ERROR) /** @since 0.2.0 */ // 🟣
    .addRule('no-duplicate-font-family-names', ERROR) /** @since 0.1.0 */
    .addRule('no-duplicate-properties', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('no-duplicate-selectors', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('no-ineffective-keyframe-declarations', ERROR) /** @since 0.2.0 */
    .addRule('no-ineffective-overrides', ERROR) /** @since 0.2.0 */ // 🟣
    .addRule('no-ineffective-properties', ERROR) /** @since 0.2.0 */
    .addRule('no-ineffective-selector-properties', ERROR) /** @since 0.2.0 */
    .addRule('no-ineffective-supports-conditions', ERROR) /** @since 0.2.0 */ // 🟣
    .addRule('no-ineffective-transitions', ERROR) /** @since 0.2.0 */
    .addRule('no-invalid-media-features', ERROR) /** @since 0.1.0 */
    .addRule('no-invalid-property-references', ERROR) /** @since 0.2.0 */
    .addRule('no-layout-animations', OFF) /** @since 0.2.0 */ // 🔴
    .addRule('no-nesting-with-mixed-specificity', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('no-overflow-axis-coercion', ERROR) /** @since 0.2.0 */
    .addRule('no-redundant-functions', ERROR) /** @since 0.2.0 */ // 🟣
    .addRule('no-redundant-longhand-properties', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('no-redundant-nested-style-rules', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('no-redundant-nesting-selector', ERROR) /** @since 0.2.0 */ // 🟣
    .addRule('no-redundant-shorthand-values', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('no-self-referencing-custom-properties', ERROR) /** @since 0.1.0 */
    // Keyframes are often defined in another stylesheet
    .addRule('no-unknown-animations', OFF) /** @since 0.1.0 */ // 🔴
    .addRule('no-unknown-annotations', ERROR) /** @since 0.1.0 */
    .addRule('no-unknown-pseudo-selectors', ERROR) /** @since 0.1.0 */
    .addRule('no-unscoped-nesting-selector', ERROR) /** @since 0.1.0 */
    .addRule('no-useless-is', ERROR) /** @since 0.2.0 */
    .addRule('no-zero-length-unit', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('prefer-aspect-ratio', errorIfBaselineAvailable('aspect-ratio')) /** @since 0.2.0 */ // 🟣
    .addRule('prefer-clamp', errorIfBaselineAvailable('min-max-clamp')) /** @since 0.2.0 */
    .addRule('prefer-current-color', ERROR) /** @since 0.2.0 */ // 🟣
    .addRule(
      'prefer-existing-custom-properties',
      hasCustomProperties ? WARNING : OFF,
      hasCustomProperties ? [{customProperties}] : [],
    ) /** @since 0.2.0 */ // 🟣
    .addRule(
      'prefer-explicit-viewport-units',
      errorIfBaselineAvailable('viewport-unit-variants'),
    ) /** @since 0.1.0 */ // 🟣
    .addRule(
      'prefer-individual-transform-properties',
      errorIfBaselineAvailable('individual-transforms'),
    ) /** @since 0.2.0 */ // 🟣
    .addRule('prefer-light-dark', errorIfBaselineAvailable('light-dark')) /** @since 0.2.0 */ // 🟣
    .addRule(
      'prefer-media-feature-range-syntax',
      errorIfBaselineAvailable('media-query-range-syntax'),
    ) /** @since 0.1.0 */ // 🟣
    .addRule('prefer-merged-rules', ERROR) /** @since 0.2.0 */ // 🟣
    .addRule('prefer-modern-syntax', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('prefer-nesting', errorIfBaselineAvailable('nesting')) /** @since 0.2.0 */ // 🟣
    .addRule(
      'prefer-relative-colors',
      errorIfBaselineAvailable('relative-color'),
    ) /** @since 0.2.0 */ // 🟣
    .addRule('prefer-short-hex-color', OFF) /** @since 0.1.0 */ // 🟣
    .addRule('require-prefers-reduced-motion', OFF) /** @since 0.2.0 */ // 🔴
    .addRule('require-property-descriptors', ERROR) /** @since 0.1.0 */
    .addRule('require-selector-scope', OFF) /** @since 0.2.0 */ // 🔴
    .enableConfigTesterForPlugin('cssicorn')
    .addOverrides();

  return {
    optionsResolved,
  };
});

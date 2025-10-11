import type {CSSLanguageOptions} from '@eslint/css';
import {ERROR, GLOB_CSS, OFF, WARNING} from '../constants';
import {type GetRuleOptions, type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults, getKeysOfTruthyValues, interopDefault} from '../utils';
import type {UnConfigFn} from './index';

export interface CssEslintConfigOptions extends UnConfigOptions<'css'> {
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
   * If `tailwindcss` is installed, user provided `customSyntax` will be merged
   * with the built-in Tailwind syntax. From the docs:
   * > Note: The Tailwind syntax doesn't currently provide for the `theme()` function. This is a limitation of `CSSTree` that we hope will be resolved soon.
   */
  customSyntax?: CSSLanguageOptions['customSyntax'];

  /**
   * Will be merged with the default value.
   * @default {rem: true, em: true}
   */
  allowedFontUnits?: Partial<
    Record<(GetRuleOptions<'css', 'relative-font-units'>[0]['allowUnits'] & {})[number], boolean>
  >;

  /**
   * CSS features that will be ignored by
   * [`use-baseline`](https://github.com/eslint/css/blob/HEAD/docs/rules/use-baseline.md).
   * Must be unique.
   */
  allowedFeatures?: {
    [K in keyof GetRuleOptions<'css', 'use-baseline'>[0] as K extends `allow${infer T}`
      ? Uncapitalize<T>
      : never]: GetRuleOptions<'css', 'use-baseline'>[0][K];
  };
}

export const cssUnConfig: UnConfigFn<'css'> = async (context) => {
  // TODO only load when necessary?
  const {tailwind3: tailwind3Syntax, tailwind4: tailwind4Syntax} = await interopDefault(
    import('tailwind-csstree'),
  );

  const optionsRaw = context.rootOptions.configs?.css;
  const optionsResolved = assignDefaults(optionsRaw, {
    tolerantMode: false,
  } satisfies CssEslintConfigOptions);

  const {tolerantMode, customSyntax, allowedFontUnits, allowedFeatures} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'css');

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
          filesFallback: [GLOB_CSS],
          doNotIgnoreCss: true,
        },
      ],
      {
        language: 'css/css',
        languageOptions: {
          ...(tolerantMode && {tolerant: true}),
          customSyntax: {
            ...(tailwindPackageInfo &&
              (tailwindMajorVersion === 4
                ? tailwind4Syntax
                : tailwindMajorVersion === 3
                  ? tailwind3Syntax
                  : null)),
            ...customSyntax,
          },
        },
      },
    )
    .addRule('font-family-fallbacks', WARNING) // 🟢 >= 0.11.0
    .addRule('no-duplicate-keyframe-selectors', ERROR) // 🟢 >= 0.11.0
    .addRule('no-duplicate-imports', ERROR) // 🟢
    .addRule('no-empty-blocks', ERROR) // 🟢
    .addRule('no-important', WARNING) // 🟢 >=0.8.0
    .addRule('no-invalid-at-rules', ERROR) // 🟢
    .addRule('no-invalid-at-rule-placement', ERROR) // 🟢 >=0.10.0
    .addRule('no-invalid-named-grid-areas', ERROR) // 🟢 >=0.10.0
    .addRule('no-invalid-properties', ERROR, [
      {
        allowUnknownVariables: true, // >=0.10.0
      },
    ]) // 🟢
    .addRule('relative-font-units', ERROR, [
      {
        allowUnits: getKeysOfTruthyValues({
          rem: true,
          em: true,
          ...allowedFontUnits,
        }),
      },
    ]) // >=0.9.0
    .addRule('prefer-logical-properties', OFF) // >=0.5.0
    // We're keeping `warn` severity, see the discussion in this issue and specifically this comment https://github.com/eslint/css/issues/80#issuecomment-2787414430
    .addRule('selector-complexity', OFF) // >=0.13.0
    .addRule('use-baseline', WARNING, [
      {
        ...(allowedFeatures?.atRules?.length && {allowAtRules: allowedFeatures.atRules}),
        ...(allowedFeatures?.properties?.length && {allowProperties: allowedFeatures.properties}),
        ...(allowedFeatures?.selectors?.length && {allowSelectors: allowedFeatures.selectors}),
      },
    ]) // 🟡
    .addRule('use-layers', OFF)
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

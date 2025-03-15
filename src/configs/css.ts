import eslintPluginCss, {type CSSLanguageOptions} from '@eslint/css';
import {tailwindSyntax} from '@eslint/css/syntax';
import {GLOB_CSS} from '../constants';
import {ConfigEntryBuilder, type ConfigSharedOptions, type FlatConfigEntry} from '../eslint';
import type {InternalConfigOptions} from './index';

export interface CssEslintConfigOptions extends ConfigSharedOptions<'css'> {
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
}

export const cssEslintConfig = (
  options: CssEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const {isTailwindEnabled} = internalOptions;
  const {tolerantMode = false, customSyntax} = options;

  const builder = new ConfigEntryBuilder('css', options, internalOptions);

  // Legend:
  // 🟢 - in Recommended

  builder
    .addConfig(
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
            ...(isTailwindEnabled && tailwindSyntax),
            ...customSyntax,
          },
        },
      },
    )
    .addBulkRules(eslintPluginCss.configs.recommended.rules)
    // .addRule('no-duplicate-imports', ERROR) // 🟢
    // .addRule('no-empty-blocks', ERROR) // 🟢
    // .addRule('no-invalid-at-rules', ERROR) // 🟢
    // .addRule('no-invalid-properties', ERROR) // 🟢
    // .addRule('prefer-logical-properties', OFF) // >=0.5.0
    // .addRule('require-baseline', ERROR) // 🟢
    // .addRule('use-layers', OFF)
    .addOverrides();

  return builder.getAllConfigs();
};

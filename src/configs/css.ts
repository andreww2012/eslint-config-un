import type {CSSLanguageOptions} from '@eslint/css';
import {ERROR, GLOB_CSS, OFF, WARNING} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults, interopDefault} from '../utils';
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
}

export const cssUnConfig: UnConfigFn<'css'> = async (context) => {
  const {tailwindSyntax} = await interopDefault(import('@eslint/css/syntax'));

  const optionsRaw = context.rootOptions.configs?.css;
  const optionsResolved = assignDefaults(optionsRaw, {
    tolerantMode: false,
  } satisfies CssEslintConfigOptions);

  const {tolerantMode, customSyntax} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'css');

  const isTailwindEnabled = context.configsMeta.tailwind.enabled;

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
            ...(isTailwindEnabled && tailwindSyntax),
            ...customSyntax,
          },
        },
      },
    )
    .addRule('no-duplicate-imports', ERROR) // 🟢
    .addRule('no-empty-blocks', ERROR) // 🟢
    .addRule('no-invalid-at-rules', ERROR) // 🟢
    .addRule('no-invalid-properties', ERROR) // 🟢
    .addRule('prefer-logical-properties', OFF) // >=0.5.0
    // We're keeping `warn` severity, see the discussion in this issue and specifically this comment https://github.com/eslint/css/issues/80#issuecomment-2787414430
    .addRule('use-baseline', WARNING) // 🟡
    .addRule('use-layers', OFF)
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

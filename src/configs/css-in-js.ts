import eslintPluginCss from 'eslint-plugin-css';
import {ERROR} from '../constants';
import {
  ConfigEntryBuilder,
  type ConfigSharedOptions,
  type FlatConfigEntry,
  type GetRuleOptions,
} from '../eslint';
import type {InternalConfigOptions} from './index';

export interface CssInJsEslintConfigOptions extends ConfigSharedOptions<'css-in-js'> {
  /**
   * [`eslint-plugin-css` plugin settings](https://ota-meshi.github.io/eslint-plugin-css/settings/) that will be applied to the specified `files` and `ignores`.
   */
  settings?: {
    /**
     * Specifies the attribute name or pattern that uses the style object.
     * @see https://ota-meshi.github.io/eslint-plugin-css/settings/#target-attributes
     */
    attributes?: string[];

    /**
     * Specifies the function paths that uses the style object.
     * @see https://ota-meshi.github.io/eslint-plugin-css/settings/#target-definefunctions
     */
    defineFunctions?: Record<string, string[]>;
  };

  /**
   * `long` is `#RRGGBB(AA)`, short is `#RGB(A)`
   * @default 'long'
   */
  hexColorsStyle?: 'long' | 'short';

  /**
   * Whether to prefer named colors over their hex equivalents (`red` over `#ff0000`) or vice versa.
   *
   * You can also specify property patterns (regexp) that won't be checked.
   * @default false
   */
  preferNamedColors?: boolean | {flag: boolean; ignoreProperties?: [string, ...string[]]};

  /**
   * Prefer `.5` over `0.5`
   * @default false
   */
  avoidLeadingZero?: boolean;

  /**
   * Enforce `backgroundColor` or `background-color`
   * @default 'camelCase'
   */
  propertyCasing?: GetRuleOptions<'css-in-js/property-casing'>[0];
}

export const cssInJsEslintConfig = (
  options: CssInJsEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const {
    settings: pluginSettings,
    hexColorsStyle = 'long',
    preferNamedColors: preferNamedColorsRaw,
    avoidLeadingZero = false,
    propertyCasing = 'camelCase',
  } = options;

  const preferNamedColors =
    typeof preferNamedColorsRaw === 'object'
      ? preferNamedColorsRaw
      : {flag: preferNamedColorsRaw ?? false};

  const builder = new ConfigEntryBuilder<'css-in-js'>(options, internalOptions);

  // Legend:
  // 🟢 - in Recommended and Standard
  // 🟣 - in Standard

  builder.addConfig('css-in-js/setup', {
    plugins: {
      // @ts-expect-error types mismatch
      'css-in-js': eslintPluginCss,
    },
  });

  builder
    .addConfig(['css-in-js', {includeDefaultFilesAndIgnores: true}], {
      ...(pluginSettings && {
        settings: {
          css: pluginSettings,
        },
      }),
    })
    .addRule('css-in-js/color-hex-style', ERROR, [hexColorsStyle === 'long' ? 'RRGGBB' : 'RGB']) // 🟣 >= 0.4.0
    .addRule('css-in-js/named-color', ERROR, [
      preferNamedColors.flag ? 'always' : 'never',
      {
        ...(preferNamedColors.ignoreProperties?.length && {
          ignoreProperties: preferNamedColors.ignoreProperties,
        }),
      },
    ]) // >= 0.4.0
    .addRule('css-in-js/no-dupe-properties', ERROR) // 🟢 >= 0.2.0
    .addRule('css-in-js/no-invalid-color-hex', ERROR) // 🟢 >= 0.2.0
    .addRule('css-in-js/no-length-zero-unit', ERROR) // 🟣 >= 0.1.0
    .addRule('css-in-js/no-number-trailing-zeros', ERROR) // 🟣 >= 0.3.0
    .addRule('css-in-js/no-shorthand-property-overrides', ERROR) // 🟢 >= 0.3.0
    .addRule('css-in-js/no-unknown-property', ERROR) // 🟢 >= 0.1.0
    .addRule('css-in-js/no-unknown-unit', ERROR) // 🟢 >= 0.2.0
    .addRule('css-in-js/no-useless-color-alpha', ERROR) // 🟢 >= 0.4.0
    .addRule('css-in-js/number-leading-zero', ERROR, [avoidLeadingZero ? 'never' : 'always']) // 🟣 >= 0.3.0
    .addRule('css-in-js/prefer-reduce-shorthand-property-box-values', ERROR) // 🟣 >= 0.3.0
    .addRule('css-in-js/property-casing', ERROR, [propertyCasing]) // 🟣 >= 0.1.0
    .addOverrides();

  return builder.getAllConfigs();
};

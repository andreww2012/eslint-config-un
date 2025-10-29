import {ERROR} from '../constants';
import {type GetRuleOptions, type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface CssInJsEslintConfigOptions extends UnConfigOptions<'css-in-js'> {
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
  propertyCasing?: GetRuleOptions<'css-in-js', 'property-casing'>;
}

export const cssInJsUnConfig: UnConfigFn<'cssInJs'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.cssInJs;
  const optionsResolved = assignDefaults(optionsRaw, {
    hexColorsStyle: 'long',
    avoidLeadingZero: false,
    propertyCasing: 'camelCase',
  } satisfies CssInJsEslintConfigOptions);

  const {
    settings: pluginSettings,
    hexColorsStyle,
    preferNamedColors: preferNamedColorsRaw,
    avoidLeadingZero,
    propertyCasing,
  } = optionsResolved;

  const preferNamedColors =
    typeof preferNamedColorsRaw === 'object'
      ? preferNamedColorsRaw
      : {flag: preferNamedColorsRaw ?? false};

  const configBuilder = createConfigBuilder(context, optionsResolved, 'css-in-js');

  // Legend:
  // 🟢 - in recommended and standard
  // 🟣 - in standard

  configBuilder
    ?.addConfig(['css-in-js', {includeDefaultFilesAndIgnores: true}], {
      ...(pluginSettings && {
        settings: {
          css: pluginSettings,
        },
      }),
    })
    .addRule('color-hex-style', ERROR, [
      hexColorsStyle === 'long' ? 'RRGGBB' : 'RGB',
    ]) /** @since 0.4.0 */ // 🟣
    .addRule('named-color', ERROR, [
      preferNamedColors.flag ? 'always' : 'never',
      {
        ...(preferNamedColors.ignoreProperties?.length && {
          ignoreProperties: preferNamedColors.ignoreProperties,
        }),
      },
    ]) /** @since 0.4.0 */ //
    .addRule('no-dupe-properties', ERROR) /** @since 0.2.0 */ // 🟢
    .addRule('no-invalid-color-hex', ERROR) /** @since 0.2.0 */ // 🟢
    .addRule('no-length-zero-unit', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('no-number-trailing-zeros', ERROR) /** @since 0.3.0 */ // 🟣
    .addRule('no-shorthand-property-overrides', ERROR) /** @since 0.3.0 */ // 🟢
    .addRule('no-unknown-property', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-unknown-unit', ERROR) /** @since 0.2.0 */ // 🟢
    .addRule('no-useless-color-alpha', ERROR) /** @since 0.4.0 */ // 🟢
    .addRule('number-leading-zero', ERROR, [
      avoidLeadingZero ? 'never' : 'always',
    ]) /** @since 0.3.0 */ // 🟣
    .addRule('prefer-reduce-shorthand-property-box-values', ERROR) /** @since 0.3.0 */ // 🟣
    .addRule('property-casing', ERROR, [propertyCasing]) /** @since 0.1.0 */ // 🟣
    .enableConfigTesterForPlugin('css-in-js')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

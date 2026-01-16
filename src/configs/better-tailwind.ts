import {ERROR, OFF, WARNING} from '../constants';
import type {RequireExactlyOne} from '../types';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

type AnyRuleOptions = GetRuleOptions<'better-tailwindcss', 'enforce-shorthand-classes'>;

export interface BetterTailwindEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, 'better-tailwindcss'> {
  /**
   * [`eslint-plugin-better-tailwindcss`](https://npmjs.com/eslint-plugin-better-tailwindcss) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `better-tailwindcss` property and applied to the specified `files` and `ignores`.
   *
   * Note: you MUST specify either `entryPoint` (for Tailwind 4) or `tailwindConfig` (for Tailwind 3).
   */
  settings: RequireExactlyOne<{
    /**
     * [Tailwind 4 only] The path to the entry file of the css based Tailwind config
     */
    entryPoint?: string;

    /**
     * [Tailwind 3 only] The path to the Tailwind config file (e.g.: `tailwind.config.js`)
     */
    tailwindConfig?: string;
  }> & {
    /**
     * From plugin docs:
     * The path to the `tsconfig.json` file. If not specified, the plugin will try to find it automatically.
     */
    tsconfig?: string;

    /**
     * The name of the attribute that contains the tailwind classes.
     * @see https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/settings/settings.md#attributes
     */
    attributes?: AnyRuleOptions['attributes'];

    /**
     * List of function names which arguments should also get linted.
     * @see https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/settings/settings.md#callees
     */
    callees?: AnyRuleOptions['callees'];

    /**
     * List of variable names whose initializer should also get linted.
     * @see https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/settings/settings.md#variables
     */
    variables?: AnyRuleOptions['variables'];

    /**
     * List of template literal tag names whose content should get linted.
     * @see https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/settings/settings.md#tags
     */
    tags?: AnyRuleOptions['tags'];

    /**
     * The font size of the `<html>` element in pixels.
     * @see https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/settings/settings.md#rootfontsize
     */
    rootFontSize?: AnyRuleOptions['rootFontSize'];

    /**
     * Customize how linting messages are displayed.
     * @see https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/settings/settings.md#messagestyle
     */
    messageStyle?: AnyRuleOptions['messageStyle'];

    /**
     * [Custom component classes](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes)
     * that should not be reported as unknown.
     * @see https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/settings/settings.md#detectcomponentclasses
     */
    detectComponentClasses?: AnyRuleOptions['detectComponentClasses'];
  };

  /**
   * Not enforced by default
   */
  breakUpClassesIntoMultipleLines?: GetRuleOptions<
    'better-tailwindcss',
    'enforce-consistent-line-wrapping'
  >;

  /**
   * Enforces consistent Tailwind class order. `false` disables the corresponding rule.
   *
   * Affected rules:
   * - [`enforce-consistent-class-order`](https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/rules/enforce-consistent-class-order.md)
   * @default 'official'
   */
  classOrder?:
    | GetRuleOptions<'better-tailwindcss', 'enforce-consistent-class-order'>['order']
    | false;

  restrictedClasses?: string[];
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    classOrder: 'official',
  } satisfies Partial<BetterTailwindEslintConfigOptions>);

  const {
    settings: pluginSettings,
    breakUpClassesIntoMultipleLines,
    classOrder,
    restrictedClasses,
  } = optionsResolved;

  const tailwindPackageInfo = context.packagesInfo.tailwindcss;
  const tailwindRealMajorVersion = tailwindPackageInfo?.versions.major;
  const tailwindMajorVersion = tailwindRealMajorVersion === 3 ? 3 : 4;

  if (tailwindRealMajorVersion === 4 && !pluginSettings.entryPoint) {
    context.logger.warn(
      "[betterTailwind] You haven't specified `settings.entryPoint` option which is required for `eslint-plugin-better-tailwindcss` to work properly with Tailwind 4",
    );
  }
  if (
    tailwindRealMajorVersion != null &&
    (tailwindRealMajorVersion < 3 || tailwindRealMajorVersion > 4)
  ) {
    context.logger.warn(
      '[betterTailwind] The detected Tailwind version is not supported by `eslint-plugin-better-tailwindcss`',
    );
  }

  const configBuilder = context.createConfigBuilder(optionsResolved, 'better-tailwindcss');

  // Legend:
  // 🟢 - in recommended
  // 4️⃣ - only Tailwind 4

  configBuilder
    ?.addConfig(['better-tailwindcss', {includeDefaultFilesAndIgnores: true}], {
      settings: {
        'better-tailwindcss': pluginSettings,
      },
    })
    .markCategory('Stylistic rules')
    .addRule(
      'enforce-canonical-classes',
      tailwindMajorVersion === 3 ? OFF : ERROR,
    ) /** @since 4.0.0 */ // 🟢
    .addRule(
      'enforce-consistent-class-order',
      typeof classOrder === 'string' ? WARNING : OFF,
      typeof classOrder === 'string' ? [{order: classOrder}] : [],
    ) /** @since 3.0.0 */ /** @aka sort-classes */ // 🟢
    .addRule('enforce-consistent-important-position', tailwindMajorVersion === 3 ? ERROR : OFF, [
      {position: 'legacy'},
    ]) /** @since 3.6.0 */
    .addRule(
      'enforce-consistent-line-wrapping',
      breakUpClassesIntoMultipleLines ? WARNING : OFF,
      breakUpClassesIntoMultipleLines ? [breakUpClassesIntoMultipleLines] : [],
    ) /** @since 3.0.0 */ /** @aka multiline */ // 🟢
    .addRule(
      'enforce-consistent-variable-syntax',
      // Do not enable in v3 because it doesn't support `parentheses` syntax (`bg-(--primary)`)
      OFF,
    ) /** @since 3.1.0 */
    .addRule(
      'enforce-shorthand-classes',
      tailwindMajorVersion === 3 ? ERROR : OFF,
    ) /** @since 3.5.0 */
    .addRule('no-deprecated-classes', WARNING) /** @since 3.6.0 */
    .addRule('no-duplicate-classes', WARNING) /** @since 3.0.0 */ // 🟢
    .addRule('no-unnecessary-whitespace', WARNING) /** @since 3.0.0 */ // 🟢
    .markCategory('Correctness rules')
    .addRule('no-conflicting-classes', ERROR) /** @since 3.0.0 */ // 🟢
    .addRule(
      'no-restricted-classes',
      restrictedClasses?.length ? ERROR : OFF,
      restrictedClasses?.length ? [{restrict: restrictedClasses}] : [],
    ) /** @since 3.0.0 */ // 4️⃣
    .addRule('no-unknown-classes', OFF) /** @since 3.0.0 */ /** @aka no-unregistered-classes */ // 🟢
    .enableConfigTesterForPlugin('better-tailwindcss')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'betterTailwind'>;

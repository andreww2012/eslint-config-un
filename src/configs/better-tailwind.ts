import type {
  Attributes as BetterTailwindcssAttributes,
  Callees as BetterTailwindcssCallees,
  Tags as BetterTailwindcssTags,
  Variables as BetterTailwindcssVariables,
} from 'eslint-plugin-better-tailwindcss/api/types';
import {ERROR, OFF, WARNING} from '../constants';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

export interface BetterTailwindEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends UnConfigOptions<ExtraPlugins, 'better-tailwindcss'> {
  /**
   * [`eslint-plugin-better-tailwindcss`](https://npmjs.com/eslint-plugin-better-tailwindcss) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `better-tailwindcss` property and applied to the specified `files` and `ignores`.
   */
  settings?: {
    /**
     * [Tailwind 4 only] The path to the entry file of the css based Tailwind config
     */
    entryPoint?: string;

    /**
     * [Tailwind 3 only] The path to the Tailwind config file (e.g.: `tailwind.config.js`)
     */
    tailwindConfig?: string;

    /**
     * From plugin docs:
     * The path to the `tsconfig.json` file. If not specified, the plugin will try to find it automatically.
     */
    tsconfig?: string;

    /**
     * The name of the attribute that contains the tailwind classes.
     * @see https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/settings/settings.md#attributes
     */
    attributes?: BetterTailwindcssAttributes;

    /**
     * List of function names which arguments should also get linted.
     * @see https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/settings/settings.md#callees
     */
    callees?: BetterTailwindcssCallees;

    /**
     * List of variable names whose initializer should also get linted.
     * @see https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/settings/settings.md#variables
     */
    variables?: BetterTailwindcssVariables;

    /**
     * List of template literal tag names whose content should get linted.
     * @see https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/settings/settings.md#tags
     */
    tags?: BetterTailwindcssTags;
  };

  /**
   * Not enforced by default
   */
  breakUpClassesIntoMultipleLines?: GetRuleOptions<'better-tailwindcss', 'multiline'>;

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

  if (tailwindRealMajorVersion === 4 && !pluginSettings?.entryPoint) {
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
      ...(pluginSettings && {
        settings: {
          'better-tailwindcss': pluginSettings,
        },
      }),
    })
    .markCategory('Stylistic rules')
    .addRule(
      'enforce-consistent-class-order',
      typeof classOrder === 'string' ? WARNING : OFF,
      typeof classOrder === 'string' ? [{order: classOrder}] : [],
    ) /** @since 3.0.0 */ /** @aka sort-classes */ // 🟢
    .addRule('enforce-consistent-important-position', ERROR, [
      {position: tailwindMajorVersion === 3 ? 'legacy' : 'recommended'},
    ]) /** @since 3.6.0 */
    .addRule(
      'enforce-consistent-line-wrapping',
      breakUpClassesIntoMultipleLines ? WARNING : OFF,
      breakUpClassesIntoMultipleLines ? [breakUpClassesIntoMultipleLines] : [],
    ) /** @since 3.0.0 */ /** @aka multiline */ // 🟢
    .addRule(
      'enforce-consistent-variable-syntax',
      // v3 doesn't support `parentheses` syntax (`bg-(--primary)`) so there's nothing to enforce
      tailwindMajorVersion === 3 ? OFF : WARNING,
    ) /** @since 3.1.0 */
    .addRule('enforce-shorthand-classes', ERROR, []) /** @since 3.5.0 */
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
    .addRule('no-unregistered-classes', OFF) /** @since 3.0.0 */ // 🟢
    .enableConfigTesterForPlugin('better-tailwindcss')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'betterTailwind'>;

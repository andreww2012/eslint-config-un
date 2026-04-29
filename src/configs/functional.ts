import type {Immutability, TypeSpecifier} from 'is-immutable-type';
import {ERROR, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

interface OverridesSetting {
  type: TypeSpecifier;
  to: Immutability | keyof typeof Immutability;
  from?: Immutability | keyof typeof Immutability;
}

export interface FunctionalEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'functional'> {
  /**
   * [`eslint-plugin-functional`](https://npmx.dev/eslint-plugin-functional) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `immutability` property
   * and applied to the resolved `files` and `ignores` of this config.
   * @see https://github.com/eslint-functional/eslint-plugin-functional/blob/HEAD/docs/rules/settings
   */
  settings?: {
    /**
     * Overrides for how the immutability of types is determined using
     * [`is-immutable-type`](https://npmx.dev/is-immutable-type).
     *
     * Note: When providing custom overrides, the default ones (for `Map`, `Set`, `Date`, `URL`,
     * `URLSearchParams`) will not be applied. Include them manually via `getDefaultOverrides()`
     * from `is-immutable-type` if needed.
     */
    overrides?:
      | OverridesSetting[]
      | {
          keepDefault?: boolean;
          values?: OverridesSetting[];
        };
  };
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies FunctionalEslintConfigOptions);

  const {settings: pluginSettings} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'functional');

  // Legend:
  // 🟢 - in `recommended` and `strict`
  // 🔵 - in `strict` only
  // 🎨 - in `stylistic`
  // 🪶 - in `lite`
  // 💭 - requires type information
  // 💭? - optionally requires type information
  // 📋 - in the specified domain specific preset(s)

  configBuilder
    ?.addConfig([
      'functional',
      {
        includeDefaultFilesAndIgnores: true,
        settings: {
          immutability: pluginSettings,
        },
      },
    ])
    .addRule('functional-parameters', ERROR) /** @since 0.4.0 */ // 🟢🪶💭? 📋 currying
    .addRule('immutable-data', ERROR) /** @since 0.4.0 */ // 🟢🪶💭 📋 noMutations
    .addRule('no-class-inheritance', ERROR) /** @since 7.1.0 */ // 🟢🪶 📋 noOtherParadigms
    .addRule('no-classes', OFF) /** @since 5.0.0-beta.7 */ // 🟢
    .addRule('no-conditional-statements', OFF) /** @since 5.0.0-beta.7 */ // 🟢💭 📋 noStatements
    .addRule('no-expression-statements', OFF) /** @since 5.0.0-beta.7 */ // 🟢💭? 📋 noStatements
    .addRule('no-let', ERROR) /** @since 0.4.0 */ // 🟢🪶 📋 noMutations
    .addRule('no-loop-statements', ERROR) /** @since 5.0.0-beta.7 */ // 🟢🪶 📋 noStatements
    .addRule('no-mixed-types', ERROR) /** @since 5.0.0-beta.7 */ // 🟢🪶💭 📋 noOtherParadigms
    .addRule('no-promise-reject', OFF) /** @since 0.5.3 */
    .addRule('no-return-void', ERROR) /** @since 0.4.0 */ // 🟢🪶💭 📋 noStatements
    .addRule('no-this-expressions', OFF) /** @since 5.0.0-beta.7 */ // 🔵 📋 noOtherParadigms
    .addRule('no-throw-statements', ERROR) /** @since 5.0.0-beta.7 */ // 🟢🪶💭? 📋 noExceptions
    .addRule('no-try-statements', OFF) /** @since 5.0.0-beta.7 */ // 🔵 📋 noExceptions
    .addRule('prefer-immutable-types', ERROR) /** @since 5.0.0-beta.7 */ // 🟢🪶💭 📋 noMutations
    .addRule('prefer-property-signatures', OFF) /** @since 4.4.0-beta.1 */ // 🎨💭
    .addRule('prefer-tacit', OFF) /** @since 3.2.0 */ // 🎨(warns)💭
    .addRule('readonly-type', ERROR) /** @since 5.0.0-beta.15 */ // 🎨💭
    .addRule('type-declaration-immutability', ERROR) /** @since 4.4.0-beta.1 */ // 🟢🪶💭 📋 noMutations
    .enableConfigTesterForPlugin('functional')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'functional'>;

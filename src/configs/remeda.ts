// cspell:ignore atleast
import {ERROR, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [Remeda](https://remedajs.com) specific rules.
 *
 * 📁 Default `files`: all files
 */
export interface RemedaEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'remeda'> {
  /**
   * Enable rules suggesting replacing vanilla JS with Remeda expressions.
   *
   * Affected rules:
   * - [`remeda/prefer-constant`](https://github.com/AndreaPontrandolfo/eslint-plugin-remeda/blob/HEAD/docs/rules/prefer-constant.md)
   * - [`remeda/prefer-do-nothing`](https://github.com/AndreaPontrandolfo/eslint-plugin-remeda/blob/HEAD/docs/rules/prefer-do-nothing.md)
   * - [`remeda/prefer-has-atleast`](https://github.com/AndreaPontrandolfo/eslint-plugin-remeda/blob/HEAD/docs/rules/prefer-has-atleast.md)
   * - [`remeda/prefer-is-empty`](https://github.com/AndreaPontrandolfo/eslint-plugin-remeda/blob/HEAD/docs/rules/prefer-is-empty.md)
   * - [`remeda/prefer-is-nullish`](https://github.com/AndreaPontrandolfo/eslint-plugin-remeda/blob/HEAD/docs/rules/prefer-is-nullish.md)
   * - [`remeda/prefer-nullish-coalescing`](https://github.com/AndreaPontrandolfo/eslint-plugin-remeda/blob/HEAD/docs/rules/prefer-nullish-coalescing.md)
   * - [`remeda/prefer-remeda-typecheck`](https://github.com/AndreaPontrandolfo/eslint-plugin-remeda/blob/HEAD/docs/rules/prefer-remeda-typecheck.md)
   * @default false
   */
  suggestJsCodeReplacements?: boolean;
}

export default defineUnConfig<RemedaEslintConfigOptions>('remeda', {
  enabledBy: {package: 'remeda'},
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    suggestJsCodeReplacements: false,
  });

  const {suggestJsCodeReplacements} = optionsResolved;

  const jsCodeReplacementRuleSeverity = suggestJsCodeReplacements ? ERROR : OFF;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'remeda');

  // Legend:
  // 🔴 - not in `recommended`
  // 🟨 - suggests replacing vanilla JS with Remeda expressions

  configBuilder
    ?.addConfig('remeda')
    .addRule('collection-method-value', ERROR) /** @since 1.0.0 */
    .addRule('collection-return', ERROR) /** @since 1.0.0 */
    .addRule('prefer-constant', jsCodeReplacementRuleSeverity) /** @since 1.0.0 */ // 🟨
    .addRule('prefer-do-nothing', jsCodeReplacementRuleSeverity) /** @since 1.0.0 */ // 🟨
    .addRule('prefer-filter', ERROR) /** @since 1.0.0 */
    .addRule('prefer-find', ERROR) /** @since 1.0.0 */
    .addRule('prefer-flat-map', ERROR) /** @since 1.0.0 */
    .addRule('prefer-has-atleast', jsCodeReplacementRuleSeverity) /** @since 1.6.0 */ // 🟨(partially)
    .addRule('prefer-is-empty', jsCodeReplacementRuleSeverity) /** @since 1.0.0 */ // 🟨
    .addRule('prefer-is-nullish', jsCodeReplacementRuleSeverity) /** @since 1.0.0 */ // 🟨(partially)
    .addRule('prefer-map', ERROR) /** @since 1.0.0 */
    .addRule('prefer-nullish-coalescing', jsCodeReplacementRuleSeverity) /** @since 1.0.0 */ // 🟨
    .addRule('prefer-remeda-typecheck', jsCodeReplacementRuleSeverity) /** @since 1.0.0 */ // 🟨
    .addRule('prefer-some', ERROR) /** @since 1.0.0 */
    .addRule('prefer-times', ERROR) /** @since 1.0.0 */
    .enableConfigTesterForPlugin('remeda')
    .addOverrides();
});

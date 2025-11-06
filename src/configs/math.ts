import {ERROR, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigOptions,
  assignDefaults,
  defineUnConfig,
} from './index';

export interface MathEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends UnConfigOptions<ExtraPlugins, 'math'> {
  /**
   * Enforces the method of conversion to absolute values. Set to `false` not not enforce it.
   * @default 'Math.abs'
   */
  absoluteValuesConversionMethod?: false | GetRuleOptions<'math', 'abs'>['prefer'];
}

export default defineUnConfig('math', (context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    absoluteValuesConversionMethod: 'Math.abs',
  } satisfies MathEslintConfigOptions);

  const {absoluteValuesConversionMethod} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'math');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['math', {includeDefaultFilesAndIgnores: true}])
    .addRule(
      'abs',
      absoluteValuesConversionMethod === false ? OFF : ERROR,
      absoluteValuesConversionMethod === false ? [] : [{prefer: absoluteValuesConversionMethod}],
    ) /** @since 0.3.0 */
    .addRule('no-static-infinity-calculations', ERROR) /** @since 0.5.0 */ // 🟢
    .addRule('no-static-nan-calculations', ERROR) /** @since 0.5.0 */ // 🟢
    .addRule('prefer-exponentiation-operator', ERROR) /** @since 0.6.0 */
    .disableAnyRule('', 'prefer-exponentiation-operator')
    .addRule('prefer-math-cbrt', ERROR) /** @since 0.3.0 */ // 🟢
    .addRule('prefer-math-e', ERROR) /** @since 0.5.0 */ // 🟢
    .addRule('prefer-math-hypot', ERROR) /** @since 0.6.0 */ // 🟢
    .addRule('prefer-math-ln10', ERROR) /** @since 0.4.0 */ // 🟢
    .addRule('prefer-math-ln2', ERROR) /** @since 0.4.0 */ // 🟢
    .addRule('prefer-math-log10', ERROR) /** @since 0.4.0 */ // 🟢
    .addRule('prefer-math-log10e', ERROR) /** @since 0.4.0 */ // 🟢
    .addRule('prefer-math-log2', ERROR) /** @since 0.4.0 */ // 🟢
    .addRule('prefer-math-log2e', ERROR) /** @since 0.4.0 */ // 🟢
    .addRule('prefer-math-pi', ERROR) /** @since 0.5.0 */ // 🟢
    .addRule('prefer-math-sqrt', ERROR) /** @since 0.3.0 */ // 🟢
    .addRule('prefer-math-sqrt1-2', ERROR) /** @since 0.4.0 */ // 🟢
    .addRule('prefer-math-sqrt2', ERROR) /** @since 0.4.0 */ // 🟢
    .addRule('prefer-math-sum-precise', OFF) /** @since 0.11.0 */
    .addRule('prefer-math-trunc', ERROR) /** @since 0.4.0 */ // 🟢
    .addRule('prefer-number-epsilon', ERROR) /** @since 0.5.0 */ // 🟢
    .addRule('prefer-number-is-finite', ERROR) /** @since 0.4.0 */ // 🟢
    .addRule('prefer-number-is-integer', ERROR) /** @since 0.2.0 */ // 🟢
    .addRule('prefer-number-is-nan', ERROR) /** @since 0.4.0 */ // 🟢
    .addRule('prefer-number-is-safe-integer', ERROR) /** @since 0.3.0 */ // 🟢
    .addRule('prefer-number-max-safe-integer', ERROR) /** @since 0.3.0 */ // 🟢
    .addRule('prefer-number-max-value', ERROR) /** @since 0.5.0 */ // 🟢
    .addRule('prefer-number-min-safe-integer', ERROR) /** @since 0.3.0 */ // 🟢
    .addRule('prefer-number-min-value', ERROR) /** @since 0.7.0 */ // 🟢
    .enableConfigTesterForPlugin('math')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});

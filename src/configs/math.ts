import {ERROR, OFF} from '../constants';
import {type GetRuleOptions, type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface MathEslintConfigOptions extends UnConfigOptions<'math'> {
  /**
   * Enforces the method of conversion to absolute values. Set to `false` not not enforce it.
   * @default 'Math.abs'
   */
  absoluteValuesConversionMethod?: false | (GetRuleOptions<'math/abs'>[0] & {})['prefer'];
}

export const mathUnConfig: UnConfigFn<'math'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.math;
  const optionsResolved = assignDefaults(optionsRaw, {
    absoluteValuesConversionMethod: 'Math.abs',
  } satisfies MathEslintConfigOptions);

  const {absoluteValuesConversionMethod} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'math');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['math', {includeDefaultFilesAndIgnores: true}])
    .addRule(
      'abs',
      absoluteValuesConversionMethod === false ? OFF : ERROR,
      absoluteValuesConversionMethod === false ? [] : [{prefer: absoluteValuesConversionMethod}],
    ) // >=0.3.0
    .addRule('no-static-infinity-calculations', ERROR) // 🟢 >=0.5.0
    .addRule('no-static-nan-calculations', ERROR) // 🟢 >=0.5.0
    .addRule('prefer-exponentiation-operator', ERROR) // >=0.6.0
    .disableAnyRule('', 'prefer-exponentiation-operator')
    .addRule('prefer-math-cbrt', ERROR) // 🟢 >=0.3.0
    .addRule('prefer-math-e', ERROR) // 🟢 >=0.5.0
    .addRule('prefer-math-hypot', ERROR) // 🟢 >=0.6.0
    .addRule('prefer-math-ln10', ERROR) // 🟢 >=0.4.0
    .addRule('prefer-math-ln2', ERROR) // 🟢 >=0.4.0
    .addRule('prefer-math-log10', ERROR) // 🟢 >=0.4.0
    .addRule('prefer-math-log10e', ERROR) // 🟢 >=0.4.0
    .addRule('prefer-math-log2', ERROR) // 🟢 >=0.4.0
    .addRule('prefer-math-log2e', ERROR) // 🟢 >=0.4.0
    .addRule('prefer-math-pi', ERROR) // 🟢 >=0.5.0
    .addRule('prefer-math-sqrt', ERROR) // 🟢 >=0.3.0
    .addRule('prefer-math-sqrt1-2', ERROR) // 🟢 >=0.4.0
    .addRule('prefer-math-sqrt2', ERROR) // 🟢 >=0.4.0
    .addRule('prefer-math-trunc', ERROR) // 🟢 >=0.4.0
    .addRule('prefer-number-epsilon', ERROR) // 🟢 >=0.5.0
    .addRule('prefer-number-is-finite', ERROR) // 🟢 >=0.4.0
    .addRule('prefer-number-is-integer', ERROR) // 🟢 >=0.2.0
    .addRule('prefer-number-is-nan', ERROR) // 🟢 >=0.4.0
    .addRule('prefer-number-is-safe-integer', ERROR) // 🟢 >=0.3.0
    .addRule('prefer-number-max-safe-integer', ERROR) // 🟢 >=0.3.0
    .addRule('prefer-number-max-value', ERROR) // 🟢 >=0.5.0
    .addRule('prefer-number-min-safe-integer', ERROR) // 🟢 >=0.3.0
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

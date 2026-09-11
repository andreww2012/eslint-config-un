import {definePluginMetadata} from './shared';

export default definePluginMetadata('math', {
  configs: ['math'],
  docsUrl: 'https://ota-meshi.github.io/eslint-plugin-math',
  ruleDocsUrl: (ruleName) =>
    `https://ota-meshi.github.io/eslint-plugin-math/rules/${ruleName}.html`,
  rules: {
    abs: {
      requiresTypeInfo: 'optional',
      autofixDisabled: [true, 'the ternary form it rewrites keeps -0, the method returns +0'],
    },
    'prefer-exponentiation-operator': {stylistic: true},
    'prefer-math-cbrt': {
      stylistic: [false, 'a negative input gives NaN before the fix and a real root after it'],
      autofixDisabled: [true, 'changes NaN into a real root for negative input'],
    },
    'prefer-math-e': {stylistic: true},
    'prefer-math-hypot': {
      stylistic: [
        false,
        'the dedicated method avoids the overflow of the squared sum, so extreme inputs stop returning Infinity',
      ],
      autofixDisabled: [true, 'changes results at the extremes where the squared sum overflows'],
    },
    'prefer-math-ln10': {stylistic: true},
    'prefer-math-ln2': {stylistic: true},
    'prefer-math-log10': {
      stylistic: [
        false,
        'dividing two logarithms disagrees with the dedicated method in the last digit for most inputs',
      ],
      autofixDisabled: [true, 'shifts the result by a digit on most inputs'],
    },
    'prefer-math-log10e': {
      stylistic: [
        false,
        'the reciprocal form it also rewrites sits one digit below the dedicated constant',
      ],
      autofixDisabled: [true, 'shifts the result by a digit for the reciprocal form'],
    },
    'prefer-math-log2': {
      stylistic: [
        false,
        'dividing two logarithms disagrees with the dedicated method in the last digit for most inputs',
      ],
      autofixDisabled: [true, 'shifts the result by a digit on many inputs'],
    },
    'prefer-math-log2e': {stylistic: true},
    'prefer-math-pi': {stylistic: true},
    'prefer-math-sqrt': {
      stylistic: [
        false,
        'raising -0 to the power of 0.5 gives +0, while the dedicated method keeps -0',
      ],
      autofixDisabled: [true, 'turns +0 into -0'],
    },
    'prefer-math-sqrt1-2': {
      stylistic: [
        false,
        'the reciprocal forms it also rewrites sit one digit below the dedicated constant',
      ],
      autofixDisabled: [true, 'shifts the result by a digit for the reciprocal forms'],
    },
    'prefer-math-sqrt2': {stylistic: true},
    'prefer-math-sum-precise': {
      requiresTypeInfo: 'optional',
      stylistic: [
        false,
        'the dedicated method sums more precisely by design and returns -0 for an empty input',
      ],
      autofixDisabled: [true, 'changes the sum by design'],
    },
    'prefer-math-trunc': {
      stylistic: [false, 'the bitwise forms it reports wrap above 2**31'],
    },
    'prefer-number-epsilon': {stylistic: true},
    'prefer-number-is-finite': {requiresTypeInfo: 'optional', stylistic: true},
    'prefer-number-is-integer': {
      stylistic: [
        false,
        'comparing a rounded value against the input is true for Infinity, the dedicated check is false',
      ],
      autofixDisabled: [true, 'flips the check for Infinity'],
    },
    'prefer-number-is-nan': {requiresTypeInfo: 'optional', stylistic: true},
    'prefer-number-is-safe-integer': {stylistic: true},
    'prefer-number-max-safe-integer': {stylistic: true},
    'prefer-number-max-value': {stylistic: true},
    'prefer-number-min-safe-integer': {stylistic: true},
    'prefer-number-min-value': {stylistic: true},
  },
});

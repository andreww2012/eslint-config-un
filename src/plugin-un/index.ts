import type {EslintPlugin} from '../eslint/eslint-types';
import {noEmptyObjectTernarySpread} from './rules/no-empty-object-ternary-spread';
import {noMultipleConsecutiveSpaces} from './rules/no-multiple-consecutive-spaces';
import {noTypeofLikeComparison} from './rules/no-typeof-like-comparisons';
import {preferEarlyReturn} from './rules/prefer-early-return';

const eslintPluginUn: EslintPlugin = {
  meta: {
    name: 'eslint-plugin-un',
  },
  rules: {
    'no-empty-object-ternary-spread': noEmptyObjectTernarySpread,
    'no-multiple-consecutive-spaces': noMultipleConsecutiveSpaces,
    'no-typeof-like-comparisons': noTypeofLikeComparison,
    'prefer-early-return': preferEarlyReturn,
  },
};

// eslint-disable-next-line import/no-default-export
export default eslintPluginUn;

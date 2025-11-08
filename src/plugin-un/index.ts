import type {EslintPlugin} from '../eslint';
import {noTypeofLikeComparison} from './rules/no-typeof-like-comparisons';
import {preferEarlyReturn} from './rules/prefer-early-return';

const eslintPluginUn: EslintPlugin = {
  meta: {
    name: 'eslint-plugin-un',
  },
  rules: {
    'no-typeof-like-comparisons': noTypeofLikeComparison,
    'prefer-early-return': preferEarlyReturn,
  },
};

// eslint-disable-next-line import/no-default-export
export default eslintPluginUn;

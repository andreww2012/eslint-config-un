import type {EslintPlugin} from '../eslint/eslint-types';
import {noDistributiveNeverCheck} from './rules/no-distributive-never-check';
import {noMultipleConsecutiveSpaces} from './rules/no-multiple-consecutive-spaces';
import {noTypeofLikeComparison} from './rules/no-typeof-like-comparisons';

const eslintPluginUn: EslintPlugin = {
  meta: {
    name: 'eslint-plugin-un',
  },
  rules: {
    'no-distributive-never-check': noDistributiveNeverCheck,
    'no-multiple-consecutive-spaces': noMultipleConsecutiveSpaces,
    'no-typeof-like-comparisons': noTypeofLikeComparison,
  },
};

// eslint-disable-next-line import/no-default-export
export default eslintPluginUn;

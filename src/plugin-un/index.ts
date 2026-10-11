import type {EslintPlugin} from '../eslint/eslint-types';
import {noDistributiveNeverCheck} from './rules/no-distributive-never-check';
import {noMultipleConsecutiveSpaces} from './rules/no-multiple-consecutive-spaces';
import {noTypeAssertion} from './rules/no-type-assertion';
import {noTypeofLikeComparison} from './rules/no-typeof-like-comparisons';
import {preferArrayForEach} from './rules/prefer-array-for-each';
import {vueNoLeadingTextWhitespace} from './rules/vue-no-leading-text-whitespace';
import {vueNoTrailingElementWhitespace} from './rules/vue-no-trailing-element-whitespace';

const eslintPluginUn: EslintPlugin = {
  meta: {
    name: 'eslint-plugin-un',
  },
  rules: {
    'no-distributive-never-check': noDistributiveNeverCheck,
    'no-multiple-consecutive-spaces': noMultipleConsecutiveSpaces,
    'no-type-assertion': noTypeAssertion,
    'no-typeof-like-comparisons': noTypeofLikeComparison,
    'prefer-array-for-each': preferArrayForEach,
    'vue-no-leading-text-whitespace': vueNoLeadingTextWhitespace,
    'vue-no-trailing-element-whitespace': vueNoTrailingElementWhitespace,
  },
};

// eslint-disable-next-line import/no-default-export
export default eslintPluginUn;

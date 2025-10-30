import type {EslintPlugin} from '../eslint';
import {preferEarlyReturn} from './rules/prefer-early-return';

const eslintPluginUn: EslintPlugin = {
  meta: {
    name: 'eslint-plugin-un',
  },
  rules: {
    'prefer-early-return': preferEarlyReturn,
  },
};

// eslint-disable-next-line import/no-default-export
export default eslintPluginUn;

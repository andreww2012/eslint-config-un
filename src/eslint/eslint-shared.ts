import {builtinRules as eslintBuiltinRules} from 'eslint/use-at-your-own-risk';
import type {EslintPlugin} from './eslint-types';

export const eslintPluginVanillaRules: EslintPlugin = Object.freeze({
  // eslint-disable-next-line ts/no-deprecated
  rules: Object.fromEntries(eslintBuiltinRules.entries()),
});

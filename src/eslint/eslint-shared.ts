import {builtinRules as eslintBuiltinRules} from 'eslint/use-at-your-own-risk';
import type {EslintPlugin} from './eslint-types';

export const eslintPluginVanillaRules: EslintPlugin = Object.freeze({
  rules: Object.defineProperties(
    {},
    Object.fromEntries(
      Array.from(
        // eslint-disable-next-line ts/no-deprecated -- the built-in rules are needed to expose their metadata
        eslintBuiltinRules.keys(),
        (ruleName) => [
          ruleName,
          {
            enumerable: true,
            // eslint-disable-next-line ts/no-deprecated -- the built-in rules are needed to expose their metadata
            get: () => eslintBuiltinRules.get(ruleName),
          },
        ],
      ),
    ),
  ),
});

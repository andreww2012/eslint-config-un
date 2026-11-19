import {builtinRules as eslintBuiltinRules} from 'eslint/use-at-your-own-risk';
import type {EslintPlugin} from './eslint-types';

export const eslintPluginVanillaRules: EslintPlugin = Object.freeze({
  rules: Object.defineProperties(
    {},
    Object.fromEntries(
      Array.from(
        // eslint-disable-next-line ts/no-deprecated -- The built-in rules are needed to expose their metadata
        eslintBuiltinRules.keys(),
        (ruleName) => [
          ruleName,
          {
            enumerable: true,
            get: () =>
              // eslint-disable-next-line ts/no-deprecated -- The built-in rules are needed to expose their metadata
              eslintBuiltinRules.get(ruleName),
          },
        ],
      ),
    ),
  ),
});

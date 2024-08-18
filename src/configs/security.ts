import eslintPluginSecurity from 'eslint-plugin-security';
import {ERROR, OFF} from '../constants';
import type {ConfigSharedOptions, FlatConfigEntry, InternalConfigOptions} from '../types';
import {genFlatConfigEntryName, warnUnlessForcedError} from '../utils';

export interface SecurityEslintConfigOptions extends ConfigSharedOptions<'security'> {}

export const securityEslintConfig = (
  options: SecurityEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  // By default, all rules are included in the recommended config and with the "warn" level
  const rules: FlatConfigEntry['rules'] = {
    'security/detect-bidi-characters': ERROR,
    'security/detect-buffer-noassert': ERROR,
    ...warnUnlessForcedError(internalOptions, 'security/detect-child-process'),
    'security/detect-disable-mustache-escape': ERROR,
    'security/detect-eval-with-expression': ERROR,
    'security/detect-new-buffer': ERROR,
    ...warnUnlessForcedError(internalOptions, 'security/detect-no-csrf-before-method-override'),
    'security/detect-non-literal-fs-filename': OFF,
    'security/detect-non-literal-regexp': OFF,
    'security/detect-non-literal-require': OFF,
    'security/detect-object-injection': OFF,
    'security/detect-possible-timing-attacks': OFF,
    ...warnUnlessForcedError(internalOptions, 'security/detect-pseudoRandomBytes'),
    ...warnUnlessForcedError(internalOptions, 'security/detect-unsafe-regex'),
  };

  return [
    {
      ...(options.files && {files: options.files}),
      ...(options.ignores && {ignores: options.ignores}),
      plugins: {
        security: eslintPluginSecurity,
      },
      rules: {
        ...eslintPluginSecurity.configs.recommended.rules,
        ...rules,
        ...options.overrides,
      },
      name: genFlatConfigEntryName('security'),
    },
  ];
};

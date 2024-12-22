import eslintPluginSecurity from 'eslint-plugin-security';
import {ERROR, OFF, WARNING} from '../constants';
import type {ConfigSharedOptions, FlatConfigEntry} from '../eslint';
import {ConfigEntryBuilder} from '../eslint';
import type {InternalConfigOptions} from './index';

export interface SecurityEslintConfigOptions extends ConfigSharedOptions<'security'> {}

export const securityEslintConfig = (
  options: SecurityEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const builder = new ConfigEntryBuilder<'security'>(options, internalOptions);

  builder
    .addConfig(['security', {includeDefaultFilesAndIgnores: true}], {
      plugins: {
        security: eslintPluginSecurity,
      },
    })
    .addBulkRules(eslintPluginSecurity.configs.recommended.rules)
    // By default, all rules are included in the recommended config and with the "warn" level
    .addRule('security/detect-bidi-characters', ERROR)
    .addRule('security/detect-buffer-noassert', ERROR)
    .addRule('security/detect-child-process', WARNING)
    .addRule('security/detect-disable-mustache-escape', ERROR)
    .addRule('security/detect-eval-with-expression', ERROR)
    .addRule('security/detect-new-buffer', ERROR)
    .addRule('security/detect-no-csrf-before-method-override', WARNING)
    .addRule('security/detect-non-literal-fs-filename', OFF)
    .addRule('security/detect-non-literal-regexp', OFF)
    .addRule('security/detect-non-literal-require', OFF)
    .addRule('security/detect-object-injection', OFF)
    .addRule('security/detect-possible-timing-attacks', OFF)
    .addRule('security/detect-pseudoRandomBytes', WARNING)
    .addRule('security/detect-unsafe-regex', WARNING)
    .addOverrides();

  return builder.getAllConfigs();
};

import type {RequestOptions} from 'node:https';
import jsoncEslintParser from 'jsonc-eslint-parser';
import tomlEslintParser from 'toml-eslint-parser';
import yamlEslintParser from 'yaml-eslint-parser';
import {ERROR} from '../constants';
import {ConfigEntryBuilder, type ConfigSharedOptions, type GetRuleOptions} from '../eslint';
import {assignDefaults} from '../utils';
import {JSONC_DEFAULT_FILES} from './jsonc';
import {TOML_DEFAULT_FILES} from './toml';
import {YAML_DEFAULT_FILES} from './yaml';
import type {UnConfigFn} from './index';

export interface JsonSchemaValidatorEslintConfigOptions
  extends ConfigSharedOptions<'json-schema-validator'> {
  /**
   * [`eslint-plugin-json-schema-validator`](https://www.npmjs.com/package/eslint-plugin-json-schema-validator) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `json-schema-validator` property and applied to the specified `files` and `ignores`.
   * @see [Docs](https://github.com/ota-meshi/eslint-plugin-json-schema-validator/tree/main#settings)
   */
  settings?: {
    http?: {
      getModulePath?: string;
      requestOptions?: RequestOptions;
    };
  };

  /**
   * The single [rule (`no-invalid`)](https://github.com/ota-meshi/eslint-plugin-json-schema-validator/blob/main/docs/rules/no-invalid.md) options.
   */
  options?: GetRuleOptions<'json-schema-validator/no-invalid'>[0];
}

export const jsonSchemaValidatorUnConfig: UnConfigFn<'jsonSchemaValidator'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.jsonSchemaValidator;
  const optionsResolved = assignDefaults(
    optionsRaw,
    {} satisfies JsonSchemaValidatorEslintConfigOptions,
  );

  const {settings: pluginSettings, options: noInvalidOptions} = optionsResolved;

  const configBuilder = new ConfigEntryBuilder('json-schema-validator', optionsResolved, context);

  // Legend:
  // 🟣 - in recommended

  configBuilder.addConfig(
    [
      'json-schema-validator/setup/jsonc',
      {
        filesFallback: JSONC_DEFAULT_FILES,
      },
    ],
    {
      languageOptions: {
        parser: jsoncEslintParser,
      },
    },
  );

  configBuilder.addConfig(
    [
      'json-schema-validator/setup/yaml',
      {
        filesFallback: YAML_DEFAULT_FILES,
      },
    ],
    {
      languageOptions: {
        parser: yamlEslintParser,
      },
    },
  );

  configBuilder.addConfig(
    [
      'json-schema-validator/setup/toml',
      {
        filesFallback: TOML_DEFAULT_FILES,
      },
    ],
    {
      languageOptions: {
        parser: tomlEslintParser,
      },
    },
  );

  configBuilder
    .addConfig(['json-schema-validator', {includeDefaultFilesAndIgnores: true}], {
      ...(pluginSettings && {
        settings: {
          'json-schema-validator': pluginSettings,
        },
      }),
    })
    .addRule('no-invalid', ERROR, noInvalidOptions == null ? [] : [noInvalidOptions]) // 🟣 >=0.1.0
    .addOverrides();

  return {
    configs: configBuilder.getAllConfigs(),
    optionsResolved,
  };
};

import type {RequestOptions} from 'node:https';
import {ERROR} from '../constants';
import {JSONC_DEFAULT_FILES, TOML_DEFAULT_FILES, YAML_DEFAULT_FILES} from './shared';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigOptions,
  assignDefaults,
  defineUnConfig,
} from './index';

export interface JsonSchemaValidatorEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, 'json-schema-validator'> {
  /**
   * [`eslint-plugin-json-schema-validator`](https://npmjs.com/eslint-plugin-json-schema-validator) plugin
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
   * The single [rule (`no-invalid`)](https://github.com/ota-meshi/eslint-plugin-json-schema-validator/blob/HEAD/docs/rules/no-invalid.md) options.
   */
  options?: GetRuleOptions<'json-schema-validator', 'no-invalid'>;
}

export default defineUnConfig('jsonSchemaValidator', (context, optionsRaw) => {
  const optionsResolved = assignDefaults(
    optionsRaw,
    {} satisfies JsonSchemaValidatorEslintConfigOptions,
  );

  const {settings: pluginSettings, options: noInvalidOptions} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'json-schema-validator');

  // Legend:
  // 🟢 - in recommended

  configBuilder?.addConfig([
    'json-schema-validator/setup/jsonc',
    {
      filesFallback: JSONC_DEFAULT_FILES,
      parser: 'jsonc-eslint-parser',
    },
  ]);

  configBuilder?.addConfig([
    'json-schema-validator/setup/yaml',
    {
      filesFallback: YAML_DEFAULT_FILES,
      parser: 'yaml-eslint-parser',
    },
  ]);

  configBuilder?.addConfig([
    'json-schema-validator/setup/toml',
    {
      filesFallback: TOML_DEFAULT_FILES,
      parser: 'toml-eslint-parser',
    },
  ]);

  configBuilder
    ?.addConfig(['json-schema-validator', {includeDefaultFilesAndIgnores: true}], {
      ...(pluginSettings && {
        settings: {
          'json-schema-validator': pluginSettings,
        },
      }),
    })
    .addRule(
      'no-invalid',
      ERROR,
      noInvalidOptions == null ? [] : [noInvalidOptions],
    ) /** @since 0.1.0 */ // 🟢
    .enableConfigTesterForPlugin('json-schema-validator')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});

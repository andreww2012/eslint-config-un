import type {RequestOptions} from 'node:https';
import {ERROR, GLOB_JS_TS_X} from '../constants';
import {JSONC_DEFAULT_FILES, TOML_DEFAULT_FILES, YAML_DEFAULT_FILES} from './shared';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * An ESLint plugin that validates data using JSON Schema Validator.
 *
 * 📁 Default `files`: <code>**&#47;*.?([cm])[jt]s?(x)</code>
 */
export interface JsonSchemaValidatorEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'json-schema-validator'> {
  /**
   * [`eslint-plugin-json-schema-validator`](https://npmx.dev/eslint-plugin-json-schema-validator)
   * plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
   * that will be assigned to `json-schema-validator` property and applied to the resolved `files`
   * and `ignores` of this config.
   * @see [Docs](https://github.com/ota-meshi/eslint-plugin-json-schema-validator/blob/main/README.md#settings)
   */
  settings?: {
    /**
     * Where and for how long the schemas fetched over the network are cached
     */
    cache?: {
      /**
       * The cache directory
       */
      path?: string;

      /**
       * How long a cached schema stays fresh
       */
      ttl?: number | string;
    };

    /**
     * How the schemas are fetched over the network
     */
    http?: {
      /**
       * Path to a module exporting a custom `get` implementation
       */
      getModulePath?: string;

      /**
       * Options passed to the request
       */
      requestOptions?: RequestOptions;
    };
  };

  /**
   * Validates JSON, JSONC and JSON5 files against their JSON schemas.
   *
   * 📁 Default `files`: <code>**&#47;*.{json,jsonc,json5}</code>
   * @default true
   */
  configJson?: boolean | UnFlatConfigEntryBase<ExtraPlugins, 'json-schema-validator'>;

  /**
   * Validates YAML files against their JSON schemas.
   *
   * 📁 Default `files`: <code>**&#47;*.y?(a)ml</code>
   * @default true
   */
  configYaml?: boolean | UnFlatConfigEntryBase<ExtraPlugins, 'json-schema-validator'>;

  /**
   * Validates TOML files against their JSON schemas.
   *
   * 📁 Default `files`: <code>**&#47;*.toml</code>
   * @default true
   */
  configToml?: boolean | UnFlatConfigEntryBase<ExtraPlugins, 'json-schema-validator'>;
}

export default defineUnConfig<JsonSchemaValidatorEslintConfigOptions>('jsonSchemaValidator', {
  enabledBy: {group: 'misc'},
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {
    settings: pluginSettings,
    configJson = true,
    configYaml = true,
    configToml = true,
  } = optionsResolved;

  // Legend:
  // 🟢 - in recommended

  const configBuilder = context.createConfigBuilder(optionsResolved, 'json-schema-validator');

  configBuilder
    ?.addConfig([
      'json-schema-validator/js-ts',
      {
        filesDefault: [GLOB_JS_TS_X],
        settings: {
          'json-schema-validator': pluginSettings,
        },
      },
    ])
    .addRule('no-invalid', ERROR) /** @since 0.1.0 */ // 🟢
    .enableConfigTesterForPlugin('json-schema-validator')
    .addOverrides();

  const configBuilderJson = context.createConfigBuilder(configJson, 'json-schema-validator');

  configBuilderJson
    ?.addConfig([
      'json-schema-validator/json',
      {
        filesDefault: JSONC_DEFAULT_FILES,
        parseWith: 'jsonc',
        settings: {
          'json-schema-validator': pluginSettings,
        },
      },
    ])
    .addRule('no-invalid', ERROR)
    .addOverrides();

  const configBuilderYaml = context.createConfigBuilder(configYaml, 'json-schema-validator');

  configBuilderYaml
    ?.addConfig([
      'json-schema-validator/yaml',
      {
        filesDefault: YAML_DEFAULT_FILES,
        parseWith: 'yaml',
        settings: {
          'json-schema-validator': pluginSettings,
        },
      },
    ])
    .addRule('no-invalid', ERROR)
    .addOverrides();

  const configBuilderToml = context.createConfigBuilder(configToml, 'json-schema-validator');

  configBuilderToml
    ?.addConfig([
      'json-schema-validator/toml',
      {
        filesDefault: TOML_DEFAULT_FILES,
        parseWith: 'toml',
        settings: {
          'json-schema-validator': pluginSettings,
        },
      },
    ])
    .addRule('no-invalid', ERROR)
    .addOverrides();
});

import type {JSONSchema} from 'json-schema-to-ts';
import type {EslintPlugin} from '../../src/eslint/eslint-types';
import type {PluginPrefix} from '../../src/loaders';
import {cloneDeep, interopDefault, objectEntriesUnsafe} from '../../src/utils';

const PLUGIN_OPTIONS_SCHEMAS: Partial<Record<PluginPrefix, Record<string, JSONSchema[]>>> = {
  'no-secrets': {
    'no-secrets': [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          tolerance: {
            type: 'number',
            minimum: 0,
            exclusiveMinimum: true as unknown as number,
          },
          additionalRegexes: {
            type: 'object',
            additionalProperties: {type: 'string'},
          },
          ignoreContent: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            ],
          },
          ignoreModules: {type: 'boolean'},
          ignoreIdentifiers: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            ],
          },
          ignoreCase: {type: 'boolean'},
          additionalDelimiters: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    ],

    'no-pattern-match': [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          patterns: {type: 'object', additionalProperties: {type: 'string'}},
        },
      },
    ],
  },
};

export const addMissingRuleOptionsSchemas = async () => {
  const [
    eslintPluginNoSecrets,
    // eslint-disable-next-line unicorn/no-single-promise-in-promise-methods
  ] = await Promise.all([interopDefault(import('eslint-plugin-no-secrets'))]);

  const plugins = {
    'no-secrets': eslintPluginNoSecrets satisfies EslintPlugin as EslintPlugin,
  } satisfies Partial<Record<PluginPrefix, EslintPlugin>>;

  objectEntriesUnsafe(plugins).forEach(([pluginPrefix, plugin]) => {
    plugins[pluginPrefix] = {
      ...plugin,
      rules: Object.fromEntries(
        Object.entries(cloneDeep(plugin.rules || {})).map(([ruleId, ruleImplementation]) => {
          const suggestedSchema = PLUGIN_OPTIONS_SCHEMAS[pluginPrefix]?.[ruleId];
          if (suggestedSchema) {
            if (ruleImplementation.meta?.schema) {
              throw new Error(`${pluginPrefix}/${ruleId}: rule already has a schema`);
            }
            ruleImplementation.meta = {
              ...ruleImplementation.meta,
              schema: suggestedSchema,
            };
          }
          return [ruleId, ruleImplementation];
        }),
      ),
    };
  });

  return plugins;
};

import type {JSONSchema} from 'json-schema-to-ts';
import type {EslintPlugin} from '../../src/eslint/eslint-types';
import type {PluginPrefix} from '../../src/loaders';
import {cloneDeep, interopDefault, objectEntriesUnsafe} from '../../src/utils';

const PLUGIN_OPTIONS_SCHEMAS: Partial<Record<PluginPrefix, Record<string, JSONSchema[]>>> = {
  header: {
    header: [
      // option 0: comment type (`'block' | 'line'`) or path to a file containing the expected header
      {type: 'string'},
      // option 1: header content – a plain string, array of strings/patterns, or a single pattern object
      {
        oneOf: [
          {type: 'string'},
          {
            type: 'array',
            items: {
              oneOf: [
                {type: 'string'},
                {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    pattern: {type: 'string'},
                    template: {type: 'string'},
                  },
                  required: ['pattern'],
                },
              ],
            },
          },
          {
            type: 'object',
            additionalProperties: false,
            properties: {
              pattern: {type: 'string'},
              template: {type: 'string'},
            },
            required: ['pattern'],
          },
        ],
      },
      // option 2: number of newlines to enforce after the header (default: 1)
      {type: 'integer', minimum: 0},
      // option 3: settings object
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          lineEndings: {type: 'string', enum: ['windows', 'unix']},
        },
      },
    ],
  },
};

export const addMissingRuleOptionsSchemas = async () => {
  const [eslintPluginHeader, eslintPluginNoSecrets] = await Promise.all([
    interopDefault(import('eslint-plugin-header')),
    interopDefault(import('eslint-plugin-no-secrets')),
  ]);

  const plugins = {
    header: eslintPluginHeader,
    'no-secrets': eslintPluginNoSecrets satisfies EslintPlugin as EslintPlugin,
  } satisfies Partial<Record<PluginPrefix, EslintPlugin>>;

  objectEntriesUnsafe(plugins).forEach(([pluginPrefix, plugin]) => {
    plugins[pluginPrefix] = {
      ...plugin,
      rules: Object.fromEntries(
        objectEntriesUnsafe(cloneDeep(plugin.rules || {})).map(([ruleId, ruleImplementation]) => {
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

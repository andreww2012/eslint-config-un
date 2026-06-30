import type {EslintPlugin, GetRuleNamesInPlugin} from '../eslint/eslint-types';
import type {PluginPrefix} from '../loaders';
import type {NonEmptyTuple} from '../types';
import {objectEntriesUnsafe} from '../utils';
import type {UnConfigContext} from './shared';

export type {ImportIntegrityPluginSettings} from '../configs/import-integrity';

// TODO: move to configs/import-integrity

const IMPORT_RULES_TO_REPLACE = {
  'no-cycle': 'no-cycle',
  'no-named-as-default': 'no-named-as-default',
  'no-unresolved': 'no-unresolved-imports',
} satisfies Partial<
  Record<GetRuleNamesInPlugin<'import'>, GetRuleNamesInPlugin<'import-integrity'>>
>;

export type ImportPluginReplaceableRules = keyof typeof IMPORT_RULES_TO_REPLACE;

export const replaceImportRulesImplementationWithIntegrityPlugin = (
  context: UnConfigContext,
  loadedPlugins: Partial<Record<PluginPrefix, EslintPlugin>>,
): void => {
  const {useImportIntegrity} = context.rootOptions;
  const {import: originalPlugin, 'import-integrity': fastPlugin} = loadedPlugins;
  if (!useImportIntegrity || !originalPlugin || !fastPlugin) {
    return;
  }

  const {replaceRules} = typeof useImportIntegrity === 'object' ? useImportIntegrity : {};

  const originalPluginPatched: EslintPlugin = {
    ...originalPlugin,
    rules: {
      ...originalPlugin.rules,
      ...Object.fromEntries(
        objectEntriesUnsafe(IMPORT_RULES_TO_REPLACE)
          .map(([originalRuleName, fastRuleName]) => {
            const fastRuleImplementation = fastPlugin.rules?.[fastRuleName];
            if (!fastRuleImplementation || replaceRules?.[originalRuleName] === false) {
              return null;
            }

            const fastRuleSchema = fastRuleImplementation.meta?.schema;
            return [
              originalRuleName,
              {
                ...fastRuleImplementation,
                meta: {
                  ...fastRuleImplementation.meta,
                  schema:
                    fastRuleSchema &&
                    !(Array.isArray(fastRuleSchema) && fastRuleSchema.length === 0)
                      ? fastRuleSchema
                      : [{type: 'object'}], // Allows any properties
                },
              },
            ] satisfies NonEmptyTuple;
          })
          .filter((v) => v != null),
      ),
    },
  };

  loadedPlugins.import = originalPluginPatched;
};

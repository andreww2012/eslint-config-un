import type {ImportIntegrityPluginSettings} from '../configs/import-integrity';
import type {EslintPlugin, GetRuleNamesInPlugin} from '../eslint/eslint-types';
import type {PluginPrefix} from '../loaders';
import {mapEntries} from '../utils';
import type {UnConfigContext} from './shared';

/**
 * The plugin rejects `packageRootDir` in the monorepo form, so it can only be defaulted when the
 * user has not opted into that form
 */
export const withDefaultPackageRootDirectory = (
  settings: ImportIntegrityPluginSettings | undefined,
): ImportIntegrityPluginSettings =>
  settings && 'monorepoRootDir' in settings
    ? settings
    : {packageRootDir: process.cwd(), ...settings};

// TODO: move to configs/import-integrity

const IMPORT_RULES_TO_REPLACE = {
  'no-cycle': 'no-cycle',
  'no-named-as-default': 'no-named-as-default',
  'no-unresolved': 'no-unresolved-imports',
} as const satisfies Partial<
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
      ...mapEntries(IMPORT_RULES_TO_REPLACE, (originalRuleName, fastRuleName) => {
        const fastRuleImplementation = fastPlugin.rules?.[fastRuleName];
        const fastRuleSchema = fastRuleImplementation?.meta?.schema;
        return fastRuleImplementation && replaceRules?.[originalRuleName] !== false
          ? [
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
            ]
          : undefined;
      }),
    },
  };

  loadedPlugins.import = originalPluginPatched;
};

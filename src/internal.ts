import type {recommended as fastImportPluginConfigGenerator} from 'eslint-plugin-fast-import';
import type {UnConfigContext} from './configs';
import type {EslintPlugin, RuleNamesForPlugin} from './eslint';
import type {PluginPrefix} from './plugins';
import type {NonEmptyTuple} from './types';
import {objectEntriesUnsafe, styleText} from './utils';

const generateStyleFn = (color: Parameters<typeof styleText>[0]) => (string: string) =>
  styleText(color, string);

export const styleConfigName = generateStyleFn('yellow');
export const stylePackageName = generateStyleFn('yellow');
export const stylePluginPrefix = generateStyleFn('blue');
export const styleRuleName = generateStyleFn('green');

// TODO: move to configs/fast-import
export type FastImportPluginSettings = Parameters<typeof fastImportPluginConfigGenerator>[0];

const IMPORT_RULES_TO_REPLACE = {
  'no-cycle': 'no-cycle',
  'no-named-as-default': 'no-named-as-default',
  'no-unresolved': 'no-unresolved-imports',
} satisfies Partial<Record<RuleNamesForPlugin<'import'>, RuleNamesForPlugin<'fast-import'>>>;

export type ImportPluginReplaceableRules = keyof typeof IMPORT_RULES_TO_REPLACE;

export const replaceImportRulesImplementationWithFastPlugin = (
  context: UnConfigContext,
  loadedPlugins: Partial<Record<PluginPrefix, EslintPlugin>>,
): void => {
  const {useFastImport} = context.rootOptions;
  const {import: originalPlugin, 'fast-import': fastPlugin} = loadedPlugins;
  if (!useFastImport || !originalPlugin || !fastPlugin) {
    return;
  }

  const {replaceRules} = typeof useFastImport === 'object' ? useFastImport : {};

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
                    // eslint-disable-next-line de-morgan/no-negated-conjunction
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

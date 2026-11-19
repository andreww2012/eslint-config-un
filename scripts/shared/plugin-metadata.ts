import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import pathe from 'pathe';
import {prefixRuleName} from '../../src/eslint/eslint-utils';
import type {PluginPrefix} from '../../src/loaders';
import type {PluginMetadata} from '../../src/plugins/shared';
import type {Prettify} from '../../src/types';

const PLUGINS_DIRECTORY = pathe.join(import.meta.dirname, '../../src/plugins');

const NON_METADATA_MODULES: ReadonlySet<string> = new Set(['shared.ts']);

export interface DiscoveredPlugin {
  prefix: PluginPrefix;
  fileName: string;
  metadata: PluginMetadata;
}

/**
 * Falls back to `docsUrl` for a rule without a page of its own, or a plugin documenting all its
 * rules on a single page
 */
export const getRuleDocsUrl = (metadata: PluginMetadata, ruleName: string) => {
  const ruleDocsRefs: Partial<Record<string, string | null>> = metadata.ruleDocsRefs || {};
  const ref = ruleDocsRefs[ruleName];
  return (
    (ref !== null && metadata.ruleDocsUrl?.(ruleName, ref)) ||
    (typeof metadata.docsUrl === 'string' ? metadata.docsUrl : metadata.docsUrl?.url)
  );
};

/**
 * Returns every rule the metadata declares as replaced by a rule of another plugin, with the names
 * of both rules split into the plugin prefix and the rule name
 */
export const collectRuleReplacements = (plugins: readonly DiscoveredPlugin[]) => {
  // A rule name may contain slashes too, so the prefix of a replacing rule is the longest declared
  // one its name starts with
  const prefixesLongestFirst = plugins
    .map(({prefix}) => prefix)
    .filter((prefix) => prefix.length > 0)
    .sort((left, right) => right.length - left.length);

  return plugins.flatMap(({prefix, metadata}) =>
    Object.entries(metadata.rules).flatMap(([ruleName, {replacedBy}]) => {
      if (replacedBy == null) {
        return [];
      }
      const source = typeof replacedBy === 'string' ? replacedBy : replacedBy.rule;
      const sourcePrefix = prefixesLongestFirst.find((candidate) =>
        source.startsWith(`${candidate}/`),
      );
      return {
        targetPrefix: prefix,
        targetRuleName: ruleName,
        target: prefixRuleName(prefix, ruleName),
        source,
        sourcePrefix,
        sourceRuleName: sourcePrefix == null ? source : source.slice(sourcePrefix.length + 1),
        isOnByDefault: typeof replacedBy === 'string',
      };
    }),
  );
};

export const collectRuleReplacementsOnByDefault = (plugins: readonly DiscoveredPlugin[]) =>
  collectRuleReplacements(plugins).filter(({isOnByDefault}) => isOnByDefault);

/**
 * Loads every plugin metadata module
 */
export const readPluginMetadata = async () => {
  const fileNames = (await fs.readdir(PLUGINS_DIRECTORY))
    .filter(
      (fileName) =>
        fileName.endsWith('.ts') &&
        !fileName.endsWith('.gen.ts') &&
        !NON_METADATA_MODULES.has(fileName),
    )
    .sort();

  return await Promise.all(
    fileNames.map(async (fileName): Promise<DiscoveredPlugin> => {
      // Windows would otherwise read the drive letter of an absolute path as a URL scheme
      const moduleUrl = pathToFileURL(pathe.join(PLUGINS_DIRECTORY, fileName)).href;
      // Imported dynamically, so that what the modules carry only for the tooling doesn't end up in
      // the published package
      const module =
        // eslint-disable-next-line un/no-type-assertion -- The path comes from the plugins directory
        (await import(moduleUrl)) as {
          default: Prettify<PluginMetadata & {prefix: PluginPrefix}>;
        };
      const {prefix, ...metadata} = module.default;
      return {prefix, fileName, metadata};
    }),
  );
};

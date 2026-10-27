import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import pathe from 'pathe';
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
 * Loads every plugin metadata module.
 * They are never imported statically, so that nothing they carry for the tooling only ends up in
 * the published package
 */
export const readPluginMetadata = async () => {
  const fileNames = (await fs.readdir(PLUGINS_DIRECTORY))
    .filter(
      (fileName) =>
        fileName.endsWith('.ts') &&
        !fileName.endsWith('.gen.ts') &&
        !NON_METADATA_MODULES.has(fileName),
    )
    .toSorted();

  return await Promise.all(
    fileNames.map(async (fileName): Promise<DiscoveredPlugin> => {
      // Windows would otherwise read the drive letter of an absolute path as a URL scheme
      const moduleUrl = pathToFileURL(pathe.join(PLUGINS_DIRECTORY, fileName)).href;
      // eslint-disable-next-line no-unsanitized/method, un/no-type-assertion -- the path comes from the plugins directory
      const module = (await import(moduleUrl)) as {
        default: Prettify<PluginMetadata & {prefix: PluginPrefix}>;
      };
      const {prefix, ...metadata} = module.default;
      return {prefix, fileName, metadata};
    }),
  );
};

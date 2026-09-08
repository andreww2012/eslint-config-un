import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import pathe from 'pathe';
import type {PluginMetadata} from '../../src/plugins/shared';
import type {Prettify} from '../../src/types';

const PLUGINS_DIR = pathe.join(import.meta.dirname, '../../src/plugins');

const NON_METADATA_MODULES = new Set(['shared.ts']);

export interface DiscoveredPlugin {
  prefix: string;
  fileName: string;
  metadata: PluginMetadata;
}

/**
 * Loads every plugin metadata module.
 * They are never imported statically, so that nothing they carry for the tooling only ends up in
 * the published package
 */
export const readPluginMetadata = async () => {
  const fileNames = (await fs.readdir(PLUGINS_DIR))
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
      const moduleUrl = pathToFileURL(pathe.join(PLUGINS_DIR, fileName)).href;
      // eslint-disable-next-line no-unsanitized/method -- the path comes from the plugins directory
      const module = (await import(moduleUrl)) as {
        default: Prettify<PluginMetadata & {prefix: string}>;
      };
      const {prefix, ...metadata} = module.default;
      return {prefix, fileName, metadata};
    }),
  );
};

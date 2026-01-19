// cspell:ignore scandir
import path from 'node:path';
import consola, {type ConsolaInstance} from 'consola';
import {Context, Layer, type Ref} from 'effect';
import parseNpmPackageArgument from 'npm-package-arg';
import type {FullMetadata, FullVersion} from 'package-json';
import {type Storage as UnStorage, createStorage} from 'unstorage';
import unstorageFsDriver from 'unstorage/drivers/fs';
import * as z from 'zod';
import type {Prettify} from '../../src/types';
import type {EslintPluginsDb} from './plugins-db';

export const CACHE_BASE_PATH = '../../node_modules/.cache/eslint-config-un/packages-info';

export class LoggerTag extends Context.Tag('Logger')<LoggerTag, ConsolaInstance>() {}

export type PackageInfo = {
  updatedAt: string;
} & (
  | {
      metadata: Prettify<FullVersion & Pick<FullMetadata, 'time'>>;
      stats: Record<string /* ISO date only */, number> | null;
      eslintPluginInfo:
        | ReturnType<typeof getEslintPluginInfo>
        | {
            error: {
              code: 'UNEXPECTED' | `UNEXPECTED:${string}` | 'INSTALLATION' | 'UNKNOWN';
              cause: string;
            };
          };
    }
  | {
      error: 'PLUGIN_INSTALLATION';
      consecutiveErrorsCount: number;
    }
);

export class PackagesInfoStorageTag extends Context.Tag('PackagesInfoStorage')<
  PackagesInfoStorageTag,
  UnStorage<PackageInfo>
>() {}

export class EslintPluginsDbRefTag extends Context.Tag('EslintPluginsDbRef')<
  EslintPluginsDbRefTag,
  Ref.Ref<EslintPluginsDb>
>() {}

export const createLoggerLayer = (verbose = false) =>
  Layer.succeed(
    LoggerTag,
    consola.create({
      level: verbose ? Number.POSITIVE_INFINITY : 5,
    }),
  );

export const PackagesInfoStorageLayer = Layer.succeed(
  PackagesInfoStorageTag,
  createStorage<PackageInfo>({
    driver: unstorageFsDriver({
      base: path.join(import.meta.dirname, CACHE_BASE_PATH),
    }),
  }),
);

export const getActualDependencyNames = (
  dependencies: Partial<Record<string, string>> | undefined,
) =>
  Object.entries(dependencies || {})
    .map(([originalName, originalVersion]) => {
      try {
        if (originalVersion == null) {
          return null;
        }
        const parsedSpecifier = parseNpmPackageArgument.resolve(originalName, originalVersion);
        if (parsedSpecifier.type === 'alias') {
          return parsedSpecifier.subSpec.name;
        }
        if (
          parsedSpecifier.type === 'range' ||
          parsedSpecifier.type === 'tag' ||
          parsedSpecifier.type === 'version'
        ) {
          return parsedSpecifier.name;
        }
        return null;
      } catch {
        return null;
      }
    })
    .filter((v) => v != null);

export const isLikelyEslintPlugin = (packageName: string, db: EslintPluginsDb) =>
  (packageName.includes('eslint-plugin') || packageName in db) &&
  !packageName.startsWith('@types/');

export const ExecuteAnyEslintPluginWorkerInitialDataZod = z.strictObject({
  packageName: z.string(),
});
export type ExecuteAnyEslintPluginWorkerInitialData = z.infer<
  typeof ExecuteAnyEslintPluginWorkerInitialDataZod
>;

export type ExecuteAnyEslintPluginWorkerOutput = Extract<
  PackageInfo,
  {eslintPluginInfo: unknown}
>['eslintPluginInfo'];

export const getEslintPluginInfo = (
  module: unknown,
): {
  keys: string[];
  customRules: string[];
} | null => {
  const isModuleObject = typeof module === 'object' && module != null;
  const hasRulesObject =
    isModuleObject && 'rules' in module && typeof module.rules === 'object' && module.rules != null;
  const hasConfigsObject =
    isModuleObject &&
    'configs' in module &&
    typeof module.configs === 'object' &&
    module.configs != null;

  const isLikelyPlugin = hasRulesObject || hasConfigsObject;
  if (!isLikelyPlugin) {
    return null;
  }

  return {
    customRules: hasRulesObject ? Object.keys(module.rules as Record<string, unknown>) : [],
    keys: Object.keys(module),
  };
};

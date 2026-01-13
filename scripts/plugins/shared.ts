import path from 'node:path';
import consola, {type ConsolaInstance} from 'consola';
import {Context, Layer, type Ref} from 'effect';
import parseNpmPackageArgument from 'npm-package-arg';
import type {FullMetadata, FullVersion} from 'package-json';
import {type Storage as UnStorage, createStorage} from 'unstorage';
import unstorageFsDriver from 'unstorage/drivers/fs';
import type {Prettify} from '../../src/types';
import type {EslintPluginsDb} from './plugins-db';
import type {getEslintPluginInfo} from './plugins-info';

export const CACHE_BASE_PATH = '../../node_modules/.cache/eslint-config-un/packages-info';

export class LoggerTag extends Context.Tag('Logger')<LoggerTag, ConsolaInstance>() {}

export interface PackageInfo {
  updatedAt: string;
  metadata: Prettify<FullVersion & Pick<FullMetadata, 'time'>>;
  stats: Record<string /* ISO date only */, number> | null;
  eslintPluginInfo: ReturnType<typeof getEslintPluginInfo> | {error: unknown};
}

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

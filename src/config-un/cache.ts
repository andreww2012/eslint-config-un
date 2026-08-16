import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import * as findUp from 'empathic/find';
import * as packageUtils from 'empathic/package';
import type {Ms} from 'ms-ts';
import {LOCKS as packageManagerLockfilesReversed} from 'package-manager-detector/constants';
import {exec} from 'tinyexec';
import type {EslintFlatConfigEntry} from '../eslint/eslint-types';
import type {LoadablePackagePrefix, PackageToLoadInfo, ParserPrefix} from '../loaders';
import type {SetFieldType} from '../types';
import {
  isObject,
  isPlainObject,
  omit,
  readAndParseJson,
  readFileSafe,
  traverseForEach,
} from '../utils';
import type {UnConfigContext} from './shared';

const sha256 = (input: string | Buffer) => {
  const hashInstance = crypto.createHash('sha256');
  if (typeof input === 'string') {
    hashInstance.update(input, 'utf8');
  } else {
    hashInstance.update(input);
  }
  return hashInstance.digest('hex');
};

const LOCKFILES_PER_PACKAGE_MANAGER = Object.groupBy(
  Object.entries(packageManagerLockfilesReversed),
  ([, packageManager]) => packageManager,
);

// Source: https://github.com/eslint/eslint/blob/3822e1b768bb4a64b72b73b5657737a6ee5c8afe/lib/config/config-loader.js#L43
const ESLINT_FLAT_CONFIG_FILE_NAMES = [
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
  'eslint.config.ts',
  'eslint.config.mts',
  'eslint.config.cts',
];

// TODO more logging
const computeCacheKey = async (context: UnConfigContext) => {
  const result: string[] = [
    process.version,
    String(context.rootOptions.offlineMode),
    context.meta.environment,
  ];

  const packageManagerInfo = context.meta.usedPackageManager;
  result.push(JSON.stringify(packageManagerInfo));

  const gitignorePath = findUp.file('.gitignore'); // TODO sync with logic in config.ts
  const packageJsonPath = packageUtils.up();

  /* v8 ignore next - Every known package manager has its lockfiles grouped */
  const lockfilePaths = (
    packageManagerInfo
      ? (LOCKFILES_PER_PACKAGE_MANAGER[packageManagerInfo.name] || []).map(
          ([lockfileName]) => lockfileName,
        )
      : []
  ).map((lockfileName) => findUp.file(lockfileName));

  const eslintConfigPaths = ESLINT_FLAT_CONFIG_FILE_NAMES.map((eslintConfigFileName) =>
    findUp.file(eslintConfigFileName),
  );

  const [gitHeadHashResult, ...filesToHash] = await Promise.all([
    // eslint-disable-next-line promise/prefer-catch -- does not implement `catch`
    exec('git', ['rev-parse', 'HEAD']).then(
      (v) => v,
      (error: unknown) => {
        context.logger.warn('Error getting git HEAD hash:', error);
        return null;
      },
    ),
    gitignorePath && readFileSafe(gitignorePath, true),
    packageJsonPath && readFileSafe(packageJsonPath, true),
    Promise.all(
      // eslint-disable-next-line ts/await-thenable
      lockfilePaths.map((lockfilePath) => (lockfilePath ? readFileSafe(lockfilePath, true) : null)),
    ).then((files) => files.find((v) => v != null)),
    Promise.all(
      // eslint-disable-next-line ts/await-thenable
      eslintConfigPaths.map((eslintConfigPath) =>
        eslintConfigPath ? readFileSafe(eslintConfigPath, true) : null,
      ),
    ).then((files) => files.find((v) => v != null)),
  ]);

  result.push(
    gitHeadHashResult
      ? gitHeadHashResult.exitCode
        ? String(gitHeadHashResult.exitCode)
        : gitHeadHashResult.stdout
      : '',
    ...filesToHash.map((file) => (file ? sha256(file) : '')),
  );

  return {
    source: result,
    hash: sha256(JSON.stringify(result)),
  };
};

interface CacheMetadata {
  key: string;
  date: string;
}

const MAX_CACHE_VALID_MS = 3_600_000 satisfies Ms<'1h'>;

const isCacheFresh = (cacheMetadata: CacheMetadata): boolean =>
  Date.now() < new Date(cacheMetadata.date).getTime() + MAX_CACHE_VALID_MS;

const resolveCacheFilePath = (context: UnConfigContext): string | undefined => {
  const cachePath = packageUtils.cache('eslint-config-un', {create: true});
  if (!cachePath) {
    context.logger.warn('Could not determine the cache path');
    return cachePath;
  }
  return path.join(cachePath, 'config.json');
};

export interface CacheDataInFs<Serialized extends boolean = true> {
  configs: EslintFlatConfigEntry[];
  usedPlugins: string[];
  usedParsers: Serialized extends true
    ? Record<string, string[] /* Config names */>
    : Map<ParserPrefix, string[] /* Config names */>;
  usedPackages: Serialized extends true
    ? Partial<
        Record<
          LoadablePackagePrefix,
          ({configName: string} & SetFieldType<
            PackageToLoadInfo,
            'valueTransformFn',
            [functionSource: string, scope?: unknown] | undefined
          >)[]
        >
      >
    : Map<LoadablePackagePrefix, ({configName: string; path: string} & PackageToLoadInfo)[]>;
}

interface CacheDataStoredInFs extends CacheDataInFs, CacheMetadata {}

export const saveCacheToFs = async (
  context: UnConfigContext,
  cacheData: CacheDataInFs<false>,
): Promise<boolean> => {
  const cachePath = resolveCacheFilePath(context);
  if (!cachePath) {
    context.logger.warn('Could not determine cache path');
    return false;
  }

  const {hash: cacheKey, source: cacheKeyRaw} = await computeCacheKey(context);

  const dataToStore: CacheDataStoredInFs = {
    date: new Date().toISOString(),
    key: cacheKey,
    ...cacheData,
    usedParsers: Object.fromEntries(cacheData.usedParsers),
    usedPackages: Object.fromEntries(
      Array.from(cacheData.usedPackages, ([packageId, entries]) => [
        packageId,
        entries.map((info) => ({
          ...omit(info, ['valueTransformFn', 'path']),
          property: [info.path, info.property].filter(Boolean).join('.'),
          ...(info.valueTransformFn && {
            valueTransformFn: [info.valueTransformFn.fn.toString(), info.valueTransformFn.scope],
          }),
        })),
      ]),
    ),
  };

  let dataToStoreStringified: string;
  try {
    dataToStoreStringified = JSON.stringify(dataToStore);
  } catch (error: unknown) {
    context.logger.warn('Could not serialize configs to store in cache:', error);
    return false;
  }

  const unserializablePaths: [path: PropertyKey[], value: unknown][] = [];
  traverseForEach(dataToStore.configs, ({path: valuePath}, value: unknown) => {
    const isUnserializable =
      // eslint-disable-next-line ts/no-unnecessary-condition
      typeof value === 'function' || (isObject(value) && !isPlainObject(value));
    if (isUnserializable) {
      unserializablePaths.push([valuePath, value]);
    }
  });
  if (unserializablePaths.length > 0) {
    /* v8 ignore next - A group produced by `Object.groupBy` is never empty */
    const unserializablePathsGrouped = Object.entries(
      // eslint-disable-next-line ts/no-non-null-assertion
      Object.groupBy(unserializablePaths, (v) => v[0][0]!),
    ).map((values) => ({
      configIndex: Number(values[0]),
      configName: dataToStore.configs.at(Number(values[0]))?.name,
      valuePaths: (values[1] || []).map(([valuePath]) => valuePath),
    }));
    context.logger.warn(
      `Could not serialize configs to store in cache because they contain unserializable data at paths:\n${unserializablePathsGrouped
        .map(
          ({configIndex, configName, valuePaths}) =>
            `Config #${configIndex} ${configName ? `"${configName}"` : /* v8 ignore next - Every generated config is named */ '[unnamed]'}:\n${valuePaths
              .map((valuePath) => `  - ${valuePath.slice(1).join('.')}`)
              .join('\n')}`,
        )
        .join('\n')}`,
    );
    return false;
  }

  try {
    await fs.writeFile(cachePath, dataToStoreStringified, 'utf8');
    context.debug(
      `Saved configs to cache, date: ${dataToStore.date}, key: ${cacheKeyRaw.join(',')}`,
    );
    return true;
  } catch (error: unknown) {
    context.logger.warn('Could not save cache data:', error);
    return false;
  }
};

export const restoreCacheFromFs = async (
  context: UnConfigContext,
): Promise<CacheDataInFs | null> => {
  const cachePath = resolveCacheFilePath(context);
  if (!cachePath) {
    context.logger.warn('Could not determine cache path');
    return null;
  }

  const [{hash: cacheKey}, cachedData] = await Promise.all([
    computeCacheKey(context),
    readAndParseJson<CacheDataStoredInFs>(cachePath),
  ]);

  if (
    cachedData?.key === cacheKey &&
    Date.now() < new Date(cachedData.date).getTime() + MAX_CACHE_VALID_MS
  ) {
    return cachedData;
  }

  return null;
};

interface CacheDataInMemory {
  config: EslintFlatConfigEntry[];
}

interface CacheDataStoredInMemory extends CacheDataInMemory, CacheMetadata {}

// eslint-disable-next-line no-shadow-restricted-names, sonarjs/no-globals-shadowing
declare const globalThis: typeof global & {
  eslintConfigUnResolvedConfig?: CacheDataStoredInMemory;
};

export const saveCacheToMemory = async (context: UnConfigContext, data: CacheDataInMemory) => {
  const cacheKey = await computeCacheKey(context);

  globalThis.eslintConfigUnResolvedConfig = {
    ...data,
    key: cacheKey.hash,
    date: new Date().toISOString(),
  };
};

export const restoreCacheFromMemory = async (context: UnConfigContext) => {
  const cacheKey = await computeCacheKey(context);

  const configInMemory = globalThis.eslintConfigUnResolvedConfig;

  if (configInMemory?.key === cacheKey.hash && isCacheFresh(configInMemory)) {
    return configInMemory;
  }

  return null;
};

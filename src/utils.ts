// cspell:ignore pnpapi
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import url from 'node:url';
import {styleText} from 'node:util';
import {arrayHasMinElements, arrayify, jsonParseSafe} from '@andreww2012/unutils';
import {objectEntries as objectEntriesUnsafe} from '@antfu/utils';
import {resolve as resolvePackage} from 'import-meta-resolve';
import {getLastResolvedPackageJsonUrl} from 'import-meta-resolve/resolve';
import {isInEditor as isInEditorOriginal} from 'is-in-editor';
import type {Falsy, MaybePromise, Nullable, PackageJson} from './types';

export {
  allUnionMembers,
  type AllUnionMembers,
  arrayDifference,
  arrayify,
  arrayIncludes,
  arrayMap,
  arrayPartition,
  arrayUnique,
  capitalize,
  cloneDeep,
  getByPath,
  identity,
  isKeyIn,
  isPlainObject,
  jsonParseSafe,
  mapKeys,
  type MaybeArray,
  type MaybeFn,
  maybeCall,
  memoize,
  Mutex,
  objectKeysUnsafe as objectKeysUnsafe2,
  omit,
  pick,
  regexEscape,
  setByPath,
  toKebabCase,
  traverseForEach,
} from '@andreww2012/unutils';

export {objectEntries as objectEntriesUnsafe, objectKeys as objectKeysUnsafe} from '@antfu/utils';

export const isInEditor = () => isInEditorOriginal({mode: 'strict'});

export {isCI as isInCi} from 'ci-info';

const generateStyleFn = (color: Parameters<typeof styleText>[0]) => (string: string) =>
  styleText(color, string);

export {styleText} from 'node:util';

export const styleConfigName = generateStyleFn('magenta');
export const stylePackageName = generateStyleFn('yellow');
export const stylePluginPrefix = generateStyleFn('blue');
export const styleRuleName = generateStyleFn('green');

export const isObject = (value: unknown): value is object =>
  typeof value === 'object' && value != null && !Array.isArray(value);

export {
  type ArrayOrBooleanRecord,
  mergeArrayOrBooleanRecords,
} from './utils/array-or-boolean-record';
export {assignDefaults} from './utils/assign-defaults';

export const isNonEmptyArray = <T>(value?: T[] | null): value is [T, ...T[]] =>
  arrayHasMinElements(value || [], 1);

export function findArrayInversions<T>(array: T[], compareFn: (a: T, b: T) => number): [T, T][];
export function findArrayInversions<T>(
  array: T[],
  compareFn: (a: T, b: T) => number,
  // eslint-disable-next-line unicorn/consistent-boolean-name
  group: true,
): Map<T, T[]>;
export function findArrayInversions<T>(
  array: T[],
  compareFn: (a: T, b: T) => number,
  // eslint-disable-next-line unicorn/consistent-boolean-name
  group?: boolean,
): [T, T][] | Map<T, T[]> {
  const result: [T, T][] = [];
  const addedPairsCompoundIndexes = new Set<`${number}-${number}`>();

  array
    .map((value, index) => ({value, index}))
    .sort((a, b) => {
      const aIndex = a.index;
      const bIndex = b.index;

      /* v8 ignore start - The comparator argument order is implementation-defined */
      const aForComparator = (aIndex < bIndex ? a : b).value;
      const bForComparator = (aIndex < bIndex ? b : a).value;
      /* v8 ignore stop */
      const comparatorResult = compareFn(aForComparator, bForComparator);

      if (comparatorResult === 1) {
        /* v8 ignore next */
        const pairIndex =
          aIndex < bIndex ? (`${aIndex}-${bIndex}` as const) : (`${bIndex}-${aIndex}` as const);
        /* v8 ignore else - Reachability depends on the engine's sort algorithm: V8's TimSort does compare the same pair twice, while a plain insertion sort never does */
        if (!addedPairsCompoundIndexes.has(pairIndex)) {
          addedPairsCompoundIndexes.add(pairIndex);
          result.push([aForComparator, bForComparator]);
        }
      }

      /* v8 ignore next */
      return aIndex < bIndex ? comparatorResult : -comparatorResult;
    });

  if (group) {
    const resultMap = new Map<T, T[]>();
    result.forEach(([a, b]) => {
      resultMap.set(a, [...(resultMap.get(a) || []), b]);
    });
    return resultMap;
  }

  return result;
}

export const describeError = (error: unknown) =>
  error instanceof Error ? error.message : typeof error === 'string' ? error : 'unknown error';

export const sha256 = (input: string | Buffer) => {
  const hashInstance = crypto.createHash('sha256');
  if (typeof input === 'string') {
    hashInstance.update(input, 'utf8');
  } else {
    hashInstance.update(input);
  }
  return hashInstance.digest('hex');
};

// eslint-disable-next-line ts/no-redundant-type-constituents
export const joinPaths = (...paths: (string | Falsy)[]) =>
  path.posix.join(...arrayify(paths).filter((v): v is string => Boolean(v)));

export function readFileSafe(
  filePath: string,
  // eslint-disable-next-line unicorn/consistent-boolean-name
  asBinary?: false,
): Promise<string | null>;
export function readFileSafe(
  filePath: string,
  // eslint-disable-next-line unicorn/consistent-boolean-name
  asBinary: true,
): Promise<Buffer | null>;
export async function readFileSafe(
  filePath: string,
  // eslint-disable-next-line unicorn/consistent-boolean-name
  asBinary = false,
): Promise<string | Buffer | null> {
  return await fs.readFile(filePath, asBinary ? null : 'utf8').catch((error: unknown) => {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  });
}

export const readAndParseJson = async <T>(filePath: string | URL | undefined): Promise<T | null> =>
  filePath
    ? jsonParseSafe<T | null>(
        await readFileSafe(typeof filePath === 'string' ? filePath : url.fileURLToPath(filePath)),
      )
    : null;

// Yarn PnP has no `node_modules` for `import-meta-resolve` to traverse
// eslint-disable-next-line ts/no-unsafe-assignment -- `pnpapi` has no bundled types
const pnpApi: {resolveToUnqualified: (request: string, issuer: string) => string | null} | null =
  process.versions['pnp'] ? createRequire(import.meta.url)('pnpapi') : null;

const resolvePackageJsonUrl = (packageName: string, parentUrl: string) => {
  try {
    // `getPackageInfo` from `local-pkg` isn't always able to find the correct package.json: https://github.com/antfu-collective/local-pkg/issues/16
    // This trick uses the patched version of `import-meta-resolve` that after calling `resolvePackage` updates the last resolved package's package.json path
    resolvePackage(packageName, parentUrl);
    return getLastResolvedPackageJsonUrl();
  } catch {
    // If module is not resolved, the error is thrown
    return null;
  }
};

const resolvePackageJsonPath = (packageName: string) => {
  if (pnpApi) {
    try {
      // Unqualified resolution skips `exports`, so `package.json` is found even if not exported
      return pnpApi.resolveToUnqualified(`${packageName}/package.json`, import.meta.filename);
    } catch {
      return null;
    }
  }

  return (
    resolvePackageJsonUrl(packageName, import.meta.url) ||
    // pnpm's global virtual store keeps us outside the project, where only our own dependencies are reachable
    resolvePackageJsonUrl(packageName, url.pathToFileURL(`${process.cwd()}${path.sep}`).href)
  );
};

export const fetchPackageInfo = async (
  packageName: string,
): Promise<{
  info: PackageJson;
  versions: {
    full: string;
    major: number | null;
    majorAndMinor: number | null;
  };
} | null> => {
  const packageJsonPath = resolvePackageJsonPath(packageName);

  const packageInfo = packageJsonPath ? await readAndParseJson<PackageJson>(packageJsonPath) : null;
  if (!packageInfo) {
    return null;
  }

  /* v8 ignore next - No package in `node_modules` declares a missing or non-numeric version */
  const fullVersion = packageInfo.version || '';

  const majorVersionRaw = Number.parseInt(fullVersion, 10);
  /* v8 ignore next */
  const majorVersion = Number.isNaN(majorVersionRaw) ? null : majorVersionRaw;

  const majorAndMinorVersionRaw = Number.parseFloat(fullVersion);
  /* v8 ignore next */
  const majorAndMinorVersion = Number.isNaN(majorAndMinorVersionRaw)
    ? null
    : majorAndMinorVersionRaw;

  return {
    info: packageInfo,
    versions: {
      full: fullVersion,
      major: majorVersion,
      majorAndMinor: majorAndMinorVersion,
    },
  };
};

export const interopDefault = async <T>(module: MaybePromise<T | {default: T}>): Promise<T> => {
  const resolvedModule = await module;
  // TODO report?
  // eslint-disable-next-line ts/no-unnecessary-condition
  return resolvedModule && typeof resolvedModule === 'object' && 'default' in resolvedModule
    ? resolvedModule.default
    : resolvedModule;
};

export function getKeysOfTruthyValues<
  T extends string[] | Partial<Record<string, boolean | string>>,
>(objectOrArray: Nullable<T>): (keyof T & string)[];
export function getKeysOfTruthyValues<
  T extends string[] | Partial<Record<string, boolean | string>>,
>(
  objectOrArray: Nullable<T>,
  mode: 'nonEmptyArray',
): [keyof T & string, ...(keyof T & string)[]] | undefined;
export function getKeysOfTruthyValues<
  T extends string[] | Partial<Record<string, boolean | string>>,
>(objectOrArray: Nullable<T>, mode: 'object'): Exclude<T, string[]>;
export function getKeysOfTruthyValues<
  T extends string[] | Partial<Record<string, boolean | string>>,
>(objectOrArray: Nullable<T>, mode?: 'array' | 'nonEmptyArray' | 'object') {
  if (Array.isArray(objectOrArray)) {
    return mode === 'nonEmptyArray' && objectOrArray.length === 0
      ? undefined
      : // eslint-disable-next-line un/no-typeof-like-comparisons
        mode === 'object'
        ? Object.fromEntries(objectOrArray.map((key) => [key, true]))
        : objectOrArray;
  }

  const result = objectEntriesUnsafe(
    // eslint-disable-next-line ts/no-non-null-assertion, ts/no-unnecessary-condition -- for correct types
    objectOrArray! || {},
  ).filter(([, value]) => value);
  if (mode === 'nonEmptyArray' && result.length === 0) {
    // eslint-disable-next-line unicorn/no-useless-undefined
    return undefined;
  }
  // eslint-disable-next-line un/no-typeof-like-comparisons
  return mode === 'object' ? Object.fromEntries(result) : result.map(([key]) => key);
}

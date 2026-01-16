import path from 'node:path';
import {styleText} from 'node:util';
import {NodeFileSystem, NodeHttpClient} from '@effect/platform-node';
import {cli} from 'cleye';
import {Context, Effect, Layer, Ref} from 'effect';
import type {Ms} from 'ms-ts';
import PQueue from 'p-queue';
import type {ValueOf as ObjectValues} from 'type-fest';
import {type Storage as UnStorage, createStorage} from 'unstorage';
import unstorageFsDriver from 'unstorage/drivers/fs';
import ourPackageJson from '../package.json' with {type: 'json'};
import {
  type EslintPluginsDb,
  readEslintPluginsDb,
  updateEslintPluginsDb,
} from './plugins/plugins-db';
import {
  PackageMissingError,
  executePackageAsEslintPlugin,
  fetchPackageMetadata,
  fetchPackageStats,
} from './plugins/plugins-info';
import {
  CACHE_BASE_PATH,
  EslintPluginsDbRefTag,
  LoggerTag,
  type PackageInfo,
  PackagesInfoStorageLayer,
  PackagesInfoStorageTag,
  createLoggerLayer,
  getActualDependencyNames,
  isLikelyEslintPlugin,
} from './plugins/shared';

// #region Effect Context Tags

class CliFlagsTag extends Context.Tag('CliFlags')<
  CliFlagsTag,
  {verbose: boolean; clear: boolean; deep: boolean}
>() {}

class NewPackagesToCheckRefTag extends Context.Tag('NewPackagesToCheckRef')<
  NewPackagesToCheckRefTag,
  Ref.Ref<Set<string>>
>() {}

class NewEslintPluginsCountRefTag extends Context.Tag('NewEslintPluginsCountRef')<
  NewEslintPluginsCountRefTag,
  Ref.Ref<number>
>() {}

class TaskQueueTag extends Context.Tag('TaskQueue')<TaskQueueTag, PQueue>() {}

class KnownMissingFromNpmPackagesTag extends Context.Tag('KnownMissingFromNpmPackages')<
  KnownMissingFromNpmPackagesTag,
  UnStorage<true>
>() {}

class RuntimeLayerTag extends Context.Tag('RuntimeLayer')<
  RuntimeLayerTag,
  Layer.Layer<
    | LoggerTag
    | CliFlagsTag
    | TaskQueueTag
    | EslintPluginsDbRefTag
    | NewPackagesToCheckRefTag
    | NewEslintPluginsCountRefTag
    | PackagesInfoStorageTag
    | KnownMissingFromNpmPackagesTag
  >
>() {}

// #endregion

const TASK_QUEUE_CONCURRENCY = 10;
const CACHED_DATA_FRESH_FOR_MS = 604800000 satisfies Ms<'1w'>;

const argv = cli({
  flags: {
    verbose: {
      type: Boolean,
      default: false,
    },
    clear: {
      type: Boolean,
      default: false,
    },
    deep: {
      type: Boolean,
      default: false,
      description: 'Fetch all dependencies of dependencies, not already plugins',
    },
  },
});

const LoggerLayer = createLoggerLayer(argv.flags.verbose);
const CliFlagsLayer = Layer.succeed(CliFlagsTag, argv.flags);

const TaskQueueLayer = Layer.succeed(
  TaskQueueTag,
  new PQueue({concurrency: TASK_QUEUE_CONCURRENCY}),
);

const KnownMissingFromNpmPackagesLayer = Layer.succeed(
  KnownMissingFromNpmPackagesTag,
  createStorage<true>({
    driver: unstorageFsDriver({
      base: path.join(import.meta.dirname, CACHE_BASE_PATH, '../missing-from-npm-packages'),
    }),
  }),
);

const BaseLayer = Layer.mergeAll(
  LoggerLayer,
  CliFlagsLayer,
  TaskQueueLayer,
  PackagesInfoStorageLayer,
  KnownMissingFromNpmPackagesLayer,
);

const isInOurDependencies = (packageName: string) =>
  packageName in ourPackageJson.dependencies || packageName in ourPackageJson.devDependencies;

const updateEslintPluginsDbSafe = (packageName: string, meta: ObjectValues<EslintPluginsDb>) =>
  Effect.gen(function* () {
    const logger = yield* LoggerTag;
    const dbRef = yield* EslintPluginsDbRefTag;
    const db = yield* Ref.get(dbRef);

    if (!isLikelyEslintPlugin(packageName, db)) {
      return;
    }

    const styledPackageName = styleText('blueBright', packageName);

    const shouldSkip = Boolean(db[packageName]) || db[packageName] === meta;
    if (shouldSkip) {
      logger.verbose(`Saving ${styledPackageName} package info to the plugins DB skipped`);
      return;
    }

    logger.info(
      `Saving ${styledPackageName} package info to the plugins DB: ${styleText('gray', JSON.stringify(meta))}`,
    );
    yield* Ref.update(dbRef, (currentDb) => {
      currentDb[packageName] = meta;
      return currentDb;
    });
  });

const fetchPackageInfo = (packageName: string) =>
  Effect.gen(function* () {
    const logger = yield* LoggerTag;
    const flags = yield* CliFlagsTag;
    const newPackagesToCheckRef = yield* NewPackagesToCheckRefTag;
    const newEslintPluginsCountRef = yield* NewEslintPluginsCountRefTag;
    const packagesInfoStorage = yield* PackagesInfoStorageTag;
    const knownMissingFromNpmPackages = yield* KnownMissingFromNpmPackagesTag;

    const dbRef = yield* EslintPluginsDbRefTag;
    const db = yield* Ref.get(dbRef);

    const styledPackageName = styleText('blueBright', packageName);

    logger.verbose(`Fetching package info: ${styledPackageName}`);

    const isMissing = yield* Effect.promise(() => knownMissingFromNpmPackages.has(packageName));
    if (isMissing) {
      logger.verbose(`Package ${styledPackageName} is missing from npm, skipping`);
      yield* Effect.promise(async () => {
        await knownMissingFromNpmPackages.setItem(packageName, true);
      });
      yield* updateEslintPluginsDbSafe(packageName, {status: 'missing'});
      return null;
    }

    const cachedInfo = yield* Effect.promise(async () => {
      const result = await packagesInfoStorage.getItem(packageName);
      if (result != null) {
        if (Date.now() - new Date(result.updatedAt).getTime() > CACHED_DATA_FRESH_FOR_MS) {
          logger.warn(`Package ${styledPackageName} info fetched, but its info is stale`);
          return null;
        }

        logger.verbose(`Fetching package info skipped, already exists: ${styledPackageName}`);
      }
      return result;
    });

    const isPackageLikelyEslintPlugin = isLikelyEslintPlugin(packageName, db);

    const shouldRefetchStats =
      cachedInfo != null &&
      Object.keys(cachedInfo.stats || {}).length === 0 &&
      isPackageLikelyEslintPlugin;
    if (shouldRefetchStats) {
      logger.info(`Attempting to refetch stats of ${styledPackageName}`);
    }

    const shouldFetchStats = (!cachedInfo || shouldRefetchStats) && isPackageLikelyEslintPlugin;

    const packageMetadata =
      cachedInfo?.metadata ||
      (yield* fetchPackageMetadata(packageName).pipe(
        Effect.catchAll((error) => {
          if (error instanceof PackageMissingError) {
            return Effect.promise(async () => {
              await knownMissingFromNpmPackages.setItem(packageName, true);
              return null;
            });
          }
          return Effect.succeed(null);
        }),
      ));
    if (packageMetadata == null) {
      yield* updateEslintPluginsDbSafe(packageName, {status: 'missing'});
      return null;
    }

    const eslintPluginInfo =
      isPackageLikelyEslintPlugin && cachedInfo?.eslintPluginInfo === undefined
        ? yield* executePackageAsEslintPlugin(packageName).pipe(
            // @effect-diagnostics-next-line globalErrorInEffectFailure:off
            Effect.catchAll(() =>
              Effect.fail(
                new Error(
                  `An expected error occurred while executing ${packageName} package as an ESLint plugin`,
                ),
              ),
            ),
          )
        : null;

    const packageStats = shouldFetchStats
      ? yield* fetchPackageStats(packageName).pipe(
          Effect.catchAll((error) => {
            logger.warn(`Error fetching stats for ${styledPackageName}:`, error);
            return Effect.succeed(null);
          }),
        )
      : (cachedInfo?.stats ?? null);
    if (shouldFetchStats && !packageStats) {
      return null;
    }

    const newPackagesToCheck = yield* Ref.get(newPackagesToCheckRef);

    if (
      (newPackagesToCheck.has(packageName) && isPackageLikelyEslintPlugin) ||
      db[packageName] === null
    ) {
      yield* updateEslintPluginsDbSafe(
        packageName,
        packageMetadata.deprecated
          ? {status: 'deprecated'}
          : isInOurDependencies(packageName)
            ? {status: 'added'}
            : {status: 'fetched'},
      );
    }

    const allDependencies = new Set([
      ...getActualDependencyNames(packageMetadata.dependencies),
      ...getActualDependencyNames(packageMetadata.devDependencies),
      ...getActualDependencyNames(packageMetadata.peerDependencies),
      ...getActualDependencyNames(packageMetadata.optionalDependencies),
    ]);

    for (const dependencyPackageName of allDependencies) {
      const isEslintPlugin = isLikelyEslintPlugin(dependencyPackageName, db);
      const currentNewPackages = yield* Ref.get(newPackagesToCheckRef);
      const isMissingDependency = yield* Effect.promise(() =>
        knownMissingFromNpmPackages.has(dependencyPackageName),
      );

      if (
        currentNewPackages.has(dependencyPackageName) ||
        dependencyPackageName in db ||
        (!flags.deep && !isEslintPlugin) ||
        isMissingDependency
      ) {
        continue;
      }

      yield* Ref.update(newPackagesToCheckRef, (set) => {
        set.add(dependencyPackageName);
        return set;
      });

      const depPriority = isEslintPlugin ? 2 : 0;
      // eslint-disable-next-line ts/no-use-before-define
      yield* queueFetchPackageInfo(dependencyPackageName, depPriority);

      if (isEslintPlugin) {
        const newCount = yield* Ref.updateAndGet(newEslintPluginsCountRef, (n) => n + 1);
        logger.info(
          `👀 Potentially new ESLint plugin found: https://npmjs.com/${styleText('green', dependencyPackageName)} (dependency of ${styleText('gray', packageName)}) (new in total: ${newCount})`,
        );
      }
    }

    const packageInfo: PackageInfo = {
      updatedAt: new Date().toISOString(),
      metadata: packageMetadata,
      stats: packageStats || null,
      eslintPluginInfo,
    };

    if (!cachedInfo || shouldRefetchStats) {
      yield* Effect.promise(() => packagesInfoStorage.setItem(packageName, packageInfo));
    }

    return packageInfo;
  });

const queueFetchPackageInfo = (packageName: string, priority: number) =>
  Effect.gen(function* () {
    const taskQueue = yield* TaskQueueTag;
    const runtimeLayer = yield* RuntimeLayerTag;
    const adjustedPriority = isInOurDependencies(packageName) ? priority * 2 : priority;

    const runtimeLayerWithSelf = Layer.merge(
      runtimeLayer,
      Layer.succeed(RuntimeLayerTag, runtimeLayer),
    );

    void taskQueue.add(
      async () => {
        await Effect.runPromise(
          fetchPackageInfo(packageName).pipe(
            Effect.provide(Layer.mergeAll(runtimeLayerWithSelf, NodeHttpClient.layer)),
            Effect.catchAll(() => Effect.void),
          ),
        );
      },
      {priority: adjustedPriority},
    );
  });

const saveEslintPluginsDbPeriodically = Effect.gen(function* () {
  const logger = yield* LoggerTag;
  const dbRef = yield* EslintPluginsDbRefTag;

  return yield* Effect.forever(
    Effect.gen(function* () {
      yield* Effect.sleep('10 seconds');

      const db = yield* Ref.get(dbRef);

      logger.verbose('Saving ESLint plugins DB updates');

      yield* updateEslintPluginsDb(db).pipe(
        Effect.tap(() => logger.verbose('Saved ESLint plugins DB updates')),
        Effect.catchAll((error) => {
          logger.warn('Failed to save ESLint plugins DB updates:', error);
          return Effect.void;
        }),
      );
    }),
  );
});

const logQueueSizePeriodically = Effect.gen(function* () {
  const logger = yield* LoggerTag;
  const taskQueue = yield* TaskQueueTag;

  return yield* Effect.forever(
    Effect.gen(function* () {
      yield* Effect.sleep('10 seconds');
      logger.info(`Task queue size: ${styleText('blueBright', taskQueue.size.toString())}`);
    }),
  );
});

const mainProgram = Effect.gen(function* () {
  const logger = yield* LoggerTag;
  const taskQueue = yield* TaskQueueTag;
  const cliFlags = yield* CliFlagsTag;
  const packagesInfoStorage = yield* PackagesInfoStorageTag;

  const eslintPluginsDb = yield* readEslintPluginsDb;
  const dbRef = yield* Ref.make(eslintPluginsDb);
  const newPackagesToCheckRef = yield* Ref.make(new Set<string>());
  const newEslintPluginsCountRef = yield* Ref.make(0);

  const db = yield* Ref.get(dbRef);

  logger.info(`${Object.keys(db).length} ESLint plugins are in the plugins DB`);

  if (cliFlags.clear) {
    logger.info('Cache cleared');
    yield* Effect.promise(() => packagesInfoStorage.clear());
  }

  const refsLayer = Layer.mergeAll(
    Layer.succeed(EslintPluginsDbRefTag, dbRef),
    Layer.succeed(NewPackagesToCheckRefTag, newPackagesToCheckRef),
    Layer.succeed(NewEslintPluginsCountRefTag, newEslintPluginsCountRef),
  );

  const FullLayer = Layer.mergeAll(
    refsLayer,
    Layer.succeed(RuntimeLayerTag, Layer.merge(BaseLayer, refsLayer)),
  );

  for (const [packageName, packageInfo] of Object.entries(db)) {
    yield* queueFetchPackageInfo(packageName, packageInfo == null ? 3 : 1).pipe(
      Effect.provide(FullLayer),
    );
  }

  yield* Effect.fork(saveEslintPluginsDbPeriodically.pipe(Effect.provide(FullLayer)));
  yield* Effect.fork(logQueueSizePeriodically);

  yield* Effect.promise(() => taskQueue.onIdle());

  const finalDb = yield* Ref.get(dbRef);
  const newPackagesToCheck = yield* Ref.get(newPackagesToCheckRef);
  const dbSize = Object.keys(finalDb).length;

  logger.info(
    `${dbSize + newPackagesToCheck.size} packages info fetched: ${styleText('blueBright', dbSize.toString())} known and ${styleText('green', newPackagesToCheck.size.toString())} new`,
  );

  yield* updateEslintPluginsDb(finalDb);
});

const program = mainProgram.pipe(Effect.provide(Layer.mergeAll(BaseLayer, NodeFileSystem.layer)));

await Effect.runPromise(program);

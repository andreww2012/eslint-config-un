// cspell:ignore millis scandir
import {styleText} from 'node:util';
import {Worker} from 'node:worker_threads';
import {HttpClient, HttpClientError, HttpClientRequest} from '@effect/platform';
import {Data, DateTime, Duration, Effect} from 'effect';
import type {Ms} from 'ms-ts';
import * as packageFetcher from 'package-json';
import * as z from 'zod';
import {
  type ExecuteAnyEslintPluginWorkerInitialData,
  type ExecuteAnyEslintPluginWorkerOutput,
  LoggerTag,
} from './shared';

const STATS_THROTTLE_INTERVAL_MS = 3000;

let lastStatsFetchTime = 0;

const statsSemaphore = Effect.unsafeMakeSemaphore(1);

const throttleStats = Effect.gen(function* () {
  const now = Date.now();
  const timeSinceLastFetch = now - lastStatsFetchTime;
  const waitTime = STATS_THROTTLE_INTERVAL_MS - timeSinceLastFetch;

  if (waitTime > 0) {
    yield* Effect.sleep(Duration.millis(waitTime));
  }

  // eslint-disable-next-line require-atomic-updates
  lastStatsFetchTime = Date.now();
});

export class PackageMissingError extends Data.TaggedError('PackageMissingError')<{
  packageName: string;
}> {}

class PackageVersionNotFoundError extends Data.TaggedError('PackageVersionNotFoundError')<{
  packageName: string;
  message: string;
}> {}

class PackageFetchUnknownError extends Data.TaggedError('PackageFetchUnknownError')<{
  packageName: string;
  cause: unknown;
}> {}

type PackageFetchError =
  | PackageMissingError
  | PackageVersionNotFoundError
  | PackageFetchUnknownError;

export const fetchPackageMetadata = (packageName: string) =>
  Effect.gen(function* () {
    const logger = yield* LoggerTag;
    const styledName = styleText('blueBright', packageName);

    logger.verbose(`Fetching package metadata: ${styledName}`);

    const result = yield* Effect.tryPromise({
      try: () => packageFetcher.default(packageName, {fullMetadata: true}),
      catch: (error): PackageFetchError => {
        if (
          error instanceof packageFetcher.PackageNotFoundError ||
          (error instanceof Error &&
            error.message === "Cannot read properties of undefined (reading 'latest')")
        ) {
          logger.error(`Package ${styledName} not found`);
          return new PackageMissingError({packageName});
        }
        if (error instanceof packageFetcher.VersionNotFoundError) {
          logger.error(`Version ${styledName} not found: ${error.message}`);
          return new PackageVersionNotFoundError({packageName, message: error.message});
        }
        logger.error(`Error fetching ${styledName} package metadata:`, error);
        return new PackageFetchUnknownError({packageName, cause: error});
      },
    });

    logger.verbose(`✅ Package metadata fetched: ${styledName}`);

    return result;
  });

class PackageStatsFetchError extends Data.TaggedError('PackageStatsFetchError')<{
  packageName: string;
  cause: unknown;
}> {}

class PackageStatsParseError extends Data.TaggedError('PackageStatsParseError')<{
  packageName: string;
  cause: unknown;
}> {}

export const fetchPackageStats = (packageName: string) =>
  statsSemaphore.withPermits(1)(
    Effect.gen(function* () {
      yield* throttleStats;

      const logger = yield* LoggerTag;
      const httpClient = yield* HttpClient.HttpClient;
      const styledName = styleText('blueBright', packageName);

      logger.verbose(`Fetching package stats: ${styledName}`);

      const todayDateTime = yield* DateTime.now;
      const monthAgoDateTime = DateTime.subtract(todayDateTime, {months: 1});

      const todayDateIso = DateTime.formatIsoDate(todayDateTime);
      const monthAgoDateIso = DateTime.formatIsoDate(monthAgoDateTime);

      const statsUrl = `https://npm-stat.com/api/download-counts?package=${packageName}&from=${monthAgoDateIso}&until=${todayDateIso}`;

      const request = HttpClientRequest.get(statsUrl);

      const responseJson = yield* httpClient.execute(request).pipe(
        Effect.flatMap((response) => response.json),
        Effect.mapError((error) =>
          error instanceof HttpClientError.ResponseError
            ? new PackageStatsParseError({packageName, cause: error})
            : new PackageStatsFetchError({packageName, cause: error}),
        ),
      );

      const responseSchemaZod = z.strictObject({
        [packageName]: z.record(z.string(), z.int()),
      });

      const parseResult = yield* Effect.try({
        try: () => responseSchemaZod.parse(responseJson),
        catch: (error) => new PackageStatsParseError({packageName, cause: error}),
      });

      const result = parseResult[packageName] || {};

      if (Object.keys(result).length === 0) {
        logger.warn(
          `Package ${styledName} stats is empty, request URL was ${statsUrl}, response was:`,
          responseJson,
        );
      }

      logger.verbose(`✅ Package stats fetched: ${styledName}`);

      return result;
    }),
  );

const ESLINT_PLUGIN_EXECUTION_TIMEOUT_MS = 300_000 satisfies Ms<'5m'>;

// TODO start executing packages in a separate process so that it won't crash the main process
const CRASHING_PACKAGES = new Set(['@servicenow/eslint-plugin']);

export const executePackageAsEslintPlugin = (packageName: string) =>
  Effect.gen(function* () {
    const logger = yield* LoggerTag;
    const styledName = styleText('blueBright', packageName);

    logger.verbose(`Attempting to install & execute module: ${styledName}`);

    if (CRASHING_PACKAGES.has(packageName)) {
      logger.warn(`Skipping execution of ${styledName} package, it's known to be crashing`);
      return null;
    }

    return yield* Effect.tryPromise(
      () =>
        new Promise<ExecuteAnyEslintPluginWorkerOutput>((resolve, reject) => {
          const workerPath = new URL('./execute-any-eslint-plugin.worker.ts', import.meta.url);
          const worker = new Worker(
            `import('tsx/esm/api').then((tsx) => {tsx.register(); return import('${workerPath.toString()}')});`,
            {
              eval: true,
              workerData: {packageName} satisfies ExecuteAnyEslintPluginWorkerInitialData,
              stdout: false,
              stderr: false,
            },
          );

          const workerTimeoutTimer = setTimeout(() => {
            logger.verbose(
              `Executing module ${styledName} timed out after ${ESLINT_PLUGIN_EXECUTION_TIMEOUT_MS} ms`,
            );
            void worker.terminate().then(() => {
              reject(new Error(`Worker timed out after ${ESLINT_PLUGIN_EXECUTION_TIMEOUT_MS} ms`));
            });
          }, ESLINT_PLUGIN_EXECUTION_TIMEOUT_MS);

          worker.on('error', (error) => {
            clearTimeout(workerTimeoutTimer);
            reject(error);
            logger.warn(`Worker error while trying to execute module ${styledName}`, error);
          });

          worker.on('message', (message: ExecuteAnyEslintPluginWorkerOutput) => {
            clearTimeout(workerTimeoutTimer);

            if (message && 'error' in message) {
              logger.warn(
                `Error during executing package ${styledName}:`,
                styleText('gray', JSON.stringify(message.error)),
              );
            } else {
              if (message === null) {
                logger.warn(
                  `Package ${styledName} is probably not an ESLint plugin or module evaluation resulted in no exports`,
                );
              }

              logger.verbose(
                `✅ Package ${styledName} executed successfully:`,
                styleText('gray', JSON.stringify(message)),
              );
            }

            resolve(message);
          });
        }),
    );
  });

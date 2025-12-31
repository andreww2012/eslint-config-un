import fs from 'node:fs';
import path from 'node:path';
import {styleText} from 'node:util';
import {cli} from 'cleye';
import consola from 'consola';
import {renderTable} from 'console-table-printer';
import {differenceInMonths, formatDistanceToNow} from 'date-fns';
import {sum} from 'es-toolkit';
import type {Ms} from 'ms-ts';
import parseNpmPackageArgument from 'npm-package-arg';
import PQueue from 'p-queue';
import pThrottle from 'p-throttle';
import fetchPackageMetadataInternal, {
  type FullMetadata,
  type FullVersion,
  PackageNotFoundError,
  VersionNotFoundError,
} from 'package-json';
import {createStorage} from 'unstorage';
import unstorageFsDriver from 'unstorage/drivers/fs';
import * as z from 'zod';
import KNOWN_ESLINT_PLUGINS from '../data/known-eslint-plugins.json' with {type: 'json'};
import ourPackageJson from '../package.json' with {type: 'json'};

const TASK_QUEUE_CONCURRENCY = 10;
const CACHE_BASE_PATH = '../node_modules/.cache/eslint-config-un/packages-info';
const CACHED_DATA_FRESH_FOR_MS = 604800000 satisfies Ms<'1w'>;

const ANALYSIS_CRITERION_WEIGHTS = {
  recency: 0.2,
  downloads: 0.45,
  dependencies: 0.15,
  eslintPluginsDependencies: 0.2,
} as const;

const scoreMetric = (
  value: number,
  goodBoundary: number,
  badBoundary: number,
  options: {
    logarithmic?: boolean;
    /** True if higher values are better (like downloads) */
    inverse?: boolean;
  } = {},
): number => {
  const {logarithmic = false, inverse = false} = options;

  const good = goodBoundary;
  const bad = badBoundary;

  if (inverse) {
    if (value >= good) {
      return 1;
    }
    if (value <= bad) {
      return 0;
    }
  } else {
    if (value <= good) {
      return 1;
    }
    if (value >= bad) {
      return 0;
    }
  }

  if (logarithmic) {
    const logValue = Math.log10(value);
    const logGood = Math.log10(good);
    const logBad = Math.log10(bad);

    return (logValue - logBad) / (logGood - logBad);
  }

  return (value - bad) / (good - bad);
};

const isLikelyEslintPlugin = (packageName: string) =>
  (packageName.includes('eslint-plugin') || KNOWN_ESLINT_PLUGINS.includes(packageName)) &&
  !packageName.startsWith('@types/');

interface PackageInfo {
  updatedAt: string;
  metadata: FullVersion & Pick<FullMetadata, 'time'>;
  stats: Record<string /* ISO date only */, number> | null;
}

const packagesInfoStorage = createStorage<PackageInfo>({
  driver: unstorageFsDriver({
    base: path.join(import.meta.dirname, CACHE_BASE_PATH),
  }),
});
const knownMissingFromNpmPackages = createStorage<true>({
  driver: unstorageFsDriver({
    base: path.join(import.meta.dirname, CACHE_BASE_PATH, '../missing-from-npm-packages'),
  }),
});

const taskQueue = new PQueue({concurrency: TASK_QUEUE_CONCURRENCY});

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
    analyze: {
      type: Boolean,
      default: false,
      description: 'Enables analyze mode instead of fetch mode',
    },
  },
});

// #region main

const cliFlags = argv.flags;

const newPackagesToCheck = new Set<string>();
let newEslintPluginsCount = 0;

const logger = consola.create({
  level: cliFlags.verbose ? Number.POSITIVE_INFINITY : 5,
});

logger.info(`${KNOWN_ESLINT_PLUGINS.length} eslint plugins are known`);

if (cliFlags.analyze) {
  await analyze();
  process.exit(0);
}

if (cliFlags.clear) {
  logger.info('Cache cleared');
  await packagesInfoStorage.clear();
}

const queueFetchPackageInfo = (packageName: string, priority = 0) => {
  void taskQueue.add(async () => await fetchPackageInfo(packageName), {
    priority,
  });
};

KNOWN_ESLINT_PLUGINS.forEach((packageName) => {
  queueFetchPackageInfo(packageName, 1);
});

// eslint-disable-next-line unicorn/prefer-top-level-await
void taskQueue.onIdle().then(() => {
  logger.info(
    `${KNOWN_ESLINT_PLUGINS.length + newPackagesToCheck.size} packages info fetched: ${styleText('blueBright', KNOWN_ESLINT_PLUGINS.length.toString())} known and ${styleText('green', newPackagesToCheck.size.toString())} new`,
  );
  process.exit(0);
});

setInterval(() => {
  logger.info(`Task queue size: ${styleText('blueBright', taskQueue.size.toString())}`);
}, 10_000);

// #endregion

async function fetchPackageMetadata(packageName: string) {
  logger.verbose(`Fetching package metadata: ${styleText('blueBright', packageName)}`);
  try {
    const result = await fetchPackageMetadataInternal(packageName, {fullMetadata: true});
    logger.verbose(`✅ Package metadata fetched: ${styleText('blueBright', packageName)}`);
    return result;
  } catch (error: unknown) {
    if (error instanceof PackageNotFoundError) {
      logger.error(`Package ${styleText('blueBright', packageName)} not found`);
      await knownMissingFromNpmPackages.set(packageName, true);
    } else if (error instanceof VersionNotFoundError) {
      logger.error(`Version ${styleText('blueBright', packageName)} not found: ${error.message}`);
    } else {
      logger.error(
        `Error fetching ${styleText('blueBright', packageName)} package metadata:`,
        error,
      );
      if (
        error instanceof Error &&
        error.message === "Cannot read properties of undefined (reading 'latest')"
      ) {
        await knownMissingFromNpmPackages.set(packageName, true);
      }
    }
  }
  return null;
}

// Do NOT change the throttling options - they're configured so that we don't get rate limited
const fetchPackageStats = pThrottle({limit: 1, interval: 3000, strict: true})(async (
  packageName: string,
) => {
  logger.verbose(`Fetching package stats: ${styleText('blueBright', packageName)}`);
  const todayDate = new Date();

  const monthAgoDate = new Date(todayDate);
  monthAgoDate.setMonth(monthAgoDate.getMonth() - 1);

  const todayDateIso = todayDate.toISOString().split('T')[0] || '';
  const monthAgoDateIso = monthAgoDate.toISOString().split('T')[0] || '';

  const statsUrl = `https://npm-stat.com/api/download-counts?package=${packageName}&from=${monthAgoDateIso}&until=${todayDateIso}`;
  // eslint-disable-next-line node/no-unsupported-features/node-builtins
  const statsResponse = await fetch(statsUrl);

  const responseSchemaZod = z.strictObject({
    [packageName]: z.record(z.string(), z.int()),
  });

  try {
    const responseJson = await statsResponse.json();
    const result = responseSchemaZod.parse(responseJson)[packageName] || {};
    if (Object.keys(result).length === 0) {
      logger.warn(
        `Package ${styleText('blueBright', packageName)} stats is empty, request URL was ${statsUrl}, response was:`,
        responseJson,
      );
    }
    logger.verbose(`✅ Package stats fetched: ${styleText('blueBright', packageName)}`);
    return result;
  } catch (error: unknown) {
    logger.error(`Error fetching ${styleText('blueBright', packageName)} package stats:`, error);
    return null;
  }
});

async function fetchPackageInfo(packageName: string) {
  logger.verbose(`Fetching package info: ${styleText('blueBright', packageName)}`);

  if (await knownMissingFromNpmPackages.has(packageName)) {
    logger.verbose(`Package ${styleText('blueBright', packageName)} is missing from npm, skipping`);
    return null;
  }

  const cachedInfo = await packagesInfoStorage.getItem(packageName);
  if (cachedInfo != null) {
    if (Date.now() - new Date(cachedInfo.updatedAt).getTime() > CACHED_DATA_FRESH_FOR_MS) {
      logger.warn(`Package ${packageName} info fetched, but is is stale`);
    } else {
      logger.verbose(
        `Fetching package info skipped, already exists: ${styleText('blueBright', packageName)}`,
      );
    }
  }

  const isPackageLikelyEslintPlugin = isLikelyEslintPlugin(packageName);

  const shouldRefetchStats =
    cachedInfo != null &&
    Object.keys(cachedInfo.stats || {}).length === 0 &&
    isPackageLikelyEslintPlugin;
  if (shouldRefetchStats) {
    logger.info(`Attempting to refetch stats of ${styleText('blueBright', packageName)}`);
  }

  const shouldFetchStats = (!cachedInfo || shouldRefetchStats) && isPackageLikelyEslintPlugin;

  const [packageMetadata, packageStats] = await Promise.all([
    cachedInfo?.metadata ?? fetchPackageMetadata(packageName),
    shouldFetchStats ? fetchPackageStats(packageName) : cachedInfo?.stats,
  ]);

  if (!packageMetadata || (shouldFetchStats && !packageStats)) {
    return null;
  }

  if (newPackagesToCheck.has(packageName) && isPackageLikelyEslintPlugin) {
    const knownEslintPluginsPath = path.join(
      import.meta.dirname,
      '../data/known-eslint-plugins.json',
    );
    fs.writeFileSync(
      knownEslintPluginsPath,
      JSON.stringify(
        [
          ...new Set(
            [
              ...KNOWN_ESLINT_PLUGINS,
              ...(JSON.parse(fs.readFileSync(knownEslintPluginsPath, 'utf8')) as string[]),
              packageName,
              // eslint-disable-next-line unicorn/no-array-sort
            ].sort(),
          ),
        ],
        null,
        2,
      ),
      'utf8',
    );
  }

  const dependencySpecifiers = [
    ...Object.entries(packageMetadata.dependencies || {}),
    ...Object.entries(packageMetadata.devDependencies || {}),
    ...Object.entries(packageMetadata.peerDependencies || {}),
    ...Object.entries(packageMetadata.optionalDependencies || {}),
  ]
    .map(([originalName, originalVersion]) => {
      try {
        const parsedSpecifier = parseNpmPackageArgument(`${originalName}@${originalVersion}`);
        if (
          (parsedSpecifier.type === 'range' ||
            parsedSpecifier.type === 'alias' ||
            parsedSpecifier.type === 'tag' ||
            parsedSpecifier.type === 'version') &&
          parsedSpecifier.name != null
        ) {
          return parsedSpecifier.name;
        }
        return null;
      } catch {
        return null;
      }
    })
    .filter((v) => v != null);

  await Promise.all(
    Array.from(new Set(dependencySpecifiers), async (dependencyPackageName) => {
      const isEslintPlugin = isLikelyEslintPlugin(dependencyPackageName);
      if (
        newPackagesToCheck.has(dependencyPackageName) ||
        KNOWN_ESLINT_PLUGINS.includes(dependencyPackageName) ||
        (!cliFlags.deep && !isEslintPlugin) ||
        (await knownMissingFromNpmPackages.has(dependencyPackageName))
      ) {
        return;
      }

      newPackagesToCheck.add(dependencyPackageName);
      queueFetchPackageInfo(dependencyPackageName, isEslintPlugin ? 2 : 0);

      if (isEslintPlugin) {
        logger.info(
          `👀 Potentially new ESLint plugin found: https://npmjs.com/${styleText('green', dependencyPackageName)} (dependency of ${styleText('gray', packageName)}) (new in total: ${(newEslintPluginsCount += 1)})`,
        );
      }
    }),
  );

  const packageInfo: PackageInfo = {
    updatedAt: new Date().toISOString(),
    metadata: packageMetadata,
    stats: packageStats || null,
  };

  if (!cachedInfo || shouldRefetchStats) {
    await packagesInfoStorage.setItem(packageName, packageInfo);
  }

  return packageInfo;
}

async function analyze() {
  const pluginsInfo = await packagesInfoStorage.getItems(KNOWN_ESLINT_PLUGINS);

  const pluginsAnalyzed = pluginsInfo
    .map(({key, value: info}) => {
      // eslint-disable-next-line ts/no-unnecessary-condition -- types are lying, `value` can be `null`
      if (info == null) {
        return null;
      }
      const name = key.replace(':', '/');
      const downloadsPerDay = Object.values(info.stats || {});
      const totalDownloads = sum(downloadsPerDay);
      const downloadsPerDayAverage = totalDownloads / downloadsPerDay.length || 0;
      const isDeprecated = info.metadata.deprecated != null;
      const isAlreadyIncluded =
        name in ourPackageJson.dependencies || name in ourPackageJson.devDependencies;
      const lastUpdated = new Date(info.metadata.time[info.metadata.version || ''] || '');

      const yearsSinceLastUpdated = differenceInMonths(new Date(), lastUpdated);
      const scoreRecency = scoreMetric(yearsSinceLastUpdated, 3, 12 * 10 /* 10 years */);

      const scoreDownloads = scoreMetric(downloadsPerDayAverage, 50_000, 500, {
        inverse: true,
      });

      const allDirectDependencies = Object.keys(info.metadata.dependencies || {});
      const scoreDependencies = scoreMetric(allDirectDependencies.length, 3, 20, {
        logarithmic: true,
      });

      const scoreEslintPluginsDependencies = Math.exp(
        -0.5 *
          allDirectDependencies.filter((packageName) => isLikelyEslintPlugin(packageName)).length,
      );

      const score =
        isDeprecated || isAlreadyIncluded
          ? 0
          : scoreRecency * ANALYSIS_CRITERION_WEIGHTS.recency +
            scoreDownloads * ANALYSIS_CRITERION_WEIGHTS.downloads +
            scoreDependencies * ANALYSIS_CRITERION_WEIGHTS.dependencies +
            scoreEslintPluginsDependencies * ANALYSIS_CRITERION_WEIGHTS.eslintPluginsDependencies;

      return {
        name,
        isDeprecated,
        isAlreadyIncluded,
        downloadsPerDayAverage,
        lastUpdated,
        score,
      };
    })
    .filter((v) => v != null)
    // eslint-disable-next-line unicorn/no-array-sort
    .sort((a, b) => a.score - b.score || a.downloadsPerDayAverage - b.downloadsPerDayAverage);

  logger.log(
    renderTable(
      pluginsAnalyzed.map((plugin) => ({
        'Plugin name': `${plugin.isAlreadyIncluded ? '✅ ' : plugin.isDeprecated ? '🚫 ' : ''} https://npmjs.com/${styleText('blueBright', plugin.name)}`,
        'Downloads per day (last month)': Math.round(
          plugin.downloadsPerDayAverage,
        ).toLocaleString(),
        'Last updated': formatDistanceToNow(plugin.lastUpdated),
        Score: styleText('gray', Number(plugin.score.toFixed(3)).toString()),
      })),
    ),
  );
}

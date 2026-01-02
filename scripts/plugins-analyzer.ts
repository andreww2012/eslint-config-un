import {styleText} from 'node:util';
import {NodeFileSystem} from '@effect/platform-node';
import {renderTable} from 'console-table-printer';
import {differenceInMonths, formatDistanceToNow} from 'date-fns';
import {Effect, Layer, Ref} from 'effect';
import {sum} from 'es-toolkit';
import type {ValueOf as ObjectValues} from 'type-fest';
import {type EslintPluginsDb, readEslintPluginsDb} from './plugins/plugins-db';
import {
  EslintPluginsDbRefTag,
  LoggerTag,
  PackagesInfoStorageLayer,
  PackagesInfoStorageTag,
  createLoggerLayer,
  getActualDependencyNames,
  isLikelyEslintPlugin,
} from './plugins/shared';

const ANALYSIS_CRITERION_WEIGHTS = {
  recency: 0.2,
  downloads: 0.45,
  dependencies: 0.15,
  eslintPluginsDependencies: 0.2,
} as const;

const ESLINT_PLUGIN_STATUS_EMOJIS: Record<(ObjectValues<EslintPluginsDb> & {})['status'], string> =
  {
    added: '✅',
    declined: '❌',
    deprecated: '⚠️',
    missing: '🚫',
    tba: '➕',
    fetched: '⏭️',
  };

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

export const analyze = Effect.gen(function* () {
  const logger = yield* LoggerTag;
  const packagesInfoStorage = yield* PackagesInfoStorageTag;
  const dbRef = yield* EslintPluginsDbRefTag;
  const eslintPluginsDb = yield* Ref.get(dbRef);

  const pluginsInfo = yield* Effect.promise(() =>
    packagesInfoStorage.getItems(Object.keys(eslintPluginsDb)),
  );

  const pluginsAnalyzed = pluginsInfo
    .map(({key, value: info}) => {
      const name = key.replace(':', '/');
      const status = eslintPluginsDb[name];
      if (
        // eslint-disable-next-line ts/no-unnecessary-condition -- types are lying, `value` can be `null`
        info == null ||
        status === undefined
      ) {
        return null;
      }

      const downloadsPerDay = Object.values(info.stats || {});
      const totalDownloads = sum(downloadsPerDay);
      const downloadsPerDayAverage = totalDownloads / downloadsPerDay.length || 0;
      const lastUpdated = new Date(info.metadata.time[info.metadata.version || ''] || '');

      const yearsSinceLastUpdated = differenceInMonths(new Date(), lastUpdated);
      const scoreRecency = scoreMetric(yearsSinceLastUpdated, 3, 12 * 10 /* 10 years */);

      const scoreDownloads = scoreMetric(downloadsPerDayAverage, 50_000, 500, {
        inverse: true,
      });

      const allDirectDependencies = getActualDependencyNames(info.metadata.dependencies);
      const scoreDependencies = scoreMetric(allDirectDependencies.length, 3, 20, {
        logarithmic: true,
      });

      const directDependenciesOtherEslintPlugins = allDirectDependencies.filter((packageName) =>
        isLikelyEslintPlugin(packageName, eslintPluginsDb),
      );
      const scoreEslintPluginsDependencies = Math.exp(
        -0.5 * directDependenciesOtherEslintPlugins.length,
      );

      const hasFinalStatus = Boolean(
        status && status.status !== 'tba' && status.status !== 'fetched',
      );

      const score = hasFinalStatus
        ? 0
        : scoreRecency * ANALYSIS_CRITERION_WEIGHTS.recency +
          scoreDownloads * ANALYSIS_CRITERION_WEIGHTS.downloads +
          scoreDependencies * ANALYSIS_CRITERION_WEIGHTS.dependencies +
          scoreEslintPluginsDependencies * ANALYSIS_CRITERION_WEIGHTS.eslintPluginsDependencies;

      return {
        name,
        status,
        downloadsPerDayAverage,
        lastUpdated,
        hasFinalStatus,
        allDirectDependencies,
        directDependenciesOtherEslintPlugins,
        score,
      };
    })
    .filter((v) => v != null)
    // eslint-disable-next-line unicorn/no-array-sort
    .sort((a, b) => a.score - b.score || a.downloadsPerDayAverage - b.downloadsPerDayAverage);

  if (pluginsAnalyzed.length > 0) {
    const shownTable = renderTable(
      pluginsAnalyzed.map((plugin) => {
        const status = plugin.status?.status;
        const depsCount = plugin.allDirectDependencies.length;
        const pluginsDepsCount = plugin.directDependenciesOtherEslintPlugins.length;
        return {
          'Plugin name': `${status == null ? '' : `${ESLINT_PLUGIN_STATUS_EMOJIS[status]}${status === 'declined' ? ` (${plugin.status?.reason})` : ''}`}https://npmjs.com/${styleText('blueBright', plugin.name)}`,

          'Deps (plugins)': `${styleText(depsCount === 0 ? 'green' : depsCount < 5 ? 'yellow' : 'red', depsCount.toString())}${pluginsDepsCount > 0 ? styleText(pluginsDepsCount < 2 ? 'yellow' : 'red', ` (${pluginsDepsCount})`) : ''}`,

          'Downloads per day (last month)': Math.round(
            plugin.downloadsPerDayAverage,
          ).toLocaleString(),

          'Last updated': formatDistanceToNow(plugin.lastUpdated),
          Score: styleText('gray', Number(plugin.score.toFixed(3)).toString()),
        };
      }),
    );
    logger.log(shownTable);
  }

  const pluginsWithFinalStatusCount = pluginsAnalyzed.filter(
    (plugin) => plugin.hasFinalStatus,
  ).length;

  logger.info(
    `${pluginsAnalyzed.length} plugins are shown in the table, ${pluginsAnalyzed.length - pluginsWithFinalStatusCount} of them are to be worked on`,
  );
});

const LoggerLayer = createLoggerLayer();

const BaseLayer = Layer.mergeAll(LoggerLayer, PackagesInfoStorageLayer);

const mainProgram = Effect.gen(function* () {
  const eslintPluginsDb = yield* readEslintPluginsDb;
  const dbRef = yield* Ref.make(eslintPluginsDb);

  const refsLayer = Layer.succeed(EslintPluginsDbRefTag, dbRef);

  yield* analyze.pipe(Effect.provide(refsLayer));
});

const program = mainProgram.pipe(Effect.provide(BaseLayer), Effect.provide(NodeFileSystem.layer));

await Effect.runPromise(program);

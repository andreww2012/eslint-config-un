// cspell:ignore inversed
import {styleText} from 'node:util';
import {NodeFileSystem} from '@effect/platform-node';
import {cli} from 'cleye';
import {renderTable} from 'console-table-printer';
import {differenceInMonths, formatDistanceToNow} from 'date-fns';
import {Effect, Layer, Ref} from 'effect';
import {sum} from 'es-toolkit';
import type {ValueOf as ObjectValues} from 'type-fest';
import * as z from 'zod';
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

const SortingZod = z.enum(['score', 'downloads', 'recency', 'deps', 'deps-plugins', 'rules']);
type Sorting = z.output<typeof SortingZod>;

const argv = cli({
  strictFlags: true,
  flags: {
    sort: {
      type: (value) => SortingZod.parse(value),
      // eslint-disable-next-line ts/no-unnecessary-type-assertion -- wrong
      default: 'score' satisfies Sorting as Sorting,
    },
    sortInverse: {
      type: Boolean,
      default: false,
    },
  },
});

const cliFlags = argv.flags;

const ANALYSIS_CRITERION_WEIGHTS = {
  recency: 0.25,
  downloads: 0.35,
  dependencies: 0.05,
  eslintPluginsDependencies: 0.25,
  rulesCount: 0.1,
} as const;

const ESLINT_PLUGIN_STATUSES_META: Record<
  (ObjectValues<EslintPluginsDb> & {})['status'],
  {
    emoji: string;
    priority: number;
  }
> = {
  added: {emoji: '✅', priority: 1},
  declined: {emoji: '❌', priority: 2},
  deprecated: {emoji: '⚠️', priority: 3},
  missing: {emoji: '🚫', priority: 4},
  uncertain: {emoji: '❓', priority: 5},
  accepted: {emoji: '➕', priority: 6},
  fetched: {emoji: '⏭️', priority: 7},
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
        'error' in info ||
        status == null
      ) {
        return null;
      }

      const statusMeta = ESLINT_PLUGIN_STATUSES_META[status.status];

      const downloadsPerDay = Object.values(info.stats || {});
      const totalDownloads = sum(downloadsPerDay);
      const downloadsPerDayAverage = totalDownloads / downloadsPerDay.length || 0;
      const lastUpdated = new Date(info.metadata.time[info.metadata.version || ''] || '');

      const yearsSinceLastUpdated = differenceInMonths(new Date(), lastUpdated);
      const scoreRecency = scoreMetric(yearsSinceLastUpdated, 3, 12 * 10 /* 10 years */);

      const scoreDownloads = scoreMetric(downloadsPerDayAverage, 100_000, 300, {
        inverse: true,
        logarithmic: true,
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

      const pluginInfo = info.eslintPluginInfo;

      const rulesCount = pluginInfo && !('error' in pluginInfo) ? pluginInfo.customRules.length : 0;
      const scoreRulesCount = scoreMetric(rulesCount, 5, 1, {inverse: true});

      let score =
        scoreRecency * ANALYSIS_CRITERION_WEIGHTS.recency +
        scoreDownloads * ANALYSIS_CRITERION_WEIGHTS.downloads +
        scoreDependencies * ANALYSIS_CRITERION_WEIGHTS.dependencies +
        scoreEslintPluginsDependencies * ANALYSIS_CRITERION_WEIGHTS.eslintPluginsDependencies +
        scoreRulesCount * ANALYSIS_CRITERION_WEIGHTS.rulesCount;
      if (downloadsPerDayAverage <= 10) {
        score *= 0.75;
      }
      if (pluginInfo && !('error' in pluginInfo) && rulesCount === 0) {
        score = 0;
      }

      return {
        name,
        status,
        statusMeta,
        downloadsPerDayAverage,
        lastUpdated,
        allDirectDependencies,
        directDependenciesOtherEslintPlugins,
        pluginInfo,
        score,
      };
    })
    .filter((v) => v != null);

  let pluginsSortingCriterion!: (value: (typeof pluginsAnalyzed)[number]) => number;
  let sortInversedByDefault = false;
  switch (cliFlags.sort) {
    case 'score': {
      pluginsSortingCriterion = (value) => value.statusMeta.priority;
      break;
    }
    case 'deps': {
      pluginsSortingCriterion = (value) => value.allDirectDependencies.length;
      sortInversedByDefault = true;
      break;
    }
    case 'deps-plugins': {
      pluginsSortingCriterion = (value) => value.directDependenciesOtherEslintPlugins.length;
      sortInversedByDefault = true;
      break;
    }
    case 'downloads': {
      pluginsSortingCriterion = (value) => value.downloadsPerDayAverage;
      break;
    }
    case 'recency': {
      pluginsSortingCriterion = (value) => value.lastUpdated.getTime();
      break;
    }
    case 'rules': {
      pluginsSortingCriterion = ({pluginInfo}) =>
        pluginInfo && 'customRules' in pluginInfo ? pluginInfo.customRules.length : 0;
      break;
    }
    default: {
      cliFlags.sort satisfies never;
    }
  }

  pluginsAnalyzed.sort(
    (a, b) =>
      a.statusMeta.priority - b.statusMeta.priority ||
      (pluginsSortingCriterion(a) - pluginsSortingCriterion(b)) *
        (cliFlags.sortInverse ? -1 : 1) *
        (sortInversedByDefault ? -1 : 1) ||
      a.score - b.score ||
      a.downloadsPerDayAverage - b.downloadsPerDayAverage ||
      b.allDirectDependencies.length - a.allDirectDependencies.length,
  );

  if (pluginsAnalyzed.length > 0) {
    const shownTable = renderTable(
      pluginsAnalyzed.map((plugin) => {
        const {status: statusId} = plugin.status;
        const statusMeta = ESLINT_PLUGIN_STATUSES_META[statusId];

        const depsCount = plugin.allDirectDependencies.length;
        const pluginsDepsCount = plugin.directDependenciesOtherEslintPlugins.length;

        const {pluginInfo} = plugin;

        return {
          // TODO rendering of `\n` is broken
          'Plugin name': `${statusMeta.emoji}${statusId === 'declined' ? `\n(${plugin.status.reason})` : ''}${statusId === 'accepted' ? `(${plugin.status.priority})` : ''} https://npmx.dev/${styleText('blueBright', plugin.name)}`,

          'Rules count':
            pluginInfo == null
              ? styleText('gray', '❓ rules')
              : 'error' in pluginInfo
                ? styleText('yellow', `Error (${styleText('gray', pluginInfo.error.code)})`)
                : pluginInfo.customRules.length === 0
                  ? styleText('red', 'No rules')
                  : `${pluginInfo.customRules.length} rule${pluginInfo.customRules.length === 1 ? '' : 's'}`,

          'Deps (plugins)': `${styleText(depsCount === 0 ? 'green' : depsCount < 10 ? 'yellow' : 'red', depsCount.toString())}${pluginsDepsCount > 0 ? styleText(pluginsDepsCount < 2 ? 'yellow' : 'red', ` (${pluginsDepsCount})`) : ''}`,

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
    (plugin) => plugin.status.status !== 'accepted' && plugin.status.status !== 'fetched',
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

const program = mainProgram.pipe(Effect.provide(Layer.mergeAll(BaseLayer, NodeFileSystem.layer)));

await Effect.runPromise(program);

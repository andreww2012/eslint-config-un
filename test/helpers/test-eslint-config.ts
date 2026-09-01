import fs from 'node:fs/promises';
import path from 'node:path';
import {ESLint} from 'eslint';
// eslint-disable-next-line import/no-extraneous-dependencies
import pathe from 'pathe';
import type {
  EslintConfigUnInternalOptions,
  EslintConfigUnOptions,
} from '../../src/config-un/shared';
import type {PluginPrefix} from '../../src/loaders';
import type {NonEmptyTuple, OmitStrict} from '../../src/types';
import {arrayify} from '../../src/utils';

const UN_ESLINT_CONFIGS_PREFIX = 'eslint-config-un/';

export const computeEslintConfig = async (
  configsOrSingleConfigName:
    EslintConfigUnOptions['configs'] | keyof (EslintConfigUnOptions['configs'] & {}),
  options?: {
    /**
     * Do not set implicit default options
     * @default false
     */
    reset?: boolean;
    un?: OmitStrict<EslintConfigUnOptions, 'configs'>;
    // `testMode` makes the generator return errors alongside the configs, which these helpers,
    // returning the configs alone, are not written for
    internalOptions?: OmitStrict<EslintConfigUnInternalOptions, 'testMode'>;
  },
) => {
  // Dynamic import is required so that vi.mock() calls in spec files can intercept
  // the modules loaded transitively by `src/index.ts` (e.g. `package-manager-detector/detect`).
  // A static top-level import would be resolved via setupFiles before vi.mock() registers,
  // binding the real implementations regardless of any mocks defined in the spec file.
  const {eslintConfigInternal: eslintConfig} = await import('../../src/config-un/config');

  const unOptions = options?.un;

  const config = await eslintConfig(
    {
      ...(!options?.reset && {defaultConfigsStatus: 'all-disabled'}),
      // Decouple tests from `ESLINT_CONFIG_UN_OFFLINE_MODE` env var, which would
      // otherwise disable network-accessing rules, making rule-firing assertions fail
      // Specs can still opt in via `un.offlineMode`
      offlineMode: false,
      // Caching is enabled by default when running in an editor, which could make specs reuse
      // each other's configs. Specs can still opt in via `un.cacheConfigs`
      cacheConfigs: false,
      environment: 'default',
      ...unOptions,
      configs:
        typeof configsOrSingleConfigName === 'string'
          ? {
              [configsOrSingleConfigName]: true,
            }
          : configsOrSingleConfigName,
    },
    options?.internalOptions || {
      skipTypeInfoSplit: true,
    },
  );

  const eslintConfigsByName = Object.fromEntries(
    config
      .map((c) =>
        c.name
          ? ([c.name.slice(UN_ESLINT_CONFIGS_PREFIX.length), c] satisfies NonEmptyTuple)
          : null,
      )
      .filter((v) => v != null),
  );

  const getConfigByUnPostfix = (eslintConfigNamePostfix: string) =>
    eslintConfigsByName[eslintConfigNamePostfix];

  const getConfigsByUnPostfix = (predicateOrList: ((postfix: string) => boolean) | string[]) =>
    config
      .map((config) => {
        if (!config.name?.startsWith(UN_ESLINT_CONFIGS_PREFIX)) {
          return null;
        }

        const namePrefixless = config.name.slice(UN_ESLINT_CONFIGS_PREFIX.length);
        if (Array.isArray(predicateOrList) && !predicateOrList.includes(namePrefixless)) {
          return null;
        }
        if (typeof predicateOrList === 'function' && !predicateOrList(namePrefixless)) {
          return null;
        }

        return {
          config,
          name: namePrefixless,
        };
      })
      .filter((v) => v != null);

  const getRuleEntry = (configName: string, ruleName: string) =>
    getConfigByUnPostfix(configName)?.rules?.[ruleName];

  const getRuleEntrySeverity = (configName: string, ruleName: string) => {
    const ruleEntry = getRuleEntry(configName, ruleName);
    return getRuleSeverityFromEslintRuleEntry(ruleEntry);
  };

  const getRuleSeverities = (configName: string) =>
    Object.fromEntries(
      Object.entries(getConfigByUnPostfix(configName)?.rules || {}).map(([ruleName, ruleEntry]) => [
        ruleName,
        getRuleSeverityFromEslintRuleEntry(ruleEntry),
      ]),
    );

  const getRuleEntryOptions = (configName: string, ruleName: string) => {
    const ruleEntry = getRuleEntry(configName, ruleName);
    return Array.isArray(ruleEntry) ? ruleEntry.slice(1) : [];
  };

  const getRuleEntryParsed = (configName: string, ruleName: string) => ({
    severity: getRuleEntrySeverity(configName, ruleName),
    options: getRuleEntryOptions(configName, ruleName),
  });

  return {
    config,
    getConfigByUnPostfix,
    getConfigsByUnPostfix,
    getRuleEntry,
    getRuleEntrySeverity,
    getRuleSeverities,
    getRuleEntryOptions,
    getRuleEntryParsed,
    getLoadedPlugin: (pluginPrefix: Exclude<PluginPrefix, ''>) =>
      getConfigByUnPostfix('global-setup/plugins')?.plugins?.[
        unOptions?.plugins?.[pluginPrefix]?.prefix ?? pluginPrefix
      ],
  };
};

export const testEslintConfig = async <
  const FixturePaths extends string | readonly [string, ...string[]],
>(
  configsOrSingleConfigName:
    EslintConfigUnOptions['configs'] | keyof (EslintConfigUnOptions['configs'] & {}),
  fixturePaths: FixturePaths,
  optionsOrFixtureSearchRelativeToPath?:
    | string
    | {
        searchFixturesRelativeToPath?: string;
        un?: OmitStrict<EslintConfigUnOptions, 'configs'>;
        internalOptions?: OmitStrict<EslintConfigUnInternalOptions, 'testMode'>;
      },
): Promise<
  FixturePaths extends string
    ? ESLint.LintResult[]
    : {
        [K in keyof FixturePaths]: ESLint.LintResult[];
      }
> => {
  // See the comment in `computeEslintConfig` for why this is a dynamic import.
  const {eslintConfigInternal: eslintConfig} = await import('../../src/config-un/config');

  const config = await eslintConfig(
    {
      defaultConfigsStatus: 'all-disabled',
      // See the comment in `computeEslintConfig` for why offline mode is forced off here.
      offlineMode: false,
      ...(typeof optionsOrFixtureSearchRelativeToPath === 'object' &&
        optionsOrFixtureSearchRelativeToPath.un),
      cacheConfigs: false,
      configs:
        typeof configsOrSingleConfigName === 'string'
          ? {
              [configsOrSingleConfigName]: true,
            }
          : configsOrSingleConfigName,
    },
    (typeof optionsOrFixtureSearchRelativeToPath === 'object' &&
      optionsOrFixtureSearchRelativeToPath.internalOptions) || {
      skipTypeInfoSplit: true,
    },
  );

  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: config,
  });

  const fixturesRootPath =
    (typeof optionsOrFixtureSearchRelativeToPath === 'string'
      ? optionsOrFixtureSearchRelativeToPath
      : optionsOrFixtureSearchRelativeToPath?.searchFixturesRelativeToPath) ||
    path.join(import.meta.dirname, '..');

  const fixtures = await Promise.all(
    arrayify(fixturePaths).map(async (fixturePath) => ({
      contents: await fs.readFile(path.resolve(fixturesRootPath, 'fixtures', fixturePath), 'utf8'),
      filePath: pathe.join(fixturesRootPath, 'fixtures', fixturePath),
    })),
  );

  const lintResults = await Promise.all(
    fixtures.map(({contents, filePath}) =>
      eslint.lintText(contents, {
        filePath,
      }),
    ),
  );

  // @ts-expect-error -- TS doesn't support conditional return types
  // eslint-disable-next-line ts/no-non-null-assertion
  return typeof fixturePaths === 'string' ? lintResults[0]! : lintResults;
};

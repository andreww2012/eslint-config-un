import fs from 'node:fs/promises';
import path from 'node:path';
import {ESLint} from 'eslint';
import pathe from 'pathe';
import type {
  EslintConfigUnInternalOptions,
  EslintConfigUnOptions,
} from '../../src/config-un/shared';
import type {PluginPrefix} from '../../src/loaders';
import type {NonEmptyTuple, OmitStrict, Prettify} from '../../src/types';
import {arrayify, isObject, mapValues, substringAfter} from '../../src/utils';

const UN_ESLINT_CONFIGS_PREFIX = 'eslint-config-un/';

const DEFAULT_INTERNAL_OPTIONS: Readonly<OmitStrict<EslintConfigUnInternalOptions, 'testMode'>> = {
  skipTypeInfoSplit: true,
};

const DEFAULT_FIXTURES_ROOT_PATH = path.join(import.meta.dirname, '..');

/**
 * Lets specs pass read-only arrays (CONSTANT_CASE constants) as `files` and `ignores`, including
 * those of Sub-configs and of the root `linterOptions*` options
 */
type AcceptReadonlyFilesAndIgnores<Value> = Value extends (...arguments_: never[]) => unknown
  ? Value
  : Value extends readonly (infer Element)[]
    ? Value | readonly Element[]
    : Value extends object
      ? {
          [Key in keyof Value]: Key extends
            | 'files'
            | 'ignores'
            | `config${string}`
            | `linterOptions${string}`
            ? AcceptReadonlyFilesAndIgnores<Value[Key]>
            : Value[Key];
        }
      : Value;

type ConfigsOption = {
  [Key in keyof (EslintConfigUnOptions['configs'] & {})]?: AcceptReadonlyFilesAndIgnores<
    (EslintConfigUnOptions['configs'] & {})[Key]
  >;
};

type UnOption = AcceptReadonlyFilesAndIgnores<OmitStrict<EslintConfigUnOptions, 'configs'>>;

// The generator never mutates `files` and `ignores`, so read-only arrays are fine at runtime
const asEslintConfigUnOptions = (options: Prettify<UnOption & {configs: ConfigsOption}>) =>
  // eslint-disable-next-line un/no-type-assertion -- Intentional cast
  options as EslintConfigUnOptions;

export const computeEslintConfig = async (
  configsOrSingleConfigName: ConfigsOption | keyof (EslintConfigUnOptions['configs'] & {}),
  options?: {
    /**
     * Do not set implicit default options
     * @default false
     */
    reset?: boolean;
    un?: UnOption;
    // `testMode` makes the generator return errors alongside the configs, which these helpers,
    // returning the configs alone, are not written for
    internalOptions?: OmitStrict<EslintConfigUnInternalOptions, 'testMode'>;
  },
) => {
  // Dynamic import is required so that vi.mock() calls in spec files can intercept
  // the modules loaded transitively by `src/index.ts` (e.g. `package-manager-detector/detect`).
  // A static top-level import would be resolved via setupFiles before vi.mock() registers,
  // binding the real implementations regardless of any mocks defined in the spec file
  const {eslintConfigInternal: eslintConfig} = await import('../../src/config-un/config');

  const unOptions = options?.un;

  const config = await eslintConfig(
    asEslintConfigUnOptions({
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
    }),
    options?.internalOptions || DEFAULT_INTERNAL_OPTIONS,
  );

  const eslintConfigsByName = Object.fromEntries(
    config
      .map((config) =>
        config.name
          ? ([config.name.slice(UN_ESLINT_CONFIGS_PREFIX.length), config] satisfies NonEmptyTuple)
          : null,
      )
      .filter((value) => value != null),
  );

  const getConfigByUnPostfix = (eslintConfigNamePostfix: string) =>
    eslintConfigsByName[eslintConfigNamePostfix];

  const getConfigsByUnPostfix = (
    predicateOrList: ((postfix: string) => boolean) | readonly string[],
  ) =>
    config
      .map((config) => {
        if (!config.name?.startsWith(UN_ESLINT_CONFIGS_PREFIX)) {
          return null;
        }

        const namePrefixless = substringAfter(config.name, UN_ESLINT_CONFIGS_PREFIX);
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
      .filter((value) => value != null);

  const getRuleEntry = (configName: string, ruleName: string) =>
    getConfigByUnPostfix(configName)?.rules?.[ruleName];

  const getRuleEntrySeverity = (configName: string, ruleName: string) => {
    const ruleEntry = getRuleEntry(configName, ruleName);
    return getRuleSeverityFromEslintRuleEntry(ruleEntry);
  };

  const getRuleSeverities = (configName: string) =>
    mapValues(getConfigByUnPostfix(configName)?.rules || {}, (ruleEntry) =>
      getRuleSeverityFromEslintRuleEntry(ruleEntry),
    );

  const getRuleEntryOptions = (configName: string, ruleName: string) => {
    const ruleEntry = getRuleEntry(configName, ruleName);
    return arrayify(ruleEntry).slice(1);
  };

  const getRuleEntryParsed = (configName: string, ruleName: string) => ({
    severity: getRuleEntrySeverity(configName, ruleName),
    options: getRuleEntryOptions(configName, ruleName),
  });

  /**
   * The severities of the rules every config entry together sets up for the file, as ESLint
   * resolves them
   */
  const getRuleSeveritiesForFile = async (filePath: string) => {
    const eslint = new ESLint({overrideConfigFile: true, overrideConfig: config});
    const fileConfig: unknown = await eslint.calculateConfigForFile(filePath);
    const rules =
      isObject(fileConfig) && 'rules' in fileConfig && isObject(fileConfig.rules)
        ? fileConfig.rules
        : {};
    return Object.fromEntries(
      Object.entries(rules).map(([ruleName, ruleEntry]) => [
        ruleName,
        Array.isArray(ruleEntry) ? ruleEntry[0] : ruleEntry,
      ]),
    );
  };

  return {
    config,
    getConfigByUnPostfix,
    getConfigsByUnPostfix,
    getRuleEntry,
    getRuleEntrySeverity,
    getRuleSeverities,
    getRuleEntryOptions,
    getRuleEntryParsed,
    getRuleSeveritiesForFile,
    getLoadedPlugin: (pluginPrefix: Exclude<PluginPrefix, ''>) =>
      getConfigByUnPostfix('global-setup/plugins')?.plugins?.[
        unOptions?.plugins?.[pluginPrefix]?.prefix ?? pluginPrefix
      ],
  };
};

export const testEslintConfig = async <const FixturePaths extends string | NonEmptyTuple<string>>(
  configsOrSingleConfigName: ConfigsOption | keyof (EslintConfigUnOptions['configs'] & {}),
  fixturePaths: FixturePaths,
  optionsOrFixtureSearchRelativeToPath?:
    | string
    | {
        searchFixturesRelativeToPath?: string;
        un?: UnOption;
        internalOptions?: OmitStrict<EslintConfigUnInternalOptions, 'testMode'>;
      },
): Promise<
  FixturePaths extends string
    ? readonly ESLint.LintResult[]
    : {
        [Key in keyof FixturePaths]: readonly ESLint.LintResult[];
      }
> => {
  // See the comment in `computeEslintConfig` for why this is a dynamic import
  const {eslintConfigInternal: eslintConfig} = await import('../../src/config-un/config');

  const config = await eslintConfig(
    asEslintConfigUnOptions({
      defaultConfigsStatus: 'all-disabled',
      // See the comment in `computeEslintConfig` for why offline mode is forced off here
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
    }),
    (typeof optionsOrFixtureSearchRelativeToPath === 'object' &&
      optionsOrFixtureSearchRelativeToPath.internalOptions) ||
      DEFAULT_INTERNAL_OPTIONS,
  );

  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: config,
  });

  const fixturesRootPath =
    (typeof optionsOrFixtureSearchRelativeToPath === 'string'
      ? optionsOrFixtureSearchRelativeToPath
      : optionsOrFixtureSearchRelativeToPath?.searchFixturesRelativeToPath) ||
    DEFAULT_FIXTURES_ROOT_PATH;

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

  return typeof fixturePaths === 'string'
    ? // @ts-expect-error TS doesn't support conditional return types
      // eslint-disable-next-line ts/no-non-null-assertion -- Each requested fixture produces a lint result
      lintResults[0]!
    : // @ts-expect-error TS doesn't support conditional return types
      lintResults;
};

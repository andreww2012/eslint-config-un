import fs from 'node:fs/promises';
import path from 'node:path';
import {ESLint} from 'eslint';
// eslint-disable-next-line import/no-extraneous-dependencies
import pathe from 'pathe';
import type {EslintConfigUnOptions} from '../../src/config-un/shared';
import type {PluginPrefix} from '../../src/loaders';
import type {OmitStrict} from '../../src/types';
import {arraify} from '../../src/utils';

const UN_ESLINT_CONFIGS_PREFIX = 'eslint-config-un/';

export const computeEslintConfig = async (
  configsOrSingleConfigName:
    | EslintConfigUnOptions['configs']
    | keyof (EslintConfigUnOptions['configs'] & {}),
  options?: {
    /**
     * Do not set implicit default options
     * @default false
     */
    reset?: boolean;
    un?: OmitStrict<EslintConfigUnOptions, 'configs'>;
  },
) => {
  // Dynamic import is required so that vi.mock() calls in spec files can intercept
  // the modules loaded transitively by `src/index.ts` (e.g. `package-manager-detector/detect`).
  // A static top-level import would be resolved via setupFiles before vi.mock() registers,
  // binding the real implementations regardless of any mocks defined in the spec file.
  const {eslintConfig} = await import('../../src');

  const unOptions = options?.un;

  const config = await eslintConfig({
    ...(!options?.reset && {defaultConfigsStatus: 'all-disabled'}),
    ...unOptions,
    cacheConfigs: false,
    configs:
      typeof configsOrSingleConfigName === 'string'
        ? {
            [configsOrSingleConfigName]: true,
          }
        : configsOrSingleConfigName,
  });

  const getConfigByUnPostfix = (eslintConfigNamePostfix: string) =>
    config.find((c) => c.name === `${UN_ESLINT_CONFIGS_PREFIX}${eslintConfigNamePostfix}`);

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
    getRuleEntryOptions,
    getRuleEntryParsed,
    getLoadedPlugin: (pluginPrefix: Exclude<PluginPrefix, ''>) =>
      getConfigByUnPostfix('global-setup/plugins')?.plugins?.[
        unOptions?.pluginRenames?.[pluginPrefix] ?? pluginPrefix
      ],
  };
};

export const testEslintConfig = async <
  const FixturePaths extends string | readonly [string, ...string[]],
>(
  configsOrSingleConfigName:
    | EslintConfigUnOptions['configs']
    | keyof (EslintConfigUnOptions['configs'] & {}),
  fixturePaths: FixturePaths,
  optionsOrFixtureSearchRelativeToPath?:
    | string
    | {
        un?: OmitStrict<EslintConfigUnOptions, 'configs'>;
        searchFixturesRelativeToPath?: string;
      },
): Promise<
  FixturePaths extends string
    ? ESLint.LintResult[]
    : {
        [K in keyof FixturePaths]: ESLint.LintResult[];
      }
> => {
  // See the comment in `computeEslintConfig` for why this is a dynamic import.
  const {eslintConfig} = await import('../../src');

  const config = await eslintConfig({
    defaultConfigsStatus: 'all-disabled',
    ...(typeof optionsOrFixtureSearchRelativeToPath === 'object' &&
      optionsOrFixtureSearchRelativeToPath.un),
    cacheConfigs: false,
    configs:
      typeof configsOrSingleConfigName === 'string'
        ? {
            [configsOrSingleConfigName]: true,
          }
        : configsOrSingleConfigName,
  });

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
    arraify(fixturePaths).map(async (fixturePath) => ({
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

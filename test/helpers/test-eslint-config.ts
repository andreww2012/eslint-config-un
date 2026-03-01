import fs from 'node:fs/promises';
import path from 'node:path';
import {ESLint} from 'eslint';
import type {Linter} from 'eslint';
import {eslintConfig} from '../../src';
import type {EslintConfigUnOptions} from '../../src/config-un/shared';
import type {OmitStrict} from '../../src/types';
import {arraify} from '../../src/utils';
import type {PluginPrefix} from '../../src/loaders';

const UN_ESLINT_CONFIGS_PREFIX = 'eslint-config-un/';

export const computeEslintConfig = async (
  configsOrSingleConfigName:
    | EslintConfigUnOptions['configs']
    | keyof (EslintConfigUnOptions['configs'] & {}),
  options?: {
    un?: OmitStrict<EslintConfigUnOptions, 'configs'>;
  },
) => {
  const unOptions = options?.un;

  const config = await eslintConfig({
    defaultConfigsStatus: 'all-disabled',
    ...unOptions,
    configs:
      typeof configsOrSingleConfigName === 'string'
        ? {
            [configsOrSingleConfigName]: true,
          }
        : configsOrSingleConfigName,
  });

  const getConfigByUnPostfix = (eslintConfigNamePostfix: string) =>
    config.find((c) => c.name === `${UN_ESLINT_CONFIGS_PREFIX}${eslintConfigNamePostfix}`);

  const getConfigsByUnPostfix = (predicate: (postfix: string) => boolean) =>
    config
      .map((config) => {
        if (!config.name?.startsWith(UN_ESLINT_CONFIGS_PREFIX)) {
          return null;
        }
        const namePrefixless = config.name.slice(UN_ESLINT_CONFIGS_PREFIX.length);
        if (!predicate(namePrefixless)) {
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

  return {
    config,
    getConfigByUnPostfix,
    getConfigsByUnPostfix,
    getRuleEntry,
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
  const config = await eslintConfig({
    defaultConfigsStatus: 'all-disabled',
    ...(typeof optionsOrFixtureSearchRelativeToPath === 'object' &&
      optionsOrFixtureSearchRelativeToPath.un),
    configs:
      typeof configsOrSingleConfigName === 'string'
        ? {
            [configsOrSingleConfigName]: true,
          }
        : configsOrSingleConfigName,
  });

  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: config as Linter.Config[],
  });

  const fixturesRootPath =
    (typeof optionsOrFixtureSearchRelativeToPath === 'string'
      ? optionsOrFixtureSearchRelativeToPath
      : optionsOrFixtureSearchRelativeToPath?.searchFixturesRelativeToPath) ||
    path.join(import.meta.dirname, '..');

  const fixtures = await Promise.all(
    arraify(fixturePaths).map(async (fixturePath) => ({
      contents: await fs.readFile(path.resolve(fixturesRootPath, 'fixtures', fixturePath), 'utf8'),
      filePath: path.join(fixturesRootPath, 'fixtures', fixturePath),
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
  return typeof fixturePaths === 'string' ? lintResults[0]! : lintResults;
};

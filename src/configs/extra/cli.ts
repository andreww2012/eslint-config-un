import {ERROR, GLOB_JS_TS_EXTENSION} from '../../constants';
import type {UnRulesConfig} from '../../eslint/eslint-types';
import type {PluginPrefix} from '../../loaders';
import type {ObjectValues} from '../../types';
import {
  type ExtraPluginsType,
  type GetRuleNamesInPlugin,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from '../index';

// Value semantics:
// - `true`: rule is disabled by default, as what it reports is expected in executable files.
// - `false`: rule is enabled as an error by default instead
const RULES_ADJUSTED_FOR_CLI_FILES = {
  '': {
    'no-await-in-loop': true,
    'no-console': true,
  },
  import: {
    'no-extraneous-dependencies': true,
  },
  node: {
    hashbang: true,
    'no-process-exit': true,
    'no-top-level-await': true,
  },
  unicorn: {
    'no-process-exit': true,
    'prefer-top-level-await': false,
  },
} as const satisfies Partial<{
  [Plugin in PluginPrefix]: Partial<Record<GetRuleNamesInPlugin<Plugin>, boolean>>;
}>;

const CLI_RULES_FLAT = Object.entries(RULES_ADJUSTED_FOR_CLI_FILES).flatMap(
  ([pluginPrefix, rules]) =>
    Object.entries(rules).map(
      ([ruleName, isDisabledByDefault]) =>
        [`${pluginPrefix ? `${pluginPrefix}/` : ''}${ruleName}`, isDisabledByDefault] as const,
    ),
);

const RULES_ENABLED_BY_DEFAULT = Object.fromEntries(
  CLI_RULES_FLAT.filter(([, isDisabledByDefault]) => !isDisabledByDefault).map(
    ([ruleName]) => [ruleName, ERROR] as const,
  ),
);

const RULE_NAMES_DISABLED_BY_DEFAULT = CLI_RULES_FLAT.filter(
  ([, isDisabledByDefault]) => isDisabledByDefault,
).map(([ruleName]) => ruleName);

type CliRuleName = ObjectValues<{
  [Plugin in keyof typeof RULES_ADJUSTED_FOR_CLI_FILES]: `${Plugin extends ''
    ? ''
    : `${Plugin}/`}${keyof (typeof RULES_ADJUSTED_FOR_CLI_FILES)[Plugin] & string}`;
}>;

/**
 * A config specific to files meant to be executed.
 * By default, allows `process.exit()` and `console` methods in files placed in `bin`, `scripts` and
 * `cli` directories (on any level).
 */
export interface CliEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, Pick<UnRulesConfig, CliRuleName>> {
  /**
   * By default, files in directories on all levels are accounted for by this config.
   * Set this to true to only account for files in the top-level directories.
   * @default false
   */
  onlyTopLevelDirs?: boolean;
}

const DEFAULT_CLI_DIRS = ['bin', 'scripts', 'cli'] as const;
const DEFAULT_CLI_FILES = ['cli'] as const;

export default defineUnConfig<CliEslintConfigOptions>('cli', {phase: 'extra'})((
  context,
  optionsRaw,
) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {onlyTopLevelDirs} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, null);

  configBuilder
    ?.addConfig([
      'cli',
      {
        filesDefault: [
          ...DEFAULT_CLI_DIRS.map(
            (dir) => `${onlyTopLevelDirs ? '' : '**/'}${dir}/**/*.${GLOB_JS_TS_EXTENSION}`,
          ),
          ...DEFAULT_CLI_FILES.map(
            (file) => `${onlyTopLevelDirs ? '' : '**/'}${file}.${GLOB_JS_TS_EXTENSION}`,
          ),
        ],
      },
    ])
    .addBulkRules(RULES_ENABLED_BY_DEFAULT)
    .disableBulkRules(RULE_NAMES_DISABLED_BY_DEFAULT)
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});

import {ERROR, GLOB_JS_TS_EXTENSION} from '../../constants';
import {
  type ExtraPluginsType,
  type UnAllRuleNames,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from '../index';

/**
 * A config specific to files meant to be executed. By default, allows `process.exit()`
 * and `console` methods in files placed in `bin`, `scripts` and `cli` directories
 * (on any level).
 */
export interface CliEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins> {
  /**
   * By default, all rules available in this list are *disabled*.
   * To not disable certain rule, set `false` to the corresponding key.
   */
  disabledRules?: Partial<Record<(typeof RULES_DISABLED_BY_DEFAULT)[number], boolean>>;

  /**
   * By default, files in directories on all levels are accounted for by this config. Set this to true to only account for files in the top-level directories.
   * @default false
   */
  onlyTopLevelDirs?: boolean;
}

const DEFAULT_CLI_DIRS = ['bin', 'scripts', 'cli'] as const;
const DEFAULT_CLI_FILES = ['cli'] as const;

const RULES_DISABLED_BY_DEFAULT = [
  'no-await-in-loop',
  'no-console',

  'node/hashbang',
  'node/no-process-exit',
  'node/no-top-level-await',

  'import/no-extraneous-dependencies',

  'unicorn/no-process-exit',
] as const satisfies UnAllRuleNames[];

export default defineUnConfig<CliEslintConfigOptions>('cli', {phase: 'extra'})((
  context,
  optionsRaw,
) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {disabledRules, onlyTopLevelDirs} = optionsResolved;

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
    .addAnyRule('unicorn', 'prefer-top-level-await', ERROR)
    .disableBulkRules(
      RULES_DISABLED_BY_DEFAULT.filter((ruleName) => disabledRules?.[ruleName] !== false),
    )
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});

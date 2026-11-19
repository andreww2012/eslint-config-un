import {ERROR, GLOB_JS_TS_EXTENSION} from '../../constants';
import type {UnRulesConfig} from '../../eslint/eslint-types';
import {prefixRuleName} from '../../eslint/eslint-utils';
import type {CliAdjustedRuleName} from '../../plugins.gen';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from '../index';

/**
 * A config specific to files meant to be executed.
 * By default, allows `process.exit()` and `console` methods in files placed in `bin`, `scripts` and
 * `cli` directories (on any level)
 */
export interface CliEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, Pick<UnRulesConfig, CliAdjustedRuleName>> {
  /**
   * By default, files in directories on all levels are accounted for by this config.
   * Set this to true to only account for files in the top-level directories
   * @default false
   */
  onlyTopLevelDirs?: boolean;
}

const DEFAULT_CLI_DIRECTORIES = ['bin', 'scripts', 'cli'] as const;
const DEFAULT_CLI_FILES = ['cli'] as const;

export default defineUnConfig<CliEslintConfigOptions>('cli', {phase: 'extra'})((
  context,
  optionsRaw,
) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {onlyTopLevelDirs} = optionsResolved;

  const cliRules = Object.entries(context.ruleTraits.cliFiles).flatMap(([pluginPrefix, rules]) =>
    Object.entries(rules || {}).map(
      ([ruleName, severity]) => [prefixRuleName(pluginPrefix, ruleName), severity] as const,
    ),
  );

  const configBuilder = context.createConfigBuilder(optionsResolved, null);

  configBuilder
    ?.addConfig([
      'cli',
      {
        filesDefault: [
          ...DEFAULT_CLI_DIRECTORIES.map(
            (directory) =>
              `${onlyTopLevelDirs ? '' : '**/'}${directory}/**/*.${GLOB_JS_TS_EXTENSION}`,
          ),
          ...DEFAULT_CLI_FILES.map(
            (file) => `${onlyTopLevelDirs ? '' : '**/'}${file}.${GLOB_JS_TS_EXTENSION}`,
          ),
        ],
      },
    ])
    .addBulkRules(
      Object.fromEntries(
        cliRules.flatMap(([ruleName, severity]) =>
          severity === 'error' ? [[ruleName, ERROR]] : [],
        ),
      ),
    )
    .disableBulkRules(
      cliRules.flatMap(([ruleName, severity]) => (severity === 'off' ? ruleName : [])),
    )
    .addOverrides();
});

import {GLOB_JS_TS_X_EXTENSION, OFF} from '../../constants';
import {ConfigEntryBuilder, type ConfigSharedOptions} from '../../eslint';
import {assignDefaults} from '../../utils';
import type {UnConfigFn} from '../index';

export interface CliEslintConfigOptions extends ConfigSharedOptions {
  /**
   * By default, files in directories on all levels are accounted for by this config. Set this to true to only account for files in the top-level directories.
   * @default false
   */
  onlyTopLevelDirs?: boolean;
}

const DEFAULT_CLI_DIRS = ['bin', 'scripts', 'cli'] as const;

export const cliEslintConfig: UnConfigFn<'cli'> = (context) => {
  const optionsRaw = context.globalOptions.configs?.cli;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies CliEslintConfigOptions);

  const {onlyTopLevelDirs} = optionsResolved;

  const configBuilder = new ConfigEntryBuilder(null, optionsResolved, context);

  configBuilder
    .addConfig([
      'cli',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: DEFAULT_CLI_DIRS.map(
          (dir) => `${onlyTopLevelDirs ? '' : '**/'}${dir}/**/*.${GLOB_JS_TS_X_EXTENSION}`,
        ),
      },
    ])
    .addRule('node/no-process-exit', OFF)
    .addRule('unicorn/no-process-exit', OFF)
    .addRule('no-console', OFF);

  return {
    configs: configBuilder.getAllConfigs(),
    optionsResolved,
  };
};

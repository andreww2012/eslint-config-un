import {GLOB_JS_TS_X_EXTENSION, OFF} from '../../constants';
import {ConfigEntryBuilder, type ConfigSharedOptions, type FlatConfigEntry} from '../../eslint';
import type {InternalConfigOptions} from '../index';

export interface CliEslintConfigOptions extends ConfigSharedOptions {
  /**
   * By default, files in directories on all levels are accounted for by this config. Set this to true to only account for files in the top-level directories.
   * @default false
   */
  onlyTopLevelDirs?: boolean;
}

const DEFAULT_CLI_DIRS = ['bin', 'scripts', 'cli'] as const;

export const cliEslintConfig = (
  options: CliEslintConfigOptions,
  internalOptions: InternalConfigOptions,
): FlatConfigEntry[] => {
  const {onlyTopLevelDirs} = options;

  const builder = new ConfigEntryBuilder(null, options, internalOptions);

  builder
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

  return builder.getAllConfigs();
};

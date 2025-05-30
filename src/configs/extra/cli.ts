import {ERROR, GLOB_JS_TS_EXTENSION} from '../../constants';
import {type UnConfigOptions, createConfigBuilder} from '../../eslint';
import {assignDefaults} from '../../utils';
import type {UnConfigFn} from '../index';

export interface CliEslintConfigOptions extends UnConfigOptions {
  /**
   * By default, files in directories on all levels are accounted for by this config. Set this to true to only account for files in the top-level directories.
   * @default false
   */
  onlyTopLevelDirs?: boolean;
}

const DEFAULT_CLI_DIRS = ['bin', 'scripts', 'cli'] as const;
const DEFAULT_CLI_FILES = ['cli'] as const;

export const cliUnConfig: UnConfigFn<'cli'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.cli;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies CliEslintConfigOptions);

  const {onlyTopLevelDirs} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, null);

  configBuilder
    ?.addConfig([
      'cli',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: [
          ...DEFAULT_CLI_DIRS.map(
            (dir) => `${onlyTopLevelDirs ? '' : '**/'}${dir}/**/*.${GLOB_JS_TS_EXTENSION}`,
          ),
          ...DEFAULT_CLI_FILES.map(
            (file) => `${onlyTopLevelDirs ? '' : '**/'}${file}.${GLOB_JS_TS_EXTENSION}`,
          ),
        ],
      },
    ])
    .disableAnyRule('node', 'hashbang')
    .disableAnyRule('node', 'no-process-exit')
    .disableAnyRule('unicorn', 'no-process-exit')
    .disableAnyRule('', 'no-await-in-loop')
    .disableAnyRule('', 'no-console')
    .disableAnyRule('import', 'no-extraneous-dependencies')
    .addAnyRule('unicorn', 'prefer-top-level-await', ERROR)
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

// cspell:ignore terminfo
import {ERROR} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [`eslint-plugin-file-progress`](https://npmx.dev/eslint-plugin-file-progress) plugin
 * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
 * that will be assigned to the `progress` property of the `settings` flat config option.
 *
 * Will be merged with the default value for `hide`
 */
export interface FileProgressPluginSettings {
  /**
   * Hides the progress bar
   * @default true <=> the resolved `environment` root option is not `default`, or the progress
   * can't be drawn in place in a terminal
   */
  hide?: boolean;

  /**
   * Hide the currently linted file name
   * @default false
   */
  hideFileName?: boolean;

  /**
   * The message printed once every file has been linted
   */
  successMessage?: string;
}

/**
 * An ESLint plugin to print file progress.
 *
 * The progress is hidden unless the resolved `environment` root option is `default` and the
 * progress can be drawn in place: both the standard output and the standard error output are
 * terminals, [`TERM`](https://man7.org/linux/man-pages/man7/term.7.html) is not `dumb` and no
 * `CI` environment variable is set.
 *
 * 📁 Default `files`: all files
 */
export interface FileProgressEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'file-progress'> {}

// The progress is drawn to the standard error output, but the plugin's spinner library decides
// whether it's in a terminal by the standard output, and otherwise prints every update on a line of
// its own
const isProgressDrawnInPlace =
  process.stderr.isTTY &&
  process.stdout.isTTY &&
  // `dumb` is the terminfo type of terminals that can't move the cursor, so the spinner library
  // treats it as no terminal
  process.env['TERM'] !== 'dumb' &&
  // The spinner library sees any `CI` variable as CI, even `CI=false`, unlike the `ci` environment
  !('CI' in process.env);

export default defineUnConfig<FileProgressEslintConfigOptions>(
  'fileProgress',
  true,
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const pluginSettings = context.getPluginSettings('file-progress');

  const configBuilder = context.createConfigBuilder(optionsResolved, 'file-progress');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'file-progress',
      {
        ignoresInternal: false,
        settings: {
          progress: {
            hide: context.meta.environment !== 'default' || !isProgressDrawnInPlace,
            ...pluginSettings,
          } satisfies FileProgressPluginSettings,
        },
      },
    ])
    .addRule('activate', ERROR) /** @since 1.0.0 */ // 🟢
    .enableConfigTesterForPlugin('file-progress')
    .addOverrides();
});

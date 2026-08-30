import {ERROR, OFF} from '../constants';
import type {UnFlatConfigEntryFilesAndIgnores} from '../eslint/eslint-types';
import {generatePackageToLoadProperty} from '../loaders';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

type FilenameNamingConventionOptions = GetRuleOptions<
  'check-file',
  'filename-naming-convention',
  'all'
>;
type FolderNamingConventionOptions = GetRuleOptions<
  'check-file',
  'folder-naming-convention',
  'all'
>;

/**
 * An ESLint plugin that enforces consistent naming conventions for files and directories.
 *
 * ⚠️ WARNING: all rules are disabled by default.
 *
 * 📁 Default `files`: all files
 */
export interface CheckFileEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'check-file'> {
  /**
   * Specifies which files the `eslint-processor-check-file` processor is applied to.
   * This might be necessary if some files are not processed by other processors but still require
   * linting by this config's plugin.
   *
   * 📁 Default `files`: all files
   * @default false
   */
  configEnableCheckFileProcessor?: UnFlatConfigEntryFilesAndIgnores;

  /**
   * Enforce file naming conventions.
   *
   * Affected rule:
   * - [`check-file/filename-naming-convention`](https://github.com/dukeluo/eslint-plugin-check-file/blob/HEAD/docs/rules/filename-naming-convention.md)
   */
  fileNamingConventions?: FilenameNamingConventionOptions[0] | FilenameNamingConventionOptions;

  /**
   * Enforce folder naming conventions.
   *
   * Affected rule:
   * - [`check-file/folder-naming-convention`](https://github.com/dukeluo/eslint-plugin-check-file/blob/HEAD/docs/rules/folder-naming-convention.md)
   */
  folderNamingConventions?: FolderNamingConventionOptions[0] | FolderNamingConventionOptions;
}

export default defineUnConfig<CheckFileEslintConfigOptions>('checkFile', {
  enabledBy: false,
  phase: 'last',
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {configEnableCheckFileProcessor, fileNamingConventions, folderNamingConventions} =
    optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'check-file');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig('check-file')
    .addRule('filename-blocklist', OFF) /** @since 2.0.0 */
    .addRule(
      'filename-naming-convention',
      fileNamingConventions ? ERROR : OFF,
      fileNamingConventions
        ? Array.isArray(fileNamingConventions)
          ? fileNamingConventions
          : [fileNamingConventions]
        : [],
    ) /** @since 1.0.0 */
    .addRule('folder-match-with-fex', OFF) /** @since 1.0.0 */
    .addRule(
      'folder-naming-convention',
      folderNamingConventions ? ERROR : OFF,
      folderNamingConventions
        ? Array.isArray(folderNamingConventions)
          ? folderNamingConventions
          : [folderNamingConventions]
        : [],
    ) /** @since 1.1.0 */
    .addRule('no-index', OFF) /** @since 1.0.0 */
    .enableConfigTesterForPlugin('check-file')
    .addOverrides();

  const configBuilderEnableCheckFileProcessor = configEnableCheckFileProcessor
    ? context.createConfigBuilder(configEnableCheckFileProcessor, null)
    : null;

  configBuilderEnableCheckFileProcessor?.addConfig(
    'check-file/processor',
    // @ts-expect-error Type '{ [packageToLoadSymbol]: ...' has no properties in common with type 'FlatConfigEntryForBuilder'.
    {
      ...generatePackageToLoadProperty('processor', 'checkFileProcessor'),
    },
  );
});

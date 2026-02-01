import type {recommended as fastImportPluginConfigGenerator} from 'eslint-plugin-fast-import';
import {ERROR, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export type FastImportPluginSettings = Parameters<typeof fastImportPluginConfigGenerator>[0];

export interface FastImportEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'fast-import'> {
  /**
   * [`eslint-plugin-fast-import`](https://npmjs.com/eslint-plugin-fast-import) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `fastImport` property
   * and applied to the resolved `files` and `ignores` of this config.
   */
  settings?: Partial<FastImportPluginSettings>;

  /**
   * Affected rule:
   * - [`consistent-file-extensions`](https://github.com/nebrius/eslint-plugin-fast-import/blob/HEAD/src/rules/extension/README.md)
   */
  enforceFileExtensions?: GetRuleOptions<'fast-import', 'consistent-file-extensions'>;

  /**
   * Affected rule:
   * - [`no-restricted-imports`](https://github.com/nebrius/eslint-plugin-fast-import/blob/HEAD/src/rules/restricted/README.md)
   */
  restrictImports?: GetRuleOptions<'fast-import', 'no-restricted-imports'>;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies FastImportEslintConfigOptions);

  const {settings: pluginSettings, enforceFileExtensions, restrictImports} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'fast-import');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'fast-import',
      {
        includeDefaultFilesAndIgnores: true,
        settings: {
          fastImport: {
            rootDir: import.meta.dirname,
            ...pluginSettings,
          } satisfies FastImportPluginSettings,
        },
      },
    ])
    .addRule(
      'consistent-file-extensions',
      enforceFileExtensions ? ERROR : OFF,
      enforceFileExtensions ? [enforceFileExtensions] : [],
    ) /** @since 1.5.0 */
    .addRule('no-cycle', ERROR) /** @since 1.0.0-rc1 */ // 🟢
    .addRule('no-entry-point-imports', ERROR) /** @since 1.0.0-beta2 */ // 🟢
    .addRule('no-external-barrel-reexports', ERROR) /** @since 1.0.0-beta2 */ // 🟢
    .addRule('no-named-as-default', ERROR) /** @since 1.1.2 */ // 🟢
    .addRule(
      'no-restricted-imports',
      restrictImports ? ERROR : OFF,
      restrictImports ? [restrictImports] : [],
    ) /** @since 1.2.0 */
    .addRule('no-test-imports-in-prod', ERROR) /** @since 1.0.0-beta2 */ // 🟢
    .addRule('no-unresolved-imports', ERROR) /** @since 1.0.1 */ // 🟢
    .addRule('no-unused-exports', ERROR) /** @since 1.0.0-beta2 */ // 🟢
    .addRule('require-node-prefix', ERROR) /** @since 1.0.0-rc1 */
    .enableConfigTesterForPlugin('fast-import')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'fastImport'>;

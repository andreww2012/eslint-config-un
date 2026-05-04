import {ERROR} from '../constants';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface NoRelativeImportPathsEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'no-relative-import-paths'> {
  /**
   * The single rule (`no-relative-import-paths`) options.
   */
  options?: GetRuleOptions<'no-relative-import-paths', 'no-relative-import-paths'>;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(
    optionsRaw,
    {} satisfies NoRelativeImportPathsEslintConfigOptions,
  );

  const {options} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'no-relative-import-paths');

  configBuilder
    ?.addConfig(['no-relative-import-paths', {includeDefaultFilesAndIgnores: true}])
    .addRule('no-relative-import-paths', ERROR, options ? [options] : []) /** @since 1.0.3 */
    .enableConfigTesterForPlugin('no-relative-import-paths')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'noRelativeImportPaths'>;

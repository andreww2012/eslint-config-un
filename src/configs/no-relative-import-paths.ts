import {ERROR} from '../constants';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * An ESLint plugin to disallow relative import paths.
 *
 * ⚠️ WARNING: requires your project to support absolute imports (e.g. via `tsconfig.json`'s
 * `baseUrl`).
 *
 * 📁 Default `files`: all files
 */
export interface NoRelativeImportPathsEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'no-relative-import-paths'> {
  /**
   * The single rule (`no-relative-import-paths`) options.
   */
  options?: GetRuleOptions<'no-relative-import-paths', 'no-relative-import-paths'>;
}

export default defineUnConfig<NoRelativeImportPathsEslintConfigOptions>(
  'noRelativeImportPaths',
  false,
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {options} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'no-relative-import-paths');

  configBuilder
    ?.addConfig('no-relative-import-paths')
    .addRule('no-relative-import-paths', ERROR, options ? [options] : []) /** @since 1.0.3 */
    .enableConfigTesterForPlugin('no-relative-import-paths')
    .addOverrides();
});

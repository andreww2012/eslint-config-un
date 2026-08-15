import {ERROR, GLOB_PACKAGE_JSON} from '../constants';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * Enables rules from a plugin to help suggest alternatives to various dependencies.
 * [The list of replacements](https://e18e.dev/docs/replacements) is maintained by e18e community.
 *
 * ⚠️ You should probably use `e18e` config, which provides functionally the same
 * `moduleReplacements` sub-config, as well as other useful rules.
 *
 * 📁 Default `files`: <code>**&#47;package.json</code>
 */
export interface DependEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'depend'> {
  /**
   * Options of [the only rule, `ban-dependencies`](https://github.com/es-tooling/eslint-plugin-depend/blob/HEAD/docs/rules/ban-dependencies.md).
   */
  options?: GetRuleOptions<'depend', 'ban-dependencies'>;
}

export default defineUnConfig<DependEslintConfigOptions>(
  'depend',
  false,
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {options: badDependencyOptions} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'depend');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'depend',
      {
        filesDefault: [GLOB_PACKAGE_JSON],
        language: ['jsonc', 'json'],
      },
    ])
    .addRule(
      'ban-dependencies',
      ERROR,
      badDependencyOptions ? [badDependencyOptions] : [],
    ) /** @since 0.2.0 */ // 🟢
    .enableConfigTesterForPlugin('depend')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});

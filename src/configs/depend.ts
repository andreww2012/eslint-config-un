import {ERROR, GLOB_PACKAGE_JSON} from '../constants';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface DependEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'depend'> {
  /**
   * Options of [the only rule, `ban-dependencies`](https://github.com/es-tooling/eslint-plugin-depend/blob/HEAD/docs/rules/ban-dependencies.md).
   */
  options?: GetRuleOptions<'depend', 'ban-dependencies'>;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {options: badDependencyOptions} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'depend');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'depend',
      {
        includeDefaultFilesAndIgnores: true,
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
}) satisfies UnConfigFn<'depend'>;

import {ERROR, GLOB_PACKAGE_JSON} from '../constants';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

export interface DependEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, 'depend'> {
  /**
   * [Options of the only rule (`ban-dependencies`)](https://github.com/es-tooling/eslint-plugin-depend/blob/HEAD/docs/rules/ban-dependencies.md).
   */
  options?: GetRuleOptions<'depend', 'ban-dependencies'>;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies DependEslintConfigOptions);

  const {options: badDependencyOptions} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'depend');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'depend',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: [GLOB_PACKAGE_JSON],
        parser: 'jsonc-eslint-parser',
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

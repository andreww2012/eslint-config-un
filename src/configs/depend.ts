import {ERROR} from '../constants';
import {type GetRuleOptions, type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import {DEFAULT_FILES_PACKAGE_JSON} from './package-json';
import type {UnConfigFn} from './index';

export interface DependEslintConfigOptions extends UnConfigOptions<'depend'> {
  /**
   * [Options of the only rule (`ban-dependencies`)](https://github.com/es-tooling/eslint-plugin-depend/blob/HEAD/docs/rules/ban-dependencies.md).
   */
  options?: GetRuleOptions<'depend', 'ban-dependencies'>;
}

export const dependUnConfig: UnConfigFn<'depend'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.depend;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies DependEslintConfigOptions);

  const {options: badDependencyOptions} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'depend');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'depend',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: DEFAULT_FILES_PACKAGE_JSON,
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
};

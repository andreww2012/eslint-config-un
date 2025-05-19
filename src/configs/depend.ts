import {ERROR} from '../constants';
import {type GetRuleOptions, type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults, interopDefault} from '../utils';
import {DEFAULT_FILES_PACKAGE_JSON} from './package-json';
import type {UnConfigFn} from './index';

export interface DependEslintConfigOptions extends UnConfigOptions<'depend'> {
  /**
   * [Options of the only rule (`ban-dependencies`)](https://github.com/es-tooling/eslint-plugin-depend/blob/HEAD/docs/rules/ban-dependencies.md).
   */
  options?: GetRuleOptions<'depend', 'ban-dependencies'>[0];
}

export const dependUnConfig: UnConfigFn<'depend'> = async (context) => {
  const jsoncEslintParser = await interopDefault(import('jsonc-eslint-parser'));

  const optionsRaw = context.rootOptions.configs?.depend;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies DependEslintConfigOptions);

  const {options: badDependencyOptions} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'depend');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(
      ['depend', {includeDefaultFilesAndIgnores: true, filesFallback: DEFAULT_FILES_PACKAGE_JSON}],
      {
        languageOptions: {
          parser: jsoncEslintParser,
        },
      },
    )
    .addRule('ban-dependencies', ERROR, badDependencyOptions ? [badDependencyOptions] : []) // 🟢
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

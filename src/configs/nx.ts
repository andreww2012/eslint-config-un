import {ERROR, GLOB_JSON, GLOB_TSX, OFF} from '../constants';
import {type GetRuleOptions, type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults, interopDefault} from '../utils';
import type {UnConfigFn} from './index';

export interface NxEslintConfigOptions extends UnConfigOptions<'nx'> {
  /**
   * @default false
   */
  enforceModuleBoundaries?: boolean | GetRuleOptions<'nx', 'enforce-module-boundaries'>[0];
}

export const nxUnConfig: UnConfigFn<'nx'> = async (context) => {
  const jsoncEslintParser = await interopDefault(import('jsonc-eslint-parser'));

  const optionsRaw = context.rootOptions.configs?.nx;
  const optionsResolved = assignDefaults(optionsRaw, {
    enforceModuleBoundaries: false,
  } satisfies NxEslintConfigOptions);

  const {enforceModuleBoundaries} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'nx');

  configBuilder
    ?.addConfig([
      'nx',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: [GLOB_TSX],
      },
    ])
    .addRule(
      'enforce-module-boundaries',
      enforceModuleBoundaries ? ERROR : OFF,
      typeof enforceModuleBoundaries === 'object' ? [enforceModuleBoundaries] : [],
    )
    .addOverrides();

  const configBuilderJson = createConfigBuilder(context, optionsResolved, 'nx');

  configBuilderJson
    ?.addConfig(
      [
        'nx/json',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: [GLOB_JSON],
        },
      ],
      {
        languageOptions: {
          parser: jsoncEslintParser,
        },
      },
    )
    .addRule('dependency-checks', ERROR) /** @since 16.4.0 */
    .addRule('enforce-module-boundaries', OFF) /** @since 16.0.0 */
    .addRule('nx-plugin-checks', ERROR) /** @since 16.0.0 */
    .enableConfigTesterForPlugin('nx')
    .addOverrides();

  return {
    configs: [configBuilder, configBuilderJson],
    optionsResolved,
  };
};

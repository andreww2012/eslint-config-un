import {ERROR, OFF} from '../constants';
import {type AllRulesWithPrefix, type ConfigSharedOptions, createConfigBuilder} from '../eslint';
import {assignDefaults, interopDefault} from '../utils';
import type {UnConfigFn} from './index';

export interface PnpmEslintConfigOptions {
  /**
   * Rules for `package.json` files.
   */
  configPackageJson?:
    | boolean
    | (ConfigSharedOptions<AllRulesWithPrefix<'pnpm/jsonc-', true, false>> & {
        /**
         * Enforces that all dependencies are coming from [pnpm catalogs](https://pnpm.io/catalogs).
         *
         * Used by the following rules:
         * - `json-enforce-catalog`
         * @default false
         */
        enforceCatalog?: boolean;

        /**
         * "Prefer having pnpm settings in `pnpm-workspace.yaml` instead of `package.json`. This would requires pnpm v10.6+, see https://github.com/orgs/pnpm/discussions/9037." - plugin docs
         *
         * Used by the following rules:
         * - `json-prefer-workspace-settings`
         * @default false
         */
        preferSettingsInPnpmWorkspaceYaml?: boolean;
      });

  /**
   * Rules for `pnpm-workspace.yaml` file.
   */
  configPnpmWorkspace?:
    | boolean
    | ConfigSharedOptions<AllRulesWithPrefix<'pnpm/yaml-', true, false>>;
}

export const pnpmUnConfig: UnConfigFn<'pnpm'> = async (context) => {
  const [jsoncEslintParser, yamlEslintParser] = await Promise.all([
    interopDefault(import('jsonc-eslint-parser')),
    interopDefault(import('yaml-eslint-parser')),
  ]);

  const optionsRaw = context.rootOptions.configs?.pnpm;
  const optionsResolved = assignDefaults(optionsRaw, {
    configPackageJson: true,
    configPnpmWorkspace: true,
  } satisfies PnpmEslintConfigOptions);

  const {configPackageJson, configPnpmWorkspace} = optionsResolved;

  const configPackageJsonOptions = assignDefaults(configPackageJson, {
    enforceCatalog: false,
    preferSettingsInPnpmWorkspaceYaml: false,
  } satisfies typeof configPackageJson & object);
  const {enforceCatalog, preferSettingsInPnpmWorkspaceYaml} = configPackageJsonOptions;

  const configBuilderPackageJson = createConfigBuilder(context, configPackageJson, 'pnpm');
  configBuilderPackageJson
    ?.addConfig(
      [
        'pnpm/package.json',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: ['package.json', '**/package.json'],
        },
      ],
      {
        languageOptions: {
          parser: jsoncEslintParser,
        },
      },
    )
    .addRule('json-enforce-catalog', enforceCatalog ? ERROR : OFF)
    .addRule('json-prefer-workspace-settings', preferSettingsInPnpmWorkspaceYaml ? ERROR : OFF)
    .addRule('json-valid-catalog', ERROR)
    .addOverrides();

  const configBuilderPnpmWorkspace = createConfigBuilder(context, configPnpmWorkspace, 'pnpm');
  configBuilderPnpmWorkspace
    ?.addConfig(
      [
        'pnpm/pnpm-workspace-yaml',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: ['pnpm-workspace.yaml'],
        },
      ],
      {
        languageOptions: {
          parser: yamlEslintParser,
        },
      },
    )
    .addRule('yaml-no-duplicate-catalog-item', ERROR)
    .addRule('yaml-no-unused-catalog-item', ERROR)
    .addOverrides();

  return {
    configs: [configBuilderPackageJson, configBuilderPnpmWorkspace],
    optionsResolved,
  };
};

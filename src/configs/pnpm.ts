import {ERROR, OFF} from '../constants';
import {type RulesRecordPartial, type UnConfigOptions, createConfigBuilder} from '../eslint';
import type {PickKeysStartingWith} from '../types';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface PnpmEslintConfigOptions {
  /**
   * [`eslint-plugin-pnpm`](https://npmjs.com/eslint-plugin-pnpm) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `pnpm` property and applied to the specified `files` and `ignores`.
   */
  settings?: {
    /**
     * Whether to create `pnpm-workspace.yaml` if it doesn't exist
     * @default false
     */
    ensureWorkspaceFile?: boolean;
  };

  /**
   * Rules for `package.json` files.
   */
  configPackageJson?:
    | boolean
    | UnConfigOptions<
        PickKeysStartingWith<RulesRecordPartial<'pnpm'>, 'pnpm/json-'>,
        {
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
        }
      >;

  /**
   * Rules for `pnpm-workspace.yaml` file.
   */
  configPnpmWorkspace?:
    | boolean
    | UnConfigOptions<PickKeysStartingWith<RulesRecordPartial<'pnpm'>, 'pnpm/yaml-'>>;
}

export const pnpmUnConfig: UnConfigFn<'pnpm'> = async (context) => {
  const jsoncEslintParser = await import('jsonc-eslint-parser');

  const optionsRaw = context.rootOptions.configs?.pnpm;
  const optionsResolved = assignDefaults(optionsRaw, {
    configPackageJson: true,
    configPnpmWorkspace: true,
  } satisfies PnpmEslintConfigOptions);

  const {settings: pluginSettings, configPackageJson, configPnpmWorkspace} = optionsResolved;

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
          ...(pluginSettings && {
            settings: {
              pnpm: pluginSettings,
            },
          }),
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
    ?.addConfig([
      'pnpm/pnpm-workspace-yaml',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: ['pnpm-workspace.yaml'],
        parser: 'yaml-eslint-parser',
      },
    ])
    .addRule('yaml-no-duplicate-catalog-item', ERROR)
    .addRule('yaml-no-unused-catalog-item', ERROR)
    .addOverrides();

  return {
    configs: [configBuilderPackageJson, configBuilderPnpmWorkspace],
    optionsResolved,
  };
};

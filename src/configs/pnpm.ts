import {ERROR, OFF} from '../constants';
import type {PickKeysStartingWith} from '../types';
import {
  type ExtraPluginsType,
  type RuleNamesForPlugin,
  type RulesRecordPartial,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

interface PnpmJsonSubConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<
  ExtraPlugins,
  PickKeysStartingWith<RulesRecordPartial<'pnpm'>, 'pnpm/json-'>
> {
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

export interface PnpmEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, 'pnpm'> {
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
  configPackageJson?: boolean | PnpmJsonSubConfigOptions<ExtraPlugins>;

  /**
   * Rules for `pnpm-workspace.yaml` file.
   */
  configPnpmWorkspace?:
    | boolean
    | UnConfigOptions<ExtraPlugins, PickKeysStartingWith<RulesRecordPartial<'pnpm'>, 'pnpm/yaml-'>>;
}

const PNPM_YAML_RULES = new Set<string>([
  'yaml-no-duplicate-catalog-item',
  'yaml-no-unused-catalog-item',
  'yaml-valid-packages',
] satisfies RuleNamesForPlugin<'pnpm'>[]);

export default ((context, optionsRaw) => {
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

  const configBuilderPackageJson = context.createConfigBuilder(configPackageJson, 'pnpm');
  configBuilderPackageJson
    ?.addConfig(
      [
        'pnpm/package.json',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: ['package.json', '**/package.json'],
          parser: 'jsonc-eslint-parser',
        },
      ],
      {
        ...(pluginSettings && {
          settings: {
            pnpm: pluginSettings,
          },
        }),
      },
    )
    .addRule(
      'json-enforce-catalog',
      enforceCatalog ? ERROR : OFF,
    ) /** @since 0.1.0 */ /** @aka enforce-catalog */
    .addRule(
      'json-prefer-workspace-settings',
      preferSettingsInPnpmWorkspaceYaml ? ERROR : OFF,
    ) /** @since 0.2.0 */ /** @aka prefer-workspace-settings */
    .addRule('json-valid-catalog', ERROR) /** @since 0.1.0 */ /** @aka valid-catalog */
    .enableConfigTesterForPlugin('pnpm', {
      rulesToSkipInConfig: (ruleName) => PNPM_YAML_RULES.has(ruleName),
    })
    .addOverrides();

  const configBuilderPnpmWorkspace = context.createConfigBuilder(configPnpmWorkspace, 'pnpm');
  configBuilderPnpmWorkspace
    ?.addConfig([
      'pnpm/pnpm-workspace-yaml',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: ['pnpm-workspace.yaml'],
        parser: 'yaml-eslint-parser',
      },
    ])
    .addRule('yaml-no-duplicate-catalog-item', ERROR) /** @since 0.3.0 */
    .addRule('yaml-no-unused-catalog-item', ERROR) /** @since 0.3.0 */
    .addRule('yaml-valid-packages', ERROR) /** @since 1.2.0 */
    .enableConfigTesterForPlugin('pnpm', {
      rulesToSkipInConfig: (ruleName) => !PNPM_YAML_RULES.has(ruleName),
    })
    .addOverrides();

  return {
    configs: [configBuilderPackageJson, configBuilderPnpmWorkspace],
    optionsResolved,
  };
}) satisfies UnConfigFn<'pnpm'> as UnConfigFn<'pnpm'>;

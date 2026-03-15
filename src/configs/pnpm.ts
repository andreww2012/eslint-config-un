import {ERROR, OFF} from '../constants';
import type {PickKeysStartingWith} from '../types';
import {allUnionMembers} from '../utils';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  type UnRuleOptionsByPlugin,
  type UnRulesConfigPartial,
  assignDefaults,
} from './index';

interface PnpmJsonSubConfigOptions<
  ExtraPlugins extends ExtraPluginsType,
> extends UnFlatConfigEntryBase<
  ExtraPlugins,
  PickKeysStartingWith<UnRulesConfigPartial<'pnpm'>, 'pnpm/json-'>
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

interface PnpmYamlSubConfigOptions<
  ExtraPlugins extends ExtraPluginsType,
> extends UnFlatConfigEntryBase<
  ExtraPlugins,
  PickKeysStartingWith<UnRulesConfigPartial<'pnpm'>, 'pnpm/yaml-'>
> {
  /**
   * Configure [`yaml-enforce-settings` rule options](https://github.com/antfu/pnpm-workspace-utils/blob/7d608b8aa8f1c9a2b76ca4a2cc75d96e914268ae/packages/eslint-plugin-pnpm/src/rules/yaml/yaml-enforce-settings.ts#L30).
   *
   * Note that you must specify either non-empty `requiredFields`, `settings` or `forbiddenFields`.
   */
  enforcePnpmWorkspaceSettings?: GetRuleOptions<'pnpm', 'yaml-enforce-settings'>;
}

export interface PnpmEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never> {
  /**
   * [`eslint-plugin-pnpm`](https://npmjs.com/eslint-plugin-pnpm) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `pnpm` property
   * and applied to the resolved `files` and `ignores` of this config.
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
  configPnpmWorkspace?: boolean | PnpmYamlSubConfigOptions<ExtraPlugins>;
}

const PNPM_YAML_RULES = new Set<string>(
  allUnionMembers<keyof PickKeysStartingWith<UnRuleOptionsByPlugin['pnpm'], 'yaml-'>>()([
    'yaml-enforce-settings',
    'yaml-no-duplicate-catalog-item',
    'yaml-no-unused-catalog-item',
    'yaml-valid-packages',
  ]),
);

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
    ?.addConfig([
      'pnpm/package.json',
      {
        includeDefaultFilesAndIgnores: true,
        filesDefault: ['**/package.json'],
        language: ['jsonc', 'json'],
        settings: {
          pnpm: pluginSettings,
        },
      },
    ])
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

  const configPnpmWorkspaceOptions = assignDefaults(
    configPnpmWorkspace,
    {} satisfies typeof configPnpmWorkspace & object,
  );
  const {enforcePnpmWorkspaceSettings} = configPnpmWorkspaceOptions;

  const configBuilderPnpmWorkspace = context.createConfigBuilder(
    configPnpmWorkspaceOptions,
    'pnpm',
  );
  configBuilderPnpmWorkspace
    ?.addConfig([
      'pnpm/pnpm-workspace-yaml',
      {
        includeDefaultFilesAndIgnores: true,
        filesDefault: ['pnpm-workspace.yaml'],
        language: ['yaml', 'yaml'],
      },
    ])
    .addRule(
      'yaml-enforce-settings',
      enforcePnpmWorkspaceSettings ? ERROR : OFF,
      enforcePnpmWorkspaceSettings ? [enforcePnpmWorkspaceSettings] : [],
    ) /** @since 1.4.0 */
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

import {ERROR, OFF} from '../constants';
import {RULE_CATEGORIES_PER_PLUGIN} from '../eslint-rule-categories.gen';
import type {PickKeysStartingWith} from '../types';
import {arrayIncludes} from '../utils';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  type UnRulesConfigPartial,
  assignDefaults,
} from './index';

const RULE_CATEGORIES_PER_FILE_TYPE = RULE_CATEGORIES_PER_PLUGIN.pnpm;

interface PnpmJsonSubConfigOptions<
  ExtraPlugins extends ExtraPluginsType,
> extends UnFlatConfigEntryBase<
  ExtraPlugins,
  PickKeysStartingWith<UnRulesConfigPartial<'pnpm'>, 'pnpm/json-'>
> {
  /**
   * Enforces that all dependencies are coming from [pnpm catalogs](https://pnpm.io/catalogs).
   *
   * Affected rule:
   * - `pnpm/json-enforce-catalog`
   * @default false
   */
  enforceCatalog?: boolean;

  /**
   * "Prefer having pnpm settings in `pnpm-workspace.yaml` instead of `package.json`.
   * This would require pnpm v10.6+, see https://github.com/orgs/pnpm/discussions/9037."
   * - plugin docs
   *
   * Affected rule:
   * - `pnpm/json-prefer-workspace-settings`
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
   * Configure
   * [`pnpm/yaml-enforce-settings` rule options](https://github.com/antfu/pnpm-workspace-utils/blob/7d608b8aa8f1c9a2b76ca4a2cc75d96e914268ae/packages/eslint-plugin-pnpm/src/rules/yaml/yaml-enforce-settings.ts#L30).
   *
   * Note that you must specify either non-empty `requiredFields`, `settings` or `forbiddenFields`.
   */
  enforcePnpmWorkspaceSettings?: GetRuleOptions<'pnpm', 'yaml-enforce-settings'>;
}

export interface PnpmEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never> {
  /**
   * [`eslint-plugin-pnpm`](https://npmx.dev/eslint-plugin-pnpm) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
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
   *
   * 📁 Default `files`: <code>**&#47;package.json</code>
   * @default true
   */
  configPackageJson?: boolean | PnpmJsonSubConfigOptions<ExtraPlugins>;

  /**
   * Rules for the `pnpm-workspace.yaml` file.
   *
   * 📁 Default `files`: <code>pnpm-workspace.yaml</code>
   * @default true
   */
  configPnpmWorkspace?: boolean | PnpmYamlSubConfigOptions<ExtraPlugins>;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configPackageJson: true,
    configPnpmWorkspace: true,
  });

  const {settings: pluginSettings, configPackageJson, configPnpmWorkspace} = optionsResolved;

  const configPackageJsonOptions = assignDefaults(configPackageJson, {
    enforceCatalog: false,
    preferSettingsInPnpmWorkspaceYaml: false,
  });
  const {enforceCatalog, preferSettingsInPnpmWorkspaceYaml} = configPackageJsonOptions;

  const configBuilderPackageJson = context.createConfigBuilder(configPackageJson, 'pnpm');
  configBuilderPackageJson
    ?.addConfig([
      'pnpm/package.json',
      {
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
      /* v8 ignore start */
      rulesToSkipInConfig: (ruleName) =>
        arrayIncludes(RULE_CATEGORIES_PER_FILE_TYPE.yaml, ruleName),
      /* v8 ignore stop */
    })
    .addOverrides();

  const configPnpmWorkspaceOptions = assignDefaults(configPnpmWorkspace, {});
  const {enforcePnpmWorkspaceSettings} = configPnpmWorkspaceOptions;

  const configBuilderPnpmWorkspace = context.createConfigBuilder(configPnpmWorkspace, 'pnpm');
  configBuilderPnpmWorkspace
    ?.addConfig([
      'pnpm/pnpm-workspace-yaml',
      {
        filesDefault: ['pnpm-workspace.yaml'],
        language: ['yaml', 'yaml'],
      },
    ])
    .addRule(
      'yaml-enforce-settings',
      enforcePnpmWorkspaceSettings ? ERROR : OFF,
      enforcePnpmWorkspaceSettings ? [enforcePnpmWorkspaceSettings] : [],
    ) /** @since 1.4.0 */
    .addRule('yaml-no-anonymous-catalog', ERROR) /** @since 1.7.0 */
    .addRule('yaml-no-duplicate-catalog-item', ERROR) /** @since 0.3.0 */
    .addRule('yaml-no-unused-catalog-item', ERROR) /** @since 0.3.0 */
    .addRule('yaml-valid-packages', ERROR) /** @since 1.2.0 */
    .enableConfigTesterForPlugin('pnpm', {
      /* v8 ignore start */
      rulesToSkipInConfig: (ruleName) =>
        !arrayIncludes(RULE_CATEGORIES_PER_FILE_TYPE.yaml, ruleName),
      /* v8 ignore stop */
    })
    .addOverrides();

  return {
    configs: [configBuilderPackageJson, configBuilderPnpmWorkspace],
    optionsResolved,
  };
}) satisfies UnConfigFn<'pnpm'>;

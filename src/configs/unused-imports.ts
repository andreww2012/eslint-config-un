import {ERROR} from '../constants';
import {
  type ExtraPluginsType,
  type GetRuleNamesInPlugin,
  type GetRuleOptions,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  type UnRulesConfigPartial,
  assignDefaults,
} from './index';

interface NoUnusedVarsSubConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<
  ExtraPlugins,
  Pick<UnRulesConfigPartial<'unused-imports'>, 'unused-imports/no-unused-vars'>
> {
  ruleOptions?: GetRuleOptions<'unused-imports', 'no-unused-vars'>;
}

export interface UnusedImportsEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'unused-imports'> {
  /**
   * Disable [`no-unused-vars`](https://eslint.org/docs/latest/rules/no-unused-vars), [`ts/no-unused-vars`](https://typescript-eslint.io/rules/no-unused-vars) and [`sonarjs/no-unused-vars`](https://sonarsource.github.io/rspec/#/rspec/S1481/javascript) rules in favor of `unused-imports/no-unused-vars` rule.
   * @default false
   */
  configNoUnusedVars?: boolean | NoUnusedVarsSubConfigOptions<ExtraPlugins>;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configNoUnusedVars: false,
  } satisfies UnusedImportsEslintConfigOptions);

  const {configNoUnusedVars} = optionsResolved;

  const configBuilderNoUnusedImports = context.createConfigBuilder(
    optionsResolved,
    'unused-imports',
  );

  configBuilderNoUnusedImports
    ?.addConfig(['unused-imports/no-unused-imports', {includeDefaultFilesAndIgnores: true}])
    .addRule('no-unused-imports', ERROR) /** @since 0.0.2 */
    .enableConfigTesterForPlugin('unused-imports', {
      rulesToSkipInConfig: (ruleName) =>
        ruleName === ('no-unused-vars' satisfies GetRuleNamesInPlugin<'unused-imports'>),
    })
    .addOverrides();

  const configBuilderNoUnusedVars = context.createConfigBuilder(
    configNoUnusedVars,
    'unused-imports',
  );
  const configNoUnusedVarsOptions =
    typeof configNoUnusedVars === 'object' ? configNoUnusedVars : {};
  const {ruleOptions} = configNoUnusedVarsOptions;

  configBuilderNoUnusedVars
    ?.addConfig(['unused-imports/no-unused-vars', {includeDefaultFilesAndIgnores: true}])
    .addRule(
      'no-unused-vars',
      ERROR,
      ruleOptions === undefined ? [] : [ruleOptions],
    ) /** @since 0.0.2 */
    .disableAnyRule('', 'no-unused-vars')
    .disableAnyRule('sonarjs', 'no-unused-vars')
    .disableAnyRule('ts', 'no-unused-vars')
    .enableConfigTesterForPlugin('unused-imports', {
      rulesToSkipInConfig: (ruleName) =>
        ruleName === ('no-unused-imports' satisfies GetRuleNamesInPlugin<'unused-imports'>),
    })
    .addOverrides();

  return {
    configs: [configBuilderNoUnusedImports, configBuilderNoUnusedVars],
    optionsResolved,
  };
}) satisfies UnConfigFn<'unusedImports'>;

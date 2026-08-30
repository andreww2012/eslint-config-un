import {ERROR} from '../constants';
import {
  type ExtraPluginsType,
  type GetRuleNamesInPlugin,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  type UnRulesConfigPartial,
  assignDefaults,
  defineUnConfig,
} from './index';

interface NoUnusedVarsSubConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<
  ExtraPlugins,
  Pick<UnRulesConfigPartial<'unused-imports'>, 'unused-imports/no-unused-vars'>
> {
  /**
   * Options of the rule this sub-config enables.
   *
   * Affected rule:
   * - [`unused-imports/no-unused-vars`](https://github.com/sweepline/eslint-plugin-unused-imports/blob/HEAD/README.md)
   */
  ruleOptions?: GetRuleOptions<'unused-imports', 'no-unused-vars'>;
}

/**
 * Provides an autofix to remove unused imports.
 *
 * Note: `typescript-eslint` since v8.53.0 has built-in ability for
 * [`ts/no-unused-vars`](https://typescript-eslint.io/rules/no-unused-vars) rule to
 * [automatically remove unused imports](https://typescript-eslint.io/rules/no-unused-vars/#enableautofixremovalimports).
 *
 * 📁 Default `files`: all files
 */
export interface UnusedImportsEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'unused-imports'> {
  /**
   * Disable [`no-unused-vars`](https://eslint.org/docs/latest/rules/no-unused-vars),
   * [`ts/no-unused-vars`](https://typescript-eslint.io/rules/no-unused-vars) and
   * `sonarjs/no-unused-vars` rules in favor of `unused-imports/no-unused-vars` rule.
   *
   * 📁 Default `files`: all files
   * @default false
   */
  configNoUnusedVars?: boolean | NoUnusedVarsSubConfigOptions<ExtraPlugins>;
}

export default defineUnConfig<UnusedImportsEslintConfigOptions>(
  'unusedImports',
  false,
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configNoUnusedVars: false,
  });

  const {configNoUnusedVars} = optionsResolved;

  const configBuilderNoUnusedImports = context.createConfigBuilder(
    optionsResolved,
    'unused-imports',
  );

  configBuilderNoUnusedImports
    ?.addConfig('unused-imports/no-unused-imports')
    .addRule('no-unused-imports', ERROR) /** @since 0.0.2 */
    .enableConfigTesterForPlugin('unused-imports', {
      /* v8 ignore next 2 */
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
    ?.addConfig('unused-imports/no-unused-vars')
    .addRule(
      'no-unused-vars',
      ERROR,
      ruleOptions === undefined ? [] : [ruleOptions],
    ) /** @since 0.0.2 */
    .disableAnyRule('', 'no-unused-vars')
    .disableAnyRule('sonarjs', 'no-unused-vars')
    .disableAnyRule('ts', 'no-unused-vars')
    .enableConfigTesterForPlugin('unused-imports', {
      /* v8 ignore next 2 */
      rulesToSkipInConfig: (ruleName) =>
        ruleName === ('no-unused-imports' satisfies GetRuleNamesInPlugin<'unused-imports'>),
    })
    .addOverrides();
});

import {ERROR} from '../constants';
import {
  type AllRulesWithPrefix,
  type ConfigSharedOptions,
  type DisableAutofixPrefix,
  type GetRuleOptions,
  createConfigBuilder,
} from '../eslint';
import type {PrettifyShallow} from '../types';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface UnusedImportsEslintConfigOptions extends ConfigSharedOptions<'unused-imports'> {
  /**
   * Disable [`no-unused-vars`](https://eslint.org/docs/latest/rules/no-unused-vars), [`@typescript-eslint/no-unused-vars`](https://typescript-eslint.io/rules/no-unused-vars) and [`sonarjs/no-unused-vars`](https://sonarsource.github.io/rspec/#/rspec/S1481/javascript) rules in favor of `unused-imports/no-unused-vars` rule.
   * @default false
   */
  configNoUnusedVars?:
    | boolean
    | PrettifyShallow<
        ConfigSharedOptions<
          Pick<
            AllRulesWithPrefix<'unused-imports', true>,
            `${'' | `${DisableAutofixPrefix}/`}unused-imports/no-unused-vars`
          >
        > & {
          ruleOptions?: GetRuleOptions<'unused-imports/no-unused-vars'>[0];
        }
      >;
}

export const unusedImportsUnConfig: UnConfigFn<'unusedImports'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.unusedImports;
  const optionsResolved = assignDefaults(optionsRaw, {
    configNoUnusedVars: false,
  } satisfies UnusedImportsEslintConfigOptions);

  const {configNoUnusedVars} = optionsResolved;

  const configBuilderNoUnusedImports = createConfigBuilder(
    context,
    optionsResolved,
    'unused-imports',
  );

  configBuilderNoUnusedImports
    ?.addConfig(['unused-imports/no-unused-imports', {includeDefaultFilesAndIgnores: true}])
    .addRule('no-unused-imports', ERROR)
    .addOverrides();

  const configBuilderNoUnusedVars = createConfigBuilder(
    context,
    configNoUnusedVars,
    'unused-imports',
  );
  const configNoUnusedVarsOptions =
    typeof configNoUnusedVars === 'object' ? configNoUnusedVars : {};
  const {ruleOptions} = configNoUnusedVarsOptions;

  configBuilderNoUnusedVars
    ?.addConfig(['unused-imports/no-unused-vars', {includeDefaultFilesAndIgnores: true}])
    .disableAnyRule('', 'no-unused-vars')
    .disableAnyRule('sonarjs', 'no-unused-vars')
    .disableAnyRule('@typescript-eslint', 'no-unused-vars')
    .addRule('no-unused-vars', ERROR, ruleOptions === undefined ? [] : [ruleOptions]);

  return {
    configs: [configBuilderNoUnusedImports, configBuilderNoUnusedVars],
    optionsResolved,
  };
};

import {ERROR} from '../constants';
import {
  type AllRulesWithPrefix,
  ConfigEntryBuilder,
  type ConfigSharedOptions,
  type DisableAutofixPrefix,
  type FlatConfigEntry,
  type GetRuleOptions,
} from '../eslint';
import type {PrettifyShallow} from '../types';
import type {InternalConfigOptions} from './index';

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

export const unusedImportsEslintConfig = (
  options: UnusedImportsEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const {configNoUnusedVars = false} = options;

  const noUnusedImportsBuilder = new ConfigEntryBuilder('unused-imports', options, internalOptions);

  noUnusedImportsBuilder
    .addConfig(['unused-imports/no-unused-imports', {includeDefaultFilesAndIgnores: true}])
    .addRule('no-unused-imports', ERROR)
    .addOverrides();

  const configNoUnusedVarsOptions =
    typeof configNoUnusedVars === 'object' ? configNoUnusedVars : {};

  const noUnusedVarsBuilder = new ConfigEntryBuilder(
    'unused-imports',
    configNoUnusedVarsOptions,
    internalOptions,
  );

  if (configNoUnusedVars !== false) {
    const {ruleOptions} = configNoUnusedVarsOptions;

    noUnusedVarsBuilder
      .addConfig(['unused-imports/no-unused-vars', {includeDefaultFilesAndIgnores: true}])
      .disableAnyRule('no-unused-vars')
      .disableAnyRule('sonarjs/no-unused-vars')
      .disableAnyRule('@typescript-eslint/no-unused-vars')
      .addRule('no-unused-vars', ERROR, ruleOptions === undefined ? [] : [ruleOptions]);
  }

  return [...noUnusedImportsBuilder.getAllConfigs(), ...noUnusedVarsBuilder.getAllConfigs()];
};

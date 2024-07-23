import eslintPluginSonar from 'eslint-plugin-sonarjs';
import {OFF} from '../constants';
import type {
  ConfigSharedOptions,
  FlatConfigEntry,
  InternalConfigOptions,
  RuleDefinitionsToRuleEntries,
} from '../types';
import {genFlatConfigEntryName} from '../utils';

export interface SonarEslintConfigOptions
  extends ConfigSharedOptions<RuleDefinitionsToRuleEntries<(typeof eslintPluginSonar)['rules']>> {}

export const sonarEslintConfig = (
  options: SonarEslintConfigOptions = {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const rules: FlatConfigEntry['rules'] = {
    // Bug Detection

    // 'sonarjs/no-all-duplicated-branches': ERROR,
    // 'sonarjs/no-element-overwrite': ERROR,
    // 'sonarjs/no-empty-collection': ERROR,
    // 'sonarjs/no-extra-arguments': ERROR,
    // 'sonarjs/no-identical-conditions': ERROR,
    // 'sonarjs/no-identical-expressions': ERROR,
    // 'sonarjs/no-ignored-return': ERROR,
    // 'sonarjs/no-one-iteration-loop': ERROR,
    // 'sonarjs/no-use-of-empty-return-value': ERROR,
    // 'sonarjs/non-existent-operator': ERROR,

    // Code Smell Detection

    // 'sonarjs/cognitive-complexity': OFF,
    // 'sonarjs/elseif-without-else': OFF,
    // 'sonarjs/max-switch-cases': OFF,
    // 'sonarjs/no-collapsible-if': ERROR,
    // 'sonarjs/no-collection-size-mischeck': ERROR, // TODO disable autofix?
    'sonarjs/no-duplicate-string': OFF,
    // 'sonarjs/no-duplicated-branches': ERROR,
    // 'sonarjs/no-gratuitous-expressions': ERROR,
    // 'sonarjs/no-identical-functions': ERROR,
    // 'sonarjs/no-inverted-boolean-check': ERROR,
    'sonarjs/no-nested-switch': OFF,
    'sonarjs/no-nested-template-literals': OFF,
    // 'sonarjs/no-redundant-boolean': ERROR,
    // 'sonarjs/no-redundant-jump': ERROR,
    // 'sonarjs/no-same-line-conditional': ERROR, // TODO disable autofix?
    // 'sonarjs/no-small-switch': ERROR,
    'sonarjs/no-unused-collection': OFF,
    // 'sonarjs/no-useless-catch': ERROR,
    'sonarjs/prefer-immediate-return': OFF,
    // 'sonarjs/prefer-object-literal': ERROR,
    // 'sonarjs/prefer-single-boolean-return': ERROR,
    // 'sonarjs/prefer-while': ERROR,
  };

  return [
    {
      plugins: {
        sonarjs: eslintPluginSonar as never,
      },
      ...(options.files && {files: options.files}),
      ...(options.ignores && {ignores: options.ignores}),
      rules: {
        ...eslintPluginSonar.configs.recommended.rules,
        ...rules,
        ...options.overrides,
      },
      name: genFlatConfigEntryName('sonar'),
    },
  ];
};

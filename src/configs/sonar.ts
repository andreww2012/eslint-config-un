import eslintPluginSonar from 'eslint-plugin-sonarjs';
import {OFF} from '../constants';
import type {ConfigSharedOptions, FlatConfigEntry, InternalConfigOptions} from '../types/eslint';
import {ConfigEntryBuilder} from '../utils';

export interface SonarEslintConfigOptions extends ConfigSharedOptions<'sonarjs'> {}

export const sonarEslintConfig = (
  options: SonarEslintConfigOptions = {},

  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const builder = new ConfigEntryBuilder<'sonarjs'>(options, internalOptions);

  builder
    .addConfig(['sonar', {includeDefaultFilesAndIgnores: true}], {
      plugins: {
        // @ts-expect-error small types mismatch
        sonarjs: eslintPluginSonar,
      },
    })
    .addBulkRules(eslintPluginSonar.configs.recommended.rules)
    // 🟢 Bug Detection
    // .addRule('sonarjs/no-all-duplicated-branches', ERROR)
    // .addRule('sonarjs/no-element-overwrite', ERROR)
    // .addRule('sonarjs/no-empty-collection', ERROR)
    // .addRule('sonarjs/no-extra-arguments', ERROR)
    // .addRule('sonarjs/no-identical-conditions', ERROR)
    // .addRule('sonarjs/no-identical-expressions', ERROR)
    // .addRule('sonarjs/no-ignored-return', ERROR)
    // .addRule('sonarjs/no-one-iteration-loop', ERROR)
    // .addRule('sonarjs/no-use-of-empty-return-value', ERROR)
    // .addRule('sonarjs/non-existent-operator', ERROR)
    // 🟢 Code Smell Detection
    // .addRule('sonarjs/cognitive-complexity', OFF)
    // .addRule('sonarjs/elseif-without-else', OFF)
    // .addRule('sonarjs/max-switch-cases', OFF)
    // .addRule('sonarjs/no-collapsible-if', ERROR)
    // .addRule('sonarjs/no-collection-size-mischeck', ERROR) // TODO disable autofix?
    .addRule('sonarjs/no-duplicate-string', OFF)
    // .addRule('sonarjs/no-duplicated-branches', ERROR)
    // .addRule('sonarjs/no-gratuitous-expressions', ERROR)
    // .addRule('sonarjs/no-identical-functions', ERROR)
    // .addRule('sonarjs/no-inverted-boolean-check', ERROR)
    .addRule('sonarjs/no-nested-switch', OFF)
    .addRule('sonarjs/no-nested-template-literals', OFF)
    // .addRule('sonarjs/no-redundant-boolean', ERROR)
    // .addRule('sonarjs/no-redundant-jump', ERROR)
    // .addRule('sonarjs/no-same-line-conditional', ERROR) // TODO disable autofix?
    // .addRule('sonarjs/no-small-switch', ERROR)
    .addRule('sonarjs/no-unused-collection', OFF)
    // .addRule('sonarjs/no-useless-catch', ERROR)
    .addRule('sonarjs/prefer-immediate-return', OFF)
    // .addRule('sonarjs/prefer-object-literal', ERROR)
    // .addRule('sonarjs/prefer-single-boolean-return', ERROR)
    // .addRule('sonarjs/prefer-while', ERROR)
    .addOverrides();

  return builder.getAllConfigs();
};

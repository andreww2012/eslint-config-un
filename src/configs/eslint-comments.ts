import eslintPluginEslintComments from '@eslint-community/eslint-plugin-eslint-comments';
import {ERROR} from '../constants';
import {ConfigEntryBuilder, type ConfigSharedOptions, type FlatConfigEntry} from '../eslint';
import type {InternalConfigOptions} from './index';

export interface EslintCommentsEslintConfigOptions
  extends ConfigSharedOptions<'@eslint-community/eslint-comments'> {}

export const eslintCommentsEslintConfig = (
  options: EslintCommentsEslintConfigOptions,
  internalOptions: InternalConfigOptions,
): FlatConfigEntry[] => {
  const builder = new ConfigEntryBuilder(
    '@eslint-community/eslint-comments',
    options,
    internalOptions,
  );

  // Legend:
  // 🟣 - in recommended
  // 🔴 - not in recommended

  builder
    .addConfig(['eslint-comments', {includeDefaultFilesAndIgnores: true}])
    // @ts-expect-error no proper types
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    .addBulkRules(eslintPluginEslintComments.configs.recommended.rules)
    // 🟢 Best Practices
    .addRule('disable-enable-pair', ERROR, [{allowWholeFile: true}]) // 🟣
    // .addRule('no-aggregating-enable', ERROR) // 🟣
    // .addRule('no-duplicate-disable', ERROR) // 🟣
    // .addRule('no-unlimited-disable', ERROR) // 🟣
    // .addRule('no-unused-disable', OFF) // Handled by ESLint natively
    // .addRule('no-unused-enable', ERROR) // 🟣
    // 🟢 Stylistic
    // .addRule('no-restricted-disable', OFF)
    // .addRule('no-use', OFF)
    // .addRule('require-description', OFF)
    .addOverrides();

  return builder.getAllConfigs();
};

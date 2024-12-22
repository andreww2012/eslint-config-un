// @ts-expect-error no typings
import eslintPluginEslintComments from '@eslint-community/eslint-plugin-eslint-comments';
import {ERROR} from '../constants';
import {ConfigEntryBuilder, type ConfigSharedOptions, type FlatConfigEntry} from '../eslint';
import type {InternalConfigOptions} from './index';

export interface EslintCommentsEslintConfigOptions
  extends ConfigSharedOptions<'@eslint-community/eslint-comments'> {}

export const eslintCommentsEslintConfig = (
  options: EslintCommentsEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const builder = new ConfigEntryBuilder<'@eslint-community/eslint-comments'>(
    options,
    internalOptions,
  );

  // Legend:
  // 🟣 - in recommended
  // 🔴 - not in recommended

  builder
    .addConfig(['eslint-comments', {includeDefaultFilesAndIgnores: true}], {
      plugins: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        '@eslint-community/eslint-comments': eslintPluginEslintComments,
      },
    })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    .addBulkRules(eslintPluginEslintComments.configs.recommended.rules)
    // 🟢 Best Practices
    .addRule('@eslint-community/eslint-comments/disable-enable-pair', ERROR, [
      {allowWholeFile: true},
    ]) // 🟣
    // .addRule('@eslint-community/eslint-comments/no-aggregating-enable', ERROR) // 🟣
    // .addRule('@eslint-community/eslint-comments/no-duplicate-disable', ERROR) // 🟣
    // .addRule('@eslint-community/eslint-comments/no-unlimited-disable', ERROR) // 🟣
    // .addRule('@eslint-community/eslint-comments/no-unused-disable', OFF) // Handled by ESLint natively
    // .addRule('@eslint-community/eslint-comments/no-unused-enable', ERROR) // 🟣
    // 🟢 Stylistic
    // .addRule('@eslint-community/eslint-comments/no-restricted-disable', OFF)
    // .addRule('@eslint-community/eslint-comments/no-use', OFF)
    // .addRule('@eslint-community/eslint-comments/require-description', OFF)
    .addOverrides();

  return builder.getAllConfigs();
};

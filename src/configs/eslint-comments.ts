import eslintPluginEslintComments from '@eslint-community/eslint-plugin-eslint-comments';
import {ERROR} from '../constants';
import {ConfigEntryBuilder, type ConfigSharedOptions} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface EslintCommentsEslintConfigOptions
  extends ConfigSharedOptions<'@eslint-community/eslint-comments'> {}

export const eslintCommentsUnConfig: UnConfigFn<'eslintComments'> = (context) => {
  const optionsRaw = context.globalOptions.configs?.eslintComments;
  const optionsResolved = assignDefaults(
    optionsRaw,
    {} satisfies EslintCommentsEslintConfigOptions,
  );

  const configBuilder = new ConfigEntryBuilder(
    '@eslint-community/eslint-comments',
    optionsResolved,
    context,
  );

  // Legend:
  // 🟣 - in recommended
  // 🔴 - not in recommended

  configBuilder
    .addConfig([
      'eslint-comments',
      {
        includeDefaultFilesAndIgnores: true,
        // Supports official markdown, css and json plugins: https://github.com/eslint-community/eslint-plugin-eslint-comments/issues/256
        doNotIgnoreCss: true,
        doNotIgnoreMarkdown: true,
      },
    ])
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

  return {
    configs: configBuilder.getAllConfigs(),
    optionsResolved,
  };
};

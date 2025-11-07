import {ERROR, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

export interface EslintCommentsEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends UnConfigOptions<ExtraPlugins, '@eslint-community/eslint-comments'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(
    optionsRaw,
    {} satisfies EslintCommentsEslintConfigOptions,
  );

  const configBuilder = context.createConfigBuilder(
    optionsResolved,
    '@eslint-community/eslint-comments',
  );

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'eslint-comments',
      {
        includeDefaultFilesAndIgnores: true,
        // Supports official markdown, css and json plugins: https://github.com/eslint-community/eslint-plugin-eslint-comments/issues/256
        doNotIgnoreCss: true,
        doNotIgnoreHtml: true,
        doNotIgnoreMarkdown: true,
      },
    ])
    .markCategory('Best Practices')
    .addRule('disable-enable-pair', ERROR, [{allowWholeFile: true}]) /** @since 3.2.0 */ // 🟢
    .addRule('no-aggregating-enable', ERROR) /** @since 3.2.0 */ // 🟢
    .addRule('no-duplicate-disable', ERROR) /** @since 3.2.0 */ // 🟢
    .addRule('no-unlimited-disable', ERROR) /** @since 3.2.0 */ // 🟢
    .addRule('no-unused-disable', OFF) /** @since 3.2.0 */ // Handled by ESLint natively
    .addRule('no-unused-enable', ERROR) /** @since 3.2.0 */ // 🟢
    .markCategory('Stylistic')
    .addRule('no-restricted-disable', OFF) /** @since 3.2.0 */
    .addRule('no-use', OFF) /** @since 3.2.0 */
    .addRule('require-description', OFF) /** @since 3.2.0 */
    .enableConfigTesterForPlugin('@eslint-community/eslint-comments')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'eslintComments'>;

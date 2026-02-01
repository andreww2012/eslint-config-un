import {ERROR, GLOB_JSX_TSX, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface DocusaurusEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'docusaurus'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies DocusaurusEslintConfigOptions);

  const configBuilder = context.createConfigBuilder(optionsResolved, 'docusaurus');

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig([
      'docusaurus',
      {
        includeDefaultFilesAndIgnores: true,
        filesDefault: [GLOB_JSX_TSX],
      },
    ])
    .addRule('no-html-links', ERROR) /** @since 0.0.0-5416 */ // 🟡
    .addRule('no-untranslated-text', OFF) /** @since 0.0.0-4925 */
    .addRule('prefer-docusaurus-heading', ERROR) /** @since 0.0.0-5456 */ // 🟡
    .addRule('string-literal-i18n-messages', ERROR) /** @since 0.0.0-4925 */ // 🟢
    .enableConfigTesterForPlugin('docusaurus')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'docusaurus'>;

import {ERROR, GLOB_JSX_TSX, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [Docusaurus](https://docusaurus.io) specific rules.
 *
 * 📁 Default `files`: <code>**&#47;*.?([cm])[jt]sx</code>
 */
export interface DocusaurusEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'docusaurus'> {}

export default defineUnConfig<DocusaurusEslintConfigOptions>('docusaurus', {
  enabledBy: {package: '@docusaurus/core'},
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'docusaurus');

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig([
      'docusaurus',
      {
        filesDefault: [GLOB_JSX_TSX],
      },
    ])
    .addRule('no-html-links', ERROR) /** @since 0.0.0-5416 */ // 🟡
    .addRule('no-untranslated-text', OFF) /** @since 0.0.0-4925 */
    .addRule('prefer-docusaurus-heading', ERROR) /** @since 0.0.0-5456 */ // 🟡
    .addRule('string-literal-i18n-messages', ERROR) /** @since 0.0.0-4925 */ // 🟢
    .enableConfigTesterForPlugin('docusaurus')
    .addOverrides();
});

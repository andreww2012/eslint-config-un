import {ERROR, GLOB_VUE} from '../constants';
import type {Prettify} from '../types';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

const VUE_TEMPLATE_RULE_OPTIONS: GetRuleOptions<'i18next', 'no-literal-string'> = {
  framework: 'vue',
  mode: 'vue-template-only',
  // Matches the default `jsx-text-only` mode, which never reports attribute values
  'jsx-attributes': {exclude: ['.*']},
};

/**
 * [i18next](https://www.i18next.com) specific rules.
 *
 * 📁 Default `files`: all files
 */
export interface I18nextEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'i18next'> {
  /**
   * A dedicated config entry for Vue files with the rule options adjusted for Vue templates.
   * Like in JSX, only plain text in templates is reported, not attribute values.
   *
   * 📁 Default `files`: <code>**&#47;*.vue</code>
   * @default true <=> `vue` config is enabled
   */
  configVue?:
    | boolean
    | Prettify<
        UnFlatConfigEntryBase<ExtraPlugins, 'i18next'> & {
          /**
           * Options of
           * [the only rule, `no-literal-string`](https://github.com/edvardchen/eslint-plugin-i18next/blob/HEAD/docs/rules/no-literal-string.md).
           * Merged with the `options` of the parent config.
           * `framework`, `mode` and `jsx-attributes` default to the ones for Vue templates instead
           * of being inherited.
           */
          options?: GetRuleOptions<'i18next', 'no-literal-string'>;
        }
      >;

  /**
   * Options of
   * [the only rule, `no-literal-string`](https://github.com/edvardchen/eslint-plugin-i18next/blob/HEAD/docs/rules/no-literal-string.md).
   * Also inherited by the `vue` sub-config, except `framework`, `mode` and `jsx-attributes`.
   */
  options?: GetRuleOptions<'i18next', 'no-literal-string'>;
}

export default defineUnConfig<I18nextEslintConfigOptions>('i18next', {
  // `i18next` is only a peer dependency of the bindings, so it might not be resolvable
  enabledBy: {
    packages: ['i18next', 'react-i18next', 'next-i18next', 'remix-i18next', 'i18next-vue'],
  },
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configVue: context.configsMeta.vue.enabled,
  });

  const {configVue, options} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'i18next');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'i18next',
      {
        // The rule works without type information, while the split would limit it to TS files only
        skipTypeInfoSplit: true,
      },
    ])
    .addRule('no-literal-string', ERROR, options ? [options] : []) /** @since 1.0.0 */ // 🟢
    .enableConfigTesterForPlugin('i18next')
    .addOverrides();

  const configBuilderVue = context.createConfigBuilder(configVue, 'i18next');

  const {options: vueOptions} = assignDefaults(configVue, {});

  configBuilderVue
    ?.addConfig([
      'i18next/vue',
      {
        filesDefault: [GLOB_VUE],
        parseWith: 'vue',
        // Same reason as above ^
        skipTypeInfoSplit: true,
      },
    ])
    .addRule('no-literal-string', ERROR, [
      {...options, ...VUE_TEMPLATE_RULE_OPTIONS, ...vueOptions},
    ]) /** @since 1.0.0 */ // 🟢
    .addOverrides();
});

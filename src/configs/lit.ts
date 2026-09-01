// cspell:ignore classfield
import {ERROR, OFF} from '../constants';
import type {OmitStrict} from '../types';
import type {JsxA11yEslintConfigOptions} from './jsx-a11y';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [`eslint-plugin-lit-a11y`](https://npmx.dev/eslint-plugin-lit-a11y) plugin
 * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
 * that will be assigned to `settings` object as-is and applied to the resolved `files` and
 * `ignores` of this config.
 */
export interface LitA11yPluginSettings {
  /**
   * Set to `true` to make sure only [`lit-html`](https://npmx.dev/lit-html) tagged template
   * literals are linted.
   *
   * If you're importing `lit-html` from a package that re-exports `lit-html`, like for example
   * `@apollo-elements/lit-apollo`, you can specify `@apollo-elements/lit-apollo` here.
   */
  litHtmlSources?: boolean | string[];
}

interface A11YSubConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends
    UnFlatConfigEntryBase<ExtraPlugins, 'lit-a11y'>,
    OmitStrict<
      JsxA11yEslintConfigOptions,
      | keyof UnFlatConfigEntryBase
      | 'ambiguousWordsForAnchorText'
      | 'customComponents'
      | 'labelAttributes'
      | 'tabbableRoles'
    > {
  /**
   * Custom components that render the corresponding HTML element, checked by various rules
   */
  customComponents?: Pick<
    JsxA11yEslintConfigOptions['customComponents'] & {},
    | 'areaElements'
    | 'headings'
    | 'imgElements'
    | 'inputTypeImageElements'
    | 'inputs'
    | 'links'
    | 'objectElements'
  >;
}

/**
 * [`eslint-plugin-lit`](https://npmx.dev/eslint-plugin-lit) plugin
 * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
 * that will be assigned to the `lit` property of the `settings` flat config option.
 */
export interface LitPluginSettings {
  /**
   * Instructs rules to recognize the following classes as sub-classes of `LitElement`
   */
  elementBaseClasses?: string[];
}

/**
 * [Lit](https://lit.dev) specific rules.
 *
 * 📁 Default `files`: all files
 */
export interface LitEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'lit'> {
  /**
   * A11Y (accessibility) specific rules for Lit components.
   *
   * Since most of the rules are ported from
   * [`eslint-plugin-jsx-a11y`](https://npmx.dev/eslint-plugin-jsx-a11y), this config also accepts
   * the same options as `jsxA11y` config.
   *
   * 📁 Default `files` and `ignores`: inherited from the parent config
   *
   * 🧩 Main plugin: [`eslint-plugin-lit-a11y`](https://npmx.dev/eslint-plugin-lit-a11y)
   * @default true
   */
  configA11y?: boolean | A11YSubConfigOptions<ExtraPlugins>;
}

export default defineUnConfig<LitEslintConfigOptions>('lit', {enabledBy: {package: 'lit'}})(async (
  context,
  optionsRaw,
) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'lit');

  const {files: parentConfigFiles, ignores: parentConfigIgnores, configA11y} = optionsResolved;

  const pluginSettings = context.getPluginSettings('lit');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'lit',
      {
        settings: {
          lit: pluginSettings,
        },
      },
    ])
    .addRule('attribute-names', ERROR, [{convention: 'kebab'}]) /** @since 1.11.0 */
    .addRule('attribute-value-entities', ERROR) /** @since 0.1.0 */
    .addRule('ban-attributes', OFF) /** @since 1.7.0 */
    .addRule('binding-positions', ERROR) /** @since 0.1.0 */
    .addRule('lifecycle-super', ERROR) /** @since 1.9.0 */
    .addRule('no-classfield-shadowing', ERROR) /** @since 1.10.0 */
    .addRule('no-duplicate-template-bindings', ERROR) /** @since 0.1.0 */
    .addRule('no-invalid-escape-sequences', ERROR) /** @since 1.1.0 */
    .addRule('no-invalid-html', ERROR) /** @since 0.4.0 */
    .addRule('no-legacy-imports', ERROR) /** @since 1.5.0 */
    .addRule('no-legacy-template-syntax', ERROR) /** @since 0.1.0 */
    .addRule('no-native-attributes', ERROR) /** @since 1.8.0 */
    .addRule('no-private-properties', ERROR) /** @since 1.0.0 */
    .addRule('no-property-change-update', ERROR) /** @since 0.2.0 */
    .addRule('no-template-arrow', ERROR) /** @since 1.0.0 */
    .addRule('no-template-bind', ERROR) /** @since 0.1.0 */
    .addRule('no-template-map', OFF) /** @since 0.1.0 */
    .addRule('no-this-assign-in-render', ERROR) /** @since 1.7.0 */
    .addRule('no-useless-template-literals', ERROR) /** @since 0.1.0 */
    .addRule('no-value-attribute', ERROR) /** @since 0.6.0 */
    .addRule('prefer-nothing', ERROR) /** @since 1.7.0 */
    .addRule('prefer-query-decorators', ERROR) /** @since 2.3.1 */
    .addRule('prefer-static-styles', ERROR) /** @since 1.5.0 */
    .addRule('quoted-expressions', ERROR, ['never']) /** @since 1.4.0 */
    .addRule('value-after-constraints', ERROR) /** @since 1.7.0 */
    .enableConfigTesterForPlugin('lit')
    .addOverrides();

  if (configA11y !== false) {
    const {buildJsxA11yConfigs} = await import('./jsx-a11y');
    buildJsxA11yConfigs(context, undefined, {
      prefix: 'lit',
      options: {
        files: parentConfigFiles,
        ignores: parentConfigIgnores,
        ...(typeof configA11y === 'object' && configA11y),
      },
    });
  }
});

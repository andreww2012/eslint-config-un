// cspell:ignore classfield
import {ERROR, OFF} from '../constants';
import type {OmitStrict} from '../types';
import type {JsxA11yEslintConfigOptions} from './jsx-a11y';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

interface A11YSubConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends
    UnFlatConfigEntryBase<ExtraPlugins, 'lit-a11y'>,
    OmitStrict<
      JsxA11yEslintConfigOptions,
      | 'settings'
      | keyof UnFlatConfigEntryBase
      | 'ambiguousWordsForAnchorText'
      | 'customComponents'
      | 'labelAttributes'
      | 'tabbableRoles'
    > {
  /**
   * [`eslint-plugin-lit-a11y`](https://npmx.dev/eslint-plugin-lit-a11y) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
   * that will be assigned to `settings` object as-is and applied to the specified `files` and `ignores`.
   */
  settings?: {
    /**
     * Set to `true` to make sure only [`lit-html`](https://npmx.dev/lit-html)
     * tagged template literals are linted.
     *
     * If you're importing `lit-html` from a package that re-exports `lit-html`,
     * like for example `@apollo-elements/lit-apollo`, you can specify
     * `@apollo-elements/lit-apollo` here.
     */
    litHtmlSources?: boolean | string[];
  };

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

export interface LitEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'lit'> {
  /**
   * [`eslint-plugin-lit`](https://npmx.dev/eslint-plugin-lit) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
   * that will be assigned to `lit` property
   * and applied to the resolved `files` and `ignores` of this config.
   */
  settings?: {
    /**
     * Instructs rules to recognize the following classes as sub-classes of `LitElement`
     */
    elementBaseClasses?: string[];
  };

  /**
   * A11Y (accessibility) specific rules for Lit components.
   * By default, uses `files` and `ignores` from the parent config.
   *
   * Since most of the rules are ported from
   * [`eslint-plugin-jsx-a11y`](https://npmx.dev/eslint-plugin-jsx-a11y),
   * this config also accepts the same options as `jsxA11y` config.
   * @default true
   */
  configA11y?: boolean | A11YSubConfigOptions<ExtraPlugins>;
}

export default (async (context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'lit');

  const {
    settings: pluginSettings,
    files: parentConfigFiles,
    ignores: parentConfigIgnores,
    configA11y,
  } = optionsResolved;

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'lit',
      {
        includeDefaultFilesAndIgnores: true,
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

  return {
    configs: [
      configBuilder,
      ...(configA11y === false
        ? []
        : await (async () => {
            const {default: jsxA11yUnConfig} = await import('./jsx-a11y');
            const options = typeof configA11y === 'object' ? configA11y : {};
            const result = jsxA11yUnConfig(context, undefined, {
              prefix: 'lit',
              options: {
                files: parentConfigFiles,
                ignores: parentConfigIgnores,
                ...options,
                // `settings` type is different, but doesn't matter here
                settings: options.settings as JsxA11yEslintConfigOptions['settings'],
              },
            });
            return result.configs;
          })()),
    ],
    optionsResolved,
  };
}) satisfies UnConfigFn<'lit'>;

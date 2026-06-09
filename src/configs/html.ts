import type {ParserOptions as HtmlEslintParserOptions} from '@html-eslint/parser';
import {ERROR, GLOB_HTM_HTML, OFF, WARNING} from '../constants';
import {getKeysOfTruthyValues} from '../utils';
import {noRestrictedHtmlElementsDefault} from './shared';
import type {VueEslintConfigOptions} from './vue';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface HtmlEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends
    UnFlatConfigEntryBase<ExtraPlugins, 'html'>,
    Pick<VueEslintConfigOptions, 'disallowedHtmlTags'> {
  /**
   * [`@html-eslint/eslint-plugin`](https://npmx.dev/@html-eslint/eslint-plugin) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `html` property
   * and applied to the resolved `files` and `ignores` of this config.
   */
  settings?: {
    // TODO

    /**
     * This plugin allows you to lint not only HTML files but also HTML written in JavaScript Template Literal. You can set the `html` rules in your settings to lint JavaScript code without any additional configuration.
     *
     * Not all template literals are recognized as HTML. There are two ways to make the plugin recognize them as HTML.
     *
     * If you want to use keywords other than html for linting, you can configure the settings option.
     * @default {tags: ["^html$"], comments: ["^\\s*html\\s*$"]}
     */
    templateLiterals?: {
      tags?: string[];
      comments?: string[];
    };
  };

  /**
   * HTML parser options:
   * - `templateEngineSyntax`: to configure template engine syntax to support different
   * template engines (such as Twig or Handlebars).
   * - `frontmatter`: tells the parser to ignore the frontmatter part if you're using one.
   * - `rawContentTags`: the list of HTML tags for which contents should be treated as raw text.
   *
   * Will be assigned to `languageOptions.parserOptions` in the resulting flat config
   * and applied to the specified `files` and `ignores`.
   * @see https://github.com/yeonjuan/html-eslint/blob/HEAD/docs/integrating-template-engine.md
   */
  parserOptions?: HtmlEslintParserOptions;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {settings: pluginSettings, parserOptions} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'html');

  // Legend:
  // 🟢 - in recommended
  // TODO actually check that and maybe disable those rules if prettier is installed?
  // 💅 - may conflict with Prettier
  // 🎨 - CSS related

  configBuilder
    ?.addConfig(
      [
        'html',
        {
          includeDefaultFilesAndIgnores: true,
          filesDefault: [GLOB_HTM_HTML],
          parser: '@html-eslint/parser',
          ignoresInternal: {
            html: false,
          },
          settings: {
            html: pluginSettings,
          },
        },
      ],
      {
        languageOptions: {
          ...(parserOptions && {parserOptions}),
        },
      },
    )
    .markCategory('Best Practice')
    .addRule('css-no-empty-blocks', ERROR) /** @since 0.53.0 */ // 🎨
    .addRule('head-order', ERROR) /** @since 0.57.0 */
    .addRule('max-element-depth', OFF) /** @since 0.33.0 */
    .addRule('no-duplicate-attrs', ERROR) /** @since 0.9.0-0.9.0-alpha.1.0 */ // 🟢
    .addRule('no-duplicate-class', ERROR) /** @since 0.39.0 */
    .addRule('no-duplicate-id', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-duplicate-in-head', ERROR) /** @since 0.42.0 */
    .addRule('no-ineffective-attrs', ERROR) /** @since 0.45.0 */
    .addRule('no-inline-styles', OFF) /** @since 0.1.0 */
    .addRule('no-invalid-attr-value', ERROR) /** @since 0.55.0 */
    .addRule('no-invalid-entity', ERROR) /** @since 0.42.0 */
    .addRule('no-nested-interactive', ERROR) /** @since 0.32.0 */
    .addRule('no-obsolete-attrs', ERROR) /** @since 0.52.0 */ // 🟢
    .addRule('no-obsolete-tags', ERROR) /** @since 0.6.0 */ // 🟢
    .addRule('no-restricted-attr-values', OFF) /** @since 0.20.0 */
    .addRule('no-restricted-attrs', OFF) /** @since 0.13.0 */
    .addRule('no-restricted-tags', ERROR, [
      {
        tagPatterns: getKeysOfTruthyValues({
          ...noRestrictedHtmlElementsDefault,
          ...optionsResolved.disallowedHtmlTags,
        }).map((tagName) => `^${tagName}$`),
      },
    ]) /** @since 0.47.0 */
    .addRule('no-script-style-type', ERROR) /** @since 0.21.0 */
    .addRule('no-target-blank', ERROR) /** @since 0.9.0-0.9.0-alpha.1.0 */
    .addRule('no-whitespace-only-children', ERROR) /** @since 0.51.0  */
    .addRule('prefer-https', ERROR) /** @since 0.32.0 */
    .addRule('require-attrs', OFF) /** @since 0.17.0 */
    .addRule('require-button-type', ERROR) /** @since 0.10.0 */
    .addRule('require-closing-tags', ERROR) /** @since 0.6.0 */ // 🟢
    .addRule('require-details-summary', ERROR) /** @since 0.58.0 */
    .addRule('require-doctype', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('require-explicit-size', ERROR) /** @since 0.33.0 */
    .addRule('require-li-container', ERROR) /** @since 0.5.0 */ // 🟢
    .addRule('require-meta-charset', ERROR) /** @since 0.8.0 */
    .addRule('svg-require-viewbox', ERROR) /** @since 0.59.0 */
    .addRule('use-baseline', WARNING) /** @since 0.38.0 */ // 🟢
    .markCategory('SEO')
    .addRule('no-multiple-h1', ERROR) /** @since 0.2.0 */ // 🟢
    .addRule('require-lang', ERROR) /** @since 0.0.2 */ // 🟢
    .addRule('require-meta-description', OFF) /** @since 0.7.0 */
    .addRule('require-open-graph-protocol', OFF) /** @since 0.21.0 */
    .addRule('require-title', ERROR) /** @since 0.1.0 */ // 🟢
    .markCategory('Accessibility')
    .addRule('no-abstract-roles', ERROR) /** @since 0.10.0 */
    .addRule('no-accesskey-attrs', ERROR) /** @since 0.11.0 */
    .addRule('no-aria-hidden-body', ERROR) /** @since 0.10.0 */
    .addRule('no-aria-hidden-on-focusable', ERROR) /** @since 0.42.0 */
    .addRule('no-empty-headings', ERROR) /** @since 0.42.0 */
    .addRule('no-heading-inside-button', ERROR) /** @since 0.32.0 */
    .addRule('no-invalid-role', ERROR) /** @since 0.32.0 */
    .addRule('no-non-scalable-viewport', ERROR) /** @since 0.7.0 */
    .addRule('no-positive-tabindex', ERROR) /** @since 0.7.0 */
    .addRule('no-redundant-role', ERROR) /** @since 0.55.0 */
    .addRule('no-skip-heading-levels', OFF) /** @since 0.4.0 */
    .addRule('require-content', ERROR) /** @since 0.59.0 */
    .addRule('require-form-method', OFF) /** @since 0.32.0 */
    .addRule('require-frame-title', ERROR) /** @since 0.7.0 */
    .addRule('require-img-alt', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('require-input-label', ERROR) /** @since 0.32.0 */
    .addRule('require-meta-viewport', ERROR) /** @since 0.7.0 */
    .markCategory('Style')
    .addRule('attrs-newline', OFF) /** @since 0.25.0 */ // 🟢
    .addRule('class-spacing', ERROR) /** @since 0.52.0 */ // 🟢
    .addRule('element-newline', OFF) /** @since 0.3.0 */ // 🟢
    .addRule('id-naming-convention', OFF) /** @since 0.6.0 */
    .addRule('indent', OFF) /** @since 0.4.0 */ // 🟢
    .addRule('lowercase', ERROR) /** @since 0.21.0 */
    .addRule('no-extra-spacing-tags', ERROR, [
      {disallowMissing: true, disallowInAssignment: true},
    ]) /** @since 0.60.0 */ // 🟢💅
    .addRule('no-extra-spacing-text', WARNING, [{skip: ['pre']}]) /** @since 0.27.0 */
    .addRule('no-multiple-empty-lines', WARNING) /** @since 0.11.0 */
    .addRule('no-trailing-spaces', WARNING) /** @since 0.15.0 */
    .addRule('quotes', ERROR, ['double', {enforceTemplatedAttrValue: true}]) /** @since 0.5.0 */ // 🟢
    .addRule('sort-attrs', OFF) /** @since 0.21.0 */ // TODO find and enforce a good sorting order?
    .enableConfigTesterForPlugin('html')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'html'>;

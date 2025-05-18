import {ERROR, GLOB_HTML_ALL, OFF, WARNING} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults, interopDefault} from '../utils';
import type {UnConfigFn} from './index';

export interface HtmlEslintConfigOptions extends UnConfigOptions<'@html-eslint'> {
  /**
   * [`@html-eslint/eslint-plugin`](https://www.npmjs.com/package/@html-eslint/eslint-plugin) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `html` property and applied to the specified `files` and `ignores`.
   */
  settings?: {
    // TODO

    /**
     * This plugin allows you to lint not only HTML files but also HTML written in JavaScript Template Literal. You can set the @html-eslint rules in your settings to lint JavaScript code without any additional configuration.
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
}

export const htmlUnConfig: UnConfigFn<'html'> = async (context) => {
  const eslintParserHtml = await interopDefault(import('@html-eslint/parser'));

  const optionsRaw = context.rootOptions.configs?.html;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies HtmlEslintConfigOptions);

  const {settings: pluginSettings} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, '@html-eslint');

  // Legend:
  // 🟢 - in recommended
  // 💅 - conflicts with Prettier

  configBuilder
    ?.addConfig(
      [
        'html',
        {
          includeDefaultFilesAndIgnores: true,
          doNotIgnoreHtml: true,
          filesFallback: GLOB_HTML_ALL,
        },
      ],
      {
        languageOptions: {
          parser: eslintParserHtml,
        },
        ...(pluginSettings && {
          settings: {
            html: pluginSettings,
          },
        }),
      },
    )
    /* Category: Best Practice */
    .addRule('no-duplicate-attrs', ERROR) // 🟢
    .addRule('no-duplicate-class', ERROR)
    .addRule('no-duplicate-id', ERROR) // 🟢
    .addRule('no-extra-spacing-text', WARNING, [{skip: ['pre']}])
    .addRule('no-inline-styles', OFF)
    .addRule('no-nested-interactive', ERROR)
    .addRule('no-obsolete-tags', ERROR) // 🟢
    .addRule('no-restricted-attr-values', OFF)
    .addRule('no-restricted-attrs', OFF)
    .addRule('no-script-style-type', ERROR)
    .addRule('no-target-blank', ERROR)
    .addRule('prefer-https', ERROR)
    .addRule('require-attrs', OFF)
    .addRule('require-button-type', ERROR)
    .addRule('require-closing-tags', ERROR, [{selfClosing: 'always'}]) // 🟢
    .addRule('require-doctype', ERROR) // 🟢
    .addRule('require-explicit-size', ERROR)
    .addRule('require-li-container', ERROR) // 🟢
    .addRule('require-meta-charset', ERROR)
    .addRule('use-baseline', WARNING) // 🟢
    /* Category: SEO */
    .addRule('no-multiple-h1', ERROR) // 🟢
    .addRule('require-lang', ERROR) // 🟢
    .addRule('require-meta-description', OFF)
    .addRule('require-open-graph-protocol', OFF)
    .addRule('require-title', ERROR) // 🟢
    /* Category: Accessibility */
    .addRule('no-abstract-roles', ERROR)
    .addRule('no-accesskey-attrs', ERROR)
    .addRule('no-aria-hidden-body', ERROR)
    .addRule('no-heading-inside-button', ERROR)
    .addRule('no-invalid-role', ERROR)
    .addRule('no-non-scalable-viewport', ERROR)
    .addRule('no-positive-tabindex', ERROR)
    .addRule('no-skip-heading-levels', OFF)
    .addRule('require-form-method', OFF)
    .addRule('require-frame-title', ERROR)
    .addRule('require-img-alt', ERROR) // 🟢
    .addRule('require-input-label', ERROR)
    .addRule('require-meta-viewport', ERROR)
    /* Category: Style */
    .addRule('attrs-newline', OFF) // 🟢
    .addRule('element-newline', OFF) // 🟢
    .addRule('id-naming-convention', OFF)
    .addRule('indent', OFF) // 🟢
    .addRule('lowercase', ERROR)
    .addRule('max-element-depth', OFF)
    .addRule('no-extra-spacing-attrs', OFF) // 🟢💅
    .addRule('no-multiple-empty-lines', WARNING)
    .addRule('no-trailing-spaces', WARNING)
    .addRule('quotes', ERROR) // 🟢
    .addRule('sort-attrs', OFF) // TODO find and enforce a good sorting order?
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

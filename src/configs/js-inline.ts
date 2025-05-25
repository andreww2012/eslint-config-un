import type Eslint from 'eslint';
import globals from 'globals';
import {GLOB_HTML_ALL} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {pluginsLoaders} from '../plugins';
import {assignDefaults, getKeysOfTruthyValues} from '../utils';
import type {UnConfigFn} from './index';

// These are copied from eslint-plugin-html's source code
const DEFAULT_HTML_EXTENSIONS = [
  '.erb',
  '.handlebars',
  '.hbs',
  '.htm',
  '.html',
  '.mustache',
  '.nunjucks',
  '.php',
  '.tag',
  '.riot',
  '.twig',
  '.we',
];
const DEFAULT_XML_EXTENSIONS = ['.xhtml', '.xml'];

export interface JsInlineEslintConfigOptions extends UnConfigOptions<'html'> {
  /**
   * [`eslint-plugin-html`](https://npmjs.com/eslint-plugin-html) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `html` property and applied to the specified `files` and `ignores`.
   */
  settings?: {
    /**
     * The extensions that the plugin will be treating as HTML files.
     * The default list is quite long, and you can disable some of them by setting
     * the corresponding key to `false` or add new ones by setting them to `true`.
     *
     * Note that the presence of the extension in the list does not mean that the file
     * will actually be linted, you still need to specify files with this extension in `files`.
     * Unfortunately, this is how the plugin currently works. By default, only `*.html` and
     * `*.htm` files will be linted.
     * @default {'.erb': true, '.handlebars': true, '.hbs': true, '.htm': true, '.html': true, '.mustache': true, '.nunjucks': true, '.php': true, '.tag': true, '.riot': true, '.twig': true, '.we': true}
     */
    'html-extensions': Record<`.${string}`, boolean>;

    /**
     * See JSDoc for `html-extensions` to understand how this option works.
     * @default {'.xhtml': true, '.xml': true}
     */
    'xml-extensions'?: Record<`.${string}`, boolean>;

    /**
     * "By default, the code between `<script>` tags is dedented according to the first non-empty
     * line. This setting allows to ensure that every script tag follow an uniform indentation.
     * Like the `indent` rule, you can pass a number of spaces, or "tab" to indent with one tab.
     * Prefix this value with a + to be relative to the `<script>` tag indentation." - plugin docs
     */
    indent?: `${'+' | ''}${number}` | 'tab';

    /**
     * "By default, this plugin won't warn if it encounters a problematic indentation
     * (ex: a line is under indented). If you want to make sure the indentation is correct,
     * use the `html/report-bad-indent` in conjunction with the `indent` rule.
     * Pass `'warn'` or `1` to display warnings, `'error'` or `2` to display errors." - plugin docs
     */
    'report-bad-indent'?: 'error' | 2 | 'warn' | 1;

    /**
     * "By default, the code between `<script>` tags is considered as JavaScript. You can customize
     * which tags should be considered JavaScript by providing one or multiple tag names" - plugin docs
     * @example [`script`, `custom-script`]
     */
    'javascript-tag-names'?: string[];

    /**
     * "By default, the code between `<script>` tags is considered as JavaScript code only if
     * there is no type attribute or if its value matches the pattern
     * `(application|text)/(x-)?(javascript|babel|ecmascript-6)` or `module` (case insensitive).
     * You can customize the types that should be considered as JavaScript by providing one
     * or multiple MIME types. If a MIME type starts with a `/`, it will be considered
     * as a regular expression." - plugin docs
     */
    'javascript-mime-types': string | string[];

    /**
     * "By default, the code between `<script>` tags is considered JavaScript if there is no `type`
     * attribute. You can set this setting to `true` to ignore script tags without
     * a `type` attribute." - plugin docs
     */
    'ignore-tags-without-type': boolean;
  };

  /**
   * "When linting a HTML with multiple script tags, this plugin tries to emulate the browser
   * behavior by sharing the global scope between scripts by default. This behavior doesn't apply
   * to `module` scripts (ie: `<script type="module">` and most transpiled code),
   * where each script tag gets its own top-level scope. `eslint-plugin-html` will use this option
   * (`sourceType`) as well to know if the scopes should be shared (the default) or not.
   * To change this, just set it in your ESLint configuration." - plugin docs
   *
   * The value provided here will be merged with the default.
   * @default {sourceType: 'script', globals: <browser globals>}
   */
  languageOptions?: Eslint.Linter.LanguageOptions;
}

export const jsInlineUnConfig: UnConfigFn<'jsInline'> = async (context) => {
  const eslintPluginHtml = await pluginsLoaders.html();

  const optionsRaw = context.rootOptions.configs?.jsInline;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies JsInlineEslintConfigOptions);

  const {settings: pluginSettings, languageOptions} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'html');

  configBuilder
    ?.addConfig(
      [
        'js-inline',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: GLOB_HTML_ALL,
          doNotIgnoreHtml: true,
        },
      ],
      {
        plugins: {
          html: eslintPluginHtml,
        },
        languageOptions: {
          sourceType: 'script',
          globals: {
            ...globals.browser,
          },
          ...languageOptions,
        },
        ...(pluginSettings && {
          settings: {
            html: {
              ...pluginSettings,
              'html-extensions': getKeysOfTruthyValues({
                ...Object.fromEntries(DEFAULT_HTML_EXTENSIONS.map((tag) => [tag, true])),
                ...pluginSettings['html-extensions'],
              }),
              'xml-extensions': getKeysOfTruthyValues({
                ...Object.fromEntries(DEFAULT_XML_EXTENSIONS.map((tag) => [tag, true])),
                ...pluginSettings['xml-extensions'],
              }),
            } satisfies Omit<
              JsInlineEslintConfigOptions['settings'] & {},
              'html-extensions' | 'xml-extensions'
            > &
              Record<Partial<'html-extensions' | 'xml-extensions'>, string[]>,
          },
        }),
      },
    )
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

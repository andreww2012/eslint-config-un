// cspell:ignore atx setext blockquote nonblock
import type {UnRulesConfig} from '../../eslint/eslint-types';
import type {PluginPrefix} from '../../loaders';
import type {ObjectValues} from '../../types';
import {isKeyIn, objectEntriesUnsafe} from '../../utils';
import {
  type ExtraPluginsType,
  type GetRuleNamesInPlugin,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from '../index';

// Value semantics:
// - `true`: rule is disabled by default (Prettier owns the formatting it enforces).
// - `false`: rule is listed here, but NOT disabled by default because eslint-config-un already
//   configures it in a Prettier-compatible way (or it doesn't actually conflict). Every `false`
//   entry must carry a comment explaining the "why"
const RULES_INCOMPATIBLE_WITH_PRETTIER = {
  '': {
    'array-bracket-newline': true,
    'array-bracket-spacing': true,
    'array-element-newline': true,
    'arrow-parens': true,
    'arrow-spacing': true,
    'block-spacing': true,
    'brace-style': true,
    'comma-dangle': true,
    'comma-spacing': true,
    'comma-style': true,
    'computed-property-spacing': true,
    // `['all']` (our default) is Prettier-safe per `eslint-config-prettier` docs
    curly: false,
    'dot-location': true,
    'eol-last': true,
    'func-call-spacing': true,
    'function-call-argument-newline': true,
    'function-paren-newline': true,
    'generator-star-spacing': true,
    'implicit-arrow-linebreak': true,
    indent: true,
    'indent-legacy': true,
    'jsx-quotes': true,
    'key-spacing': true,
    'keyword-spacing': true,
    'linebreak-style': true,
    'lines-around-comment': true,
    'max-len': true,
    'max-statements-per-line': true,
    'multiline-ternary': true,
    'new-parens': true,
    'newline-per-chained-call': true,
    'no-confusing-arrow': true,
    'no-extra-parens': true,
    'no-extra-semi': true,
    'no-floating-decimal': true,
    'no-mixed-operators': true,
    'no-mixed-spaces-and-tabs': true,
    'no-multi-spaces': true,
    'no-multiple-empty-lines': true,
    'no-spaced-func': true,
    'no-tabs': true,
    'no-trailing-spaces': true,
    'no-unexpected-multiline': true,
    'no-whitespace-before-property': true,
    'nonblock-statement-body-position': true,
    'object-curly-newline': true,
    'object-curly-spacing': true,
    'object-property-newline': true,
    'one-var-declaration-per-line': true,
    'operator-linebreak': true,
    'padded-blocks': true,
    'quote-props': true,
    quotes: true,
    'rest-spread-spacing': true,
    semi: true,
    'semi-spacing': true,
    'semi-style': true,
    'space-before-blocks': true,
    'space-before-function-paren': true,
    'space-in-parens': true,
    'space-infix-ops': true,
    'space-unary-ops': true,
    'switch-colon-spacing': true,
    'template-curly-spacing': true,
    'template-tag-spacing': true,
    'wrap-iife': true,
    'wrap-regex': true,
    'yield-star-spacing': true,
  },
  antfu: {
    'consistent-chaining': true,
    'consistent-list-newline': true,
    curly: true,
    'if-newline': true,
  },
  astro: {
    semi: true,
  },
  html: {
    'attrs-newline': true,
    'class-spacing': true,
    'element-newline': true,
    indent: true,
    'no-extra-spacing-attrs': true,
    'no-extra-spacing-tags': true,
    'no-extra-spacing-text': true,
    'no-multiple-empty-lines': true,
    'no-trailing-spaces': true,
    'no-whitespace-only-children': true,
    quotes: true,
    'require-closing-tags': true,
  },
  jsonc: {
    'array-bracket-newline': true,
    'array-bracket-spacing': true,
    'array-element-newline': true,
    'comma-dangle': true,
    'comma-style': true,
    indent: true,
    'key-spacing': true,
    'no-floating-decimal': true,
    'object-curly-newline': true,
    'object-curly-spacing': true,
    'object-property-newline': true,
    'quote-props': true,
    quotes: true,
    'space-unary-ops': true,
  },
  'markdown-preferences': {
    'atx-heading-closing-sequence': true,
    'atx-heading-closing-sequence-length': true,
    'blockquote-marker-alignment': true,
    'bullet-list-marker-style': true,
    'code-fence-length': true,
    'code-fence-spacing': true,
    'code-fence-style': true,
    'emphasis-delimiters-style': true,
    indent: true,
    'link-bracket-newline': true,
    'link-bracket-spacing': true,
    'link-destination-style': true,
    'link-paren-newline': true,
    'link-paren-spacing': true,
    'link-title-style': true,
    'list-marker-alignment': true,
    'max-len': true,
    'no-multi-spaces': true,
    'no-multiple-empty-lines': true,
    'no-tabs': true,
    'no-trailing-spaces': true,
    'ordered-list-marker-sequence': true,
    'ordered-list-marker-start': true,
    'ordered-list-marker-style': true,
    'strikethrough-delimiters-style': true,
    // The following 3 rules agree with Prettier on alignment, so must not be disabled
    // The only slight exception is `table-pipe-alignment` with non-default `proseWrap: 'never'`
    'table-leading-trailing-pipes': false,
    'table-pipe-alignment': false,
    'table-pipe-spacing': false,
    'thematic-break-character-style': true,
    'thematic-break-length': true,
    'thematic-break-sequence-pattern': true,
  },
  react: {
    'jsx-child-element-spacing': true,
    'jsx-closing-bracket-location': true,
    'jsx-closing-tag-location': true,
    'jsx-curly-newline': true,
    'jsx-curly-spacing': true,
    'jsx-equals-spacing': true,
    'jsx-first-prop-new-line': true,
    'jsx-indent': true,
    'jsx-indent-props': true,
    'jsx-max-props-per-line': true,
    'jsx-newline': true,
    'jsx-one-expression-per-line': true,
    'jsx-props-no-multi-spaces': true,
    'jsx-space-before-closing': true,
    'jsx-tag-spacing': true,
    'jsx-wrap-multilines': true,
  },
  stylistic: {
    'array-bracket-newline': true,
    'array-bracket-spacing': true,
    'array-element-newline': true,
    'arrow-parens': true,
    'arrow-spacing': true,
    'block-spacing': true,
    'brace-style': true,
    'comma-dangle': true,
    'comma-spacing': true,
    'comma-style': true,
    'computed-property-spacing': true,
    'curly-newline': true,
    'dot-location': true,
    'eol-last': true,
    'exp-jsx-props-style': true,
    'exp-list-style': true,
    'function-call-argument-newline': true,
    'function-call-spacing': true,
    'function-paren-newline': true,
    'generator-star-spacing': true,
    'implicit-arrow-linebreak': true,
    indent: true,
    'indent-binary-ops': true,
    'jsx-child-element-spacing': true,
    'jsx-closing-bracket-location': true,
    'jsx-closing-tag-location': true,
    'jsx-curly-newline': true,
    'jsx-curly-spacing': true,
    'jsx-equals-spacing': true,
    'jsx-first-prop-new-line': true,
    'jsx-function-call-newline': true,
    'jsx-indent': true,
    'jsx-indent-props': true,
    'jsx-max-props-per-line': true,
    'jsx-newline': true,
    'jsx-one-expression-per-line': true,
    'jsx-props-no-multi-spaces': true,
    'jsx-quotes': true,
    'jsx-tag-spacing': true,
    'jsx-wrap-multilines': true,
    'key-spacing': true,
    'keyword-spacing': true,
    'linebreak-style': true,
    'lines-around-comment': true,
    'max-len': true,
    'max-statements-per-line': true,
    'member-delimiter-style': true,
    'multiline-ternary': true,
    'new-parens': true,
    'newline-per-chained-call': true,
    'no-confusing-arrow': true,
    'no-extra-parens': true,
    'no-extra-semi': true,
    'no-floating-decimal': true,
    'no-mixed-operators': true,
    'no-mixed-spaces-and-tabs': true,
    'no-multi-spaces': true,
    'no-multiple-empty-lines': true,
    'no-tabs': true,
    'no-trailing-spaces': true,
    'no-whitespace-before-property': true,
    'nonblock-statement-body-position': true,
    'object-curly-newline': true,
    'object-curly-spacing': true,
    'object-property-newline': true,
    'one-var-declaration-per-line': true,
    'operator-linebreak': true,
    'padded-blocks': true,
    'quote-props': true,
    // By default this rule is configured in a Prettier-compatible way by us
    quotes: false,
    'rest-spread-spacing': true,
    semi: true,
    'semi-spacing': true,
    'semi-style': true,
    'space-before-blocks': true,
    'space-before-function-paren': true,
    'space-in-parens': true,
    'space-infix-ops': true,
    'space-unary-ops': true,
    'switch-colon-spacing': true,
    'template-curly-spacing': true,
    'template-tag-spacing': true,
    'type-annotation-spacing': true,
    'type-generic-spacing': true,
    'type-named-tuple-spacing': true,
    'wrap-iife': true,
    'wrap-regex': true,
    'yield-star-spacing': true,
  },
  svelte: {
    'first-attribute-linebreak': true,
    'html-closing-bracket-new-line': true,
    'html-closing-bracket-spacing': true,
    'html-quotes': true,
    'html-self-closing': true,
    indent: true,
    'max-attributes-per-line': true,
    'mustache-spacing': true,
    'no-spaces-around-equal-signs-in-attribute': true,
    'no-trailing-spaces': true,
    'shorthand-attribute': true,
    'shorthand-directive': true,
  },
  toml: {
    'array-bracket-newline': true,
    'array-bracket-spacing': true,
    'array-element-newline': true,
    'comma-style': true,
    indent: true,
    'inline-table-curly-newline': true,
    'inline-table-curly-spacing': true,
    'inline-table-key-value-newline': true,
    'key-spacing': true,
    'no-space-dots': true,
    'space-eq-sign': true,
    'table-bracket-spacing': true,
  },
  unicorn: {
    'empty-brace-spaces': true,
    'no-nested-ternary': true,
    'number-literal-case': true,
    // Enabled in Prettier's own codebase; conflicts only in rare ternary+template cases: https://github.com/prettier/eslint-config-prettier/issues/281
    'template-indent': false,
  },
  vue: {
    'array-bracket-newline': true,
    'array-bracket-spacing': true,
    'array-element-newline': true,
    'arrow-spacing': true,
    'block-spacing': true,
    'block-tag-newline': true,
    'brace-style': true,
    'comma-dangle': true,
    'comma-spacing': true,
    'comma-style': true,
    'dot-location': true,
    'first-attribute-linebreak': true,
    'func-call-spacing': true,
    'html-closing-bracket-newline': true,
    'html-closing-bracket-spacing': true,
    // Not a formatting rule: catches genuinely malformed markup, so it's safe with Prettier: https://github.com/prettier/eslint-config-prettier/issues/365
    'html-end-tags': false,
    'html-indent': true,
    'html-quotes': true,
    // Configured by default in a Prettier-compatible way
    'html-self-closing': false,
    'key-spacing': true,
    'keyword-spacing': true,
    'max-attributes-per-line': true,
    'max-len': true,
    'multiline-html-element-content-newline': true,
    'multiline-ternary': true,
    'mustache-interpolation-spacing': true,
    'no-extra-parens': true,
    'no-multi-spaces': true,
    'no-spaces-around-equal-signs-in-attribute': true,
    'object-curly-newline': true,
    'object-curly-spacing': true,
    'object-property-newline': true,
    'operator-linebreak': true,
    'quote-props': true,
    'script-indent': true,
    'singleline-html-element-content-newline': true,
    'space-in-parens': true,
    'space-infix-ops': true,
    'space-unary-ops': true,
    'template-curly-spacing': true,
  },
  yaml: {
    'block-mapping-colon-indicator-newline': true,
    'block-mapping-question-indicator-newline': true,
    'block-sequence-hyphen-indicator-newline': true,
    'flow-mapping-curly-newline': true,
    'flow-mapping-curly-spacing': true,
    'flow-sequence-bracket-newline': true,
    'flow-sequence-bracket-spacing': true,
    indent: true,
    'key-spacing': true,
    'no-multiple-empty-lines': true,
    'no-trailing-spaces': true,
    'no-trailing-zeros': true,
    quotes: true,
  },
  // Note: `eslint-plugin-css`'s formatting rules (`color-hex-style`,
  // `number-leading-zero`, `no-number-trailing-zeros`, ...) are deliberately NOT disabled here as
  // Prettier only normalizes CSS inside recognized tagged templates, while the plugin mainly
  // targets CSS-in-JS object syntax, which Prettier never formats
} as const satisfies Partial<{
  [Plugin in PluginPrefix]: Partial<Record<GetRuleNamesInPlugin<Plugin>, boolean>>;
}>;

const PLUGINS_BY_PRETTIER_LANGUAGE = {
  astro: ['astro'],
  html: ['html'],
  js: ['', 'stylistic', 'react', 'unicorn', 'antfu'],
  json: ['jsonc'],
  markdown: ['markdown-preferences'],
  svelte: ['svelte'],
  toml: ['toml'],
  vue: ['vue'],
  yaml: ['yaml'],
} as const satisfies Record<string, (keyof typeof RULES_INCOMPATIBLE_WITH_PRETTIER)[]>;

// Popular languages Prettier can only format via an additional plugin: the corresponding rule
// group is only applied when that plugin is installed (unless forced via the `languages` option).
const PRETTIER_PLUGIN_BY_LANGUAGE = {
  astro: 'prettier-plugin-astro',
  svelte: 'prettier-plugin-svelte',
  toml: 'prettier-plugin-toml',
} as const;

type PrettierLanguage = keyof typeof PLUGINS_BY_PRETTIER_LANGUAGE;

/* eslint-disable perfectionist/sort-objects */

type PrettierIncompatibleRuleName = ObjectValues<{
  [Plugin in keyof typeof RULES_INCOMPATIBLE_WITH_PRETTIER]: `${Plugin extends ''
    ? ''
    : `${Plugin}/`}${keyof (typeof RULES_INCOMPATIBLE_WITH_PRETTIER)[Plugin] & string}`;
}>;

/**
 * Disables rules that are unnecessary or might conflict with [Prettier](https://prettier.io).
 * Successor to [`eslint-config-prettier`](https://npmx.dev/eslint-config-prettier).
 *
 * 📁 Default `files`: all files
 */
export interface NoPrettierIncompatibleRulesEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, Pick<UnRulesConfig, PrettierIncompatibleRuleName>> {
  /**
   * Enable or disable entire rule groups, one per language Prettier is able to format.
   *
   * Groups for languages Prettier only formats via an extra plugin:
   * - `astro` ([`prettier-plugin-astro`](https://npmx.dev/prettier-plugin-astro))
   * - `svelte` ([`prettier-plugin-svelte`](https://npmx.dev/prettier-plugin-svelte))
   * - `toml` ([`prettier-plugin-toml`](https://npmx.dev/prettier-plugin-toml))
   *
   * are applied only if the corresponding plugin is detected as installed.
   *
   * Set the corresponding key to `true` to force a group on regardless of the plugin, or to `false`
   * to turn any group off.
   */
  languages?: Partial<Record<PrettierLanguage, boolean>>;
}

export default defineUnConfig<NoPrettierIncompatibleRulesEslintConfigOptions>(
  'noPrettierIncompatibleRules',
  {enabledBy: {package: 'prettier'}, phase: 'terminal'},
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {languages} = optionsResolved;

  const isLanguageEnabled = (language: PrettierLanguage): boolean => {
    const userValue = languages?.[language];
    if (userValue != null) {
      return userValue;
    }

    return (
      !isKeyIn(language, PRETTIER_PLUGIN_BY_LANGUAGE) ||
      context.packagesInfo[PRETTIER_PLUGIN_BY_LANGUAGE[language]] != null
    );
  };

  const configBuilder = context.createConfigBuilder(optionsResolved, null);

  configBuilder
    ?.addConfig([
      'no-prettier-incompatible-rules',
      {
        ignoresInternal: false,
      },
    ])
    .disableBulkRules(
      objectEntriesUnsafe(PLUGINS_BY_PRETTIER_LANGUAGE)
        .filter(([language]) => isLanguageEnabled(language))
        .flatMap(([, plugins]) =>
          plugins.flatMap((pluginPrefix) =>
            Object.entries(RULES_INCOMPATIBLE_WITH_PRETTIER[pluginPrefix])
              .filter(([, disabledByDefault]) => disabledByDefault)
              .map(([ruleName]) => `${pluginPrefix ? `${pluginPrefix}/` : ''}${ruleName}`),
          ),
        ),
    )
    .addOverrides();
});

/* eslint-enable perfectionist/sort-objects */

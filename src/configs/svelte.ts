import type {Config as SvelteKitConfig} from '@sveltejs/kit';
import {ERROR, GLOB_SVELTE, OFF, WARNING} from '../constants';
import type {UnFlatConfigEntryFilesAndIgnores} from '../eslint/eslint-types';
import {generatePackageToLoadProperty} from '../loaders';
import {getKeysOfTruthyValues} from '../utils';
import {noRestrictedHtmlElementsDefault} from './shared';
import type {VueEslintConfigOptions} from './vue';
import {
  type ExtraPluginsType,
  type GetRuleNamesInPlugin,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  type UnRulesConfigPartial,
  assignDefaults,
} from './index';

export interface SvelteEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends
    UnFlatConfigEntryBase<ExtraPlugins, 'svelte'>,
    Pick<VueEslintConfigOptions, 'disallowedHtmlTags'> {
  /**
   * [`eslint-plugin-svelte`](https://npmx.dev/eslint-plugin-svelte) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `svelte` property
   * and applied to the resolved `files` and `ignores` of this config.
   * @see [settings docs](https://sveltejs.github.io/eslint-plugin-svelte/user-guide/#settings-svelte)
   */
  settings?: {
    /**
     * "Specifies an array of rules to ignore reports within the template. For example,
     * use this to disable rules in the template that may produce unavoidable false positives"
     * - plugin docs
     */
    ignoreWarnings?: string[];

    /**
     * "Specifies options for Svelte compilation. This affects rules that rely on
     * Svelte compilation, such as `svelte/valid-compile` and `svelte/no-unused-svelte-ignore`.
     * Note that this setting does not impact ESLint’s custom parser" - plugin docs
     */
    compileOptions?: {
      /**
       * "Specifies options related to PostCSS. You can disable the PostCSS processing
       * by setting it to `false`" - plugin docs
       */
      postcss?:
        | false
        | {
            /**
             * "Specifies the path to the directory that contains the PostCSS configuration"
             * - plugin docs
             */
            configFilePath?: string;
          };
    };

    /**
     * "Even if `settings.svelte.kit` is not specified, the rules will attempt to load information
     * from `svelte.config.js`. However, if the default behavior does not work as expected,
     * you should specify `settings.svelte.kit` explicitly. If you are using SvelteKit
     * with a non-default configuration, you need to set the following options.
     * The schema is a subset of SvelteKit’s configuration, so refer to the SvelteKit documentation
     * for more details: https://svelte.dev/docs/kit/configuration" - plugin docs
     */
    kit?: SvelteKitConfig['kit'];
  };

  /**
   * Enforces the presence of `lang="ts"` in `<script>` blocks.
   *
   * By default, will inherit `files` and `ignores` from the parent config, and specifying
   * them explicitly here will *override* the respective property of the parent config.
   *
   * Affected rule:
   * - [`svelte/block-lang`](https://sveltejs.github.io/eslint-plugin-svelte/rules/block-lang)
   * @default true <=> `ts` config is enabled
   */
  configEnforceTypescriptInScriptSection?:
    | boolean
    | UnFlatConfigEntryBase<
        ExtraPlugins,
        Pick<UnRulesConfigPartial<'svelte'>, 'svelte/block-lang'>
      >;

  /**
   * Set ups `.svelte` and `.svelte.{js,ts}` files parser.
   *
   * 📁 Default `files`:
   * - <code>**&#47;*.svelte</code>
   * - <code>**&#47;*.svelte.{js,ts}</code>
   */
  configSetup?: UnFlatConfigEntryFilesAndIgnores;

  /**
   * Used by some rules like
   * [`svelte/valid-compile`](https://sveltejs.github.io/eslint-plugin-svelte/rules/valid-compile).
   * Will be assigned to `languageOptions.parserOptions.svelteConfig` is specified
   * (but only if TypeScript config, `ts`, is enabled).
   *
   * The plugins docs [recommends that you specify this](https://sveltejs.github.io/eslint-plugin-svelte/user-guide/#type-script-project).
   */
  svelteKitConfig?: SvelteKitConfig;

  /**
   * `svelte` package version, possibly including a minor version. Normally should not be
   * set manually as it will be detected automatically.
   * @default auto-detected or `5` if cannot be detected
   */
  svelteVersion?: number;

  /**
   * Whether [`prettier-plugin-svelte`](https://npmx.dev/prettier-plugin-svelte)
   * is used. If `true`, will disable
   * [a number of stylistic rules](https://github.com/sveltejs/eslint-plugin-svelte/blob/HEAD/packages/eslint-plugin-svelte/src/configs/flat/prettier.ts).
   * @default detected automatically
   */
  isPrettierPluginSvelteUsed?: boolean;
}

const LATEST_SVELTE_MAJOR_VERSION = 5;
const DEFAULT_SVELTE_FILES = [GLOB_SVELTE];
const DEFAULT_SVELTE_SCRIPT_FILES = ['**/*.svelte.{js,ts}' as const];

const SVELTE_SYSTEM_RULES = new Set<string>([
  'comment-directive',
  'system',
] satisfies GetRuleNamesInPlugin<'svelte'>[]);

export default ((context, optionsRaw) => {
  const isPrettierPluginSvelteInstalled = context.packagesInfo['prettier-plugin-svelte'] != null;

  const isTypescriptEnabled = context.configsMeta.ts.enabled;

  const optionsResolved = assignDefaults(optionsRaw, {
    configEnforceTypescriptInScriptSection: isTypescriptEnabled,
    files: DEFAULT_SVELTE_FILES, // Must be assigned to options for `ts` config
    svelteVersion:
      context.packagesInfo.svelte?.versions.majorAndMinor ?? LATEST_SVELTE_MAJOR_VERSION,
    isPrettierPluginSvelteUsed: isPrettierPluginSvelteInstalled,
  });
  if (optionsResolved.configEnforceTypescriptInScriptSection === true) {
    optionsResolved.configEnforceTypescriptInScriptSection = {
      files: optionsResolved.files,
      ignores: optionsResolved.ignores,
    };
  }

  const {
    settings: pluginSettings,
    configEnforceTypescriptInScriptSection,
    configSetup: configSetupOptions = {},
    svelteKitConfig,
    svelteVersion,
    isPrettierPluginSvelteUsed,
  } = optionsResolved;

  const configBuilderSetup = context.createConfigBuilder(configSetupOptions, 'svelte');

  configBuilderSetup
    ?.addConfig(
      [
        'svelte/setup',
        {
          includeDefaultFilesAndIgnores: true,
          filesDefault: [...DEFAULT_SVELTE_FILES, ...DEFAULT_SVELTE_SCRIPT_FILES],
          parser: 'svelte-eslint-parser',
          // TODO why?
          ignoresInternal: {
            md: false,
          },
          settings: {
            svelte: pluginSettings,
          },
        },
      ],
      {
        languageOptions: {
          parserOptions: {
            ...(isTypescriptEnabled &&
              generatePackageToLoadProperty('parser', 'typescriptEslintParser')),
            ...(svelteKitConfig && {svelteConfig: svelteKitConfig}),
          },
          sourceType: 'module',
        },
        ...generatePackageToLoadProperty('processor', 'svelteProcessor'),
      },
    )
    .addRule('comment-directive', ERROR, [
      {reportUnusedDisableDirectives: true},
    ]) /** @since 0.0.13 */ // 🟢
    // "This rule is a system rule for working the this plugin. This rule does not report any errors, but make sure the rule is enabled for the this plugin to work properly"
    .addRule('system', ERROR) /** @since 0.0.13 */ // 🟢
    // Crashes on `statement.expression.type` (`expression` is null)
    .disableAnyRule('sonarjs', 'no-unused-collection')
    .enableConfigTesterForPlugin('svelte', {
      /* v8 ignore next */
      rulesToSkipInConfig: (ruleName) => !SVELTE_SYSTEM_RULES.has(ruleName),
    });

  const configBuilder = context.createConfigBuilder(optionsResolved, 'svelte');

  // Legend:
  // 🟢 - in recommended
  // 4️⃣ - not relevant in Svelte >=5, unless legacy features are used
  // 💅 - included in Prettier config: https://github.com/sveltejs/eslint-plugin-svelte/blob/HEAD/packages/eslint-plugin-svelte/src/configs/flat/prettier.ts
  // 💭? - optionally requires type information

  configBuilder
    ?.addConfig([
      'svelte',
      {
        includeDefaultFilesAndIgnores: true,
      },
    ])
    .markCategory('Possible Errors')
    .addRule('infinite-reactive-loop', ERROR) /** @since 2.16.0 */ // 🟢4️⃣
    .addRule('no-bind-value-on-checkable-inputs', ERROR) /** @since 3.21.0 */
    .addRule('no-conflicting-module-names', ERROR) /** @since 3.22.0 */
    .addRule('no-dom-manipulating', ERROR) /** @since 2.13.0 */ // 🟢
    .addRule('no-dupe-else-if-blocks', ERROR) /** @since 0.0.1 */ // 🟢
    .addRule('no-dupe-on-directives', ERROR) /** @since 2.14.0 */ // 🟢4️⃣
    .addRule('no-dupe-style-properties', ERROR) /** @since 0.31.0 */ // 🟢
    .addRule('no-dupe-use-directives', ERROR) /** @since 2.14.0 */ // 🟢
    .addRule('no-nested-style-tag', ERROR) /** @since 3.18.0 */
    .addRule('no-not-function-handler', ERROR) /** @since 0.5.0 */ // 🟢
    .addRule('no-object-in-text-mustaches', ERROR) /** @since 0.5.0 */ // 🟢
    .addRule('no-raw-special-elements', ERROR) /** @since 3.0.0-next.1 */ // 🟢
    .addRule('no-reactive-reassign', ERROR) /** @since 2.27.0 */ // 🟢4️⃣
    .addRule('no-shorthand-style-property-overrides', ERROR) /** @since 0.31.0 */ // 🟢
    .addRule('no-store-async', ERROR) /** @since 2.7.0 */ // 🟢
    .addRule('no-top-level-browser-globals', ERROR) /** @since 3.8.0 */ // 🟢
    .addRule('no-unknown-style-directive-property', ERROR) /** @since 0.31.0 */ // 🟢
    .addRule('prefer-svelte-reactivity', ERROR) /** @since 3.11.0 */ // 🟢
    .addRule('require-store-callbacks-use-set-param', ERROR) /** @since 2.12.0 */
    .addRule('require-store-reactive-access', ERROR) /** @since 2.12.0 */ // 🟢
    .addRule('valid-compile', ERROR) /** @since 0.7.0 */
    .addRule('valid-style-parse', ERROR) /** @since 3.0.0 */
    .markCategory('Security Vulnerability')
    .addRule('no-at-html-tags', ERROR) /** @since 0.0.1 */ // 🟢
    // TODO should also set to `off` in `react` config, like in `vue`?
    .addRule('no-target-blank', OFF) /** @since 0.0.4 */
    .markCategory('Best Practices')
    .addRule('block-lang', OFF) /** @since 2.18.0 */
    .addRule('button-has-type', ERROR) /** @since 0.0.4 */
    .addRule('no-add-event-listener', ERROR) /** @since 3.6.0 */
    .addRule('no-at-const-tags', ERROR) /** @since 3.20.0 */
    .addRule('no-at-debug-tags', ERROR) /** @since 0.0.1 */ // 🟢
    .addRule('no-ignored-unsubscribe', ERROR) /** @since 2.34.0 */
    .addRule('no-immutable-reactive-statements', ERROR) /** @since 2.27.0 */ // 🟢
    .addRule('no-inline-styles', OFF) /** @since 2.35.0 */
    .addRule('no-inspect', ERROR) /** @since 2.45.0 */ // 🟢
    .addRule('no-reactive-functions', ERROR) /** @since 2.5.0 */ // 🟢
    .addRule('no-reactive-literals', ERROR) /** @since 2.4.0 */ // 🟢
    .addRule('no-svelte-internal', ERROR) /** @since 2.39.0 */ // 🟢
    .addRule('no-unnecessary-state-wrap', ERROR) /** @since 3.2.0 */ // 🟢
    .addRule('no-unused-class-name', OFF) /** @since 2.31.0 */
    .addRule('no-unused-props', ERROR) /** @since 3.2.0 */ // 🟢💭?
    .addRule('no-unused-svelte-ignore', ERROR) /** @since 0.19.0 */ // 🟢
    .addRule('no-useless-children-snippet', ERROR) /** @since 3.0.0-next.9 */ // 🟢
    .addRule('no-useless-mustaches', ERROR, [
      {ignoreIncludesComment: true, ignoreStringEscape: true},
    ]) /** @since 0.0.4 */ // 🟢
    // "This rule reports the same as the base ESLint `prefer-const` rule, except that ignores Svelte reactive values such as `$derived` and `$props` as default. If this rule is active, make sure to disable the base `prefer-const` rule, as it will conflict with this rule."
    .addRule('prefer-const', ERROR, [
      {destructuring: 'all', ignoreReadBeforeAssign: true},
    ]) /** @since 3.0.0-next.6 */
    .disableAnyRule('', 'prefer-const')
    .addRule('prefer-derived-over-derived-by', ERROR) /** @since 3.18.0 */
    .addRule('prefer-destructured-store-props', OFF) /** @since 2.10.0 */
    .addRule('prefer-writable-derived', ERROR) /** @since 3.6.0 */
    .addRule('require-each-key', ERROR) /** @since 2.28.0 */ // 🟢
    .addRule('require-event-dispatcher-types', ERROR) /** @since 2.16.0 */ // 🟢
    .addRule('require-optimized-style-attribute', ERROR) /** @since 0.32.0 */
    .addRule('require-stores-init', ERROR) /** @since 2.5.0 */
    .addRule('valid-each-key', ERROR) /** @since 2.28.0 */ // 🟢
    .markCategory('Stylistic Issues')
    .addRule('consistent-selector-style', OFF) /** @since 3.0.0-next.15 */
    .addRule('derived-has-same-inputs-outputs', WARNING) /** @since 2.8.0 */
    .addRule('first-attribute-linebreak', OFF) /** @since 0.6.0 */ // 💅
    .addRule('html-closing-bracket-new-line', OFF) /** @since 2.45.0 */ // 💅
    .addRule('html-closing-bracket-spacing', ERROR) /** @since 2.3.0 */ // 💅
    .addRule('html-quotes', ERROR) /** @since 0.5.0 */ // 💅
    .addRule('html-self-closing', ERROR, [
      {
        void: 'always', // default: always
        normal: 'never', // never
        svg: 'never', // always
        math: 'never', // never
        component: 'never', // always
        svelte: 'always', // always
      },
    ]) /** @since 2.5.0 */ // 💅
    .addRule('indent', OFF) /** @since 0.3.0 */ // 💅
    .addRule('max-attributes-per-line', OFF) /** @since 0.2.0 */ // 💅
    .addRule('max-lines-per-block', OFF) /** @since 3.16.0 */
    .addRule('mustache-spacing', ERROR) /** @since 0.15.0 */ // 💅
    .addRule('no-extra-reactive-curlies', ERROR) /** @since 2.4.0 */
    .addRule(
      'no-restricted-html-elements',
      ERROR,
      getKeysOfTruthyValues(
        {
          ...noRestrictedHtmlElementsDefault,
          ...optionsResolved.disallowedHtmlTags,
        },
        'nonEmptyArray',
      ),
    ) /** @since 2.31.0 */
    .addRule('no-spaces-around-equal-signs-in-attribute', ERROR) /** @since 2.3.0 */ // 💅
    .addRule('prefer-class-directive', ERROR) /** @since 0.0.1 */
    // "Style directive were added in Svelte v3.46"
    .addRule('prefer-style-directive', svelteVersion >= 3.46 ? WARNING : OFF) /** @since 0.22.0 */
    .addRule('require-event-prefix', svelteVersion >= 5 ? ERROR : OFF) /** @since 3.6.0 */ // 💅
    .addRule('shorthand-attribute', ERROR) /** @since 0.5.0 */ // 💅
    .addRule('shorthand-directive', ERROR) /** @since 0.24.0 */ // 💅
    .addRule('sort-attributes', ERROR) /** @since 2.4.0 */
    .addRule('spaced-html-comment', ERROR) /** @since 0.0.1 */ // Yes, not supported by `prettier-plugin-svelte`
    .markCategory('Extension Rules')
    .addRule('no-inner-declarations', ERROR) /** @since 0.0.8 */ // 🟢
    .disableAnyRule('', 'no-inner-declarations')
    .addRule('no-trailing-spaces', OFF) /** @since 2.7.0 */ // 💅
    .markCategory('SvelteKit')
    .addRule('no-export-load-in-svelte-module-in-kit-pages', ERROR) /** @since 2.12.0 */ // 🟢
    .addRule('no-navigation-without-resolve', ERROR) /** @since 3.12.0 */ // 🟢
    .addRule('valid-prop-names-in-kit-pages', ERROR) /** @since 2.12.0 */ // 🟢
    .markCategory('Experimental')
    .addRule('experimental-require-slot-types', OFF) /** @since 2.18.0 */
    .addRule('experimental-require-strict-events', OFF) /** @since 2.18.0 */
    .markCategory('System')
    // Added in the setup config
    .enableConfigTesterForPlugin('svelte', {
      /* v8 ignore next */
      rulesToSkipInConfig: (ruleName) => SVELTE_SYSTEM_RULES.has(ruleName),
    })
    .addOverrides();

  const configBuilderEnforceTypescriptInScriptSection = context.createConfigBuilder(
    // Special case: this config is always created to enable `svelte/block-lang` rule
    configEnforceTypescriptInScriptSection || optionsResolved,
    'svelte',
  );
  configBuilderEnforceTypescriptInScriptSection
    ?.addConfig([
      'svelte/enforce-typescript-in-script-section',
      {includeDefaultFilesAndIgnores: true},
    ])
    .addRule('block-lang', ERROR, [
      {
        script: ['ts', ...(configEnforceTypescriptInScriptSection ? [] : [null])],
      },
    ])
    .addOverrides();

  if (isPrettierPluginSvelteUsed) {
    // From `prettier` config
    configBuilder
      ?.addConfig('svelte/prettier')
      .addRule('first-attribute-linebreak', OFF)
      .addRule('html-closing-bracket-new-line', OFF)
      .addRule('html-closing-bracket-spacing', OFF)
      .addRule('html-quotes', OFF)
      .addRule('html-self-closing', OFF)
      .addRule('indent', OFF)
      .addRule('max-attributes-per-line', OFF)
      .addRule('mustache-spacing', OFF)
      .addRule('no-spaces-around-equal-signs-in-attribute', OFF)
      .addRule('no-trailing-spaces', OFF)
      .addRule('shorthand-attribute', OFF)
      .addRule('shorthand-directive', OFF);
  }

  return {
    configs: [configBuilderSetup, configBuilder, configBuilderEnforceTypescriptInScriptSection],
    optionsResolved,
  };
}) satisfies UnConfigFn<'svelte'> as UnConfigFn<'svelte'>;

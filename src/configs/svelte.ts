import type {Config as SvelteKitConfig} from '@sveltejs/kit';
import {ERROR, GLOB_SVELTE, OFF, WARNING} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {pluginsLoaders} from '../plugins';
import {assignDefaults, doesPackageExist, getKeysOfTruthyValues, interopDefault} from '../utils';
import {noRestrictedHtmlElementsDefault} from './shared';
import type {VueEslintConfigOptions} from './vue';
import type {UnConfigFn} from './index';

export interface SvelteEslintConfigOptions
  extends UnConfigOptions<'svelte'>,
    Pick<VueEslintConfigOptions, 'disallowedHtmlTags'> {
  /**
   * [`eslint-plugin-svelte`](https://npmjs.com/eslint-plugin-svelte) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `svelte` property and applied to the specified `files` and `ignores`.
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
    kit?: Pick<SvelteKitConfig, 'kit'>;
  };

  /**
   * Used by some rules like [`valid-compile`](https://sveltejs.github.io/eslint-plugin-svelte/rules/valid-compile/).
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
   * Enforces the presence of `lang="ts"` in `<script>` blocks.
   *
   * Used rules:
   * - [`block-lang`](https://sveltejs.github.io/eslint-plugin-svelte/rules/block-lang)
   * @default true <=> `ts` config is enabled
   */
  enforceTypescriptInScriptSection?: boolean;

  /**
   * Whether [`prettier-plugin-svelte`](https://npmjs.com/prettier-plugin-svelte)
   * is used. If `true`, will disable [a number of stylistic rules](https://github.com/sveltejs/eslint-plugin-svelte/blob/HEAD/packages/eslint-plugin-svelte/src/configs/flat/prettier.ts).
   * @default detected automatically
   */
  isPrettierPluginSvelteUsed?: boolean;
}

const LATEST_SVELTE_MAJOR_VERSION = 5;
const DEFAULT_SVELTE_FILES: string[] = [GLOB_SVELTE];
const DEFAULT_SVELTE_SCRIPT_FILES: string[] = ['**/*.svelte.{js,ts}'];

export const svelteUnConfig: UnConfigFn<'svelte'> = async (context) => {
  const [eslintPluginSvelte, svelteEslintParser, {parser: typescriptEslintParser}] =
    await Promise.all([
      pluginsLoaders.svelte(context),
      interopDefault(import('svelte-eslint-parser')),
      interopDefault(import('typescript-eslint')),
    ]);
  if (!eslintPluginSvelte) {
    return null;
  }

  const isTypescriptEnabled = context.configsMeta.ts.enabled;

  const optionsRaw = context.rootOptions.configs?.svelte;
  const optionsResolved = assignDefaults(optionsRaw, {
    files: DEFAULT_SVELTE_FILES,
    enforceTypescriptInScriptSection: isTypescriptEnabled,
    svelteVersion:
      context.packagesInfo.svelte?.versions.majorAndMinor ?? LATEST_SVELTE_MAJOR_VERSION,
    isPrettierPluginSvelteUsed: await doesPackageExist('prettier-plugin-svelte'),
  } satisfies SvelteEslintConfigOptions);

  const {
    settings: pluginSettings,
    files: parentConfigFiles,
    svelteKitConfig,
    enforceTypescriptInScriptSection,
    svelteVersion,
    isPrettierPluginSvelteUsed,
  } = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'svelte');

  configBuilder
    ?.addConfig(
      [
        'svelte/setup',
        {
          filesFallback: [
            ...DEFAULT_SVELTE_FILES,
            ...DEFAULT_SVELTE_SCRIPT_FILES,
            ...parentConfigFiles,
          ],
          doNotIgnoreMarkdown: true,
        },
      ],
      {
        languageOptions: {
          parser: svelteEslintParser,
          parserOptions: {
            parser: isTypescriptEnabled ? typescriptEslintParser : undefined,
            ...(svelteKitConfig && {svelteConfig: svelteKitConfig}),
          },
          sourceType: 'module',
        },
        processor: eslintPluginSvelte.processors.svelte,
        ...(pluginSettings && {
          settings: {
            svelte: pluginSettings,
          },
        }),
      },
    )
    .addRule('comment-directive', ERROR, [{reportUnusedDisableDirectives: true}]) // 🟢 >=0.0.13
    // "This rule is a system rule for working the this plugin. This rule does not report any errors, but make sure the rule is enabled for the this plugin to work properly"
    .addRule('system', ERROR) // 🟢 >=0.0.13
    // Crashes on `statement.expression.type` (`expression` is null)
    .disableAnyRule('sonarjs', 'no-unused-collection');

  // Legend:
  // 🟢 - in recommended
  // 4️⃣ - not relevant in Svelte >=5, unless legacy features are used
  // 💅 - included in Prettier config: https://github.com/sveltejs/eslint-plugin-svelte/blob/HEAD/packages/eslint-plugin-svelte/src/configs/flat/prettier.ts

  configBuilder
    ?.addConfig([
      'svelte',
      {includeDefaultFilesAndIgnores: true, filesFallback: DEFAULT_SVELTE_FILES},
    ])
    /* CATEGORY: Possible Errors */
    .addRule('infinite-reactive-loop', ERROR) // 🟢4️⃣ >=2.16.0
    .addRule('no-dom-manipulating', ERROR) // 🟢 >=2.13.0
    .addRule('no-dupe-else-if-blocks', ERROR) // 🟢 >=0.0.1
    .addRule('no-dupe-on-directives', ERROR) // 🟢4️⃣ >=2.14.0
    .addRule('no-dupe-style-properties', ERROR) // 🟢 >=0.31.0
    .addRule('no-dupe-use-directives', ERROR) // 🟢 >=2.14.0
    .addRule('no-not-function-handler', ERROR) // 🟢 >=0.5.0
    .addRule('no-object-in-text-mustaches', ERROR) // 🟢 >=0.5.0
    .addRule('no-raw-special-elements', ERROR) // 🟢 >=3.0.0-next.1
    .addRule('no-reactive-reassign', ERROR) // 🟢4️⃣ >=2.27.0
    .addRule('no-shorthand-style-property-overrides', ERROR) // 🟢 >=0.31.0
    .addRule('no-store-async', ERROR) // 🟢 >=2.7.0
    .addRule('no-top-level-browser-globals', ERROR) // 🟢 >=3.8.0
    .addRule('no-unknown-style-directive-property', ERROR) // 🟢 >=0.31.0
    .addRule('require-store-callbacks-use-set-param', ERROR) // >=2.12.0
    .addRule('require-store-reactive-access', ERROR) // 🟢 >=2.12.0
    .addRule('valid-compile', ERROR) // >=0.7.0
    .addRule('valid-style-parse', ERROR) // >=3.0.0
    /* CATEGORY: Security Vulnerability */
    .addRule('no-at-html-tags', ERROR) // 🟢 >=0.0.1
    // TODO should also set to `off` in `react` config, like in `vue`?
    .addRule('no-target-blank', OFF) // >=0.0.4
    /* CATEGORY: Best Practices */
    .addRule('block-lang', ERROR, [
      {
        script: ['ts', ...(enforceTypescriptInScriptSection ? [] : [null])],
        style: ['scss', null],
      },
    ]) // >=2.18.0
    .addRule('button-has-type', ERROR) // >=0.0.4
    .addRule('no-add-event-listener', ERROR) // >=3.6.0
    .addRule('no-at-debug-tags', ERROR) // 🟢 >=0.0.1
    .addRule('no-ignored-unsubscribe', ERROR) // >=2.34.0
    .addRule('no-immutable-reactive-statements', ERROR) // 🟢 >=2.27.0
    .addRule('no-inline-styles', OFF) // >=2.35.0
    .addRule('no-inspect', ERROR) // 🟢 >=2.45.0
    .addRule('no-reactive-functions', ERROR) // 🟢 >=2.5.0
    .addRule('no-reactive-literals', ERROR) // 🟢 >=2.4.0
    .addRule('no-svelte-internal', ERROR) // 🟢 >=2.39.0
    .addRule('no-unnecessary-state-wrap', ERROR) // 🟢 >=3.2.0
    .addRule('no-unused-class-name', OFF) // >=2.31.0
    .addRule('no-unused-props', ERROR) // 🟢💭 >=3.2.0
    .addRule('no-unused-svelte-ignore', ERROR) // 🟢 >=0.19.0
    .addRule('no-useless-children-snippet', ERROR) // 🟢 >=3.0.0-next.9
    .addRule('no-useless-mustaches', ERROR, [
      {ignoreIncludesComment: true, ignoreStringEscape: true},
    ]) // 🟢 >=0.0.4
    // "This rule reports the same as the base ESLint `prefer-const` rule, except that ignores Svelte reactive values such as `$derived` and `$props` as default. If this rule is active, make sure to disable the base `prefer-const` rule, as it will conflict with this rule."
    .addRule('prefer-const', ERROR, [{destructuring: 'all', ignoreReadBeforeAssign: true}]) // >=3.0.0-next.6
    .disableAnyRule('', 'prefer-const')
    .addRule('prefer-destructured-store-props', OFF) // >=2.10.0
    .addRule('prefer-writable-derived', ERROR) // >=3.6.0
    .addRule('require-each-key', ERROR) // 🟢 >=2.28.0
    .addRule('require-event-dispatcher-types', ERROR) // 🟢 >=2.16.0
    .addRule('require-optimized-style-attribute', ERROR) // >=0.32.0
    .addRule('require-stores-init', ERROR) // >=2.5.0
    .addRule('valid-each-key', ERROR) // 🟢 >=2.28.0
    /* CATEGORY: Stylistic Issues */
    .addRule('consistent-selector-style', OFF) // >=3.0.0-next.15
    .addRule('derived-has-same-inputs-outputs', WARNING) // >=2.8.0
    .addRule('first-attribute-linebreak', OFF) // 💅 >=0.6.0
    .addRule('html-closing-bracket-new-line', OFF) // 💅 >=2.45.0
    .addRule('html-closing-bracket-spacing', ERROR) // 💅 >=2.3.0
    .addRule('html-quotes', ERROR) // 💅 >=0.5.0
    .addRule('html-self-closing', ERROR, [
      {
        void: 'always', // default: always
        normal: 'never', // never
        svg: 'never', // always
        math: 'never', // never
        component: 'never', // always
        svelte: 'always', // always
      },
    ]) // 💅 >=2.5.0
    .addRule('indent', OFF) // 💅 >=0.3.0
    .addRule('max-attributes-per-line', OFF) // 💅 >=0.2.0
    .addRule('mustache-spacing', ERROR) // 💅 >=0.15.0
    .addRule('no-extra-reactive-curlies', ERROR) // >=2.4.0
    .addRule(
      'no-restricted-html-elements',
      ERROR,
      getKeysOfTruthyValues(
        {
          ...noRestrictedHtmlElementsDefault,
          ...optionsResolved.disallowedHtmlTags,
        },
        true,
      ),
    ) // >=2.31.0
    .addRule('no-spaces-around-equal-signs-in-attribute', ERROR) // 💅 >=2.3.0
    .addRule('prefer-class-directive', ERROR) // >=0.0.1
    // "Style directive were added in Svelte v3.46"
    .addRule('prefer-style-directive', svelteVersion >= 3.46 ? WARNING : OFF) // >=0.22.0
    .addRule('require-event-prefix', svelteVersion >= 5 ? ERROR : OFF) // 💅 >=3.6.0
    .addRule('shorthand-attribute', ERROR) // 💅 >=0.5.0
    .addRule('shorthand-directive', ERROR) // 💅 >=0.24.0
    .addRule('sort-attributes', ERROR) // >=2.4.0
    .addRule('spaced-html-comment', ERROR) // >=0.0.1 Yes, not supported by `prettier-plugin-svelte`
    /* CATEGORY: Extension Rules */
    .addRule('no-inner-declarations', ERROR) // 🟢 >=0.0.8
    .disableAnyRule('', 'no-inner-declarations')
    .addRule('no-trailing-spaces', OFF) // 💅 >=2.7.0
    /* CATEGORY: SvelteKit */
    .addRule('no-export-load-in-svelte-module-in-kit-pages', ERROR) // 🟢 >=2.12.0
    .addRule('no-navigation-without-base', WARNING) // >=2.36.0-next.9
    .addRule('valid-prop-names-in-kit-pages', ERROR) // 🟢 >=2.12.0
    /* CATEGORY: Experimental */
    .addRule('experimental-require-slot-types', OFF) // >=2.18.0
    .addRule('experimental-require-strict-events', OFF) // >=2.18.0
    /* CATEGORY: System */
    // Added in the setup config
    /* CATEGORY: Deprecated */
    .addRule('@typescript-eslint/no-unnecessary-condition', OFF) // >=2.9.0
    .addRule('no-dynamic-slot-name', OFF) // >=0.14.0
    .addRule('no-goto-without-base', OFF) // >=2.36.0-next.9
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
    configs: [configBuilder],
    optionsResolved,
  };
};

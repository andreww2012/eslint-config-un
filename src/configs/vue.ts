import type Eslint from 'eslint';
import {mergeProcessors as mergeEslintProcessors} from 'eslint-merge-processors';
import eslintPluginPinia from 'eslint-plugin-pinia';
import eslintPluginVue from 'eslint-plugin-vue';
import eslintPluginVueA11y from 'eslint-plugin-vuejs-accessibility';
import eslintProcessorVueBlocks, {
  type Options as EslintProcessorVueBlocksOptions,
} from 'eslint-processor-vue-blocks';
import globals from 'globals';
import {isPackageExists} from 'local-pkg';
import parserVue from 'vue-eslint-parser';
import {ERROR, GLOB_JS_TS_EXTENSION, GLOB_VUE, OFF, WARNING} from '../constants';
import {
  ConfigEntryBuilder,
  type ConfigSharedOptions,
  type FlatConfigEntry,
  type FlatConfigEntryFilesOrIgnores,
  type RulesRecord,
  bulkChangeRuleSeverity,
} from '../eslint';
import type {PrettifyShallow} from '../types';
import {joinPaths} from '../utils';
import {RULE_CAMELCASE_OPTIONS, RULE_EQEQEQ_OPTIONS} from './js';
import type {InternalConfigOptions} from './index';

type WellKnownSfcBlocks =
  | 'template'
  | 'script'
  | 'script:not([setup])'
  | 'script[setup]'
  | 'style'
  | 'style:not([scoped])'
  | 'style[scoped]';

// prettier-ignore
const INVALID_HTML_TAGS = [
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element#obsolete_and_deprecated_elements
  'acronym', 'big', 'center', 'content', 'dir', 'font', 'frame', 'frameset', 'image', 'marquee', 'menuitem', 'nobr', 'noembed', 'noframes', 'param', 'plaintext', 'rb', 'rtc', 'shadow', 'strike', 'tt', 'xmp',
  // https://html.spec.whatwg.org/multipage/dom.html#htmlunknownelement
  'applet', 'bgsound', 'blink', 'isindex', 'keygen', 'multicol', 'nextid', 'spacer',
  'basefont', 'listing',
  // https://udn.realityripple.com/docs/Web/HTML/Element
  'command', 'element',
] as const;
// prettier-ignore
type ValidHtmlTags = 'a' | 'abbr' | 'address' | 'area' | 'article' | 'aside' | 'audio' | 'b' | 'base' | 'bdi' | 'bdo' | 'blockquote' | 'body' | 'br' | 'button' | 'canvas' | 'caption' | 'cite' | 'code' | 'col' | 'colgroup' | 'data' | 'datalist' | 'dd' | 'del' | 'details' | 'dfn' | 'dialog' | 'div' | 'dl' | 'dt' | 'em' | 'embed' | 'fieldset' | 'figcaption' | 'figure' | 'footer' | 'form' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'head' | 'header' | 'hgroup' | 'hr' | 'html' | 'i' | 'iframe' | 'img' | 'input' | 'ins' | 'kbd' | 'label' | 'legend' | 'li' | 'link' | 'main' | 'map' | 'mark' | 'math' | 'menu' | 'meta' | 'meter' | 'nav' | 'noscript' | 'object' | 'ol' | 'optgroup' | 'option' | 'output' | 'p' | 'picture' | 'pre' | 'progress' | 'q' | 'rbc' | 'rp' | 'rt' | 'ruby' | 's' | 'samp' | 'script' | 'search' | 'section' | 'select' | 'slot' | 'small' | 'source' | 'span' | 'strong' | 'style' | 'sub' | 'summary' | 'sup' | 'svg' | 'table' | 'tbody' | 'td' | 'template' | 'textarea' | 'tfoot' | 'th' | 'thead' | 'time' | 'title' | 'tr' | 'track' | 'u' | 'ul' | 'var' | 'video' | 'wbr';
type InvalidHtmlTags = (typeof INVALID_HTML_TAGS)[number];
type ValidAndInvalidHtmlTags = ValidHtmlTags | InvalidHtmlTags;

export const noRestrictedHtmlElementsDefault = Object.fromEntries(
  INVALID_HTML_TAGS.map((tag) => [tag, true]),
);

const DEFAULT_PINIA_STORE_NAME_SUFFIX = 'Store';

export interface VueEslintConfigOptions extends ConfigSharedOptions<'vue'> {
  /**
   * @default auto-detected
   */
  majorVersion: 2 | 3;
  fullVersion?: string;

  /**
   * Enforces the presence of `lang="ts"` in `<script>` sections, see [vue/block-lang](https://eslint.vuejs.org/rules/block-lang.html) rule for more details.
   *
   * Setting this option no anything but `false` also makes all `.vue` (or explicitly specified files if object syntax is used) checked by `typescript` config, and by default **BOTH non-type-aware and type-aware** rules will be applied. You can opt out of this behavior or only enable NON-type-aware rules with `typescriptRules` option. Disabling type-aware rules might be beneficial for bigger projects as these rules are known to be quite slow on Vue files.
   * @default true <=> `typescript` config is enabled
   */
  enforceTypescriptInScriptSection?:
    | boolean
    | PrettifyShallow<
        FlatConfigEntryFilesOrIgnores & {
          /**
           * What `typescript` rules will be applied to the specified `files`. If you want more control over which TypeScript rules are applied to which Vue files, use `typescript` config options for that.
           * @default true
           */
          typescriptRules?: boolean | 'only-non-type-aware';
        }
      >;

  /**
   * @see https://eslint.vuejs.org/rules/comment-directive#options
   */
  reportUnusedDisableDirectives?: boolean;

  /**
   * Will be merged with `['router-link', 'router-view']` and Nuxt-specific ones if Nuxt is enabled
   */
  knownComponentNames?: (string | RegExp)[];
  enforceApiStyle?: 'setup' | 'options';

  /**
   * @default 'runtime'
   */
  enforcePropsDeclarationStyle?: 'runtime' | 'type-based';

  /**
   * Enforce <script> SFC section to go before <template> (<style> will still be the last)
   * @default 'template-first'
   * @see https://eslint.vuejs.org/rules/block-order.html
   */
  sfcBlockOrder?: 'template-first' | 'script-first' | (WellKnownSfcBlocks | (string & {}))[];
  noPropertyAccessFromIndexSignatureSetInTsconfigForVueFiles?: boolean;
  doNotRequireComponentNamesToBeMultiWordForPatterns?: string | string[];

  /**
   * By default, all deprecated or non-standard HTML tags are disallowed. Using the object syntax, you can re-allow any of them, or disallow other tags.
   * @example {marquee: false, pre: true}
   */
  disallowedHtmlTags?: Partial<Record<ValidAndInvalidHtmlTags | (string & {}), boolean>>;

  /**
   * Whether to prefer Vue 3.5 [`useTemplateRef`](https://vuejs.org/api/composition-api-helpers.html#usetemplateref) instead of `ref` to obtain a template ref.
   * @default true <=> vue>=3.5 is installed
   */
  preferUseTemplateRef?: boolean;

  /**
   * Enables A11Y (accessibility) rules for Vue SFC templates
   *
   * By default, uses `files` and `ignores` from the parent config.
   * @default true
   */
  configA11y?: boolean | ConfigSharedOptions<'vuejs-accessibility'>;

  /**
   * Enabled automatically by checking if `nuxt` package is installed (at any level). Pass a false value or a Nuxt version to explicitly disable or enable Nuxt-specific rules or tweaks.
   */
  nuxtMajorVersion?: false | 3;

  /**
   * @default ''
   */
  nuxtOrVueProjectDir?: string;

  /**
   * Enabled automatically by checking if `pinia` package is installed (at any level). Pass a false value to disable pinia-specific rules.
   * @default true if `pinia` package is installed
   */
  configPinia?:
    | boolean
    | PrettifyShallow<
        ConfigSharedOptions<'pinia'> & {
          /**
           * @default `Store`
           * @see https://github.com/lisilinhart/eslint-plugin-pinia/blob/main/docs/rules/prefer-use-store-naming-convention.md#options
           */
          storesNameSuffix?: string;
        }
      >;

  /**
   * Whether to create virtual ESLint files for various SFC (single file component) blocks.
   *
   * - By default, virtual files will be created for `<style>` blocks.
   * - If an object is passed, it will be merged with the defaults above.
   * - If `false`, no virtual files will be created.
   * @default true
   */
  processSfcBlocks?: boolean | EslintProcessorVueBlocksOptions;
}

export const vueEslintConfig = (
  options: VueEslintConfigOptions,
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const {
    majorVersion,
    enforceTypescriptInScriptSection,
    configA11y = true,
    configPinia = isPackageExists('pinia'),
    processSfcBlocks = true,
  } = options;

  const files = options.files || [GLOB_VUE];

  const vueMajorAndMinorVersion = Number.parseFloat(options.fullVersion || '');
  const isVue2 = majorVersion === 2;
  const isVue3 = majorVersion === 3;
  const isMin3_3 = isVue3 && vueMajorAndMinorVersion >= 3.3;
  const isMin3_4 = isVue3 && vueMajorAndMinorVersion >= 3.4;
  const isMin3_5 = isVue3 && vueMajorAndMinorVersion >= 3.5;
  const isLess2_5 = isVue2 && vueMajorAndMinorVersion < 2.5;
  const isLess2_6 = isVue2 && vueMajorAndMinorVersion < 2.6;
  const isLess3_1 = vueMajorAndMinorVersion < 3.1;

  const isNuxtEnabled = Boolean(options.nuxtMajorVersion);

  const recommendedRulesRaw = eslintPluginVue.configs[
    isVue3 ? 'flat/recommended' : 'flat/vue2-recommended'
  ].reduce<Partial<RulesRecord>>((result, config) => Object.assign(result, config.rules), {});
  // All `recommended` rules has `warn` severity by default: https://github.com/vuejs/eslint-plugin-vue/tree/a6587498e21e5bc33f22e93d46fbc2d5e66585f3/lib/configs/flat
  const recommendedRules = bulkChangeRuleSeverity(recommendedRulesRaw, ERROR);

  const inNuxtAppDir = joinPaths.bind(null, options.nuxtOrVueProjectDir);
  const nuxtLayoutsFilesGlob: string = inNuxtAppDir('layouts/**/*.vue');

  const builder = new ConfigEntryBuilder('vue', options, internalOptions);

  builder.addConfig(['vue/setup', {doNotIgnoreMarkdown: true}], {
    files: [GLOB_VUE, ...files],
    processor: mergeEslintProcessors(
      [
        eslintPluginVue.processors['.vue'] as Eslint.Linter.Processor,
        (() => {
          if (!processSfcBlocks) {
            return null;
          }
          const processorOptions = typeof processSfcBlocks === 'object' ? processSfcBlocks : {};
          return eslintProcessorVueBlocks({
            ...processorOptions,
            blocks: {
              styles: true,
              ...processorOptions.blocks,
            },
          });
        })(),
      ].filter((v) => v != null),
    ),
    languageOptions: {
      globals: globals.browser,
      parser: parserVue,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        extraFileExtensions: ['.vue'],
        parser: internalOptions.isTypescriptEnabled ? '@typescript-eslint/parser' : undefined,
        sourceType: 'module' as const,
      },
    },
  });

  // LEGEND:
  // 3️⃣ = Only in Vue 3 recommended
  builder
    .addConfig(['vue', {includeDefaultFilesAndIgnores: true}], {
      files,
    })
    .addBulkRules(recommendedRules)
    // 🟢 Base
    .addRule('comment-directive', ERROR, [
      // false by default
      {reportUnusedDisableDirectives: options.reportUnusedDisableDirectives ?? true},
    ])
    // .addRule('jsx-uses-vars', ERROR)
    // 🟢 Priority A: Essential
    // .addRule('multi-word-component-names', ERROR)
    // .addRule('no-arrow-functions-in-watch', ERROR)
    // .addRule('no-async-in-computed-properties', ERROR)
    // .addRule('no-child-content', ERROR)
    // .addRule('no-computed-properties-in-data', ERROR)
    // .addRule('no-deprecated-data-object-declaration', ERROR) // 3️⃣
    // .addRule('no-deprecated-destroyed-lifecycle', ERROR) // 3️⃣
    // .addRule('no-deprecated-dollar-listeners-api', ERROR) // 3️⃣
    // .addRule('no-deprecated-dollar-scopedslots-api', ERROR) // 3️⃣
    // .addRule('no-deprecated-events-api', ERROR) // 3️⃣
    // .addRule('no-deprecated-filter', ERROR) // 3️⃣
    // .addRule('no-deprecated-functional-template', ERROR) // 3️⃣
    // .addRule('no-deprecated-html-element-is', ERROR) // 3️⃣
    // .addRule('no-deprecated-inline-template', ERROR) // 3️⃣
    // .addRule('no-deprecated-props-default-this', ERROR) // 3️⃣
    // .addRule('no-deprecated-router-link-tag-prop', ERROR) // 3️⃣
    .addRule('no-deprecated-scope-attribute', isLess2_5 ? OFF : ERROR) // 3️⃣ deprecated in 2.5.0
    .addRule('no-deprecated-slot-attribute', isLess2_6 ? OFF : ERROR) // 3️⃣ deprecated in 2.6.0
    .addRule('no-deprecated-slot-scope-attribute', isLess2_6 ? OFF : ERROR) // 3️⃣ deprecated in 2.6.0
    // .addRule('no-deprecated-v-bind-sync', ERROR) // 3️⃣
    .addRule('no-deprecated-v-is', isLess3_1 ? OFF : ERROR) // 3️⃣ deprecated in 3.1.0
    // .addRule('no-deprecated-v-on-native-modifier', ERROR) // 3️⃣
    // .addRule('no-deprecated-v-on-number-modifiers', ERROR) // 3️⃣
    // .addRule('no-deprecated-vue-config-keycodes', ERROR) // 3️⃣
    // .addRule('no-dupe-keys', ERROR)
    // .addRule('no-dupe-v-else-if', ERROR)
    // .addRule('no-duplicate-attributes', ERROR)
    // .addRule('no-export-in-script-setup', ERROR)
    // .addRule('no-expose-after-await', ERROR) // 3️⃣
    // .addRule('no-lifecycle-after-await', ERROR) // 3️⃣
    // .addRule('no-mutating-props', ERROR)
    // .addRule('no-parsing-error', ERROR)
    // .addRule('no-ref-as-operand', ERROR)
    // .addRule('no-reserved-component-names', ERROR)
    // .addRule('no-reserved-keys', ERROR)
    // .addRule('no-reserved-props', ERROR)
    // .addRule('no-shared-component-data', ERROR)
    // .addRule('no-side-effects-in-computed-properties', ERROR)
    // .addRule('no-template-key', ERROR)
    // .addRule('no-textarea-mustache', ERROR)
    // .addRule('no-unused-components', ERROR)
    // .addRule('no-unused-vars', ERROR)
    // .addRule('no-use-computed-property-like-method', ERROR)
    // .addRule('no-use-v-if-with-v-for', ERROR)
    // .addRule('no-useless-template-attributes', ERROR)
    // .addRule('no-v-for-template-key-on-child', ERROR) // 3️⃣
    // .addRule('no-v-text-v-html-on-component', ERROR)
    // .addRule('no-watch-after-await', ERROR) // 3️⃣
    // .addRule('prefer-import-from-vue', ERROR) // 3️⃣
    // .addRule('require-component-is', ERROR)
    // .addRule('require-prop-type-constructor', ERROR)
    // .addRule('require-render-return', ERROR)
    // .addRule('require-slots-as-functions', ERROR) // 3️⃣
    // .addRule('require-toggle-inside-transition', ERROR) // 3️⃣
    // .addRule('require-v-for-key', ERROR)
    // .addRule('require-valid-default-prop', ERROR)
    // .addRule('return-in-computed-property', ERROR)
    // .addRule('return-in-emits-validator', ERROR)
    // .addRule('use-v-on-exact', ERROR)
    // .addRule('valid-attribute-name', ERROR)
    // .addRule('valid-define-emits', ERROR)
    // .addRule('valid-define-props', ERROR)
    // .addRule('valid-next-tick', ERROR)
    // .addRule('valid-template-root', ERROR)
    // .addRule('valid-v-bind', ERROR)
    // .addRule('valid-v-cloak', ERROR)
    // .addRule('valid-v-else-if', ERROR)
    // .addRule('valid-v-else', ERROR)
    // .addRule('valid-v-for', ERROR)
    // .addRule('valid-v-html', ERROR)
    // .addRule('valid-v-if', ERROR)
    // .addRule('valid-v-is', ERROR) // 3️⃣
    // .addRule('valid-v-memo', ERROR) // 3️⃣
    // .addRule('valid-v-model', ERROR)
    // .addRule('valid-v-on', ERROR)
    // .addRule('valid-v-once', ERROR)
    // .addRule('valid-v-pre', ERROR)
    // .addRule('valid-v-show', ERROR)
    // .addRule('valid-v-slot', ERROR)
    // .addRule('valid-v-text', ERROR)
    // 🟢 Priority B: Strongly Recommended
    // .addRule('attribute-hyphenation', ERROR)
    // .addRule('component-definition-name-casing', ERROR)
    // .addRule('first-attribute-linebreak', ERROR)
    // .addRule('html-closing-bracket-newline', ERROR)
    // .addRule('html-closing-bracket-spacing', ERROR)
    // .addRule('html-end-tags', ERROR)
    // .addRule('html-indent', ERROR)
    // .addRule('html-quotes', ERROR)
    .addRule('html-self-closing', ERROR, [
      {
        html: {
          void: 'any', // TODO Setting other value here for `void` would conflict with Prettier, default is `never`
          normal: 'never',
          component: 'never',
        },
      },
    ])
    // .addRule('max-attributes-per-line', ERROR)
    // .addRule('multiline-html-element-content-newline', ERROR)
    // .addRule('mustache-interpolation-spacing', ERROR)
    // .addRule('no-multi-spaces', ERROR)
    // .addRule('no-spaces-around-equal-signs-in-attribute', ERROR)
    // .addRule('no-template-shadow', ERROR)
    // .addRule('one-component-per-file', ERROR)
    // .addRule('prop-name-casing', ERROR)
    .addRule('require-default-prop', OFF)
    // .addRule('require-explicit-emits', ERROR) // 3️⃣
    // .addRule('require-prop-types', ERROR)
    // .addRule('singleline-html-element-content-newline', ERROR)
    .addRule('v-bind-style', ERROR, [
      'shorthand',
      {
        ...(isMin3_4 && {sameNameShorthand: 'always'}),
      },
    ])
    // .addRule('v-on-event-hyphenation', ERROR) // 3️⃣
    // .addRule('v-on-style', ERROR)
    // .addRule('v-slot-style', ERROR)
    // 🟢 Priority C: Recommended
    // .addRule('attributes-order', ERROR)
    // .addRule('no-lone-template', ERROR)
    // .addRule('no-multiple-slot-args', ERROR)
    // .addRule('no-v-html', ERROR)
    // .addRule('order-in-components', ERROR)
    // .addRule('this-in-template', ERROR)
    // 🟢 Uncategorized
    .addRule('block-lang', ERROR, [
      {
        script: {
          lang: 'ts',
          ...(enforceTypescriptInScriptSection !== true && {allowNoLang: true}),
        },
      },
    ])
    .addRule('block-order', ERROR, [
      {
        order: [
          ...(Array.isArray(options.sfcBlockOrder)
            ? options.sfcBlockOrder
            : options.sfcBlockOrder === 'script-first'
              ? ['script:not([setup])', 'script[setup]', 'template']
              : ['template', 'script:not([setup])', 'script[setup]']),
          'style:not([scoped])', // TODO move to top?
          'style[scoped]',
        ],
      },
    ])
    // .addRule('block-tag-newline', OFF)
    .addRule('component-api-style', options.enforceApiStyle == null ? OFF : ERROR, [
      [
        options.enforceApiStyle === 'setup' ? 'script-setup' : 'options',
        // allows Composition API (not <script setup>)
        isVue2 ? 'composition-vue2' : 'composition',
      ],
    ])
    .addRule('component-name-in-template-casing', ERROR, [
      'kebab-case',
      {
        registeredComponentsOnly: false,
        ignores: ['/^[A-Z][a-z]+$/' /* Single word components must start with a capital letter */],
      },
    ])
    .addRule('component-options-name-casing', ERROR, ['PascalCase' /* default */])
    .addRule('custom-event-name-casing', ERROR, ['kebab-case' /* default is `camelCase` */])
    .addRule('define-emits-declaration', ERROR, [
      isMin3_3 ? 'type-literal' /* shorter syntax */ : 'type-based' /* default */,
    ])
    .addRule('define-macros-order', ERROR, [
      {
        order: [
          'definePage', // unplugin-vue-router: https://uvr.esm.is/guide/extending-routes.html#definepage
          'definePageMeta', // Nuxt 3: https://nuxt.com/docs/api/utils/define-page-meta
          'defineRouteRules', // Nuxt 3: https://nuxt.com/docs/api/utils/define-route-rules

          'defineOptions',
          'defineModel',
          'defineProps',
          'defineEmits',
          'defineSlots',
        ],
        ...(isMin3_4 && {defineExposeLast: true}),
      },
    ])
    .addRule('define-props-declaration', ERROR, [options.enforcePropsDeclarationStyle ?? 'runtime'])
    // .addRule('enforce-style-attribute', OFF)
    .addRule('html-button-has-type', ERROR)
    // .addRule('html-comment-content-newline', OFF)
    // .addRule('html-comment-content-spacing', OFF)
    // .addRule('html-comment-indent', OFF)
    // .addRule('match-component-file-name', OFF)
    // .addRule('match-component-import-name', OFF)
    // .addRule('max-lines-per-block', OFF)
    // .addRule('max-props', OFF) // >=9.28.0
    // .addRule('max-template-depth', OFF) // >=9.28.0
    // .addRule('new-line-between-multi-line-property', OFF)
    // .addRule('next-tick-style', OFF)
    // .addRule('no-bare-strings-in-template', OFF)
    // .addRule('no-boolean-default', OFF)
    .addRule('no-deprecated-delete-set', isVue3 ? ERROR : OFF) // >=9.29.0
    .addRule('no-deprecated-model-definition', isVue3 ? ERROR : OFF)
    .addRule('no-duplicate-attr-inheritance', ERROR)
    .addRule('no-empty-component-block', ERROR)
    .addRule('no-import-compiler-macros', ERROR) // >=10.0.0
    .addRule('no-multiple-objects-in-class', ERROR)
    .addRule('no-potential-component-option-typo', ERROR)
    .addRule('no-ref-object-reactivity-loss', ERROR)
    // .addRule('no-required-prop-with-default', ERROR)
    // .addRule('no-restricted-block', OFF)
    // .addRule('no-restricted-call-after-await', OFF)
    // .addRule('no-restricted-class', OFF)
    // .addRule('no-restricted-component-names', OFF)
    // .addRule('no-restricted-component-options', OFF)
    // .addRule('no-restricted-custom-event', OFF)
    .addRule(
      'no-restricted-html-elements',
      ERROR,
      Object.entries({
        ...noRestrictedHtmlElementsDefault,
        ...options.disallowedHtmlTags,
      })
        .filter(([, isDisallowed]) => isDisallowed)
        .map(([tag]) => tag),
    )
    // .addRule('no-restricted-props', OFF)
    // .addRule('no-restricted-static-attribute', OFF)
    // .addRule('no-restricted-v-bind', OFF)
    // .addRule('no-restricted-v-on', OFF)
    // .addRule('no-root-v-if', OFF)
    .addRule('no-setup-props-reactivity-loss', ERROR)
    // .addRule('no-static-inline-styles', OFF)
    // .addRule('no-template-target-blank', OFF)
    .addRule('no-this-in-before-route-enter', ERROR)
    .addRule('no-undef-components', ERROR, [
      {
        ignorePatterns: [
          'router-link',
          'router-view',
          isNuxtEnabled && /^(lazy-)?(nuxt-|client-only$)/,
          ...(options.knownComponentNames || []),
        ]
          .flat()
          .filter((v) => v !== false),
      },
    ])
    // TODO enable if script setup is enforced and only in JS?
    // .addRule('no-undef-properties', OFF)
    .addRule('no-unsupported-features', ERROR, [
      {version: `^${options.fullVersion || majorVersion}`},
    ])
    .addRule('no-unused-emit-declarations', ERROR)
    // .addRule('no-unused-properties', OFF)
    .addRule('no-unused-refs', ERROR)
    .addRule('no-use-v-else-with-v-for', ERROR)
    .addRule('no-useless-mustaches', ERROR)
    .addRule('no-useless-v-bind', ERROR)
    // .addRule('no-v-text', OFF)
    .addRule('padding-line-between-blocks', ERROR)
    // .addRule('padding-line-between-tags', OFF)
    .addRule('padding-lines-in-component-definition', ERROR, [
      {
        withinOption: {
          // TODO understand the difference between `betweenItems` and `withinEach`: https://eslint.vuejs.org/rules/padding-lines-in-component-definition.html
          props: 'ignore',
        },
      },
    ])
    .addRule('prefer-define-options', isMin3_3 ? ERROR : OFF)
    .addRule('prefer-prop-type-boolean-first', ERROR)
    .addRule('prefer-separate-static-class', ERROR)
    .addRule('prefer-true-attribute-shorthand', ERROR)
    .addRule('prefer-use-template-ref', (options.preferUseTemplateRef ?? isMin3_5) ? ERROR : OFF)
    .addRule('require-default-export', ERROR) // >=9.28.0
    .addRule('require-direct-export', ERROR)
    // .addRule('require-emit-validator', OFF)
    .addRule('require-explicit-slots', isMin3_3 ? ERROR : OFF)
    // .addRule('require-expose', OFF)
    .addRule('require-macro-variable-name', ERROR)
    // .addRule('require-name-property', OFF)
    // .addRule('require-prop-comment', OFF)
    .addRule('require-typed-object-prop', ERROR)
    .addRule('require-typed-ref', ERROR)
    // .addRule('restricted-component-names', OFF) // >= 9.32.0
    .addRule('slot-name-casing', ERROR /* `camelCase` is default */) // >= 9.32.0
    // .addRule('script-indent', OFF)
    // .addRule('sort-keys', OFF)
    // .addRule('static-class-names-order', OFF)
    .addRule('v-for-delimiter-style', ERROR, ['in' /* default */])
    // This rule is not required in Vue 3, as the key is automatically assigned to the elements.
    .addRule('v-for-delimiter-style', isVue2 ? ERROR : OFF)
    // TODO change to [inline, inline-function] once this is landed: https://github.com/vuejs/eslint-plugin-vue/issues/2460
    .addRule('v-on-handler-style', ERROR, ['inline'])
    .addRule('valid-define-options', isMin3_3 ? ERROR : OFF)
    // 🟢 Extension Rules
    // .addRule('array-bracket-newline', OFF)
    // .addRule('array-bracket-spacing', OFF)
    // .addRule('array-element-newline', OFF)
    // .addRule('arrow-spacing', OFF)
    // .addRule('block-spacing', OFF)
    // .addRule('brace-style', OFF)
    .addRule('camelcase', ERROR, RULE_CAMELCASE_OPTIONS)
    // .addRule('comma-dangle', OFF)
    // .addRule('comma-spacing', OFF)
    // .addRule('comma-style', OFF)
    // .addRule('dot-location', OFF)
    .addRule(
      'dot-notation',
      options.noPropertyAccessFromIndexSignatureSetInTsconfigForVueFiles ? OFF : ERROR,
    )
    .addRule('eqeqeq', ERROR, RULE_EQEQEQ_OPTIONS)
    // .addRule('func-call-spacing', OFF)
    // .addRule('key-spacing', OFF)
    // .addRule('keyword-spacing', OFF)
    // .addRule('max-len', OFF)
    // .addRule('multiline-ternary', OFF)
    .addRule('no-console', ERROR)
    .addRule('no-constant-condition', WARNING)
    .addRule('no-empty-pattern', ERROR)
    // .addRule('no-extra-parens', OFF)
    .addRule('no-irregular-whitespace', ERROR)
    .addRule('no-loss-of-precision', ERROR)
    // .addRule('no-restricted-syntax', OFF)
    .addRule('no-sparse-arrays', ERROR)
    .addRule('no-useless-concat', ERROR)
    // .addRule('object-curly-newline', OFF)
    // .addRule('object-curly-spacing', OFF)
    // .addRule('object-property-newline', OFF)
    .addRule('object-shorthand', ERROR)
    // .addRule('operator-linebreak', OFF)
    .addRule('prefer-template', ERROR)
    // .addRule('quote-props', OFF)
    // .addRule('space-in-parens', OFF)
    // .addRule('space-infix-ops', OFF)
    // .addRule('space-unary-ops', OFF)
    // .addRule('template-curly-spacing', OFF)
    // 🔵 Not working great in Vue files
    .disableAnyRule('@typescript-eslint/prefer-function-type')
    .disableAnyRule('@typescript-eslint/unified-signatures')
    .disableAnyRule('import/first') // May be wrong if multiple <script> blocks are present
    .disableAnyRule('import/no-default-export')
    .disableAnyRule('no-useless-assignment') // False positives in script setup
    .addOverrides();

  builder
    .addConfig('vue/allow-single-word-component-names', {
      files: [
        inNuxtAppDir('pages/**/*.vue'),
        inNuxtAppDir('views/**/*.vue'),
        isNuxtEnabled && [
          nuxtLayoutsFilesGlob,
          ...['app.vue', 'error.vue'].map((fileName) => inNuxtAppDir(fileName)),
        ],

        options.doNotRequireComponentNamesToBeMultiWordForPatterns,
      ]
        .flat()
        .filter((v) => typeof v === 'string'),
    })
    .addRule('multi-word-component-names', OFF);

  const vueAllowImplicitSlotsConfig = builder.addConfig('vue/allow-implicit-slots', {
    files: [nuxtLayoutsFilesGlob],
  });
  if (isNuxtEnabled) {
    vueAllowImplicitSlotsConfig.addRule('require-explicit-slots', OFF);
  }

  builder
    .addConfig('vue/allow-default-export', {
      files: [
        GLOB_VUE,
        isNuxtEnabled && [
          inNuxtAppDir('plugins/**/*'),
          inNuxtAppDir('server/**/*'),
          inNuxtAppDir(`app/router.options.${GLOB_JS_TS_EXTENSION}`),
        ],
      ]
        .flat()
        .filter((v) => typeof v === 'string'),
    })
    .disableAnyRule('import/no-default-export');

  const configA11yOptions: typeof configA11y & {} = {
    files,
    ignores: options.ignores,
    ...(typeof configA11y === 'object' ? configA11y : {}),
  };
  const builderA11y = new ConfigEntryBuilder(
    'vuejs-accessibility',
    configA11yOptions,
    internalOptions,
  );
  builderA11y
    .addConfig([
      'vue/a11y',
      {
        includeDefaultFilesAndIgnores: true,
        ignoreMarkdownCodeBlocks: true,
      },
    ])
    .addBulkRules(eslintPluginVueA11y.configs['flat/recommended'].find((v) => 'rules' in v)?.rules)
    // .addRule('alt-text', ERROR)
    // .addRule('anchor-has-content', ERROR)
    // .addRule('aria-props', ERROR)
    // .addRule('aria-role', ERROR)
    // .addRule('aria-unsupported-elements', ERROR)
    // .addRule('click-events-have-key-events', ERROR)
    // .addRule('form-control-has-label', ERROR)
    // .addRule('heading-has-content', ERROR)
    // .addRule('iframe-has-title', ERROR)
    // .addRule('interactive-supports-focus', ERROR)
    .addRule('label-has-for', ERROR, [{allowChildren: true}])
    // .addRule('media-has-caption', ERROR)
    // .addRule('mouse-events-have-key-events', ERROR)
    // .addRule('no-access-key', ERROR)
    // .addRule('no-autofocus', ERROR)
    // .addRule('no-distracting-elements', ERROR)
    // .addRule('no-onchange', ERROR)
    // .addRule('no-redundant-roles', ERROR)
    // .addRule('no-static-element-interactions', ERROR)
    // .addRule('role-has-required-aria-props', ERROR)
    // .addRule('tabindex-no-positive', ERROR)
    .addOverrides();

  const piniaBuilder = new ConfigEntryBuilder(
    'pinia',
    typeof configPinia === 'object' ? configPinia : {},
    internalOptions,
  );

  piniaBuilder
    .addConfig([
      'pinia',
      {
        includeDefaultFilesAndIgnores: true,
        ignoreMarkdownCodeBlocks: true,
      },
    ])
    .addBulkRules(eslintPluginPinia.configs['recommended-flat'].rules)
    // .addRule('never-export-initialized-store', ERROR)
    // .addRule('no-duplicate-store-ids', ERROR)
    // .addRule('no-return-global-properties', ERROR)
    // .addRule('no-store-to-refs-in-store', ERROR)
    .addRule('prefer-single-store-per-file', ERROR)
    .addRule('prefer-use-store-naming-convention', ERROR, [
      {
        checkStoreNameMismatch: true,
        storeSuffix:
          typeof configPinia === 'object' && configPinia.storesNameSuffix != null
            ? configPinia.storesNameSuffix
            : DEFAULT_PINIA_STORE_NAME_SUFFIX,
      },
    ])
    // .addRule('require-setup-store-properties-export', ERROR)
    .addOverrides();

  return [
    ...builder.getAllConfigs(),
    ...(configA11y === false ? [] : builderA11y.getAllConfigs()),
    ...(configPinia === false ? [] : piniaBuilder.getAllConfigs()),
  ];
};

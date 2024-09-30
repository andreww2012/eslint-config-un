import eslintPluginPinia from 'eslint-plugin-pinia';
// @ts-expect-error no typings
import eslintPluginVue from 'eslint-plugin-vue';
import eslintPluginVueA11y from 'eslint-plugin-vuejs-accessibility';
import globals from 'globals';
import parserVue from 'vue-eslint-parser';
import {ERROR, GLOB_VUE, OFF, WARNING} from '../constants';
import type {
  ConfigSharedOptions,
  FlatConfigEntry,
  InternalConfigOptions,
  RuleOverrides,
} from '../types';
import {ConfigEntryBuilder, joinPaths} from '../utils';
import {RULE_CAMELCASE_OPTIONS, RULE_EQEQEQ_OPTIONS} from './js';

type WellKnownSfcBlocks =
  | 'template'
  | 'script'
  | 'script:not([setup])'
  | 'script[setup]'
  | 'style'
  | 'style:not([scoped])'
  | 'style[scoped]';

export interface VueEslintConfigOptions extends ConfigSharedOptions<'vue'> {
  /**
   * @default auto-detected
   */
  majorVersion: 2 | 3;
  fullVersion?: string;
  /**
   * This being true turns on TypeScript type-aware rules for .Vue files. They are disabled by default because it applies them to plain JS <script> sections which causes tons on false positives.
   * @default true if typescript config is enabled
   */
  enforceTypescriptInScriptSection?: boolean | Pick<FlatConfigEntry, 'files' | 'ignores'>;
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
   * @see https://eslint.vuejs.org/rules/block-order.html
   * @default 'template-first'
   */
  sfcBlockOrder?: 'template-first' | 'script-first' | (WellKnownSfcBlocks & {})[];
  noPropertyAccessFromIndexSignatureSetInTsconfigForVueFiles?: boolean;
  doNotRequireComponentNamesToBeMultiWordForPatterns?: string | string[];

  /**
   * Enables A11Y (accessibility) rules for Vue SFC templates
   * @default true
   */
  a11y?: boolean;
  overridesA11y?: RuleOverrides<'vuejs-accessibility'>;

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
  pinia?:
    | boolean
    | {
        /**
         * @default `Store`
         * @see https://github.com/lisilinhart/eslint-plugin-pinia/blob/main/docs/rules/prefer-use-store-naming-convention.md#options
         */
        storesNameSuffix?: string;
      };
  overridesPinia?: RuleOverrides<'pinia'>;
}

// prettier-ignore
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element#obsolete_and_deprecated_elements
const DEPRECATED_HTML_TAGS = [
  'acronym', 'big', 'center', 'content', 'dir', 'font', 'frame', 'frameset', 'image', 'marquee', 'menuitem', 'nobr', 'noembed', 'noframes', 'param', 'plaintext', 'rb', 'rtc', 'shadow', 'strike', 'tt', 'xmp',
];

const DEFAULT_PINIA_STORE_NAME_SUFFIX = 'Store';

export const vueEslintConfig = (
  options: VueEslintConfigOptions,
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const {majorVersion, enforceTypescriptInScriptSection, a11y = true, pinia} = options;

  const files = options.files || [GLOB_VUE];

  const vueMajorAndMinorVersion = Number.parseFloat(options.fullVersion || '');
  const isVue2 = majorVersion === 2;
  const isVue3 = majorVersion === 3;
  const isMin3_3 = isVue3 && vueMajorAndMinorVersion >= 3.3;
  const isMin3_4 = isVue3 && vueMajorAndMinorVersion >= 3.4;
  const isLess2_5 = isVue2 && vueMajorAndMinorVersion < 2.5;
  const isLess2_6 = isVue2 && vueMajorAndMinorVersion < 2.6;
  const isLess3_1 = vueMajorAndMinorVersion < 3.1;

  const isNuxtEnabled = Boolean(options.nuxtMajorVersion);

  const recommendedRules = // TODO report to Prettier?
    // prettier-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (eslintPluginVue.configs[isVue3 ? 'flat/recommended' : 'flat/vue2-recommended'] as FlatConfigEntry[]).find(
      (entry) =>
        entry.name === 'vue:recommended:rules' || entry.name === 'vue:vue2-recommended:rules',
    )?.rules;

  const nuxtLayoutsFilesGlob: string = joinPaths([options.nuxtOrVueProjectDir, 'layouts/**/*.vue']);

  const builder = new ConfigEntryBuilder<'vue'>(options, internalOptions);

  builder.addConfig('vue/setup', {
    plugins: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      vue: eslintPluginVue,
    },
  });

  // TODO detect duplicate name
  builder.addConfig('vue/setup', {
    files: [GLOB_VUE, ...files],
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    processor: eslintPluginVue.processors['.vue'],
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
    // 🟢 Disable deprecated rules from Recommended
    .addRule('vue/component-tags-order', OFF)
    // 🟢 Base
    .addRule('vue/comment-directive', ERROR, [
      // false by default
      {reportUnusedDisableDirectives: options.reportUnusedDisableDirectives ?? true},
    ])
    // .addRule('vue/jsx-uses-vars', ERROR)
    // 🟢 Priority A: Essential
    // .addRule('vue/multi-word-component-names', ERROR)
    // .addRule('vue/no-arrow-functions-in-watch', ERROR)
    // .addRule('vue/no-async-in-computed-properties', ERROR)
    // .addRule('vue/no-child-content', ERROR)
    // .addRule('vue/no-computed-properties-in-data', ERROR)
    // .addRule('vue/no-deprecated-data-object-declaration', ERROR) // 3️⃣
    // .addRule('vue/no-deprecated-destroyed-lifecycle', ERROR) // 3️⃣
    // .addRule('vue/no-deprecated-dollar-listeners-api', ERROR) // 3️⃣
    // .addRule('vue/no-deprecated-dollar-scopedslots-api', ERROR) // 3️⃣
    // .addRule('vue/no-deprecated-events-api', ERROR) // 3️⃣
    // .addRule('vue/no-deprecated-filter', ERROR) // 3️⃣
    // .addRule('vue/no-deprecated-functional-template', ERROR) // 3️⃣
    // .addRule('vue/no-deprecated-html-element-is', ERROR) // 3️⃣
    // .addRule('vue/no-deprecated-inline-template', ERROR) // 3️⃣
    // .addRule('vue/no-deprecated-props-default-this', ERROR) // 3️⃣
    // .addRule('vue/no-deprecated-router-link-tag-prop', ERROR) // 3️⃣
    .addRule('vue/no-deprecated-scope-attribute', isLess2_5 ? OFF : ERROR) // 3️⃣ deprecated in 2.5.0
    .addRule('vue/no-deprecated-slot-attribute', isLess2_6 ? OFF : ERROR) // 3️⃣ deprecated in 2.6.0
    .addRule('vue/no-deprecated-slot-scope-attribute', isLess2_6 ? OFF : ERROR) // 3️⃣ deprecated in 2.6.0
    // .addRule('vue/no-deprecated-v-bind-sync', ERROR) // 3️⃣
    .addRule('vue/no-deprecated-v-is', isLess3_1 ? OFF : ERROR) // 3️⃣ deprecated in 3.1.0
    // .addRule('vue/no-deprecated-v-on-native-modifier', ERROR) // 3️⃣
    // .addRule('vue/no-deprecated-v-on-number-modifiers', ERROR) // 3️⃣
    // .addRule('vue/no-deprecated-vue-config-keycodes', ERROR) // 3️⃣
    // .addRule('vue/no-dupe-keys', ERROR)
    // .addRule('vue/no-dupe-v-else-if', ERROR)
    // .addRule('vue/no-duplicate-attributes', ERROR)
    // .addRule('vue/no-export-in-script-setup', ERROR)
    // .addRule('vue/no-expose-after-await', ERROR) // 3️⃣
    // .addRule('vue/no-lifecycle-after-await', ERROR) // 3️⃣
    // .addRule('vue/no-mutating-props', ERROR)
    // .addRule('vue/no-parsing-error', ERROR)
    // .addRule('vue/no-ref-as-operand', ERROR)
    // .addRule('vue/no-reserved-component-names', ERROR)
    // .addRule('vue/no-reserved-keys', ERROR)
    // .addRule('vue/no-reserved-props', ERROR)
    // .addRule('vue/no-shared-component-data', ERROR)
    // .addRule('vue/no-side-effects-in-computed-properties', ERROR)
    // .addRule('vue/no-template-key', ERROR)
    // .addRule('vue/no-textarea-mustache', ERROR)
    // .addRule('vue/no-unused-components', ERROR)
    // .addRule('vue/no-unused-vars', ERROR)
    // .addRule('vue/no-use-computed-property-like-method', ERROR)
    // .addRule('vue/no-use-v-if-with-v-for', ERROR)
    // .addRule('vue/no-useless-template-attributes', ERROR)
    // .addRule('vue/no-v-for-template-key-on-child', ERROR) // 3️⃣
    // .addRule('vue/no-v-text-v-html-on-component', ERROR)
    // .addRule('vue/no-watch-after-await', ERROR) // 3️⃣
    // .addRule('vue/prefer-import-from-vue', ERROR) // 3️⃣
    // .addRule('vue/require-component-is', ERROR)
    // .addRule('vue/require-prop-type-constructor', ERROR)
    // .addRule('vue/require-render-return', ERROR)
    // .addRule('vue/require-slots-as-functions', ERROR) // 3️⃣
    // .addRule('vue/require-toggle-inside-transition', ERROR) // 3️⃣
    // .addRule('vue/require-v-for-key', ERROR)
    // .addRule('vue/require-valid-default-prop', ERROR)
    // .addRule('vue/return-in-computed-property', ERROR)
    // .addRule('vue/return-in-emits-validator', ERROR)
    // .addRule('vue/use-v-on-exact', ERROR)
    // .addRule('vue/valid-attribute-name', ERROR)
    // .addRule('vue/valid-define-emits', ERROR)
    // .addRule('vue/valid-define-props', ERROR)
    // .addRule('vue/valid-next-tick', ERROR)
    // .addRule('vue/valid-template-root', ERROR)
    // .addRule('vue/valid-v-bind', ERROR)
    // .addRule('vue/valid-v-cloak', ERROR)
    // .addRule('vue/valid-v-else-if', ERROR)
    // .addRule('vue/valid-v-else', ERROR)
    // .addRule('vue/valid-v-for', ERROR)
    // .addRule('vue/valid-v-html', ERROR)
    // .addRule('vue/valid-v-if', ERROR)
    // .addRule('vue/valid-v-is', ERROR) // 3️⃣
    // .addRule('vue/valid-v-memo', ERROR) // 3️⃣
    // .addRule('vue/valid-v-model', ERROR)
    // .addRule('vue/valid-v-on', ERROR)
    // .addRule('vue/valid-v-once', ERROR)
    // .addRule('vue/valid-v-pre', ERROR)
    // .addRule('vue/valid-v-show', ERROR)
    // .addRule('vue/valid-v-slot', ERROR)
    // .addRule('vue/valid-v-text', ERROR)
    // 🟢 Priority B: Strongly Recommended
    // .addRule('vue/attribute-hyphenation', ERROR)
    // .addRule('vue/component-definition-name-casing', ERROR)
    // .addRule('vue/first-attribute-linebreak', ERROR)
    // .addRule('vue/html-closing-bracket-newline', ERROR)
    // .addRule('vue/html-closing-bracket-spacing', ERROR)
    // .addRule('vue/html-end-tags', ERROR)
    // .addRule('vue/html-indent', ERROR)
    // .addRule('vue/html-quotes', ERROR)
    .addRule('vue/html-self-closing', ERROR, [
      {
        html: {
          void: 'any', // TODO Setting other value here for `void` would conflict with Prettier, default is `never`
          normal: 'never',
          component: 'never',
        },
      },
    ])
    // .addRule('vue/max-attributes-per-line', ERROR)
    // .addRule('vue/multiline-html-element-content-newline', ERROR)
    // .addRule('vue/mustache-interpolation-spacing', ERROR)
    // .addRule('vue/no-multi-spaces', ERROR)
    // .addRule('vue/no-spaces-around-equal-signs-in-attribute', ERROR)
    // .addRule('vue/no-template-shadow', ERROR)
    // .addRule('vue/one-component-per-file', ERROR)
    // .addRule('vue/prop-name-casing', ERROR)
    .addRule('vue/require-default-prop', OFF)
    // .addRule('vue/require-explicit-emits', ERROR) // 3️⃣
    // .addRule('vue/require-prop-types', ERROR)
    // .addRule('vue/singleline-html-element-content-newline', ERROR)
    .addRule('vue/v-bind-style', ERROR, [
      'shorthand',
      {
        ...(isMin3_4 && {sameNameShorthand: 'always'}),
      },
    ])
    // .addRule('vue/v-on-event-hyphenation', ERROR) // 3️⃣
    // .addRule('vue/v-on-style', ERROR)
    // .addRule('vue/v-slot-style', ERROR)
    // 🟢 Priority C: Recommended
    // .addRule('vue/attributes-order', ERROR)
    // .addRule('vue/no-lone-template', ERROR)
    // .addRule('vue/no-multiple-slot-args', ERROR)
    // .addRule('vue/no-v-html', ERROR)
    // .addRule('vue/order-in-components', ERROR)
    // .addRule('vue/this-in-template', ERROR)
    // 🟢 Uncategorized
    .addRule('vue/block-lang', ERROR, [
      {
        script: {
          lang: 'ts',
          ...(enforceTypescriptInScriptSection !== true && {allowNoLang: true}),
        },
      },
    ])
    .addRule('vue/block-order', ERROR, [
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
    // .addRule('vue/block-tag-newline', OFF)
    .addRule('vue/component-api-style', options.enforceApiStyle == null ? OFF : ERROR, [
      [
        options.enforceApiStyle === 'setup' ? 'script-setup' : 'options',
        // allows Composition API (not <script setup>)
        isVue2 ? 'composition-vue2' : 'composition',
      ],
    ])
    .addRule('vue/component-name-in-template-casing', ERROR, [
      'kebab-case',
      {
        registeredComponentsOnly: false,
        ignores: ['/^[A-Z][a-z]+$/' /* Single word components must start with a capital letter */],
      },
    ])
    .addRule('vue/component-options-name-casing', ERROR, ['PascalCase' /* default */])
    .addRule('vue/custom-event-name-casing', ERROR, ['kebab-case' /* default is `camelCase` */])
    .addRule('vue/define-emits-declaration', ERROR, [
      isMin3_3 ? 'type-literal' /* shorter syntax */ : 'type-based' /* default */,
    ])
    .addRule('vue/define-macros-order', ERROR, [
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
    .addRule('vue/define-props-declaration', ERROR, [
      options.enforcePropsDeclarationStyle ?? 'runtime',
    ])
    // .addRule('vue/enforce-style-attribute', OFF)
    .addRule('vue/html-button-has-type', ERROR)
    // .addRule('vue/html-comment-content-newline', OFF)
    // .addRule('vue/html-comment-content-spacing', OFF)
    // .addRule('vue/html-comment-indent', OFF)
    // .addRule('vue/match-component-file-name', OFF)
    // .addRule('vue/match-component-import-name', OFF)
    // .addRule('vue/max-lines-per-block', OFF)
    // .addRule('vue/max-props', OFF) // >=9.28.0
    // .addRule('vue/max-template-depth', OFF) // >=9.28.0
    // .addRule('vue/new-line-between-multi-line-property', OFF)
    // .addRule('vue/next-tick-style', OFF)
    // .addRule('vue/no-bare-strings-in-template', OFF)
    // .addRule('vue/no-boolean-default', OFF)
    .addRule('vue/no-deprecated-model-definition', isVue3 ? ERROR : OFF)
    .addRule('vue/no-duplicate-attr-inheritance', ERROR)
    .addRule('vue/no-empty-component-block', ERROR)
    .addRule('vue/no-multiple-objects-in-class', ERROR)
    .addRule('vue/no-potential-component-option-typo', ERROR)
    .addRule('vue/no-ref-object-reactivity-loss', ERROR)
    .addRule('vue/no-required-prop-with-default', ERROR)
    // .addRule('vue/no-restricted-block', OFF)
    // .addRule('vue/no-restricted-call-after-await', OFF)
    // .addRule('vue/no-restricted-class', OFF)
    // .addRule('vue/no-restricted-component-names', OFF)
    // .addRule('vue/no-restricted-component-options', OFF)
    // .addRule('vue/no-restricted-custom-event', OFF)
    .addRule('vue/no-restricted-html-elements', ERROR, DEPRECATED_HTML_TAGS)
    // .addRule('vue/no-restricted-props', OFF)
    // .addRule('vue/no-restricted-static-attribute', OFF)
    // .addRule('vue/no-restricted-v-bind', OFF)
    // .addRule('vue/no-restricted-v-on', OFF)
    // .addRule('vue/no-root-v-if', OFF)
    .addRule('vue/no-setup-props-reactivity-loss', ERROR)
    // .addRule('vue/no-static-inline-styles', OFF)
    // .addRule('vue/no-template-target-blank', OFF)
    .addRule('vue/no-this-in-before-route-enter', ERROR)
    .addRule('vue/no-undef-components', ERROR, [
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
    // .addRule('vue/no-undef-properties', OFF)
    .addRule('vue/no-unsupported-features', ERROR, [
      {version: `^${options.fullVersion || majorVersion}`},
    ])
    .addRule('vue/no-unused-emit-declarations', ERROR)
    // .addRule('vue/no-unused-properties', OFF)
    .addRule('vue/no-unused-refs', ERROR)
    .addRule('vue/no-use-v-else-with-v-for', ERROR)
    .addRule('vue/no-useless-mustaches', ERROR)
    .addRule('vue/no-useless-v-bind', ERROR)
    // .addRule('vue/no-v-text', OFF)
    .addRule('vue/padding-line-between-blocks', ERROR)
    // .addRule('vue/padding-line-between-tags', OFF)
    .addRule('vue/padding-lines-in-component-definition', ERROR, [
      {
        withinOption: {
          // TODO understand the difference between `betweenItems` and `withinEach`: https://eslint.vuejs.org/rules/padding-lines-in-component-definition.html
          props: 'ignore',
        },
      },
    ])
    .addRule('vue/prefer-define-options', isMin3_3 ? ERROR : OFF)
    .addRule('vue/prefer-prop-type-boolean-first', ERROR)
    .addRule('vue/prefer-separate-static-class', ERROR)
    .addRule('vue/prefer-true-attribute-shorthand', ERROR)
    .addRule('vue/require-default-export', ERROR) // >=9.28.0
    .addRule('vue/require-direct-export', ERROR)
    // .addRule('vue/require-emit-validator', OFF)
    .addRule('vue/require-explicit-slots', isMin3_3 ? ERROR : OFF)
    // .addRule('vue/require-expose', OFF)
    .addRule('vue/require-macro-variable-name', ERROR)
    // .addRule('vue/require-name-property', OFF)
    // .addRule('vue/require-prop-comment', OFF)
    .addRule('vue/require-typed-object-prop', ERROR)
    .addRule('vue/require-typed-ref', ERROR)
    // .addRule('vue/script-indent', OFF)
    // .addRule('vue/sort-keys', OFF)
    // .addRule('vue/static-class-names-order', OFF)
    .addRule('vue/v-for-delimiter-style', ERROR, ['in' /* default */])
    // This rule is not required in Vue 3, as the key is automatically assigned to the elements.
    .addRule('vue/v-for-delimiter-style', isVue2 ? ERROR : OFF)
    // TODO change to [inline, inline-function] once this is landed: https://github.com/vuejs/eslint-plugin-vue/issues/2460
    .addRule('vue/v-on-handler-style', ERROR, ['inline'])
    .addRule('vue/valid-define-options', isMin3_3 ? ERROR : OFF)
    // 🟢 Extension Rules
    // .addRule('vue/array-bracket-newline', OFF)
    // .addRule('vue/array-bracket-spacing', OFF)
    // .addRule('vue/array-element-newline', OFF)
    // .addRule('vue/arrow-spacing', OFF)
    // .addRule('vue/block-spacing', OFF)
    // .addRule('vue/brace-style', OFF)
    .addRule('vue/camelcase', ERROR, RULE_CAMELCASE_OPTIONS)
    // .addRule('vue/comma-dangle', OFF)
    // .addRule('vue/comma-spacing', OFF)
    // .addRule('vue/comma-style', OFF)
    // .addRule('vue/dot-location', OFF)
    .addRule(
      'vue/dot-notation',
      options.noPropertyAccessFromIndexSignatureSetInTsconfigForVueFiles ? OFF : ERROR,
    )
    .addRule('vue/eqeqeq', ERROR, RULE_EQEQEQ_OPTIONS)
    // .addRule('vue/func-call-spacing', OFF)
    // .addRule('vue/key-spacing', OFF)
    // .addRule('vue/keyword-spacing', OFF)
    // .addRule('vue/max-len', OFF)
    // .addRule('vue/multiline-ternary', OFF)
    .addRule('vue/no-console', ERROR)
    .addRule('vue/no-constant-condition', WARNING)
    .addRule('vue/no-empty-pattern', ERROR)
    // .addRule('vue/no-extra-parens', OFF)
    .addRule('vue/no-irregular-whitespace', ERROR)
    .addRule('vue/no-loss-of-precision', ERROR)
    // .addRule('vue/no-restricted-syntax', OFF)
    .addRule('vue/no-sparse-arrays', ERROR)
    .addRule('vue/no-useless-concat', ERROR)
    // .addRule('vue/object-curly-newline', OFF)
    // .addRule('vue/object-curly-spacing', OFF)
    // .addRule('vue/object-property-newline', OFF)
    .addRule('vue/object-shorthand', ERROR)
    // .addRule('vue/operator-linebreak', OFF)
    .addRule('vue/prefer-template', ERROR)
    // .addRule('vue/quote-props', OFF)
    // .addRule('vue/space-in-parens', OFF)
    // .addRule('vue/space-infix-ops', OFF)
    // .addRule('vue/space-unary-ops', OFF)
    // .addRule('vue/template-curly-spacing', OFF)
    // 🔵 Not working great in Vue files
    .addAnyRule('@typescript-eslint/prefer-function-type', OFF)
    .addAnyRule('@typescript-eslint/unified-signatures', OFF)
    .addAnyRule('import/first', OFF) // May be wrong if multiple <script> blocks are present
    .addAnyRule('import/no-default-export', OFF)
    .addAnyRule('no-useless-assignment', OFF) // False positives in script setup
    .addOverrides();

  builder
    .addConfig('vue/allow-single-word-component-names', {
      files: [
        joinPaths([options.nuxtOrVueProjectDir, 'pages/**/*.vue']),
        joinPaths([options.nuxtOrVueProjectDir, 'views/**/*.vue']),
        isNuxtEnabled && [nuxtLayoutsFilesGlob, 'app.vue', 'error.vue'],

        options.doNotRequireComponentNamesToBeMultiWordForPatterns,
      ]
        .flat()
        .filter((v) => v !== false && v != null),
    })
    .addRule('vue/multi-word-component-names', OFF);

  const vueAllowImplicitSlotsConfig = builder.addConfig('vue/allow-implicit-slots', {
    files: [nuxtLayoutsFilesGlob],
  });
  if (isNuxtEnabled) {
    vueAllowImplicitSlotsConfig.addRule('vue/require-explicit-slots', OFF);
  }

  builder
    .addConfig('vue/allow-default-export', {
      files: [
        GLOB_VUE,
        isNuxtEnabled && [
          joinPaths([options.nuxtOrVueProjectDir, 'plugins/**/*.*']),
          joinPaths([options.nuxtOrVueProjectDir, 'server/**/*.*']),
        ],
      ]
        .flat()
        .filter((v) => v !== false),
    })
    .addAnyRule('import/no-default-export', OFF);

  const a11yConfig = builder.addConfig('vue/a11y', {
    files,
    plugins: {
      'vuejs-accessibility': eslintPluginVueA11y,
    },
  });
  if (a11y) {
    a11yConfig
      .addBulkRules(
        eslintPluginVueA11y.configs['flat/recommended'].find((v) => 'rules' in v)?.rules,
      )
      // .addRule('vuejs-accessibility/alt-text', ERROR)
      // .addRule('vuejs-accessibility/anchor-has-content', ERROR)
      // .addRule('vuejs-accessibility/aria-props', ERROR)
      // .addRule('vuejs-accessibility/aria-role', ERROR)
      // .addRule('vuejs-accessibility/aria-unsupported-elements', ERROR)
      // .addRule('vuejs-accessibility/click-events-have-key-events', ERROR)
      // .addRule('vuejs-accessibility/form-control-has-label', ERROR)
      // .addRule('vuejs-accessibility/heading-has-content', ERROR)
      // .addRule('vuejs-accessibility/iframe-has-title', ERROR)
      // .addRule('vuejs-accessibility/interactive-supports-focus', ERROR)
      .addRule('vuejs-accessibility/label-has-for', ERROR, [{allowChildren: true}])
      // .addRule('vuejs-accessibility/media-has-caption', ERROR)
      // .addRule('vuejs-accessibility/mouse-events-have-key-events', ERROR)
      // .addRule('vuejs-accessibility/no-access-key', ERROR)
      // .addRule('vuejs-accessibility/no-autofocus', ERROR)
      // .addRule('vuejs-accessibility/no-distracting-elements', ERROR)
      // .addRule('vuejs-accessibility/no-onchange', ERROR)
      // .addRule('vuejs-accessibility/no-redundant-roles', ERROR)
      // .addRule('vuejs-accessibility/no-static-element-interactions', ERROR)
      // .addRule('vuejs-accessibility/role-has-required-aria-props', ERROR)
      // .addRule('vuejs-accessibility/tabindex-no-positive', ERROR)
      .addBulkRules(options.overridesA11y);
  }

  const piniaBuilder = new ConfigEntryBuilder<'pinia'>({}, internalOptions);
  const piniaConfig = piniaBuilder.addConfig(['pinia', {includeDefaultFilesAndIgnores: true}], {
    plugins: {
      // @ts-expect-error types mismatch
      pinia: eslintPluginPinia,
    },
  });
  if (pinia) {
    piniaConfig
      .addBulkRules(eslintPluginPinia.configs['recommended-flat'].rules)
      // .addRule('pinia/never-export-initialized-store', ERROR)
      // .addRule('pinia/no-duplicate-store-ids', ERROR)
      // .addRule('pinia/no-return-global-properties', ERROR)
      // .addRule('pinia/no-store-to-refs-in-store', ERROR)
      .addRule('pinia/prefer-single-store-per-file', ERROR)
      .addRule('pinia/prefer-use-store-naming-convention', ERROR, [
        {
          checkStoreNameMismatch: true,
          storeSuffix:
            typeof pinia === 'object' && pinia.storesNameSuffix != null
              ? pinia.storesNameSuffix
              : DEFAULT_PINIA_STORE_NAME_SUFFIX,
        },
      ])
      // .addRule('pinia/require-setup-store-properties-export', ERROR)
      .addBulkRules(options.overridesPinia);
  }

  return [...builder.getAllConfigs(), ...piniaBuilder.getAllConfigs()];
};

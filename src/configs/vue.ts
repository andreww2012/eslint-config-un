import eslintPluginPinia from 'eslint-plugin-pinia';
// @ts-expect-error no typings
import eslintPluginVue from 'eslint-plugin-vue';
import eslintPluginVueA11y from 'eslint-plugin-vuejs-accessibility';
import globals from 'globals';
import parserVue from 'vue-eslint-parser';
import {ERROR, GLOB_VUE, OFF} from '../constants';
import type {
  ConfigSharedOptions,
  FlatConfigEntry,
  InternalConfigOptions,
  RuleOverrides,
} from '../types';
import {arraify, genFlatConfigEntryName, warnUnlessForcedError} from '../utils';
import {RULE_CAMELCASE_OPTIONS, RULE_EQEQEQ_OPTIONS} from './js';

type WellKnownSfcBlocks =
  | 'template'
  | 'script'
  | 'script:not([setup])'
  | 'script[setup]'
  | 'style'
  | 'style:not([scoped])'
  | 'style[scoped]';

export interface VueEslintConfigOptions extends ConfigSharedOptions<`vue/${string}`> {
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
   * Will be merged with `['router-link', 'router-view']`
   * This default list will include `/^nuxt-/` if `nuxtMajorVersion` if not false
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
  overridesA11y?: RuleOverrides<`vuejs-accessibility/${string}`>;

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
  overridesPinia?: RuleOverrides<`pinia/${string}`>;
}

// prettier-ignore
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element#obsolete_and_deprecated_elements
const DEPRECATED_HTML_TAGS = [
  'acronym', 'big', 'center', 'content', 'dir', 'font', 'frame', 'frameset', 'image', 'marquee', 'menuitem', 'nobr', 'noembed', 'noframes', 'param', 'plaintext', 'rb', 'rtc', 'shadow', 'strike', 'tt', 'xmp',
];

export const vueEslintConfig = (
  options: VueEslintConfigOptions,
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const {majorVersion, enforceTypescriptInScriptSection, a11y = true} = options;

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

  // LEGEND:
  // 3️⃣ = Only in Vue 3 recommended
  const rules: FlatConfigEntry['rules'] = {
    // 🔵 Disable deprecated rules from Recommended

    'vue/component-tags-order': OFF,

    // 🔵 Base

    'vue/comment-directive': [
      ERROR,
      {reportUnusedDisableDirectives: true}, // false by default
    ],
    // 'vue/jsx-uses-vars': ERROR,

    // 🔵 Priority A: Essential

    // 'vue/multi-word-component-names': ERROR,
    // 'vue/no-arrow-functions-in-watch': ERROR,
    // 'vue/no-async-in-computed-properties': ERROR,
    // 'vue/no-child-content': ERROR,
    // 'vue/no-computed-properties-in-data': ERROR,
    // 'vue/no-deprecated-data-object-declaration': ERROR, // 3️⃣
    // 'vue/no-deprecated-destroyed-lifecycle': ERROR, // 3️⃣
    // 'vue/no-deprecated-dollar-listeners-api': ERROR, // 3️⃣
    // 'vue/no-deprecated-dollar-scopedslots-api': ERROR, // 3️⃣
    // 'vue/no-deprecated-events-api': ERROR, // 3️⃣
    // 'vue/no-deprecated-filter': ERROR, // 3️⃣
    // 'vue/no-deprecated-functional-template': ERROR, // 3️⃣
    // 'vue/no-deprecated-html-element-is': ERROR, // 3️⃣
    // 'vue/no-deprecated-inline-template': ERROR, // 3️⃣
    // 'vue/no-deprecated-props-default-this': ERROR, // 3️⃣
    // 'vue/no-deprecated-router-link-tag-prop': ERROR, // 3️⃣
    'vue/no-deprecated-scope-attribute': isLess2_5 ? OFF : ERROR, // 3️⃣ deprecated in 2.5.0
    'vue/no-deprecated-slot-attribute': isLess2_6 ? OFF : ERROR, // 3️⃣ deprecated in 2.6.0
    'vue/no-deprecated-slot-scope-attribute': isLess2_6 ? OFF : ERROR, // 3️⃣ deprecated in 2.6.0
    // 'vue/no-deprecated-v-bind-sync': ERROR, // 3️⃣
    'vue/no-deprecated-v-is': isLess3_1 ? OFF : ERROR, // 3️⃣ deprecated in 3.1.0
    // 'vue/no-deprecated-v-on-native-modifier': ERROR, // 3️⃣
    // 'vue/no-deprecated-v-on-number-modifiers': ERROR, // 3️⃣
    // 'vue/no-deprecated-vue-config-keycodes': ERROR, // 3️⃣
    // 'vue/no-dupe-keys': ERROR,
    // 'vue/no-dupe-v-else-if': ERROR,
    // 'vue/no-duplicate-attributes': ERROR,
    // 'vue/no-export-in-script-setup': ERROR,
    // 'vue/no-expose-after-await': ERROR, // 3️⃣
    // 'vue/no-lifecycle-after-await': ERROR, // 3️⃣
    // 'vue/no-mutating-props': ERROR,
    // 'vue/no-parsing-error': ERROR,
    // 'vue/no-ref-as-operand': ERROR,
    // 'vue/no-reserved-component-names': ERROR,
    // 'vue/no-reserved-keys': ERROR,
    // 'vue/no-reserved-props': ERROR,
    // 'vue/no-shared-component-data': ERROR,
    // 'vue/no-side-effects-in-computed-properties': ERROR,
    // 'vue/no-template-key': ERROR,
    // 'vue/no-textarea-mustache': ERROR,
    // 'vue/no-unused-components': ERROR,
    // 'vue/no-unused-vars': ERROR,
    // 'vue/no-use-computed-property-like-method': ERROR,
    // 'vue/no-use-v-if-with-v-for': ERROR,
    // 'vue/no-useless-template-attributes': ERROR,
    // 'vue/no-v-for-template-key-on-child': ERROR, // 3️⃣
    // 'vue/no-v-text-v-html-on-component': ERROR,
    // 'vue/no-watch-after-await': ERROR, // 3️⃣
    // 'vue/prefer-import-from-vue': ERROR, // 3️⃣
    // 'vue/require-component-is': ERROR,
    // 'vue/require-prop-type-constructor': ERROR,
    // 'vue/require-render-return': ERROR,
    // 'vue/require-slots-as-functions': ERROR, // 3️⃣
    // 'vue/require-toggle-inside-transition': ERROR, // 3️⃣
    // 'vue/require-v-for-key': ERROR,
    // 'vue/require-valid-default-prop': ERROR,
    // 'vue/return-in-computed-property': ERROR,
    // 'vue/return-in-emits-validator': ERROR,
    // 'vue/use-v-on-exact': ERROR,
    // 'vue/valid-attribute-name': ERROR,
    // 'vue/valid-define-emits': ERROR,
    // 'vue/valid-define-props': ERROR,
    // 'vue/valid-next-tick': ERROR,
    // 'vue/valid-template-root': ERROR,
    // 'vue/valid-v-bind': ERROR,
    // 'vue/valid-v-cloak': ERROR,
    // 'vue/valid-v-else-if': ERROR,
    // 'vue/valid-v-else': ERROR,
    // 'vue/valid-v-for': ERROR,
    // 'vue/valid-v-html': ERROR,
    // 'vue/valid-v-if': ERROR,
    // 'vue/valid-v-is': ERROR, // 3️⃣
    // 'vue/valid-v-memo': ERROR, // 3️⃣
    // 'vue/valid-v-model': ERROR,
    // 'vue/valid-v-on': ERROR,
    // 'vue/valid-v-once': ERROR,
    // 'vue/valid-v-pre': ERROR,
    // 'vue/valid-v-show': ERROR,
    // 'vue/valid-v-slot': ERROR,
    // 'vue/valid-v-text': ERROR,

    // 🔵 Priority B: Strongly Recommended

    // 'vue/attribute-hyphenation': ERROR,
    // 'vue/component-definition-name-casing': ERROR,
    // 'vue/first-attribute-linebreak': ERROR,
    // 'vue/html-closing-bracket-newline': ERROR,
    // 'vue/html-closing-bracket-spacing': ERROR,
    // 'vue/html-end-tags': ERROR,
    // 'vue/html-indent': ERROR,
    // 'vue/html-quotes': ERROR,
    'vue/html-self-closing': [
      ERROR,
      {
        html: {
          void: 'any', // TODO Setting other value here for `void` would conflict with Prettier, default is `never`
          normal: 'never',
          component: 'never',
        },
      },
    ],
    // 'vue/max-attributes-per-line': ERROR,
    // 'vue/multiline-html-element-content-newline': ERROR,
    // 'vue/mustache-interpolation-spacing': ERROR,
    // 'vue/no-multi-spaces': ERROR,
    // 'vue/no-spaces-around-equal-signs-in-attribute': ERROR,
    // 'vue/no-template-shadow': ERROR,
    // 'vue/one-component-per-file': ERROR,
    // 'vue/prop-name-casing': ERROR,
    'vue/require-default-prop': OFF,
    // 'vue/require-explicit-emits': ERROR, // 3️⃣
    // 'vue/require-prop-types': ERROR,
    // 'vue/singleline-html-element-content-newline': ERROR,
    'vue/v-bind-style': [
      ERROR,
      'shorthand',
      {
        ...(isMin3_4 && {sameNameShorthand: 'always'}),
      },
    ],
    // 'vue/v-on-event-hyphenation': ERROR, // 3️⃣
    // 'vue/v-on-style': ERROR,
    // 'vue/v-slot-style': ERROR,

    // 🔵 Priority C: Recommended

    // 'vue/attributes-order': ERROR,
    // 'vue/no-lone-template': ERROR,
    // 'vue/no-multiple-slot-args': ERROR,
    // 'vue/no-v-html': ERROR,
    // 'vue/order-in-components': ERROR,
    // 'vue/this-in-template': ERROR,

    // 🔵 Uncategorized

    'vue/block-lang': [
      ERROR,
      {
        script: {
          lang: 'ts',
          ...(enforceTypescriptInScriptSection !== true && {allowNoLang: true}),
        },
      },
    ],
    'vue/block-order': [
      ERROR,
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
    ],
    // 'vue/block-tag-newline': OFF,
    ...(options.enforceApiStyle != null && {
      'vue/component-api-style': [
        ERROR,
        [
          options.enforceApiStyle === 'setup' ? 'script-setup' : 'options',
          // allows Composition API (not <script setup>)
          isVue2 ? 'composition-vue2' : 'composition',
        ],
      ],
    }),
    'vue/component-name-in-template-casing': [
      ERROR,
      'kebab-case',
      {
        registeredComponentsOnly: false,
        ignores: ['/^[A-Z][a-z]+$/' /* Single word components must start with a capital letter */],
      },
    ],
    'vue/component-options-name-casing': [ERROR, 'PascalCase' /* default */],
    'vue/custom-event-name-casing': [ERROR, 'kebab-case' /* default is `camelCase` */],
    'vue/define-emits-declaration': [
      ERROR,
      isMin3_3 ? 'type-literal' /* shorter syntax */ : 'type-based' /* default */,
    ],
    'vue/define-macros-order': [
      ERROR,
      {
        order: ['defineOptions', 'defineModel', 'defineProps', 'defineEmits', 'defineSlots'],
        ...(isMin3_4 && {defineExposeLast: true}),
      },
    ],
    'vue/define-props-declaration': [ERROR, options.enforcePropsDeclarationStyle ?? 'runtime'],
    // 'vue/enforce-style-attribute': OFF,
    'vue/html-button-has-type': ERROR,
    // 'vue/html-comment-content-newline': OFF,
    // 'vue/html-comment-content-spacing': OFF,
    // 'vue/html-comment-indent': OFF,
    // 'vue/match-component-file-name': OFF,
    // 'vue/match-component-import-name': OFF,
    // 'vue/max-lines-per-block': OFF,
    // 'vue/new-line-between-multi-line-property': OFF,
    // 'vue/next-tick-style': OFF,
    // 'vue/no-bare-strings-in-template': OFF,
    // 'vue/no-boolean-default': OFF,
    ...(isVue3 && {'vue/no-deprecated-model-definition': ERROR}),
    'vue/no-duplicate-attr-inheritance': ERROR,
    'vue/no-empty-component-block': ERROR,
    'vue/no-multiple-objects-in-class': ERROR,
    'vue/no-potential-component-option-typo': ERROR,
    'vue/no-ref-object-reactivity-loss': ERROR,
    'vue/no-required-prop-with-default': ERROR,
    // 'vue/no-restricted-block': OFF,
    // 'vue/no-restricted-call-after-await': OFF,
    // 'vue/no-restricted-class': OFF,
    // 'vue/no-restricted-component-names': OFF,
    // 'vue/no-restricted-component-options': OFF,
    // 'vue/no-restricted-custom-event': OFF,
    'vue/no-restricted-html-elements': [ERROR, ...DEPRECATED_HTML_TAGS],
    // 'vue/no-restricted-props': OFF,
    // 'vue/no-restricted-static-attribute': OFF,
    // 'vue/no-restricted-v-bind': OFF,
    // 'vue/no-restricted-v-on': OFF,
    // 'vue/no-root-v-if': OFF,
    'vue/no-setup-props-reactivity-loss': ERROR,
    // 'vue/no-static-inline-styles': OFF,
    // 'vue/no-template-target-blank': OFF,
    'vue/no-this-in-before-route-enter': ERROR,
    'vue/no-undef-components': [
      ERROR,
      {
        ignorePatterns: [
          'router-link',
          'router-view',
          isNuxtEnabled && /^nuxt-/,
          ...(options.knownComponentNames || []),
        ].filter((v) => v !== false),
      },
    ],
    // TODO enable if script setup is enforced and only in JS?
    // 'vue/no-undef-properties': OFF,
    'vue/no-unsupported-features': [ERROR, {version: `^${options.fullVersion || majorVersion}`}],
    'vue/no-unused-emit-declarations': ERROR,
    // 'vue/no-unused-properties': OFF,
    'vue/no-unused-refs': ERROR,
    'vue/no-use-v-else-with-v-for': ERROR,
    'vue/no-useless-mustaches': ERROR,
    'vue/no-useless-v-bind': ERROR,
    // 'vue/no-v-text': OFF,
    'vue/padding-line-between-blocks': ERROR,
    // 'vue/padding-line-between-tags': OFF,
    'vue/padding-lines-in-component-definition': [
      ERROR,
      {
        withinOption: {
          // TODO understand the difference between `betweenItems` and `withinEach`: https://eslint.vuejs.org/rules/padding-lines-in-component-definition.html
          props: 'ignore',
        },
      },
    ],
    ...(isMin3_3 && {
      'vue/prefer-define-options': ERROR,
    }),
    'vue/prefer-prop-type-boolean-first': ERROR,
    'vue/prefer-separate-static-class': ERROR,
    'vue/prefer-true-attribute-shorthand': ERROR,
    'vue/require-direct-export': ERROR,
    // 'vue/require-emit-validator': OFF,
    ...(isMin3_3 && {
      'vue/require-explicit-slots': ERROR,
    }),
    // 'vue/require-expose': OFF,
    'vue/require-macro-variable-name': ERROR,
    // 'vue/require-name-property': OFF,
    // 'vue/require-prop-comment': OFF,
    'vue/require-typed-object-prop': ERROR,
    'vue/require-typed-ref': ERROR,
    // 'vue/script-indent': OFF,
    // 'vue/sort-keys': OFF,
    // 'vue/static-class-names-order': OFF,
    'vue/v-for-delimiter-style': [ERROR, 'in' /* default */],
    // This rule is not required in Vue 3, as the key is automatically assigned to the elements.
    ...(isVue2 && {
      'vue/v-for-delimiter-style': ERROR,
    }),
    // TODO change to [inline, inline-function] once this is landed: https://github.com/vuejs/eslint-plugin-vue/issues/2460
    'vue/v-on-handler-style': [ERROR, 'inline'],
    ...(isMin3_3 && {
      'vue/valid-define-options': ERROR,
    }),

    // 🔵 Extension Rules

    // 'vue/array-bracket-newline': OFF,
    // 'vue/array-bracket-spacing': OFF,
    // 'vue/array-element-newline': OFF,
    // 'vue/arrow-spacing': OFF,
    // 'vue/block-spacing': OFF,
    // 'vue/brace-style': OFF,
    'vue/camelcase': [ERROR, RULE_CAMELCASE_OPTIONS],
    // 'vue/comma-dangle': OFF,
    // 'vue/comma-spacing': OFF,
    // 'vue/comma-style': OFF,
    // 'vue/dot-location': OFF,
    ...(!options.noPropertyAccessFromIndexSignatureSetInTsconfigForVueFiles && {
      'vue/dot-notation': ERROR,
    }),
    'vue/eqeqeq': [ERROR, ...RULE_EQEQEQ_OPTIONS],
    // 'vue/func-call-spacing': OFF,
    // 'vue/key-spacing': OFF,
    // 'vue/keyword-spacing': OFF,
    // 'vue/max-len': OFF,
    // 'vue/multiline-ternary': OFF,
    'vue/no-console': ERROR,
    ...warnUnlessForcedError(internalOptions, 'vue/no-constant-condition'),
    'vue/no-empty-pattern': ERROR,
    // 'vue/no-extra-parens': OFF,
    'vue/no-irregular-whitespace': ERROR,
    'vue/no-loss-of-precision': ERROR,
    // 'vue/no-restricted-syntax': OFF,
    'vue/no-sparse-arrays': ERROR,
    'vue/no-useless-concat': ERROR,
    // 'vue/object-curly-newline': OFF,
    // 'vue/object-curly-spacing': OFF,
    // 'vue/object-property-newline': OFF,
    'vue/object-shorthand': ERROR,
    // 'vue/operator-linebreak': OFF,
    'vue/prefer-template': ERROR,
    // 'vue/quote-props': OFF,
    // 'vue/space-in-parens': OFF,
    // 'vue/space-infix-ops': OFF,
    // 'vue/space-unary-ops': OFF,
    // 'vue/template-curly-spacing': OFF,

    // 🔵 Not working great in Vue files

    '@typescript-eslint/prefer-function-type': OFF,
    '@typescript-eslint/unified-signatures': OFF,
    'import/first': OFF, // May be wrong if multiple <script> blocks are present
    'import/no-default-export': OFF,
    'no-useless-assignment': OFF, // False positives in script setup

    ...options.overrides,
  };

  const nuxtLayoutsFiles = `${options.nuxtOrVueProjectDir}layouts/**/*.vue`;

  return (
    [
      {
        plugins: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          vue: eslintPluginVue,
        },
        name: genFlatConfigEntryName('vue/setup'),
      },

      {
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
        name: genFlatConfigEntryName('vue/setup'),
      },

      {
        files,
        ...(options.ignores && {ignores: options.ignores}),
        rules: {
          ...recommendedRules,
          ...rules,
          ...options.overrides,
        },
        name: genFlatConfigEntryName('vue'),
      },

      {
        files: [
          `${options.nuxtOrVueProjectDir}pages/**/*.vue`,
          `${options.nuxtOrVueProjectDir}views/**/*.vue`,
          isNuxtEnabled && [nuxtLayoutsFiles, 'app.vue', 'error.vue'],

          ...arraify(options.doNotRequireComponentNamesToBeMultiWordForPatterns),
        ].filter((v) => v !== false),
        rules: {
          'vue/multi-word-component-names': OFF,
        },
        name: genFlatConfigEntryName('vue/allow-single-word-component-names'),
      },

      isNuxtEnabled && {
        files: [nuxtLayoutsFiles],
        rules: {
          'vue/require-explicit-slots': OFF,
        },
        name: genFlatConfigEntryName('vue/allow-implicit-slots'),
      },

      {
        files: [
          GLOB_VUE,
          isNuxtEnabled && [
            `${options.nuxtOrVueProjectDir}plugins/**/*.*`,
            `${options.nuxtOrVueProjectDir}server/**/*.*`,
          ],
        ].filter((v) => v !== false),
        rules: {
          'import/no-default-export': OFF,
        },
        name: genFlatConfigEntryName('vue/allow-default-export'),
      },

      a11y && [
        ...eslintPluginVueA11y.configs['flat/recommended'],
        {
          files,
          rules: {
            // 'vuejs-accessibility/alt-text': ERROR,
            // 'vuejs-accessibility/anchor-has-content': ERROR,
            // 'vuejs-accessibility/aria-props': ERROR,
            // 'vuejs-accessibility/aria-role': ERROR,
            // 'vuejs-accessibility/aria-unsupported-elements': ERROR,
            // 'vuejs-accessibility/click-events-have-key-events': ERROR,
            // 'vuejs-accessibility/form-control-has-label': ERROR,
            // 'vuejs-accessibility/heading-has-content': ERROR,
            // 'vuejs-accessibility/iframe-has-title': ERROR,
            // 'vuejs-accessibility/interactive-supports-focus': ERROR,
            // 'vuejs-accessibility/label-has-for': ERROR,
            // 'vuejs-accessibility/media-has-caption': ERROR,
            // 'vuejs-accessibility/mouse-events-have-key-events': ERROR,
            // 'vuejs-accessibility/no-access-key': ERROR,
            // 'vuejs-accessibility/no-autofocus': ERROR,
            // 'vuejs-accessibility/no-distracting-elements': ERROR,
            // 'vuejs-accessibility/no-onchange': ERROR,
            // 'vuejs-accessibility/no-redundant-roles': ERROR,
            // 'vuejs-accessibility/no-static-element-interactions': ERROR,
            // 'vuejs-accessibility/role-has-required-aria-props': ERROR,
            // 'vuejs-accessibility/tabindex-no-positive': ERROR,

            ...options.overridesA11y,
          },
          name: genFlatConfigEntryName('vue/a11y'),
        },
      ],

      options.pinia &&
        ({
          plugins: {
            pinia: eslintPluginPinia,
          },
          rules: {
            ...eslintPluginPinia.configs.recommended.rules,
            // 'pinia/never-export-initialized-store': ERROR,
            // 'pinia/no-duplicate-store-ids': ERROR,
            // 'pinia/no-return-global-properties': ERROR,
            'pinia/prefer-single-store-per-file': ERROR,
            'pinia/prefer-use-store-naming-convention': [
              ERROR,
              {
                checkStoreNameMismatch: true,
                storeSuffix:
                  typeof options.pinia === 'object' ? options.pinia.storesNameSuffix : 'Store',
              },
            ],
            // 'pinia/require-setup-store-properties-export': ERROR,
            ...options.overridesPinia,
          },
          name: genFlatConfigEntryName('pinia'),
        } as FlatConfigEntry),
    ]
      .flat()
      // eslint-disable-next-line no-implicit-coercion
      .filter((v) => !!v)
  );
};

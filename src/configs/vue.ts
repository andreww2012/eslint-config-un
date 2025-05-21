import type Eslint from 'eslint';
import type {Options as EslintProcessorVueBlocksOptions} from 'eslint-processor-vue-blocks';
import globals from 'globals';
import {ERROR, GLOB_JS_TS_EXTENSION, GLOB_VUE, OFF, type RuleSeverity} from '../constants';
import {
  type FlatConfigEntryFilesOrIgnores,
  type RulesRecord,
  type UnConfigOptions,
  createConfigBuilder,
  getRuleUnSeverityAndOptionsFromEntry,
} from '../eslint';
import {pluginsLoaders} from '../plugins';
import type {PrettifyShallow} from '../types';
import {
  assignDefaults,
  doesPackageExist,
  fetchPackageInfo,
  getKeysOfTruthyValues,
  interopDefault,
  joinPaths,
} from '../utils';
import type {UnConfigFn} from './index';

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

export interface VueEslintConfigOptions extends UnConfigOptions<'vue'> {
  /**
   * Enables A11Y (accessibility) rules for Vue SFC templates
   *
   * By default, uses `files` and `ignores` from the parent config.
   * @default true
   */
  configA11y?: boolean | UnConfigOptions<'vuejs-accessibility'>;

  /**
   * Enabled automatically by checking if `pinia` package is installed (at any level). Pass a false value to disable pinia-specific rules.
   * @default true <=> `pinia` package is installed
   */
  configPinia?:
    | boolean
    | UnConfigOptions<
        'pinia',
        {
          /**
           * @default `Store`
           * @see https://github.com/lisilinhart/eslint-plugin-pinia/blob/HEAD/docs/rules/prefer-use-store-naming-convention.md
           */
          storesNameSuffix?: string;
        }
      >;

  /**
   * @default auto-detected
   */
  majorVersion?: 2 | 3;

  /**
   * Enforces the presence of `lang="ts"` in `<script>` sections, see [vue/block-lang](https://eslint.vuejs.org/rules/block-lang.html) rule for more details.
   *
   * Setting this option no anything but `false` also makes all `.vue` (or explicitly specified files if object syntax is used) checked by `ts` config, and by default **BOTH non-type-aware and type-aware** rules will be applied. You can opt out of this behavior or only enable NON-type-aware rules with `typescriptRules` option. Disabling type-aware rules might be beneficial for bigger projects as these rules are known to be quite slow on Vue files.
   * @default true <=> `ts` config is enabled
   */
  enforceTypescriptInScriptSection?:
    | boolean
    | PrettifyShallow<
        FlatConfigEntryFilesOrIgnores & {
          /**
           * What `ts` rules will be applied to the specified `files`. If you want more control over which TypeScript rules are applied to which Vue files, use `ts` config options for that.
           * @default true
           */
          typescriptRules?: boolean | 'only-non-type-aware';
        }
      >;

  /**
   * Almost all [extension rules](https://eslint.vuejs.org/rules/#extension-rules)
   * (with the exceptions listed below) will smartly inherit the corresponding
   * base rule's severity and options. If you want to disable this behavior,
   * set this option to `false`.
   *
   * ### Exceptions
   * - [`no-console`](https://eslint.vuejs.org/rules/no-console.html): all `console` calls
   * are forbidden within the template.
   * - [`dot-notation`](https://eslint.vuejs.org/rules/dot-notation.html) will inherit
   * severity and options unless `noPropertyAccessFromIndexSignatureSetInTsconfigForVueFiles`
   * is set to `true`, in which case the rule will be turned off.
   * - All "stylistic" rules are always turned off: [array-bracket-newline](https://eslint.vuejs.org/rules/array-bracket-newline.html), [array-bracket-spacing](https://eslint.vuejs.org/rules/array-bracket-spacing.html), [array-element-newline](https://eslint.vuejs.org/rules/array-element-newline.html), [arrow-spacing](https://eslint.vuejs.org/rules/arrow-spacing.html), [block-spacing](https://eslint.vuejs.org/rules/block-spacing.html), [brace-style](https://eslint.vuejs.org/rules/brace-style.html), [comma-dangle](https://eslint.vuejs.org/rules/comma-dangle.html), [comma-spacing](https://eslint.vuejs.org/rules/comma-spacing.html), [comma-style](https://eslint.vuejs.org/rules/comma-style.html), [dot-location](https://eslint.vuejs.org/rules/dot-location.html), [func-call-spacing](https://eslint.vuejs.org/rules/func-call-spacing.html), [key-spacing](https://eslint.vuejs.org/rules/key-spacing.html), [keyword-spacing](https://eslint.vuejs.org/rules/keyword-spacing.html), [max-len](https://eslint.vuejs.org/rules/max-len.html), [multiline-ternary](https://eslint.vuejs.org/rules/multiline-ternary.html), [no-extra-parens](https://eslint.vuejs.org/rules/no-extra-parens.html), [object-curly-newline](https://eslint.vuejs.org/rules/object-curly-newline.html), [object-curly-spacing](https://eslint.vuejs.org/rules/object-curly-spacing.html), [object-property-newline](https://eslint.vuejs.org/rules/object-property-newline.html), [operator-linebreak](https://eslint.vuejs.org/rules/operator-linebreak.html), [quote-props](https://eslint.vuejs.org/rules/quote-props.html), [space-in-parens](https://eslint.vuejs.org/rules/space-in-parens.html), [space-infix-ops](https://eslint.vuejs.org/rules/space-infix-ops.html), [space-unary-ops](https://eslint.vuejs.org/rules/space-unary-ops.html), [template-curly-spacing](https://eslint.vuejs.org/rules/template-curly-spacing.html)
   * @default true
   */
  inheritBaseRuleSeverityAndOptionsForExtensionRules?: boolean;

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
   * Enabled automatically by checking if `nuxt` package is installed (at any level). Pass a false value or a Nuxt version to explicitly disable or enable Nuxt-specific rules or tweaks.
   */
  nuxtMajorVersion?: false | 3;

  /**
   * @default ''
   */
  nuxtOrVueProjectDir?: string;

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

const DEFAULT_VUE_FILES: string[] = [GLOB_VUE];

export const vueUnConfig: UnConfigFn<
  'vue',
  unknown,
  [data: {vanillaFinalFlatConfigRules: Partial<RulesRecord>}]
> = async (context, {vanillaFinalFlatConfigRules}) => {
  const [
    {mergeProcessors: mergeEslintProcessors},
    eslintProcessorVueBlocks,
    eslintPluginVue,
    eslintParserVue,
    isPiniaPackageInstalled,
    nuxtPackageInfo,
    {parser: typescriptEslintParser},
  ] = await Promise.all([
    interopDefault(import('eslint-merge-processors')),
    interopDefault(import('eslint-processor-vue-blocks')),
    pluginsLoaders.vue(),
    interopDefault(import('vue-eslint-parser')),
    doesPackageExist('pinia'),
    fetchPackageInfo('nuxt'),
    interopDefault(import('typescript-eslint')),
  ]);

  const isTypescriptEnabled = context.configsMeta.ts.enabled;

  const optionsRaw = context.rootOptions.configs?.vue;

  const vuePackageInfo = context.packagesInfo.vue;
  const vuePackageMajorVersion = vuePackageInfo?.versions.major;

  const optionsResolved = assignDefaults(optionsRaw, {
    files: DEFAULT_VUE_FILES,
    majorVersion:
      vuePackageMajorVersion === 2 || vuePackageMajorVersion === 3 ? vuePackageMajorVersion : 3,
    enforceTypescriptInScriptSection: isTypescriptEnabled,
    configA11y: true,
    configPinia: isPiniaPackageInstalled,
    processSfcBlocks: true,
    reportUnusedDisableDirectives: true,
    enforcePropsDeclarationStyle: 'runtime',
    inheritBaseRuleSeverityAndOptionsForExtensionRules: true,
  } satisfies VueEslintConfigOptions);

  const nuxtMajorVersion =
    optionsResolved.nuxtMajorVersion ?? nuxtPackageInfo?.versions.major ?? null;

  const {
    majorVersion: vueMajorVersion,
    enforceTypescriptInScriptSection,
    configA11y,
    configPinia,
    processSfcBlocks,
    reportUnusedDisableDirectives,
    sfcBlockOrder,
    enforceApiStyle,
    enforcePropsDeclarationStyle,
    inheritBaseRuleSeverityAndOptionsForExtensionRules: inheritFromBase,
  } = optionsResolved;

  const vuePackageFullVersion = vuePackageInfo?.versions.majorAndMinor ?? vueMajorVersion;

  const isVue2 = vueMajorVersion === 2;
  const isVue3 = vueMajorVersion === 3;
  const isMin3_3 = isVue3 && vuePackageFullVersion >= 3.3;
  const isMin3_4 = isVue3 && vuePackageFullVersion >= 3.4;
  const isMin3_5 = isVue3 && vuePackageFullVersion >= 3.5;
  const isLess2_5 = isVue2 && vuePackageFullVersion < 2.5;
  const isLess2_6 = isVue2 && vuePackageFullVersion < 2.6;
  const isLess3_1 = vuePackageFullVersion < 3.1;

  optionsResolved.preferUseTemplateRef ??= isMin3_5;
  const {preferUseTemplateRef} = optionsResolved;

  const isNuxtEnabled = Boolean(nuxtMajorVersion);

  const inNuxtAppDir = joinPaths.bind(null, optionsResolved.nuxtOrVueProjectDir);
  const nuxtLayoutsFilesGlob: string = inNuxtAppDir('layouts/**/*.vue');

  const configBuilder = createConfigBuilder(context, optionsResolved, 'vue');

  configBuilder?.addConfig(['vue/setup', {doNotIgnoreMarkdown: true}], {
    files: [...DEFAULT_VUE_FILES, ...optionsResolved.files],
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
      parser: eslintParserVue,
      parserOptions: {
        parser: isTypescriptEnabled ? typescriptEslintParser : undefined,
        sourceType: 'module' as const,
      },
    },
  });

  const vue2Severity = (severity: RuleSeverity) => (isVue2 ? severity : OFF);
  const vue3Severity = (severity: RuleSeverity) => (isVue3 ? severity : OFF);

  // Legend:
  // 3️⃣ = in recommended/vue-3
  // 2️⃣ = in recommended/vue-2

  configBuilder
    ?.addConfig(['vue', {includeDefaultFilesAndIgnores: true, filesFallback: DEFAULT_VUE_FILES}])
    /* Category: Base */
    .addRule('comment-directive', ERROR, [
      // false by default
      {reportUnusedDisableDirectives},
    ]) // 3️⃣2️⃣
    .addRule('jsx-uses-vars', ERROR) // 3️⃣2️⃣
    /* Category: Priority A: Essential */
    .addRule('multi-word-component-names', ERROR) // 3️⃣2️⃣
    .addRule('no-arrow-functions-in-watch', ERROR) // 3️⃣2️⃣
    .addRule('no-async-in-computed-properties', ERROR) // 3️⃣2️⃣
    .addRule('no-child-content', ERROR) // 3️⃣2️⃣
    .addRule('no-computed-properties-in-data', ERROR) // 3️⃣2️⃣
    .addRule('no-custom-modifiers-on-v-model', vue2Severity(ERROR)) // 2️⃣
    .addRule('no-multiple-template-root', vue2Severity(ERROR)) // 2️⃣
    .addRule('no-deprecated-data-object-declaration', vue3Severity(ERROR)) // 3️⃣
    .addRule('no-deprecated-destroyed-lifecycle', vue3Severity(ERROR)) // 3️⃣
    .addRule('no-deprecated-dollar-listeners-api', vue3Severity(ERROR)) // 3️⃣
    .addRule('no-deprecated-dollar-scopedslots-api', vue3Severity(ERROR)) // 3️⃣
    .addRule('no-deprecated-events-api', vue3Severity(ERROR)) // 3️⃣
    .addRule('no-deprecated-filter', vue3Severity(ERROR)) // 3️⃣
    .addRule('no-deprecated-functional-template', vue3Severity(ERROR)) // 3️⃣
    .addRule('no-deprecated-html-element-is', vue3Severity(ERROR)) // 3️⃣
    .addRule('no-deprecated-inline-template', vue3Severity(ERROR)) // 3️⃣
    .addRule('no-deprecated-props-default-this', vue3Severity(ERROR)) // 3️⃣
    .addRule('no-deprecated-router-link-tag-prop', vue3Severity(ERROR)) // 3️⃣
    .addRule('no-deprecated-scope-attribute', isLess2_5 ? OFF : ERROR) // 3️⃣ deprecated in 2.5.0
    .addRule('no-deprecated-slot-attribute', isLess2_6 ? OFF : ERROR) // 3️⃣ deprecated in 2.6.0
    .addRule('no-deprecated-slot-scope-attribute', isLess2_6 ? OFF : ERROR) // 3️⃣ deprecated in 2.6.0
    .addRule('no-deprecated-v-bind-sync', vue3Severity(ERROR)) // 3️⃣
    .addRule('no-deprecated-v-is', isLess3_1 ? OFF : ERROR) // 3️⃣ deprecated in 3.1.0
    .addRule('no-deprecated-v-on-native-modifier', vue3Severity(ERROR)) // 3️⃣
    .addRule('no-deprecated-v-on-number-modifiers', vue3Severity(ERROR)) // 3️⃣
    .addRule('no-deprecated-vue-config-keycodes', vue3Severity(ERROR)) // 3️⃣
    .addRule('no-dupe-keys', ERROR) // 3️⃣2️⃣
    .addRule('no-dupe-v-else-if', ERROR) // 3️⃣2️⃣
    .addRule('no-duplicate-attributes', ERROR) // 3️⃣2️⃣
    .addRule('no-export-in-script-setup', ERROR) // 3️⃣2️⃣
    .addRule('no-expose-after-await', vue3Severity(ERROR)) // 3️⃣
    .addRule('no-lifecycle-after-await', vue3Severity(ERROR)) // 3️⃣
    .addRule('no-mutating-props', ERROR) // 3️⃣2️⃣
    .addRule('no-parsing-error', ERROR) // 3️⃣2️⃣
    .addRule('no-ref-as-operand', ERROR) // 3️⃣2️⃣
    .addRule('no-reserved-component-names', ERROR) // 3️⃣2️⃣
    .addRule('no-reserved-keys', ERROR) // 3️⃣2️⃣
    .addRule('no-reserved-props', ERROR) // 3️⃣2️⃣
    .addRule('no-shared-component-data', ERROR) // 3️⃣2️⃣
    .addRule('no-side-effects-in-computed-properties', ERROR) // 3️⃣2️⃣
    .addRule('no-template-key', ERROR) // 3️⃣2️⃣
    .addRule('no-textarea-mustache', ERROR) // 3️⃣2️⃣
    .addRule('no-unused-components', ERROR) // 3️⃣2️⃣
    .addRule('no-unused-vars', ERROR) // 3️⃣2️⃣
    .addRule('no-use-computed-property-like-method', ERROR) // 3️⃣2️⃣
    .addRule('no-use-v-if-with-v-for', ERROR) // 3️⃣2️⃣
    .addRule('no-useless-template-attributes', ERROR) // 3️⃣2️⃣
    .addRule('no-v-for-template-key-on-child', vue3Severity(ERROR)) // 3️⃣
    .addRule('no-v-text-v-html-on-component', ERROR) // 3️⃣2️⃣
    .addRule('no-watch-after-await', vue3Severity(ERROR)) // 3️⃣
    .addRule('prefer-import-from-vue', vue3Severity(ERROR)) // 3️⃣
    .addRule('require-component-is', ERROR) // 3️⃣2️⃣
    .addRule('require-prop-type-constructor', ERROR) // 3️⃣2️⃣
    .addRule('require-render-return', ERROR) // 3️⃣2️⃣
    .addRule('require-slots-as-functions', vue3Severity(ERROR)) // 3️⃣
    .addRule('require-toggle-inside-transition', vue3Severity(ERROR)) // 3️⃣
    .addRule('require-v-for-key', ERROR) // 3️⃣2️⃣
    .addRule('require-valid-default-prop', ERROR) // 3️⃣2️⃣
    .addRule('return-in-computed-property', ERROR) // 3️⃣2️⃣
    .addRule('return-in-emits-validator', ERROR) // 3️⃣2️⃣
    .addRule('use-v-on-exact', ERROR) // 3️⃣2️⃣
    .addRule('valid-attribute-name', ERROR) // 3️⃣2️⃣
    .addRule('valid-define-emits', ERROR) // 3️⃣2️⃣
    .addRule('valid-define-props', ERROR) // 3️⃣2️⃣
    .addRule('valid-next-tick', ERROR) // 3️⃣2️⃣
    .addRule('valid-template-root', ERROR) // 3️⃣2️⃣
    .addRule('valid-v-bind', ERROR) // 3️⃣2️⃣
    .addRule('valid-v-cloak', ERROR) // 3️⃣2️⃣
    .addRule('valid-v-else-if', ERROR) // 3️⃣2️⃣
    .addRule('valid-v-else', ERROR) // 3️⃣2️⃣
    .addRule('valid-v-for', ERROR) // 3️⃣2️⃣
    .addRule('valid-v-html', ERROR) // 3️⃣2️⃣
    .addRule('valid-v-if', ERROR) // 3️⃣2️⃣
    .addRule('valid-v-is', vue3Severity(ERROR)) // 3️⃣
    .addRule('valid-v-memo', vue3Severity(ERROR)) // 3️⃣
    .addRule('valid-v-model', ERROR) // 3️⃣2️⃣
    .addRule('valid-v-on', ERROR) // 3️⃣2️⃣
    .addRule('valid-v-once', ERROR) // 3️⃣2️⃣
    .addRule('valid-v-pre', ERROR) // 3️⃣2️⃣
    .addRule('valid-v-show', ERROR) // 3️⃣2️⃣
    .addRule('valid-v-slot', ERROR) // 3️⃣2️⃣
    .addRule('valid-v-text', ERROR) // 3️⃣2️⃣
    /* Category: Priority B: Strongly Recommended */
    .addRule('attribute-hyphenation', ERROR) // 3️⃣2️⃣
    .addRule('component-definition-name-casing', ERROR) // 3️⃣2️⃣
    .addRule('first-attribute-linebreak', ERROR) // 3️⃣2️⃣
    .addRule('html-closing-bracket-newline', ERROR) // 3️⃣2️⃣
    .addRule('html-closing-bracket-spacing', ERROR) // 3️⃣2️⃣
    .addRule('html-end-tags', ERROR) // 3️⃣2️⃣
    .addRule('html-indent', ERROR) // 3️⃣2️⃣
    .addRule('html-quotes', ERROR) // 3️⃣2️⃣
    .addRule('html-self-closing', ERROR, [
      {
        html: {
          void: 'any', // TODO Setting other value here for `void` would conflict with Prettier, default is `never`
          normal: 'never',
          component: 'never',
        },
      },
    ]) // 3️⃣2️⃣
    .addRule('max-attributes-per-line', ERROR) // 3️⃣2️⃣
    .addRule('multiline-html-element-content-newline', ERROR) // 3️⃣2️⃣
    .addRule('mustache-interpolation-spacing', ERROR) // 3️⃣2️⃣
    .addRule('no-multi-spaces', ERROR) // 3️⃣2️⃣
    .addRule('no-spaces-around-equal-signs-in-attribute', ERROR) // 3️⃣2️⃣
    .addRule('no-template-shadow', ERROR) // 3️⃣2️⃣
    .addRule('one-component-per-file', ERROR) // 3️⃣2️⃣
    .addRule('prop-name-casing', ERROR) // 3️⃣2️⃣
    .addRule('require-default-prop', OFF) // 3️⃣2️⃣
    .addRule('require-explicit-emits', vue3Severity(ERROR)) // 3️⃣
    .addRule('require-prop-types', ERROR) // 3️⃣2️⃣
    .addRule('singleline-html-element-content-newline', ERROR) // 3️⃣2️⃣
    .addRule('v-bind-style', ERROR, [
      'shorthand',
      {
        ...(isMin3_4 && {sameNameShorthand: 'always'}),
      },
    ]) // 3️⃣2️⃣
    .addRule('v-on-event-hyphenation', vue3Severity(ERROR)) // 3️⃣
    .addRule('v-on-style', ERROR) // 3️⃣2️⃣
    .addRule('v-slot-style', ERROR) // 3️⃣2️⃣
    /* Category: Priority C: Recommended */
    .addRule('attributes-order', ERROR) // 3️⃣2️⃣
    .addRule('no-lone-template', ERROR) // 3️⃣2️⃣
    .addRule('no-multiple-slot-args', ERROR) // 3️⃣2️⃣
    .addRule('no-v-html', ERROR) // 3️⃣2️⃣
    .addRule('order-in-components', ERROR) // 3️⃣2️⃣
    .addRule('this-in-template', ERROR) // 3️⃣2️⃣
    /* Category: Uncategorized */
    .addRule('block-lang', ERROR, [
      {
        script: {
          lang: 'ts',
          ...(enforceTypescriptInScriptSection === false && {allowNoLang: true}),
        },
      },
    ])
    .addRule('block-order', ERROR, [
      {
        order: [
          ...(Array.isArray(sfcBlockOrder)
            ? sfcBlockOrder
            : sfcBlockOrder === 'script-first'
              ? ['script:not([setup])', 'script[setup]', 'template']
              : ['template', 'script:not([setup])', 'script[setup]']),
          'style:not([scoped])', // TODO move to top?
          'style[scoped]',
        ],
      },
    ]) // 3️⃣2️⃣
    .addRule('block-tag-newline', OFF)
    .addRule('component-api-style', enforceApiStyle == null ? OFF : ERROR, [
      [
        enforceApiStyle === 'setup' ? 'script-setup' : 'options',
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
    .addRule('define-props-declaration', ERROR, [enforcePropsDeclarationStyle])
    .addRule('define-props-destructuring', ERROR, [{destructure: 'never'}])
    .addRule('enforce-style-attribute', OFF)
    .addRule('html-button-has-type', ERROR)
    .addRule('html-comment-content-newline', OFF)
    .addRule('html-comment-content-spacing', OFF)
    .addRule('html-comment-indent', OFF)
    .addRule('match-component-file-name', OFF)
    .addRule('match-component-import-name', OFF)
    .addRule('max-lines-per-block', OFF)
    .addRule('max-props', OFF) // >=9.28.0
    .addRule('max-template-depth', OFF) // >=9.28.0
    .addRule('new-line-between-multi-line-property', OFF)
    .addRule('next-tick-style', OFF)
    .addRule('no-bare-strings-in-template', OFF)
    .addRule('no-boolean-default', OFF)
    .addRule('no-deprecated-delete-set', vue3Severity(ERROR)) // 3️⃣ >=9.29.0
    .addRule('no-deprecated-model-definition', vue3Severity(ERROR)) // 3️⃣
    .addRule('no-duplicate-attr-inheritance', ERROR)
    .addRule('no-empty-component-block', ERROR)
    .addRule('no-import-compiler-macros', ERROR) // >=10.0.0
    .addRule('no-multiple-objects-in-class', ERROR)
    .addRule('no-potential-component-option-typo', ERROR)
    .addRule('no-ref-object-reactivity-loss', ERROR)
    .addRule('no-required-prop-with-default', ERROR) // 3️⃣2️⃣
    .addRule('no-restricted-block', OFF)
    .addRule('no-restricted-call-after-await', OFF)
    .addRule('no-restricted-class', OFF)
    .addRule('no-restricted-component-names', OFF)
    .addRule('no-restricted-component-options', OFF)
    .addRule('no-restricted-custom-event', OFF)
    .addRule(
      'no-restricted-html-elements',
      ERROR,
      getKeysOfTruthyValues({
        ...noRestrictedHtmlElementsDefault,
        ...optionsResolved.disallowedHtmlTags,
      }),
    )
    .addRule('no-restricted-props', OFF)
    .addRule('no-restricted-static-attribute', OFF)
    .addRule('no-restricted-v-bind', OFF)
    .addRule('no-restricted-v-on', OFF)
    .addRule('no-root-v-if', OFF)
    .addRule('no-setup-props-reactivity-loss', ERROR)
    .addRule('no-static-inline-styles', OFF)
    .addRule('no-template-target-blank', OFF)
    .addRule('no-this-in-before-route-enter', ERROR)
    .addRule('no-undef-components', ERROR, [
      {
        ignorePatterns: [
          'router-link',
          'router-view',
          isNuxtEnabled && /^(lazy-)?(nuxt-|client-only$)/,
          ...(optionsResolved.knownComponentNames || []),
        ]
          .flat()
          .filter((v) => v !== false),
      },
    ])
    // TODO enable if script setup is enforced and only in JS?
    .addRule('no-undef-properties', OFF)
    .addRule('no-unsupported-features', ERROR, [
      {version: `^${vuePackageInfo?.versions.full || vuePackageMajorVersion}`},
    ])
    .addRule('no-unused-emit-declarations', ERROR)
    .addRule('no-unused-properties', OFF)
    .addRule('no-unused-refs', ERROR)
    .addRule('no-use-v-else-with-v-for', ERROR)
    .addRule('no-useless-mustaches', ERROR)
    .addRule('no-useless-v-bind', ERROR)
    .addRule('no-v-text', OFF)
    .addRule('padding-line-between-blocks', ERROR)
    .addRule('padding-line-between-tags', OFF)
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
    .addRule('prefer-use-template-ref', preferUseTemplateRef ? ERROR : OFF)
    .addRule('require-default-export', ERROR) // >=9.28.0
    .addRule('require-direct-export', ERROR)
    .addRule('require-emit-validator', OFF)
    .addRule('require-explicit-slots', isMin3_3 ? ERROR : OFF)
    .addRule('require-expose', OFF)
    .addRule('require-macro-variable-name', ERROR)
    .addRule('require-name-property', OFF)
    .addRule('require-prop-comment', OFF)
    .addRule('require-typed-object-prop', ERROR)
    .addRule('require-typed-ref', ERROR)
    .addRule('restricted-component-names', OFF) // >=9.32.0
    .addRule('slot-name-casing', ERROR /* `camelCase` is default */) // >=9.32.0
    .addRule('script-indent', OFF)
    .addRule('sort-keys', OFF)
    .addRule('static-class-names-order', OFF)
    .addRule('v-for-delimiter-style', ERROR, ['in' /* default */])
    // This rule is not required in Vue 3, as the key is automatically assigned to the elements.
    .addRule('v-for-delimiter-style', vue2Severity(ERROR))
    // TODO change to [inline, inline-function] once this is landed: https://github.com/vuejs/eslint-plugin-vue/issues/2460
    .addRule('v-on-handler-style', ERROR, ['inline'])
    .addRule('valid-define-options', isMin3_3 ? ERROR : OFF) // 3️⃣
    /* Category: Extension Rules */
    .addRule('array-bracket-newline', OFF)
    .addRule('array-bracket-spacing', OFF)
    .addRule('array-element-newline', OFF)
    .addRule('arrow-spacing', OFF)
    .addRule('block-spacing', OFF)
    .addRule('brace-style', OFF)
    .addRule(
      'camelcase',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules.camelcase ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    )
    .addRule('comma-dangle', OFF)
    .addRule('comma-spacing', OFF)
    .addRule('comma-style', OFF)
    .addRule('dot-location', OFF)
    .addRule(
      'dot-notation',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['dot-notation'] ?? ERROR,
        [
          optionsResolved.noPropertyAccessFromIndexSignatureSetInTsconfigForVueFiles ? OFF : ERROR,
          inheritFromBase ? undefined : [],
        ],
      ),
    )
    .addRule(
      'eqeqeq',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules.eqeqeq ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    )
    .addRule('func-call-spacing', OFF)
    .addRule('key-spacing', OFF)
    .addRule('keyword-spacing', OFF)
    .addRule('max-len', OFF)
    .addRule('multiline-ternary', OFF)
    .addRule('no-console', ERROR) // Do not inherit severity and options
    .addRule(
      'no-constant-condition',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-constant-condition'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    )
    .addRule(
      'no-empty-pattern',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-empty-pattern'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    )
    .addRule('no-extra-parens', OFF)
    .addRule(
      'no-irregular-whitespace',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-irregular-whitespace'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    )
    .addRule(
      'no-loss-of-precision',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-loss-of-precision'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    )
    .addRule(
      'no-restricted-syntax',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-restricted-syntax'] ?? OFF,
        inheritFromBase ? undefined : [OFF],
      ),
    )
    .addRule(
      'no-sparse-arrays',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-sparse-arrays'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    )
    .addRule(
      'no-useless-concat',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-useless-concat'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    )
    .addRule('object-curly-newline', OFF)
    .addRule('object-curly-spacing', OFF)
    .addRule('object-property-newline', OFF)
    .addRule(
      'object-shorthand',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['object-shorthand'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    )
    .addRule('operator-linebreak', OFF)
    .addRule(
      'prefer-template',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['prefer-template'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    )
    .addRule('quote-props', OFF)
    .addRule('space-in-parens', OFF)
    .addRule('space-infix-ops', OFF)
    .addRule('space-unary-ops', OFF)
    .addRule('template-curly-spacing', OFF)
    // 🔵 Not working great in Vue files
    .disableAnyRule('@typescript-eslint', 'prefer-function-type')
    .disableAnyRule('@typescript-eslint', 'unified-signatures')
    .disableAnyRule('import', 'first') // May be wrong if multiple <script> blocks are present
    .disableAnyRule('import', 'no-default-export')
    .disableAnyRule('', 'no-useless-assignment') // False positives in script setup
    .addOverrides();

  configBuilder
    ?.addConfig('vue/allow-single-word-component-names', {
      files: [
        inNuxtAppDir('pages/**/*.vue'),
        inNuxtAppDir('views/**/*.vue'),
        isNuxtEnabled && [
          nuxtLayoutsFilesGlob,
          ...['app.vue', 'error.vue'].map((fileName) => inNuxtAppDir(fileName)),
        ],

        optionsResolved.doNotRequireComponentNamesToBeMultiWordForPatterns,
      ]
        .flat()
        .filter((v) => typeof v === 'string'),
    })
    .addRule('multi-word-component-names', OFF);

  configBuilder
    ?.addConfig('vue/allow-implicit-slots', {
      files: [nuxtLayoutsFilesGlob],
    })
    .addRule('require-explicit-slots', isNuxtEnabled ? OFF : null);

  configBuilder
    ?.addConfig('vue/allow-default-export', {
      files: [
        ...DEFAULT_VUE_FILES,
        isNuxtEnabled && [
          inNuxtAppDir('plugins/**/*'),
          inNuxtAppDir('server/**/*'),
          inNuxtAppDir(`app/router.options.${GLOB_JS_TS_EXTENSION}`),
        ],
      ]
        .flat()
        .filter((v) => typeof v === 'string'),
    })
    .disableAnyRule('import', 'no-default-export');

  const configBuilderA11y = createConfigBuilder(context, configA11y, 'vuejs-accessibility');

  // Legend:
  // 🟢 - in recommended

  configBuilderA11y
    ?.addConfig([
      'vue/a11y',
      {
        includeDefaultFilesAndIgnores: true,
        ignoreMarkdownCodeBlocks: true,
        filesFallback: optionsResolved.files,
        ignoresFallback: optionsResolved.ignores,
      },
    ])
    .addRule('alt-text', ERROR) // 🟢
    .addRule('anchor-has-content', ERROR) // 🟢
    .addRule('aria-props', ERROR) // 🟢
    .addRule('aria-role', ERROR) // 🟢
    .addRule('aria-unsupported-elements', ERROR) // 🟢
    .addRule('click-events-have-key-events', ERROR) // 🟢
    .addRule('form-control-has-label', ERROR) // 🟢
    .addRule('heading-has-content', ERROR) // 🟢
    .addRule('iframe-has-title', ERROR) // 🟢
    .addRule('interactive-supports-focus', ERROR) // 🟢
    .addRule('label-has-for', ERROR, [{allowChildren: true}]) // 🟢
    .addRule('media-has-caption', ERROR) // 🟢
    .addRule('mouse-events-have-key-events', ERROR) // 🟢
    .addRule('no-access-key', ERROR) // 🟢
    .addRule('no-autofocus', ERROR) // 🟢
    .addRule('no-distracting-elements', ERROR) // 🟢
    .addRule('no-onchange', OFF) // Deprecated
    .addRule('no-redundant-roles', ERROR) // 🟢
    .addRule('no-static-element-interactions', ERROR) // 🟢
    .addRule('role-has-required-aria-props', ERROR) // 🟢
    .addRule('tabindex-no-positive', ERROR) // 🟢
    .addOverrides();

  const configBuilderPinia = createConfigBuilder(context, configPinia, 'pinia');

  // Legend:
  // 🟢 - in recommended

  configBuilderPinia
    ?.addConfig([
      'pinia',
      {
        includeDefaultFilesAndIgnores: true,
        ignoreMarkdownCodeBlocks: true,
      },
    ])
    .addRule('never-export-initialized-store', ERROR) // 🟢
    .addRule('no-duplicate-store-ids', ERROR) // 🟢
    .addRule('no-return-global-properties', ERROR) // 🟢
    .addRule('no-store-to-refs-in-store', ERROR) // 🟢
    .addRule('prefer-single-store-per-file', ERROR) // 🟢
    .addRule('prefer-use-store-naming-convention', ERROR, [
      {
        checkStoreNameMismatch: true,
        storeSuffix:
          typeof configPinia === 'object' && configPinia.storesNameSuffix != null
            ? configPinia.storesNameSuffix
            : DEFAULT_PINIA_STORE_NAME_SUFFIX,
      },
    ]) // 🟢
    .addRule('require-setup-store-properties-export', ERROR) // 🟢
    .addOverrides();

  return {
    configs: [configBuilder, configBuilderA11y, configBuilderPinia],
    optionsResolved,
  };
};

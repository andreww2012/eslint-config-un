import type {Options as EslintProcessorVueBlocksOptions} from 'eslint-processor-vue-blocks';
import globals from 'globals';
import {
  ERROR,
  GLOB_JS_TS_EXTENSION,
  GLOB_JS_TS_X_EXTENSION,
  GLOB_MD_X_CODE_BLOCKS,
  GLOB_VUE,
  OFF,
  type RuleSeverity,
  WARNING,
} from '../constants';
import type {EslintTypedRulesConfig} from '../eslint/eslint-types';
import {generatePackageToLoadProperty} from '../loaders';
import type {OmitStrict} from '../types';
import {
  type MaybeArray,
  allUnionMembers,
  doesPackageExist,
  fetchPackageInfo,
  getKeysOfTruthyValues,
  joinPaths,
} from '../utils';
import {type ValidAndInvalidHtmlTags, noRestrictedHtmlElementsDefault} from './shared';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  type UnRuleOptionsByPlugin,
  type UnRulesConfigPartial,
  assignDefaults,
  getRuleUnSeverityAndOptionsFromEntry,
} from './index';

type WellKnownSfcBlocks =
  | 'template'
  | 'script'
  | 'script:not([setup])'
  | 'script[setup]'
  | 'style'
  | 'style:not([scoped])'
  | 'style[scoped]';

const DEFAULT_PINIA_STORE_NAME_SUFFIX = 'Store';

interface EnforceTypescriptInScriptionSectionConfigOptions<
  ExtraPlugins extends ExtraPluginsType,
> extends UnFlatConfigEntryBase<ExtraPlugins, Pick<UnRulesConfigPartial<'vue'>, 'vue/block-lang'>> {
  /**
   * What `ts` rules will be applied to the specified `files`. If you want more control over which TypeScript rules are applied to which Vue files, use `ts` config options for that.
   * @default true
   */
  typescriptRules?: boolean | 'only-non-type-aware';
}

interface I18nSubConfigOptions<ExtraPlugins extends ExtraPluginsType> extends UnFlatConfigEntryBase<
  ExtraPlugins,
  '@intlify/vue-i18n'
> {
  /**
   * [`@intlify/eslint-plugin-vue-i18n`](https://npmx.dev/@intlify/eslint-plugin-vue-i18n) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `vue-i18n` property
   * and applied to the resolved `files` and `ignores` of this config.
   */
  settings?: {
    /**
     * - **string**: a glob for specifying files that store localization messages of project
     *
     * Source: plugin docs
     */
    localeDir?: MaybeArray<
      | string
      | ((
          | {
              /**
               * - `file`: determine the locale name from the filename. The resource file should only contain messages for that locale. Use this option if you use `vue-cli-plugin-i18n`. This option is also used when String option is specified
               * - `key`: determine the locale name from the root key name of the file contents. The value of that key should only contain messages for that locale. Used when the resource file is in the format given to the `messages` option of the `VueI18n` constructor option.
               *
               * Source: plugin docs
               */
              localeKey: 'file' | 'key';
            }
          | {
              /**
               * Determine the locale name from the path. In this case, the locale must be had structured with your rule on the path. It can be captured with the regular expression named capture. The resource file should only contain messages for that locale.
               *
               * Source: plugin docs
               */
              localeKey: 'path';

              /**
               * Specifies how to determine pattern the locale for localization messages. This option means, when `localeKey` is `'path'`, you will need to capture the locale using a regular expression. You need to use the locale capture as a named capture `?<locale>`, so it’s be able to capture from the path of the locale resources. If you omit it, it will be captured from the resource path with the same regular expression pattern as `vue-cli-plugin-i18n`.
               *
               * Source: plugin docs
               */
              localePattern?: RegExp;
            }
        ) & {
          /**
           * A glob for specifying files that store localization messages of project
           *
           * Source: plugin docs
           */
          pattern?: string;
        })
    >;

    /**
     * Specify the version of `vue-i18n` you are using.
     * If not specified, the message will be parsed twice.
     *
     * Source: plugin docs
     */
    messageSyntaxVersion?: string;
  };
}

type NuxtPluginNuxtConfigRelatedRules = 'nuxt-config-keys-order';

interface NuxtSubConfigOptions<ExtraPlugins extends ExtraPluginsType> extends UnFlatConfigEntryBase<
  ExtraPlugins,
  OmitStrict<UnRulesConfigPartial<'nuxt'>, `nuxt/${NuxtPluginNuxtConfigRelatedRules}`>
> {
  /**
   * Configures rules specific to Nuxt config file.
   *
   * Currently includes the single rule,
   * [`nuxt-config-keys-order`](https://github.com/nuxt/eslint/blob/main/packages/eslint-plugin/src/rules/nuxt-config-keys-order/index.ts),
   * and applies it to all `nuxt.config.?([cm])[jt]s?(x)` files.
   * @default true
   */
  configNuxtConfig?:
    | boolean
    | UnFlatConfigEntryBase<
        ExtraPlugins,
        Pick<UnRulesConfigPartial<'nuxt'>, `nuxt/${NuxtPluginNuxtConfigRelatedRules}`>
      >;

  /**
   * By default auto-detected from the installed `nuxt` package version.
   */
  nuxtMajorVersion?: 3 | 4;

  /**
   * You may need to set this manually to `true` if you're using
   * [Nuxt 4 directory structure](https://nuxt.com/docs/4.x/getting-started/upgrade#new-directory-structure)
   * in Nuxt 3.
   * @default true <=> Nuxt version is 4
   */
  v4DirectoryStructure?: boolean;
}

interface PiniaSubConfigOptions<
  ExtraPlugins extends ExtraPluginsType,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'pinia'> {
  /**
   * Enforces pinia stores to be defined with the specified suffix.
   * Set to an empty string to not require any suffix.
   * @default 'Store'
   * @see https://github.com/lisilinhart/eslint-plugin-pinia/blob/HEAD/docs/rules/prefer-use-store-naming-convention.md
   */
  storesNameSuffix?: string;
}

interface ScopedCssEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'vue-scoped-css'> {
  /**
   * Will be merged with the default value. `true` does not restrict the style type.
   * @default {plain: true, scoped: true}
   */
  allowedStyleType?:
    | true
    | Partial<
        Record<
          (GetRuleOptions<'vue-scoped-css', 'enforce-style-type'>['allows'] & {})[number],
          boolean
        >
      >;
}

type SupportedVueMajorVersion = 2 | 3;
const SUPPORTED_VUE_MAJOR_VERSIONS = new Set<number>(
  allUnionMembers<SupportedVueMajorVersion>()([2, 3]),
);
const DEFAULT_VUE_MAJOR_VERSION = 3 satisfies SupportedVueMajorVersion;

export interface VueEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'vue'> {
  /**
   * Enables a11y (accessibility) rules for Vue SFC templates
   *
   * By default, uses `files` and `ignores` from the parent config.
   * @default true
   */
  configA11y?: boolean | UnFlatConfigEntryBase<ExtraPlugins, 'vuejs-accessibility'>;

  /**
   * Enforces the presence of `lang="ts"` in `<script>` sections, see
   * [vue/block-lang](https://eslint.vuejs.org/rules/block-lang.html) rule for more details.
   *
   * By default, will inherit `files` and `ignores` from the parent config, and specifying
   * them explicitly here will *override* the respective property of the parent config.
   *
   * These files will be checked by all the `ts` config rules. You can control this behavior
   * by using `typescriptRules` option.
   * @default true <=> `ts` config is enabled
   */
  configEnforceTypescriptInScriptSection?:
    | boolean
    | EnforceTypescriptInScriptionSectionConfigOptions<ExtraPlugins>;

  /**
   * [`vue-i18n`](https://npmx.dev/vue-i18n) specific rules.
   *
   * By default, uses `files` and `ignores` from the parent config.
   * @default true <=> `vue-i18n` package is installed
   */
  configI18n?: boolean | I18nSubConfigOptions<ExtraPlugins>;

  /**
   * Nuxt-specific rules and tweaks:
   * - Built-in Nuxt components ([`client-only`](https://nuxt.com/docs/4.x/api/components/client-only), [`dev-only`](https://nuxt.com/docs/4.x/api/components/dev-only) or any component starting with `nuxt`)
   * will be ignored by [`vue/no-undef-components`](https://eslint.vuejs.org/rules/no-undef-components.html);
   * - Nuxt's [`app.vue`](https://nuxt.com/docs/4.x/directory-structure/app/app),
   * [`error.vue`](https://nuxt.com/docs/4.x/directory-structure/app/error) and
   * [layout files](https://nuxt.com/docs/4.x/directory-structure/app/layouts)
   * will be exempted from being checked by
   * [`vue/allow-single-word-component-names`](https://eslint.vuejs.org/rules/allow-single-word-component-names.html);
   * - Layout files will also not be subject of
   * [`allow-implicit-slots`](https://eslint.vuejs.org/rules/allow-implicit-slots.html) check;
   * - [Plugins](https://nuxt.com/docs/4.x/directory-structure/app/plugins) and
   * [server](https://nuxt.com/docs/4.x/directory-structure/server) files will be allowed
   * to do `export default` ([`import/no-default-export`](https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/docs/rules/no-default-export.md) will be turned off);
   * - [`nuxt/no-page-meta-runtime-values`](https://github.com/nuxt/eslint/blob/89618070025b4373e90b227eb478b33a13b34c8f/packages/eslint-plugin/src/rules/no-page-meta-runtime-values/no-page-meta-runtime-values.ts#L66)
   * and [`nuxt/prefer-import-meta`](https://eslint.nuxt.com/packages/plugin#nuxtprefer-import-meta)
   * will be applied to the specified `files` and `ignores`, defaulting to all files inside
   * `vueOrNuxtProjectDir` directory;
   * - Another sub-config, `configNuxtConfig`, will control whether
   * [`nuxt-config-keys-order`](https://github.com/nuxt/eslint/blob/main/packages/eslint-plugin/src/rules/nuxt-config-keys-order/index.ts)
   * rule will be applied to Nuxt config file (`true` by default).
   * @default true <=> `nuxt` package is installed
   */
  configNuxt?: boolean | NuxtSubConfigOptions<ExtraPlugins>;

  /**
   * Enabled automatically by checking if `pinia` package is installed (at any level). Pass a false value to disable pinia-specific rules.
   * @default true <=> `pinia` package is installed
   */
  configPinia?: boolean | PiniaSubConfigOptions<ExtraPlugins>;

  /**
   * Scoped CSS in Vue.js related rules.
   * @default true
   */
  configScopedCss?: boolean | ScopedCssEslintConfigOptions<ExtraPlugins>;

  /**
   * By default auto-detected from the installed `vue` package version.
   * @default auto-detected
   */
  majorVersion?: SupportedVueMajorVersion;

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
   * - All "stylistic" rules are always turned off:
   * [array-bracket-newline](https://eslint.vuejs.org/rules/array-bracket-newline.html),
   * [array-bracket-spacing](https://eslint.vuejs.org/rules/array-bracket-spacing.html),
   * [array-element-newline](https://eslint.vuejs.org/rules/array-element-newline.html),
   * [arrow-spacing](https://eslint.vuejs.org/rules/arrow-spacing.html),
   * [block-spacing](https://eslint.vuejs.org/rules/block-spacing.html),
   * [brace-style](https://eslint.vuejs.org/rules/brace-style.html),
   * [comma-dangle](https://eslint.vuejs.org/rules/comma-dangle.html),
   * [comma-spacing](https://eslint.vuejs.org/rules/comma-spacing.html),
   * [comma-style](https://eslint.vuejs.org/rules/comma-style.html),
   * [dot-location](https://eslint.vuejs.org/rules/dot-location.html),
   * [func-call-spacing](https://eslint.vuejs.org/rules/func-call-spacing.html),
   * [key-spacing](https://eslint.vuejs.org/rules/key-spacing.html),
   * [keyword-spacing](https://eslint.vuejs.org/rules/keyword-spacing.html),
   * [max-len](https://eslint.vuejs.org/rules/max-len.html),
   * [multiline-ternary](https://eslint.vuejs.org/rules/multiline-ternary.html),
   * [no-extra-parens](https://eslint.vuejs.org/rules/no-extra-parens.html),
   * [object-curly-newline](https://eslint.vuejs.org/rules/object-curly-newline.html),
   * [object-curly-spacing](https://eslint.vuejs.org/rules/object-curly-spacing.html),
   * [object-property-newline](https://eslint.vuejs.org/rules/object-property-newline.html),
   * [operator-linebreak](https://eslint.vuejs.org/rules/operator-linebreak.html),
   * [quote-props](https://eslint.vuejs.org/rules/quote-props.html),
   * [space-in-parens](https://eslint.vuejs.org/rules/space-in-parens.html),
   * [space-infix-ops](https://eslint.vuejs.org/rules/space-infix-ops.html),
   * [space-unary-ops](https://eslint.vuejs.org/rules/space-unary-ops.html),
   * [template-curly-spacing](https://eslint.vuejs.org/rules/template-curly-spacing.html)
   * @default true
   */
  inheritBaseRuleSeverityAndOptionsForExtensionRules?: boolean;

  /**
   * @see https://eslint.vuejs.org/rules/comment-directive#options
   */
  reportUnusedDisableDirectives?: boolean;

  /**
   * Will be merged with `['^router-link$', '^router-view$']` and Nuxt-specific ones
   * if `nuxt` sub-config is enabled
   */
  knownComponentNames?: string[];

  /**
   * Enforce either Composition (`setup`) or Options (`options`) API.
   * Not enforced by default.
   */
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
   * Whether to create virtual ESLint files for various SFC (single file component) blocks.
   *
   * - By default, virtual files will be created for `<style>` blocks.
   * - If an object is passed, it will be merged with the defaults above.
   * - If `false`, no virtual files will be created.
   * @default true
   */
  processSfcBlocks?: boolean | EslintProcessorVueBlocksOptions;

  /**
   * A relative path to your Vue or Nuxt project, i.e. where the app's entry point (`app.vue`),
   * `pages` and nuxt's `layouts` directories are located.
   * By default, it is the current directory `''` or `app` for Nuxt 4.
   */
  vueOrNuxtProjectDir?: string;
}

const DEFAULT_VUE_FILES: string[] = [GLOB_VUE];

const NUXT_CONFIG_RULES = new Set<string>(
  allUnionMembers<
    keyof Pick<UnRuleOptionsByPlugin['nuxt'], 'no-nuxt-config-test-key' | 'nuxt-config-keys-order'>
  >()(['no-nuxt-config-test-key', 'nuxt-config-keys-order']),
);

export default (async (context, optionsRaw, {vanillaFinalFlatConfigRules}) => {
  const [isPiniaPackageInstalled, vueI18nPackageInfo, nuxtPackageInfo] = await Promise.all([
    doesPackageExist('pinia'),
    fetchPackageInfo('vue-i18n'),
    fetchPackageInfo('nuxt'),
  ]);

  const isTypescriptEnabled = context.configsMeta.ts.enabled;

  const vuePackageInfo = context.packagesInfo.vue;
  const vuePackageMajorVersion = vuePackageInfo?.versions.major;
  const isVuePackageMajorVersionSupported =
    vuePackageMajorVersion != null && SUPPORTED_VUE_MAJOR_VERSIONS.has(vuePackageMajorVersion);

  const optionsResolved = assignDefaults(optionsRaw, {
    configEnforceTypescriptInScriptSection: isTypescriptEnabled,
    files: DEFAULT_VUE_FILES, // Must be assigned to options for `ts` config
    majorVersion: isVuePackageMajorVersionSupported
      ? (vuePackageMajorVersion as SupportedVueMajorVersion)
      : DEFAULT_VUE_MAJOR_VERSION,
    configA11y: true,
    configI18n: vueI18nPackageInfo != null,
    configNuxt: nuxtPackageInfo != null,
    configPinia: isPiniaPackageInstalled,
    configScopedCss: true,
    processSfcBlocks: true,
    reportUnusedDisableDirectives: true,
    enforcePropsDeclarationStyle: 'runtime',
    inheritBaseRuleSeverityAndOptionsForExtensionRules: true,
  } satisfies VueEslintConfigOptions);
  if (optionsResolved.configEnforceTypescriptInScriptSection === true) {
    optionsResolved.configEnforceTypescriptInScriptSection = {
      files: optionsResolved.files,
      ignores: optionsResolved.ignores,
    };
  }

  const {
    majorVersion: vueMajorVersion,
    configEnforceTypescriptInScriptSection,
    configA11y,
    configI18n,
    configNuxt,
    configPinia,
    configScopedCss,
    processSfcBlocks,
    reportUnusedDisableDirectives,
    sfcBlockOrder,
    enforceApiStyle,
    enforcePropsDeclarationStyle,
    inheritBaseRuleSeverityAndOptionsForExtensionRules: inheritFromBase,
  } = optionsResolved;

  const isVueMajorVersionSetImplicitlyOrWrong =
    !isVuePackageMajorVersionSupported &&
    (typeof optionsRaw !== 'object' ||
      (typeof optionsRaw === 'object' && optionsRaw.majorVersion == null));
  if (isVueMajorVersionSetImplicitlyOrWrong) {
    context.logger.warn(
      `[vue config] Vue major version could not be detected or not supported and was also not explicitly passed. Defaulting to ${DEFAULT_VUE_MAJOR_VERSION}. If this is not correct, please install the supported version of \`vue\` package (${[...SUPPORTED_VUE_MAJOR_VERSIONS].join(', ')}) or specify the major version explicitly in the \`majorVersion\` config option.`,
    );
  }

  const vuePackageFullVersion: number = vuePackageInfo?.versions.majorAndMinor ?? vueMajorVersion;

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

  const nuxtPackageMajorVersion = nuxtPackageInfo?.versions.major;
  const optionsNuxtResolved = assignDefaults(configNuxt, {
    configNuxtConfig: true,
    nuxtMajorVersion: nuxtPackageMajorVersion === 4 ? 4 : 3,
  } satisfies VueEslintConfigOptions['configNuxt'] & object);
  optionsNuxtResolved.v4DirectoryStructure ??= optionsNuxtResolved.nuxtMajorVersion === 4;
  const {v4DirectoryStructure: nuxtV4DirectoryStructure} = optionsNuxtResolved;
  optionsResolved.vueOrNuxtProjectDir ??= nuxtV4DirectoryStructure ? 'app' : '';

  const configBuilder = context.createConfigBuilder(optionsResolved, 'vue');

  configBuilder?.addConfig(
    [
      'vue/setup',
      {
        parser: 'vue-eslint-parser',
        // TODO why?
        ignoresInternal: {
          md: false,
        },
      },
    ],
    {
      files: [...DEFAULT_VUE_FILES, ...optionsResolved.files],
      ...generatePackageToLoadProperty(
        'processor',
        ['mergeProcessors', 'vueProcessor', 'vueBlocksProcessor'],
        {
          valueTransformFn: {
            fn(
              this: {processSfcBlocks: typeof processSfcBlocks},
              {mergeProcessors: {mergeProcessors}, vueProcessor, vueBlocksProcessor},
            ) {
              return mergeProcessors(
                [
                  vueProcessor,
                  (() => {
                    if (!this.processSfcBlocks) {
                      return null;
                    }
                    const processorOptions =
                      typeof this.processSfcBlocks === 'object' ? this.processSfcBlocks : {};
                    return vueBlocksProcessor({
                      ...processorOptions,
                      blocks: {
                        styles: true,
                        ...processorOptions.blocks,
                      },
                    });
                  })(),
                ].filter((v) => v != null),
              );
            },
            scope: {processSfcBlocks},
          },
        },
      ),
      languageOptions: {
        globals: globals.browser,
        parserOptions: {
          ...(isTypescriptEnabled &&
            generatePackageToLoadProperty('parser', 'typescriptEslintParser')),
          sourceType: 'module' as const,
        },
      },
    },
  );

  const vue2Severity = (severity: RuleSeverity) => (isVue2 ? severity : OFF);
  const vue3Severity = (severity: RuleSeverity) => (isVue3 ? severity : OFF);

  // Legend:
  // 3️⃣ = in recommended/vue-3
  // 2️⃣ = in recommended/vue-2
  // 🟠 - rule from `eslint-config-prettier`

  configBuilder
    ?.addConfig(['vue', {includeDefaultFilesAndIgnores: true}])
    .markCategory('Base')
    .addRule('comment-directive', ERROR, [
      // false by default
      {reportUnusedDisableDirectives},
    ]) /** @since 4.1.0 */ // 3️⃣2️⃣
    .addRule('jsx-uses-vars', ERROR) /** @since 2.0.0 */ // 3️⃣2️⃣
    .markCategory('Priority A: Essential')
    .addRule('multi-word-component-names', ERROR) /** @since 7.20.0 */ // 3️⃣2️⃣
    .addRule('no-arrow-functions-in-watch', ERROR) /** @since 7.0.0 */ // 3️⃣2️⃣
    .addRule('no-async-in-computed-properties', ERROR) /** @since 3.8.0 */ // 3️⃣2️⃣
    .addRule('no-child-content', ERROR) /** @since 8.1.0 */ // 3️⃣2️⃣
    .addRule('no-computed-properties-in-data', ERROR) /** @since 7.20.0 */ // 3️⃣2️⃣
    .addRule('no-custom-modifiers-on-v-model', vue2Severity(ERROR)) /** @since 7.0.0 */ // 2️⃣
    .addRule('no-deprecated-data-object-declaration', vue3Severity(ERROR)) /** @since 7.0.0 */ // 3️⃣
    .addRule('no-deprecated-destroyed-lifecycle', vue3Severity(ERROR)) /** @since 7.0.0 */ // 3️⃣
    .addRule('no-deprecated-dollar-listeners-api', vue3Severity(ERROR)) /** @since 7.0.0 */ // 3️⃣
    .addRule('no-deprecated-dollar-scopedslots-api', vue3Severity(ERROR)) /** @since 7.0.0 */ // 3️⃣
    .addRule('no-deprecated-events-api', vue3Severity(ERROR)) /** @since 7.0.0 */ // 3️⃣
    .addRule('no-deprecated-filter', vue3Severity(ERROR)) /** @since 7.0.0 */ // 3️⃣
    .addRule('no-deprecated-functional-template', vue3Severity(ERROR)) /** @since 7.0.0 */ // 3️⃣
    .addRule('no-deprecated-html-element-is', vue3Severity(ERROR)) /** @since 7.0.0 */ // 3️⃣
    .addRule('no-deprecated-inline-template', vue3Severity(ERROR)) /** @since 7.0.0 */ // 3️⃣
    .addRule('no-deprecated-props-default-this', vue3Severity(ERROR)) /** @since 7.0.0 */ // 3️⃣
    .addRule('no-deprecated-router-link-tag-prop', vue3Severity(ERROR)) /** @since 7.20.0 */ // 3️⃣
    .addRule('no-deprecated-scope-attribute', isLess2_5 ? OFF : ERROR) /** @since 6.0.0 */ // 3️⃣ deprecated in 2.5.0
    .addRule('no-deprecated-slot-attribute', isLess2_6 ? OFF : ERROR) /** @since 6.1.0 */ // 3️⃣ deprecated in 2.6.0
    .addRule('no-deprecated-slot-scope-attribute', isLess2_6 ? OFF : ERROR) /** @since 6.1.0 */ // 3️⃣ deprecated in 2.6.0
    .addRule('no-deprecated-v-bind-sync', vue3Severity(ERROR)) /** @since 7.0.0 */ // 3️⃣
    .addRule('no-deprecated-v-is', isLess3_1 ? OFF : ERROR) /** @since 7.11.0 */ // 3️⃣ deprecated in 3.1.0
    .addRule('no-deprecated-v-on-native-modifier', vue3Severity(ERROR)) /** @since 7.0.0 */ // 3️⃣
    .addRule('no-deprecated-v-on-number-modifiers', vue3Severity(ERROR)) /** @since 7.0.0 */ // 3️⃣
    .addRule('no-deprecated-vue-config-keycodes', vue3Severity(ERROR)) /** @since 7.0.0 */ // 3️⃣
    .addRule('no-dupe-keys', ERROR) /** @since 3.9.0 */ // 3️⃣2️⃣
    .addRule('no-dupe-v-else-if', ERROR) /** @since 7.0.0 */ // 3️⃣2️⃣
    .addRule('no-duplicate-attributes', ERROR) /** @since 3.0.0 */ // 3️⃣2️⃣
    .addRule('no-duplicate-class-names', ERROR) /** @since 10.6.0 */
    .addRule('no-export-in-script-setup', ERROR) /** @since 7.13.0 */ // 3️⃣2️⃣
    .addRule('no-expose-after-await', vue3Severity(ERROR)) /** @since 8.1.0 */ // 3️⃣
    .addRule('no-lifecycle-after-await', vue3Severity(ERROR)) /** @since 7.0.0 */ // 3️⃣
    .addRule('no-multiple-template-root', vue2Severity(ERROR)) /** @since 7.0.0 */ // 2️⃣
    .addRule('no-mutating-props', ERROR) /** @since 7.0.0 */ // 3️⃣2️⃣
    .addRule('no-parsing-error', ERROR) /** @since 3.0.0 */ // 3️⃣2️⃣
    .addRule('no-ref-as-operand', ERROR) /** @since 7.0.0 */ // 3️⃣2️⃣
    .addRule('no-reserved-component-names', ERROR) /** @since 6.1.0 */ // 3️⃣2️⃣
    .addRule('no-reserved-keys', ERROR) /** @since 3.9.0 */ // 3️⃣2️⃣
    .addRule('no-reserved-props', ERROR) /** @since 8.0.0 */ // 3️⃣2️⃣
    .addRule('no-shared-component-data', ERROR) /** @since 3.8.0 */ // 3️⃣2️⃣
    .addRule('no-side-effects-in-computed-properties', ERROR) /** @since 3.6.0 */ // 3️⃣2️⃣
    .addRule('no-template-key', ERROR) /** @since 3.4.0 */ // 3️⃣2️⃣
    .addRule('no-textarea-mustache', ERROR) /** @since 3.0.0 */ // 3️⃣2️⃣
    .addRule('no-unused-components', ERROR) /** @since 7.0.0 */ // 3️⃣2️⃣
    .addRule('no-unused-vars', ERROR) /** @since 3.14.0 */ // 3️⃣2️⃣
    .addRule('no-use-computed-property-like-method', ERROR) /** @since 7.15.0 */ // 3️⃣2️⃣
    .addRule('no-use-v-if-with-v-for', ERROR) /** @since 4.6.0 */ // 3️⃣2️⃣
    .addRule('no-useless-template-attributes', ERROR) /** @since 7.19.0 */ // 3️⃣2️⃣
    .addRule('no-v-for-template-key-on-child', vue3Severity(ERROR)) /** @since 7.0.0 */ // 3️⃣
    .addRule('no-v-text-v-html-on-component', ERROR) /** @since 8.4.0 */ // 3️⃣2️⃣
    .addRule('no-watch-after-await', vue3Severity(ERROR)) /** @since 7.0.0 */ // 3️⃣
    .addRule('prefer-import-from-vue', vue3Severity(ERROR)) /** @since 8.5.0 */ // 3️⃣
    .addRule('require-component-is', ERROR) /** @since 3.0.0 */ // 3️⃣2️⃣
    .addRule('require-prop-type-constructor', ERROR) /** @since 5.0.0 */ // 3️⃣2️⃣
    .addRule('require-render-return', ERROR) /** @since 3.10.0 */ // 3️⃣2️⃣
    .addRule('require-slots-as-functions', vue3Severity(ERROR)) /** @since 7.0.0 */ // 3️⃣
    .addRule('require-toggle-inside-transition', vue3Severity(ERROR)) /** @since 7.0.0 */ // 3️⃣
    .addRule('require-v-for-key', ERROR) /** @since 3.0.0 */ // 3️⃣2️⃣
    .addRule('require-valid-default-prop', ERROR) /** @since 3.13.0 */ // 3️⃣2️⃣
    .addRule('return-in-computed-property', ERROR) /** @since 3.7.0 */ // 3️⃣2️⃣
    .addRule('return-in-emits-validator', ERROR) /** @since 7.0.0 */ // 3️⃣2️⃣
    .addRule('use-v-on-exact', ERROR) /** @since 5.0.0 */ // 3️⃣2️⃣
    .addRule('valid-attribute-name', ERROR) /** @since 9.0.0 */ // 3️⃣2️⃣
    .addRule('valid-define-emits', ERROR) /** @since 7.13.0 */ // 3️⃣2️⃣
    .addRule('valid-define-props', ERROR) /** @since 7.13.0 */ // 3️⃣2️⃣
    .addRule('valid-next-tick', ERROR) /** @since 7.5.0 */ // 3️⃣2️⃣
    .addRule('valid-template-root', ERROR) /** @since 3.11.0 */ // 3️⃣2️⃣
    .addRule('valid-v-bind', ERROR) /** @since 3.11.0 */ // 3️⃣2️⃣
    .addRule('valid-v-cloak', ERROR) /** @since 3.11.0 */ // 3️⃣2️⃣
    .addRule('valid-v-else', ERROR) /** @since 3.11.0 */ // 3️⃣2️⃣
    .addRule('valid-v-else-if', ERROR) /** @since 3.11.0 */
    .addRule('valid-v-for', ERROR) /** @since 3.11.0 */ // 3️⃣2️⃣
    .addRule('valid-v-html', ERROR) /** @since 3.11.0 */ // 3️⃣2️⃣
    .addRule('valid-v-if', ERROR) /** @since 3.11.0 */ // 3️⃣2️⃣
    .addRule('valid-v-is', vue3Severity(ERROR)) /** @since 7.0.0 */ // 3️⃣
    .addRule('valid-v-memo', vue3Severity(ERROR)) /** @since 7.16.0 */ // 3️⃣
    .addRule('valid-v-model', ERROR) /** @since 3.11.0 */ // 3️⃣2️⃣
    .addRule('valid-v-on', ERROR) /** @since 3.11.0 */ // 3️⃣2️⃣
    .addRule('valid-v-once', ERROR) /** @since 3.11.0 */ // 3️⃣2️⃣
    .addRule('valid-v-pre', ERROR) /** @since 3.11.0 */ // 3️⃣2️⃣
    .addRule('valid-v-show', ERROR) /** @since 3.11.0 */ // 3️⃣2️⃣
    .addRule('valid-v-slot', ERROR) /** @since 7.0.0 */ // 3️⃣2️⃣
    .addRule('valid-v-text', ERROR) /** @since 3.11.0 */ // 3️⃣2️⃣
    .markCategory('Priority B: Strongly Recommended')
    .addRule('attribute-hyphenation', ERROR) /** @since 3.9.0 */ // 3️⃣2️⃣
    .addRule('component-definition-name-casing', ERROR) /** @since 7.0.0 */ // 3️⃣2️⃣
    .addRule('first-attribute-linebreak', ERROR) /** @since 8.0.0 */ // 3️⃣2️⃣
    .addRule('html-closing-bracket-newline', OFF) /** @since 4.1.0 */ // 3️⃣2️⃣🟠
    .addRule('html-closing-bracket-spacing', ERROR) /** @since 4.1.0 */ // 3️⃣2️⃣🟠
    .addRule('html-end-tags', ERROR) /** @since 3.0.0 */ // 3️⃣2️⃣🟠
    .addRule('html-indent', OFF) /** @since 3.14.0 */ // 3️⃣2️⃣🟠
    .addRule('html-quotes', ERROR) /** @since 3.0.0 */ // 3️⃣2️⃣🟠
    .addRule(
      'html-self-closing',
      ERROR,
      [
        {
          html: {
            // TODO change to `never` once prettier does not `/` to the end of void elements: https://github.com/prettier/prettier/issues/15336
            void: context.packagesInfo.prettier ? 'any' : 'never',
            normal: 'never',
            component: 'never',
          },
        },
      ] /** @since 3.11.0 */,
    ) // 3️⃣2️⃣🟠
    .addRule('max-attributes-per-line', OFF) /** @since 3.12.0 */ // 3️⃣2️⃣🟠
    .addRule('multiline-html-element-content-newline', OFF) /** @since 5.0.0 */ // 3️⃣2️⃣🟠
    .addRule('mustache-interpolation-spacing', ERROR) /** @since 3.13.0 */ // 3️⃣2️⃣🟠
    .addRule('no-multi-spaces', ERROR) /** @since 3.12.0 */ // 3️⃣2️⃣🟠
    .addRule('no-spaces-around-equal-signs-in-attribute', ERROR) /** @since 5.0.0 */ // 3️⃣2️⃣🟠
    .addRule('no-template-shadow', ERROR) /** @since 5.0.0 */ // 3️⃣2️⃣
    .addRule('one-component-per-file', ERROR) /** @since 7.0.0 */ // 3️⃣2️⃣
    .addRule('prop-name-casing', ERROR) /** @since 4.3.0 */ // 3️⃣2️⃣
    .addRule('require-default-prop', OFF) /** @since 3.13.0 */ // 3️⃣2️⃣
    .addRule('require-explicit-emits', vue3Severity(ERROR)) /** @since 7.0.0 */ // 3️⃣
    .addRule('require-prop-types', ERROR) /** @since 3.9.0 */ // 3️⃣2️⃣
    .addRule('singleline-html-element-content-newline', OFF) /** @since 5.0.0 */ // 3️⃣2️⃣🟠
    .addRule('v-bind-style', ERROR, [
      'shorthand',
      {
        ...(isMin3_4 && {sameNameShorthand: 'always'}),
      },
    ]) /** @since 3.0.0 */ // 3️⃣2️⃣
    .addRule('v-on-event-hyphenation', vue3Severity(ERROR)) /** @since 7.4.0 */ // 3️⃣
    .addRule('v-on-style', ERROR) /** @since 3.0.0 */ // 3️⃣2️⃣
    .addRule('v-slot-style', ERROR) /** @since 6.0.0 */ // 3️⃣2️⃣
    .markCategory('Priority C: Recommended')
    .addRule('attributes-order', ERROR, [{ignoreVBindObject: true}]) /** @since 4.3.0 */ // 3️⃣2️⃣
    .addRule('no-lone-template', ERROR) /** @since 7.0.0 */ // 3️⃣2️⃣
    .addRule('no-multiple-slot-args', ERROR) /** @since 7.0.0 */ // 3️⃣2️⃣
    .addRule('no-v-html', ERROR) /** @since 4.7.0 */ // 3️⃣2️⃣
    .addRule('order-in-components', ERROR) /** @since 3.2.0 */ // 3️⃣2️⃣
    .addRule('this-in-template', ERROR) /** @since 3.13.0 */ // 3️⃣2️⃣
    .markCategory('Uncategorized')
    .addRule('block-lang', OFF) /** @since 7.15.0 */
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
    ]) /** @since 9.16.0 */ // 3️⃣2️⃣
    .addRule('block-tag-newline', OFF) /** @since 7.1.0 */ // 🟠
    .addRule('component-api-style', enforceApiStyle == null ? OFF : ERROR, [
      [
        enforceApiStyle === 'setup' ? 'script-setup' : 'options',
        // allows Composition API (not <script setup>)
        isVue2 ? 'composition-vue2' : 'composition',
      ],
    ]) /** @since 7.18.0 */
    .addRule('component-name-in-template-casing', ERROR, [
      'kebab-case',
      {
        registeredComponentsOnly: false,
        ignores: ['/^[A-Z][a-z]+$/' /* Single word components must start with a capital letter */],
      },
    ]) /** @since 5.0.0 */
    .addRule('component-options-name-casing', ERROR, [
      'PascalCase' /* default */,
    ]) /** @since 8.2.0 */
    .addRule('custom-event-name-casing', ERROR, [
      'kebab-case' /* default is `camelCase` */,
    ]) /** @since 7.0.0 */
    .addRule('define-emits-declaration', ERROR, [
      isMin3_3 ? 'type-literal' /* shorter syntax */ : 'type-based' /* default */,
    ]) /** @since 9.5.0 */
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
    ]) /** @since 8.7.0 */
    .addRule('define-props-declaration', ERROR, [enforcePropsDeclarationStyle]) /** @since 9.5.0 */
    .addRule('define-props-destructuring', ERROR, [{destructure: 'never'}]) /** @since 10.1.0 */
    .addRule('enforce-style-attribute', OFF) /** @since 9.20.0 */
    .addRule('html-button-has-type', ERROR) /** @since 7.6.0 */
    .addRule('html-comment-content-newline', OFF) /** @since 7.0.0 */
    .addRule('html-comment-content-spacing', OFF) /** @since 7.0.0 */
    .addRule('html-comment-indent', OFF) /** @since 7.0.0 */
    .addRule('match-component-file-name', OFF) /** @since 5.2.0 */
    .addRule('match-component-import-name', OFF) /** @since 8.7.0 */
    .addRule('max-lines-per-block', OFF) /** @since 9.15.0 */
    .addRule('max-props', OFF) /** @since 9.28.0 */
    .addRule('max-template-depth', OFF) /** @since 9.28.0 */
    .addRule('new-line-between-multi-line-property', OFF) /** @since 7.3.0 */
    .addRule('next-tick-style', OFF) /** @since 7.5.0 */
    .addRule('no-bare-strings-in-template', OFF) /** @since 7.0.0 */
    .addRule('no-boolean-default', OFF) /** @since 7.0.0 */
    .addRule('no-deprecated-delete-set', vue3Severity(ERROR)) /** @since 9.29.0 */ // 3️⃣
    .addRule('no-deprecated-model-definition', vue3Severity(ERROR)) /** @since 9.16.0 */ // 3️⃣
    .addRule('no-duplicate-attr-inheritance', ERROR) /** @since 7.0.0 */
    .addRule('no-empty-component-block', ERROR) /** @since 7.0.0 */
    .addRule('no-import-compiler-macros', ERROR) /** @since 10.0.0 */
    .addRule('no-multiple-objects-in-class', ERROR) /** @since 7.0.0 */
    .addRule('no-negated-v-if-condition', ERROR) /** @since 10.4.0 */
    .addRule('no-potential-component-option-typo', ERROR) /** @since 7.0.0 */
    .addRule('no-ref-object-reactivity-loss', ERROR) /** @since 9.17.0 */
    .addRule('no-required-prop-with-default', ERROR) /** @since 9.6.0 */ // 3️⃣2️⃣
    .addRule('no-restricted-block', OFF) /** @since 7.4.0 */
    .addRule('no-restricted-call-after-await', OFF) /** @since 7.4.0 */
    .addRule('no-restricted-class', OFF) /** @since 7.19.0 */
    .addRule('no-restricted-component-names', OFF) /** @since 9.15.0 */
    .addRule('no-restricted-component-options', OFF) /** @since 7.0.0 */
    .addRule('no-restricted-custom-event', OFF) /** @since 7.3.0 */
    .addRule(
      'no-restricted-html-elements',
      ERROR,
      getKeysOfTruthyValues({
        ...noRestrictedHtmlElementsDefault,
        ...optionsResolved.disallowedHtmlTags,
      }),
    ) /** @since 8.6.0 */
    .addRule('no-restricted-props', OFF) /** @since 7.3.0 */
    .addRule('no-restricted-static-attribute', OFF) /** @since 7.0.0 */
    .addRule('no-restricted-v-bind', OFF) /** @since 7.0.0 */
    .addRule('no-restricted-v-on', OFF) /** @since 9.21.0 */
    .addRule('no-root-v-if', OFF) /** @since 9.12.0 */
    .addRule('no-setup-props-reactivity-loss', ERROR) /** @since 9.17.0 */
    .addRule('no-static-inline-styles', OFF) /** @since 7.0.0 */
    .addRule('no-template-target-blank', OFF) /** @since 7.0.0 */
    .addRule('no-this-in-before-route-enter', ERROR) /** @since 7.11.0 */
    .addRule('no-undef-components', ERROR, [
      {
        ignorePatterns: [
          '^router-link$',
          '^router-view$',
          configNuxt && '^(?:lazy-)?(?:nuxt-|(?:client|dev)-only$)',
          ...(optionsResolved.knownComponentNames || []),
        ]
          .flat()
          .filter(Boolean),
      },
    ]) /** @since 8.4.0 */
    // TODO enable if script setup is enforced and only in JS?
    .addRule('no-undef-properties', OFF) /** @since 7.20.0 */
    .addRule('no-unsupported-features', ERROR, [
      {version: `^${vuePackageFullVersion}`},
    ]) /** @since 6.1.0 */
    .addRule('no-unused-emit-declarations', ERROR) /** @since 9.19.0 */
    .addRule('no-unused-properties', ERROR) /** @since 7.0.0 */
    .addRule('no-unused-refs', ERROR) /** @since 7.9.0 */
    .addRule('no-use-v-else-with-v-for', OFF) /** @since 9.16.0 */
    .addRule('no-useless-mustaches', ERROR) /** @since 7.0.0 */
    .addRule('no-useless-v-bind', ERROR, [
      {ignoreIncludesComment: true, ignoreStringEscape: true},
    ]) /** @since 7.0.0 */
    .addRule('no-v-text', OFF) /** @since 7.17.0 */
    .addRule('padding-line-between-blocks', ERROR) /** @since 6.2.0 */
    .addRule('padding-line-between-tags', OFF) /** @since 9.5.0 */
    .addRule('padding-lines-in-component-definition', ERROR, [
      {
        withinOption: {
          // TODO understand the difference between `betweenItems` and `withinEach`: https://eslint.vuejs.org/rules/padding-lines-in-component-definition.html
          props: 'ignore',
        },
      },
    ]) /** @since 9.9.0 */
    .addRule('prefer-define-options', isMin3_3 ? ERROR : OFF) /** @since 9.13.0 */
    .addRule('prefer-prop-type-boolean-first', ERROR) /** @since 8.6.0 */
    .addRule('prefer-separate-static-class', ERROR) /** @since 8.2.0 */
    .addRule('prefer-single-event-payload', ERROR) /** @since 10.9.0 */
    .addRule('prefer-true-attribute-shorthand', ERROR) /** @since 8.5.0 */
    .addRule('prefer-use-template-ref', preferUseTemplateRef ? ERROR : OFF) /** @since 9.31.0 */
    .addRule('prefer-v-model', ERROR) /** @since 10.9.0 */
    .addRule('require-default-export', ERROR) /** @since 9.28.0 */
    .addRule('require-direct-export', ERROR) /** @since 9.28.0 */
    .addRule('require-emit-validator', OFF) /** @since 7.10.0 */
    .addRule('require-explicit-slots', isMin3_3 ? ERROR : OFF) /** @since 9.21.0 */
    .addRule('require-expose', OFF) /** @since 7.14.0 */
    .addRule('require-macro-variable-name', ERROR) /** @since 9.15.0 */
    .addRule('require-name-property', OFF) /** @since 6.1.0 */
    .addRule('require-prop-comment', OFF) /** @since 9.8.0 */
    .addRule('require-typed-object-prop', ERROR) /** @since 9.16.0 */
    .addRule('require-typed-ref', ERROR) /** @since 9.15.0 */
    .addRule('restricted-component-names', OFF) /** @since 9.32.0 */
    .addRule('script-indent', OFF) /** @since 4.2.0 */ // 🟠
    .addRule('slot-name-casing', ERROR /* `camelCase` is default */) /** @since 9.32.0 */
    .addRule('sort-keys', OFF) /** @since 6.2.0 */
    .addRule('static-class-names-order', OFF) /** @since 6.1.0 */
    .addRule('v-for-delimiter-style', ERROR, ['in' /* default */]) /** @since 7.0.0 */
    // This rule is not required in Vue 3, as the key is automatically assigned to the elements.
    .addRule('v-if-else-key', vue2Severity(ERROR))
    // TODO change to `[inline, inline-function]` once this is landed: https://github.com/vuejs/eslint-plugin-vue/issues/2460
    .addRule('v-on-handler-style', ERROR, ['inline']) /** @since 9.7.0 */
    .addRule('valid-define-options', isMin3_3 ? ERROR : OFF) /** @since 9.13.0 */ // 3️⃣
    .markCategory('Extension Rules')
    .addRule('array-bracket-newline', OFF) /** @since 7.1.0 */ // 🟠
    .addRule('array-bracket-spacing', OFF) /** @since 5.2.0 */ // 🟠
    .addRule('array-element-newline', OFF) /** @since 9.9.0 */ // 🟠
    .addRule('arrow-spacing', OFF) /** @since 5.2.0 */ // 🟠
    .addRule('block-spacing', OFF) /** @since 5.2.0 */ // 🟠
    .addRule('brace-style', OFF) /** @since 5.2.0 */ // 🟠
    .addRule(
      'camelcase',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules.camelcase ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 5.2.0 */
    .addRule('comma-dangle', OFF) /** @since 5.2.0 */ // 🟠
    .addRule('comma-spacing', OFF) /** @since 7.0.0 */ // 🟠
    .addRule('comma-style', OFF) /** @since 7.0.0 */ // 🟠
    .addRule('dot-location', OFF) /** @since 6.0.0 */ // 🟠
    .addRule(
      'dot-notation',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['dot-notation'] ?? ERROR,
        [
          optionsResolved.noPropertyAccessFromIndexSignatureSetInTsconfigForVueFiles ? OFF : ERROR,
          inheritFromBase ? undefined : [],
        ],
      ),
    ) /** @since 7.0.0 */
    .addRule(
      'eqeqeq',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules.eqeqeq ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 5.2.0 */
    .addRule('func-call-spacing', OFF) /** @since 7.0.0 */ // 🟠
    .addRule('key-spacing', OFF) /** @since 5.2.0 */ // 🟠
    .addRule('keyword-spacing', OFF) /** @since 6.0.0 */ // 🟠
    .addRule('max-len', OFF) /** @since 6.1.0 */ // 🟠
    .addRule('multiline-ternary', OFF) /** @since 9.7.0 */ // 🟠
    .addRule('no-console', ERROR) /** @since 9.15.0 */ // Do not inherit severity and options
    .addRule(
      'no-constant-condition',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-constant-condition'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 7.5.0 */
    .addRule(
      'no-empty-pattern',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-empty-pattern'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 6.0.0 */
    .addRule('no-extra-parens', OFF) /** @since 7.0.0 */ // 🟠
    .addRule(
      'no-implicit-coercion',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-implicit-coercion'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 9.33.0 */
    .addRule(
      'no-irregular-whitespace',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-irregular-whitespace'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 6.1.0 */
    .addRule('no-literals-in-template', OFF) /** @since 10.7.0 */
    .addRule(
      'no-loss-of-precision',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-loss-of-precision'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 8.0.0 */
    .addRule(
      'no-negated-condition',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-negated-condition'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 10.4.0 */
    .addRule(
      'no-restricted-syntax',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-restricted-syntax'] ?? OFF,
        inheritFromBase ? undefined : [OFF],
      ),
    ) /** @since 5.2.0 */
    .addRule(
      'no-sparse-arrays',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-sparse-arrays'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 7.0.0 */
    .addRule('no-undef-directives', ERROR) /** @since 10.7.0 */
    .addRule(
      'no-useless-concat',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-useless-concat'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 7.0.0 */
    .addRule('object-curly-newline', OFF) /** @since 7.0.0 */ // 🟠
    .addRule('object-curly-spacing', OFF) /** @since 5.2.0 */ // 🟠
    .addRule('object-property-newline', OFF) /** @since 7.0.0 */ // 🟠
    .addRule(
      'object-shorthand',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['object-shorthand'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 8.4.0 */
    .addRule('operator-linebreak', OFF) /** @since 7.0.0 */ // 🟠
    .addRule(
      'prefer-template',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['prefer-template'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 7.0.0 */
    .addRule('quote-props', OFF) /** @since 8.4.0 */ // 🟠
    .addRule('space-in-parens', OFF) /** @since 7.0.0 */ // 🟠
    .addRule('space-infix-ops', OFF) /** @since 5.2.0 */ // 🟠
    .addRule('space-unary-ops', OFF) /** @since 5.2.0 */ // 🟠
    .addRule('template-curly-spacing', OFF) /** @since 7.0.0 */ // 🟠
    // 🔵 Not working great in Vue files
    .disableAnyRule('ts', 'prefer-function-type')
    .disableAnyRule('ts', 'unified-signatures')
    .disableAnyRule('import', 'first') // May be wrong if multiple <script> blocks are present
    .disableAnyRule('import', 'no-default-export')
    .disableAnyRule('', 'no-useless-assignment') // False positives in script setup
    .enableConfigTesterForPlugin('vue')
    .addOverrides();

  const configBuilderEnforceTypescriptInScriptSection = context.createConfigBuilder(
    // Special case: this config is always created to enable `vue/block-lang` rule
    configEnforceTypescriptInScriptSection || optionsResolved,
    'vue',
  );
  configBuilderEnforceTypescriptInScriptSection
    ?.addConfig(['vue/enforce-typescript-in-script-section', {includeDefaultFilesAndIgnores: true}])
    .addRule('block-lang', ERROR, [
      {
        script: {
          lang: 'ts',
          ...(configEnforceTypescriptInScriptSection === false && {allowNoLang: true}),
        },
      },
    ])
    .addOverrides();

  const resolvePathInVueOrNuxtProjectDir = joinPaths.bind(
    null,
    optionsResolved.vueOrNuxtProjectDir,
  );

  const configBuilderNuxt = context.createConfigBuilder(optionsNuxtResolved, 'nuxt');
  if (configNuxt) {
    configBuilderNuxt
      ?.addConfig([
        'vue/nuxt',
        {
          includeDefaultFilesAndIgnores: true,
          filesDefault: [resolvePathInVueOrNuxtProjectDir('**/*.vue')],
        },
      ])
      .addAnyRule('nuxt', 'prefer-import-meta', ERROR) /** @since 0.3.0-alpha.0 */
      .addAnyRule('nuxt', 'no-page-meta-runtime-values', ERROR) /** @since 1.14.0 */
      .addOverrides()
      .enableConfigTesterForPlugin('nuxt', {
        /* v8 ignore next */
        rulesToSkipInConfig: (ruleName) => NUXT_CONFIG_RULES.has(ruleName),
      });
  }
  const configBuilderNuxtConfig = context.createConfigBuilder(
    optionsNuxtResolved.configNuxtConfig,
    'nuxt',
  );
  if (configNuxt && optionsNuxtResolved.configNuxtConfig) {
    configBuilderNuxtConfig
      ?.addConfig([
        'vue/nuxt/nuxt-config',
        {
          includeDefaultFilesAndIgnores: true,
          filesDefault: [`**/nuxt.config.${GLOB_JS_TS_X_EXTENSION}`],
        },
      ])
      .addAnyRule('nuxt', 'nuxt-config-keys-order', ERROR) /** @since 0.6.0 */
      .addAnyRule('nuxt', 'no-nuxt-config-test-key', ERROR) /** @since 1.12.0 */
      .addOverrides()
      .enableConfigTesterForPlugin('nuxt', {
        /* v8 ignore next */
        rulesToSkipInConfig: (ruleName) => !NUXT_CONFIG_RULES.has(ruleName),
      });
  }

  const nuxtLayoutsFilesGlob = resolvePathInVueOrNuxtProjectDir('layouts/**/*.vue');

  configBuilder
    ?.addConfig('vue/allow-single-word-component-names', {
      files: [
        resolvePathInVueOrNuxtProjectDir('pages/**/*.vue'),
        resolvePathInVueOrNuxtProjectDir('views/**/*.vue'),
        configNuxt && [
          nuxtLayoutsFilesGlob,
          ...['app.vue', 'error.vue'].map((fileName) => resolvePathInVueOrNuxtProjectDir(fileName)),
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
    .addRule('require-explicit-slots', configNuxt ? OFF : null);

  configBuilder
    ?.addConfig('vue/allow-default-export', {
      files: [
        ...DEFAULT_VUE_FILES,
        configNuxt && [
          ...['plugins', 'server'].map((dir) =>
            resolvePathInVueOrNuxtProjectDir(`${nuxtV4DirectoryStructure ? '../' : ''}${dir}/**/*`),
          ),
          resolvePathInVueOrNuxtProjectDir(
            `${nuxtV4DirectoryStructure ? '' : 'app/'}router.options.${GLOB_JS_TS_EXTENSION}`,
          ),
        ],
      ]
        .flat()
        .filter((v) => typeof v === 'string'),
    })
    .disableAnyRule('import', 'no-default-export');

  const configBuilderA11y = context.createConfigBuilder(configA11y, 'vuejs-accessibility');

  // Legend:
  // 🟢 - in recommended

  configBuilderA11y
    ?.addConfig([
      'vue/a11y',
      {
        includeDefaultFilesAndIgnores: true,
        filesDefault: optionsResolved.files,
        ignoresDefault: [GLOB_MD_X_CODE_BLOCKS, ...(optionsResolved.ignores || [])],
      },
    ])
    .addRule('alt-text', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('anchor-has-content', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('aria-props', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('aria-role', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('aria-unsupported-elements', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('click-events-have-key-events', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('form-control-has-label', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('heading-has-content', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('iframe-has-title', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('interactive-supports-focus', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('label-has-for', ERROR, [{allowChildren: true}]) /** @since 0.1.0 */ // 🟢
    .addRule('media-has-caption', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('mouse-events-have-key-events', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-access-key', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-aria-hidden-on-focusable', ERROR) /** @since 2.4.0 */
    .addRule('no-autofocus', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-distracting-elements', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-redundant-roles', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-role-presentation-on-focusable', ERROR) /** @since 2.4.0 */
    .addRule('no-static-element-interactions', ERROR) /** @since 2.1.0 */ // 🟢
    .addRule('role-has-required-aria-props', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('tabindex-no-positive', ERROR) /** @since 0.1.0 */ // 🟢
    .enableConfigTesterForPlugin('vuejs-accessibility')
    .addOverrides();

  const configBuilderPinia = context.createConfigBuilder(configPinia, 'pinia');

  // Legend:
  // 🟢 - in recommended

  configBuilderPinia
    ?.addConfig([
      'pinia',
      {
        includeDefaultFilesAndIgnores: true,
        ignoresDefault: [GLOB_MD_X_CODE_BLOCKS],
        ignoresDefaultMergedWithUserIgnores: true,
      },
    ])
    .addRule('never-export-initialized-store', ERROR) /** @since 0.2.0 */ // 🟢
    .addRule('no-duplicate-store-ids', ERROR) /** @since 0.1.13 */ // 🟢
    .addRule('no-return-global-properties', ERROR) /** @since 0.1.12 */ // 🟢
    .addRule('no-store-to-refs-in-store', ERROR) /** @since 0.4.0 */ // 🟢
    .addRule('prefer-single-store-per-file', ERROR) /** @since 0.1.4 */ // 🟢
    .addRule('prefer-use-store-naming-convention', ERROR, [
      {
        checkStoreNameMismatch: true,
        storeSuffix:
          typeof configPinia === 'object' && configPinia.storesNameSuffix != null
            ? configPinia.storesNameSuffix
            : DEFAULT_PINIA_STORE_NAME_SUFFIX,
      },
    ]) /** @since 0.1.2 */ // 🟢
    .addRule('require-setup-store-properties-export', ERROR) /** @since 0.1.0 */ // 🟢
    .enableConfigTesterForPlugin('pinia')
    .addOverrides();

  const optionsI18nResolved = assignDefaults(
    configI18n,
    {} satisfies VueEslintConfigOptions['configI18n'] & object,
  );

  const {settings: pluginI18nSettings} = optionsI18nResolved;

  const configBuilderI18n = context.createConfigBuilder(configI18n, '@intlify/vue-i18n');

  // Legend:
  // 🟢 - in recommended

  const vueI18nMajorVersion = vueI18nPackageInfo?.versions.major;
  const [isMinVueI18nVersion9, isMinVueI18nVersion10] = [9, 10].map(
    (minVersion) => (vueI18nMajorVersion || 0) >= minVersion,
  );

  configBuilderI18n
    ?.addConfig([
      'vue/i18n',
      {
        includeDefaultFilesAndIgnores: true,
        filesDefault: optionsResolved.files,
        ignoresDefault: optionsResolved.ignores,
        settings: {
          'vue-i18n': pluginI18nSettings,
        },
      },
    ])
    .markCategory('Recommended')
    .addRule(
      'no-deprecated-i18n-component',
      isMinVueI18nVersion9 ? ERROR : OFF,
    ) /** @since 0.11.0 */ // 🟢
    .addRule(
      'no-deprecated-i18n-place-attr',
      isMinVueI18nVersion9 ? ERROR : OFF,
    ) /** @since 0.11.0 */ // 🟢
    .addRule(
      'no-deprecated-i18n-places-prop',
      isMinVueI18nVersion9 ? ERROR : OFF,
    ) /** @since 0.11.0 */ // 🟢
    .addRule('no-deprecated-modulo-syntax', ERROR) /** @since 3.0.0 */ // 🟢
    .addRule('no-deprecated-tc', isMinVueI18nVersion10 ? ERROR : OFF) /** @since 3.0.0 */ // 🟢
    .addRule('no-deprecated-v-t', isMinVueI18nVersion10 ? ERROR : OFF) /** @since 3.2.0 */ // 🟢
    .addRule('no-html-messages', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-i18n-t-path-prop', ERROR) /** @since 0.11.0 */ // 🟢
    .addRule('no-missing-keys', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-raw-text', ERROR) /** @since 0.2.0 */ // 🟢
    .addRule('no-v-html', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('valid-message-syntax', ERROR) /** @since 0.10.0 */ // 🟢
    .markCategory('Best Practices')
    .addRule('key-format-style', WARNING) /** @since 0.9.0 */
    .addRule('no-duplicate-keys-in-locale', ERROR) /** @since 0.9.0 */
    .addRule('no-dynamic-keys', WARNING) /** @since 0.1.0 */
    .addRule('no-missing-keys-in-other-locales', ERROR) /** @since 0.10.0 */
    .addRule('no-unknown-locale', ERROR) /** @since 1.3.0 */
    .addRule('no-unused-keys', ERROR) /** @since 0.1.0 */
    .addRule('prefer-sfc-lang-attr', ERROR) /** @since 1.2.0 */
    .addRule('valid-plural-forms', ERROR) /** @since 4.2.0 */
    .markCategory('Stylistic Issues')
    .addRule('prefer-linked-key-with-paren', WARNING) /** @since 0.10.0 */
    .addRule('sfc-locale-attr', ERROR) /** @since 1.3.0 */
    .enableConfigTesterForPlugin('@intlify/vue-i18n')
    .addOverrides();

  const optionsScopedCssResolved = assignDefaults(
    configScopedCss,
    {} satisfies VueEslintConfigOptions['configScopedCss'] & object,
  );

  const configBuilderScopedCss = context.createConfigBuilder(configScopedCss, 'vue-scoped-css');

  // Legend:
  // 3️⃣ = in recommended/vue-3
  // 2️⃣ = in recommended/vue-2

  configBuilderScopedCss
    ?.addConfig([
      'vue/scoped-css',
      {
        includeDefaultFilesAndIgnores: true,
      },
    ])
    .addRule(
      'enforce-style-type',
      typeof optionsScopedCssResolved.allowedStyleType === 'object' ? ERROR : OFF,
      [
        {
          allows: getKeysOfTruthyValues(
            {
              ...(typeof optionsScopedCssResolved.allowedStyleType === 'object' &&
                optionsScopedCssResolved.allowedStyleType),
              plain: true,
              scoped: true,
            },
            'nonEmptyArray',
          ),
        },
      ],
    ) /** @since 1.2.0 */ // 3️⃣2️⃣
    .addRule('no-deprecated-deep-combinator', ERROR) /** @since 1.0.0 */ // 3️⃣
    .addRule('no-deprecated-v-enter-v-leave-class', isVue2 ? OFF : ERROR) /** @since 1.1.0 */
    .addRule('no-parent-of-v-global', ERROR) /** @since 1.0.0 */ // 3️⃣
    .addRule('no-parsing-error', ERROR) /** @since 0.0.1 */ // 3️⃣2️⃣
    .addRule('no-unused-keyframes', ERROR) /** @since 0.1.0 */ // 3️⃣2️⃣
    .addRule('no-unused-selector', ERROR) /** @since 0.0.1 */ // 3️⃣2️⃣
    .addRule('require-selector-used-inside', OFF) /** @since 0.0.1 */
    .addRule('require-v-deep-argument', ERROR) /** @since 1.0.0 */ // 3️⃣
    .addRule('require-v-global-argument', ERROR) /** @since 1.0.0 */ // 3️⃣
    .addRule('require-v-slotted-argument', ERROR) /** @since 1.0.0 */ // 3️⃣
    .addRule('v-deep-pseudo-style', ERROR) /** @since 2.3.0 */ // 3️⃣
    .addRule('v-global-pseudo-style', ERROR) /** @since 2.3.0 */ // 3️⃣
    .addRule('v-slotted-pseudo-style', ERROR) /** @since 2.3.0 */ // 3️⃣
    .enableConfigTesterForPlugin('vue-scoped-css')
    .addOverrides();

  return {
    configs: [
      configBuilder,
      configBuilderEnforceTypescriptInScriptSection,
      configBuilderNuxt,
      configBuilderNuxtConfig,
      configBuilderA11y,
      configBuilderPinia,
      configBuilderI18n,
      configBuilderScopedCss,
    ],
    optionsResolved,
  };
}) satisfies UnConfigFn<'vue', {vanillaFinalFlatConfigRules: Partial<EslintTypedRulesConfig>}>;

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
import type {EslintSeverity} from '../eslint/eslint-types';
import {generatePackageToLoadProperty} from '../loaders';
import type {OmitStrict} from '../types';
import {
  type MaybeArray,
  allUnionMembers,
  getKeysOfTruthyValues,
  joinPaths,
  mergeArrayOrBooleanRecords,
  regexEscape,
} from '../utils';
import {
  type NuxtAutoImports,
  type ValidAndInvalidHtmlTags,
  noRestrictedHtmlElementsDefault,
  resolveFilesOption,
  resolveIgnoresOption,
  resolveUnusedDisableDirectivesReporting,
} from './shared';
import {
  type ArrayOrBooleanRecord,
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  type UnRuleOptionsByPlugin,
  type UnRulesConfigPartial,
  assignDefaults,
  defineUnConfig,
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
   * What `ts` rules will be applied to the specified `files`.
   * If you want more control over which TypeScript rules are applied to which Vue files, use `ts`
   * config options for that.
   * @default true
   */
  typescriptRules?: boolean | 'only-non-type-aware';
}

/**
 * [`@intlify/eslint-plugin-vue-i18n`](https://npmx.dev/@intlify/eslint-plugin-vue-i18n) plugin
 * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
 * that will be assigned to the `vue-i18n` property of the `settings` flat config option.
 * @see https://eslint-plugin-vue-i18n.intlify.dev/started#settings-vue-i18n
 */
export interface VueI18nPluginSettings {
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
             * - `file`: determine the locale name from the filename.
             *   The resource file should only contain messages for that locale.
             *   Use this option if you use `vue-cli-plugin-i18n`.
             *   This option is also used when String option is specified
             * - `key`: determine the locale name from the root key name of the file contents.
             *   The value of that key should only contain messages for that locale.
             *   Used when the resource file is in the format given to the `messages` option of
             *   the `VueI18n` constructor option.
             *
             * Source: plugin docs
             */
            localeKey: 'file' | 'key';
          }
        | {
            /**
             * Determine the locale name from the path.
             * In this case, the locale must be had structured with your rule on the path.
             * It can be captured with the regular expression named capture.
             * The resource file should only contain messages for that locale.
             *
             * Source: plugin docs
             */
            localeKey: 'path';

            /**
             * Specifies how to determine pattern the locale for localization messages.
             * This option means, when `localeKey` is `'path'`, you will need to capture the
             * locale using a regular expression.
             * You need to use the locale capture as a named capture `?<locale>`, so it’s be able
             * to capture from the path of the locale resources.
             * If you omit it, it will be captured from the resource path with the same regular
             * expression pattern as `vue-cli-plugin-i18n`.
             *
             * Source: plugin docs
             */
            localePattern?: string | RegExp;
          }
      ) & {
        /**
         * A glob for specifying files that store localization messages of project
         *
         * Source: plugin docs
         */
        pattern: string;
      })
  >;

  /**
   * Specify the version of `vue-i18n` you are using.
   * If not specified, the message will be parsed twice.
   *
   * Source: plugin docs
   */
  messageSyntaxVersion?: string;

  /**
   * The directory the relative `localeDir` globs are resolved against.
   * @default ESLint's working directory
   */
  cwd?: string;
}

interface I18nSubConfigOptions<ExtraPlugins extends ExtraPluginsType> extends UnFlatConfigEntryBase<
  ExtraPlugins,
  'vue-i18n'
> {}

type NuxtPluginNuxtConfigRelatedRules = 'nuxt-config-keys-order';

interface NuxtSubConfigOptions<ExtraPlugins extends ExtraPluginsType> extends UnFlatConfigEntryBase<
  ExtraPlugins,
  OmitStrict<UnRulesConfigPartial<'nuxt'>, `nuxt/${NuxtPluginNuxtConfigRelatedRules}`>
> {
  /**
   * Configures rules specific to Nuxt config file.
   *
   * 📁 Default `files`: <code>**&#47;nuxt.config.?([cm])[jt]s?(x)</code>
   *
   * Affected rule:
   * - [`nuxt/nuxt-config-keys-order`](https://github.com/nuxt/eslint/blob/main/packages/eslint-plugin/src/rules/nuxt-config-keys-order/nuxt-config-keys-order.ts)
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
   * A path to the [Nuxt build directory](https://nuxt.com/docs/4.x/api/nuxt-config#builddir),
   * absolute or relative to the current working directory, holding the generated auto-imports.
   * Only needed when they cannot be read on their own, i.e. when your Nuxt config cannot be
   * loaded, or when it sits anywhere other than the directory ESLint runs in.
   * Note that the auto-imports are all this option recovers: with no Nuxt config to read the
   * directory layout from, `vueOrNuxtProjectDir` has to be set as well unless your app happens to
   * sit where it would by default.
   * @default // read from your Nuxt config
   */
  buildDir?: string;

  /**
   * Whether the app lives in a directory of its own rather than directly at the project root.
   * The [directory structure](https://nuxt.com/docs/4.x/getting-started/upgrade#new-directory-structure)
   * Nuxt 4 introduced, and backported to Nuxt 3, is the usual reason for it, but pointing `srcDir`
   * elsewhere in a Nuxt 3 project counts just the same.
   * @default // whether your Nuxt config resolves `srcDir` away from the project root, falling back to `true` <=> Nuxt version is 4
   */
  v4DirectoryStructure?: boolean;
}

interface PiniaSubConfigOptions<
  ExtraPlugins extends ExtraPluginsType,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'pinia'> {
  /**
   * Enforces Pinia stores to be defined with the specified suffix.
   * Set to an empty string to not require any suffix.
   *
   * Affected rule:
   * - [`pinia/prefer-use-store-naming-convention`](https://github.com/lisilinhart/eslint-plugin-pinia/blob/HEAD/docs/rules/prefer-use-store-naming-convention.md)
   * @default 'Store'
   */
  storesNameSuffix?: string;
}

interface ScopedCssEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'vue-scoped-css'> {
  /**
   * Will be merged with the default value.
   * `true` does not restrict the style type.
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
const isSupportedVueMajorVersion = (
  value: number | null | undefined,
): value is SupportedVueMajorVersion => value != null && SUPPORTED_VUE_MAJOR_VERSIONS.has(value);
const DEFAULT_VUE_MAJOR_VERSION = 3 satisfies SupportedVueMajorVersion;

/**
 * [Vue.js](https://vuejs.org) specific rules.
 *
 * 📁 Default `files`: <code>**&#47;*.vue</code>
 */
export interface VueEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'vue'> {
  /**
   * Enables a11y (accessibility) rules for Vue SFC templates.
   *
   * 📁 Default `files` and `ignores`: inherited from the parent config
   *
   * 🧩 Main plugin: [`eslint-plugin-vuejs-accessibility`](https://npmx.dev/eslint-plugin-vuejs-accessibility)
   * @default true
   */
  configA11y?: boolean | UnFlatConfigEntryBase<ExtraPlugins, 'vuejs-accessibility'>;

  /**
   * Enforces the presence of `lang="ts"` in `<script>` sections.
   *
   * These files will be checked by all the `ts` config rules.
   * You can control this behavior by using `typescriptRules` option.
   *
   * 📁 Default `files` and `ignores`: inherited from the parent config.
   * Specifying them explicitly here will *override* the respective property of the parent config.
   *
   * Affected rule:
   * - [`vue/block-lang`](https://eslint.vuejs.org/rules/block-lang.html)
   * @default true <=> `ts` config is enabled
   */
  configEnforceTypescriptInScriptSection?:
    | boolean
    | EnforceTypescriptInScriptionSectionConfigOptions<ExtraPlugins>;

  /**
   * [`vue-i18n`](https://npmx.dev/vue-i18n) specific rules.
   *
   * 📁 Default `files` and `ignores`: inherited from the parent config
   *
   * 🧩 Main plugin: [`@intlify/eslint-plugin-vue-i18n`](https://npmx.dev/@intlify/eslint-plugin-vue-i18n)
   * ([docs](https://eslint-plugin-vue-i18n.intlify.dev))
   * @default true <=> `vue-i18n` package is installed
   */
  configI18n?: boolean | I18nSubConfigOptions<ExtraPlugins>;

  /**
   * Nuxt-specific rules and tweaks:
   * - Built-in Nuxt components
   *   ([`client-only`](https://nuxt.com/docs/4.x/api/components/client-only),
   *   [`dev-only`](https://nuxt.com/docs/4.x/api/components/dev-only) or any component starting
   *   with `nuxt`) will be ignored by
   *   [`vue/no-undef-components`](https://eslint.vuejs.org/rules/no-undef-components.html);
   * - Nuxt's [`app.vue`](https://nuxt.com/docs/4.x/directory-structure/app/app),
   *   [`error.vue`](https://nuxt.com/docs/4.x/directory-structure/app/error) and
   *   [layout files](https://nuxt.com/docs/4.x/directory-structure/app/layouts) will be exempted
   *   from being checked by
   *   [`vue/multi-word-component-names`](https://eslint.vuejs.org/rules/multi-word-component-names.html);
   * - Layout files will also not be subject to
   *   [`vue/require-explicit-slots`](https://eslint.vuejs.org/rules/require-explicit-slots.html)
   *   check;
   * - [Plugins](https://nuxt.com/docs/4.x/directory-structure/app/plugins) and
   *   [server](https://nuxt.com/docs/4.x/directory-structure/server) files will be allowed to do
   *   `export default`
   *   ([`import/no-default-export`](https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/docs/rules/no-default-export.md)
   *   will be turned off);
   * - [`nuxt/no-page-meta-runtime-values`](https://github.com/nuxt/eslint/blob/89618070025b4373e90b227eb478b33a13b34c8f/packages/eslint-plugin/src/rules/no-page-meta-runtime-values/no-page-meta-runtime-values.ts#L66)
   *   and
   *   [`nuxt/prefer-import-meta`](https://eslint.nuxt.com/packages/plugin#nuxtprefer-import-meta)
   *   will be applied to the specified `files` and `ignores`, defaulting to all files inside
   *   `vueOrNuxtProjectDir` directory;
   * - Another sub-config, `nuxtConfig`, will control whether
   *   [`nuxt/nuxt-config-keys-order`](https://github.com/nuxt/eslint/blob/main/packages/eslint-plugin/src/rules/nuxt-config-keys-order/nuxt-config-keys-order.ts)
   *   rule will be applied to Nuxt config file (`true` by default);
   * - [Auto-imports](https://nuxt.com/docs/4.x/guide/concepts/auto-imports) will be read from the
   *   Nuxt build directory (`.nuxt` unless `buildDir` says otherwise in your Nuxt config) and
   *   declared as globals, separately for app, `server` and `shared` code, so that
   *   [`no-undef`](https://eslint.org/docs/latest/rules/no-undef) does not report them.
   *   The auto-imported components and directives are additionally exempted from
   *   [`vue/no-undef-components`](https://eslint.vuejs.org/rules/no-undef-components.html) and
   *   [`vue/no-undef-directives`](https://eslint.vuejs.org/rules/no-undef-directives.html).
   *   Requires `nuxt prepare` (or `nuxt dev`) to have been run, since that is what generates the
   *   build directory.
   *   A bare `nuxt build` may not be enough: unless your Nuxt config sets `buildDir`, Nuxt puts a
   *   production build under `node_modules` instead.
   *   Should your Nuxt config be unreadable, which is reported as a warning, or should it live
   *   above the directory ESLint runs in, the `buildDir` option reads the auto-imports anyway.
   *
   * 📁 Default `files`: <code>**&#47;*.vue</code> inside the `vueOrNuxtProjectDir` directory
   *
   * 🧩 Main plugin: [`@nuxt/eslint-plugin`](https://npmx.dev/@nuxt/eslint-plugin)
   * ([docs](https://eslint.nuxt.com/packages/plugin))
   * @default true <=> `nuxt` package is installed
   */
  configNuxt?: boolean | NuxtSubConfigOptions<ExtraPlugins>;

  /**
   * [Pinia](https://pinia.vuejs.org) specific rules.
   * Pass a false value to disable them.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-pinia`](https://npmx.dev/eslint-plugin-pinia)
   * @default true <=> `pinia` package is installed
   */
  configPinia?: boolean | PiniaSubConfigOptions<ExtraPlugins>;

  /**
   * Scoped CSS in Vue.js related rules.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-vue-scoped-css`](https://npmx.dev/eslint-plugin-vue-scoped-css)
   * ([docs](https://future-architect.github.io/eslint-plugin-vue-scoped-css))
   * @default true
   */
  configScopedCss?: boolean | ScopedCssEslintConfigOptions<ExtraPlugins>;

  /**
   * By default auto-detected from the installed `vue` package version.
   * @default auto-detected
   */
  majorVersion?: SupportedVueMajorVersion;

  /**
   * Almost all [extension rules](https://eslint.vuejs.org/rules/#extension-rules) (with the
   * exceptions listed below) will smartly inherit the corresponding base rule's severity and
   * options.
   * If you want to disable this behavior, set this option to `false`.
   *
   * ### Exceptions
   * - [`vue/no-console`](https://eslint.vuejs.org/rules/no-console.html): all `console` calls are
   *   forbidden within the template.
   * - [`vue/dot-notation`](https://eslint.vuejs.org/rules/dot-notation.html) will inherit severity
   *   and options unless `noPropertyAccessFromIndexSignatureSetInTsconfigForVueFiles` is set to
   *   `true`, in which case the rule will be turned off.
   * - All "stylistic" rules are always turned off:
   *   [array-bracket-newline](https://eslint.vuejs.org/rules/array-bracket-newline.html),
   *   [array-bracket-spacing](https://eslint.vuejs.org/rules/array-bracket-spacing.html),
   *   [array-element-newline](https://eslint.vuejs.org/rules/array-element-newline.html),
   *   [arrow-spacing](https://eslint.vuejs.org/rules/arrow-spacing.html),
   *   [block-spacing](https://eslint.vuejs.org/rules/block-spacing.html),
   *   [brace-style](https://eslint.vuejs.org/rules/brace-style.html),
   *   [comma-dangle](https://eslint.vuejs.org/rules/comma-dangle.html),
   *   [comma-spacing](https://eslint.vuejs.org/rules/comma-spacing.html),
   *   [comma-style](https://eslint.vuejs.org/rules/comma-style.html),
   *   [dot-location](https://eslint.vuejs.org/rules/dot-location.html),
   *   [func-call-spacing](https://eslint.vuejs.org/rules/func-call-spacing.html),
   *   [key-spacing](https://eslint.vuejs.org/rules/key-spacing.html),
   *   [keyword-spacing](https://eslint.vuejs.org/rules/keyword-spacing.html),
   *   [max-len](https://eslint.vuejs.org/rules/max-len.html),
   *   [multiline-ternary](https://eslint.vuejs.org/rules/multiline-ternary.html),
   *   [no-extra-parens](https://eslint.vuejs.org/rules/no-extra-parens.html),
   *   [object-curly-newline](https://eslint.vuejs.org/rules/object-curly-newline.html),
   *   [object-curly-spacing](https://eslint.vuejs.org/rules/object-curly-spacing.html),
   *   [object-property-newline](https://eslint.vuejs.org/rules/object-property-newline.html),
   *   [operator-linebreak](https://eslint.vuejs.org/rules/operator-linebreak.html),
   *   [quote-props](https://eslint.vuejs.org/rules/quote-props.html),
   *   [space-in-parens](https://eslint.vuejs.org/rules/space-in-parens.html),
   *   [space-infix-ops](https://eslint.vuejs.org/rules/space-infix-ops.html),
   *   [space-unary-ops](https://eslint.vuejs.org/rules/space-unary-ops.html),
   *   [template-curly-spacing](https://eslint.vuejs.org/rules/template-curly-spacing.html)
   * @default true
   */
  inheritBaseRuleSeverityAndOptionsForExtensionRules?: boolean;

  /**
   * Severity to report the `eslint-disable` comments inside `<template>` that turn off nothing
   * with, `off` meaning not to report them at all.
   * Note that `off` leaves the rule itself enabled, as it is also what makes the directives inside
   * `<template>` work, so it will still be listed with a non-zero severity.
   *
   * Affected rule:
   * - [`vue/comment-directive`](https://eslint.vuejs.org/rules/comment-directive.html)
   * @default the severity the `linterOptionsReportUnusedDisableDirectives` root option sets for
   * every file
   */
  reportUnusedDisableDirectives?: EslintSeverity;

  /**
   * Regular expression patterns of the components allowed to be used without being defined.
   *
   * Will be merged with `['^router-link$', '^router-view$']` and, if `nuxt` sub-config is enabled,
   * with `^(?:lazy-)?(?:nuxt-|(?:client|dev)-only$)` for the built-in components and with `^Name$`
   * for every auto-imported one, where the name is regex-escaped.
   *
   * You can use the array or the object syntax.
   * The difference is that the object syntax allows you to exclude any of the patterns added behind
   * the scenes by setting the value to `false`, spelling the pattern exactly as above.
   *
   * Affected rule:
   * - [`vue/no-undef-components`](https://eslint.vuejs.org/rules/no-undef-components.html)
   */
  knownComponentNames?: ArrayOrBooleanRecord;

  /**
   * Names of the directives allowed to be used without being defined, written without the `v-`
   * prefix.
   * A `/pattern/flags` string is treated as a regular expression, any other string as an exact
   * name.
   *
   * Will be merged with the directives auto-imported by Nuxt if `nuxt` sub-config is enabled, each
   * of which is added both under the name as written and under its kebab-cased form.
   *
   * You can use the array or the object syntax.
   * The difference is that the object syntax allows you to exclude any of the names added behind
   * the scenes by setting the value to `false`, which takes both spellings to fully take effect.
   *
   * Affected rule:
   * - [`vue/no-undef-directives`](https://eslint.vuejs.org/rules/no-undef-directives.html)
   */
  knownDirectiveNames?: ArrayOrBooleanRecord;

  /**
   * Enforce either Composition (`setup`) or Options (`options`) API.
   * Not enforced by default.
   */
  enforceApiStyle?: 'setup' | 'options';

  /**
   * Enforce either runtime or type-based `defineProps` declarations.
   *
   * Affected rule:
   * - [`vue/define-props-declaration`](https://eslint.vuejs.org/rules/define-props-declaration.html)
   * @default 'runtime'
   */
  enforcePropsDeclarationStyle?: 'runtime' | 'type-based';

  /**
   * Whether props are expected to be destructured from
   * [`defineProps`](https://vuejs.org/api/sfc-script-setup.html#defineprops-defineemits).
   *
   * Possible values:
   * - `never` (same as `true`): props must never be destructured;
   * - `always`: props must always be destructured;
   * - `onlyWhenAssigned`: props must be destructured only when the `defineProps` result is assigned
   *   to a variable (the rule's own default);
   * - `false`: the rule is disabled.
   *
   * Note that destructured props only stay reactive since Vue 3.5.
   *
   * Affected rule:
   * - [`vue/define-props-destructuring`](https://eslint.vuejs.org/rules/define-props-destructuring.html)
   * @default 'never'
   */
  enforcePropsDestructuring?: boolean | 'never' | 'always' | 'onlyWhenAssigned';

  /**
   * Enforces the order of SFC sections: `template-first` puts `<template>` before `<script>`,
   * `script-first` does the opposite (`<style>` goes last in both cases), and an array sets the
   * order explicitly.
   *
   * Affected rule:
   * - [`vue/block-order`](https://eslint.vuejs.org/rules/block-order.html)
   * @default 'template-first'
   */
  sfcBlockOrder?: 'template-first' | 'script-first' | (WellKnownSfcBlocks | (string & {}))[];

  /**
   * Set this to `true` if `noPropertyAccessFromIndexSignature` is enabled in your `tsconfig.json`
   * for Vue files, in which case the affected rule is turned off, since it would conflict with the
   * compiler option.
   *
   * Affected rule:
   * - [`vue/dot-notation`](https://eslint.vuejs.org/rules/dot-notation.html)
   */
  noPropertyAccessFromIndexSignatureSetInTsconfigForVueFiles?: boolean;

  /**
   * Files exempted from having multi-word component names, in addition to the ones our config
   * exempts already.
   *
   * Affected rule:
   * - [`vue/multi-word-component-names`](https://eslint.vuejs.org/rules/multi-word-component-names.html)
   */
  doNotRequireComponentNamesToBeMultiWordForPatterns?: string | string[];

  /**
   * By default, all deprecated or non-standard HTML tags are disallowed.
   * Using the object syntax, you can re-allow any of them, or disallow other tags.
   * @example {marquee: false, pre: true}
   */
  disallowedHtmlTags?: Partial<Record<ValidAndInvalidHtmlTags | (string & {}), boolean>>;

  /**
   * Whether to prefer Vue 3.5
   * [`useTemplateRef`](https://vuejs.org/api/composition-api-helpers.html#usetemplateref) instead
   * of `ref` to obtain a template ref.
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
   * `pages` and Nuxt's `layouts` directories are located.
   * For Nuxt projects it defaults to the `srcDir` your Nuxt config resolves to, and otherwise to
   * the current directory `''`.
   */
  vueOrNuxtProjectDir?: string;
}

const DEFAULT_VUE_FILES: string[] = [GLOB_VUE];

const VUE_KNOWN_COMPONENT_NAME_PATTERNS = ['^router-link$', '^router-view$'];
const NUXT_KNOWN_COMPONENT_NAME_PATTERNS = ['^(?:lazy-)?(?:nuxt-|(?:client|dev)-only$)'];

const NUXT_CONFIG_RULES = new Set<string>(
  allUnionMembers<
    keyof Pick<UnRuleOptionsByPlugin['nuxt'], 'no-nuxt-config-test-key' | 'nuxt-config-keys-order'>
  >()(['no-nuxt-config-test-key', 'nuxt-config-keys-order']),
);

export interface VueConfigResult {
  optionsResolved: VueEslintConfigOptions;
}

export default defineUnConfig<VueEslintConfigOptions, ['js'], VueConfigResult>('vue', {
  enabledBy: {package: 'vue'},
  phase: 'late',
  after: ['ts'],
  needs: ['js'],
})((context, optionsRaw, {js}) => {
  const vanillaFinalFlatConfigRules = js?.finalFlatConfigRules || {};
  const isPiniaPackageInstalled = context.packagesInfo.pinia != null;
  const vueI18nPackageInfo = context.packagesInfo['vue-i18n'];
  const nuxtPackageInfo = context.packagesInfo.nuxt;

  const isTypescriptEnabled = context.configsMeta.ts.enabled;

  const vuePackageInfo = context.packagesInfo.vue;
  const vuePackageMajorVersion = vuePackageInfo?.versions.major;
  const isVuePackageMajorVersionSupported = isSupportedVueMajorVersion(vuePackageMajorVersion);

  const optionsResolved = assignDefaults(optionsRaw, {
    configEnforceTypescriptInScriptSection: isTypescriptEnabled,
    majorVersion: isVuePackageMajorVersionSupported
      ? vuePackageMajorVersion
      : DEFAULT_VUE_MAJOR_VERSION,
    configA11y: true,
    configI18n: vueI18nPackageInfo != null,
    configNuxt: nuxtPackageInfo != null,
    configPinia: isPiniaPackageInstalled,
    configScopedCss: true,
    processSfcBlocks: true,
    enforcePropsDeclarationStyle: 'runtime',
    enforcePropsDestructuring: 'never',
    inheritBaseRuleSeverityAndOptionsForExtensionRules: true,
  });
  const vueFiles = resolveFilesOption(optionsResolved.files, DEFAULT_VUE_FILES);
  optionsResolved.files = vueFiles; // Must be assigned to options for `ts` config
  if (optionsResolved.configEnforceTypescriptInScriptSection === true) {
    optionsResolved.configEnforceTypescriptInScriptSection = {
      files: vueFiles,
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
    enforcePropsDestructuring,
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

  const nuxtAutoImportsResult = configNuxt ? context.nuxtAutoImports : null;
  const nuxtAutoImports =
    nuxtAutoImportsResult && 'globals' in nuxtAutoImportsResult ? nuxtAutoImportsResult : null;
  const nuxtConfigError = nuxtAutoImportsResult?.error;
  if (nuxtConfigError != null) {
    context.logger.warn(
      nuxtAutoImports
        ? `[vue/nuxt] Your Nuxt config could not be loaded, so the auto-imports were read from \`buildDir\` but the directory layout had to be guessed: ${nuxtConfigError}. Set \`vueOrNuxtProjectDir\` if the guess is wrong`
        : `[vue/nuxt] Your Nuxt config could not be loaded, so auto-imported composables, components and directives will be reported as undefined: ${nuxtConfigError}. Set the \`buildDir\` option to read the auto-imports regardless`,
    );
  } else if (nuxtAutoImports?.isBuildDirGenerated === false) {
    context.logger.warn(
      `[vue/nuxt] \`${nuxtAutoImports.buildDir}\` has not been generated yet. Run \`nuxt prepare\`, otherwise auto-imported composables, components and directives will be reported as undefined`,
    );
  }

  const nuxtPackageMajorVersion = nuxtPackageInfo?.versions.major;
  const optionsNuxtResolved = assignDefaults(configNuxt, {
    configNuxtConfig: true,
    nuxtMajorVersion: nuxtPackageMajorVersion === 4 ? 4 : 3,
  });
  optionsNuxtResolved.v4DirectoryStructure ??=
    nuxtAutoImports?.isV4DirectoryStructure ?? optionsNuxtResolved.nuxtMajorVersion === 4;
  const {v4DirectoryStructure: nuxtV4DirectoryStructure} = optionsNuxtResolved;
  optionsResolved.vueOrNuxtProjectDir ??=
    nuxtAutoImports?.dirs?.app ?? (nuxtV4DirectoryStructure ? 'app' : '');

  context.requestParsing('vue', {
    kind: 'setUpOnly',
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ...(isTypescriptEnabled &&
          generatePackageToLoadProperty('parser', 'typescriptEslintParser')),
        sourceType: 'module' as const,
      },
    },
    entryProperties: generatePackageToLoadProperty(
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
  });

  const propsDestructurePreference =
    enforcePropsDestructuring === true
      ? 'never'
      : enforcePropsDestructuring === 'onlyWhenAssigned'
        ? 'only-when-assigned'
        : enforcePropsDestructuring;

  const knownComponentNames = mergeArrayOrBooleanRecords(
    VUE_KNOWN_COMPONENT_NAME_PATTERNS,
    configNuxt && NUXT_KNOWN_COMPONENT_NAME_PATTERNS,
    nuxtAutoImports?.componentNames.map((name) => `^${regexEscape(name)}$`),
    optionsResolved.knownComponentNames,
  );
  const knownDirectiveNames = mergeArrayOrBooleanRecords(
    nuxtAutoImports?.directiveNames,
    optionsResolved.knownDirectiveNames,
  );

  const configBuilder = context.createConfigBuilder(optionsResolved, 'vue');

  const vue2Severity = (severity: RuleSeverity) => (isVue2 ? severity : OFF);
  const vue3Severity = (severity: RuleSeverity) => (isVue3 ? severity : OFF);

  const commentDirective = resolveUnusedDisableDirectivesReporting(
    context,
    reportUnusedDisableDirectives,
  );

  // Legend:
  // 3️⃣ = in recommended/vue-3
  // 2️⃣ = in recommended/vue-2

  configBuilder
    ?.addConfig(['vue', {parseWith: 'vue'}])
    .markCategory('Base')
    .addRule('comment-directive', commentDirective.severity, [
      // false by default
      {reportUnusedDisableDirectives: commentDirective.shouldReport},
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
    .addRule('html-closing-bracket-newline', OFF) /** @since 4.1.0 */ // 3️⃣2️⃣
    .addRule('html-closing-bracket-spacing', ERROR) /** @since 4.1.0 */ // 3️⃣2️⃣
    .addRule('html-end-tags', ERROR) /** @since 3.0.0 */ // 3️⃣2️⃣
    .addRule('html-indent', OFF) /** @since 3.14.0 */ // 3️⃣2️⃣
    .addRule('html-quotes', ERROR) /** @since 3.0.0 */ // 3️⃣2️⃣
    .addRule(
      'html-self-closing',
      ERROR,
      [
        {
          html: {
            // TODO change to `never` once Prettier does not add `/` to the end of void elements: https://github.com/prettier/prettier/issues/15336
            void: context.packagesInfo.prettier ? 'any' : 'never',
            normal: 'never',
            component: 'never',
          },
        },
      ] /** @since 3.11.0 */,
    ) // 3️⃣2️⃣
    .addRule('max-attributes-per-line', OFF) /** @since 3.12.0 */ // 3️⃣2️⃣
    .addRule('multiline-html-element-content-newline', OFF) /** @since 5.0.0 */ // 3️⃣2️⃣
    .addRule('mustache-interpolation-spacing', ERROR) /** @since 3.13.0 */ // 3️⃣2️⃣
    .addRule('no-multi-spaces', ERROR) /** @since 3.12.0 */ // 3️⃣2️⃣
    .addRule('no-spaces-around-equal-signs-in-attribute', ERROR) /** @since 5.0.0 */ // 3️⃣2️⃣
    .addRule('no-template-shadow', ERROR) /** @since 5.0.0 */ // 3️⃣2️⃣
    .addRule('one-component-per-file', ERROR) /** @since 7.0.0 */ // 3️⃣2️⃣
    .addRule('prop-name-casing', ERROR) /** @since 4.3.0 */ // 3️⃣2️⃣
    .addRule('require-default-prop', OFF) /** @since 3.13.0 */ // 3️⃣2️⃣
    .addRule('require-explicit-emits', vue3Severity(ERROR)) /** @since 7.0.0 */ // 3️⃣
    .addRule('require-prop-types', ERROR) /** @since 3.9.0 */ // 3️⃣2️⃣
    .addRule('singleline-html-element-content-newline', OFF) /** @since 5.0.0 */ // 3️⃣2️⃣
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
    .addRule('block-tag-newline', OFF) /** @since 7.1.0 */
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
          'definePage', // unplugin-vue-router: https://uvr.esm.is/guide/extending-routes#definepage
          'definePageMeta', // Nuxt 3+: https://nuxt.com/docs/4.x/api/utils/define-page-meta
          'defineRouteRules', // Nuxt 3+: https://nuxt.com/docs/4.x/api/utils/define-route-rules

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
    .addRule(
      'define-props-destructuring',
      propsDestructurePreference ? ERROR : OFF,
      propsDestructurePreference ? [{destructure: propsDestructurePreference}] : undefined,
    ) /** @since 10.1.0 */
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
    .addRule('no-shadow-native-events', ERROR) /** @since 10.11.0 */
    .addRule('no-static-inline-styles', OFF) /** @since 7.0.0 */
    .addRule('no-template-target-blank', OFF) /** @since 7.0.0 */
    .addRule('no-this-in-before-route-enter', ERROR) /** @since 7.11.0 */
    .addRule(
      'no-undef-components',
      ERROR,
      knownComponentNames.length > 0 ? [{ignorePatterns: knownComponentNames}] : [],
    ) /** @since 8.4.0 */
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
    .addRule('script-indent', OFF) /** @since 4.2.0 */
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
    .addRule('array-bracket-newline', OFF) /** @since 7.1.0 */
    .addRule('array-bracket-spacing', OFF) /** @since 5.2.0 */
    .addRule('array-element-newline', OFF) /** @since 9.9.0 */
    .addRule('arrow-spacing', OFF) /** @since 5.2.0 */
    .addRule('block-spacing', OFF) /** @since 5.2.0 */
    .addRule('brace-style', OFF) /** @since 5.2.0 */
    .addRule(
      'camelcase',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules.camelcase ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 5.2.0 */
    .addRule('comma-dangle', OFF) /** @since 5.2.0 */
    .addRule('comma-spacing', OFF) /** @since 7.0.0 */
    .addRule('comma-style', OFF) /** @since 7.0.0 */
    .addRule('dot-location', OFF) /** @since 6.0.0 */
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
    .addRule('func-call-spacing', OFF) /** @since 7.0.0 */
    .addRule('key-spacing', OFF) /** @since 5.2.0 */
    .addRule('keyword-spacing', OFF) /** @since 6.0.0 */
    .addRule('max-len', OFF) /** @since 6.1.0 */
    .addRule('multiline-ternary', OFF) /** @since 9.7.0 */
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
    .addRule('no-extra-parens', OFF) /** @since 7.0.0 */
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
    .addRule(
      'no-undef-directives',
      ERROR,
      knownDirectiveNames.length > 0 ? [{ignore: knownDirectiveNames}] : [],
    ) /** @since 10.7.0 */
    .addRule(
      'no-useless-concat',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-useless-concat'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 7.0.0 */
    .addRule('object-curly-newline', OFF) /** @since 7.0.0 */
    .addRule('object-curly-spacing', OFF) /** @since 5.2.0 */
    .addRule('object-property-newline', OFF) /** @since 7.0.0 */
    .addRule(
      'object-shorthand',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['object-shorthand'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 8.4.0 */
    .addRule('operator-linebreak', OFF) /** @since 7.0.0 */
    .addRule(
      'prefer-template',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['prefer-template'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 7.0.0 */
    .addRule('quote-props', OFF) /** @since 8.4.0 */
    .addRule('space-in-parens', OFF) /** @since 7.0.0 */
    .addRule('space-infix-ops', OFF) /** @since 5.2.0 */
    .addRule('space-unary-ops', OFF) /** @since 5.2.0 */
    .addRule('template-curly-spacing', OFF) /** @since 7.0.0 */
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
    ?.addConfig([
      'vue/enforce-typescript-in-script-section',
      {
        filesDefault: vueFiles,
        ignoresDefault: resolveIgnoresOption(optionsResolved.ignores, []),
        parseWith: 'vue',
      },
    ])
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

  const resolveNuxtRootDir = (directory: string) =>
    resolvePathInVueOrNuxtProjectDir(`${nuxtV4DirectoryStructure ? '../' : ''}${directory}`);
  const nuxtServerDir = nuxtAutoImports?.dirs?.server ?? resolveNuxtRootDir('server');
  const nuxtSharedDir = nuxtAutoImports?.dirs?.shared ?? resolveNuxtRootDir('shared');

  const configBuilderNuxt = context.createConfigBuilder(optionsNuxtResolved, 'nuxt');
  if (configNuxt) {
    configBuilderNuxt
      ?.addConfig([
        'vue/nuxt',
        {
          filesDefault: [resolvePathInVueOrNuxtProjectDir('**/*.vue')],
          parseWith: 'vue',
        },
      ])
      .addAnyRule('nuxt', 'no-page-meta-runtime-values', ERROR) /** @since 1.14.0 */
      .addAnyRule('nuxt', 'prefer-import-meta', ERROR) /** @since 0.3.0-alpha.0 */
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
  if (configNuxt) {
    configBuilderNuxtConfig
      ?.addConfig([
        'vue/nuxt/nuxt-config',
        {
          filesDefault: [`**/nuxt.config.${GLOB_JS_TS_X_EXTENSION}`],
        },
      ])
      .addAnyRule('nuxt', 'no-nuxt-config-test-key', ERROR) /** @since 1.12.0 */
      .addAnyRule('nuxt', 'nuxt-config-keys-order', ERROR) /** @since 0.6.0 */
      .addOverrides()
      .enableConfigTesterForPlugin('nuxt', {
        /* v8 ignore next */
        rulesToSkipInConfig: (ruleName) => !NUXT_CONFIG_RULES.has(ruleName),
      });
  }

  if (nuxtAutoImports) {
    const codeFilesIn = (directory: string) => [
      joinPaths(directory, `**/*.${GLOB_JS_TS_X_EXTENSION}`),
      joinPaths(directory, '**/*.vue'),
    ];
    const appDir = optionsResolved.vueOrNuxtProjectDir;
    const isInsideAppDir = (directory: string) =>
      appDir === '' || appDir === '.' || directory.startsWith(`${appDir}/`);

    (
      [
        [
          'app',
          codeFilesIn(appDir),
          // Whichever of the two sits inside the app directory is matched by the globs above as
          // well, despite each context being given a different set of auto-imports
          [nuxtServerDir, nuxtSharedDir]
            .filter((directory) => isInsideAppDir(directory))
            .map((directory) => `${directory}/**`),
        ],
        ['server', codeFilesIn(nuxtServerDir)],
        ['shared', codeFilesIn(nuxtSharedDir)],
      ] satisfies [
        globalsContext: keyof NuxtAutoImports['globals'],
        files: string[],
        ignores?: string[],
      ][]
    ).forEach(([globalsContext, files, ignores]) => {
      const autoImportedNames = nuxtAutoImports.globals[globalsContext];
      if (autoImportedNames.length === 0) {
        return;
      }

      configBuilderNuxt?.addConfig(
        [`vue/nuxt/auto-imports/${globalsContext}`, {applyUserFilesAndIgnores: false}],
        {
          files,
          ...(ignores?.length && {ignores}),
          languageOptions: {
            globals: Object.fromEntries(autoImportedNames.map((name) => [name, 'readonly'])),
          },
        },
      );
    });
  }

  const nuxtLayoutsFilesGlob = resolvePathInVueOrNuxtProjectDir('layouts/**/*.vue');

  configBuilder
    ?.addConfig(
      [
        'vue/allow-single-word-component-names',
        {applyUserFilesAndIgnores: false, parseWith: 'vue'},
      ],
      {
        files: [
          resolvePathInVueOrNuxtProjectDir('pages/**/*.vue'),
          resolvePathInVueOrNuxtProjectDir('views/**/*.vue'),
          configNuxt && [
            nuxtLayoutsFilesGlob,
            ...['app.vue', 'error.vue'].map((fileName) =>
              resolvePathInVueOrNuxtProjectDir(fileName),
            ),
          ],

          optionsResolved.doNotRequireComponentNamesToBeMultiWordForPatterns,
        ]
          .flat()
          .filter((v) => typeof v === 'string'),
      },
    )
    .addRule('multi-word-component-names', OFF);

  configBuilder
    ?.addConfig(['vue/allow-implicit-slots', {applyUserFilesAndIgnores: false, parseWith: 'vue'}], {
      files: [nuxtLayoutsFilesGlob],
    })
    .addRule('require-explicit-slots', configNuxt ? OFF : null);

  configBuilder
    ?.addConfig(['vue/allow-default-export', {applyUserFilesAndIgnores: false, parseWith: 'vue'}], {
      files: [
        ...DEFAULT_VUE_FILES,
        configNuxt && [
          resolvePathInVueOrNuxtProjectDir('plugins/**/*'),
          `${nuxtServerDir}/**/*`,
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
        filesDefault: vueFiles,
        parseWith: 'vue',
        ignoresDefault: [
          GLOB_MD_X_CODE_BLOCKS,
          ...resolveIgnoresOption(optionsResolved.ignores, []),
        ],
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

  const pluginI18nSettings = context.getPluginSettings('vue-i18n');

  const configBuilderI18n = context.createConfigBuilder(configI18n, 'vue-i18n');

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
        filesDefault: vueFiles,
        ignoresDefault: resolveIgnoresOption(optionsResolved.ignores, []),
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
    .enableConfigTesterForPlugin('vue-i18n')
    .addOverrides();

  const optionsScopedCssResolved = assignDefaults(configScopedCss, {});

  const configBuilderScopedCss = context.createConfigBuilder(configScopedCss, 'vue-scoped-css');

  // Legend:
  // 3️⃣ = in recommended/vue-3
  // 2️⃣ = in recommended/vue-2

  configBuilderScopedCss
    ?.addConfig([
      'vue/scoped-css',
      {
        filesDefault: vueFiles,
        ignoresDefault: resolveIgnoresOption(optionsResolved.ignores, []),
        parseWith: 'vue',
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
    optionsResolved,
  };
});

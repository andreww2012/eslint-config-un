import type {ExtraPluginsType} from '../config-un/shared';
import type {AngularEslintConfigOptions} from './angular';
import type {AntfuEslintConfigOptions} from './antfu';
import type {ArrowReturnStyleEslintConfigOptions} from './arrow-return-style';
import type {AstroEslintConfigOptions} from './astro';
import type {AvaEslintConfigOptions} from './ava';
import type {AwsCdkEslintConfigOptions} from './aws-cdk';
import type {BarrelFilesEslintConfigOptions} from './barrel-files';
import type {BetterTailwindEslintConfigOptions} from './better-tailwind';
import type {BoundariesEslintConfigOptions} from './boundaries';
import type {CasePoliceEslintConfigOptions} from './case-police';
import type {CheckFileEslintConfigOptions} from './check-file';
import type {ClsxEslintConfigOptions} from './clsx';
import type {CommandEslintConfigOptions} from './command';
import type {TestsEslintConfigOptions} from './common/tests';
import type {CompatEslintConfigOptions} from './compat';
import type {CspellEslintConfigOptions} from './cspell';
import type {CssEslintConfigOptions} from './css';
import type {CssInJsEslintConfigOptions} from './css-in-js';
import type {CypressEslintConfigOptions} from './cypress';
import type {DeMorganEslintConfigOptions} from './de-morgan';
import type {DependEslintConfigOptions} from './depend';
import type {DocusaurusEslintConfigOptions} from './docusaurus';
import type {DrizzleEslintConfigOptions} from './drizzle';
import type {E18eEslintConfigOptions} from './e18e';
import type {EmberEslintConfigOptions} from './ember';
import type {ErasableSyntaxOnlyEslintConfigOptions} from './erasable-syntax-only';
import type {EsEslintConfigOptions} from './es';
import type {EslintCommentsEslintConfigOptions} from './eslint-comments';
import type {EslintPluginEslintConfigOptions} from './eslint-plugin';
import type {ExpectTypeEslintConfigOptions} from './expect-type';
import type {CliEslintConfigOptions} from './extra/cli';
import type {CloudfrontFunctionsEslintConfigOptions} from './extra/cloudfront-functions';
import type {NoStylisticRulesEslintConfigOptions} from './extra/no-stylistic-rules';
import type {FileProgressEslintConfigOptions} from './file-progress';
import type {FormatEslintConfigOptions} from './format';
import type {FormatjsEslintConfigOptions} from './formatjs';
import type {FunctionalEslintConfigOptions} from './functional';
import type {GithubActionsEslintConfigOptions} from './github-actions';
import type {GraphqlEslintConfigOptions} from './graphql';
import type {HeaderEslintConfigOptions} from './header';
import type {HeadersEslintConfigOptions} from './headers';
import type {HtmlEslintConfigOptions} from './html';
import type {ImportEslintConfigOptions} from './import';
import type {ImportIntegrityEslintConfigOptions} from './import-integrity';
import type {ImportZodEslintConfigOptions} from './import-zod';
import type {JestEslintConfigOptions} from './jest';
import type {JestDomEslintConfigOptions} from './jest-dom';
import type {JsEslintConfigOptions} from './js';
import type {JsInlineEslintConfigOptions} from './js-inline';
import type {JsdocEslintConfigOptions} from './jsdoc';
import type {JsonEslintConfigOptions} from './json';
import type {JsonSchemaValidatorEslintConfigOptions} from './json-schema-validator';
import type {JsoncEslintConfigOptions} from './jsonc';
import type {JsxA11yEslintConfigOptions} from './jsx-a11y';
import type {LitEslintConfigOptions} from './lit';
import type {LockfileEslintConfigOptions} from './lockfile';
import type {MarkdownEslintConfigOptions} from './markdown';
import type {MarkdownLinksEslintConfigOptions} from './markdown-links';
import type {MarkdownPreferencesEslintConfigOptions} from './markdown-preferences';
import type {MathEslintConfigOptions} from './math';
import type {MdxEslintConfigOptions} from './mdx';
import type {MobxEslintConfigOptions} from './mobx';
import type {MochaEslintConfigOptions} from './mocha';
import type {ModuleInteropEslintConfigOptions} from './module-interop';
import type {NestJsEslintConfigOptions} from './nest-js';
import type {NextJsEslintConfigOptions} from './nextjs';
import type {NgrxEslintConfigOptions} from './ngrx';
import type {NoOnlyTestsEslintConfigOptions} from './no-only-tests';
import type {NoRelativeImportPathsEslintConfigOptions} from './no-relative-import-paths';
import type {NoSecretsEslintConfigOptions} from './no-secrets';
import type {NoUnsanitizedEslintConfigOptions} from './no-unsanitized';
import type {NodeEslintConfigOptions} from './node';
import type {NodeDependenciesEslintConfigOptions} from './node-dependencies';
import type {NxEslintConfigOptions} from './nx';
import type {PackageJsonEslintConfigOptions} from './package-json';
import type {PerfectionistEslintConfigOptions} from './perfectionist';
import type {PlaywrightEslintConfigOptions} from './playwright';
import type {PnpmEslintConfigOptions} from './pnpm';
import type {PreferArrowFunctionsEslintConfigOptions} from './prefer-arrow-functions';
import type {PromiseEslintConfigOptions} from './promise';
import type {QunitEslintConfigOptions} from './qunit';
import type {QwikEslintConfigOptions} from './qwik';
import type {ReactEslintConfigOptions} from './react';
import type {RegexpEslintConfigOptions} from './regexp';
import type {RemedaEslintConfigOptions} from './remeda';
import type {RippleEslintConfigOptions} from './ripple';
import type {RxjsEslintConfigOptions} from './rxjs';
import type {SecurityEslintConfigOptions} from './security';
import type {SolidEslintConfigOptions} from './solid';
import type {SonarEslintConfigOptions} from './sonar';
import type {SqlEslintConfigOptions} from './sql';
import type {StorybookEslintConfigOptions} from './storybook';
import type {StylisticEslintConfigOptions} from './stylistic';
import type {SvelteEslintConfigOptions} from './svelte';
import type {TailwindEslintConfigOptions} from './tailwind';
import type {TanstackQueryEslintConfigOptions} from './tanstack-query';
import type {TanstackRouterEslintConfigOptions} from './tanstack-router';
import type {TanstackStartEslintConfigOptions} from './tanstack-start';
import type {TestingLibraryEslintConfigOptions} from './testing-library';
import type {TomlEslintConfigOptions} from './toml';
import type {TreeShakingEslintConfigOptions} from './tree-shaking';
import type {TsEslintConfigOptions} from './ts';
import type {TsdocEslintConfigOptions} from './tsdoc';
import type {TurboEslintConfigOptions} from './turbo';
import type {UnEslintConfigOptions} from './un';
import type {UnicornEslintConfigOptions} from './unicorn';
import type {UnnecessaryAbstractionsEslintConfigOptions} from './unnecessary-abstractions';
import type {UnocssEslintConfigOptions} from './unocss';
import type {UnusedImportsEslintConfigOptions} from './unused-imports';
import type {VitestEslintConfigOptions} from './vitest';
import type {VueEslintConfigOptions} from './vue';
import type {WebComponentsEslintConfigOptions} from './web-components';
import type {YamlEslintConfigOptions} from './yaml';
import type {YouDontNeedLodashUnderscoreEslintConfigOptions} from './you-dont-need-lodash-underscore';
import type {ZodEslintConfigOptions} from './zod';
import type {ZodOpenapiEslintConfigOptions} from './zod-openapi';

export {eslintToUnRuleSeverity, getRuleUnSeverityAndOptionsFromEntry} from '../eslint/eslint-utils';
export type {
  UnAllRuleNames,
  GetRuleOptions,
  GetRuleNamesInPlugin,
  UnRuleOptionsByPlugin,
  UnRulesConfigPartial,
  UnFlatConfigEntryBase,
} from '../eslint/eslint-types';
export type {FlatConfigEntryForBuilder} from '../config-un/config-entry-builder';
export {assignDefaults} from '../utils';
export type {ExtraPluginsType, UnConfigFn} from '../config-un/shared';

export type ArrayOrBooleanRecord<
  T extends PropertyKey = string,
  Mode extends 'boolean' | 'booleanOrMessage' | 'message' = 'boolean',
> =
  | T[]
  | Partial<
      Record<
        T,
        Mode extends 'boolean'
          ? boolean
          : Mode extends 'booleanOrMessage'
            ? boolean | string
            : string
      >
    >;

export interface UnConfigs<ExtraPlugins extends ExtraPluginsType = never> {
  /**
   * [Angular](https://angular.dev) specific rules. Supported versions: 13 to 20 (inclusive).
   *
   * You are expected to install `@angular-eslint/eslint-plugin` and
   * `@angular-eslint/eslint-plugin-template` packages of the same major version
   * as your Angular version, but installing a greater version would also likely work.
   *
   * The list of available rules will depend on the installed version of the packages.
   *
   * 📁 Default `files`: <code>**&#47;*.?([cm])[jt]s?(x)</code>
   *
   * 🧩 Main plugin: [`@angular-eslint/eslint-plugin`](https://npmx.dev/@angular-eslint/eslint-plugin) ([docs](https://github.com/angular-eslint/angular-eslint/tree/main/packages/eslint-plugin#readme))
   *
   * ⚙️ Sub config(s): `template`
   * @default true <=> [`@angular/core`](https://npmx.dev/@angular/core) package is installed
   */
  angular: AngularEslintConfigOptions<ExtraPlugins>;

  /**
   * [Anthony Fu](https://antfu.me)'s personal collection of rules.
   *
   * ⚠️ WARNING: all rules are disabled by default.
   *
   * 📁 Default `files`: <code>**&#47;*.?([cm])[jt]s?(x)</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-antfu`](https://npmx.dev/eslint-plugin-antfu) ([docs](https://github.com/antfu/eslint-plugin-antfu#readme))
   * @default false
   */
  antfu: AntfuEslintConfigOptions<ExtraPlugins>;

  /**
   * Enforces arrow function return style.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-arrow-return-style-x`](https://npmx.dev/eslint-plugin-arrow-return-style-x)
   * ([docs](https://github.com/christopher-buss/eslint-plugin-arrow-return-style-x/blob/HEAD/README.md))
   * @default true
   */
  arrowReturnStyle: ArrowReturnStyleEslintConfigOptions<ExtraPlugins>;

  /**
   * [Astro](https://astro.build) specific rules.
   *
   * 📁 Default `files`: <code>**&#47;*.astro</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-astro`](https://npmx.dev/eslint-plugin-astro) ([docs](https://ota-meshi.github.io/eslint-plugin-astro))
   *
   * ⚙️ Sub config(s): `jsxA11y`
   * @default true <=> [`astro`](https://npmx.dev/astro) package is installed
   */
  astro: AstroEslintConfigOptions<ExtraPlugins>;

  /**
   * [Ava test runner](https://avajs.dev) specific rules.
   *
   * 📁 Default `files`:
   * - <code>**&#47;*{[._-]spec,.test}.?([cm])[jt]s?(x)</code>
   * - <code>\*\*&#47;_\_test?(s)__/*\*&#47;\*.?([cm])[jt]s?(x)</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-ava`](https://npmx.dev/eslint-plugin-ava) ([docs](https://github.com/avajs/eslint-plugin-ava))
   *
   * ⚙️ Sub config(s): `noOnlyTests`
   * @default true <=> [`ava`](https://npmx.dev/ava) package is installed
   */
  ava: AvaEslintConfigOptions<ExtraPlugins>;

  /**
   * [AWS CDK](https://aws.amazon.com/cdk) specific rules.
   *
   * 📁 Default `files`: <code>**&#47;*.?([cm])ts?(x)</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-awscdk`](https://npmx.dev/eslint-plugin-awscdk) ([docs](https://eslint-plugin-awscdk.dev))
   * @default true <=> [`aws-cdk-lib`](https://npmx.dev/aws-cdk-lib) package is installed
   */
  awsCdk: AwsCdkEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin related to "barrel files" usage.
   *
   * 📁 Default `files`: <code>**&#47;*.?([cm])[jt]s?(x)</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-barrel-files`](https://npmx.dev/eslint-plugin-barrel-files)
   * ([docs](https://github.com/thepassle/eslint-plugin-barrel-files#readme))
   * @default false
   */
  barrelFiles: BarrelFilesEslintConfigOptions<ExtraPlugins>;

  /**
   * [TailwindCSS](https://tailwindcss.com) specific rules.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-better-tailwindcss`](https://npmx.dev/eslint-plugin-better-tailwindcss) ([docs](https://github.com/schoero/eslint-plugin-better-tailwindcss))
   * @default true <=> [`tailwindcss`](https://npmx.dev/tailwindcss) package is installed
   */
  betterTailwind: BetterTailwindEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin to enforce architectural boundaries in JS/TS projects.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-boundaries`](https://npmx.dev/eslint-plugin-boundaries) ([docs](https://www.jsboundaries.dev))
   * @default false
   */
  boundaries: BoundariesEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin to enforce the spelling of certain words
   * (for example, `GitHub`, not `github` or `Github`).
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-case-police`](https://npmx.dev/eslint-plugin-case-police) ([docs](https://github.com/antfu/case-police))
   * @default false
   */
  casePolice: CasePoliceEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin that enforces consistent naming conventions for files and directories.
   *
   * ⚠️ WARNING: all rules are disabled by default.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-check-file`](https://npmx.dev/eslint-plugin-check-file) ([docs](https://github.com/dukeluo/eslint-plugin-check-file#readme))
   *
   * ⚙️ Sub config(s): `enableCheckFileProcessor`
   * @default false
   */
  checkFile: CheckFileEslintConfigOptions<ExtraPlugins>;

  /**
   * A config specific to files meant to be executed. By default, allows `process.exit()`
   * and `console` methods in files placed in `bin`, `scripts` and `cli` directories
   * (on any level).
   * @default true
   */
  cli: CliEslintConfigOptions<ExtraPlugins>;

  /**
   * [Amazon CloudFront Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-functions.html) specific rules.
   *
   * [JavaScript runtime 2.0](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/functions-javascript-runtime-20.html) is assumed by default.
   * For functions written for [JavaScript runtime 1.0](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/functions-javascript-runtime-10.html),
   * use `configV1` sub-config.
   *
   * Note that if neither `files` or `ignores` are specified or is an empty array in the main
   * or a sub-config, the config won't be generated.
   *
   * ⚙️ Sub config(s): `v1`
   * @default false
   */
  cloudfrontFunctions: CloudfrontFunctionsEslintConfigOptions<ExtraPlugins>;

  /**
   * [clsx](https://github.com/lukeed/clsx) specific rules.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-clsx`](https://npmx.dev/eslint-plugin-clsx)
   * ([docs](https://github.com/temoncher/eslint-plugin-clsx#readme))
   * @default true <=> [`clsx`](https://npmx.dev/clsx) package is installed
   */
  clsx: ClsxEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin serving as a codemod triggered by special comments.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-command`](https://npmx.dev/eslint-plugin-command) ([docs](https://eslint-plugin-command.antfu.me))
   * @default false
   */
  command: CommandEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin to lint the browser compatibility of the code.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-compat`](https://npmx.dev/eslint-plugin-compat) ([docs](https://github.com/amilajack/eslint-plugin-compat))
   * @default false
   */
  compat: CompatEslintConfigOptions<ExtraPlugins>;

  /**
   * CSpell spell checker.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`@cspell/eslint-plugin`](https://npmx.dev/@cspell/eslint-plugin) ([docs](https://github.com/streetsidesoftware/cspell/tree/HEAD/packages/cspell-eslint-plugin#readme))
   * @default false
   */
  cspell: CspellEslintConfigOptions<ExtraPlugins>;

  /**
   * CSS specific rules.
   *
   * 📁 Default `files`: <code>**&#47;*.css</code>
   *
   * 🧩 Main plugin: [`@eslint/css`](https://npmx.dev/@eslint/css) ([docs](https://github.com/eslint/css))
   * @default true <=> [`stylelint`](https://npmx.dev/stylelint) package is NOT installed
   */
  css: CssEslintConfigOptions<ExtraPlugins>;

  /**
   * CSS-in-JS specific rules.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-css`](https://npmx.dev/eslint-plugin-css) ([docs](https://ota-meshi.github.io/eslint-plugin-css))
   * @default true
   */
  cssInJs: CssInJsEslintConfigOptions<ExtraPlugins>;

  /**
   * [Cypress](https://www.cypress.io) specific rules.
   *
   * 📁 Default `files`:
   * - <code>**&#47;*{[._-]spec,.test}.?([cm])[jt]s?(x)</code>
   * - <code>\*\*&#47;_\_test?(s)__/*\*&#47;\*.?([cm])[jt]s?(x)</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-cypress`](https://npmx.dev/eslint-plugin-cypress) ([docs](https://github.com/cypress-io/eslint-plugin-cypress))
   *
   * ⚙️ Sub config(s): `noOnlyTests`
   * @default true <=> [`cypress`](https://npmx.dev/cypress) package is installed
   */
  cypress: CypressEslintConfigOptions<ExtraPlugins>;

  /**
   * Enforce logical consistency by transforming negated boolean expressions according to De Morgan’s laws.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-de-morgan`](https://npmx.dev/eslint-plugin-de-morgan) ([docs](https://github.com/azat-io/eslint-plugin-de-morgan))
   * @default false
   */
  deMorgan: DeMorganEslintConfigOptions<ExtraPlugins>;

  /**
   * Enables rules from a plugin to help suggest alternatives to various dependencies.
   * [The list of replacements](https://e18e.dev/docs/replacements) is maintained by e18e community.
   *
   * ⚠️ You should probably use `e18e` config, which provides functionally the same
   * `moduleReplacements` sub-config, as well as other useful rules.
   *
   * 📁 Default `files`: <code>**&#47;package.json</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-depend`](https://npmx.dev/eslint-plugin-depend) ([docs](https://github.com/es-tooling/eslint-plugin-depend))
   * @default false
   */
  depend: DependEslintConfigOptions<ExtraPlugins>;

  /**
   * [Docusaurus](https://docusaurus.io) specific rules.
   *
   * 📁 Default `files`: <code>**&#47;*.?([cm])[jt]sx</code>
   *
   * 🧩 Main plugin: [`@docusaurus/eslint-plugin`](https://npmx.dev/@docusaurus/eslint-plugin) ([docs](https://docusaurus.io/docs/api/misc/@docusaurus/eslint-plugin))
   * @default true <=> [`@docusaurus/core`](https://npmx.dev/@docusaurus/core) package is installed
   */
  docusaurus: DocusaurusEslintConfigOptions<ExtraPlugins>;

  /**
   * [Drizzle ORM](https://orm.drizzle.team) specific rules.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-drizzle`](https://npmx.dev/eslint-plugin-drizzle) ([docs](https://github.com/drizzle-team/drizzle-orm/blob/main/eslint-plugin-drizzle/readme.md))
   * @default true <=> [`drizzle-orm`](https://npmx.dev/drizzle-orm) package is installed
   */
  drizzle: DrizzleEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin from the [e18e community](https://e18e.dev) focusing on applying
   * the e18e community's best practices and advice to JavaScript/TypeScript codebases.
   *
   * 📁 Default `files`: ❌ none, sub configs are used instead
   *
   * 🧩 Main plugin: [`@e18e/eslint-plugin`](https://npmx.dev/@e18e/eslint-plugin)
   * ([docs](https://github.com/e18e/eslint-plugin#readme))
   *
   * ⚙️ Sub config(s): `modernization`, `moduleReplacements`, `performanceImprovements`
   * @default true <=> `defaultConfigsStatus` is set to `misc-enabled`
   */
  e18e: E18eEslintConfigOptions<ExtraPlugins>;

  /**
   * [Ember](https://emberjs.com) specific rules.
   *
   * 📁 Default `files`:
   * - <code>**&#47;*.?([cm])[jt]s</code>
   * - <code>**&#47;*.{gjs,gts}</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-ember`](https://npmx.dev/eslint-plugin-ember) ([docs](https://github.com/ember-cli/eslint-plugin-ember))
   *
   * ⚙️ Sub config(s): `testFiles`
   * @default true <=> [`ember-source`](https://npmx.dev/ember-source) package is installed
   */
  ember: EmberEslintConfigOptions<ExtraPlugins>;

  /**
   * ESLint plugin to granularly enforce TypeScript's [`erasableSyntaxOnly`](https://devblogs.microsoft.com/typescript/announcing-typescript-5-8-rc/#the---erasablesyntaxonly-option) flag.
   *
   * 📁 Default `files`: <code>**&#47;*.?([cm])ts?(x)</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-erasable-syntax-only`](https://npmx.dev/eslint-plugin-erasable-syntax-only) ([docs](https://github.com/JoshuaKGoldberg/eslint-plugin-erasable-syntax-only))
   * @default false
   */
  erasableSyntaxOnly: ErasableSyntaxOnlyEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin to forbid certain JS syntax.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-es-x`](https://npmx.dev/eslint-plugin-es-x) ([docs](https://eslint-community.github.io/eslint-plugin-es-x))
   * @default false
   */
  es: EsEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin with additional rules for ESLint directive comments
   * (like `eslint-disable-next-line`).
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`@eslint-community/eslint-plugin-eslint-comments`](https://npmx.dev/@eslint-community/eslint-plugin-eslint-comments) ([docs](https://eslint-community.github.io/eslint-plugin-eslint-comments))
   * @default true
   */
  eslintComments: EslintCommentsEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin for linting ESLint plugins.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-eslint-plugin`](https://npmx.dev/eslint-plugin-eslint-plugin) ([docs](https://github.com/eslint-community/eslint-plugin-eslint-plugin))
   *
   * ⚙️ Sub config(s): `ruleTests`
   * @default false
   */
  eslintPlugin: EslintPluginEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin that provides a rule that enforces that types indicated
   * in special comments (`^?`, `$ExpectError`, `$ExpectType`, and `$ExpectTypeSnapshot`)
   * match the types of code values.
   *
   * ⚠️ WARNING: make sure that the linted files are provided with type information.
   * For that, they must be included in `files` array of `ts/configTypeAware` config
   * (they are by default).
   *
   * 📁 Default `files`: <code>**&#47;*.?([cm])ts?(x)</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-expect-type`](https://npmx.dev/eslint-plugin-expect-type) ([docs](https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type#readme))
   * @default false
   */
  expectType: ExpectTypeEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESlint plugin to print file progress.
   *
   * Even if enabled, it will be disabled by default when it's detected ESLint running
   * in CI or in editor by `ci-info` and `is-in-editor` packages respectively.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-file-progress`](https://npmx.dev/eslint-plugin-file-progress) ([docs](https://github.com/sibiraj-s/eslint-plugin-file-progress))
   * @default false
   */
  fileProgress: FileProgressEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin for formatting various languages by
   * [Prettier](https://prettier.io) or [dprint](https://dprint.dev).
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-format`](https://npmx.dev/eslint-plugin-format)
   * ([docs](https://github.com/antfu/eslint-plugin-format#readme))
   *
   * 📚 Supports multiple configs (array notation)
   * @default false
   */
  format: FormatEslintConfigOptions<ExtraPlugins>;

  /**
   * [FormatJS](https://formatjs.github.io) specific rules.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-formatjs`](https://npmx.dev/eslint-plugin-formatjs) ([docs](https://formatjs.github.io/docs/tooling/linter))
   * @default true <=> [`@formatjs/icu-messageformat-parser`](https://npmx.dev/@formatjs/icu-messageformat-parser) package is installed
   */
  formatJs: FormatjsEslintConfigOptions<ExtraPlugins>;

  /**
   * Rules enforcing functional programming patterns.
   *
   * ⚠️ WARNING: make sure that the linted files are provided with type information, or all the rules requiring it are disabled.
   * For the former, they must be included in `files` array of `ts/configTypeAware` config
   * (they are by default).
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-functional`](https://npmx.dev/eslint-plugin-functional) ([docs](https://github.com/eslint-functional/eslint-plugin-functional#readme))
   * @default false
   */
  functional: FunctionalEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin with rules for consistent, readable and valid GitHub Actions files.
   *
   * 📁 Default `files`: <code>.github/workflows/*.y?(a)ml</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-github-actions`](https://npmx.dev/eslint-plugin-github-actions)
   * ([docs](https://eslint-plugin-github-action.ntnyq.com))
   * @default true <=> `.github/workflows` directory exists
   */
  githubActions: GithubActionsEslintConfigOptions<ExtraPlugins>;

  /**
   * [GraphQL](https://graphql.org) specific rules.
   *
   * 📁 Default `files`: <code>**&#47;*.{graphql,gql}</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-graphql`](https://npmx.dev/@graphql-eslint/eslint-plugin) ([docs](https://the-guild.dev/graphql/eslint))
   *
   * ⚙️ Sub config(s): `jsProcessor`
   * @default true <=> [`graphql`](https://npmx.dev/graphql) package is installed
   */
  graphql: GraphqlEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin to ensure that files begin with the given comment.
   *
   * There is also an alternative config, `headers`, which is powered by [`eslint-plugin-headers`](https://npmx.dev/eslint-plugin-headers).
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-header`](https://npmx.dev/eslint-plugin-header) ([docs](https://github.com/Stuk/eslint-plugin-header))
   * @default false
   */
  header: HeaderEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin to ensure that files begin with the given comment.
   *
   * There is also an alternative config, `header`, which is powered by [`eslint-plugin-header`](https://npmx.dev/eslint-plugin-header).
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-headers`](https://npmx.dev/eslint-plugin-headers) ([docs](https://github.com/robmisasi/eslint-plugin-headers))
   * @default false
   */
  headers: HeadersEslintConfigOptions<ExtraPlugins>;

  /**
   * Rules for linting plain HTML files.
   *
   * 📁 Default `files`: <code>**&#47;*.{htm,html}</code>
   *
   * 🧩 Main plugin: [`@html-eslint/eslint-plugin`](https://npmx.dev/@html-eslint/eslint-plugin) ([docs](https://html-eslint.org/docs/getting-started))
   * @default true <=> `angular` config is **disabled**
   */
  html: HtmlEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin to lint `import`/`export` statements.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-import-x`](https://npmx.dev/eslint-plugin-import-x) ([docs](https://github.com/un-ts/eslint-plugin-import-x))
   * @default true
   */
  import: ImportEslintConfigOptions<ExtraPlugins>;

  /**
   * A faster alternative to `eslint-plugin-import(-x)` plugins. From the docs, it is
   * "A high-performance ESLint and Oxlint plugin for analyzing import and export
   * relationships across your codebase".
   *
   * ⚠️ Does not implement all the rules from the original plugins, does not support
   * non-JS file extensions and might require some additional setup.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`import-integrity-lint`](https://npmx.dev/import-integrity-lint) ([docs](https://github.com/nebrius/import-integrity-lint/blob/HEAD/README.md))
   * @default false
   */
  importIntegrity: ImportIntegrityEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin to enforce namespace imports for zod.
   * See [this Zod issue comment](https://github.com/colinhacks/zod/issues/4433#issuecomment-2921500831) why this might be needed.
   *
   * **Note:** you should probably use `zod` config instead, which includes the similar rule
   * and bunch of others zod rules.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-import-zod`](https://npmx.dev/eslint-plugin-import-zod) ([docs](https://github.com/samchungy/eslint-plugin-import-zod))
   * @default false
   */
  importZod: ImportZodEslintConfigOptions<ExtraPlugins>;

  /**
   * [Jest](https://jestjs.io) related rules.
   *
   * 📁 Default `files`:
   * - <code>**&#47;*{[._-]spec,.test}.?([cm])[jt]s?(x)</code>
   * - <code>\*\*&#47;_\_test?(s)__/*\*&#47;\*.?([cm])[jt]s?(x)</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-jest`](https://npmx.dev/eslint-plugin-jest) ([docs](https://github.com/jest-community/eslint-plugin-jest))
   *
   * ⚙️ Sub config(s): `jestExtended`, `noOnlyTests`, `typescript`
   * @default true <=> [`jest`](https://npmx.dev/jest) package is installed
   */
  jest: JestEslintConfigOptions<ExtraPlugins>;

  /**
   * [`@testing-library/jest-dom`](https://github.com/testing-library/jest-dom#readme)
   * specific rules. Note that, contrary to its name, this package can be used with
   * other testing libraries, for example `vitest`, so it doesn't belong to any top-level config.
   *
   * 📁 Default `files`:
   * - <code>**&#47;*{[._-]spec,.test}.?([cm])[jt]s?(x)</code>
   * - <code>\*\*&#47;_\_test?(s)__/*\*&#47;\*.?([cm])[jt]s?(x)</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-jest-dom`](https://npmx.dev/eslint-plugin-jest-dom) ([docs](https://github.com/testing-library/eslint-plugin-jest-dom#readme))
   * @default true <=> [`@testing-library/jest-dom`](https://npmx.dev/@testing-library/jest-dom) package is installed
   */
  jestDom: JestDomEslintConfigOptions<ExtraPlugins>;

  /**
   * Built-in rules for linting JavaScript & TypeScript.
   *
   * 📁 Default `files`: all files
   * @default true
   */
  js: JsEslintConfigOptions<ExtraPlugins>;

  /**
   * [JSDoc](https://jsdoc.app) related rules.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-jsdoc`](https://npmx.dev/eslint-plugin-jsdoc) ([docs](https://github.com/gajus/eslint-plugin-jsdoc))
   *
   * ⚙️ Sub config(s): `typescript`
   * @default true
   */
  jsdoc: JsdocEslintConfigOptions<ExtraPlugins>;

  /**
   * Plugin for linting `<script>` blocks inside HTML files. It does not have any
   * actual rules.
   *
   * 📁 Default `files`: <code>**&#47;*.{htm,html}</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-html`](https://npmx.dev/eslint-plugin-html) ([docs](https://github.com/BenoitZugmeyer/eslint-plugin-html))
   * @default true
   */
  jsInline: JsInlineEslintConfigOptions<ExtraPlugins>;

  /**
   * JSON, JSONC and JSON5 related rules powered by the official
   * [`@eslint/json`](https://npmx.dev/@eslint/json) language plugin.
   *
   * 📁 Default `files`: <code>**&#47;*.{json,jsonc,json5}</code>
   *
   * 🧩 Main plugin: [`@eslint/json`](https://npmx.dev/@eslint/json) ([docs](https://github.com/eslint/json))
   *
   * ⚙️ Sub config(s): `jsonc`, `json5`
   * @default false
   */
  json: JsonEslintConfigOptions<ExtraPlugins>;

  /**
   * JSON, JSONC and JSON5 related rules powered by
   * [`eslint-plugin-jsonc`](https://npmx.dev/eslint-plugin-jsonc).
   *
   * 📁 Default `files`: <code>**&#47;*.{json,jsonc,json5}</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-jsonc`](https://npmx.dev/eslint-plugin-jsonc) ([docs](https://ota-meshi.github.io/eslint-plugin-jsonc))
   *
   * ⚙️ Sub config(s): `json5`, `json`, `jsonc`
   * @default true <=> `defaultConfigsStatus` is set to `misc-enabled`
   */
  jsonc: JsoncEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin that validates data using JSON Schema Validator.
   *
   * 📁 Default `files`: <code>**&#47;*.?([cm])[jt]s?(x)</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-json-schema-validator`](https://npmx.dev/eslint-plugin-json-schema-validator)
   * ([the single rule docs](https://github.com/ota-meshi/eslint-plugin-json-schema-validator/blob/HEAD/docs/rules/no-invalid.md))
   *
   * ⚙️ Sub config(s): `json`, `yaml`, `toml`
   * @default true <=> `defaultConfigsStatus` is set to `misc-enabled`
   */
  jsonSchemaValidator: JsonSchemaValidatorEslintConfigOptions<ExtraPlugins>;

  /**
   * Provides accessibility rules for JSX. Applied to all JSX files by default.
   *
   * Note: you may want to disable this config if you're not using JSX for performance reasons.
   *
   * 📁 Default `files`: <code>**&#47;*.?([cm])[jt]sx</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-jsx-a11y`](https://npmx.dev/eslint-plugin-jsx-a11y)
   * @default true
   */
  jsxA11y: JsxA11yEslintConfigOptions<ExtraPlugins>;

  /**
   * [Lit](https://lit.dev) specific rules.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-lit`](https://npmx.dev/eslint-plugin-lit) ([docs](https://github.com/43081j/eslint-plugin-lit))
   * @default true <=> [`lit`](https://npmx.dev/lit) package is installed
   */
  lit: LitEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin to lint npm ecosystem lockfiles for security and consistency issues.
   *
   * 📁 Default `files`: <code>**&#47;package-lock.json</code>, <code>**&#47;yarn.lock</code>,
   * <code>**&#47;pnpm-lock.yaml</code>, <code>**&#47;bun.lock</code>,
   * <code>**&#47;vlt-lock.json</code>
   *
   * ⚠️ Note: specified `files` will be naively analyzed for lockfile types and corresponding
   * parser configs (named `lockfile/parser/{json,yaml}`) will be created for matched entries.
   *
   * 🧩 Main plugin: [`eslint-plugin-lockfile`](https://npmx.dev/eslint-plugin-lockfile)
   * ([docs](https://github.com/ljharb/lockfile-tools/tree/main/packages/eslint-plugin#readme))
   *
   * ⚙️ Sub config: `packageJson`
   * @default true <=> `defaultConfigsStatus` is set to `misc-enabled`
   */
  lockfile: LockfileEslintConfigOptions<ExtraPlugins>;

  /**
   * Markdown related rules.
   *
   * 📁 Default `files`: <code>**&#47;*.md</code>
   *
   * 🧩 Main plugin: [`@eslint/markdown`](https://npmx.dev/@eslint/markdown) ([docs](https://github.com/eslint/markdown))
   *
   * ⚙️ Sub config(s): `formatFencedCodeBlocks`, `sentencesPerLine`
   * @default true
   */
  markdown: MarkdownEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin that provides rules for checking the validity of links and URLs in Markdown files.
   *
   * 📁 Default `files`: <code>**&#47;*.md</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-markdown-links`](https://npmx.dev/eslint-plugin-markdown-links) ([docs](https://ota-meshi.github.io/eslint-plugin-markdown-links))
   * @default true
   */
  markdownLinks: MarkdownLinksEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin that helps enforce consistent writing style and formatting conventions in Markdown files.
   *
   * 📁 Default `files`: <code>**&#47;*.md</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-markdown-preferences`](https://npmx.dev/eslint-plugin-markdown-preferences) ([docs](https://ota-meshi.github.io/eslint-plugin-markdown-preferences))
   * @default true
   */
  markdownPreferences: MarkdownPreferencesEslintConfigOptions<ExtraPlugins>;

  /**
   * ESLint rules related to `Math` and `Number` objects.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-math`](https://npmx.dev/eslint-plugin-math) ([docs](https://ota-meshi.github.io/eslint-plugin-math))
   * @default true
   */
  math: MathEslintConfigOptions<ExtraPlugins>;

  /**
   * [MDX](https://mdxjs.com) specific rules.
   *
   * 📁 Default `files`: <code>**&#47;*.mdx</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-mdx`](https://npmx.dev/eslint-plugin-mdx) ([docs](https://github.com/mdx-js/eslint-mdx))
   *
   * ⚙️ Sub config(s): `formatFencedCodeBlocks`
   * @default true
   */
  mdx: MdxEslintConfigOptions<ExtraPlugins>;

  /**
   * [MobX](https://mobx.js.org) specific rules.
   *
   * 📁 Default `files`: <code>**&#47;*.?([cm])[jt]s?(x)</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-mobx`](https://npmx.dev/eslint-plugin-mobx) ([docs](https://github.com/mobxjs/mobx/blob/main/packages/eslint-plugin-mobx/README.md))
   * @default true <=> [`mobx`](https://npmx.dev/mobx) package is installed
   */
  mobx: MobxEslintConfigOptions<ExtraPlugins>;

  /**
   * [Mocha](https://mochajs.org) specific rules.
   *
   * 📁 Default `files`:
   * - <code>**&#47;*{[._-]spec,.test}.?([cm])[jt]s?(x)</code>
   * - <code>\*\*&#47;_\_test?(s)__/*\*&#47;\*.?([cm])[jt]s?(x)</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-mocha`](https://npmx.dev/eslint-plugin-mocha) ([docs](https://github.com/lo1tuma/eslint-plugin-mocha))
   *
   * ⚙️ Sub config(s): `noOnlyTests`
   * @default true
   */
  mocha: MochaEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin with rules for module interoperability.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-module-interop`](https://npmx.dev/eslint-plugin-module-interop) ([docs](https://ota-meshi.github.io/eslint-plugin-module-interop))
   * @default true
   */
  moduleInterop: ModuleInteropEslintConfigOptions<ExtraPlugins>;

  /**
   * [NestJS](https://nestjs.com) specific rules.
   *
   * ⚠️ WARNING: make sure that the linted files are provided with type information.
   * For that, they must be included in `files` array of `ts/configTypeAware` config
   * (they are by default).
   *
   * 📁 Default `files`: <code>**&#47*.?([cm])ts</code>
   *
   * 🧩 Main plugin: [`@darraghor/eslint-plugin-nestjs-typed`](https://npmx.dev/@darraghor/eslint-plugin-nestjs-typed) ([docs](https://github.com/darraghoriordan/eslint-plugin-nestjs-typed#readme))
   * @default true <=> [`@nestjs/core`](https://npmx.dev/@nestjs/core) package is installed
   */
  nestJs: NestJsEslintConfigOptions<ExtraPlugins>;

  /**
   * [Next.js](https://nextjs.org) specific rules.
   *
   * 📁 Default `files`: <code>**&#47;*.?([cm])[jt]s?(x)</code>
   *
   * 🧩 Main plugin: [`@next/eslint-plugin-next`](https://npmx.dev/@next/eslint-plugin-next) ([docs](https://nextjs.org/docs/app/api-reference/config/eslint))
   * @default true <=> [`next`](https://npmx.dev/next) package is installed
   */
  nextJs: NextJsEslintConfigOptions<ExtraPlugins>;

  /**
   * [NgRx](https://ngrx.io) specific rules.
   *
   * 📁 Default `files`: <code>**&#47;*.?([cm])[jt]s?(x)</code>
   *
   * 🧩 Main plugin: [`@ngrx/eslint-plugin`](https://npmx.dev/@ngrx/eslint-plugin) ([docs](https://ngrx.io/guide/eslint-plugin))
   * @default true <=> [`@ngrx/store`](https://npmx.dev/@ngrx/store) package is installed
   */
  ngrx: NgrxEslintConfigOptions<ExtraPlugins>;

  /**
   * Node.js code specific rules.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-n`](https://npmx.dev/eslint-plugin-n) ([docs](https://github.com/eslint-community/eslint-plugin-n))
   * @default true
   */
  node: NodeEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin to check Node.js dependencies.
   *
   * ⚠️ Note that this plugin is considered experimental.
   *
   * 📁 Default `files`: <code>**&#47;package.json</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-node-dependencies`](https://npmx.dev/eslint-plugin-node-dependencies) ([docs](https://ota-meshi.github.io/eslint-plugin-node-dependencies))
   * @default true <=> `defaultConfigsStatus` is set to `misc-enabled`
   */
  nodeDependencies: NodeDependenciesEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin to prevent focused (`.only`) tests. Also included in
   * testing framework's configs as a sub-config.
   *
   * 📁 Default `files`:
   * - <code>**&#47;*{[._-]spec,.test}.?([cm])[jt]s?(x)</code>
   * - <code>\*\*&#47;_\_test?(s)__/*\*&#47;\*.?([cm])[jt]s?(x)</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-no-only-tests`](https://npmx.dev/eslint-plugin-no-only-tests) ([docs](https://github.com/levibuzolic/no-only-tests))
   * @default false
   */
  noOnlyTests: NoOnlyTestsEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin to disallow relative import paths.
   *
   * ⚠️ WARNING: requires your project to support absolute imports (e.g. via `tsconfig.json`'s `baseUrl`).
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-no-relative-import-paths`](https://npmx.dev/eslint-plugin-no-relative-import-paths) ([docs](https://github.com/MelvinVermeer/eslint-plugin-no-relative-import-paths/blob/HEAD/README.md))
   * @default false
   */
  noRelativeImportPaths: NoRelativeImportPathsEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin that offers a rule that searches for potential secrets/keys in code
   * and JSON files.
   *
   * 📁 Default `files`: <code>**&#47;*.?([cm])[jt]s?(x)</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-no-secrets`](https://npmx.dev/eslint-plugin-no-secrets) ([docs](https://github.com/nickdeis/eslint-plugin-no-secrets#readme))
   *
   * ⚙️ Sub config(s): `json`
   * @default true
   */
  noSecrets: NoSecretsEslintConfigOptions<ExtraPlugins>;

  /**
   * If you integrate eslint-config-un into an existing project, you might encounter a lot of
   * reports from rules that are merely about stylistic and other choices, not the ones
   * that can potentially find bugs and other kind of problems in your code.
   * Use this config to globally disable all such rules, or conversely enable only them,
   * or some of them.
   *
   * 📁 Default `files`: all files
   * @default false
   */
  noStylisticRules: NoStylisticRulesEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin with rules to disallow unsafe coding practices that may result
   * in security vulnerabilities.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-no-unsanitized`](https://npmx.dev/eslint-plugin-no-unsanitized) ([docs](https://github.com/mozilla/eslint-plugin-no-unsanitized))
   * @default true
   */
  noUnsanitized: NoUnsanitizedEslintConfigOptions<ExtraPlugins>;

  /**
   * [Nx](https://nx.dev) specific rules.
   *
   * 📁 Default `files`: <code>**&#47;*.?([cm])ts?(x)</code>
   *
   * 🧩 Main plugin: [`@nx/eslint-plugin`](https://npmx.dev/@nx/eslint-plugin) ([docs](https://nx.dev/technologies/eslint/eslint-plugin))
   * @default true <=> [`nx`](https://npmx.dev/nx) package is installed
   */
  nx: NxEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin with rules for consistent, readable, and valid package.json files.
   *
   * 📁 Default `files`: <code>**&#47;package.json</code>
   *
   * 🧩 Main plugins:
   * - [`eslint-plugin-package-json`](https://npmx.dev/eslint-plugin-package-json) ([docs](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json))
   * - (if `enforceAbsoluteVersion` option is used) [`eslint-plugin-node-dependencies`](https://npmx.dev/eslint-plugin-node-dependencies) ([docs](https://ota-meshi.github.io/eslint-plugin-node-dependencies))
   *
   * 📚 Supports multiple configs (array notation)
   * @default true
   */
  packageJson: PackageJsonEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin that provides rules for sorting various data, such as
   * objects, imports, TypeScript types, etc.
   *
   * ⚠️ WARNING: all rules are disabled by default.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-perfectionist`](https://npmx.dev/eslint-plugin-perfectionist) ([docs](https://perfectionist.dev))
   *
   * ⚙️ Sub config(s): `sort*` (config for every `sort-` rule from the plugin)
   * @default false
   */
  perfectionist: PerfectionistEslintConfigOptions<ExtraPlugins>;

  /**
   * [Playwright](https://playwright.dev) specific rules.
   *
   * 📁 Default `files`:
   * - <code>**&#47;*{[._-]spec,.test}.?([cm])[jt]s?(x)</code>
   * - <code>\*\*&#47;_\_test?(s)__/*\*&#47;\*.?([cm])[jt]s?(x)</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-playwright`](https://npmx.dev/eslint-plugin-playwright) ([docs](https://github.com/playwright-community/eslint-plugin-playwright))
   *
   * ⚙️ Sub config(s): `noOnlyTests`
   * @default true <=> [`playwright`](https://npmx.dev/playwright) package is installed
   */
  playwright: PlaywrightEslintConfigOptions<ExtraPlugins>;

  /**
   * Rules specific to pnpm package manager.
   *
   * 📁 Default `files`: ❌ none, sub configs are used instead
   *
   * 🧩 Main plugin: [`eslint-plugin-pnpm`](https://npmx.dev/eslint-plugin-pnpm)
   *
   * ⚙️ Sub config(s): `packageJson`, `pnpmWorkspace`
   * @default true <=> pnpm is detected as a used package manager by [`package-manager-detector`](https://npmx.dev/package-manager-detector)
   */
  pnpm: PnpmEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint Plugin to lint and auto-fix plain functions into arrow functions,
   * in all cases where conversion would result in the same behavior.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-prefer-arrow-functions`](https://npmx.dev/eslint-plugin-prefer-arrow-functions) ([docs](https://github.com/JamieMason/eslint-plugin-prefer-arrow-functions))
   * @default false
   */
  preferArrowFunctions: PreferArrowFunctionsEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin enforcing best practices for promises handling.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-promise`](https://npmx.dev/eslint-plugin-promise) ([docs](https://github.com/eslint-community/eslint-plugin-promise))
   * @default true
   */
  promise: PromiseEslintConfigOptions<ExtraPlugins>;

  /**
   * [QUnit](https://qunitjs.com) specific rules.
   *
   * 📁 Default `files`:
   * - <code>**&#47;*{[._-]spec,.test}.?([cm])[jt]s?(x)</code>
   * - <code>\*\*&#47;_\_test?(s)__/*\*&#47;\*.?([cm])[jt]s?(x)</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-qunit`](https://npmx.dev/eslint-plugin-qunit) ([docs](https://github.com/platinumazure/eslint-plugin-qunit))
   *
   * ⚙️ Sub config(s): `noOnlyTests`
   * @default true <=> [`qunit`](https://npmx.dev/qunit) package is installed
   */
  qunit: QunitEslintConfigOptions<ExtraPlugins>;

  /**
   * [qwik](https://qwik.dev) specific rules.
   *
   * 📁 Default `files`: <code>**&#47;*.?([cm])[jt]s?(x)</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-qwik`](https://npmx.dev/eslint-plugin-qwik) ([docs](https://qwik.dev/docs/advanced/eslint))
   * @default true <=> [`@builder.io/qwik`](https://npmx.dev/@builder.io/qwik) or [`@qwik.dev/core`](https://npmx.dev/@qwik.dev/core) package is installed
   */
  qwik: QwikEslintConfigOptions<ExtraPlugins>;

  /**
   * [React](https://react.dev) specific rules.
   *
   * 📁 Default `files`: <code>**&#47;*.?([cm])[jt]s?(x)</code>
   *
   * 🧩 Plugin(s):
   * - [`eslint-plugin-react`](https://npmx.dev/eslint-plugin-react)
   * - [`@eslint-react/eslint-plugin`](https://npmx.dev/@eslint-react/eslint-plugin)
   * **with `eslint-react` prefix**
   * - [`eslint-plugin-react-hooks`](https://npmx.dev/eslint-plugin-react-hooks)
   *
   * Since `eslint-plugin-react` and `@eslint-react/eslint-plugin` have some overlapping rules,
   * and `eslint-plugin-react` has some rules that are not relevant in modern codebases,
   * there exists an option to control which rules from which plugins, if any, will be used.
   * Refer to `pluginX` option JSDoc for more details.
   *
   * ⚙️ Sub config(s): `allowDefaultExportsInJsxFiles`, `dom`, `hooks`, `reactX`, `refresh`, `youMightNotNeedAnEffect`
   *
   * - `allowDefaultExportsInJsxFiles`: micro config to allow default exports in all JSX files.
   * - `reactX`: runtime agnostic ("X") and "Name Convention" rules from `@eslint-react/eslint-plugin`.
   * - `hooks`: rules from `eslint-plugin-react-hooks` as well as "Hooks Extra" rules from `@eslint-react/eslint-plugin`.
   * - `dom`: DOM specific rules from both `@eslint-react/eslint-plugin` and `eslint-plugin-react`.
   * - `refresh`: rules from `eslint-plugin-react-refresh`.
   * - `youMightNotNeedAnEffect`: rules from `eslint-plugin-react-you-might-not-need-an-effect`.
   * @default true <=> [`react`](https://npmx.dev/react) package is installed
   */
  react: ReactEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin that finds RegExp mistakes and stylistic issues.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-regexp`](https://npmx.dev/eslint-plugin-regexp) ([docs](https://ota-meshi.github.io/eslint-plugin-regexp))
   * @default true
   */
  regexp: RegexpEslintConfigOptions<ExtraPlugins>;

  /**
   * [Remeda](https://remedajs.com) specific rules.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-remeda`](https://npmx.dev/eslint-plugin-remeda) ([docs](https://github.com/AndreaPontrandolfo/eslint-plugin-remeda/blob/HEAD/README.md))
   * @default true <=> [`remeda`](https://npmx.dev/remeda) package is installed
   */
  remeda: RemedaEslintConfigOptions<ExtraPlugins>;

  /**
   * [Ripple](https://github.com/Ripple-TS/ripple) specific rules.
   *
   * 📁 Default `files`:
   * - <code>**&#47;*.tsrx</code>
   * - <code>**&#47;*.ripple</code>
   * - <code>**&#47;*.?([cm])[jt]s</code>
   *
   * 🧩 Main plugin: [`@tsrx/eslint-plugin`](https://npmx.dev/@tsrx/eslint-plugin) ([docs](https://github.com/Ripple-TS/ripple/blob/HEAD/packages/eslint-plugin/README.md))
   *
   * ⚙️ Sub config(s): `setup`
   * @default true <=> [`ripple`](https://npmx.dev/ripple) package is installed
   */
  ripple: RippleEslintConfigOptions<ExtraPlugins>;

  /**
   * [RxJS](https://rxjs.dev) specific rules.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`@smarttools/eslint-plugin-rxjs`](https://npmx.dev/@smarttools/eslint-plugin-rxjs) ([docs](https://github.com/DaveMBush/eslint-plugin-rxjs))
   * @default true <=> [`rxjs`](https://npmx.dev/rxjs) package is installed
   */
  rxjs: RxjsEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin that help identify potential security issues, but ⚠️ finds
   * a lot of false positives which need triage by a human.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-security`](https://npmx.dev/eslint-plugin-security) ([docs](https://github.com/eslint-community/eslint-plugin-security))
   * @default true <=> `defaultConfigsStatus` is set to `misc-enabled`
   */
  security: SecurityEslintConfigOptions<ExtraPlugins>;

  /**
   * [SolidJS](https://www.solidjs.com) specific rules.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-solid`](https://npmx.dev/eslint-plugin-solid) ([docs](https://github.com/solidjs-community/eslint-plugin-solid))
   * @default true <=> [`solid-js`](https://npmx.dev/solid-js) package is installed
   */
  solid: SolidEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin with multitude of different rules from
   * [SonarSource](https://www.sonarsource.com).
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-sonarjs`](https://npmx.dev/eslint-plugin-sonarjs) ([docs](https://github.com/SonarSource/SonarJS/tree/master/packages/jsts/src/rules#eslint-plugin-sonarjs-))
   * @default true
   */
  sonar: SonarEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin related to SQL queries written in `sql` template literal tag.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-sql`](https://npmx.dev/eslint-plugin-sql)
   * ([docs](https://github.com/gajus/eslint-plugin-sql#readme))
   * @default false
   */
  sql: SqlEslintConfigOptions<ExtraPlugins>;

  /**
   * [Storybook](https://storybook.js.org) specific rules.
   *
   * 📁 Default `files`: <code>**&#47;*.{stories,story}.?([cm])[jt]s?(x)</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-storybook`](https://npmx.dev/eslint-plugin-storybook) ([docs](https://storybook.js.org/docs/configure/integration/eslint-plugin))
   * @default true <=> [`storybook`](https://npmx.dev/storybook) package is installed
   */
  storybook: StorybookEslintConfigOptions<ExtraPlugins>;

  /**
   * Stylistic/formatting only rules for JS/TS(X). Only small number of rules
   * are enabled by default.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`@stylistic/eslint-plugin`](https://npmx.dev/@stylistic/eslint-plugin) ([docs](https://eslint.style))
   * @default true
   */
  stylistic: StylisticEslintConfigOptions<ExtraPlugins>;

  /**
   * [Svelte](https://svelte.dev) specific rules.
   *
   * 📁 Default `files`: <code>**&#47;*.svelte</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-svelte`](https://npmx.dev/eslint-plugin-svelte) ([docs](https://sveltejs.github.io/eslint-plugin-svelte))
   * @default true <=> [`svelte`](https://npmx.dev/svelte) package is installed
   */
  svelte: SvelteEslintConfigOptions<ExtraPlugins>;

  /**
   * [Tailwind CSS](https://tailwindcss.com) specific rules, the "original" plugin.
   *
   * ⚠️ WARNING: disabled by default, superseded by `betterTailwind` config
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-tailwindcss`](https://npmx.dev/eslint-plugin-tailwindcss) ([docs](https://github.com/francoismassart/eslint-plugin-tailwindcss))
   * @default false
   */
  tailwind: TailwindEslintConfigOptions<ExtraPlugins>;

  /**
   * [TanStack Query](https://tanstack.com/query) specific rules.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`@tanstack/eslint-plugin-query`](https://npmx.dev/@tanstack/eslint-plugin-query) ([docs](https://tanstack.com/query/v5/docs/eslint/eslint-plugin-query))
   * @default true <=> [`@tanstack/query-core`](https://npmx.dev/@tanstack/query-core) package is installed (dependency of all `@tanstack/*-query` packages)
   */
  tanstackQuery: TanstackQueryEslintConfigOptions<ExtraPlugins>;

  /**
   * [TanStack Router](https://tanstack.com/router) specific rules.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-tanstack-router`](https://npmx.dev/eslint-plugin-tanstack-router)
   * ([docs](https://tanstack.com/router/latest/docs/eslint/eslint-plugin-router))
   * @default true <=> [`foo`](https://npmx.dev/foo) package is installed
   */
  tanstackRouter: TanstackRouterEslintConfigOptions<ExtraPlugins>;

  /**
   * [TanStack Start](https://tanstack.com/start) specific rules.
   *
   * 📁 Default `files`: <code>**&#47;*.?([cm])ts?(x)</code>
   *
   * 🧩 Main plugin: [`@tanstack/eslint-plugin-start`](https://npmx.dev/@tanstack/eslint-plugin-start) ([docs (not plugin-specific)](https://tanstack.com/start))
   * @default true <=> [`@tanstack/react-start`](https://npmx.dev/@tanstack/react-start) or [`@tanstack/solid-start`](https://npmx.dev/@tanstack/solid-start) package is installed
   */
  tanstackStart: TanstackStartEslintConfigOptions<ExtraPlugins>;

  /**
   * [Testing Library](https://testing-library.com) specific rules.
   *
   * 📁 Default `files`:
   * - <code>**&#47;*.{spec,test}.?([cm])[jt]s?(x)</code>
   * - <code>\*\*&#47;_\_test?(s)__/*\*&#47;\*.?([cm])[jt]s?(x)</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-testing-library`](https://npmx.dev/eslint-plugin-testing-library) ([docs](https://github.com/testing-library/eslint-plugin-testing-library))
   *
   * ⚙️ Sub config(s): `angular`, `marko`, `react`, `svelte`, `vue`
   * @default true <=> [`@testing-library/dom`](https://npmx.dev/@testing-library/dom) package is installed
   */
  testingLibrary: TestingLibraryEslintConfigOptions<ExtraPlugins>;

  /**
   * Disables mostly performance rules for most of the well known test file patterns.
   *
   * It is put before all the other Configs to allow for overrides.
   *
   * 📁 Default `files`:
   * - <code>**&#47*[.-_]spec.?([cm])[jt]s?(x)</code>
   * - <code>**&#47*.test.?([cm])[jt]s?(x)</code>
   * - <code>\*\*&#47__test?(s)__&#47**&#47*.?([cm])[jt]s?(x)</code>
   * - <code>**&#47*.{bench,benchmark}.?([cm])[jt]s?(x)</code>
   * - <code>**&#47*.cy.?([cm])[jt]s?(x)</code>
   * - <code>**&#47*.{stories,story}.?([cm])[jt]s?(x)</code>
   *
   * Disabled rules:
   * - `no-empty-function`
   * - `e18e/no-delete-property`
   * - `e18e/prefer-static-collator`
   * - `e18e/prefer-static-regex`
   * - `sonarjs/no-hardcoded-ip`
   * - `sonarjs/no-hardcoded-passwords`
   * - `sonarjs/no-hardcoded-secrets`
   * - `sonarjs/no-clear-text-protocols`
   * - `ts/no-extraneous-class`
   * - `ts/no-empty-function`
   * - `unicorn/template-indent`
   * @default true
   */
  tests: TestsEslintConfigOptions<ExtraPlugins>;

  /**
   * TOML specific rules.
   *
   * 📁 Default `files`: <code>**&#47;*.toml</code>
   *
   * If `ignores` is explicitly specified, it still be merged with the default ignore list,
   * excluding items specified in `ignoresAdditional`.
   *
   * The default ignore list: <code>**&#47;Cargo.lock</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-toml`](https://npmx.dev/eslint-plugin-toml) ([docs](https://ota-meshi.github.io/eslint-plugin-toml))
   * @default true <=> `defaultConfigsStatus` is set to `misc-enabled`
   */
  toml: TomlEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin providing a rule to identify patterns that will interfere with
   * the tree-shaking algorithm of their module bundler.
   *
   * 📁 Default `files`: <code>**&#47;*.?([cm])[jt]s?(x)</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-tree-shaking`](https://npmx.dev/eslint-plugin-tree-shaking) ([docs](https://github.com/lukastaegert/eslint-plugin-tree-shaking#readme))
   * @default false
   */
  treeShaking: TreeShakingEslintConfigOptions<ExtraPlugins>;

  /**
   * [TypeScript](https://www.typescriptlang.org) specific rules.
   *
   * ⚠️ Note that if `files` is an empty array, `typeAware` sub-config will be disabled too,
   * unless its `files` are explicitly specified.
   *
   * 📁 Default `files`: <code>**&#47;*.?([cm])ts?(x)</code>
   *
   * 🧩 Main plugin: [`typescript-eslint`](https://npmx.dev/typescript-eslint) ([docs](https://typescript-eslint.io))
   *
   * ⚙️ Sub config(s): `noTypeAssertion`, `sortTsconfigKeys`, `typeAware`
   * @default true
   */
  ts: TsEslintConfigOptions<ExtraPlugins>;

  /**
   * [TSDoc](https://tsdoc.org) specific rules.
   *
   * 📁 Default `files`: <code>**&#47;*.?([cm])ts?(x)</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-tsdoc`](https://npmx.dev/eslint-plugin-tsdoc) ([docs](https://tsdoc.org/pages/packages/eslint-plugin-tsdoc))
   * @default false
   */
  tsdoc: TsdocEslintConfigOptions<ExtraPlugins>;

  /**
   * [Turborepo](https://turborepo.com) specific rules.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-turbo`](https://npmx.dev/eslint-plugin-turbo) ([docs](https://turborepo.com/docs/reference/eslint-plugin-turbo))
   * @default true <=> [`turbo`](https://npmx.dev/turbo) package is installed
   */
  turbo: TurboEslintConfigOptions<ExtraPlugins>;

  /**
   * Rules not included in any other plugins, provided by us and collected under `un` prefix.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Plugin(s): Built-in eslint-plugin-un
   * @default true
   */
  un: UnEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin with various rules.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-unicorn`](https://npmx.dev/eslint-plugin-unicorn) ([docs](https://github.com/sindresorhus/eslint-plugin-unicorn))
   * @default true
   */
  unicorn: UnicornEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin with rules to detect and prevent some unnecessary code abstractions.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-unnecessary-abstractions`](https://npmx.dev/eslint-plugin-unnecessary-abstractions) ([docs](https://github.com/personalyisus/eslint-plugin-unnecessary-abstractions#readme))
   * @default true
   */
  unnecessaryAbstractions: UnnecessaryAbstractionsEslintConfigOptions<ExtraPlugins>;

  /**
   * [UnoCSS](https://unocss.dev) specific rules.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`@unocss/eslint-plugin`](https://npmx.dev/@unocss/eslint-plugin) ([docs](https://unocss.dev/integrations/eslint))
   * @default true <=> [`unocss`](https://npmx.dev/unocss) package is installed
   */
  unocss: UnocssEslintConfigOptions<ExtraPlugins>;

  /**
   * Provides an autofix to remove unused imports.
   *
   * Note: `typescript-eslint` since v8.53.0 has built-in ability for
   * [`ts/no-unused-vars`](https://typescript-eslint.io/rules/no-unused-vars) rule
   * to [automatically remove unused imports](https://typescript-eslint.io/rules/no-unused-vars/#enableautofixremovalimports).
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-unused-imports`](https://npmx.dev/eslint-plugin-unused-imports)
   *
   * ⚙️ Sub config(s): `noUnusedVars`
   * @default false
   */
  unusedImports: UnusedImportsEslintConfigOptions<ExtraPlugins>;

  /**
   * [Vitest](https://vitest.dev) specific rules.
   *
   * 📁 Default `files`:
   * - <code>**&#47;*.{test,spec}.?([cm])[jt]s?(x)</code>
   * - <code>\*\*&#47;_\_test?(s)__/*\*&#47;\*.?([cm])[jt]s?(x)</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-vitest`](https://npmx.dev/eslint-plugin-vitest) ([docs](https://github.com/veritem/eslint-plugin-vitest))
   *
   * ⚙️ Sub config(s): `noOnlyTests`, `typescript`
   * @default true <=> [`vitest`](https://npmx.dev/vitest) package is installed
   */
  vitest: VitestEslintConfigOptions<ExtraPlugins>;

  /**
   * [Vue.js](https://vuejs.org) specific rules.
   *
   * 📁 Default `files`: <code>**&#47;*.vue</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-vue`](https://npmx.dev/eslint-plugin-vue) ([docs](https://eslint.vuejs.org))
   *
   * ⚙️ Sub config(s): `a11y`, `i18n`, `nuxt`, `pinia`, `scopedCss`
   * @default true <=> [`vue`](https://npmx.dev/vue) package is installed
   */
  vue: VueEslintConfigOptions<ExtraPlugins>;

  /**
   * Web components specific rules.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-wc`](https://npmx.dev/eslint-plugin-wc) ([docs](https://github.com/43081j/eslint-plugin-wc))
   * @default false
   */
  webComponents: WebComponentsEslintConfigOptions<ExtraPlugins>;

  /**
   * YAML specific rules.
   *
   * 📁 Default `files`: <code>**&#47;*.y?(a)ml</code>
   *
   * If `ignores` is explicitly specified, it still be merged with the default ignore list,
   * excluding items specified in `ignoresAdditional`.
   *
   * The default ignore list: <code>**&#47;{pnpm-lock.yaml,yarn.lock}</code>
   *
   * 🧩 Main plugin: [`eslint-plugin-yml`](https://npmx.dev/eslint-plugin-yml) ([docs](https://ota-meshi.github.io/eslint-plugin-yml))
   * @default true <=> `defaultConfigsStatus` is set to `misc-enabled`
   */
  yaml: YamlEslintConfigOptions<ExtraPlugins>;

  /**
   * Helps in identifying places in your codebase where you don't (may not) need Lodash/Underscore.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-you-dont-need-lodash-underscore`](https://npmx.dev/eslint-plugin-you-dont-need-lodash-underscore) ([docs](https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore))
   * @default true <=> Any of the following packages are installed: [`lodash`](https://npmx.dev/lodash), [`lodash-es`](https://npmx.dev/lodash-es), `lodash.{assign,bind,capitalize,concat,contains,defaults,drop,every,fill,filter,find,first,flatten,get,head,includes,join,keys,last,map,omit,pairs,reduce,repeat,replace,reverse,size,slice,some,split,throttle,trim,uniq,values}`
   */
  youDontNeedLodashUnderscore: YouDontNeedLodashUnderscoreEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin to enforce best practices when using Zod.
   *
   * **Claims to only support zod v4.**
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-zod`](https://npmx.dev/eslint-plugin-zod) ([docs](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/README.md))
   *
   * ⚙️ Sub config(s): `core`, `mini`
   * @default true <=> [`zod`](https://npmx.dev/zod) package is installed and its version is >=4
   */
  zod: ZodEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin for [`zod-openapi`](https://github.com/samchungy/zod-openapi).
   *
   * Note that the plugin assumes that all Zod schemas in the matched files are
   * meant to be used with `zod-openapi`, so prefer scoping this config to your
   * API schema files via `files`/`ignores`.
   *
   * 📁 Default `files`: all files
   *
   * 🧩 Main plugin: [`eslint-plugin-zod-openapi`](https://npmx.dev/eslint-plugin-zod-openapi) ([docs](https://github.com/samchungy/eslint-plugin-zod-openapi))
   * @default true <=> [`zod-openapi`](https://npmx.dev/zod-openapi) package is installed
   */
  zodOpenapi: ZodOpenapiEslintConfigOptions<ExtraPlugins>;
}

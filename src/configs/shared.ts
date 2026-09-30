import type {ParserOptions as TsEslintParserOptions} from '@typescript-eslint/parser';
import type {UnConfigContext} from '../config-un/shared';
import {
  ERROR,
  GLOB_JSON,
  GLOB_JSON5,
  GLOB_JSONC,
  GLOB_JS_TS_X_EXTENSION,
  GLOB_TOML,
  GLOB_YML_YAML,
  OFF,
  WARNING,
} from '../constants';
import type {
  EslintSeverity,
  GetRuleNamesInPlugin,
  UnFlatConfigEntryFilesAndIgnores,
} from '../eslint/eslint-types';
import {eslintToUnRuleSeverity} from '../eslint/eslint-utils';
import {RULES_TO_DISABLE_IN_EMBEDDED_CODE_BLOCKS} from '../plugins.gen';
import type {Prettify} from '../types';
import {type AllUnionMembers, arrayify, objectEntriesUnsafe, pick} from '../utils';
import type {JestEslintConfigOptions} from './jest';
import type {ExtraPluginsType, GetRuleOptions, UnFlatConfigEntryBase} from '.';

/**
 * Resolves the `files` option to the patterns themselves, falling back to `filesDefault` if the
 * option is not passed or its function form returns `undefined`. Only meant for the places
 * consuming the patterns outside of `ConfigEntryBuilder#addConfig`, which resolves the option on its
 * own.
 * @param files The option value as provided by the user
 * @param filesDefault The patterns `files` would be resolved to if the option was not passed
 */
export const resolveFilesOption = (
  files: UnFlatConfigEntryFilesAndIgnores['files'],
  filesDefault: string[],
) => (typeof files === 'function' ? files({filesDefault}) : files) || filesDefault;

/**
 * Same as {@link resolveFilesOption}, but for `ignores`. The implicitly ignored patterns are only
 * known when the config is created, hence an empty `ignoresImplicit` is passed to the function.
 * @param ignores The option value as provided by the user
 * @param ignoresDefault The patterns `ignores` would be resolved to if the option was not passed
 */
export const resolveIgnoresOption = (
  ignores: UnFlatConfigEntryFilesAndIgnores['ignores'],
  ignoresDefault: string[],
) =>
  (typeof ignores === 'function' ? ignores({ignoresDefault, ignoresImplicit: []}) : ignores) ||
  ignoresDefault;

export interface IgnoresAdditionalOptions<Patterns extends string | readonly string[]> {
  /**
   * All the keys of this object are merged with the resolved `ignores` by default.
   * Set any of them to `false` to avoid that.
   * Set `false` to avoid merging with any of them
   * @default true
   */
  ignoresAdditional?:
    | false
    | Partial<Record<Patterns extends readonly unknown[] ? Patterns[number] : Patterns, boolean>>;
}

export const generateIgnoresWithAdditional =
  <Patterns extends string | readonly string[]>(
    config: boolean | Prettify<UnFlatConfigEntryBase & IgnoresAdditionalOptions<Patterns>>,
    extraIgnoresFallback?: string[],
  ) =>
  <
    const ProvidedPatterns extends readonly (Patterns extends readonly unknown[]
      ? Patterns[number]
      : Patterns)[],
  >(
    allAdditionalIgnores: AllUnionMembers<
      Patterns extends readonly unknown[] ? Patterns[number] : Patterns,
      ProvidedPatterns
    >,
  ) => {
    const {ignoresAdditional = true} = typeof config === 'object' ? config : {};
    const ignoresFinal = [
      ...allAdditionalIgnores
        .map(
          (fileToIgnore) =>
            !(
              ignoresAdditional === false ||
              (typeof ignoresAdditional === 'object' && ignoresAdditional[fileToIgnore] === false)
            ) && fileToIgnore,
        )
        .filter((v) => typeof v === 'string'),
      ...resolveIgnoresOption(
        typeof config === 'object' ? config.ignores : undefined,
        extraIgnoresFallback || [],
      ),
    ];
    return {
      ...(ignoresFinal.length > 0 && {ignores: ignoresFinal}),
    };
  };

export const generateDefaultTestFiles = <T extends string>(
  extensions: T,
  {
    includeRegularSpecFiles = true,
    includeCypressTests,
    includeVitestBenchmarkFiles,
    includeStorybookStories,
  }: {
    includeRegularSpecFiles?: boolean;
    includeCypressTests?: boolean;
    includeStorybookStories?: boolean;
    includeVitestBenchmarkFiles?: boolean;
  } = {},
) => [
  ...(includeRegularSpecFiles
    ? [
        // Popularity of separators (using GitHub global code source https://github.com/search?q=path%3A**%2F*.spec.ts&type=code&query=path%3A%2F**%2F__tests__%2F**%2F*.ts as of 2026-05-30):
        // `.`: 4.9M, `-`: 221k, `_`: 42.7k
        `**/*[._-]spec.${extensions}` as const,
        `**/*.test.${extensions}` as const, // 6.3M
        `**/__test?(s)__/**/*.${extensions}` as const, // tests: 513k, test: 26.6k
      ]
    : []),
  ...(includeVitestBenchmarkFiles ? [`**/*.{bench,benchmark}.${extensions}` as const] : []), // 10.9k (1k)
  ...(includeCypressTests ? [`**/*.cy.${extensions}` as const] : []), // 107k
  ...(includeStorybookStories ? [`**/*.{stories,story}.${extensions}` as const] : []), // 115k, 2.2k
];

export const TESTS_CONFIG_DEFAULT_FILES = generateDefaultTestFiles(GLOB_JS_TS_X_EXTENSION, {
  includeCypressTests: true,
  includeStorybookStories: true,
  includeVitestBenchmarkFiles: true,
});

type ConfigNoOnlyTests<ExtraPlugins extends ExtraPluginsType = never> =
  | boolean
  | UnFlatConfigEntryBase<ExtraPlugins, 'no-only-tests'>;

export interface NoOnlyTestsSubConfigEnabledByDefault<ExtraPlugins extends ExtraPluginsType> {
  /**
   * Forbids focused tests in the test files.
   *
   * 📁 Default `files` and `ignores`: inherited from the parent config
   *
   * 🧩 Main plugin: [`eslint-plugin-no-only-tests`](https://npmx.dev/eslint-plugin-no-only-tests)
   *
   * Affected rule:
   * - [`no-only-tests/no-only-tests`](https://github.com/levibuzolic/eslint-plugin-no-only-tests)
   * @default true
   */
  configNoOnlyTests?: ConfigNoOnlyTests<ExtraPlugins>;
}

export interface NoOnlyTestsSubConfigDisabledByDefault<ExtraPlugins extends ExtraPluginsType> {
  /**
   * Forbids focused tests in the test files.
   *
   * 📁 Default `files` and `ignores`: inherited from the parent config
   *
   * 🧩 Main plugin: [`eslint-plugin-no-only-tests`](https://npmx.dev/eslint-plugin-no-only-tests)
   *
   * Affected rule:
   * - [`no-only-tests/no-only-tests`](https://github.com/levibuzolic/eslint-plugin-no-only-tests)
   * @default false
   */
  configNoOnlyTests?: ConfigNoOnlyTests<ExtraPlugins>;
}

export const generateConfigNoOnlyTests = <ExtraPlugins extends ExtraPluginsType>(
  context: UnConfigContext<ExtraPlugins>,
  prefix: string,
  configNoOnlyTests: NoOnlyTestsSubConfigEnabledByDefault<ExtraPlugins>['configNoOnlyTests'] & {},
  parentConfig: boolean | UnFlatConfigEntryBase<ExtraPlugins>,
  {
    filesDefault,
  }: {
    filesDefault?: string[];
  } = {},
) => {
  const configBuilderNoOnlyTests = context.createConfigBuilder(
    configNoOnlyTests
      ? {
          ...(typeof parentConfig === 'object' && pick(parentConfig, ['files', 'ignores'])),
          ...(typeof configNoOnlyTests === 'object' && configNoOnlyTests),
        }
      : configNoOnlyTests,
    'no-only-tests',
  );
  configBuilderNoOnlyTests
    ?.addConfig([
      `${prefix}/no-only-tests`,
      {
        filesDefault,
      },
    ])
    .addRule('no-only-tests', ERROR)
    .addOverrides();
};

export const generateConsistentTestItOptions = ({
  testDefinitionKeyword,
}: Pick<JestEslintConfigOptions, 'testDefinitionKeyword'>): GetRuleOptions<
  'jest',
  'consistent-test-it',
  'all'
> => [
  typeof testDefinitionKeyword === 'string'
    ? {
        fn: testDefinitionKeyword,
        withinDescribe: testDefinitionKeyword,
      }
    : {
        fn: 'it',
        withinDescribe: 'it',
        ...testDefinitionKeyword,
      },
];

// prettier-ignore
const INVALID_HTML_TAGS = [
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements#obsolete_and_deprecated_elements
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
export type ValidAndInvalidHtmlTags = ValidHtmlTags | InvalidHtmlTags;

export const noRestrictedHtmlElementsDefault = Object.fromEntries(
  INVALID_HTML_TAGS.map((tag) => [tag, true]),
);

export const generateUseBaselineRuleOptions = (context: UnConfigContext) => {
  const {baselineAvailability} = context.rootOptions;
  return baselineAvailability == null ? {} : {available: baselineAvailability};
};

/**
 * How the rules replicating ESLint's unused `eslint-disable` directives reporting for the code it
 * does not see the directives in, such as the contents of a Vue `<template>`, should be set up.
 * Unless the Config says otherwise, they take the severity from the root option setting the same
 * for the directives ESLint itself handles, which in turn defaults to what ESLint defaults to.
 *
 * A rule severity cannot vary per file the way that option can, so only its entries applying to
 * every file are taken into account.
 *
 * `off` is the one value that does not map to the rule severity.
 * The rules are also what makes the directives work in the first place, so turning them off would
 * silently stop every `eslint-disable` in that code from being honored.
 * They are instead left on, with their own `reportUnusedDisableDirectives` option set to `false`,
 * which is what actually silences them; the severity they carry is then a filler nothing is ever
 * reported at
 */
export const resolveUnusedDisableDirectivesReporting = (
  context: UnConfigContext,
  severityFromConfig?: EslintSeverity,
) => {
  const rootOption = context.rootOptions.linterOptionsReportUnusedDisableDirectives;
  const severityFromRootOption =
    typeof rootOption === 'object'
      ? arrayify(rootOption).findLast(
          ({files, ignores, value}) => value != null && !files?.length && !ignores?.length,
        )?.value
      : rootOption;
  const severity = eslintToUnRuleSeverity(severityFromConfig ?? severityFromRootOption, WARNING);
  const shouldReport = severity !== OFF;

  return {
    shouldReport,
    severity: shouldReport ? severity : ERROR,
  };
};

export const JSONC_DEFAULT_FILES = [GLOB_JSON, GLOB_JSONC, GLOB_JSON5];

export const TOML_DEFAULT_FILES = [GLOB_TOML];

export const YAML_DEFAULT_FILES = [GLOB_YML_YAML];

export const CORE_RULES_HANDLED_BY_TS_COMPILER = [
  'constructor-super',
  'getter-return',
  'no-class-assign',
  'no-const-assign',
  'no-dupe-args',
  'no-dupe-class-members',
  'no-dupe-keys',
  'no-func-assign',
  // "Note that the compiler will not catch the Object.assign() case. Thus, if you use Object.assign() in your codebase, this rule will still provide some value." - https://eslint.org/docs/latest/rules/no-import-assign#handled_by_typescript
  // 'no-import-assign',
  // "Note that, technically, TypeScript will only catch this if you have the strict or noImplicitThis flags enabled. These are enabled in most TypeScript projects, since they are considered to be best practice." - https://eslint.org/docs/latest/rules/no-invalid-this#rule-details
  // 'no-invalid-this',
  'no-new-native-nonconstructor', // successor of no-new-symbol
  'no-obj-calls',
  // "Note that while TypeScript will catch let redeclares and const redeclares, it will not catch var redeclares. Thus, if you use the legacy var keyword in your TypeScript codebase, this rule will still provide some value." - https://eslint.org/docs/latest/rules/no-redeclare#handled_by_typescript
  // 'no-redeclare',
  'no-setter-return',
  'no-this-before-super',
  'no-undef',
  // "TypeScript must be configured with allowUnreachableCode: false for it to consider unreachable code an error." - https://eslint.org/docs/latest/rules/no-unreachable#handled_by_typescript
  // 'no-unreachable',
  'no-unsafe-negation',
  'no-with',
  // Does not work correctly when type-only imports are present because you can't combine such an import with a default import.
  'no-duplicate-imports',
] satisfies GetRuleNamesInPlugin<''>[];

export const CORE_RULES_REPLACED_BY_TS_EXTENSION_RULES = [
  'class-methods-use-this',
  'default-param-last',
  'init-declarations',
  'max-params',
  'no-array-constructor',
  'no-dupe-class-members',
  'no-empty-function',
  'no-invalid-this',
  'no-magic-numbers',
  'no-redeclare',
  'no-shadow',
  'no-unused-expressions',
  'no-unused-vars',
  'no-use-before-define',
  'no-useless-constructor',
] satisfies GetRuleNamesInPlugin<''>[];

export const determineRulesDisabledInEmbeddedCodeBlocks = (context: UnConfigContext) =>
  [
    ...RULES_TO_DISABLE_IN_EMBEDDED_CODE_BLOCKS.filter(
      (ruleName) => context.rootOptions.markdownCodeBlocksRules?.doNotDisable?.[ruleName] !== true,
    ),
    ...objectEntriesUnsafe(
      // eslint-disable-next-line ts/no-non-null-assertion, ts/no-unnecessary-condition, ts/no-non-null-asserted-optional-chain -- added to preserve the type
      context.rootOptions.markdownCodeBlocksRules?.additionalDisabledRules! || {},
    ).map(([ruleName, shouldDisable]) => (shouldDisable ? ruleName : null)),
  ].filter((v) => v != null);

/** Folds the `allowDefaultProject` shortcut into `projectService`, winning over the existing one */
export const withAllowDefaultProject = (
  parserOptions: TsEslintParserOptions,
  allowDefaultProject: string[] | undefined,
): TsEslintParserOptions =>
  allowDefaultProject?.length
    ? {
        ...parserOptions,
        projectService: {
          ...(typeof parserOptions.projectService === 'object' && parserOptions.projectService),
          allowDefaultProject,
        },
      }
    : parserOptions;

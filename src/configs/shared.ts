import type {UnConfigContext} from '../config-un/shared';
import {
  ERROR,
  GLOB_JSON,
  GLOB_JSON5,
  GLOB_JSONC,
  GLOB_JS_TS_X_EXTENSION,
  GLOB_TOML,
  GLOB_YML_YAML,
} from '../constants';
import type {UnAllRuleNames, UnFlatConfigEntryFilesAndIgnores} from '../eslint/eslint-types';
import {type AllUnionMembers, objectEntriesUnsafe, pick} from '../utils';
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
    config: boolean | (UnFlatConfigEntryBase & IgnoresAdditionalOptions<Patterns>),
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
        `**/*[.-_]spec.${extensions}` as const,
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
  boolean | UnFlatConfigEntryBase<ExtraPlugins, 'no-only-tests'>;

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

export const JSONC_DEFAULT_FILES = [GLOB_JSON, GLOB_JSONC, GLOB_JSON5];

export const TOML_DEFAULT_FILES = [GLOB_TOML];

export const YAML_DEFAULT_FILES = [GLOB_YML_YAML];

// 🟣 - in the default *markdown* processor config
const RULES_TO_DISABLE_IN_EMBEDDED_CODE_BLOCKS = [
  'consistent-return', // [too-strict]
  'eol-last', // 🟣
  'max-classes-per-file', // [too-strict]
  'no-alert', // [runtime-only]
  'no-await-in-loop', // [runtime-only]
  'no-console', // [runtime-only]
  'no-duplicate-imports', // [imports]
  'no-empty-function', // [emptiness]
  'no-eval', // [eval]
  'no-extend-native', // [runtime-only]
  'no-implied-eval', // [eval]
  // Sometimes object literals are used not assigned to anything, and such object's properties are triggering this rule
  'no-labels', // [too-strict]
  'no-lone-blocks', // [emptiness]
  'no-new-func', // [eval]
  'no-new', // [runtime-only]
  'no-promise-executor-return', // [too-strict]
  'no-restricted-globals', // [too-strict]
  'no-script-url', // [too-strict]
  'no-sequences', // [too-strict]
  'no-shadow', // [too-strict]
  'no-unreachable', // [runtime-only]
  'no-unused-labels', // [unused]
  'no-unused-private-class-members', // [unused]
  'no-useless-assignment', // [unused]
  'no-useless-constructor', // [too-strict]
  'no-var', // [too-strict] - examples can use whatever they want
  'prefer-const', // [too-strict]
  'require-await', // [too-strict]
  'strict', // 🟣
  'no-undef', // 🟣
  'no-unused-expressions', // 🟣
  'no-unused-vars', // 🟣
  'padded-blocks', // 🟣
  'unicode-bom', // 🟣

  // ts
  // won't disable: ts/consistent-type-imports, ts/no-useless-empty-export
  'ts/ban-ts-comment', // [runtime-only]
  'ts/class-methods-use-this', // [runtime-only]
  'ts/explicit-function-return-type', // [too-strict]
  'ts/method-signature-style', // [too-strict]
  'ts/no-empty-function', // [emptiness]
  'ts/no-explicit-any', // [too-strict]
  'ts/no-extraneous-class', // [too-strict]
  'ts/no-import-type-side-effects', // [runtime-only]
  'ts/no-namespace', // [too-strict]
  'ts/no-non-null-assertion', // [too-strict]
  'ts/no-redeclare', // [runtime-only]
  'ts/no-require-imports', // [runtime-only]
  'ts/no-unused-expressions', // [unused]
  'ts/no-unused-vars', // [unused]
  'ts/no-use-before-define', // [runtime-only]
  'ts/no-unsafe-function-type', // [too-strict]
  'ts/no-useless-empty-export', // [too-strict] - might be ok in examples

  // vue
  // TODO maybe disable?: vue/valid-define-emits, vue/valid-define-props, vue/no-duplicate-attr-inheritance
  // won't disable: vue/require-v-for-key, vue/no-setup-props-reactivity-loss, vue/require-macro-variable-name
  'vue/block-lang', // [too-strict]
  'vue/define-props-declaration', // [too-strict]
  'vue/no-console', // [runtime-only]
  'vue/no-undef-components', // [runtime-only]
  'vue/no-unsupported-features', // [runtime-only]
  'vue/no-unused-components', // [unused]
  'vue/no-unused-emit-declarations', // [unused]
  'vue/no-unused-properties', // [unused]
  'vue/no-unused-refs', // [unused]
  'vue/no-unused-vars', // [unused]
  'vue/require-prop-types', // [too-strict]

  // vue a11y, pinia - ignored all rules in corresponding configs

  // import
  // won't disable: import/no-absolute-path
  'import/dynamic-import-chunkname', // [imports]
  'import/max-dependencies', // [imports]
  'import/no-default-export', // [imports]
  'import/no-duplicates', // [imports]
  'import/no-extraneous-dependencies', // [imports]
  'import/no-mutable-exports', // [imports]
  'import/no-unresolved', // [imports]

  // node
  // TODO disable?: node/no-deprecated-api
  // won't disable: node/exports-style, import/no-webpack-loader-syntax
  'node/hashbang', // [runtime-only]
  'node/no-extraneous-require', // [imports]
  'node/no-missing-require', // [imports]
  'node/no-missing-import', // [imports]
  'node/no-process-exit', // [runtime-only]
  'node/no-top-level-await', // [runtime-only]
  'node/no-unsupported-features/es-builtins', // [runtime-only]
  'node/no-unsupported-features/es-syntax', // [runtime-only]
  'node/no-unsupported-features/node-builtins', // [runtime-only]
  'node/prefer-import/assert-strict', // [runtime-only]
  'node/prefer-process-get-builtin-module', // [runtime-only]

  // unicorn
  // won't disable: unicorn/no-abusive-eslint-disable, unicorn/relative-url-style, unicorn/prefer-string-replace-all, unicorn/prefer-string-starts-ends-with, unicorn/prefer-code-point
  'unicorn/consistent-function-scoping', // [performance]
  'unicorn/no-process-exit', // [runtime-only]
  'unicorn/prefer-top-level-await', // [runtime-only]
  'unicorn/no-optional-chaining-on-undeclared-variable', // [runtime-only]
  'unicorn/no-unused-array-method-return', // [runtime-only]
  'unicorn/no-unsafe-string-replacement', // [too-strict]
  'unicorn/no-static-only-class', // [too-strict]
  'unicorn/no-top-level-side-effects', // [runtime-only]
  'unicorn/prefer-optional-catch-binding', // [too-strict]
  'unicorn/prefer-response-static-json', // [too-strict]

  // regexp
  'regexp/no-unused-capturing-group', // [runtime-only]
  'regexp/no-useless-flag', // [runtime-only]
  'regexp/no-super-linear-backtracking', // [runtime-only]
  'regexp/optimal-quantifier-concatenation', // [runtime-only]

  // tanstack-start — whole-program analysis rules that are meaningless in isolated code snippets
  'tanstack-start/no-async-client-component', // [runtime-only]
  'tanstack-start/no-client-code-in-server-component', // [runtime-only]

  // tsrx — module-scope rules that don't make sense in isolated embedded code snippets
  'tsrx/no-lazy-destructuring-in-modules', // [runtime-only]

  // drizzle — database-specific operation rules that would false-positive on API usage examples
  'drizzle/enforce-delete-with-where', // [runtime-only]
  'drizzle/enforce-update-with-where', // [runtime-only]

  // mobx — observable state management rules that would false-positive on partial code snippets
  'mobx/exhaustive-make-observable', // [runtime-only]
  'mobx/unconditional-make-observable', // [runtime-only]
  'mobx/missing-make-observable', // [runtime-only]
  'mobx/missing-observer', // [runtime-only]

  // expo — judges the whole module shape, which an isolated snippet never has
  'expo/use-dom-exports', // [runtime-only]

  // no-relative-import-paths — relative imports are common in code snippets
  'no-relative-import-paths/no-relative-import-paths', // [imports]

  // arrow-return-style — anonymous default-exported arrows are common in docs examples;
  // the fix derives the function name from the filename, which is meaningless for markdown files
  'arrow-return-style/no-export-default-arrow',

  // zod-openapi — rules assume all Zod schemas in the file are zod-openapi schemas,
  // which is rarely true for isolated snippets in docs
  'zod-openapi/prefer-meta-last', // [too-strict]
  'zod-openapi/prefer-zod-default', // [too-strict]
  'zod-openapi/require-comment', // [too-strict]
  'zod-openapi/require-example', // [too-strict]
  'zod-openapi/require-meta', // [too-strict]

  // sonar — Express/passport wiring rules that judge safety by what the whole program does or does
  // not set up around the app instance, which an isolated snippet never contains
  // won't disable: sonarjs/no-identical-functions
  // sonarjs/no-hardcoded-passwords - might actually find something
  'sonarjs/content-length', // [runtime-only]
  'sonarjs/cors', // [runtime-only]
  'sonarjs/file-uploads', // [runtime-only]
  'sonarjs/no-clear-text-protocols', // [too-strict]
  'sonarjs/no-empty-collection', // [runtime-only]
  'sonarjs/no-global-this', // [too-strict]
  'sonarjs/no-globals-shadowing', // [runtime-only]
  'sonarjs/no-ignored-exceptions', // [too-strict]
  'sonarjs/no-session-cookies-on-static-assets', // [runtime-only]
  'sonarjs/production-debug', // [runtime-only]
  'sonarjs/session-regeneration', // [runtime-only]
  'sonarjs/super-linear-regex', // [runtime-only]
  'sonarjs/x-powered-by', // [runtime-only]

  'e18e/prefer-static-regex', // [performance]

  'html/no-extra-spacing-text', // [too-strict]
  'html/require-explicit-size', // [too-strict]
  'html/require-lang', // [too-strict]
  'html/require-meta-charset', // [too-strict]
  'html/require-meta-viewport', // [too-strict]
  'html/require-title', // [too-strict]

  // misc
  // won't disable: yaml/file-extension, eslint-comments/no-unlimited-disable
  // no-secrets/no-secrets - there might actually be accidental/leftover secrets
  'promise/catch-or-return', // [too-strict]
  'unused-imports/no-unused-imports', // [too-strict]
  'turbo/no-undeclared-env-vars', // [runtime-only]
  'eslint-plugin/no-property-in-node', // [type-aware]
  // Conflicts with `markdown-preferences/canonical-code-block-language` by default, can also be handled by that rule and it's confusing for users to see the word "extension" in the lint message
  'yaml/file-extension',
] satisfies UnAllRuleNames[];

export type RulesDisabledInEmbeddedCodeBlocksByDefault =
  (typeof RULES_TO_DISABLE_IN_EMBEDDED_CODE_BLOCKS)[number];

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

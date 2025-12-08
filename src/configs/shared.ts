import type {UnConfigContext} from '../config-un/shared';
import {ERROR, GLOB_JSON, GLOB_JSON5, GLOB_JSONC, GLOB_TOML, GLOB_YAML} from '../constants';
import type {AllEslintRuleNames} from '../eslint';
import {type AllUnionMembers, pick} from '../utils';
import type {JestEslintConfigOptions} from './jest';
import type {ExtraPluginsType, GetRuleOptions, UnConfigOptions} from '.';

export interface IgnoresAdditionalOptions<Patterns extends string | readonly string[]> {
  /**
   * All the keys of this object are merged with the resolved `ignores` by default.
   * Set any of them to `false` to avoid that. Set `false` to avoid merging with any of them
   * @default true
   */
  ignoresAdditional?:
    | false
    | Partial<Record<Patterns extends readonly unknown[] ? Patterns[number] : Patterns, boolean>>;
}

export const generateIgnoresWithAdditional =
  <Patterns extends string | readonly string[]>(
    config: boolean | (UnConfigOptions & IgnoresAdditionalOptions<Patterns>),
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
      ...((typeof config === 'object' ? config.ignores : null) || extraIgnoresFallback || []),
    ];
    return {
      ...(ignoresFinal.length > 0 && {ignores: ignoresFinal}),
    };
  };

export const generateDefaultTestFiles = <T extends string>(
  extensions: T,
  {includeCypressTests}: {includeCypressTests?: boolean} = {},
) => [
  `**/*.spec.${extensions}` as const, // GitHub: 2.3M .ts files as of 2024-12-08 (https://github.com/search?q=path%3A**%2F*.spec.ts&type=code&query=path%3A%2F**%2F__tests__%2F**%2F*.ts)
  `**/*-spec.${extensions}` as const, // 165k
  `**/*_spec.${extensions}` as const, // 40k

  `**/*.test.${extensions}` as const, // 1.9M

  `**/__tests__/**/*.${extensions}` as const, // 155k
  `**/__test__/**/*.${extensions}` as const, // 14k

  ...(includeCypressTests ? [`**/*.cy.${extensions}` as const] : []),
];

type ConfigNoOnlyTests<ExtraPlugins extends ExtraPluginsType = never> =
  | boolean
  | UnConfigOptions<ExtraPlugins, 'no-only-tests'>;

export interface NoOnlyTestsSubConfigEnabledByDefault<ExtraPlugins extends ExtraPluginsType> {
  /**
   * Enables [`no-only-tests/no-only-tests`](https://github.com/levibuzolic/no-only-tests) rule
   * on the test files.
   *
   * By default will be applied to the same `files` and `ignores` as the parent config.
   * @default true
   */
  configNoOnlyTests?: ConfigNoOnlyTests<ExtraPlugins>;
}

export interface NoOnlyTestsSubConfigDisabledByDefault<ExtraPlugins extends ExtraPluginsType> {
  /**
   * Enables [`no-only-tests/no-only-tests`](https://github.com/levibuzolic/no-only-tests) rule
   * on the test files.
   *
   * By default will be applied to the same `files` and `ignores` as the parent config.
   * @default false
   */
  configNoOnlyTests?: ConfigNoOnlyTests<ExtraPlugins>;
}

export const generateConfigNoOnlyTestsBuilder = <ExtraPlugins extends ExtraPluginsType>(
  context: UnConfigContext<ExtraPlugins>,
  prefix: string,
  configNoOnlyTests: NoOnlyTestsSubConfigEnabledByDefault<ExtraPlugins>['configNoOnlyTests'] & {},
  parentConfig: boolean | UnConfigOptions<ExtraPlugins>,
  {
    filesFallback,
  }: {
    filesFallback?: string[];
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
        includeDefaultFilesAndIgnores: true,
        filesFallback,
      },
    ])
    .addRule('no-only-tests', ERROR)
    .addOverrides();
  return configBuilderNoOnlyTests;
};

export const RULES_TO_DISABLE_IN_TEST_FILES: AllEslintRuleNames[] = [
  'no-empty-function',
  'sonarjs/no-hardcoded-ip',
  'sonarjs/no-hardcoded-passwords',
  'sonarjs/no-hardcoded-secrets',
  'sonarjs/no-clear-text-protocols',
  'ts/no-extraneous-class',
  'ts/no-empty-function',
  'unicorn/template-indent', // triggered on inline snapshots
];

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
export type ValidAndInvalidHtmlTags = ValidHtmlTags | InvalidHtmlTags;

export const noRestrictedHtmlElementsDefault = Object.fromEntries(
  INVALID_HTML_TAGS.map((tag) => [tag, true]),
);

export const JSONC_DEFAULT_FILES = [GLOB_JSON, GLOB_JSONC, GLOB_JSON5];

export const TOML_DEFAULT_FILES = [GLOB_TOML];

export const YAML_DEFAULT_FILES = [GLOB_YAML];

// 🟣 - in the default *markdown* processor config
export const RULES_TO_DISABLE_IN_EMBEDDED_CODE_BLOCKS: AllEslintRuleNames[] = [
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
  'no-lone-blocks', // [emptiness]
  'no-new-func', // [eval]
  'no-new', // [runtime-only]
  'no-unused-labels', // [unused]
  'no-unused-private-class-members', // [unused]
  'no-useless-assignment', // [unused]
  'prefer-const', // [too-strict]
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
  'ts/no-empty-function', // [emptiness]
  'ts/no-explicit-any', // [too-strict]
  'ts/no-extraneous-class', // [too-strict]
  'ts/no-import-type-side-effects', // [runtime-only]
  'ts/no-namespace', // [too-strict]
  'ts/no-non-null-assertion', // [too-strict]
  'ts/no-require-imports', // [runtime-only]
  'ts/no-unused-expressions', // [unused]
  'ts/no-unused-vars', // [unused]
  'ts/no-use-before-define', // [runtime-only]
  'ts/no-unsafe-function-type', // [too-strict]

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
  'node/no-unsupported-features/es-builtins', // [runtime-only]
  'node/no-unsupported-features/es-syntax', // [runtime-only]
  'node/no-unsupported-features/node-builtins', // [runtime-only]

  // unicorn
  // won't disable: unicorn/no-abusive-eslint-disable, unicorn/relative-url-style, unicorn/prefer-string-replace-all, unicorn/prefer-string-starts-ends-with, unicorn/prefer-code-point
  'unicorn/no-process-exit', // [runtime-only]
  'unicorn/prefer-top-level-await', // [runtime-only]
  'unicorn/no-static-only-class', // [too-strict]

  // regexp
  'regexp/no-unused-capturing-group', // [runtime-only]
  'regexp/no-useless-flag', // [runtime-only]
  'regexp/no-super-linear-backtracking', // [runtime-only]
  'regexp/optimal-quantifier-concatenation', // [runtime-only]

  // misc
  // won't disable: yml/file-extension, sonarjs/no-identical-functions, @eslint-community/eslint-comments/no-unlimited-disable
  'unused-imports/no-unused-imports', // [too-strict]
  'turbo/no-undeclared-env-vars', // [runtime-only]
  'eslint-plugin/no-property-in-node', // [type-aware]
];

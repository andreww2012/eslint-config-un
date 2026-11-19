import {GLOB_JS_TS_X_EXTENSION, GLOB_MDX, OFF, WARNING} from '../constants';
import {generatePackageToLoadProperty} from '../loaders';
import {mapKeys, toKebabCase} from '../utils';
import type {MarkdownEslintConfigOptions} from './markdown';
import {determineRulesDisabledInEmbeddedCodeBlocks} from './shared';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [`eslint-plugin-mdx`](https://npmx.dev/eslint-plugin-mdx) plugin
 * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
 * that will be assigned to the `settings` flat config option with keys transformed to
 * `mdx/<property>` and applied to the resolved `files` and `ignores` of this config
 */
export interface MdxPluginSettings {
  /**
   * Whether to lint code blocks inside MDX files
   * @default false
   */
  codeBlocks?: boolean;

  /**
   * Maps a code block language to another one for the purpose of linting, e.g. `{js: 'jsx'}` will
   * treat ` ```js ` blocks as `jsx`.
   *
   * Set to `false` to disable the default mapping
   */
  languageMapper?: Record<string, string> | false;

  /**
   * Whether to ignore the `remark` configuration files when resolving the config for the
   * [`remark`](https://github.com/mdx-js/eslint-mdx/blob/HEAD/README.md#mdxremark) rule
   */
  ignoreRemarkConfig?: boolean;

  /**
   * Path to a `remark` configuration file to use for the
   * [`remark`](https://github.com/mdx-js/eslint-mdx/blob/HEAD/README.md#mdxremark) rule
   */
  remarkConfigPath?: string;
}

/**
 * [MDX](https://mdxjs.com) specific rules.
 *
 * 📁 Default `files`: <code>**&#47;*.mdx</code>
 */
export interface MdxEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends
    UnFlatConfigEntryBase<ExtraPlugins, 'mdx'>,
    Pick<MarkdownEslintConfigOptions, 'configCodeBlocks'> {}

const DEFAULT_FILES = [GLOB_MDX] as const;
// The blocks of the other languages are added once it's known which ones are parsed
const DEFAULT_FILES_FOR_CODE_BLOCKS = [`${GLOB_MDX}/**/*.${GLOB_JS_TS_X_EXTENSION}`] as const;

export default defineUnConfig<MdxEslintConfigOptions>('mdx', {phase: 'last'})((
  context,
  optionsRaw,
) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configCodeBlocks: true,
  });

  const {configCodeBlocks} = optionsResolved;

  const pluginSettings = context.getPluginSettings('mdx');

  const configBuilder = context.createConfigBuilder(optionsResolved, 'mdx');

  const configBuilderCodeBlocks = context.createConfigBuilder(configCodeBlocks, null);

  const {ignoredLanguages: codeBlocksIgnoredLanguages, impliedStrictMode} = assignDefaults(
    configCodeBlocks,
    {impliedStrictMode: true},
  );

  // Legend:
  // 🟢 - in recommended
  // 🔵 - in `native`

  configBuilder
    ?.addConfig(
      [
        'mdx/mdx',
        {
          filesDefault: DEFAULT_FILES,
          parseWith: 'mdx',
          settings: {
            '': mapKeys(
              pluginSettings || {},
              (_, settingName) => `mdx/${toKebabCase(settingName)}`,
            ),
          },
        },
      ],
      {
        // Turns `mdx/remark` reports into readable ones, so it must run wherever the rule does
        ...generatePackageToLoadProperty('processor', 'eslintPluginMdx', {
          valueTransformFn: {
            fn: ({eslintPluginMdx}) =>
              eslintPluginMdx.createRemarkProcessor({lintCodeBlocks: false}),
          },
        }),
        languageOptions: {
          globals: {
            React: false,
          },
        },
      },
    )
    // TODO enable the native rules, along with the `native` option of `mdx/remark`, once they
    // follow the remark config like `mdx/remark` does. As of v3.10.1, they ignore the severity set
    // there, still report when turned off there with `[0]` or `'off'`, and misread options in the
    // `[severity, value]` form
    .addRule('blockquote-indentation', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('checkbox-character-style', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('code-block-style', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('definition-case', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('definition-spacing', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('emphasis-marker', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('fenced-code-flag', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('fenced-code-marker', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('final-definition', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('final-newline', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('hard-break-spaces', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('heading-increment', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('heading-style', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('link-title-style', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('list-item-bullet-indent', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('list-item-content-indent', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('list-item-indent', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('list-item-spacing', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('maximum-heading-length', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('maximum-line-length', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('no-blockquote-without-marker', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('no-consecutive-blank-lines', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('no-duplicate-definitions', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('no-duplicate-headings', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('no-duplicate-headings-in-section', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('no-emphasis-as-heading', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('no-file-name-articles', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('no-file-name-consecutive-dashes', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('no-file-name-irregular-characters', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('no-file-name-mixed-case', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('no-file-name-outer-dashes', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('no-heading-content-indent', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('no-heading-punctuation', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('no-literal-urls', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('no-multiple-toplevel-headings', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('no-shell-dollars', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('no-shortcut-reference-image', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('no-shortcut-reference-link', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('no-table-indentation', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('no-undefined-references', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('no-unused-definitions', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('ordered-list-marker-style', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('ordered-list-marker-value', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('remark', WARNING) /** @since 1.1.0 */ // 🟢 🔵
    .addRule('rule-style', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('strong-marker', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('table-cell-padding', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('table-pipe-alignment', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('table-pipes', OFF) /** @since 3.10.0 */ // 🔵
    .addRule('unordered-list-marker-style', OFF) /** @since 3.10.0 */ // 🔵
    .enableConfigTesterForPlugin('mdx')
    .addOverrides();

  // Comes after `mdx/mdx`, so its processor wins.
  // It also passes the MDX text on, which needs parsing
  configBuilderCodeBlocks?.addConfig(
    [
      'mdx/code-blocks-processor',
      {
        filesDefault: DEFAULT_FILES,
        parseWith: 'mdx',
      },
    ],
    // @ts-expect-error Type '{ [packageToLoadSymbol]: ...' has no properties in common with type 'FlatConfigEntryForBuilder'
    {
      ...generatePackageToLoadProperty('processor', 'eslintPluginMdx', {
        valueTransformFn: {
          fn: ({eslintPluginMdx}) => eslintPluginMdx.createRemarkProcessor({lintCodeBlocks: true}),
        },
      }),
    },
  );

  const configCodeBlocksEntry = configBuilderCodeBlocks
    ?.addConfig(
      [
        'mdx/code-blocks',
        {
          applyUserFilesAndIgnores: false,
          filesDefault: DEFAULT_FILES_FOR_CODE_BLOCKS,
          ignoresInternal: false,
        },
      ],
      {
        languageOptions: {
          parserOptions: {
            ecmaFeatures: {
              impliedStrict: impliedStrictMode,
            },
          },
        },
      },
    )
    .disableBulkRules(determineRulesDisabledInEmbeddedCodeBlocks(context))
    .addOverrides().config;
  if (configCodeBlocksEntry) {
    context.codeBlocksConfigs.push({config: configCodeBlocksEntry, documentsGlob: GLOB_MDX});
  }

  if (codeBlocksIgnoredLanguages?.length) {
    configBuilderCodeBlocks?.addGlobalIgnores(
      'mdx/code-blocks/ignore',
      codeBlocksIgnoredLanguages.map((ignoredLanguage) => `**/*.mdx/**/*.${ignoredLanguage}`),
    );
  }
});

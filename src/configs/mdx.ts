import {GLOB_MDX, GLOB_MDX_SUPPORTED_CODE_BLOCKS, WARNING} from '../constants';
import {generatePackageToLoadProperty} from '../loaders';
import {objectEntriesUnsafe, toKebabCase} from '../utils';
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
 * `mdx/<property>` and applied to the resolved `files` and `ignores` of this config.
 */
export interface MdxPluginSettings {
  /**
   * Whether to lint code blocks inside MDX files.
   * @default false
   */
  codeBlocks?: boolean;

  /**
   * Maps a code block language to another one for the purpose of linting, e.g. `{js: 'jsx'}` will
   * treat ` ```js ` blocks as `jsx`.
   *
   * Set to `false` to disable the default mapping.
   */
  languageMapper?: Record<string, string> | false;

  /**
   * Whether to ignore the `remark` configuration files when resolving the config for the
   * [`remark`](https://github.com/mdx-js/eslint-mdx/blob/HEAD/README.md#mdxremark) rule.
   */
  ignoreRemarkConfig?: boolean;

  /**
   * Path to a `remark` configuration file to use for the
   * [`remark`](https://github.com/mdx-js/eslint-mdx/blob/HEAD/README.md#mdxremark) rule.
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
const DEFAULT_FILES_FOR_CODE_BLOCKS = [GLOB_MDX_SUPPORTED_CODE_BLOCKS] as const;

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

  configBuilder
    ?.addConfig(
      [
        'mdx/mdx',
        {
          filesDefault: DEFAULT_FILES,
          parseWith: 'mdx',
          settings: {
            '': Object.fromEntries(
              objectEntriesUnsafe(pluginSettings || {}).map(([settingName, settingValue]) => [
                `mdx/${toKebabCase(settingName)}`,
                settingValue,
              ]),
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
    .addRule('remark', WARNING) /** @since 1.1.0 */ // TODO
    .enableConfigTesterForPlugin('mdx')
    .addOverrides();

  // Comes after `mdx/mdx`, so its processor wins. It also passes the MDX text on, which needs parsing
  configBuilderCodeBlocks?.addConfig(
    [
      'mdx/code-blocks-processor',
      {
        filesDefault: DEFAULT_FILES,
        parseWith: 'mdx',
      },
    ],
    // @ts-expect-error Type '{ [packageToLoadSymbol]: ...' has no properties in common with type 'FlatConfigEntryForBuilder'.
    {
      ...generatePackageToLoadProperty('processor', 'eslintPluginMdx', {
        valueTransformFn: {
          fn: ({eslintPluginMdx}) => eslintPluginMdx.createRemarkProcessor({lintCodeBlocks: true}),
        },
      }),
    },
  );

  configBuilderCodeBlocks
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
    .addOverrides();

  if (codeBlocksIgnoredLanguages?.length) {
    configBuilderCodeBlocks?.addGlobalIgnores(
      'mdx/code-blocks/ignore',
      codeBlocksIgnoredLanguages.map((ignoredLanguage) => `**/*.mdx/**/*.${ignoredLanguage}`),
    );
  }
});

import {ERROR, GLOB_MDX, GLOB_MDX_SUPPORTED_CODE_BLOCKS, WARNING} from '../constants';
import {generatePackageToLoadProperty} from '../loaders';
import {objectEntriesUnsafe, toKebabCase} from '../utils';
import type {MarkdownEslintConfigOptions} from './markdown';
import {
  determineRulesDisabledInEmbeddedCodeBlocks,
  resolveFilesOption,
  resolveIgnoresOption,
} from './shared';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [MDX](https://mdxjs.com) specific rules.
 *
 * 📁 Default `files`: <code>**&#47;*.mdx</code>
 */
export interface MdxEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends
    UnFlatConfigEntryBase<ExtraPlugins, 'mdx'>,
    Pick<MarkdownEslintConfigOptions, 'configCodeBlocks' | 'configFormatFencedCodeBlocks'> {
  /**
   * [`eslint-plugin-mdx`](https://npmx.dev/eslint-plugin-mdx) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
   * that will be assigned to `settings` object with keys transformed to `mdx/<property>` and
   * applied to the resolved `files` and `ignores` of this config.
   */
  settings?: {
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
  };
}

const DEFAULT_FILES = [GLOB_MDX];
const DEFAULT_FILES_FOR_CODE_BLOCKS = [GLOB_MDX_SUPPORTED_CODE_BLOCKS];

export default defineUnConfig<MdxEslintConfigOptions>('mdx', {phase: 'last'})((
  context,
  optionsRaw,
) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configCodeBlocks: true,
    configFormatFencedCodeBlocks: context.packagesInfo.prettier != null,
  });

  const {
    settings: pluginSettings,
    configCodeBlocks,
    configFormatFencedCodeBlocks,
  } = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'mdx');

  const configBuilderCodeBlocks = context.createConfigBuilder(configCodeBlocks, null);

  const {
    files: codeBlocksFilesOption,
    ignores: codeBlocksIgnoresOption,
    ignoredLanguages: codeBlocksIgnoredLanguages,
    impliedStrictMode,
  } = assignDefaults(configCodeBlocks, {impliedStrictMode: true});
  const codeBlocksFiles = resolveFilesOption(codeBlocksFilesOption, []);
  const codeBlocksIgnores = resolveIgnoresOption(codeBlocksIgnoresOption, []);

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(
      [
        'mdx/mdx',
        {
          filesDefault: DEFAULT_FILES,
          parser: 'mdx-eslint-parser',
          ignoresInternal: {
            mdx: false,
          },
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

  // The processor is also what post-processes `mdx/remark` reports, hence it is always added
  configBuilder?.addConfig(
    [
      'mdx/setup/code-blocks-processor',
      {
        applyUserFilesAndIgnores: false,
        filesDefault: codeBlocksFiles.length > 0 ? codeBlocksFiles : DEFAULT_FILES,
        ignoresDefault: codeBlocksIgnores,
        ignoresInternal: {mdx: false},
      },
    ],
    // @ts-expect-error Type '{ [packageToLoadSymbol]: ...' has no properties in common with type 'FlatConfigEntryForBuilder'.
    {
      ...generatePackageToLoadProperty('processor', 'eslintPluginMdx', {
        valueTransformFn: {
          fn: ({eslintPluginMdx}) =>
            eslintPluginMdx.createRemarkProcessor({
              lintCodeBlocks: configBuilderCodeBlocks != null,
            }),
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
    configBuilderCodeBlocks?.addConfig(
      ['mdx/code-blocks/ignore', {applyUserFilesAndIgnores: false}],
      {
        ignores: [`**/*.mdx/**/*.{${codeBlocksIgnoredLanguages.join(',')}}`],
      },
    );
  }

  const configFormatFencedCodeBlocksBuilder = context.createConfigBuilder(
    configFormatFencedCodeBlocks,
    'prettier',
  );

  configFormatFencedCodeBlocksBuilder
    ?.addConfig([
      'mdx/format-fenced-code-blocks',
      {
        filesDefault: DEFAULT_FILES_FOR_CODE_BLOCKS,
        ignoresInternal: false,
      },
    ])
    .addRule('prettier', ERROR, [{}, {eslintTakeoverMode: true}])
    .addOverrides();

  return {
    configs: [configBuilder, configBuilderCodeBlocks, configFormatFencedCodeBlocksBuilder],
    optionsResolved,
  };
});

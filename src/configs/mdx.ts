import {ERROR, GLOB_MDX, GLOB_MDX_SUPPORTED_CODE_BLOCKS, WARNING} from '../constants';
import type {UnFlatConfigEntryFilesAndIgnores} from '../eslint/eslint-types';
import {generatePackageToLoadProperty} from '../loaders';
import type {Prettify} from '../types';
import {objectEntriesUnsafe, toKebabCase} from '../utils';
import type {MarkdownEslintConfigOptions} from './markdown';
import {determineRulesDisabledInEmbeddedCodeBlocks} from './shared';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface MdxEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends
    UnFlatConfigEntryBase<ExtraPlugins, 'mdx'>,
    Pick<
      MarkdownEslintConfigOptions,
      | 'codeBlocksImpliedStrictMode'
      | 'codeBlocksIgnoredLanguages'
      | 'configFormatFencedCodeBlocks'
      | 'overridesCodeBlocks'
    > {
  /**
   * [`eslint-plugin-mdx`](https://npmx.dev/eslint-plugin-mdx) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `settings` object with keys transformed to
   * `mdx/<property>` and applied to the resolved `files` and `ignores` of this config.
   */
  settings?: {
    /**
     * Whether to lint code blocks inside MDX files.
     * @default false
     */
    codeBlocks?: boolean;

    /**
     * Maps a code block language to another one for the purpose of linting,
     * e.g. `{js: 'jsx'}` will treat ` ```js ` blocks as `jsx`.
     *
     * Set to `false` to disable the default mapping.
     */
    languageMapper?: Record<string, string> | false;

    /**
     * Whether to ignore the `remark` configuration files when resolving the
     * config for the [`remark`](https://npmx.dev/eslint-plugin-mdx#remark) rule.
     */
    ignoreRemarkConfig?: boolean;

    /**
     * Path to a `remark` configuration file to use for the
     * [`remark`](https://npmx.dev/eslint-plugin-mdx#remark) rule.
     */
    remarkConfigPath?: string;
  };

  /**
   * Lint fenced code blocks (\```lang ... ```) inside MDX files
   *
   * You can also specify which *MDX* files should be subject to fenced code blocks linting.
   * @default true
   * @example {files: ['**\/*.mdx'], ignores: ['ignored-file.mdx']}
   */
  lintCodeBlocks?: boolean | Prettify<UnFlatConfigEntryFilesAndIgnores>;
}

const DEFAULT_FILES = [GLOB_MDX];
const DEFAULT_FILES_FOR_CODE_BLOCKS = [GLOB_MDX_SUPPORTED_CODE_BLOCKS];

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    lintCodeBlocks: true,
    codeBlocksImpliedStrictMode: true,
    configFormatFencedCodeBlocks: context.packagesInfo.prettier != null,
  });

  const {
    settings: pluginSettings,
    lintCodeBlocks,
    codeBlocksImpliedStrictMode,
    codeBlocksIgnoredLanguages,
    configFormatFencedCodeBlocks,
  } = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'mdx');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(
      [
        'mdx/mdx',
        {
          includeDefaultFilesAndIgnores: true,
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

  configBuilder?.addConfig(
    [
      'mdx/setup/code-blocks-processor',
      {filesDefault: DEFAULT_FILES, ignoresInternal: {mdx: false}},
    ],
    {
      ...(typeof lintCodeBlocks === 'object' && lintCodeBlocks),
      ...generatePackageToLoadProperty('processor', 'eslintPluginMdx', {
        valueTransformFn: {
          fn: ({eslintPluginMdx}) => eslintPluginMdx.createRemarkProcessor({lintCodeBlocks: true}),
        },
      }),
    },
  );

  if (lintCodeBlocks) {
    configBuilder
      ?.addConfig(
        ['mdx/code-blocks', {filesDefault: DEFAULT_FILES_FOR_CODE_BLOCKS, ignoresInternal: false}],
        {
          languageOptions: {
            parserOptions: {
              ecmaFeatures: {
                impliedStrict: codeBlocksImpliedStrictMode,
              },
            },
          },
        },
      )
      .disableBulkRules(determineRulesDisabledInEmbeddedCodeBlocks(context))
      .addBulkRules(optionsResolved.overridesCodeBlocks); // TODO

    if (codeBlocksIgnoredLanguages?.length) {
      configBuilder?.addConfig('mdx/code-blocks/ignore', {
        ignores: [`**/*.mdx/**/*.{${codeBlocksIgnoredLanguages.join(',')}}`],
      });
    }
  }

  const configFormatFencedCodeBlocksBuilder = context.createConfigBuilder(
    configFormatFencedCodeBlocks,
    'prettier',
  );

  configFormatFencedCodeBlocksBuilder
    ?.addConfig([
      'mdx/format-fenced-code-blocks',
      {
        includeDefaultFilesAndIgnores: true,
        filesDefault: DEFAULT_FILES_FOR_CODE_BLOCKS,
        ignoresInternal: false,
      },
    ])
    .addRule('prettier', ERROR, [{}, {eslintTakeoverMode: true}]);

  return {
    configs: [configBuilder, configFormatFencedCodeBlocksBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'mdx'>;

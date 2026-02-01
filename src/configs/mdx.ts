import {ERROR, GLOB_MDX, GLOB_MDX_SUPPORTED_CODE_BLOCKS, WARNING} from '../constants';
import type {UnFlatConfigEntryFilesAndIgnores} from '../eslint/eslint-types';
import {generatePackageToLoadProperty} from '../loaders';
import type {Prettify} from '../types';
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
   * [`eslint-plugin-mdx`](https://npmjs.com/eslint-plugin-mdx) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `mdx` property
   * and applied to the resolved `files` and `ignores` of this config.
   */
  settings?: Record<string, unknown>;

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
  } satisfies MdxEslintConfigOptions);

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
          // TODO
          settings: {
            mdx: pluginSettings,
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

import {ERROR, GLOB_MDX, GLOB_MDX_SUPPORTED_CODE_BLOCKS, WARNING} from '../constants';
import {
  type FlatConfigEntryFilesOrIgnores,
  type UnConfigOptions,
  createConfigBuilder,
} from '../eslint';
import {pluginsLoaders} from '../plugins';
import type {PrettifyShallow} from '../types';
import {assignDefaults, interopDefault} from '../utils';
import type {MarkdownEslintConfigOptions} from './markdown';
import {RULES_TO_DISABLE_IN_EMBEDDED_CODE_BLOCKS} from './shared';
import type {UnConfigFn} from './index';

export interface MdxEslintConfigOptions
  extends UnConfigOptions<'mdx'>,
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
   * that will be assigned to `mdx` property and applied to the specified `files` and `ignores`.
   */
  settings?: Record<string, unknown>;

  /**
   * Lint fenced code blocks (\```lang ... ```) inside MDX files
   *
   * You can also specify which *MDX* files should be subject to fenced code blocks linting.
   * @default true
   * @example {files: ['**\/*.mdx'], ignores: ['ignored-file.mdx']}
   */
  lintCodeBlocks?: boolean | PrettifyShallow<FlatConfigEntryFilesOrIgnores>;
}

const DEFAULT_FILES = [GLOB_MDX];
const DEFAULT_FILES_FOR_CODE_BLOCKS = [GLOB_MDX_SUPPORTED_CODE_BLOCKS];

export const mdxUnConfig: UnConfigFn<'mdx'> = async (context) => {
  const [eslintPluginMdx, eslintParserMdx] = await Promise.all([
    pluginsLoaders.mdx(context),
    interopDefault(import('eslint-mdx')),
  ]);

  const optionsRaw = context.rootOptions.configs?.mdx;
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

  const configBuilder = createConfigBuilder(context, optionsResolved, 'mdx');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(
      [
        'mdx/mdx',
        {
          includeDefaultFilesAndIgnores: true,
          doNotIgnoreMdx: true,
          filesFallback: DEFAULT_FILES,
        },
      ],
      {
        languageOptions: {
          parser: eslintParserMdx,
          globals: {
            React: false,
          },
        },
        // TODO
        ...(pluginSettings && {
          settings: {
            mdx: pluginSettings,
          },
        }),
      },
    )
    .addRule('remark', WARNING) // TODO
    .addOverrides();

  configBuilder?.addConfig(
    [
      'mdx/setup/code-blocks-processor',
      {
        doNotIgnoreMdx: true,
        filesFallback: DEFAULT_FILES,
      },
    ],
    {
      ...(typeof lintCodeBlocks === 'object' && lintCodeBlocks),
      processor: eslintPluginMdx.createRemarkProcessor({
        lintCodeBlocks: true,
      }),
    },
  );

  if (lintCodeBlocks) {
    configBuilder
      ?.addConfig(
        [
          'mdx/code-blocks',
          {
            doNotIgnoreCss: true,
            doNotIgnoreHtml: true,
            doNotIgnoreMarkdown: true,
            doNotIgnoreMdx: true,
            filesFallback: DEFAULT_FILES_FOR_CODE_BLOCKS,
          },
        ],
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
      .disableBulkRules(RULES_TO_DISABLE_IN_EMBEDDED_CODE_BLOCKS)
      .addBulkRules(optionsResolved.overridesCodeBlocks); // TODO

    if (codeBlocksIgnoredLanguages?.length) {
      configBuilder?.addConfig('mdx/code-blocks/ignore', {
        ignores: [`**/*.mdx/**/*.{${codeBlocksIgnoredLanguages.join(',')}}`],
      });
    }
  }

  const configFormatFencedCodeBlocksBuilder = createConfigBuilder(
    context,
    configFormatFencedCodeBlocks,
    'prettier',
  );

  configFormatFencedCodeBlocksBuilder
    ?.addConfig([
      'mdx/format-fenced-code-blocks',
      {
        doNotIgnoreCss: true,
        doNotIgnoreHtml: true,
        doNotIgnoreMarkdown: true,
        doNotIgnoreMdx: true,
        includeDefaultFilesAndIgnores: true,
        filesFallback: DEFAULT_FILES_FOR_CODE_BLOCKS,
      },
    ])
    .addRule('prettier', ERROR, [{}, {eslintTakeoverMode: true}]);

  return {
    configs: [configBuilder, configFormatFencedCodeBlocksBuilder],
    optionsResolved,
  };
};

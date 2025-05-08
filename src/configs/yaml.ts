import {ERROR, GLOB_YAML, OFF} from '../constants';
import {type ConfigSharedOptions, type GetRuleOptions, createConfigBuilder} from '../eslint';
import {pluginsLoaders} from '../plugins';
import {assignDefaults, interopDefault} from '../utils';
import type {UnConfigFn} from './index';

export const YAML_DEFAULT_FILES = [GLOB_YAML];

const DEFAULT_FILES_TO_IGNORE = ['yarn.lock', 'pnpm-lock.yaml'] as const;

export interface YamlEslintConfigOptions extends ConfigSharedOptions<'yml'> {
  /** `files` specified in this config will be merged with the default of `['**\/*.y?(a)ml']`. Set this to `true` to avoid that behavior */
  doNotMergeFilesWithDefault?: boolean;

  /**
   * @default 'yml'
   */
  enforceExtension?: (GetRuleOptions<'yml/file-extension'>[0] & {})['extension'];
  doNotIgnoreFilesByDefault?: Partial<Record<(typeof DEFAULT_FILES_TO_IGNORE)[number], boolean>>;

  /**
   * Enforce a specific casing style for keys. It is not enforced by default, but passing an empty object here will enforce `camelCase` style (default value for this rule).
   * If present, `ignores` values will be merged with `<<`
   */
  casing?: GetRuleOptions<'yml/key-name-casing'>[0] & {};

  /**
   * `false` to not enforce quotes style
   * @default 'single'
   */
  quotes?: (GetRuleOptions<'yml/quotes'>[0] & {})['prefer'] | false;
  parseOptions?: {
    /**
     * @see https://github.com/ota-meshi/yaml-eslint-parser?tab=readme-ov-file#advanced-configuration
     */
    defaultYAMLVersion?: string;
  };
}

export const yamlUnConfig: UnConfigFn<'yaml'> = async (context) => {
  const [eslintPluginYaml, yamlEslintParser] = await Promise.all([
    pluginsLoaders.yml(),
    interopDefault(import('yaml-eslint-parser')),
  ]);

  const optionsRaw = context.rootOptions.configs?.yaml;
  const optionsResolved = assignDefaults(optionsRaw, {
    enforceExtension: 'yml',
  } satisfies YamlEslintConfigOptions);

  const {enforceExtension} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'yml');

  // LEGEND:
  // 🟣 = Included in Standard ruleset

  configBuilder
    ?.addConfig(
      [
        'yaml',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: YAML_DEFAULT_FILES,
          mergeUserFilesWithFallback: !optionsResolved.doNotMergeFilesWithDefault,
        },
      ],
      {
        ignores: [
          ...DEFAULT_FILES_TO_IGNORE.map((fileToIgnore) =>
            optionsResolved.doNotIgnoreFilesByDefault?.[fileToIgnore]
              ? undefined
              : (`**/${fileToIgnore}` as const),
          ).filter((v) => typeof v === 'string'),
          ...(optionsResolved.ignores || []),
        ],
        languageOptions: {
          parser: yamlEslintParser,
        },
      },
    )
    .addBulkRules(
      eslintPluginYaml.configs['flat/standard'].reduce(
        (result, config) => Object.assign(result, config.rules),
        {},
      ),
    )
    // 🟢 Base rules
    .addRule('block-mapping-colon-indicator-newline', ERROR) // >=1.2.0
    // .addRule('block-mapping-question-indicator-newline', ERROR) // 🟣 >=0.5.0
    // .addRule('block-mapping', ERROR) // 🟣 >=0.1.0
    // .addRule('block-sequence-hyphen-indicator-newline', ERROR) // 🟣 >=0.5.0
    // .addRule('block-sequence', ERROR) // 🟣 >=0.1.0
    // TODO why reporting here?
    .addRule('file-extension', ERROR, [{extension: enforceExtension}]) // >=1.2.0
    .addRule('indent', ERROR) // 🟣 >=0.1.0
    .addRule('key-name-casing', optionsResolved.casing == null ? OFF : ERROR, [
      {...optionsResolved.casing, ignores: ['<<', ...(optionsResolved.casing?.ignores || [])]},
    ]) // >=0.2.0
    // .addRule('no-empty-document', ERROR) // 🟣 >=0.6.0
    // .addRule('no-empty-key', ERROR) // 🟣 >=0.3.0
    // .addRule('no-empty-mapping-value', ERROR) // 🟣 >=0.3.0
    // .addRule('no-empty-sequence-entry', ERROR) // 🟣 >=0.3.0
    // .addRule('no-tab-indent', ERROR) // 🟣 >=0.1.0
    // .addRule('no-trailing-zeros', OFF) // >=1.6.0
    // TODO option to ignore if a string is ISO 8601 date?
    // .addRule('plain-scalar', ERROR) // 🟣 >=0.3.0
    .addRule('quotes', optionsResolved.quotes === false ? OFF : ERROR, [
      {prefer: optionsResolved.quotes || 'single'},
    ]) // 🟣 >=0.3.0
    // .addRule('require-string-key', OFF) // >=0.3.0
    // .addRule('sort-keys', OFF) // >=0.3.0
    // .addRule('sort-sequence-values', OFF) // >=0.14.0
    // .addRule('vue-custom-block/no-parsing-error', ERROR) // >=0.2.0
    // 🟢 Extension rules
    // .addRule('flow-mapping-curly-newline', ERROR) // 🟣 >=0.1.0
    // .addRule('flow-mapping-curly-spacing', ERROR) // 🟣 >=0.1.0
    // .addRule('flow-sequence-bracket-newline', ERROR) // 🟣 >=0.1.0
    // .addRule('flow-sequence-bracket-spacing', ERROR) // 🟣 >=0.1.0
    // .addRule('key-spacing', ERROR) // 🟣 >=0.3.0
    // .addRule('no-irregular-whitespace', ERROR) // 🟣 >=0.1.0
    .addRule('no-multiple-empty-lines', ERROR) // >=0.12.0
    .addRule('spaced-comment', ERROR) // 🟣 >=0.1.0
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

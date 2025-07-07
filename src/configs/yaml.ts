import {ERROR, OFF} from '../constants';
import {type GetRuleOptions, type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import {YAML_DEFAULT_FILES} from './shared';
import type {UnConfigFn} from './index';

const DEFAULT_FILES_TO_IGNORE = ['yarn.lock', 'pnpm-lock.yaml'] as const;

export interface YamlEslintConfigOptions extends UnConfigOptions<'yml'> {
  /**
   * `files` specified in this config will be merged with the default of `['**\/*.y?(a)ml']`. Set this to `true` to avoid that behavior
   */
  doNotMergeFilesWithDefault?: boolean;

  /**
   * Set to `false` to not enforce the extension.
   * @default 'yml'
   */
  enforceExtension?: 'yml' | 'yaml' | false;

  doNotIgnoreFilesByDefault?: Partial<Record<(typeof DEFAULT_FILES_TO_IGNORE)[number], boolean>>;

  /**
   * Enforce a specific casing style for keys. It is not enforced by default, but passing an empty object here will enforce `camelCase` style (default value for this rule).
   * If present, `ignores` values will be merged with `<<`
   */
  casing?: GetRuleOptions<'yml', 'key-name-casing'>[0] & {};

  /**
   * `false` to not enforce quotes style
   * @default 'single'
   */
  quotes?: 'single' | 'double' | false;

  parseOptions?: {
    /**
     * @see https://github.com/ota-meshi/yaml-eslint-parser?tab=readme-ov-file#advanced-configuration
     */
    defaultYAMLVersion?: string;
  };
}

export const yamlUnConfig: UnConfigFn<'yaml'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.yaml;
  const optionsResolved = assignDefaults(optionsRaw, {
    enforceExtension: 'yml',
  } satisfies YamlEslintConfigOptions);

  const {enforceExtension} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'yml');

  // Legend:
  // 🟣 = in standard

  configBuilder
    ?.addConfig(
      [
        'yaml',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: YAML_DEFAULT_FILES,
          mergeUserFilesWithFallback: !optionsResolved.doNotMergeFilesWithDefault,
          parser: 'yaml-eslint-parser',
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
      },
    )
    /* Category: Base rules */
    .addRule('block-mapping-colon-indicator-newline', ERROR) // >=1.2.0
    .addRule('block-mapping-question-indicator-newline', ERROR) // 🟣 >=0.5.0
    .addRule('block-mapping', ERROR) // 🟣 >=0.1.0
    .addRule('block-sequence-hyphen-indicator-newline', ERROR) // 🟣 >=0.5.0
    .addRule('block-sequence', ERROR) // 🟣 >=0.1.0
    // TODO why reporting here?
    .addRule(
      'file-extension',
      enforceExtension ? ERROR : OFF,
      enforceExtension ? [{extension: enforceExtension}] : [],
    ) // >=1.2.0
    .addRule('indent', ERROR) // 🟣 >=0.1.0
    .addRule('key-name-casing', optionsResolved.casing == null ? OFF : ERROR, [
      {...optionsResolved.casing, ignores: ['<<', ...(optionsResolved.casing?.ignores || [])]},
    ]) // >=0.2.0
    .addRule('no-empty-document', ERROR) // 🟣 >=0.6.0
    .addRule('no-empty-key', ERROR) // 🟣 >=0.3.0
    .addRule('no-empty-mapping-value', ERROR) // 🟣 >=0.3.0
    .addRule('no-empty-sequence-entry', ERROR) // 🟣 >=0.3.0
    .addRule('no-tab-indent', ERROR) // 🟣 >=0.1.0
    .addRule('no-trailing-zeros', OFF) // >=1.6.0
    // TODO option to ignore if a string is ISO 8601 date?
    .addRule('plain-scalar', ERROR) // 🟣 >=0.3.0
    .addRule('quotes', optionsResolved.quotes === false ? OFF : ERROR, [
      {prefer: optionsResolved.quotes || 'single'},
    ]) // 🟣 >=0.3.0
    .addRule('require-string-key', OFF) // >=0.3.0
    .addRule('sort-keys', OFF) // >=0.3.0
    .addRule('sort-sequence-values', OFF) // >=0.14.0
    .addRule('vue-custom-block/no-parsing-error', ERROR) // >=0.2.0
    /* Category: Extension rules */
    .addRule('flow-mapping-curly-newline', ERROR) // 🟣 >=0.1.0
    .addRule('flow-mapping-curly-spacing', ERROR) // 🟣 >=0.1.0
    .addRule('flow-sequence-bracket-newline', ERROR) // 🟣 >=0.1.0
    .addRule('flow-sequence-bracket-spacing', ERROR) // 🟣 >=0.1.0
    .addRule('key-spacing', ERROR) // 🟣 >=0.3.0
    .addRule('no-irregular-whitespace', ERROR) // 🟣 >=0.1.0
    .addRule('no-multiple-empty-lines', ERROR) // >=0.12.0
    .addRule('spaced-comment', ERROR) // 🟣 >=0.1.0
    .disableAnyRule('', 'no-irregular-whitespace') // 🟣
    .disableAnyRule('', 'no-unused-vars') // 🟣
    .disableAnyRule('', 'spaced-comment') // 🟣
    .addOverrides();

  if (context.usedPackageManager?.name === 'pnpm') {
    configBuilder
      ?.addConfig('yaml/pnpm-workspace.yaml', {
        files: ['**/pnpm-workspace.yaml'],
      })
      .addRule('file-extension', OFF);
  }

  configBuilder
    ?.addConfig('yaml/github-actions', {
      files: ['**/.github/workflows/**/*.{yml,yaml}'],
    })
    // Example: `pull_request:` may be empty
    .addRule('no-empty-mapping-value', OFF);

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

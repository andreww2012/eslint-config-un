import {ERROR, OFF} from '../constants';
import {YAML_DEFAULT_FILES} from './shared';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

const DEFAULT_FILES_TO_IGNORE = ['yarn.lock', 'pnpm-lock.yaml'] as const;

export interface YamlEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, 'yml'> {
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
  casing?: GetRuleOptions<'yml', 'key-name-casing'>;

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

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    enforceExtension: 'yml',
  } satisfies YamlEslintConfigOptions);

  const {enforceExtension} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'yml');

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
    .markCategory('Base rules')
    .addRule('block-mapping', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('block-mapping-colon-indicator-newline', ERROR) /** @since 1.2.0 */
    .addRule('block-mapping-question-indicator-newline', ERROR) /** @since 0.5.0 */ // 🟣
    .addRule('block-sequence', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('block-sequence-hyphen-indicator-newline', ERROR) /** @since 0.5.0 */ // 🟣
    // TODO why reporting here?
    .addRule(
      'file-extension',
      enforceExtension ? ERROR : OFF,
      enforceExtension ? [{extension: enforceExtension}] : [],
    ) /** @since 1.2.0 */
    .addRule('indent', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('key-name-casing', optionsResolved.casing == null ? OFF : ERROR, [
      {...optionsResolved.casing, ignores: ['<<', ...(optionsResolved.casing?.ignores || [])]},
    ]) /** @since 0.2.0 */
    .addRule('no-empty-document', ERROR) /** @since 0.6.0 */ // 🟣
    .addRule('no-empty-key', ERROR) /** @since 0.3.0 */ // 🟣
    .addRule('no-empty-mapping-value', ERROR) /** @since 0.3.0 */ // 🟣
    .addRule('no-empty-sequence-entry', ERROR) /** @since 0.3.0 */ // 🟣
    .addRule('no-tab-indent', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('no-trailing-zeros', OFF) /** @since 1.6.0 */
    // TODO option to ignore if a string is ISO 8601 date?
    .addRule('plain-scalar', ERROR) /** @since 0.3.0 */ // 🟣
    .addRule('quotes', optionsResolved.quotes === false ? OFF : ERROR, [
      {prefer: optionsResolved.quotes || 'single'},
    ]) /** @since 0.3.0 */ // 🟣
    .addRule('require-string-key', OFF) /** @since 0.3.0 */
    .addRule('sort-keys', OFF) /** @since 0.3.0 */
    .addRule('sort-sequence-values', OFF) /** @since 0.14.0 */
    .addRule('vue-custom-block/no-parsing-error', ERROR) /** @since 0.2.0 */
    .markCategory('Extension rules')
    .addRule('flow-mapping-curly-newline', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('flow-mapping-curly-spacing', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('flow-sequence-bracket-newline', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('flow-sequence-bracket-spacing', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('key-spacing', ERROR) /** @since 0.3.0 */ // 🟣
    .addRule('no-irregular-whitespace', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('no-multiple-empty-lines', ERROR) /** @since 0.12.0 */
    .addRule('spaced-comment', ERROR) /** @since 0.1.0 */ // 🟣
    .disableAnyRule('', 'no-irregular-whitespace') // 🟣
    .disableAnyRule('', 'no-unused-vars') // 🟣
    .disableAnyRule('', 'spaced-comment') // 🟣
    .enableConfigTesterForPlugin('yml')
    .addOverrides();

  if (context.meta.usedPackageManager?.name === 'pnpm') {
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
}) satisfies UnConfigFn<'yaml'>;

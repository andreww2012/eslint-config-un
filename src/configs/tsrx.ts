import {ERROR, GLOB_JS_TS, GLOB_RIPPLE, GLOB_TSRX, OFF, WARNING} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
  getRuleUnSeverityAndOptionsFromEntry,
} from './index';

/**
 * [TSRX](https://tsrx.dev) specific rules.
 * TSRX is target-neutral, and [Ripple](https://github.com/Ripple-TS/ripple) is one of its targets.
 *
 * 📁 Default `files`:
 * - <code>**&#47;*.tsrx</code>
 * - <code>**&#47;*.ripple</code>
 * - <code>**&#47;*.?([cm])[jt]s</code>
 */
export interface TsrxEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'tsrx'> {}

const DEFAULT_TSRX_FILES: readonly string[] = [GLOB_TSRX, GLOB_RIPPLE];

// The plugin's versions of these understand TSRX syntax
const CORE_RULES_REPLACED_IN_TSRX_FILES: readonly string[] = [
  'no-await-in-loop',
  'no-unreachable',
  'no-unused-vars',
  'no-useless-assignment',
];

export default defineUnConfig<TsrxEslintConfigOptions, readonly ['js']>('tsrx', {
  enabledBy: {packages: ['@tsrx/core', 'ripple']},
  // Turns off the core rules it replaces in TSRX files, so we must win
  after: ['js'],
  needs: ['js'],
})((context, optionsRaw, {js}) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  // The rules also run on plain `.js`/`.ts`, which this parser cannot read
  context.requestParsing('tsrx', {kind: 'setUpOnly'});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'tsrx');

  // Legend:
  // 🔴 - NOT in recommended

  // Replace the core rules, so inherit their severities and options, which the user might have
  // changed. Comes first, so the user's overrides in the main config win
  configBuilder
    ?.addConfig([
      'tsrx/core-rules-replacements',
      {applyUserFilesAndIgnores: false, filesDefault: DEFAULT_TSRX_FILES},
    ])
    .addRule(
      'no-await-in-loop',
      ...getRuleUnSeverityAndOptionsFromEntry(
        js?.finalFlatConfigRules['no-await-in-loop'] ?? WARNING,
      ),
    ) /** @since 0.7.0 */ // 🔴
    .addRule(
      'no-unreachable',
      ...getRuleUnSeverityAndOptionsFromEntry(js?.finalFlatConfigRules['no-unreachable'] ?? ERROR),
    ) /** @since 0.7.0 */ // 🔴
    .addRule(
      'no-unused-vars',
      ...getRuleUnSeverityAndOptionsFromEntry(js?.finalFlatConfigRules['no-unused-vars'] ?? ERROR),
    ) /** @since 0.7.0 */ // 🔴
    .addRule(
      'no-useless-assignment',
      ...getRuleUnSeverityAndOptionsFromEntry(
        js?.finalFlatConfigRules['no-useless-assignment'] ?? ERROR,
      ),
    ) /** @since 0.7.6 */ // 🔴
    .disableBulkRules(CORE_RULES_REPLACED_IN_TSRX_FILES);

  configBuilder
    ?.addConfig([
      'tsrx',
      {
        filesDefault: [...DEFAULT_TSRX_FILES, GLOB_JS_TS],
        parsingIgnoresInheritedFrom: ['tsrx'],
      },
    ])
    .addRule('control-flow-jsx', ERROR) /** @since 0.3.25 */
    // Replaces `react/jsx-curly-brace-presence`, which doesn't run in TSRX files
    .addRule('jsx-curly-brace-presence', OFF) /** @since 0.7.0 */ // 🔴
    // TODO note: only applied to .tsrx files in the recommended config, should we do the same?:
    // https://github.com/tsrx-org/tsrx/blob/52aa4cf20a66a03878da89ad2c761c554a9e8c70/packages/eslint-plugin/src/index.ts#L51-L53
    .addRule('require-statement-container-body', ERROR) /** @since 0.3.76 */
    .addRule('valid-for-of-key', ERROR) /** @since 0.3.25 */
    .enableConfigTesterForPlugin('tsrx', {rulesToSkipInConfig: CORE_RULES_REPLACED_IN_TSRX_FILES})
    .addOverrides();
});

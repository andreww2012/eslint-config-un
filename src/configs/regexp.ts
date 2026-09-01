import {ERROR, OFF, WARNING} from '../constants';
import type {MaybeArray} from '../utils';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [`eslint-plugin-regexp`](https://npmx.dev/eslint-plugin-regexp) plugin
 * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
 * that will be assigned to the `regexp` property of the `settings` flat config option.
 */
export interface RegexpPluginSettings {
  /**
   * Defines a set of allowed character ranges.
   * Rules will only allow, create, and fix character ranges defined here.
   * @default 'alphanumeric'
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/settings/#allowedcharacterranges
   */
  allowedCharacterRanges?: MaybeArray<'alphanumeric' | 'all' | `${string}-${string}`>;
}

/**
 * An ESLint plugin that finds RegExp mistakes and stylistic issues.
 *
 * 📁 Default `files`: all files
 */
export interface RegexpEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'regexp'> {}

export default defineUnConfig<RegexpEslintConfigOptions>('regexp', {
  enabledBy: true,
  // Replaces `unicorn/prefer-regexp-test` with our own rule, so we must win
  after: ['unicorn'],
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const pluginSettings = context.getPluginSettings('regexp');

  const configBuilder = context.createConfigBuilder(optionsResolved, 'regexp');

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig([
      'regexp',
      {
        // TODO why?
        ignoresInternal: {
          html: false,
        },
        settings: {
          regexp: pluginSettings,
        },
      },
    ])
    .markCategory('Possible Errors')
    .addRule('no-contradiction-with-assertion', ERROR) /** @since 1.2.0 */ // 🟢
    // "This rule is inspired by the `no-control-regex` rule. The positions of reports are improved over the core rule and suggestions are provided in some cases"
    .disableAnyRule('', 'no-control-regex') // TODO 🟢(enabled?!)
    .addRule('no-control-character', ERROR) /** @since 1.2.0 */
    .addRule('no-dupe-disjunctions', ERROR) /** @since 0.4.0 */ // 🟢
    .addRule('no-empty-alternative', ERROR) /** @since 0.8.0 */ // 🟡
    .addRule('no-empty-capturing-group', ERROR) /** @since 0.12.0 */ // 🟢
    // "The reports for this rule include reports for the ESLint core no-empty-character-class rule. That is, if you use this rule, you can turn off the ESLint core no-empty-character-class rule"
    .addRule('no-empty-character-class', ERROR) /** @since 1.2.0 */ // 🟢
    .disableAnyRule('', 'no-empty-character-class') // 🟢
    .addRule('no-empty-group', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-empty-lookarounds-assertion', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-escape-backspace', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-invalid-regexp', ERROR) /** @since 1.0.0 */ // 🟢
    .disableAnyRule('', 'no-invalid-regexp')
    .addRule('no-lazy-ends', ERROR) /** @since 0.8.0 */ // 🟡
    .addRule('no-misleading-capturing-group', ERROR) /** @since 1.12.0 */ // 🟢
    .addRule('no-misleading-unicode-character', ERROR) /** @since  1.2.0 */ // 🟢
    .addRule('no-missing-g-flag', ERROR) /** @since 1.10.0 */ // 🟢
    .addRule('no-optional-assertion', ERROR) /** @since 0.9.0 */ // 🟢
    .addRule('no-potentially-useless-backreference', WARNING) /** @since 0.9.0 */ // 🟡
    .addRule('no-super-linear-backtracking', ERROR) /** @since 0.13.0 */ // 🟢
    .addRule('no-super-linear-move', OFF) /** @since 0.13.0 */
    .addRule('no-useless-assertions', ERROR) /** @since 0.9.0 */ // 🟢
    // "This rule is a based on the ESLint core `no-useless-backreference` rule. It reports all the ESLint core rule reports and some more"
    .addRule('no-useless-backreference', ERROR) /** @since 0.1.0 */ // 🟢
    .disableAnyRule('', 'no-useless-backreference') // 🟢
    .addRule('no-useless-dollar-replacements', ERROR) /** @since 0.6.0 */ // 🟢
    .addRule('strict', ERROR) /** @since 0.12.0 */ // 🟢
    .markCategory('Best Practices')
    .addRule('confusing-quantifier', ERROR) /** @since 0.8.0 */ // 🟡
    .addRule('control-character-escape', ERROR) /** @since 0.9.0 */ // 🟢
    .addRule('negation', ERROR) /** @since 0.4.0 */ // 🟢
    .addRule('no-dupe-characters-character-class', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-empty-string-literal', ERROR) /** @since 2.0.0-next.11 */ // 🟢
    .addRule('no-extra-lookaround-assertions', ERROR) /** @since 1.11.0 */ // 🟢
    .addRule('no-invisible-character', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-legacy-features', ERROR) /** @since 0.6.0 */ // 🟢
    .addRule('no-non-standard-flag', ERROR) /** @since 0.9.0 */ // 🟢
    .addRule('no-obscure-range', WARNING) /** @since 0.9.0 */ // 🟢
    .addRule('no-octal', ERROR) /** @since 0.1.0 */
    .addRule('no-standalone-backslash', ERROR) /** @since 0.10.0 */
    .addRule('no-trivially-nested-assertion', ERROR) /** @since 0.9.0 */ // 🟢
    .addRule('no-trivially-nested-quantifier', ERROR) /** @since 0.9.0 */ // 🟢
    .addRule('no-unused-capturing-group', ERROR) /** @since 0.6.0 */ // 🟢
    .addRule('no-useless-character-class', ERROR) /** @since 0.3.0 */ // 🟢
    .addRule('no-useless-flag', ERROR) /** @since 0.9.0 */ // 🟡
    .addRule('no-useless-lazy', ERROR) /** @since 0.10.0 */ // 🟢
    .addRule('no-useless-quantifier', ERROR) /** @since 0.10.0 */ // 🟢
    .addRule('no-useless-range', ERROR) /** @since 0.3.0 */ // 🟢
    .addRule('no-useless-set-operand', ERROR) /** @since 2.0.0-next.10 */ // 🟢
    .addRule('no-useless-string-literal', ERROR) /** @since 2.0.0-next.12 */ // 🟢
    .addRule('no-useless-two-nums-quantifier', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-zero-quantifier', ERROR) /** @since 0.10.0 */ // 🟢
    .addRule('optimal-lookaround-quantifier', ERROR) /** @since 0.8.0 */ // 🟡
    .addRule('optimal-quantifier-concatenation', ERROR) /** @since 0.11.0 */ // 🟢
    .addRule('prefer-escape-replacement-dollar-char', OFF) /** @since 0.6.0 */
    .addRule('prefer-predefined-assertion', ERROR) /** @since 0.10.0 */ // 🟢
    .addRule('prefer-quantifier', ERROR, [{allows: ['www', String.raw`\d\d`]}]) /** @since 0.2.0 */
    .addRule('prefer-range', ERROR) /** @since 0.4.0 */ // 🟢
    // Same (?) as `ts/prefer-regexp-exec` which is turned off by default
    .addRule('prefer-regexp-exec', OFF) /** @since 0.3.0 */
    .disableAnyRule('unicorn', 'prefer-regexp-test')
    .addRule('prefer-regexp-test', ERROR) // TODO better than the unicorn rule? Off by default
    .addRule('prefer-set-operation', ERROR) /** @since 2.0.0-next.9 */ // 🟢
    // "This rule is inspired by the `require-unicode-regexp` rule. The position of the report is improved over the core rule and arguments of new RegExp() are also checked"
    // Yes, still off - we just want to show that it's a better replacement for the core rule
    .addRule('require-unicode-regexp', OFF) /** @since 1.2.0 */
    .disableAnyRule('', 'require-unicode-regexp')
    .addRule('require-unicode-sets-regexp', OFF) /** @since 2.0.0-next.7 */
    .addRule('simplify-set-operations', ERROR) /** @since 2.0.0-next.11 */ // 🟢
    .addRule('sort-alternatives', OFF) /** @since 0.12.0 */
    .addRule('use-ignore-case', ERROR) /** @since 1.4.0 */ // 🟢
    .markCategory('Stylistic Issues')
    .addRule('grapheme-string-literal', OFF) /** @since 2.0.0-next.13 */ // TODO
    .addRule('hexadecimal-escape', ERROR, ['never']) /** @since 0.9.0 */
    .addRule('letter-case', ERROR, [
      {
        // `lowercase` conflicts with `unicorn/escape-case`: https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/escape-case.md
        unicodeEscape: 'uppercase',
        hexadecimalEscape: 'uppercase',
      },
    ]) /** @since 0.3.0 */
    .addRule('match-any', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-useless-escape', ERROR) /** @since 0.4.0 */ // 🟢
    .addRule('no-useless-non-capturing-group', ERROR) /** @since 0.4.0 */ // 🟢
    .addRule('prefer-character-class', ERROR) /** @since 0.4.0 */ // 🟢
    .addRule('prefer-d', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('prefer-lookaround', ERROR, [{lookbehind: false}]) /** @since 1.2.0 */
    .addRule('prefer-named-backreference', OFF) /** @since 0.9.0 */
    // "This rule is inspired by the `prefer-named-capture-group` rule. The positions of reports are improved over the core rule and arguments of new RegExp() are also checked"
    // Yes, still off - we just want to show that it's a better replacement for the core rule
    .addRule('prefer-named-capture-group', OFF) /** @since 1.2.0 */
    .disableAnyRule('', 'prefer-named-capture-group')
    .addRule('prefer-named-replacement', OFF) /** @since 1.4.0 */
    .addRule('prefer-plus-quantifier', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('prefer-question-quantifier', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('prefer-result-array-groups', OFF) /** @since 1.4.0 */
    .addRule('prefer-star-quantifier', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('prefer-unicode-codepoint-escapes', ERROR) /** @since 0.3.0 */ // 🟢
    .addRule('prefer-w', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('sort-character-class-elements', ERROR) /** @since 0.12.0 */
    .addRule('sort-flags', ERROR) /** @since 0.9.0 */ // 🟢
    .addRule('unicode-escape', OFF) /** @since 0.9.0 */
    .addRule('unicode-property', ERROR) /** @since 2.5.0 */
    .enableConfigTesterForPlugin('regexp')
    .addOverrides();
});

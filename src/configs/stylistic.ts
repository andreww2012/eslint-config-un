// cspell:ignore nonblock
import type eslintPluginStylistic from '@stylistic/eslint-plugin';
import {ERROR, GLOB_HTML, GLOB_YAML, OFF, type RuleSeverity} from '../constants';
import type {FlatConfigEntry, GetRuleOptions, RuleNamesForPlugin} from '../eslint';
import {pluginsLoaders} from '../loaders';
import type {OmitStrict} from '../types';
import {mapKeys} from '../utils';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

export interface StylisticEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, '@stylistic'> {
  /**
   * Customization function directly coming from [the plugin](https://eslint.style/guide/config-presets#configuration-factory).
   *
   * This, if used, will override severity and options set by us.
   */
  customizeOptions?: OmitStrict<
    Parameters<(typeof eslintPluginStylistic)['configs']['customize']>[0] & {},
    'pluginName'
  >;
}

export default (async (context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies StylisticEslintConfigOptions);

  const {customizeOptions} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, '@stylistic');

  let configProducedByCustomize: FlatConfigEntry['rules'] | undefined;
  if (customizeOptions) {
    const {customize} = await pluginsLoaders['@stylistic'](context).then(
      ({module}) => module.configs,
    );
    configProducedByCustomize = mapKeys(customize(customizeOptions).rules || {}, (_, key) =>
      String(key).slice('@stylistic/'.length),
    );
  }

  const setupRule = <
    RuleName extends RuleNamesForPlugin<'@stylistic'>,
    _RuleOptions = GetRuleOptions<'@stylistic', RuleName, 'all'>,
  >(
    ruleName: RuleName,
    severity: RuleSeverity = OFF,
    options?: NoInfer<_RuleOptions>,
  ): [RuleName, RuleSeverity, _RuleOptions] => {
    const customizedRuleEntry = configProducedByCustomize?.[ruleName];
    const severityFinal =
      customizedRuleEntry == null
        ? severity
        : ((Array.isArray(customizedRuleEntry)
            ? customizedRuleEntry[0]
            : customizedRuleEntry) as RuleSeverity);
    const optionsFinal = Array.isArray(customizedRuleEntry)
      ? customizedRuleEntry.slice(1)
      : options || [];
    return [ruleName, severityFinal, optionsFinal as _RuleOptions];
  };

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['stylistic', {includeDefaultFilesAndIgnores: true}])
    .addRule(...setupRule('array-bracket-newline', OFF)) /** @since 0.0.4 */
    .addRule(...setupRule('array-bracket-spacing', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('array-element-newline', OFF)) /** @since 0.0.4 */
    .addRule(...setupRule('arrow-parens', OFF)) /** @since 0.0.12 */ // 🟢
    .addRule(...setupRule('arrow-spacing', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('block-spacing', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('brace-style', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('comma-dangle', OFF)) /** @since 0.0.5 */ // 🟢
    .addRule(...setupRule('comma-spacing', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('comma-style', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('computed-property-spacing', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('curly-newline', OFF)) /** @since 2.9.0 */
    .addRule(...setupRule('dot-location', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('eol-last', OFF)) /** @since 0.0.6 */ // 🟢
    .addRule(...setupRule('exp-list-style', OFF)) /** @since 5.5.0 */
    .addRule(...setupRule('function-call-argument-newline', OFF)) /** @since 0.0.4 */
    .addRule(...setupRule('function-call-spacing', OFF)) /** @since 0.0.4 */
    .addRule(...setupRule('function-paren-newline', OFF)) /** @since 1.2.0 */
    .addRule(...setupRule('generator-star-spacing', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('implicit-arrow-linebreak', OFF)) /** @since 0.0.4 */
    .addRule(...setupRule('indent', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('indent-binary-ops', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('jsx-child-element-spacing', OFF)) /** @since 1.5.0-beta.0 */
    .addRule(...setupRule('jsx-closing-bracket-location', OFF)) /** @since 0.0.7 */ // 🟢
    .addRule(...setupRule('jsx-closing-tag-location', OFF)) /** @since 0.0.7 */ // 🟢
    .addRule(...setupRule('jsx-curly-brace-presence', OFF)) /** @since 0.0.7 */ // 🟢
    .addRule(...setupRule('jsx-curly-newline', OFF)) /** @since 0.0.7 */ // 🟢
    .addRule(...setupRule('jsx-curly-spacing', OFF)) /** @since 0.0.7 */ // 🟢
    .addRule(...setupRule('jsx-equals-spacing', OFF)) /** @since 0.0.7 */ // 🟢
    .addRule(...setupRule('jsx-first-prop-new-line', OFF)) /** @since 0.0.7 */ // 🟢
    .addRule(...setupRule('jsx-function-call-newline', OFF)) /** @since 0.0.7 */ // 🟢
    .addRule(...setupRule('jsx-indent-props', OFF)) /** @since 1.8.0 */ // 🟢
    .addRule(...setupRule('jsx-max-props-per-line', OFF)) /** @since 0.0.7 */ // 🟢
    .addRule(...setupRule('jsx-newline', OFF)) /** @since 0.0.7 */
    .addRule(...setupRule('jsx-one-expression-per-line', OFF)) /** @since 0.0.7 */ // 🟢
    .addRule(...setupRule('jsx-pascal-case', OFF)) /** @since 1.6.0 */
    .addRule(...setupRule('jsx-quotes', OFF)) /** @since 0.0.6 */ // 🟢
    .addRule(...setupRule('jsx-self-closing-comp', OFF)) /** @since 0.1.0 */
    .addRule(...setupRule('jsx-sort-props', OFF)) /** @since 0.0.7 */
    .addRule(...setupRule('jsx-tag-spacing', OFF)) /** @since 0.0.7 */ // 🟢
    .addRule(...setupRule('jsx-wrap-multilines', OFF)) /** @since 0.0.7 */ // 🟢
    .addRule(...setupRule('key-spacing', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('keyword-spacing', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('line-comment-position', OFF)) /** @since 2.1.0 */
    .addRule(...setupRule('linebreak-style', OFF)) /** @since 0.0.4 */
    .addRule(...setupRule('lines-around-comment', OFF)) /** @since 0.0.4 */
    .addRule(...setupRule('lines-between-class-members', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('max-len', OFF)) /** @since 0.0.6 */
    .addRule(...setupRule('max-statements-per-line', OFF)) /** @since 0.0.6 */ // 🟢
    .addRule(...setupRule('member-delimiter-style', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('multiline-comment-style', OFF)) /** @since 2.1.0 */
    .addRule(...setupRule('multiline-ternary', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('new-parens', OFF)) /** @since 0.0.6 */ // 🟢
    .addRule(...setupRule('newline-per-chained-call', OFF)) /** @since 0.0.4 */
    .addRule(...setupRule('no-confusing-arrow', OFF)) /** @since 0.0.6 */
    .addRule(...setupRule('no-extra-parens', OFF)) /** @since 0.0.6 */ // 🟢
    .addRule(...setupRule('no-extra-semi', OFF)) /** @since 0.0.6 */
    .addRule(...setupRule('no-floating-decimal', OFF)) /** @since 0.0.6 */ // 🟢
    .addRule(...setupRule('no-mixed-operators', OFF)) /** @since 0.0.6 */ // 🟢
    .addRule(...setupRule('no-mixed-spaces-and-tabs', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('no-multi-spaces', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('no-multiple-empty-lines', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('no-tabs', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('no-trailing-spaces', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('no-whitespace-before-property', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('nonblock-statement-body-position', OFF)) /** @since 0.0.4 */
    .addRule(...setupRule('object-curly-newline', OFF)) /** @since 0.0.4 */
    .addRule(...setupRule('object-curly-spacing', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('object-property-newline', OFF)) /** @since 0.0.4 */
    .addRule(...setupRule('one-var-declaration-per-line', OFF)) /** @since 0.0.4 */
    .addRule(...setupRule('operator-linebreak', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('padded-blocks', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(
      ...setupRule('padding-line-between-statements', ERROR, [
        {blankLine: 'never', prev: 'import', next: 'import'},
      ]),
    ) /** @since 0.0.4 */
    .addRule(...setupRule('quote-props', OFF)) /** @since 0.0.6 */ // 🟢
    .addRule(
      ...setupRule('quotes', ERROR, [
        'single', // Doesn't matter since `ignoreStringLiterals` is true - BUT will be used in fixes
        {
          ignoreStringLiterals: true,
          avoidEscape: true,
          allowTemplateLiterals: 'avoidEscape',
        },
      ]),
    ) /** @since 0.0.5 */ // 🟢
    .addRule(...setupRule('rest-spread-spacing', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('semi', OFF)) /** @since 0.0.5 */ // 🟢
    .addRule(...setupRule('semi-spacing', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('semi-style', OFF)) /** @since 0.0.4 */
    .addRule(...setupRule('space-before-blocks', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('space-before-function-paren', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('space-in-parens', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('space-infix-ops', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('space-unary-ops', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('spaced-comment', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('switch-colon-spacing', OFF)) /** @since 0.0.4 */
    .addRule(...setupRule('template-curly-spacing', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('template-tag-spacing', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('type-annotation-spacing', OFF)) /** @since 0.0.4 */ // 🟢
    .addRule(...setupRule('type-generic-spacing', OFF)) /** @since 1.5.0-beta.0 */ // 🟢
    .addRule(...setupRule('type-named-tuple-spacing', OFF)) /** @since 1.5.0-beta.0 */ // 🟢
    .addRule(...setupRule('wrap-iife', OFF)) /** @since 0.0.6 */ // 🟢
    .addRule(...setupRule('wrap-regex', OFF)) /** @since 0.0.6 */
    .addRule(...setupRule('yield-star-spacing', OFF)) /** @since 0.0.4 */ // 🟢
    .enableConfigTesterForPlugin('@stylistic')
    .addOverrides();

  configBuilder
    ?.addConfig('stylistic/spaced-comment', {
      ...(optionsResolved.files?.length && {files: optionsResolved.files}),
      // TODO possible to do anything with this?
      // Triggered on all YAML comments because they all are considered Block for whatever reason: https://github.com/ota-meshi/yaml-eslint-parser/blob/498dc41fbed52abd4e508bc903d98e3d1d62d555/src/convert.ts#L1581
      // Might crash on HTML files (if receives a comment node with `CommentContent` type)
      ignores: [GLOB_YAML, GLOB_HTML, ...(optionsResolved.ignores || [])],
    })
    .addRule(...setupRule('spaced-comment', ERROR, ['always', {block: {balanced: true}}]));

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'stylistic'>;

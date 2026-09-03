// cspell:ignore selectordinal
import {ERROR, OFF} from '../constants';
import {getKeysOfTruthyValues} from '../utils';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [`eslint-plugin-formatjs`](https://npmx.dev/eslint-plugin-formatjs) plugin
 * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
 * that will be assigned to the `formatjs` property of the `settings` flat config option.
 * @see https://formatjs.github.io/docs/tooling/linter#shared-settings
 */
export interface FormatjsPluginSettings {
  /**
   * Allows you to specify additional function names to check besides `formatMessage` &
   * `$formatMessage`.
   */
  additionalFunctionNames?: string[];

  /**
   * Allows you to specify additional component names to check besides `FormattedMessage`.
   */
  additionalComponentNames?: string[];

  /**
   * Skips the message descriptors declared via `defineMessage(s)` calls, only checking the ones
   * passed to the formatting functions and components.
   */
  excludeMessageDeclCalls?: boolean;

  /**
   * Disables the parsing of the HTML-like tags inside the messages, treating them as plain text.
   */
  ignoreTag?: boolean;
}

/**
 * [FormatJS](https://formatjs.github.io) specific rules.
 *
 * 📁 Default `files`: all files
 */
export interface FormatjsEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'formatjs'> {
  /**
   * Enforce `defaultMessage` in the message descriptor.
   *
   * Affected rule:
   * - [`formatjs/enforce-default-message`](https://formatjs.github.io/docs/tooling/linter#enforce-default-message)
   * @default 'anything'
   */
  enforceDefaultMessage?: GetRuleOptions<'formatjs', 'enforce-default-message'> | false;

  /**
   * Enforce `description` in the message descriptor.
   *
   * Affected rule:
   * - [`formatjs/enforce-description`](https://formatjs.github.io/docs/tooling/linter#enforce-description)
   * @default 'anything'
   */
  enforceDescription?: GetRuleOptions<'formatjs', 'enforce-description'> | false;

  /**
   * Enforce or ban explicit ID in `MessageDescriptor`.
   * Not enforced by default.
   *
   * Affected rules:
   * - [`formatjs/enforce-id`](https://formatjs.github.io/docs/tooling/linter#enforce-id)
   * - [`formatjs/no-id`](https://formatjs.github.io/docs/tooling/linter#no-id)
   */
  enforceId?: 'always' | 'never';

  /**
   * Enforce certain plural rules to always be specified/forbidden in a message.
   * Will be merged with the default value.
   *
   * Affected rule:
   * - [`formatjs/enforce-plural-rules`](https://formatjs.github.io/docs/tooling/linter#enforce-plural-rules)
   * @default {other: true}
   */
  enforcePluralRules?: GetRuleOptions<'formatjs', 'enforce-plural-rules'>;

  /**
   * Block usage of specific elements in ICU message.
   *
   * Affected rule:
   * - [`formatjs/blocklist-elements`](https://formatjs.github.io/docs/tooling/linter#blocklist-elements)
   * @default {}
   */
  icuElementsBlocklist?: Partial<
    Record<
      Extract<(GetRuleOptions<'formatjs', 'blocklist-elements'> & {})[number], PropertyKey>,
      boolean
    >
  >;
}

export default defineUnConfig<FormatjsEslintConfigOptions>('formatJs', {
  enabledBy: {package: '@formatjs/icu-messageformat-parser'},
  phase: 'last',
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    enforceDefaultMessage: 'anything',
    enforceDescription: 'anything',
  });

  const {
    icuElementsBlocklist: icuElementsBlocklistMap,
    enforceDefaultMessage,
    enforceDescription,
    enforcePluralRules,
    enforceId,
  } = optionsResolved;

  const pluginSettings = context.getPluginSettings('formatjs');

  const configBuilder = context.createConfigBuilder(optionsResolved, 'formatjs');

  const icuElementsBlocklist = getKeysOfTruthyValues(icuElementsBlocklistMap || {});

  // Legend:
  // 🟢 - in recommended and strict
  // 🟣 - in strict

  configBuilder
    ?.addConfig([
      'formatjs',
      {
        settings: {
          formatjs: pluginSettings,
        },
      },
    ])
    // Default options in `recommended`: ['selectordinal']
    .addRule(
      'blocklist-elements',
      icuElementsBlocklist.length > 0 ? ERROR : OFF,
      icuElementsBlocklist.length > 0 ? [icuElementsBlocklist] : [],
    ) /** @since 3.0.0 */ // 🟢
    // Default options in `recommended`: 'literal'
    .addRule(
      'enforce-default-message',
      enforceDefaultMessage ? ERROR : OFF,
      enforceDefaultMessage ? [enforceDefaultMessage] : [],
    ) /** @since 1.6.0 */ // 🟢
    // Default options in `recommended`: 'literal'
    .addRule(
      'enforce-description',
      enforceDescription ? ERROR : OFF,
      enforceDescription ? [enforceDescription] : [],
    ) /** @since 1.1.0 */ // 🟢
    // Default options in `recommended`: {idInterpolationPattern: '[sha512:contenthash:base64:10]'}
    .addRule('enforce-id', enforceId === 'always' ? ERROR : OFF) /** @since 2.6.0 */ // 🟣
    .addRule('enforce-placeholders', ERROR) /** @since 1.3.0 */ // 🟢
    // Default options in `recommended`: {one: true, other: true}
    .addRule('enforce-plural-rules', ERROR, [
      {other: true, ...enforcePluralRules},
    ]) /** @since 1.2.0 */ // 🟢
    .addRule('no-camel-case', OFF) /** @since 1.1.0 */
    // Default options in `recommended`: {limit: 20}
    .addRule('no-complex-selectors', OFF) /** @since 2.14.10 */ // 🟢
    .addRule('no-emoji', ERROR) /** @since 1.1.0 */ // 🟢
    .addRule('no-id', enforceId === 'never' ? OFF : ERROR) /** @since 2.3.3 */
    .addRule('no-invalid-icu', ERROR) /** @since 4.1.0 */
    // Default options in `recommended`: {props: {include: [['*', '{label,placeholder,title}']]}}
    .addRule('no-literal-string-in-jsx', OFF) /** @since 4.0.1 */ // 🟢
    .addRule('no-literal-string-in-object', OFF) /** @since 5.3.0 */
    .addRule('no-missing-icu-plural-one-placeholders', ERROR) /** @since 5.1.0 */ // 🟢
    .addRule('no-multiple-plurals', ERROR) /** @since 1.1.0 */ // 🟢
    .addRule('no-multiple-whitespaces', ERROR) /** @since 2.1.0 */ // 🟢
    .addRule('no-offset', ERROR) /** @since 1.1.0 */ // 🟢
    .addRule('no-useless-message', ERROR) /** @since 4.4.0 */ // 🟢
    .addRule('prefer-formatted-message', OFF) /** @since 4.7.0 */
    .addRule('prefer-full-sentence', ERROR) /** @since 6.2.0 */ // 🟢
    .addRule('prefer-pound-in-plural', ERROR) /** @since 4.7.0 */ // 🟢
    .enableConfigTesterForPlugin('formatjs')
    .addOverrides();
});

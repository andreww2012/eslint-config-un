import {ERROR, OFF} from '../constants';
import {getKeysOfTruthyValues} from '../utils';
import {
  type ArrayOrBooleanRecord,
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface RxjsEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'rxjs'> {
  /**
   * Affected rule:
   * - [`rxjs/ban-observables`](https://github.com/DaveMBush/eslint-plugin-rxjs/blob/HEAD/packages/eslint-plugin-rxjs/docs/rules/ban-observables.md)
   */
  banObservables?: ArrayOrBooleanRecord<string, 'booleanOrMessage'>;

  /**
   * Will be merged with the default value ONLY IF object notation is used;
   * otherwise all array elements will be mapped to `value: true` object properties.
   *
   * Affected rule:
   * - [`rxjs/ban-operators`](https://github.com/DaveMBush/eslint-plugin-rxjs/blob/HEAD/packages/eslint-plugin-rxjs/docs/rules/ban-operators.md)
   * @default {tap: true}
   */
  banOperators?: ArrayOrBooleanRecord<string, 'booleanOrMessage'>;

  /**
   * - `true` enforces the use of Finnish notation - i.e. the `$` suffix.
   * - `'forbid'` forbids it.
   * - `false` does not enforce nor forbid it.
   * @default true <=> `@angular/core` package is installed
   */
  enforceFinnishNotation?: boolean | 'forbid';

  /**
   * Affected rule:
   * - [`rxjs/just`](https://github.com/DaveMBush/eslint-plugin-rxjs/blob/HEAD/packages/eslint-plugin-rxjs/docs/rules/just.md)
   * @default false
   */
  enforceJustInsteadOfOf?: boolean;
}

export default ((context, optionsRaw) => {
  const isAngularCoreInstalled = context.packagesInfo['@angular/core'] != null;

  const optionsResolved = assignDefaults(optionsRaw, {
    enforceFinnishNotation: isAngularCoreInstalled,
    enforceJustInsteadOfOf: false,
  });

  const {
    banObservables: banObservablesRaw,
    banOperators: banOperatorsRaw,
    enforceFinnishNotation,
    enforceJustInsteadOfOf,
  } = optionsResolved;

  const banObservables = getKeysOfTruthyValues(banObservablesRaw, 'object');
  const hasBannedObservables = Object.keys(banObservables).length > 0;

  const banOperators = Array.isArray(banOperatorsRaw)
    ? Object.fromEntries(banOperatorsRaw.map((operator) => [operator, true]))
    : getKeysOfTruthyValues({tap: true, ...banOperatorsRaw}, 'object');
  const hasBannedOperators = Object.keys(banOperators).length > 0;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'rxjs');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig('rxjs')
    .addRule(
      'ban-observables',
      hasBannedObservables ? ERROR : OFF,
      hasBannedObservables ? [banObservables] : [],
    ) /** @since 1.0.0 */
    .addRule(
      'ban-operators',
      hasBannedOperators ? ERROR : OFF,
      hasBannedOperators ? [banOperators] : [],
    ) /** @since 1.0.0 */
    .addRule('finnish', enforceFinnishNotation === true ? ERROR : OFF) /** @since 1.0.0 */
    .addRule('just', enforceJustInsteadOfOf ? ERROR : OFF) /** @since 1.0.0 */
    .addRule('macro', OFF) /** @since 1.0.0 */
    .addRule('no-async-subscribe', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-compat', ERROR) /** @since 1.0.0 */
    .addRule('no-connectable', ERROR) // TODO configurable?
    .addRule('no-create', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-cyclic-action', ERROR) /** @since 1.0.0 */
    .addRule('no-exposed-subjects', ERROR) /** @since 1.0.0 */
    .addRule('no-finnish', enforceFinnishNotation === 'forbid' ? ERROR : OFF) /** @since 1.0.0 */
    .addRule('no-ignored-error', OFF) /** @since 1.0.0 */
    .addRule('no-ignored-notifier', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-ignored-observable', ERROR) /** @since 1.0.0 */
    .addRule('no-ignored-replay-buffer', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-ignored-subscribe', OFF) /** @since 1.0.0 */
    .addRule('no-ignored-subscription', OFF) /** @since 1.0.0 */
    // cspell:disable-next-line
    .addRule('no-ignored-takewhile-value', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-implicit-any-catch', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-index', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-internal', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-nested-subscribe', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-redundant-notify', ERROR) /** @since 1.0.0 */ // 🟢
    // cspell:disable-next-line
    .addRule('no-sharereplay', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-subclass', OFF) /** @since 1.0.0 */
    .addRule('no-subject-unsubscribe', ERROR) // 🟢
    .addRule('no-subject-value', ERROR) /** @since 1.0.0 */ // TODO
    .addRule('no-subscribe-handlers', OFF) /** @since 1.0.0 */
    // cspell:disable-next-line
    .addRule('no-topromise', OFF) /** @since 1.0.2 */ // TODO
    .addRule('no-unbound-methods', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-unsafe-catch', ERROR) /** @since 1.0.0 */
    .addRule('no-unsafe-first', ERROR) /** @since 1.0.0 */
    .addRule('no-unsafe-subject-next', ERROR) /** @since 1.0.0 */ // 🟢
    // cspell:disable-next-line
    .addRule('no-unsafe-switchmap', ERROR) /** @since 1.0.0 */
    // cspell:disable-next-line
    .addRule('no-unsafe-takeuntil', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('prefer-observer', OFF) /** @since 1.0.0 */
    .addRule('suffix-subjects', OFF) /** @since 1.0.0 */
    .addRule('throw-error', ERROR) /** @since 1.0.0 */
    .enableConfigTesterForPlugin('rxjs')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'rxjs'>;

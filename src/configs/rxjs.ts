// cspell:ignore sharereplay switchmap takeuntil takewhile topromise
import {ERROR, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

type NamesToBanListOrObjectWithFlagOrMessage = Record<string, boolean | string> | string[];

export interface RxjsEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'rxjs'> {
  /**
   * Affected rule:
   * - [`ban-observables`](https://github.com/DaveMBush/eslint-plugin-rxjs/blob/HEAD/packages/eslint-plugin-rxjs/docs/rules/ban-observables.md)
   */
  banObservables?: NamesToBanListOrObjectWithFlagOrMessage;

  /**
   * Affected rule:
   * - [`ban-operators`](https://github.com/DaveMBush/eslint-plugin-rxjs/blob/HEAD/packages/eslint-plugin-rxjs/docs/rules/ban-operators.md)
   *
   * Will be merged with the default value.
   * @default {tap: true}
   */
  banOperators?: NamesToBanListOrObjectWithFlagOrMessage;

  /**
   * - `true` enforces the use of Finnish notation - i.e. the `$` suffix.
   * - `'forbid'` forbids it.
   * - `false` does not enforce nor forbid it.
   * @default true <=> `@angular/core` package is installed
   */
  enforceFinnishNotation?: boolean | 'forbid';

  /**
   * @default false
   */
  enforceJustInsteadOfOf?: boolean;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    enforceFinnishNotation: context.packagesInfo['@angular/core'] != null,
    enforceJustInsteadOfOf: false,
  } satisfies RxjsEslintConfigOptions);

  const {banObservables, banOperators, enforceFinnishNotation, enforceJustInsteadOfOf} =
    optionsResolved;

  const banObservablesNormalized = Array.isArray(banObservables)
    ? Object.fromEntries(banObservables.map((v) => [v, true]))
    : banObservables || {};
  const banOperatorsNormalized: Record<string, string | boolean> = {
    tap: true,
    ...(Array.isArray(banOperators)
      ? Object.fromEntries(banOperators.map((v) => [v, true]))
      : banOperators || {}),
  };

  const configBuilder = context.createConfigBuilder(optionsResolved, 'rxjs');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['rxjs', {includeDefaultFilesAndIgnores: true}])
    .addRule('ban-observables', Object.keys(banObservablesNormalized).length > 0 ? ERROR : OFF, [
      banObservablesNormalized,
    ]) /** @since 1.0.0 */
    .addRule('ban-operators', Object.keys(banOperatorsNormalized).length > 0 ? ERROR : OFF, [
      banOperatorsNormalized,
    ]) /** @since 1.0.0 */
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
    .addRule('no-ignored-takewhile-value', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-implicit-any-catch', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-index', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-internal', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-nested-subscribe', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-redundant-notify', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-sharereplay', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-subclass', OFF) /** @since 1.0.0 */
    .addRule('no-subject-unsubscribe', ERROR) // 🟢
    .addRule('no-subject-value', ERROR) /** @since 1.0.0 */ // TODO
    .addRule('no-subscribe-handlers', OFF) /** @since 1.0.0 */
    .addRule('no-topromise', OFF) /** @since 1.0.2 */ // TODO
    .addRule('no-unbound-methods', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-unsafe-catch', ERROR) /** @since 1.0.0 */
    .addRule('no-unsafe-first', ERROR) /** @since 1.0.0 */
    .addRule('no-unsafe-subject-next', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-unsafe-switchmap', ERROR) /** @since 1.0.0 */
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

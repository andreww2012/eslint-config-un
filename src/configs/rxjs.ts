// cspell:ignore sharereplay switchmap takeuntil takewhile topromise
import {ERROR, OFF} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

type NamesToBanListOrObjectWithFlagOrMessage = Record<string, boolean | string> | string[];

export interface RxjsEslintConfigOptions extends UnConfigOptions<'rxjs'> {
  /**
   * Affected rule:
   * - [`ban-observables`](https://github.com/DaveMBush/eslint-plugin-rxjs/blob/HEAD/packages/eslint-plugin-rxjs/docs/rules/ban-observables.md)
   */
  banObservables?: NamesToBanListOrObjectWithFlagOrMessage;

  /**
   * Affected rule:
   * - [`ban-operators`](https://github.com/DaveMBush/eslint-plugin-rxjs/blob/HEAD/packages/eslint-plugin-rxjs/docs/rules/ban-operators.md)
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

export const rxjsUnConfig: UnConfigFn<'rxjs'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.rxjs;
  const optionsResolved = assignDefaults(optionsRaw, {
    enforceFinnishNotation: context.packagesInfo['@angular/core'] != null,
    enforceJustInsteadOfOf: false,
  } satisfies RxjsEslintConfigOptions);

  const {banObservables, banOperators, enforceFinnishNotation, enforceJustInsteadOfOf} =
    optionsResolved;

  const banObservablesNormalized = Array.isArray(banObservables)
    ? Object.fromEntries(banObservables.map((v) => [v, true]))
    : banObservables || {};
  const banOperatorsNormalized = Array.isArray(banOperators)
    ? Object.fromEntries(banOperators.map((v) => [v, true]))
    : banOperators || {};

  const configBuilder = createConfigBuilder(context, optionsResolved, 'rxjs');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['rxjs', {includeDefaultFilesAndIgnores: true}])
    .addRule('ban-observables', Object.keys(banObservablesNormalized).length > 0 ? ERROR : OFF, [
      banObservablesNormalized,
    ])
    .addRule('ban-operators', Object.keys(banOperatorsNormalized).length > 0 ? ERROR : OFF, [
      banOperatorsNormalized,
    ])
    .addRule('finnish', enforceFinnishNotation === true ? ERROR : OFF)
    .addRule('just', enforceJustInsteadOfOf ? ERROR : OFF)
    .addRule('macro', OFF)
    .addRule('no-async-subscribe', ERROR) // 🟢
    .addRule('no-compat', ERROR)
    .addRule('no-connectable', ERROR) // TODO configurable?
    .addRule('no-create', ERROR) // 🟢
    .addRule('no-cyclic-action', ERROR)
    .addRule('no-exposed-subjects', ERROR)
    .addRule('no-finnish', enforceFinnishNotation === 'forbid' ? ERROR : OFF)
    .addRule('no-ignored-error', OFF)
    .addRule('no-ignored-notifier', ERROR) // 🟢
    .addRule('no-ignored-observable', ERROR)
    .addRule('no-ignored-replay-buffer', ERROR) // 🟢
    .addRule('no-ignored-subscribe', OFF)
    .addRule('no-ignored-subscription', OFF)
    .addRule('no-ignored-takewhile-value', ERROR) // 🟢
    .addRule('no-implicit-any-catch', ERROR) // 🟢
    .addRule('no-index', ERROR) // 🟢
    .addRule('no-internal', ERROR) // 🟢
    .addRule('no-nested-subscribe', ERROR) // 🟢
    .addRule('no-redundant-notify', ERROR) // 🟢
    .addRule('no-sharereplay', ERROR) // 🟢
    .addRule('no-subclass', OFF)
    .addRule('no-subject-unsubscribe', ERROR) // 🟢
    .addRule('no-subject-value', ERROR) // TODO
    .addRule('no-subscribe-handlers', OFF)
    .addRule('no-tap', ERROR)
    .addRule('no-topromise', OFF) // TODO
    .addRule('no-unbound-methods', ERROR) // 🟢
    .addRule('no-unsafe-catch', ERROR)
    .addRule('no-unsafe-first', ERROR)
    .addRule('no-unsafe-subject-next', ERROR) // 🟢
    .addRule('no-unsafe-switchmap', ERROR)
    .addRule('no-unsafe-takeuntil', ERROR) // 🟢
    .addRule('prefer-observer', OFF)
    .addRule('suffix-subjects', OFF)
    .addRule('throw-error', ERROR)
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

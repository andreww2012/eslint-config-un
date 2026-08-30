// cspell:ignore foldl foldr
import {CHECKED_LODASH_METHODS, ERROR, OFF} from '../constants';
import type {NonEmptyTuple} from '../types';
import {
  type ExtraPluginsType,
  type GetRuleNamesInPlugin,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

type LodashMethods =
  | 'all'
  | 'any'
  | 'assign'
  | 'bind'
  | 'capitalize'
  | 'castArray'
  | 'cloneDeep'
  | 'collect'
  | 'concat'
  | 'contains'
  | 'defaults'
  | 'detect'
  | 'drop'
  | 'dropRight'
  | 'each'
  | 'endsWith'
  | 'entries'
  | 'every'
  | 'extendOwn'
  | 'fill'
  | 'filter'
  | 'find'
  | 'findIndex'
  | 'first'
  | 'flatten'
  | 'foldl'
  | 'foldr'
  | 'forEach'
  | 'get'
  | 'head'
  | 'includes'
  | 'indexOf'
  | 'inject'
  | 'isArray'
  | 'isArrayBuffer'
  | 'isDate'
  | 'isFinite'
  | 'isFunction'
  | 'isInteger'
  | 'isNan'
  | 'isNil'
  | 'isNull'
  | 'isString'
  | 'isUndefined'
  | 'join'
  | 'keys'
  | 'last'
  | 'lastIndexOf'
  | 'map'
  | 'omit'
  | 'padEnd'
  | 'padStart'
  | 'pairs'
  | 'reduce'
  | 'reduceRight'
  | 'repeat'
  | 'replace'
  | 'reverse'
  | 'select'
  | 'size'
  | 'slice'
  | 'some'
  | 'split'
  | 'startsWith'
  | 'takeRight'
  | 'throttle'
  | 'toLower'
  | 'toPairs'
  | 'toUpper'
  | 'trim'
  | 'unionBy'
  | 'uniq'
  | 'values';

const LODASH_METHODS_TO_RULE_NAMES: Record<
  LodashMethods,
  GetRuleNamesInPlugin<'you-dont-need-lodash-underscore'>
> = {
  all: 'all',
  any: 'any',
  assign: 'assign',
  bind: 'bind',
  capitalize: 'capitalize',
  castArray: 'cast-array',
  cloneDeep: 'clone-deep',
  collect: 'collect',
  concat: 'concat',
  contains: 'contains',
  defaults: 'defaults',
  detect: 'detect',
  drop: 'drop',
  dropRight: 'drop-right',
  each: 'each',
  endsWith: 'ends-with',
  entries: 'entries',
  every: 'every',
  extendOwn: 'extend-own',
  fill: 'fill',
  filter: 'filter',
  find: 'find',
  findIndex: 'find-index',
  first: 'first',
  flatten: 'flatten',
  foldl: 'foldl',
  foldr: 'foldr',
  forEach: 'for-each',
  get: 'get',
  head: 'head',
  includes: 'includes',
  indexOf: 'index-of',
  inject: 'inject',
  isArray: 'is-array',
  isArrayBuffer: 'is-array-buffer',
  isDate: 'is-date',
  isFinite: 'is-finite',
  isFunction: 'is-function',
  isInteger: 'is-integer',
  isNan: 'is-nan',
  isNil: 'is-nil',
  isNull: 'is-null',
  isString: 'is-string',
  isUndefined: 'is-undefined',
  join: 'join',
  keys: 'keys',
  last: 'last',
  lastIndexOf: 'last-index-of',
  map: 'map',
  omit: 'omit',
  padEnd: 'pad-end',
  padStart: 'pad-start',
  pairs: 'pairs',
  reduce: 'reduce',
  reduceRight: 'reduce-right',
  repeat: 'repeat',
  replace: 'replace',
  reverse: 'reverse',
  select: 'select',
  size: 'size',
  slice: 'slice',
  some: 'some',
  split: 'split',
  startsWith: 'starts-with',
  takeRight: 'take-right',
  throttle: 'throttle',
  toLower: 'to-lower',
  toPairs: 'to-pairs',
  toUpper: 'to-upper',
  trim: 'trim',
  unionBy: 'union-by',
  uniq: 'uniq',
  values: 'values',
};

/**
 * Helps in identifying places in your codebase where you don't (may not) need Lodash/Underscore.
 *
 * 📁 Default `files`: all files
 */
export interface YouDontNeedLodashUnderscoreEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'you-dont-need-lodash-underscore'> {
  /**
   * Lodash methods that will be exempted from the check.
   * Will be merged with the default value.
   * @example {capitalize: true, cloneDeep: true, get: true, omit: true, throttle: true}
   */
  ignoredMethods?: Partial<Record<LodashMethods, boolean>>;
}

export default defineUnConfig<YouDontNeedLodashUnderscoreEslintConfigOptions>(
  'youDontNeedLodashUnderscore',
  {
    enabledBy: {
      packages: [
        'lodash',
        'lodash-es',
        ...CHECKED_LODASH_METHODS.map((method) => `lodash.${method}` as const),
      ],
    },
  },
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const ignoredMethods = {
    capitalize: true,
    cloneDeep: true,
    get: true,
    omit: true,
    throttle: true,
    ...optionsResolved.ignoredMethods,
  };

  const getRuleSeverity = (method: LodashMethods) =>
    [
      LODASH_METHODS_TO_RULE_NAMES[method],
      ignoredMethods[method] ? OFF : ERROR,
    ] satisfies NonEmptyTuple;

  const configBuilder = context.createConfigBuilder(
    optionsResolved,
    'you-dont-need-lodash-underscore',
  );

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig('you-dont-need-lodash-underscore')
    .addRule(...getRuleSeverity('all')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('any')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('assign')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('bind')) /** @since 6.4.0 */
    .addRule(...getRuleSeverity('capitalize')) /** @since 6.13.0 */
    .addRule(...getRuleSeverity('castArray')) /** @since 6.11.0 */
    .addRule(...getRuleSeverity('cloneDeep')) /** @since 6.14.0 */
    .addRule(...getRuleSeverity('collect')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('concat')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('contains')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('defaults')) /** @since 6.13.0 */
    .addRule(...getRuleSeverity('detect')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('drop')) /** @since 6.5.0 */
    .addRule(...getRuleSeverity('dropRight')) /** @since 6.7.0 */
    .addRule(...getRuleSeverity('each')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('endsWith')) /** @since 6.9.0 */
    .addRule(...getRuleSeverity('entries')) /** @since 6.2.0 */
    .addRule(...getRuleSeverity('every')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('extendOwn')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('fill')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('filter')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('find')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('findIndex')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('first')) /** @since 6.4.0 */
    .addRule(...getRuleSeverity('flatten')) /** @since 6.8.0 */
    .addRule(...getRuleSeverity('foldl')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('foldr')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('forEach')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('get')) /** @since 6.11.0 */
    .addRule(...getRuleSeverity('head')) /** @since 6.13.0 */
    .addRule(...getRuleSeverity('includes')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('indexOf')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('inject')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('isArray')) /** @since 6.4.0 */
    .addRule(...getRuleSeverity('isArrayBuffer')) /** @since 6.13.0 */
    .addRule(...getRuleSeverity('isDate')) /** @since 6.13.0 */
    .addRule(...getRuleSeverity('isFinite')) /** @since 6.5.0 */
    .addRule(...getRuleSeverity('isFunction')) /** @since 6.11.0 */
    .addRule(...getRuleSeverity('isInteger')) /** @since 6.7.0 */
    .addRule(...getRuleSeverity('isNan')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('isNil')) /** @since 6.6.0 */
    .addRule(...getRuleSeverity('isNull')) /** @since 6.5.0 */
    .addRule(...getRuleSeverity('isString')) /** @since 6.11.0 */
    .addRule(...getRuleSeverity('isUndefined')) /** @since 6.5.0 */
    .addRule(...getRuleSeverity('join')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('keys')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('last')) /** @since 6.4.0 */
    .addRule(...getRuleSeverity('lastIndexOf')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('map')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('omit')) /** @since 6.5.0 */
    .addRule(...getRuleSeverity('padEnd')) /** @since 6.6.0 */
    .addRule(...getRuleSeverity('padStart')) /** @since 6.6.0 */
    .addRule(...getRuleSeverity('pairs')) /** @since 6.2.0 */
    .addRule(...getRuleSeverity('reduce')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('reduceRight')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('repeat')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('replace')) /** @since 6.4.0 */
    .addRule(...getRuleSeverity('reverse')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('select')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('size')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('slice')) /** @since 6.4.0 */
    .addRule(...getRuleSeverity('some')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('split')) /** @since 6.5.0 */
    .addRule(...getRuleSeverity('startsWith')) /** @since 6.5.0 */
    .addRule(...getRuleSeverity('takeRight')) /** @since 6.5.0 */
    .addRule(...getRuleSeverity('throttle')) /** @since 6.9.0 */
    .addRule(...getRuleSeverity('toLower')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('toPairs')) /** @since 6.2.0 */
    .addRule(...getRuleSeverity('toUpper')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('trim')) /** @since 5.0.0 */
    .addRule(...getRuleSeverity('unionBy')) /** @since 6.13.0 */
    .addRule(...getRuleSeverity('uniq')) /** @since 6.4.0 */
    .addRule(...getRuleSeverity('values')) /** @since 6.1.0 */
    .enableConfigTesterForPlugin('you-dont-need-lodash-underscore')
    .addOverrides();
});

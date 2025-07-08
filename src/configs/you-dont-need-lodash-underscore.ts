// cspell:ignore foldl foldr
import {ERROR, OFF} from '../constants';
import {type RuleNamesForPlugin, type UnConfigOptions, createConfigBuilder} from '../eslint';
import type {NonEmptyTuple} from '../types';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

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
  RuleNamesForPlugin<'you-dont-need-lodash-underscore'>
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

export interface YouDontNeedLodashUnderscoreEslintConfigOptions
  extends UnConfigOptions<'you-dont-need-lodash-underscore'> {
  /**
   * Lodash methods that will be exempted from the check. Will be merged with the default value.
   * @example {cloneDeep: true, omit: true, throttle: true}
   */
  ignoredMethods?: Partial<Record<LodashMethods, boolean>>;
}

export const youDontNeedLodashUnderscoreUnConfig: UnConfigFn<'youDontNeedLodashUnderscore'> = (
  context,
) => {
  const optionsRaw = context.rootOptions.configs?.youDontNeedLodashUnderscore;
  const optionsResolved = assignDefaults(
    optionsRaw,
    {} satisfies YouDontNeedLodashUnderscoreEslintConfigOptions,
  );

  const ignoredMethods = {
    cloneDeep: true,
    omit: true,
    throttle: true,
    ...optionsResolved.ignoredMethods,
  };

  const getRuleSeverity = (method: LodashMethods) =>
    [
      LODASH_METHODS_TO_RULE_NAMES[method],
      ignoredMethods[method] ? OFF : ERROR,
    ] satisfies NonEmptyTuple;

  const configBuilder = createConfigBuilder(
    context,
    optionsResolved,
    'you-dont-need-lodash-underscore',
  );

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['you-dont-need-lodash-underscore', {includeDefaultFilesAndIgnores: true}])
    .addRule(...getRuleSeverity('all'))
    .addRule(...getRuleSeverity('any'))
    .addRule(...getRuleSeverity('assign'))
    .addRule(...getRuleSeverity('bind'))
    .addRule(...getRuleSeverity('capitalize'))
    .addRule(...getRuleSeverity('castArray'))
    .addRule(...getRuleSeverity('cloneDeep'))
    .addRule(...getRuleSeverity('collect'))
    .addRule(...getRuleSeverity('concat'))
    .addRule(...getRuleSeverity('contains'))
    .addRule(...getRuleSeverity('defaults'))
    .addRule(...getRuleSeverity('detect'))
    .addRule(...getRuleSeverity('drop'))
    .addRule(...getRuleSeverity('dropRight'))
    .addRule(...getRuleSeverity('each'))
    .addRule(...getRuleSeverity('endsWith'))
    .addRule(...getRuleSeverity('entries'))
    .addRule(...getRuleSeverity('every'))
    .addRule(...getRuleSeverity('extendOwn'))
    .addRule(...getRuleSeverity('fill'))
    .addRule(...getRuleSeverity('filter'))
    .addRule(...getRuleSeverity('find'))
    .addRule(...getRuleSeverity('findIndex'))
    .addRule(...getRuleSeverity('first'))
    .addRule(...getRuleSeverity('flatten'))
    .addRule(...getRuleSeverity('foldl'))
    .addRule(...getRuleSeverity('foldr'))
    .addRule(...getRuleSeverity('forEach'))
    .addRule(...getRuleSeverity('get'))
    .addRule(...getRuleSeverity('head'))
    .addRule(...getRuleSeverity('includes'))
    .addRule(...getRuleSeverity('indexOf'))
    .addRule(...getRuleSeverity('inject'))
    .addRule(...getRuleSeverity('isArray'))
    .addRule(...getRuleSeverity('isArrayBuffer'))
    .addRule(...getRuleSeverity('isDate'))
    .addRule(...getRuleSeverity('isFinite'))
    .addRule(...getRuleSeverity('isFunction'))
    .addRule(...getRuleSeverity('isInteger'))
    .addRule(...getRuleSeverity('isNan'))
    .addRule(...getRuleSeverity('isNil'))
    .addRule(...getRuleSeverity('isNull'))
    .addRule(...getRuleSeverity('isString'))
    .addRule(...getRuleSeverity('isUndefined'))
    .addRule(...getRuleSeverity('join'))
    .addRule(...getRuleSeverity('keys'))
    .addRule(...getRuleSeverity('last'))
    .addRule(...getRuleSeverity('lastIndexOf'))
    .addRule(...getRuleSeverity('map'))
    .addRule(...getRuleSeverity('omit'))
    .addRule(...getRuleSeverity('padEnd'))
    .addRule(...getRuleSeverity('padStart'))
    .addRule(...getRuleSeverity('pairs'))
    .addRule(...getRuleSeverity('reduce'))
    .addRule(...getRuleSeverity('reduceRight'))
    .addRule(...getRuleSeverity('repeat'))
    .addRule(...getRuleSeverity('replace'))
    .addRule(...getRuleSeverity('reverse'))
    .addRule(...getRuleSeverity('select'))
    .addRule(...getRuleSeverity('size'))
    .addRule(...getRuleSeverity('slice'))
    .addRule(...getRuleSeverity('some'))
    .addRule(...getRuleSeverity('split'))
    .addRule(...getRuleSeverity('startsWith'))
    .addRule(...getRuleSeverity('takeRight'))
    .addRule(...getRuleSeverity('throttle'))
    .addRule(...getRuleSeverity('toLower'))
    .addRule(...getRuleSeverity('toPairs'))
    .addRule(...getRuleSeverity('toUpper'))
    .addRule(...getRuleSeverity('trim'))
    .addRule(...getRuleSeverity('unionBy'))
    .addRule(...getRuleSeverity('uniq'))
    .addRule(...getRuleSeverity('values'))
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

// cspell:ignore foldl foldr
import {ERROR} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface YouDontNeedLodashUnderscoreEslintConfigOptions
  extends UnConfigOptions<'you-dont-need-lodash-underscore'> {}

export const youDontNeedLodashUnderscoreUnConfig: UnConfigFn<'youDontNeedLodashUnderscore'> = (
  context,
) => {
  const optionsRaw = context.rootOptions.configs?.youDontNeedLodashUnderscore;
  const optionsResolved = assignDefaults(
    optionsRaw,
    {} satisfies YouDontNeedLodashUnderscoreEslintConfigOptions,
  );

  const configBuilder = createConfigBuilder(
    context,
    optionsResolved,
    'you-dont-need-lodash-underscore',
  );

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['you-dont-need-lodash-underscore', {includeDefaultFilesAndIgnores: true}])
    .addRule('all', ERROR)
    .addRule('any', ERROR)
    .addRule('assign', ERROR)
    .addRule('bind', ERROR)
    .addRule('capitalize', ERROR)
    .addRule('cast-array', ERROR)
    .addRule('clone-deep', ERROR)
    .addRule('collect', ERROR)
    .addRule('concat', ERROR)
    .addRule('contains', ERROR)
    .addRule('defaults', ERROR)
    .addRule('detect', ERROR)
    .addRule('drop', ERROR)
    .addRule('drop-right', ERROR)
    .addRule('each', ERROR)
    .addRule('ends-with', ERROR)
    .addRule('entries', ERROR)
    .addRule('every', ERROR)
    .addRule('extend-own', ERROR)
    .addRule('fill', ERROR)
    .addRule('filter', ERROR)
    .addRule('find', ERROR)
    .addRule('find-index', ERROR)
    .addRule('first', ERROR)
    .addRule('flatten', ERROR)
    .addRule('foldl', ERROR)
    .addRule('foldr', ERROR)
    .addRule('for-each', ERROR)
    .addRule('get', ERROR)
    .addRule('head', ERROR)
    .addRule('includes', ERROR)
    .addRule('index-of', ERROR)
    .addRule('inject', ERROR)
    .addRule('is-array', ERROR)
    .addRule('is-array-buffer', ERROR)
    .addRule('is-date', ERROR)
    .addRule('is-finite', ERROR)
    .addRule('is-function', ERROR)
    .addRule('is-integer', ERROR)
    .addRule('is-nan', ERROR)
    .addRule('is-nil', ERROR)
    .addRule('is-null', ERROR)
    .addRule('is-string', ERROR)
    .addRule('is-undefined', ERROR)
    .addRule('join', ERROR)
    .addRule('keys', ERROR)
    .addRule('last', ERROR)
    .addRule('last-index-of', ERROR)
    .addRule('map', ERROR)
    .addRule('omit', ERROR)
    .addRule('pad-end', ERROR)
    .addRule('pad-start', ERROR)
    .addRule('pairs', ERROR)
    .addRule('reduce', ERROR)
    .addRule('reduce-right', ERROR)
    .addRule('repeat', ERROR)
    .addRule('replace', ERROR)
    .addRule('reverse', ERROR)
    .addRule('select', ERROR)
    .addRule('size', ERROR)
    .addRule('slice', ERROR)
    .addRule('some', ERROR)
    .addRule('split', ERROR)
    .addRule('starts-with', ERROR)
    .addRule('take-right', ERROR)
    .addRule('throttle', ERROR)
    .addRule('to-lower', ERROR)
    .addRule('to-pairs', ERROR)
    .addRule('to-upper', ERROR)
    .addRule('trim', ERROR)
    .addRule('union-by', ERROR)
    .addRule('uniq', ERROR)
    .addRule('values', ERROR)
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

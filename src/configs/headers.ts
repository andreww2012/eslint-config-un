import {ERROR} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface HeadersEslintConfigOptions extends UnConfigOptions<'headers'> {
  // TODO types are broken

  /**
   * The single rule (`header-format`) options.
   */
  options?: {
    source: 'file' | 'string';

    /**
     * @default 'jsdoc'
     */
    style?: 'line' | 'jsdoc';

    content?: string;
    path?: string;

    /**
     * @default true
     */
    preservePragmas?: boolean;

    blockPrefix?: string;
    blockSuffix?: string;
    linePrefix?: string;
    trailingNewlines?: boolean;
    variables?: Record<string, string>;
    patterns?: Record<string, {pattern: string; defaultValue?: string}>;

    /**
     * @default false
     */
    enableVueSupport?: boolean;
  };
}

export const headerUnConfig: UnConfigFn<'headers'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.headers;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies HeadersEslintConfigOptions);

  const {options} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'headers');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['headers', {includeDefaultFilesAndIgnores: true}])
    .addRule('header-format', ERROR, options ? [options] : [])
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

import {ERROR} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {type MaybeArray, assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface HeaderEslintConfigOptions extends UnConfigOptions<'header'> {
  /**
   * The single rule (`header`) options.
   */
  options?:
    | {pathToFileWithComment: string}
    | {
        /**
         * @default 'block'
         */
        commentStyle?: 'block' | 'line';

        comment: MaybeArray<string | {pattern: string; template?: string}>;

        /**
         * @default 1
         */
        numberOfNewlinesAfterHeader?: number;

        /**
         * @default detected from the current OS
         */
        lineEndings?: 'windows' | 'unix';
      };
}

export const headerUnConfig: UnConfigFn<'header'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.header;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies HeaderEslintConfigOptions);

  const {options} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'header');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['header', {includeDefaultFilesAndIgnores: true}])
    .addRule(
      'header',
      ERROR,
      // @ts-expect-error rule without schema
      options
        ? 'pathToFileWithComment' in options
          ? [options.pathToFileWithComment]
          : [
              options.commentStyle ?? 'block',
              options.comment,
              options.numberOfNewlinesAfterHeader ?? 1,
              {lineEndings: options.lineEndings},
            ]
        : [],
    ) /** @since 0.0.1 */
    .enableConfigTesterForPlugin('header')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

import {ERROR} from '../constants';
import type {NonEmptyTuple} from '../types';
import type {MaybeArray} from '../utils';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface HeaderEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'header'> {
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
      }
    | GetRuleOptions<'header', 'header', 'all'>;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies HeaderEslintConfigOptions);

  const {options} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'header');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['header', {includeDefaultFilesAndIgnores: true}])
    .addRule(
      'header',
      ERROR,
      options
        ? Array.isArray(options)
          ? options
          : 'pathToFileWithComment' in options
            ? [options.pathToFileWithComment]
            : [
                options.commentStyle ?? 'block',
                options.comment,
                ...(options.numberOfNewlinesAfterHeader == null && options.lineEndings == null
                  ? ([] satisfies [])
                  : ([
                      options.numberOfNewlinesAfterHeader ?? 1,
                      ...(options.lineEndings == null
                        ? ([] satisfies [])
                        : ([{lineEndings: options.lineEndings}] satisfies NonEmptyTuple)),
                    ] satisfies NonEmptyTuple)),
              ]
        : [],
    ) /** @since 0.0.1 */
    .enableConfigTesterForPlugin('header')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'header'>;

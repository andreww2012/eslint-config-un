import {ERROR} from '../constants';
import type {NonEmptyTuple} from '../types';
import type {MaybeArray} from '../utils';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * An ESLint plugin to ensure that files begin with the given comment.
 *
 * There is also an alternative config, `headers`, which is powered by
 * [`eslint-plugin-headers`](https://npmx.dev/eslint-plugin-headers).
 *
 * 📁 Default `files`: all files
 */
export interface HeaderEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'header'> {
  /**
   * The single rule (`header`) options.
   */
  options?:
    | {
        /**
         * Path to the file whose contents are the expected header
         */
        pathToFileWithComment: string;
      }
    | {
        /**
         * The comment syntax the header is written with
         * @default 'block'
         */
        commentStyle?: 'block' | 'line';

        /**
         * The expected header, either verbatim or as a pattern with a template to autofix to
         */
        comment: MaybeArray<
          | string
          | {
              /**
               * A regular expression the existing header must match
               */
              pattern: string;

              /**
               * What a missing or non-matching header is replaced with
               */
              template?: string;
            }
        >;

        /**
         * How many empty lines must separate the header from the rest of the file
         * @default 1
         */
        numberOfNewlinesAfterHeader?: number;

        /**
         * The line endings the header is expected to use
         * @default detected from the current OS
         */
        lineEndings?: 'windows' | 'unix';
      }
    | GetRuleOptions<'header', 'header', 'all'>;
}

export default defineUnConfig<HeaderEslintConfigOptions>(
  'header',
  false,
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {options} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'header');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig('header')
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
});

import {ERROR} from '../constants';
import type {MaybeArray} from '../utils';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

export interface HeaderEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends UnConfigOptions<ExtraPlugins, 'header'> {
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
}) satisfies UnConfigFn<'header'>;

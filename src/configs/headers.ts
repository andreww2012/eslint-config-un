import {ERROR} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * An ESLint plugin to ensure that files begin with the given comment.
 *
 * There is also an alternative config, `header`, which is powered by
 * [`eslint-plugin-header`](https://npmx.dev/eslint-plugin-header).
 *
 * 📁 Default `files`: all files
 */
export interface HeadersEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'headers'> {
  /**
   * The single rule (`header-format`) options.
   */
  options?: (
    | {
        /**
         * The expected header comes from the `content` string
         */
        source: 'string';

        /**
         * The expected header itself
         */
        content: string;
      }
    | {
        /**
         * The expected header comes from the `path` file
         */
        source: 'file';

        /**
         * Path to the file holding the expected header
         */
        path: string;
      }
  ) & {
    /**
     * The comment syntax the header is written with
     * @default 'jsdoc'
     */
    style?: 'line' | 'jsdoc';

    /**
     * Keeps the pragmas (such as `@jsx`) of the replaced header
     * @default true
     */
    preservePragmas?: boolean;

    /**
     * What the block comment holding the header opens with
     */
    blockPrefix?: string;

    /**
     * What the block comment holding the header closes with
     */
    blockSuffix?: string;

    /**
     * What every line of the header is prefixed with
     */
    linePrefix?: string;

    /**
     * How many empty lines must separate the header from the rest of the file
     * @default 1
     */
    trailingNewlines?: number;

    /**
     * Values substituted into the `{{name}}` placeholders of the header
     */
    variables?: Record<string, string>;

    /**
     * Placeholders whose value is matched by a regular expression rather than fixed
     */
    patterns?: Record<
      string,
      {
        /**
         * A regular expression the placeholder value must match
         */
        pattern: string;

        /**
         * What the placeholder is filled with when the header is added
         */
        defaultValue?: string;
      }
    >;

    /**
     * Checks the headers of Vue SFC files too
     * @default false
     */
    enableVueSupport?: boolean;
  };
}

export default defineUnConfig<HeadersEslintConfigOptions>(
  'headers',
  false,
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {options} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'headers');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig('headers')
    .addRule('header-format', ERROR, options ? [options] : []) /** @since 0.1.0 */
    .enableConfigTesterForPlugin('headers')
    .addOverrides();
});

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
 * There is also an alternative config, `header`, which is powered by [`eslint-plugin-header`](https://npmx.dev/eslint-plugin-header).
 *
 * 📁 Default `files`: all files
 */
export interface HeadersEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'headers'> {
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

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});

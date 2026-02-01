import {ERROR} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

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

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies HeadersEslintConfigOptions);

  const {options} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'headers');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['headers', {includeDefaultFilesAndIgnores: true}])
    .addRule('header-format', ERROR, options ? [options] : []) /** @since 0.1.0 */
    .enableConfigTesterForPlugin('headers')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'headers'>;

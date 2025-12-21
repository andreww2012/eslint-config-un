import {ERROR} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

export interface SqlEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, 'sql'> {
  /**
   * [`eslint-plugin-sql`](https://npmjs.com/eslint-plugin-sql) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `sql` property and applied to the specified `files` and `ignores`.
   * @see https://github.com/gajus/eslint-plugin-sql#settings
   */
  settings?: {
    /**
     * "A regex used to ignore placeholders or other fragments of the query
     * that'd make it invalid SQL query"
     * \- [plugin docs](https://github.com/gajus/eslint-plugin-sql#placeholderrule)
     */
    placeholderRule?: string;
  };
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies Partial<SqlEslintConfigOptions>);

  const {settings: pluginSettings} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'sql');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['sql', {includeDefaultFilesAndIgnores: true}], {
      ...(pluginSettings && {
        settings: {
          sql: pluginSettings,
        },
      }),
    })
    .addRule('format', ERROR) /** @since 1.0.0 */
    .addRule('no-unsafe-query', ERROR) /** @since 1.0.0 */
    .enableConfigTesterForPlugin('sql')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'sql'>;

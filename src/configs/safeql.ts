import {ERROR, GLOB_TS_X, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [SafeQL](https://safeql.dev) validates raw PostgreSQL queries and infers the TypeScript types of
 * their results.
 *
 * ⚠️ WARNING: the only rule stays off until `options` are provided.
 *
 * 📁 Default `files`: <code>**&#47;*.?([cm])ts?(x)</code>
 */
export interface SafeqlEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'safeql'> {
  /**
   * Options of [the only rule, `safeql/check-sql`](https://safeql.dev/api).
   *
   * Either point it at the database(s) to check the queries against, or set `useConfigFile` to
   * `true` to read them from a `safeql.config.ts` file instead.
   */
  options?: GetRuleOptions<'safeql', 'check-sql'>;
}

export default defineUnConfig<SafeqlEslintConfigOptions>('safeql', {
  enabledBy: {package: '@ts-safeql/sql-tag'},
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {options: checkSqlOptions} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'safeql');

  if (configBuilder && !checkSqlOptions) {
    context.logger.warn(
      "[safeql] You haven't specified `options` which are required for `@ts-safeql/eslint-plugin` to work, so the only rule it provides is disabled",
    );
  }

  configBuilder
    ?.addConfig(['safeql', {filesDefault: [GLOB_TS_X]}])
    .addRule(
      'check-sql',
      checkSqlOptions ? ERROR : OFF,
      checkSqlOptions && [checkSqlOptions],
    ) /** @since 0.0.1 */
    .enableConfigTesterForPlugin('safeql')
    .addOverrides();
});

import {ERROR} from '../constants';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface DrizzleEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'drizzle'> {
  /**
   * Optionally narrows down which object's `delete`/`update` method calls are checked.
   * Accepts the name of the Drizzle database object(s) used in your codebase (e.g. `"db"`).
   * When provided, only method calls on the specified object(s) will be flagged.
   *
   * Affected rules:
   * - `drizzle/enforce-delete-with-where`
   * - `drizzle/enforce-update-with-where`
   */
  drizzleObjectName?: GetRuleOptions<'drizzle', 'enforce-delete-with-where'>['drizzleObjectName'];
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {drizzleObjectName} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'drizzle');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['drizzle', {includeDefaultFilesAndIgnores: true}])
    .addRule(
      'enforce-delete-with-where',
      ERROR,
      drizzleObjectName === undefined ? [] : [{drizzleObjectName}],
    ) /** @since 0.1.0 */ // 🟢
    .addRule(
      'enforce-update-with-where',
      ERROR,
      drizzleObjectName === undefined ? [] : [{drizzleObjectName}],
    ) /** @since 0.1.0 */ // 🟢
    .enableConfigTesterForPlugin('drizzle')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'drizzle'>;

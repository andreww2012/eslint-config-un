import {ERROR, GLOB_TS_X} from '../constants';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * An ESLint plugin that provides a rule that enforces that types indicated
 * in special comments (`^?`, `$ExpectError`, `$ExpectType`, and `$ExpectTypeSnapshot`)
 * match the types of code values.
 *
 * ⚠️ WARNING: make sure that the linted files are provided with type information.
 * For that, they must be included in `files` array of `ts/configTypeAware` config
 * (they are by default).
 *
 * 📁 Default `files`: <code>**&#47;*.?([cm])ts?(x)</code>
 */
export interface ExpectTypeEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'expect-type'> {
  /**
   * Options of [the only rule, `expect`](https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/blob/HEAD/docs/rules/expect.md).
   */
  options?: GetRuleOptions<'expect-type', 'expect'>;
}

export default defineUnConfig<ExpectTypeEslintConfigOptions>(
  'expectType',
  false,
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {options: expectRuleOptions} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'expect-type');

  // Legend:
  // 🟢 - in recommended
  // 💭 - requires type information

  configBuilder
    ?.addConfig([
      'expect-type',
      {
        filesDefault: [GLOB_TS_X],
      },
    ])
    .addRule('expect', ERROR, expectRuleOptions ? [expectRuleOptions] : []) /** @since 0.0.1 */ // 🟢💭
    .enableConfigTesterForPlugin('expect-type')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});

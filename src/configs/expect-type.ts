import {ERROR, GLOB_TSX} from '../constants';
import type {GetRuleOptions} from '../eslint';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

export interface ExpectTypeEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, 'expect-type'> {
  /**
   * Options of [the only rule, `expect`](https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/blob/HEAD/docs/rules/expect.md).
   */
  options?: GetRuleOptions<'expect-type', 'expect'>;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(
    optionsRaw,
    {} satisfies Partial<ExpectTypeEslintConfigOptions>,
  );

  const {options: expectRuleOptions} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'expect-type');

  // Legend:
  // 🟢 - in recommended
  // 💭 - requires type information

  configBuilder
    ?.addConfig([
      'expect-type',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: [GLOB_TSX],
      },
    ])
    .addRule('expect', ERROR, expectRuleOptions ? [expectRuleOptions] : []) /** @since 0.0.1 */ // 🟢💭
    .enableConfigTesterForPlugin('expect-type')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'expectType'>;

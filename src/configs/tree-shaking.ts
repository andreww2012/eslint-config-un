import {ERROR, GLOB_JS_TS_X} from '../constants';
import type {GetRuleOptions} from '../eslint';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

export interface TreeShakingEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, 'tree-shaking'> {
  /**
   * Options of [the only rule, `no-side-effects-in-initialization`](https://github.com/lukastaegert/eslint-plugin-tree-shaking#installation-and-setup).
   */
  options?: GetRuleOptions<'tree-shaking', 'no-side-effects-in-initialization'>;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(
    optionsRaw,
    {} satisfies Partial<TreeShakingEslintConfigOptions>,
  );

  const {options: noSideEffectsInInitializationOptions} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'tree-shaking');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'tree-shaking',
      {
        includeDefaultFilesAndIgnores: true,
        filesDefault: [GLOB_JS_TS_X],
      },
    ])
    .addRule(
      'no-side-effects-in-initialization',
      ERROR,
      noSideEffectsInInitializationOptions ? [noSideEffectsInInitializationOptions] : [],
    ) /** @since 1.0.0 */
    .enableConfigTesterForPlugin('tree-shaking')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'treeShaking'>;

import {ERROR, GLOB_JS_TS_X} from '../constants';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * An ESLint plugin providing a rule to identify patterns that will interfere with the tree-shaking
 * algorithm of their module bundler.
 *
 * 📁 Default `files`: <code>**&#47;*.?([cm])[jt]s?(x)</code>
 */
export interface TreeShakingEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'tree-shaking'> {
  /**
   * Options of
   * [the only rule, `no-side-effects-in-initialization`](https://github.com/lukastaegert/eslint-plugin-tree-shaking#installation-and-setup).
   */
  options?: GetRuleOptions<'tree-shaking', 'no-side-effects-in-initialization'>;
}

export default defineUnConfig<TreeShakingEslintConfigOptions>(
  'treeShaking',
  false,
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {options: noSideEffectsInInitializationOptions} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'tree-shaking');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'tree-shaking',
      {
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
});

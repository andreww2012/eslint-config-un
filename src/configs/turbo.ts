import {ERROR} from '../constants';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [Turborepo](https://turborepo.dev) specific rules.
 *
 * 📁 Default `files`: all files
 */
export interface TurboEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'turbo'> {
  /**
   * Affected rule:
   * - [`turbo/no-undeclared-env-vars`](https://github.com/vercel/turborepo/blob/HEAD/packages/eslint-plugin-turbo/docs/rules/no-undeclared-env-vars.md)
   */
  undeclaredEnvVarsOptions?: GetRuleOptions<'turbo', 'no-undeclared-env-vars'>;
}

export default defineUnConfig<TurboEslintConfigOptions>('turbo', {enabledBy: {package: 'turbo'}})((
  context,
  optionsRaw,
) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {undeclaredEnvVarsOptions} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'turbo');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig('turbo')
    .addRule(
      'no-undeclared-env-vars',
      ERROR,
      undeclaredEnvVarsOptions ? [undeclaredEnvVarsOptions] : [],
    ) /** @since 0.0.1 */
    .enableConfigTesterForPlugin('turbo')
    .addOverrides();
});

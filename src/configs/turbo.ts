import {ERROR} from '../constants';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigOptions,
  assignDefaults,
  defineUnConfig,
} from './index';

export interface TurboEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends UnConfigOptions<ExtraPlugins, 'turbo'> {
  /**
   * Affected rules:
   * - [`no-undeclared-env-vars`](https://github.com/vercel/turborepo/blob/HEAD/packages/eslint-plugin-turbo/docs/rules/no-undeclared-env-vars.md)
   */
  undeclaredEnvVarsOptions?: GetRuleOptions<'turbo', 'no-undeclared-env-vars'>;
}

export default defineUnConfig('turbo', (context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies TurboEslintConfigOptions);

  const {undeclaredEnvVarsOptions} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'turbo');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['turbo', {includeDefaultFilesAndIgnores: true}])
    .addRule(
      'no-undeclared-env-vars',
      ERROR,
      undeclaredEnvVarsOptions ? [undeclaredEnvVarsOptions] : [],
    ) /** @since 0.0.1 */
    .enableConfigTesterForPlugin('turbo')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});

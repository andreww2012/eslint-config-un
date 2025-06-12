import {ERROR} from '../constants';
import {type GetRuleOptions, type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface TurboEslintConfigOptions extends UnConfigOptions<'turbo'> {
  /**
   * Affected rules:
   * - [`no-undeclared-env-vars`](https://github.com/vercel/turborepo/blob/HEAD/packages/eslint-plugin-turbo/docs/rules/no-undeclared-env-vars.md)
   */
  undeclaredEnvVarsOptions?: GetRuleOptions<'turbo', 'no-undeclared-env-vars'>[0];
}

export const turboUnConfig: UnConfigFn<'turbo'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.turbo;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies TurboEslintConfigOptions);

  const {undeclaredEnvVarsOptions} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'turbo');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['turbo', {includeDefaultFilesAndIgnores: true}])
    .addRule(
      'no-undeclared-env-vars',
      ERROR,
      undeclaredEnvVarsOptions ? [undeclaredEnvVarsOptions] : [],
    )
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

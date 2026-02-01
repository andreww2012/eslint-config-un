import {ERROR, GLOB_JSON, GLOB_JS_TS_X, OFF} from '../constants';
import type {EslintSeverity} from '../eslint/eslint-types';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
  eslintToUnRuleSeverity,
} from './index';

export interface NoSecretsEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'no-secrets'> {
  /**
   * 📁 Default `files`: <code>**&#47;*.json</code>
   *
   * ❌ Default `ignores`: <code>**&#47;package-lock.json</code>
   *
   * ⚠️ Will be merged with the user provided `ignores`
   * @default true
   */
  configJson?: boolean | UnFlatConfigEntryBase<ExtraPlugins, 'no-secrets'>;

  /**
   * Convenient way of configuring `no-secrets` rule for both JS/TS and JSON files.
   *
   * Will be merged with the default options.
   * @default {tolerance: 5}
   */
  noSecretsOptions?: GetRuleOptions<'no-secrets', 'no-secrets'> & {severity?: EslintSeverity};
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configJson: true,
  } satisfies Partial<NoSecretsEslintConfigOptions>);

  const {configJson, noSecretsOptions: noSecretsOptionsProvided} = optionsResolved;

  const {
    severity: noSecretsSeverityRaw,
    ...noSecretsOptions
  }: NoSecretsEslintConfigOptions['noSecretsOptions'] & {} = {
    tolerance: 4.5, // By default finds a lot of normal strings with entropy of ~4.0-4.2
    ...noSecretsOptionsProvided,
  };
  const noSecretsSeverity = eslintToUnRuleSeverity(noSecretsSeverityRaw, ERROR);

  const configBuilder = context.createConfigBuilder(optionsResolved, 'no-secrets');

  configBuilder
    ?.addConfig([
      'no-secrets',
      {
        includeDefaultFilesAndIgnores: true,
        filesDefault: [GLOB_JS_TS_X],
      },
    ])
    .addRule('no-pattern-match', OFF) /** @since 2.1.1-rc.0 */
    .addRule('no-secrets', noSecretsSeverity, [noSecretsOptions]) /** @since 0.1.0 */
    .enableConfigTesterForPlugin('no-secrets')
    .addOverrides();

  const configBuilderJson = context.createConfigBuilder(configJson, 'no-secrets');

  configBuilderJson
    ?.addConfig([
      'no-secrets/json',
      {
        includeDefaultFilesAndIgnores: true,
        filesDefault: [GLOB_JSON],
        ignoresDefault: ['**/package-lock.json'],
        ignoresDefaultMergedWithUserIgnores: true,
        parser: 'jsonc-eslint-parser',
      },
    ])
    .addRule('no-secrets', noSecretsSeverity, [noSecretsOptions])
    .addOverrides();

  return {
    configs: [configBuilder, configBuilderJson],
    optionsResolved,
  };
}) satisfies UnConfigFn<'noSecrets'>;

import {ERROR, GLOB_YML_YAML_EXTENSION, OFF} from '../constants';
import type {GetRuleOptions} from '../eslint';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

export interface GithubActionsEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, 'github-actions'> {
  /**
   * Maximum number of jobs that should be present in an action file.
   *
   * Not enforced by default.
   */
  maxJobsPerAction?: number;

  /**
   * Will be merged with the default value.
   * @default {actionName: true, jobName: true}
   */
  require?: Partial<Record<'actionName' | 'actionRunName' | 'jobName' | 'jobStepName', boolean>>;

  /**
   * Enforces `<job>.steps.uses` style.
   * @default 'release'
   */
  usesStyle?: false | GetRuleOptions<'github-actions', 'prefer-step-uses-style'>;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    usesStyle: {
      release: true,
      allowRepository: true,
    },
  } satisfies Partial<GithubActionsEslintConfigOptions>);

  const {maxJobsPerAction, usesStyle} = optionsResolved;
  const require: GithubActionsEslintConfigOptions['require'] & {} = {
    actionName: true,
    jobName: true,
    ...optionsResolved.require,
  };

  const configBuilder = context.createConfigBuilder(optionsResolved, 'github-actions');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'github-actions',
      {
        includeDefaultFilesAndIgnores: true,
        filesDefault: [`.github/workflows/*.${GLOB_YML_YAML_EXTENSION}`],
        language: ['yaml', 'yaml'],
      },
    ])
    .addRule('action-name-casing', OFF) /** @since 0.0.2 */
    .addRule('job-id-casing', ERROR) /** @since 0.0.3 */
    .addRule(
      'max-jobs-per-action',
      maxJobsPerAction == null ? OFF : ERROR,
      maxJobsPerAction == null ? [] : [maxJobsPerAction],
    ) /** @since 0.0.3 */
    .addRule('no-external-job', OFF) /** @since 0.0.7 */
    .addRule('no-invalid-key', ERROR) /** @since 0.0.8 */ // 🟢
    .addRule('no-top-level-env', OFF) /** @since 0.0.6 */
    .addRule('no-top-level-permissions', OFF) /** @since 0.0.4 */
    // Reason for disabling: extension should be controlled by `yaml/file-extension`
    .addRule('prefer-file-extension', OFF) /** @since 0.0.8 */ // 🟢
    .addRule(
      'prefer-step-uses-style',
      usesStyle === false ? OFF : ERROR,
      usesStyle === false ? [] : [usesStyle],
    ) /** @since 0.0.7 */
    .addRule('require-action-name', require.actionName ? ERROR : OFF) /** @since 0.0.0 */ // 🟢
    .addRule('require-action-run-name', require.actionRunName ? ERROR : OFF) /** @since 0.0.9 */
    .addRule('require-job-name', require.jobName ? ERROR : OFF) /** @since 0.0.6 */
    .addRule('require-job-step-name', require.jobStepName ? ERROR : OFF) /** @since 0.0.6 */
    .addRule('valid-timeout-minutes', ERROR) /** @since 0.0.16 */ // 🟢
    .addRule('valid-trigger-events', ERROR) /** @since 0.0.16 */ // 🟢
    .enableConfigTesterForPlugin('github-actions')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'githubActions'>;

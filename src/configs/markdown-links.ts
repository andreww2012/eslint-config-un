import {ERROR, GLOB_MARKDOWN, OFF, WARNING} from '../constants';
import type {NonEmptyTuple} from '../types';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

type IssueType = 'deadUrls' | 'missingFragments' | 'missingLocalPath' | 'selfDestinationLinks';

/**
 * An ESLint plugin that provides rules for checking the validity of links and URLs in Markdown
 * files.
 *
 * Since it's scoped only to Markdown files, the checker itself isn't perfect and it may
 * significantly slow down linting, the config is disabled by default.
 * We recommend that you use [`lychee` link checker](https://lychee.cli.rs) instead.
 *
 * 📁 Default `files`: <code>**&#47;*.md</code>
 */
export interface MarkdownLinksEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'markdown-links'> {
  /**
   * What types of issues the links are checked for.
   * By default, all issues are enabled.
   * The value you provide here will be **deeply merged** with the default value.
   *
   * You can also use this option to more conveniently control the options of the corresponding
   * rules.
   * @default
   * ```ts
   * {deadUrls: {options: {checkAnchor: false}, severityWarn: true}, missingFragments: true, missingLocalPath: true, selfDestinationLinks: true}
   * ```
   */
  check?: {
    [K in IssueType]?:
      | boolean
      | {
          /**
           * Options passed to the rule performing this check
           */
          options?: GetRuleOptions<
            'markdown-links',
            K extends 'deadUrls'
              ? 'no-dead-urls'
              : K extends 'missingFragments'
                ? 'no-missing-fragments'
                : K extends 'missingLocalPath'
                  ? 'no-missing-path'
                  : never
          >;

          /**
           * Report this check as a warning instead of an error
           */
          severityWarn?: boolean;
        };
  };
}

export default defineUnConfig<MarkdownLinksEslintConfigOptions>(
  'markdownLinks',
  false,
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'markdown-links');

  const deadUrls = optionsResolved.check?.deadUrls;
  const check: MarkdownLinksEslintConfigOptions['check'] & {} = {
    ...optionsResolved.check,
    deadUrls:
      deadUrls === false
        ? false
        : {
            severityWarn: true, // Sites these days are sensitive to making tons of requests quickly
            ...(typeof deadUrls === 'object' && deadUrls),
            options: {
              // High number of false positives
              checkAnchor: false,
              ...(typeof deadUrls === 'object' && deadUrls.options),
            },
          },
  };

  const getCheckSeverity = <
    T extends IssueType,
    RuleOptions = Extract<
      (MarkdownLinksEslintConfigOptions['check'] & {})[T],
      Record<string, unknown>
    >['options'] & {},
  >(
    issueType: T,
  ) => {
    const checkInfo = check[issueType];
    const isCheckInfoObject = typeof checkInfo === 'object';
    return [
      checkInfo === false ? OFF : isCheckInfoObject && checkInfo.severityWarn ? WARNING : ERROR,
      // eslint-disable-next-line ts/no-unnecessary-type-assertion -- wrong
      (isCheckInfoObject && checkInfo.options != null ? [checkInfo.options] : []) as [
        RuleOptions,
      ] extends [never]
        ? []
        : [RuleOptions],
    ] satisfies NonEmptyTuple;
  };

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'markdown-links',
      {
        filesDefault: [GLOB_MARKDOWN],
        language: ['markdown', 'commonmark'],
      },
    ])
    .addRule('no-dead-urls', ...getCheckSeverity('deadUrls')) /** @since 0.1.0 */
    .addRule('no-missing-fragments', ...getCheckSeverity('missingFragments')) /** @since 0.4.0 */
    .addRule('no-missing-path', ...getCheckSeverity('missingLocalPath')) /** @since 0.2.0 */ // 🟢
    .addRule('no-self-destination', ...getCheckSeverity('selfDestinationLinks')) /** @since 0.5.0 */ // 🟢
    .enableConfigTesterForPlugin('markdown-links')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});

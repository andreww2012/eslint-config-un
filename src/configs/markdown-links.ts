import {ERROR, GLOB_MARKDOWN, OFF} from '../constants';
import {type GetRuleOptions, type UnConfigOptions, createConfigBuilder} from '../eslint';
import type {NonEmptyTuple} from '../types';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

type IssueType = 'deadUrls' | 'missingFragments' | 'missingLocalPath' | 'selfDestinationLinks';

export interface MarkdownLinksEslintConfigOptions extends UnConfigOptions<'markdown-links'> {
  /**
   * What types of issues the links are checked for. By default, all issues are enabled.
   * The value you provide here will be **deeply merged** with the default value.
   *
   * You can also use this option to more conveniently control the options of the corresponding rules.
   * @default
   * ```ts
   * {deadUrls: {checkAnchor: false}, missingFragments: true, missingLocalPath: true, selfDestinationLinks: true}
   * ```
   */
  check?: {
    [K in IssueType]?:
      | boolean
      | GetRuleOptions<
          'markdown-links',
          K extends 'deadUrls'
            ? 'no-dead-urls'
            : K extends 'missingFragments'
              ? 'no-missing-fragments'
              : K extends 'missingLocalPath'
                ? 'no-missing-path'
                : never
        >;
  };
}

export const markdownLinksUnConfig: UnConfigFn<'markdownLinks'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.markdownLinks;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies MarkdownLinksEslintConfigOptions);

  const configBuilder = createConfigBuilder(context, optionsResolved, 'markdown-links');

  const deadUrls = optionsResolved.check?.deadUrls;
  const check: MarkdownLinksEslintConfigOptions['check'] & {} = {
    ...optionsResolved.check,
    deadUrls:
      deadUrls === false
        ? false
        : {
            // High number of false positives
            checkAnchor: false,
            ...(typeof deadUrls === 'object' && deadUrls),
          },
  };

  const getCheckSeverity = <
    T extends IssueType,
    RuleOptions = (MarkdownLinksEslintConfigOptions['check'] & {})[T] & object,
  >(
    issueType: T,
  ) =>
    [
      check[issueType] === false ? OFF : ERROR,
      (typeof check[issueType] === 'object' ? [check[issueType]] : []) as [RuleOptions] extends [
        never,
      ]
        ? []
        : [RuleOptions],
    ] satisfies NonEmptyTuple;

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'markdown-links',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: [GLOB_MARKDOWN],
        doNotIgnoreMarkdown: true,
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
};

import type {MaybePromise} from '@andreww2012/unutils';
import type {EslintPlugin, EslintRuleMetaWithLanguages} from '../../../src/eslint/eslint-types';

/**
 * Categorizes a single rule into zero or more categories.
 *
 * Whatever stands in the way of categorizing a rule must be described in `errors` instead of
 * being ignored.
 */
export type CategorizeRule<CategoryId extends string> = (ruleToCategorize: {
  rule: {meta?: EslintRuleMetaWithLanguages};
  ruleName: string;
}) => {
  categories: CategoryId[];
  errors: string[];
};

export interface RuleCategorization<CategoryId extends string> {
  /**
   * Categories to emit, in output order. A rule may belong to several of them
   */
  categories: readonly CategoryId[];

  includeDeprecated?: boolean;

  /**
   * Creates the rule categorizer, first possibly collecting whatever
   * the categorizer function depends onto, if it does not come from the rule itself
   */
  createRuleCategorizer: (
    plugin: EslintPlugin,
    pluginPrefix: string,
  ) => MaybePromise<CategorizeRule<CategoryId>>;
}

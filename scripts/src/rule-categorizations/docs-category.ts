import type {RuleCategorization} from './shared';

const isInDocsCategory = (rule: {meta?: {docs?: unknown}}, docsCategory: string) => {
  const docs = rule.meta?.docs;
  if (docs == null || typeof docs !== 'object' || !('category' in docs)) {
    return false;
  }

  const {category} = docs;
  return Array.isArray(category) ? category.includes(docsCategory) : category === docsCategory;
};

export const createDocsCategoryCategorization = <CategoryId extends string>(
  categoryId: CategoryId,
  docsCategory: string,
  {rulesToExclude = []}: {rulesToExclude?: readonly string[]} = {},
): RuleCategorization<CategoryId> => ({
  categories: [categoryId],

  createRuleCategorizer: (plugin, pluginPrefix) => {
    const ruleNamesInCategory = Object.entries(plugin.rules || {})
      .filter(([, rule]) => isInDocsCategory(rule, docsCategory))
      .map(([ruleName]) => ruleName);

    if (ruleNamesInCategory.length === 0) {
      throw new Error(
        `No rule of the \`${pluginPrefix}\` plugin is documented under the \`${docsCategory}\` category (anymore). It was probably renamed, in which case \`RULE_CATEGORIZATIONS\` must be updated`,
      );
    }

    const rulesExcludedInVain = rulesToExclude.filter(
      (ruleName) => !ruleNamesInCategory.includes(ruleName),
    );
    if (rulesExcludedInVain.length > 0) {
      throw new Error(
        `The following rules are excluded from the \`${docsCategory}\` category of the \`${pluginPrefix}\` plugin, but are not in it in the first place: ${rulesExcludedInVain.map((v) => `\`${v}\``).join(', ')}. The exclusion must be dropped from \`RULE_CATEGORIZATIONS\``,
      );
    }

    return ({rule, ruleName}) => ({
      categories:
        isInDocsCategory(rule, docsCategory) && !rulesToExclude.includes(ruleName)
          ? [categoryId]
          : [],
      errors: [],
    });
  },
});

import type {CategorizeRule, RuleCategorization} from './shared';

const PNPM_RULE_NAME_PREFIXES = ['json', 'yaml'] as const;

const categorizePnpmRule: CategorizeRule<(typeof PNPM_RULE_NAME_PREFIXES)[number]> = ({
  ruleName,
}) => {
  const prefix = PNPM_RULE_NAME_PREFIXES.find((candidate) => ruleName.startsWith(`${candidate}-`));

  return prefix
    ? {categories: [prefix], errors: []}
    : {
        categories: [],
        errors: [
          `does not start with any of the known file type prefixes: ${PNPM_RULE_NAME_PREFIXES.map((v) => `\`${v}-\``).join(', ')}`,
        ],
      };
};

export const pnpmRuleCategorization = {
  categories: PNPM_RULE_NAME_PREFIXES,
  createRuleCategorizer: () => categorizePnpmRule,
} satisfies RuleCategorization<(typeof PNPM_RULE_NAME_PREFIXES)[number]>;

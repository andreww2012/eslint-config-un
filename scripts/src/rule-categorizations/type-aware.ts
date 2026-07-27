import type {CategorizeRule, RuleCategorization} from './shared';

/**
 * `requiresTypeChecking` is a `typescript-eslint` convention followed by a number of other plugins,
 * not a part of ESLint's own `meta.docs`
 */
const requiresTypeChecking = (rule: {meta?: {docs?: object}}) => {
  const docs = rule.meta?.docs;
  return docs != null && 'requiresTypeChecking' in docs && docs.requiresTypeChecking === true;
};

const categorizeTypeAwareRule: CategorizeRule<'typeAware'> = ({rule}) => ({
  categories: requiresTypeChecking(rule) ? ['typeAware'] : [],
  errors: [],
});

export const typeAwareRuleCategorization = {
  categories: ['typeAware'],
  includeDeprecated: true,
  createRuleCategorizer: (plugin, pluginPrefix) => {
    if (Object.values(plugin.rules || {}).every((rule) => !requiresTypeChecking(rule))) {
      throw new Error(
        `The \`${pluginPrefix}\` plugin no longer declares \`meta.docs.requiresTypeChecking\` on any of its rules. Until it does again, its rules requiring type information must be listed by hand in \`RULES_REQUIRING_TYPE_INFORMATION\`, and the plugin dropped from \`RULE_CATEGORIZATIONS\`.`,
      );
    }

    return categorizeTypeAwareRule;
  },
} satisfies RuleCategorization<'typeAware'>;

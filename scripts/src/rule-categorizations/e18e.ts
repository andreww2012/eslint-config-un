import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {
  type NonEmptyTuple,
  type ObjectValues,
  isKeyIn,
  objectKeysUnsafe,
  objectValuesUnsafe,
  regexTyped,
} from '@andreww2012/unutils';
import type {RuleCategorization} from './shared';

const E18E_README_HEADINGS_TO_CATEGORIES = {
  Modernization: 'modernization',
  'Module replacements': 'moduleReplacements',
  'Performance improvements': 'performanceImprovements',
} as const;

type E18eCategory = ObjectValues<typeof E18E_README_HEADINGS_TO_CATEGORIES>;

const MARKDOWN_HEADING_REGEX = regexTyped('^#+ +(?<heading>.+?) *$');

const E18E_README_RULE_TABLE_ROW_REGEX = regexTyped('^\\| *\\[?`?(?<ruleName>[a-z][a-z\\d-]*)`?');

const parseE18eRuleCategoriesFromReadme = async () => {
  const readmeContents = await fs.readFile(
    fileURLToPath(import.meta.resolve('@e18e/eslint-plugin/README.md')),
    'utf8',
  );

  const categoriesPerRule = new Map<string, E18eCategory>();
  const headingsFound = new Set<string>();
  let currentCategory: E18eCategory | null = null;

  readmeContents.split('\n').forEach((line) => {
    const heading = MARKDOWN_HEADING_REGEX.exec(line)?.groups.heading;
    if (heading != null) {
      if (isKeyIn(heading, E18E_README_HEADINGS_TO_CATEGORIES)) {
        currentCategory = E18E_README_HEADINGS_TO_CATEGORIES[heading];
        headingsFound.add(heading);
      } else {
        currentCategory = null;
      }
      return;
    }

    const category = currentCategory;
    const ruleName = category && E18E_README_RULE_TABLE_ROW_REGEX.exec(line)?.groups.ruleName;
    if (category && ruleName) {
      categoriesPerRule.set(ruleName, category);
    }
  });

  const headingsMissing = objectKeysUnsafe(E18E_README_HEADINGS_TO_CATEGORIES).filter(
    (heading) => !headingsFound.has(heading),
  );
  if (headingsMissing.length > 0) {
    throw new Error(
      `The README of \`@e18e/eslint-plugin\` no longer has the following rule table heading(s): ${headingsMissing.map((v) => `\`${v}\``).join(', ')}. You probably need to update \`E18E_README_HEADINGS_TO_CATEGORIES\` in this script source file.`,
    );
  }

  return categoriesPerRule;
};

export const e18eRuleCategorization = {
  categories: objectValuesUnsafe(E18E_README_HEADINGS_TO_CATEGORIES),
  createRuleCategorizer: async (plugin) => {
    const categoriesPerRule = await parseE18eRuleCategoriesFromReadme();

    const pluginRules = plugin.rules || {};
    const rulesUnknownToPlugin = [...categoriesPerRule.keys()].filter(
      (ruleName) => !(ruleName in pluginRules),
    );
    if (rulesUnknownToPlugin.length > 0) {
      throw new Error(
        `The README of \`@e18e/eslint-plugin\` lists the following rules the plugin does not have: ${rulesUnknownToPlugin.map((v) => `\`${v}\``).join(', ')}. Most likely they were renamed, and the way their categories are parsed in this script source file must be adjusted.`,
      );
    }

    const categoriesPerRuleFromConfigs = new Map(
      objectValuesUnsafe(E18E_README_HEADINGS_TO_CATEGORIES).flatMap((category) => {
        const config = plugin.configs?.[category];
        const rules = (config && !Array.isArray(config) && config.rules) || {};
        return objectKeysUnsafe(rules).map(
          (ruleName) => [ruleName.replace(/^e18e\//, ''), category] satisfies NonEmptyTuple,
        );
      }),
    );

    return ({ruleName}) => {
      const category = categoriesPerRule.get(ruleName);
      if (!category) {
        return {
          categories: [],
          errors: ["is not listed in any of the rule tables of the plugin's README"],
        };
      }

      const categoryFromConfig = categoriesPerRuleFromConfigs.get(ruleName);

      return {
        categories: [category],
        errors:
          categoryFromConfig === category || categoryFromConfig == null
            ? []
            : [
                `is listed under the \`${category}\` README table, but is enabled by the plugin's \`${categoryFromConfig}\` config`,
              ],
      };
    };
  },
} satisfies RuleCategorization<E18eCategory>;

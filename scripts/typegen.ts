import fs from 'node:fs/promises';
import path from 'node:path';
import {styleText} from 'node:util';
import {type NonEmptyTuple, capitalize} from '@andreww2012/unutils';
import * as diff from 'diff';
import {pluginsToRulesDTS} from 'eslint-typegen/core';
import {normalizeIdentifier} from 'json-schema-to-typescript-lite';
import prettier from 'prettier';
import prettierConfig from '../.prettierrc.json' with {type: 'json'};
import {eslintPluginVanillaRules} from '../src/eslint/eslint-shared';
import type {EslintPlugin} from '../src/eslint/eslint-types';
import {pluginsLoaders} from '../src/loaders/plugins';
import type {ModuleLoaderContext} from '../src/loaders/shared';
import {generateAngularPluginsWithOldRules} from './shared';
import {RULE_CATEGORIZATIONS} from './src/rule-categorizations';
import {addMissingRuleOptionsSchemas} from './src/set-missing-rule-options-schemas';

const __dirname = import.meta.dirname;

const PLUGIN_LOADER_CONTEXT: ModuleLoaderContext = {
  rootOptions: {},
  missingPackages: new Set(),
};

await fs.mkdir(resolveInOutDir(), {recursive: true});

const {allRuleTypesCode, perPluginCode, fixableRulesOnlyCode, allRulesCode, ruleCategoriesCode} =
  await generateRuleTypes();

await printDiffBetweenMostRecentAndCurrentRuleTypes(allRuleTypesCode);

const derivedAllRuleTypesCode = `/* eslint-disable */
/* prettier-ignore */
// Derived from \`eslint-types-per-plugin.gen.d.ts\` to avoid loading two copies
// of every rule's option type into the TypeScript program
import type {UnionToIntersection} from '@andreww2012/unutils';
import type {Linter} from 'eslint';
import type {RuleOptionsPerPlugin} from './eslint-types-per-plugin.gen';

type _RuleOptionsRaw = UnionToIntersection<
  {
    [P in keyof RuleOptionsPerPlugin]: {
      [R in keyof RuleOptionsPerPlugin[P] & string as P extends '' ? R : \`\${P & string}/\${R}\`]: RuleOptionsPerPlugin[P][R]
    }
  }[keyof RuleOptionsPerPlugin]
>

export type RuleOptions = {
  [K in keyof _RuleOptionsRaw]?: _RuleOptionsRaw[K] extends readonly unknown[]
    ? Linter.RuleEntry<_RuleOptionsRaw[K]>
    : never
}`;

await Promise.all([
  prettier
    .format(derivedAllRuleTypesCode, {parser: 'typescript', ...prettierConfig})
    .then((formattedCode) =>
      fs.writeFile(path.join(__dirname, '../src/eslint-types.gen.d.ts'), formattedCode),
    ),
  fs.writeFile(path.join(__dirname, '../src/eslint-types-per-plugin.gen.d.ts'), perPluginCode),
  prettier
    .format(fixableRulesOnlyCode, {parser: 'typescript', ...prettierConfig})
    .then((formattedCode) =>
      fs.writeFile(path.join(__dirname, '../src/eslint-types-fixable-only.gen.ts'), formattedCode),
    ),
  fs.writeFile(path.join(__dirname, '../src/eslint-rules.gen.ts'), allRulesCode),
  prettier
    .format(ruleCategoriesCode, {parser: 'typescript', ...prettierConfig})
    .then((formattedCode) =>
      fs.writeFile(path.join(__dirname, '../src/eslint-rule-categories.gen.ts'), formattedCode),
    ),
  fs.writeFile(
    resolveInOutDir(`eslint-types.${new Date().toISOString().replaceAll(':', '')}.d.ts`),
    allRuleTypesCode,
  ),
]);

async function generateRuleTypes() {
  const [
    loadedPlugins,
    {plugin: pluginAngular, pluginTemplate: pluginAngularTemplate},
    pluginsWithAddedRuleOptionSchemas,
  ] = await Promise.all([
    Promise.all(
      Object.entries(pluginsLoaders).map(
        async ([pluginPrefix, loadPlugin]) =>
          [pluginPrefix, (await loadPlugin(PLUGIN_LOADER_CONTEXT)).module] satisfies NonEmptyTuple,
      ),
    ),
    generateAngularPluginsWithOldRules(),
    addMissingRuleOptionsSchemas(),
  ]);

  const allPlugins: Record<string, EslintPlugin> = Object.fromEntries(
    loadedPlugins.flatMap(([pluginPrefix, plugin]) =>
      plugin ? [[pluginPrefix, plugin] satisfies NonEmptyTuple] : [],
    ),
  );
  Object.assign(
    allPlugins,
    {
      '': eslintPluginVanillaRules,
      angular: pluginAngular,
      'angular-template': pluginAngularTemplate,
    },
    pluginsWithAddedRuleOptionSchemas,
  );

  const [allRuleTypesCodeRaw, perPluginCodeRaw] = await Promise.all([
    pluginsToRulesDTS(allPlugins, {
      includeAugmentation: false,
    }),

    Promise.all(
      Object.entries(allPlugins).map(async ([pluginName, plugin]) => {
        const exportTypeName = normalizeIdentifier(`Plugin${capitalize(pluginName || 'js')}`);
        let code = await pluginsToRulesDTS(
          {[pluginName]: plugin},
          {
            includeAugmentation: false,
            exportTypeName,
            includeIgnoreComments: false,
            includeTypeImports: false,
          },
        );
        code = code.replaceAll(
          new RegExp(String.raw`'${pluginName ? `${pluginName}/` : ''}([^']*)'\?:`, 'g'),
          "'$1':",
        );

        // This forces the per-rule option type aliases to be exported.
        // When a config's emitted `.d.ts` references one of these by name
        // `rolldown-plugin-dts` needs a matching export
        // to import — otherwise it warns with `IMPORT_IS_UNDEFINED` during build
        code = code.replaceAll(/^type /gm, 'export type ');

        return {
          code,
          exportTypeName,
          pluginName,
          plugin,
          // eslint-disable-next-line unicorn/no-array-sort
          ruleNamesSorted: Object.keys(plugin.rules || {}).sort(),
        };
      }),
    ),
  ]);

  // eslint-disable-next-line ts/no-shadow
  const perPluginCode = `${perPluginCodeRaw.map((v) => v.code).join('\n\n')}

export type RuleOptionsPerPlugin = {
${perPluginCodeRaw.map((v) => `  '${v.pluginName}': ${v.exportTypeName};`).join('\n')}
}\n`.replaceAll(/: Linter.RuleEntry<([^>]*)>/g, ': $1;');

  const fixableRulesPerPluginEntries = perPluginCodeRaw
    .map(({pluginName, plugin}) => {
      const fixableRuleNames = Object.entries(plugin.rules || {})
        .filter(([, ruleDefinition]) => ruleDefinition.meta?.fixable)
        .map(([ruleName]) => ruleName);
      return {pluginName, fixableRuleNames};
    })
    .filter(({fixableRuleNames}) => fixableRuleNames.length > 0);

  // eslint-disable-next-line ts/no-shadow
  const fixableRulesOnlyCode = `const FIXABLE_RULES_PER_PLUGIN_RAW = /* ${fixableRulesPerPluginEntries.length} plugin${fixableRulesPerPluginEntries.length === 1 ? '' : 's'} */ {
${fixableRulesPerPluginEntries
  .map(
    ({pluginName, fixableRuleNames}) =>
      `  '${pluginName}': /* ${fixableRuleNames.length} rule${fixableRuleNames.length === 1 ? '' : 's'} */ {
${fixableRuleNames.map((ruleName) => `    '${ruleName}': true,`).join('\n')}
  },`,
  )
  .join('\n')}
};

export const FIXABLE_RULES_PER_PLUGIN: Partial<Record<string, Partial<Record<string, boolean>>>> =
  FIXABLE_RULES_PER_PLUGIN_RAW;

export type FixableRuleNames = {
  [P in keyof typeof FIXABLE_RULES_PER_PLUGIN_RAW]: P extends ''
    ? keyof (typeof FIXABLE_RULES_PER_PLUGIN_RAW)[P] & string
    : \`\${P & string}/\${keyof (typeof FIXABLE_RULES_PER_PLUGIN_RAW)[P] & string}\`;
}[keyof typeof FIXABLE_RULES_PER_PLUGIN_RAW];
`;

  // eslint-disable-next-line ts/no-shadow
  const allRulesCode = `export const ALL_RULES_PER_PLUGIN = /* ${perPluginCodeRaw.length} plugin${perPluginCodeRaw.length === 1 ? '' : 's'} */ {
${perPluginCodeRaw
  .map(({pluginName, plugin}) => {
    const pluginRules = Object.entries(plugin.rules || {});
    const rulesCount = pluginRules.length;
    return `  '${pluginName}': /* ${rulesCount} rule${rulesCount === 1 ? '' : 's'} */ [\n${pluginRules
      .map(([ruleName, ruleDefinition]) => {
        const {
          deprecated,
          fixable,
          hasSuggestions,
          schema,
          language,
          type: ruleType,
          dialects,
        } = ruleDefinition.meta || {};
        const comment = [
          [
            ruleType === 'problem' && '💥',
            ruleType === 'suggestion' && '🤔',
            ruleType === 'layout' && '💅',
          ],
          [language],
          [dialects?.join(',')],
          [schema && !(Array.isArray(schema) && schema.length === 0) && '📄'],
          [deprecated && '⛔', fixable && '🔧', hasSuggestions && '💡'],
        ]
          .map((v) => v.filter(Boolean).join(''))
          .filter(Boolean)
          .join('|');
        return `    '${ruleName}',${comment ? ` // ${comment}` : ''}`;
      })
      .join('\n')}\n  ],`;
  })
  .join('\n')}
} as const;
`;

  const categorizedRulesPerPlugin = await Promise.all(
    Object.entries(RULE_CATEGORIZATIONS).map(
      async ([
        pluginName,
        {categories: categoriesDeclared, includeDeprecated = false, createRuleCategorizer},
      ]) => {
        const plugin = allPlugins[pluginName];
        if (!plugin) {
          throw new Error(`Cannot categorize the rules of the not loaded \`${pluginName}\` plugin`);
        }

        const categorizeRule = await createRuleCategorizer(plugin, pluginName);

        const errors: string[] = [];
        const rulesPerCategory = new Map(
          categoriesDeclared.map((category): [typeof category, string[]] => [category, []]),
        );

        Object.entries(plugin.rules || {})
          // eslint-disable-next-line unicorn/no-array-sort
          .sort(([ruleNameA], [ruleNameB]) => ruleNameA.localeCompare(ruleNameB))
          .filter(([, {meta}]) => includeDeprecated || !meta?.deprecated)
          .forEach(([ruleName, rule]) => {
            const {categories: categoriesFound, errors: ruleErrors} = categorizeRule({
              rule,
              ruleName,
            });
            if (ruleErrors.length > 0) {
              errors.push(
                `  ${styleText('yellow', `${pluginName}/${ruleName}`)}: ${ruleErrors.join(', ')}`,
              );
            }
            categoriesFound.forEach((category) => {
              rulesPerCategory.get(category)?.push(ruleName);
            });
          });

        return {pluginName, rulesPerCategory, errors};
      },
    ),
  );

  const categorizationErrors = categorizedRulesPerPlugin.flatMap(({errors}) => errors);

  if (categorizationErrors.length > 0) {
    throw new Error(
      `The following rules could not be sorted into a category. Update the corresponding categorization in \`scripts/src/rule-categorizations\`, creating a new category (and, most likely, a new Sub-config) if needed:\n${categorizationErrors.join('\n')}`,
    );
  }

  const ruleCategoriesCodeRaw = `export const RULE_CATEGORIES_PER_PLUGIN = {
${categorizedRulesPerPlugin
  .map(
    ({pluginName, rulesPerCategory}) =>
      `  '${pluginName}': {
${Array.from(
  rulesPerCategory,
  ([category, ruleNames]) =>
    `    ${category}: /* ${ruleNames.length} rule${ruleNames.length === 1 ? '' : 's'} */ [\n${ruleNames.map((ruleName) => `      '${ruleName}',`).join('\n')}\n    ],`,
).join('\n')}
  },`,
  )
  .join('\n')}
} as const;
`;

  return {
    allRuleTypesCode: allRuleTypesCodeRaw,
    perPluginCode,
    fixableRulesOnlyCode,
    allRulesCode,
    ruleCategoriesCode: ruleCategoriesCodeRaw,
  };
}

function resolveInOutDir(...paths: string[]) {
  return path.join(__dirname, '../temp/eslint-types', ...paths);
}

function getDiffAsPatch(a: string, b: string) {
  const patch = diff.createPatch('', a, b);
  const patchDiff = patch
    .split('\n')
    .slice(4)
    .map((line) => {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        return styleText('green', line);
      }
      if (line.startsWith('-') && !line.startsWith('---')) {
        return styleText('red', line);
      }
      if (line.startsWith('@@')) {
        return styleText('cyan', line);
      }
      return line;
    });
  return patchDiff;
}

async function printDiffBetweenMostRecentAndCurrentRuleTypes(currentRuleTypes: string) {
  // eslint-disable-next-line unicorn/no-array-sort
  const mostRecentRuleTypesFileName = (await fs.readdir(resolveInOutDir())).sort().at(-1);
  let diffString = '';
  if (mostRecentRuleTypesFileName) {
    const mostRecentRuleTypes = await fs
      .readFile(resolveInOutDir(mostRecentRuleTypesFileName), 'utf8')
      .catch((error: unknown) => {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
          return null;
        }
        throw error;
      });
    if (mostRecentRuleTypes) {
      diffString =
        mostRecentRuleTypes === currentRuleTypes
          ? styleText('gray', 'No changes between the current and the most recent rule types')
          : getDiffAsPatch(mostRecentRuleTypes, currentRuleTypes).join('\n');
    }
  }
  console.log(diffString || styleText('gray', 'No most recent rule types found'));
}

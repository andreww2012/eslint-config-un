import fs from 'node:fs/promises';
import path from 'node:path';
import {styleText} from 'node:util';
import {capitalize} from '@andreww2012/unutils';
import * as diff from 'diff';
import {pluginsToRulesDTS} from 'eslint-typegen/core';
import {normalizeIdentifier} from 'json-schema-to-typescript-lite';
import prettier from 'prettier';
import prettierConfig from '../.prettierrc.json' with {type: 'json'};
import {eslintConfigInternal} from '../src/config-un/config';
import {DISABLE_AUTOFIX} from '../src/constants';
import {eslintPluginVanillaRules} from '../src/eslint/eslint-shared';
import {generateAngularPluginsWithOldRules} from './shared';
import {addMissingRuleOptionsSchemas} from './src/set-missing-rule-options-schemas';

const __dirname = import.meta.dirname;

await fs.mkdir(resolveInOutDir(), {recursive: true});

const {allRuleTypesCode, perPluginCode, fixableRulesOnlyCode, allRulesCode} =
  await generateRuleTypes();

await printDiffBetweenMostRecentAndCurrentRuleTypes(allRuleTypesCode);

/* eslint-disable unicorn/no-incorrect-template-string-interpolation */
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
/* eslint-enable unicorn/no-incorrect-template-string-interpolation */

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
  fs.writeFile(
    resolveInOutDir(`eslint-types.${new Date().toISOString().replaceAll(':', '')}.d.ts`),
    allRuleTypesCode,
  ),
]);

async function generateRuleTypes() {
  const [
    unFlatConfigs,
    {plugin: pluginAngular, pluginTemplate: pluginAngularTemplate},
    pluginsWithAddedRuleOptionSchemas,
  ] = await Promise.all([
    eslintConfigInternal(
      {loadPluginsOnDemand: false, autofixDisabledGloballyFor: false},
      {disableWarnings: true},
    ),
    generateAngularPluginsWithOldRules(),
    addMissingRuleOptionsSchemas(),
  ]);

  const allPlugins = Object.fromEntries(
    unFlatConfigs.flatMap((v) => Object.entries(v.plugins || {})),
  );
  // eslint-disable-next-line ts/no-dynamic-delete
  delete allPlugins[DISABLE_AUTOFIX];
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

  return {
    allRuleTypesCode: allRuleTypesCodeRaw,
    perPluginCode,
    fixableRulesOnlyCode,
    allRulesCode,
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

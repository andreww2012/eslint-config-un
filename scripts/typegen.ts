import fs from 'node:fs/promises';
import path from 'node:path';
// eslint-disable-next-line node/no-unsupported-features/node-builtins
import {styleText} from 'node:util';
import * as diff from 'diff';
import {capitalize} from 'es-toolkit';
import {flatConfigsToRulesDTS, pluginsToRulesDTS} from 'eslint-typegen/core';
import {normalizeIdentifier} from 'json-schema-to-typescript-lite';
import {eslintConfigInternal} from '../src/config';
import {DISABLE_AUTOFIX, eslintPluginVanillaRules} from '../src/eslint';

// eslint-disable-next-line node/no-unsupported-features/node-builtins
const __dirname = import.meta.dirname;

await fs.mkdir(resolveInOutDir(), {recursive: true});

const {
  main: ruleTypes,
  perPlugin: ruleTypesPerPlugin,
  fixableRulesOnly: ruleTypesFixableRulesOnly,
} = await generateRuleTypes();

await printDiffBetweenMostRecentAndCurrentRuleTypes(ruleTypes);

await Promise.all([
  fs.writeFile(path.join(__dirname, '../src/eslint-types.d.ts'), ruleTypes),
  fs.writeFile(path.join(__dirname, '../src/eslint-types-per-plugin.d.ts'), ruleTypesPerPlugin),
  fs.writeFile(
    path.join(__dirname, '../src/eslint-types-fixable-only.d.ts'),
    ruleTypesFixableRulesOnly,
  ),
  fs.writeFile(
    resolveInOutDir(`eslint-types.${new Date().toISOString().replaceAll(':', '')}.d.ts`),
    ruleTypes,
  ),
]);

async function generateRuleTypes() {
  const unFlatConfigs = await eslintConfigInternal({
    loadPluginsOnDemand: false,
    configs: {
      // If Angular is not found installed, plugin is not generated
      angular: true,
    },
  });
  const allRealPlugins = unFlatConfigs
    .flatMap((v) => Object.entries(v.plugins || {}))
    .filter(([pluginName]) => pluginName !== DISABLE_AUTOFIX);
  allRealPlugins.push(['', eslintPluginVanillaRules]);

  const [main, fixableRulesOnlyCodeRaw, perPluginCodeRaw] = await Promise.all([
    pluginsToRulesDTS(Object.fromEntries(allRealPlugins), {
      includeAugmentation: false,
    }),
    flatConfigsToRulesDTS(
      [
        ...(await eslintConfigInternal(
          {
            loadPluginsOnDemand: false,
            disableAutofixMethod: {default: 'prefixed'},
            configs: {
              // If Angular is not found installed, plugin is not generated
              angular: true,
            },
          },
          {disableAutofixOnly: true},
        )),
      ],
      {includeAugmentation: false},
    ),
    Promise.all(
      allRealPlugins.map(async ([pluginName, plugin]) => {
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
          new RegExp(`'${pluginName ? `${pluginName}/` : ''}([^']*)'\\?:`, 'g'),
          "'$1':",
        );
        return {
          code,
          exportTypeName,
          pluginName,
        };
      }),
    ),
  ]);

  const perPluginCode = `${perPluginCodeRaw.map((v) => v.code).join('\n\n')}

export type RuleOptionsPerPlugin = {
${perPluginCodeRaw.map((v) => `  '${v.pluginName}': ${v.exportTypeName};`).join('\n')}
}\n`.replaceAll(/: Linter.RuleEntry<([^>]*)>/g, ': $1;');

  const fixableRulesOnlyCode = `export type FixableRuleNames = ${[...fixableRulesOnlyCodeRaw.matchAll(/'disable-autofix\/([^']*)'/g)].map((match) => `'${match[1]}'`).join(' | ')};\n`;

  return {
    main,
    perPlugin: perPluginCode,
    fixableRulesOnly: fixableRulesOnlyCode,
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

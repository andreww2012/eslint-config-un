import fs from 'node:fs/promises';
import path from 'node:path';
// eslint-disable-next-line node/no-unsupported-features/node-builtins
import {styleText} from 'node:util';
import * as diff from 'diff';
import {flatConfigsToRulesDTS} from 'eslint-typegen/core';
import {eslintConfigInternal} from '../src/config';
import {eslintPluginVanillaRules} from '../src/eslint';

// eslint-disable-next-line node/no-unsupported-features/node-builtins
const __dirname = import.meta.dirname;

await fs.mkdir(resolveInOutDir(), {recursive: true});

const {main: ruleTypes, fixableRulesOnly: ruleTypesFixableRulesOnly} = await generateRuleTypes();

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
      mostRecentRuleTypes === ruleTypes
        ? styleText('gray', 'No changes between the current and the most recent rule types')
        : getDiffAsPatch(mostRecentRuleTypes, ruleTypes).join('\n');
  }
}
console.log(diffString || styleText('gray', 'No most recent rule types found'));

await Promise.all([
  fs.writeFile(path.join(__dirname, '../src/eslint-types.d.ts'), ruleTypes),
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
  const [main, fixableRulesOnly] = await Promise.all([
    flatConfigsToRulesDTS(
      [
        {plugins: {'': eslintPluginVanillaRules}},
        ...(await eslintConfigInternal({
          loadPluginsOnDemand: false,
          configs: {
            // If Angular is not found installed, plugin is not generated
            angular: true,
          },
        })),
      ],
      {includeAugmentation: false},
    ),
    flatConfigsToRulesDTS(
      [
        ...(await eslintConfigInternal(
          {
            loadPluginsOnDemand: false,
            disableAutofixMethod: {default: 'rules-copy'},
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
  ]);

  return {
    main,
    fixableRulesOnly,
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

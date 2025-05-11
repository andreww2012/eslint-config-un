import fs from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';
import * as diff from 'diff';
import {flatConfigsToRulesDTS} from 'eslint-typegen/core';
import {eslintConfig} from '../src';
import {eslintPluginVanillaRules} from '../src/eslint';

// eslint-disable-next-line node/no-unsupported-features/node-builtins
const __dirname = import.meta.dirname;

await fs.mkdir(resolveInOutDir(), {recursive: true});

const ruleTypes = await generateRuleTypes();

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
        ? chalk.gray('No changes between the current and the most recent rule types')
        : getDiffAsPatch(mostRecentRuleTypes, ruleTypes).join('\n');
  }
}
console.log(diffString || chalk.gray('No most recent rule types found'));

await Promise.all([
  fs.writeFile(path.join(__dirname, '../src/eslint-types.d.ts'), ruleTypes),
  fs.writeFile(
    resolveInOutDir(`eslint-types.${new Date().toISOString().replaceAll(':', '')}.d.ts`),
    ruleTypes,
  ),
]);

async function generateRuleTypes(): Promise<string> {
  const configs = [
    {
      plugins: {
        '': eslintPluginVanillaRules,
      },
    },
    ...(await eslintConfig({
      loadPluginsOnDemand: false,
      configs: {
        // If Angular is not found installed, plugin is not generated
        angular: true,
      },
    })),
  ];

  return await flatConfigsToRulesDTS(configs as Parameters<typeof flatConfigsToRulesDTS>[0], {
    includeAugmentation: false,
  });
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
        return chalk.green(line);
      }
      if (line.startsWith('-') && !line.startsWith('---')) {
        return chalk.red(line);
      }
      if (line.startsWith('@@')) {
        return chalk.cyan(line);
      }
      return line;
    });
  return patchDiff;
}

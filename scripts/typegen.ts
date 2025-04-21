import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import {flatConfigsToRulesDTS} from 'eslint-typegen/core';
import {eslintConfig} from '../src';
import {eslintPluginVanillaRules} from '../src/eslint';

const configs = [
  {
    plugins: {
      '': eslintPluginVanillaRules,
    },
  },
  ...(await eslintConfig({
    configs: {
      // If Angular is not found installed, plugin is not generated
      angular: true,
    },
  })),
];

const output = await flatConfigsToRulesDTS(configs as Parameters<typeof flatConfigsToRulesDTS>[0], {
  includeAugmentation: false,
});

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

fs.writeFileSync(path.join(__dirname, '../src/eslint-types.d.ts'), output);

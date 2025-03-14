import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import {builtinRules} from 'eslint/use-at-your-own-risk';
import {flatConfigsToRulesDTS} from 'eslint-typegen/core';
import {eslintConfig} from '../src';

const configs = [
  {
    plugins: {
      '': {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        rules: Object.fromEntries(builtinRules.entries()),
      },
    },
  },
  ...eslintConfig({
    configs: {
      // If Angular is not found installed, plugin is not generated
      angular: true,
    },
  }),
];

const output = await flatConfigsToRulesDTS(configs as Parameters<typeof flatConfigsToRulesDTS>[0], {
  includeAugmentation: false,
});

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

fs.writeFileSync(path.join(__dirname, '../src/eslint-types.d.ts'), output);

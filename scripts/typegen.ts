import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
// eslint-disable-next-line import/no-deprecated
import {builtinRules} from 'eslint/use-at-your-own-risk';
import {flatConfigsToRulesDTS} from 'eslint-typegen/core';
import {eslintConfig} from '../src';

const configs = [
  {
    plugins: {
      '': {
        // eslint-disable-next-line import/no-deprecated, @typescript-eslint/no-deprecated
        rules: Object.fromEntries(builtinRules.entries()),
      },
    },
  },
  ...eslintConfig({
    configs: {
      import: true,
      js: true,
      node: true,
      preferArrowFunctions: true,
      promise: true,
      regexp: true,
      security: true,
      sonar: true,
      tailwind: true,
      ts: {
        noTypeAssertion: true,
      },
      unicorn: true,
      vue: {
        a11y: true,
        nuxtMajorVersion: 3,
        pinia: true,
      },
      yaml: true,
    },
  }),
];

const output = await flatConfigsToRulesDTS(configs as Parameters<typeof flatConfigsToRulesDTS>[0], {
  includeAugmentation: false,
});

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

fs.writeFileSync(path.join(__dirname, '../src/eslint-types.d.ts'), output);

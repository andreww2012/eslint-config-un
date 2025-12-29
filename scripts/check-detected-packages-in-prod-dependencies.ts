import {styleText} from 'node:util';
import {exec} from 'tinyexec';
import {PACKAGES_TO_GET_INFO_FOR} from '../src/constants';

await main();

async function main() {
  await Promise.all(
    [
      ...PACKAGES_TO_GET_INFO_FOR,
      'relay-runtime',
      'jest-extended',
      'react-dom',
      ...['react', 'node', 'serve', 'dev'].map((packageName) => `@remix-run/${packageName}`),
      ...['react', 'node', 'serve', 'dev'].map((packageName) => `@react-router/${packageName}`),
      'aws-cdk-lib',
      'helmet',
      'prettier-plugin-svelte',
      'marko',
      'pinia',
      'vue-i18n',
      'nuxt',
      '@angular-eslint/eslint-plugin',
      '@angular-eslint/eslint-plugin-template',
      '@angular-eslint/template-parser',
    ].map(async (packageName) => {
      const {stdout, stderr} = await exec('pnpm', [
        'why',
        '--prod',
        // '--exclude-peers',
        packageName,
      ]);

      if (stdout) {
        console.log(styleText('black', styleText('bgCyanBright', packageName)));
        console.log(stdout);
      } else if (stderr) {
        console.log(styleText('black', styleText('bgRedBright', packageName)));
        console.log('Error:\n', stderr);
      }
    }),
  );
}

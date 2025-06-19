import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  shims: true,
  dts: true,
  external: [
    'angular-eslint-plugin-template17',
    'angular-eslint-plugin18',
    'eslint-plugin-no-type-assertion',
    'eslint-plugin-prettier',
  ],
});

import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  shims: true,
  external: [/^typescript/, /^@?eslint/, /^@?typescript-eslint/, 'vue-eslint-parser'],
});

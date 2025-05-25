import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  shims: true,
  noExternal: ['eslint-plugin-prettier'],
});

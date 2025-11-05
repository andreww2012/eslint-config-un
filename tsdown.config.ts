import {defineConfig} from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  shims: true,
  dts: true,
  external: ['eslint-plugin-no-type-assertion', 'eslint-plugin-prettier'],
  noExternal: [
    /^(import-meta-resolve|is-in-editor)(?:\/.+)?$/, // Patched
  ],
});

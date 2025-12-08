import {defineConfig} from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/snippets.ts'],
  format: 'esm',
  dts: true,
  external: ['eslint-plugin-no-type-assertion', 'eslint-plugin-prettier'],
  noExternal: [
    /^(import-meta-resolve|is-in-editor)(?:\/.+)?$/, // Patched
  ],
  unbundle: true,
});

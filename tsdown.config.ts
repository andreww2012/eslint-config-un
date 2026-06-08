import {defineConfig} from 'tsdown';
import ourPackageJson from './package.json' with {type: 'json'};

export const ALWAYS_BUNDLED_DEPENDENCIES: string[] = [
  'import-meta-resolve', // Patched
  'remeda', // Inlined to avoid always considered installed
  'eslint-plugin-no-type-assertion', // Inlined to avoid installation warnings about incompatibility with ESLint 9/10
  '@eslint/compat', // Patched
];

export default defineConfig({
  entry: ['src/index.ts', 'src/snippets.ts', 'src/globs.ts'],
  format: 'esm',
  unbundle: true,
  deps: {
    neverBundle: [...ourPackageJson.bundleDependencies],
    alwaysBundle: [new RegExp(String.raw`^(?:${ALWAYS_BUNDLED_DEPENDENCIES.join('|')})(?:\/.+)?$`)],
  },
  dts: {
    resolve: [
      '@jest/environment', // dev dependency: types used in `jest` config options
      '@jest/expect', // dev dependency: types used in `jest` config options
      'is-in-editor', // patched: already bundled in JS via noExternal, types must match
      'shiki', // dev dependency: types used in `markdown` config options
      'is-immutable-type', // dev dependency: types used in `functional` config options

      // Intentionally excluded:
      // - `browserslist`: its `export = browserslist` CJS pattern causes a `MISSING_EXPORT` build warning
      //   when resolving named exports. It's already a peerDependency, so the bare-specifier
      //   import in dist is fine — consumers using compat config will have it installed.
      // - `@sveltejs/kit`: resolving it triggers "Export 'AcceptedPlugin' is not defined" because a
      //   transitive dependency has a broken re-export.
    ],
  },
});

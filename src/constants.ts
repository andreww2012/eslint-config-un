// cspell:ignore nuxtjs
import ourPackageJson from '../package.json' with {type: 'json'};
// See https://github.com/typescript-eslint/typescript-eslint/issues/8721
import type {Branded} from './types';
import {omit} from './utils';

export const OPTIONAL_PEER_DEPENDENCIES = Object.freeze(
  omit(ourPackageJson.peerDependencies, ['eslint']),
);

/* Error levels */

/* eslint-disable un/no-type-assertion -- brands only exist in types */
export const ERROR = 2 as Branded<2, 'error'>;
export const WARNING = 1 as Branded<1, 'warning'>;
export const OFF = 0 as Branded<0, 'off'>;
/* eslint-enable un/no-type-assertion */

export type RuleSeverity = typeof ERROR | typeof WARNING | typeof OFF;

/* Other */

export const DISABLE_AUTOFIX = 'disable-autofix';
export const DISABLE_AUTOFIX_WITH_SLASH = `${DISABLE_AUTOFIX}/`;
export type DisableAutofixPrefix = typeof DISABLE_AUTOFIX;

/* Globs - Helpers */

export const GLOB_MAYBE_COMMONJS_OR_ESM = '?([cm])' as const;
export const GLOB_MAYBE_X = '?(x)' as const;
export const GLOB_JS_TS_ONLY_EXTENSION = '[jt]s' as const;

/* Globs - JS & TS */

export const GLOB_JS_TS_EXTENSION =
  `${GLOB_MAYBE_COMMONJS_OR_ESM}${GLOB_JS_TS_ONLY_EXTENSION}` as const;
export const GLOB_JS_TS = `**/*.${GLOB_JS_TS_EXTENSION}` as const;

export const GLOB_JS_TS_X_EXTENSION = `${GLOB_JS_TS_EXTENSION}${GLOB_MAYBE_X}` as const;
export const GLOB_JS_TS_X = `**/*.${GLOB_JS_TS_X_EXTENSION}` as const;

export const GLOB_JSX_TSX_EXTENSION = `${GLOB_JS_TS_EXTENSION}x` as const;
export const GLOB_JSX_TSX = `**/*.${GLOB_JSX_TSX_EXTENSION}` as const;

/* Globs - TS */

export const GLOB_TS_EXTENSION = `${GLOB_MAYBE_COMMONJS_OR_ESM}ts` as const;
export const GLOB_TS = `**/*.${GLOB_TS_EXTENSION}` as const;

export const GLOB_TS_X_EXTENSION = `${GLOB_TS_EXTENSION}${GLOB_MAYBE_X}` as const;
export const GLOB_TS_X = `${GLOB_TS}${GLOB_MAYBE_X}` as const;

export const GLOB_TSX_EXTENSION = `${GLOB_TS_EXTENSION}x` as const;
export const GLOB_TSX = `${GLOB_TS}x` as const;

/* Globs - JS */

export const GLOB_JS_EXTENSION = `${GLOB_MAYBE_COMMONJS_OR_ESM}js` as const;
export const GLOB_JS = `**/*.${GLOB_JS_EXTENSION}` as const;

export const GLOB_JS_X_EXTENSION = `${GLOB_JS_EXTENSION}${GLOB_MAYBE_X}` as const;
export const GLOB_JS_X = `${GLOB_JS}${GLOB_MAYBE_X}` as const;

export const GLOB_JSX_EXTENSION = `${GLOB_JS_EXTENSION}x` as const;
export const GLOB_JSX = `${GLOB_JS}x` as const;

/* Globs - CommonJS/ESM */

export const GLOB_CJS = '**/*.cjs' as const;
export const GLOB_MJS = '**/*.mjs' as const;
export const GLOB_CTS = '**/*.cts' as const;
export const GLOB_MTS = '**/*.mts' as const;
export const GLOB_CJSX = '**/*.cjsx' as const;
export const GLOB_MJSX = '**/*.mjsx' as const;
export const GLOB_CTSX = '**/*.ctsx' as const;
export const GLOB_MTSX = '**/*.mtsx' as const;
export const GLOB_CJS_CTS = `**/*.c${GLOB_JS_TS_ONLY_EXTENSION}` as const;
export const GLOB_MJS_MTS = `**/*.m${GLOB_JS_TS_ONLY_EXTENSION}` as const;
export const GLOB_CJS_CTS_X = `**/*.c${GLOB_JS_TS_ONLY_EXTENSION}${GLOB_MAYBE_X}` as const;
export const GLOB_MJS_MTS_X = `**/*.m${GLOB_JS_TS_ONLY_EXTENSION}${GLOB_MAYBE_X}` as const;
export const GLOB_CJSX_CTSX = `**/*.c${GLOB_JS_TS_ONLY_EXTENSION}x` as const;
export const GLOB_MJSX_MTSX = `**/*.m${GLOB_JS_TS_ONLY_EXTENSION}x` as const;

/* Globs - JSON & extensions */

export const GLOB_JSON = '**/*.json' as const;
export const GLOB_JSONC = `${GLOB_JSON}c` as const;
export const GLOB_JSON5 = `${GLOB_JSON}5` as const;

/* Globs - YAML */

export const GLOB_YML_YAML_EXTENSION = 'y?(a)ml' as const;
export const GLOB_YML_YAML = `**/*.${GLOB_YML_YAML_EXTENSION}` as const;

export const GLOB_YML = '**/*.yml' as const;
export const GLOB_YAML = '**/*.yaml' as const;

/* Globs - HTML */

export const GLOB_HTML = '**/*.html' as const;
export const GLOB_HTM = '**/*.htm' as const;
export const GLOB_HTM_HTML_EXTENSION = 'htm?(l)' as const;
export const GLOB_HTM_HTML = `**/*.${GLOB_HTM_HTML_EXTENSION}` as const;

const GLOB_HTML_SCRIPT_BASENAME = '+([0-9])_script-+([0-9])';

/**
 * The virtual files the `htmlScripts` Config lints the `<script>` blocks of HTML (or other) files as:
 * `.js` for classic scripts, `.mjs` for module ones
 */
export const GLOB_HTML_SCRIPTS = `**/*.*/${GLOB_HTML_SCRIPT_BASENAME}.?(m)js` as const;
export const GLOB_HTML_CLASSIC_SCRIPTS = `**/*.*/${GLOB_HTML_SCRIPT_BASENAME}.js` as const;

/* Globs - other extensions */

export const GLOB_TOML = '**/*.toml' as const;

export const GLOB_SOML = '**/*.soml' as const;

export const GLOB_VUE = '**/*.vue' as const;

export const GLOB_CSS = '**/*.css' as const;

export const GLOB_SCSS = '**/*.scss' as const;

export const GLOB_ASTRO = '**/*.astro' as const;

export const GLOB_SVELTE = '**/*.svelte' as const;
export const GLOB_SVELTE_SCRIPT = '**/*.svelte.{js,ts}' as const;

export const GLOB_GRAPHQL = '**/*.{graphql,gql}' as const;

export const GLOB_FLOW = '**/*.flow' as const;

export const GLOB_EMBER_GLIMMER = '**/*.{gjs,gts}' as const;

export const GLOB_TSRX = '**/*.tsrx' as const;

export const GLOB_RIPPLE = '**/*.ripple' as const;

export const GLOB_CIVET = '**/*.civet' as const;

/** The virtual files a `.civet` file is compiled to before being linted */
export const GLOB_CIVET_COMPILED = `${GLOB_CIVET}/**/*.*` as const;

/* Globs - misc */

export const GLOB_PACKAGE_JSON = '**/package.json' as const;

export const GLOB_CONFIG_FILES = [
  `**/*.config.${GLOB_JS_TS_X_EXTENSION}`,
  `**/.*rc.${GLOB_JS_TS_X_EXTENSION}`,
] as const;

const GLOB_SUPPORTED_EXTENSIONS = [
  GLOB_JS_TS_X_EXTENSION,
  'vue',
  'json',
  'jsonc',
  'json5',
  GLOB_YML_YAML_EXTENSION,
  'toml',
  'soml',
  GLOB_HTM_HTML_EXTENSION,
  'css',
  'scss',
  'astro',
  'svelte',
  'graphql',
  'gql',
  'gjs',
  'gts',
].join(',');

/* Globs - Markdown & extensions */

export const GLOB_MARKDOWN = '**/*.md' as const;
export const GLOB_MARKDOWN_SUPPORTED_CODE_BLOCKS =
  `${GLOB_MARKDOWN}/**/*.{${GLOB_SUPPORTED_EXTENSIONS}}` as const;
export const GLOB_MARKDOWN_ALL_CODE_BLOCKS = `${GLOB_MARKDOWN}/**/*.*` as const;
export const GLOB_MARKDOWN_MD_X_CODE_BLOCKS = `${GLOB_MARKDOWN}/**/*.md?(x)` as const;

export const GLOB_MDX = '**/*.mdx' as const;
export const GLOB_MDX_SUPPORTED_CODE_BLOCKS =
  `${GLOB_MDX}/**/*.{${GLOB_SUPPORTED_EXTENSIONS}}` as const;
export const GLOB_MDX_ALL_CODE_BLOCKS = `${GLOB_MDX}/**/*.*` as const;
export const GLOB_MDX_MD_X_CODE_BLOCKS = `${GLOB_MDX}/**/*.md?(x)` as const;

export const GLOB_MD_X_CODE_BLOCKS = '**/*.md?(x)/**/*.*' as const;

/* Misc */

// Only files that are generated (or that nobody wants linted) and usually committed: the
// `gitignore` root option already covers the rest
// TODO research more generated files tools tell to commit
export const DEFAULT_GLOBAL_IGNORES = [
  '**/__snapshots__',
  '**/.yarn/{plugins,releases,sdks}',
] as const;

export const CHECKED_LODASH_METHODS = [
  'assign',
  'bind',
  'capitalize',
  'concat',
  'contains',
  'defaults',
  'drop',
  'every',
  'fill',
  'filter',
  'find',
  'first',
  'flatten',
  'get',
  'head',
  'includes',
  'join',
  'keys',
  'last',
  'map',
  'omit',
  'pairs',
  'reduce',
  'repeat',
  'replace',
  'reverse',
  'size',
  'slice',
  'some',
  'split',
  'throttle',
  'trim',
  'uniq',
  'values',
] as const;

const REMIX_AND_REACT_ROUTER_PACKAGES_SUFFIXES = ['react', 'node', 'serve', 'dev'] as const;
export const REMIX_PACKAGES = Object.freeze(
  REMIX_AND_REACT_ROUTER_PACKAGES_SUFFIXES.map(
    (packageName) => `@remix-run/${packageName}` as const,
  ),
);
export const REACT_ROUTER_PACKAGES = Object.freeze(
  REMIX_AND_REACT_ROUTER_PACKAGES_SUFFIXES.map(
    (packageName) => `@react-router/${packageName}` as const,
  ),
);

// `node-sass` is not here because it's deprecated and has order of magnitude less downloads
export const SASS_PACKAGES = ['sass', 'sass-embedded'] as const;

export const PACKAGES_TO_GET_INFO_FOR = [
  'prettier',
  'oxfmt',
  '@dprint/formatter',
  'typescript',
  'graphql',
  '@tanstack/query-core',
  '@tanstack/react-router',
  '@tanstack/solid-router',
  '@tanstack/react-start',
  '@tanstack/solid-start',
  'storybook',
  'tailwindcss',
  'stylelint',
  ...SASS_PACKAGES,
  'jest',
  'vitest',
  'ava',
  '@testing-library/dom',
  'cypress',
  'mocha',
  'turbo',
  'playwright',
  'qunit',
  'lodash',
  'lodash-es',
  ...CHECKED_LODASH_METHODS.map((method) => `lodash.${method}` as const),
  'rxjs',
  'nx',
  'zod',
  'zod-openapi',
  'unocss',
  'unhead',
  '@formatjs/icu-messageformat-parser',
  'i18next',
  'react-i18next',
  'next-i18next',
  'remix-i18next',
  'i18next-vue',
  '@docusaurus/core',
  'drizzle-orm',
  '@testing-library/jest-dom',
  'clsx',
  'mobx',
  'aws-cdk-lib',
  'remeda',
  '@ts-safeql/sql-tag',

  'astro',
  'vue',
  'react',
  'next',
  'expo',
  'svelte',
  'solid-js',
  '@angular/core',
  '@ngrx/store',
  // We don't need to check for the presence of `@builder.io/qwik-city` because
  // it requires `@builder.io/qwik` to be installed anyway
  '@builder.io/qwik',
  '@qwik.dev/core',
  'ember-source',
  'lit',
  '@nestjs/core',
  '@tsrx/core',
  'ripple',
  '@danielx/civet',
  'soml-lang',

  // Used in various configs to determine the default values of their options
  '@changesets/cli',
  'eslint',
  '@angular-eslint/eslint-plugin',
  '@angular-eslint/eslint-plugin-template',
  '@angular-eslint/template-parser',
  'helmet',
  'jest-extended',
  'marko',
  'nuxt',
  'pinia',
  'prettier-plugin-astro',
  'prettier-plugin-svelte',
  'prettier-plugin-toml',
  'react-dom',
  ...REMIX_PACKAGES,
  ...REACT_ROUTER_PACKAGES,
  'relay-runtime',
  'vite',
  'vue-i18n',
  'zod-compiler',
] as const;

/**
 * Packages that projects often get only as a dependency or a peer of another package, mapped to
 * those packages.
 * A package the project doesn't declare counts as installed if one of them is installed and depends
 * on it, so the ones listed here may themselves come through other packages
 */
export const PACKAGES_INSTALLED_THROUGH: Readonly<Record<string, readonly string[]>> = {
  '@angular-eslint/eslint-plugin': ['angular-eslint'],
  '@angular-eslint/eslint-plugin-template': ['angular-eslint'],
  '@angular-eslint/template-parser': ['angular-eslint'],
  '@angular/build': ['@angular-devkit/build-angular'],
  '@formatjs/icu-messageformat-parser': [
    '@formatjs/intl',
    'intl-messageformat',
    'react-intl',
    'vue-intl',
  ],
  '@tanstack/query-core': [
    '@tanstack/angular-query-experimental',
    '@tanstack/lit-query',
    '@tanstack/preact-query',
    '@tanstack/react-query',
    '@tanstack/solid-query',
    '@tanstack/svelte-query',
    '@tanstack/vue-query',
  ],
  '@testing-library/dom': [
    '@marko/testing-library',
    '@solidjs/testing-library',
    '@testing-library/angular',
    '@testing-library/preact',
    '@testing-library/react',
    '@testing-library/svelte',
    '@testing-library/user-event',
    '@testing-library/vue',
  ],
  '@tsrx/core': ['@tsrx/preact', '@tsrx/react', '@tsrx/solid', '@tsrx/vue'],
  '@unhead/vue': ['nuxt'],
  jest: ['react-scripts'],
  pinia: ['@pinia/nuxt'],
  playwright: ['@playwright/test'],
  'relay-runtime': ['react-relay'],
  sass: ['@angular/build'],
  tailwindcss: [
    '@nuxt/ui',
    '@nuxtjs/tailwindcss',
    '@tailwindcss/cli',
    '@tailwindcss/postcss',
    '@tailwindcss/vite',
  ],
  unhead: ['@unhead/angular', '@unhead/react', '@unhead/solid-js', '@unhead/svelte', '@unhead/vue'],
  unocss: ['@unocss/nuxt'],
  // Only the `react` config checks it, so only the frameworks running React on Vite are listed
  vite: ['astro'],
  vue: ['nuxt', 'vitepress'],
  'vue-i18n': ['@nuxtjs/i18n'],
};

import ourPackageJson from '../package.json' with {type: 'json'};
// See https://github.com/typescript-eslint/typescript-eslint/issues/8721
import type {Tagged} from './types';
import {omit} from './utils';

export const OPTIONAL_PEER_DEPENDENCIES = omit(ourPackageJson.peerDependencies, ['eslint']);

/* Error levels */

export const ERROR = 2 as Tagged<2, 'error'>;
export const WARNING = 1 as Tagged<1, 'warning'>;
export const OFF = 0 as Tagged<0, 'off'>;

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

/* Globs - other extensions */

export const GLOB_TOML = '**/*.toml' as const;

export const GLOB_VUE = '**/*.vue' as const;

export const GLOB_CSS = '**/*.css' as const;

export const GLOB_ASTRO = '**/*.astro' as const;

export const GLOB_SVELTE = '**/*.svelte' as const;

export const GLOB_GRAPHQL = '**/*.{graphql,gql}' as const;

export const GLOB_FLOW = '**/*.flow' as const;

export const GLOB_EMBER_GLIMMER = '**/*.{gjs,gts}' as const;

export const GLOB_TSRX = '**/*.tsrx' as const;

export const GLOB_RIPPLE = '**/*.ripple' as const;

/* Globs - misc */

export const GLOB_PACKAGE_JSON = '**/package.json' as const;

export const GLOB_CONFIG_FILES = [
  `**/*.config.${GLOB_JS_TS_X_EXTENSION}` as const,
  `**/.*rc.${GLOB_JS_TS_X_EXTENSION}` as const,
];

const GLOB_SUPPORTED_EXTENSIONS = [
  GLOB_JS_TS_X_EXTENSION,
  'vue',
  'json',
  'jsonc',
  'json5',
  GLOB_YML_YAML_EXTENSION,
  'toml',
  GLOB_HTM_HTML_EXTENSION,
  'css',
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

export const GLOB_MDX = '**/*.mdx' as const;
export const GLOB_MDX_SUPPORTED_CODE_BLOCKS =
  `${GLOB_MDX}/**/*.{${GLOB_SUPPORTED_EXTENSIONS}}` as const;
export const GLOB_MDX_ALL_CODE_BLOCKS = `${GLOB_MDX}/**/*.*` as const;

export const GLOB_MD_X_CODE_BLOCKS = '**/*.md?(x)/**/*.*' as const;

/* Misc */

export const DEFAULT_GLOBAL_IGNORES = ['**/dist'] as const;

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

export const PACKAGES_TO_GET_INFO_FOR = [
  'prettier',
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
  'unocss',
  '@formatjs/icu-messageformat-parser',
  '@docusaurus/core',
  '@testing-library/jest-dom',
  'clsx',

  'astro',
  'vue',
  'react',
  'next',
  'svelte',
  'solid-js',
  '@angular/core',
  // We don't need to check for the presence of `@builder.io/qwik-city` because
  // it requires `@builder.io/qwik` to be installed anyway
  '@builder.io/qwik',
  '@qwik.dev/core',
  'ember-source',
  'lit',
  '@nestjs/core',
  'ripple',
] as const;

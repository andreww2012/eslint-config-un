// See https://github.com/typescript-eslint/typescript-eslint/issues/8721
import type {Tagged} from './types';

/* Error levels */

export const ERROR = 2 as Tagged<2, 'error'>;
export const WARNING = 1 as Tagged<1, 'warning'>;
export const OFF = 0 as Tagged<0, 'off'>;

export type RuleSeverity = typeof ERROR | typeof WARNING | typeof OFF;

/* Globs */

export const GLOB_JS_TS_EXTENSION = '?([cm])[jt]s' as const;
export const GLOB_JS_TS = `**/*.${GLOB_JS_TS_EXTENSION}` as const;

export const GLOB_JS_TS_X_EXTENSION = `${GLOB_JS_TS_EXTENSION}?(x)` as const;
export const GLOB_JS_TS_X = `**/*.${GLOB_JS_TS_X_EXTENSION}` as const;

export const GLOB_JS_TS_X_ONLY_EXTENSION = `${GLOB_JS_TS_EXTENSION}x` as const;
export const GLOB_JS_TS_X_ONLY = `**/*.${GLOB_JS_TS_X_ONLY_EXTENSION}` as const;

export const GLOB_CONFIG_FILES = [
  `**/*.config.${GLOB_JS_TS_X_EXTENSION}` as const,
  `**/.*rc.${GLOB_JS_TS_X_EXTENSION}` as const,
];

export const GLOB_TS_EXTENSION = '?([cm])ts' as const;
export const GLOB_TS_X_EXTENSION = `${GLOB_TS_EXTENSION}?(x)` as const;
export const GLOB_TS = `**/*.${GLOB_TS_EXTENSION}` as const;
export const GLOB_TSX = `${GLOB_TS}?(x)` as const;

export const GLOB_VUE = '**/*.vue' as const;

export const GLOB_JSON = '**/*.json' as const;
export const GLOB_JSONC = '**/*.jsonc' as const;
export const GLOB_JSON5 = '**/*.json5' as const;

export const GLOB_YAML_EXTENSION = 'y?(a)ml' as const;
export const GLOB_YAML = `**/*.${GLOB_YAML_EXTENSION}` as const;

export const GLOB_TOML = '**/*.toml' as const;

export const GLOB_HTML = '**/*.html' as const;
export const GLOB_HTM = '**/*.htm' as const;
export const GLOB_HTML_ALL = [GLOB_HTML, GLOB_HTM];

export const GLOB_CSS = '**/*.css' as const;

export const GLOB_PACKAGE_JSON = '**/package.json' as const;

export const GLOB_ASTRO = '**/*.astro' as const;

export const GLOB_SVELTE = '**/*.svelte' as const;

export const GLOB_SUPPORTED_EXTENSIONS = [
  GLOB_JS_TS_X_EXTENSION,
  'vue',
  'json',
  'jsonc',
  'json5',
  GLOB_YAML_EXTENSION,
  'toml',
  'html',
  'css',
  'astro',
  'svelte',
].join(',');
export const GLOB_MARKDOWN = '**/*.md' as const;
export const GLOB_MARKDOWN_SUPPORTED_CODE_BLOCKS =
  `${GLOB_MARKDOWN}/**/*.{${GLOB_SUPPORTED_EXTENSIONS}}` as const;
export const GLOB_MARKDOWN_ALL_CODE_BLOCKS = `${GLOB_MARKDOWN}/**/*.*` as const;

/* Misc */

export const DEFAULT_GLOBAL_IGNORES = ['**/dist'] as const;

export const PACKAGES_TO_GET_INFO_FOR = [
  'typescript',

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

  'jest',
  'vitest',

  'tailwindcss',
] as const;

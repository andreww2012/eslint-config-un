// See https://github.com/typescript-eslint/typescript-eslint/issues/8721
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import type {Tagged} from 'type-fest';

/* Error levels */

export const ERROR = 2 as Tagged<2, 'error'>;
export const WARNING = 1 as Tagged<1, 'warning'>;
export const OFF = 0 as Tagged<0, 'off'>;

export type RuleSeverity = typeof ERROR | typeof WARNING | typeof OFF;

/* Globs */

export const GLOB_JS_TS_EXTENSION = '?([cm])[jt]s?(x)' as const;
export const GLOB_JS_TS = `**/*.${GLOB_JS_TS_EXTENSION}` as const;

export const GLOB_CONFIG_FILES = [
  `**/*.config.${GLOB_JS_TS_EXTENSION}` as const,
  `**/.*rc.${GLOB_JS_TS_EXTENSION}` as const,
];

export const GLOB_TS = '**/*.?([cm])ts' as const;
export const GLOB_TSX = `${GLOB_TS}x` as const;

export const GLOB_VUE = '**/*.vue' as const;

export const GLOB_JSON = '**/*.json' as const;
export const GLOB_JSONC = '**/*.jsonc' as const;
export const GLOB_JSON5 = '**/*.json5' as const;

export const GLOB_YAML = '**/*.y?(a)ml' as const;

export const GLOB_TOML = '**/*.toml' as const;

export const GLOB_PACKAGE_JSON = '**/package.json' as const;


/* Misc */

export const DEFAULT_GLOBAL_IGNORES = ['**/dist'] as const;

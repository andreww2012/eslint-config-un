import type {Tagged} from 'type-fest';

/* Error levels */

export const ERROR = 2 as Tagged<2, 'error'>;
export const WARNING = 1 as Tagged<1, 'warning'>;
export const OFF = 0 as Tagged<0, 'off'>;

export type RuleSeverity = typeof ERROR | typeof WARNING | typeof OFF;

/* Globs */

export const GLOB_JS_TS_EXTENSION = '?([cm])[jt]s?(x)';
export const GLOB_JS_TS = `**/*.${GLOB_JS_TS_EXTENSION}`;

export const GLOB_CONFIG_FILES = [
  `**/*.config.${GLOB_JS_TS_EXTENSION}`,
  `**/.*rc.${GLOB_JS_TS_EXTENSION}`,
];

export const GLOB_TS = '**/*.?([cm])ts';
export const GLOB_TSX = `${GLOB_TS}x`;

export const GLOB_VUE = '**/*.vue';

export const GLOB_JSON = '**/*.json';
export const GLOB_JSONC = '**/*.jsonc';
export const GLOB_JSON5 = '**/*.json5';

/* Error levels */

// These type assertions actually make a difference
// TODO investigate exactly why this happens and what can be done about this rule
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
export const ERROR = 2 as const;
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
export const WARNING = 1 as const;
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
export const OFF = 0 as const;

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

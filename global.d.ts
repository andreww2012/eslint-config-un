/* ts-reset */

// ⚠️ If `moduleResolution` in used tsconfig is NOT set to either `NodeNext` or `Bundler`,
// add `dist/` after `ts-reset/` part (ONLY for *individual imports*):
// https://github.com/total-typescript/ts-reset/issues/36#issuecomment-1442827491

// import '@total-typescript/ts-reset/array-includes';
// import '@total-typescript/ts-reset/array-index-of';
// import '@total-typescript/ts-reset/fetch';
import '@total-typescript/ts-reset/filter-boolean'; // or: (see ^)
import '@total-typescript/ts-reset/dist/filter-boolean';
// import '@total-typescript/ts-reset/is-array';
// import '@total-typescript/ts-reset/json-parse';
// import '@total-typescript/ts-reset/map-has';
// import '@total-typescript/ts-reset/storage';
// import '@total-typescript/ts-reset/set-has';

// import '@total-typescript/ts-reset';

/* global types */

declare global {
  type Nullable<T> = T | null | undefined;

  type Prettify<T> = {
    [K in keyof T]: Prettify<T[K]>;
  } & {};

  type PrettifyShallow<T> = {
    [K in keyof T]: T[K];
  } & {};
}

export type PickKeysStartingWith<O, T extends string> = {
  [K in keyof O as K extends `${T}${string}` ? K : never]: O[K];
};
export type PickKeysNotStartingWith<O, T extends string> = {
  [K in keyof O as K extends `${T}${string}` ? never : K]: O[K];
};

export type RemovePrefix<
  T extends string,
  Prefix extends string,
> = T extends `${Prefix}${infer Rest}` ? Rest : T;

export type FalsyValue = false | 0 | 0n | '' | null | undefined;

export type PrettifyShallow<T> = {
  [K in keyof T]: T[K];
} & {};
export type Prettify<T> = {
  [K in keyof T]: Prettify<T[K]>;
} & {};

export type {
  Tagged,
  ReadonlyDeep,
  SetRequired,
  Subtract,
  Promisable,
  ValueOf,
  OmitIndexSignature,
  DistributedPick,
  UnionToIntersection,
} from 'type-fest';

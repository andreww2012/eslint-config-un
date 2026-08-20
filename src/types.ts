export type PickKeysStartingWith<O, T extends string> = {
  [K in keyof O as K extends `${T}${string}` ? K : never]: O[K];
};
export type PickKeysNotStartingWith<O, T extends string> = {
  [K in keyof O as K extends `${T}${string}` ? never : K]: O[K];
};

export type {
  Branded,
  ConditionalKeys,
  EmptyObject,
  Falsy,
  MaybePromise,
  MergeObjects,
  NonEmptyString,
  NonEmptyTuple,
  Nullable,
  ObjectValues,
  OmitIndexSignature,
  OmitStrict,
  PartialDeep,
  PickDistributed,
  Prettify,
  PrettifyDeep,
  ReadonlyDeep,
  RequireExactlyOne,
  SetFieldType,
  SetRequired,
  Subtract,
  ToCamelCase,
  UnionToIntersection,
} from '@andreww2012/unutils';

export type {PackageJson} from 'type-fest';

export type PickKeysStartingWith<O, T extends string> = {
  [K in keyof O as K extends `${T}${string}` ? K : never]: O[K];
};
export type PickKeysNotStartingWith<O, T extends string> = {
  [K in keyof O as K extends `${T}${string}` ? never : K]: O[K];
};

export type FalsyValue = false | 0 | 0n | '' | null | undefined;

export type {
  ConditionalKeys,
  DistributedPick,
  EmptyObject,
  IsOptional,
  IsUnknown,
  NonEmptyString,
  NonEmptyTuple,
  PartialDeep,
  Promisable,
  Simplify as Prettify,
  SimplifyDeep as PrettifyDeep,
  ReadonlyDeep,
  RequireExactlyOne,
  SetRequired,
  Writable as StripReadonly,
  Subtract,
  ValueOf as ObjectValues,
  OmitIndexSignature,
  Except as OmitStrict,
  SetFieldType,
  Tagged,
  UnionToIntersection,
} from 'type-fest';

export type {PackageJson} from 'zod-package-json';

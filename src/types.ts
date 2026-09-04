export type PickKeysStartingWith<O, T extends string> = {
  [K in keyof O as K extends `${T}${string}` ? K : never]: O[K];
};
export type PickKeysNotStartingWith<O, T extends string> = {
  [K in keyof O as K extends `${T}${string}` ? never : K]: O[K];
};

/** Only a subset of fields we actually read; `package.json` has many more */
export interface PackageJson {
  name?: string;
  version?: string;
  engines?: {node?: string};
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, {optional?: boolean}>;
  repository?: string | {type?: string; url?: string};
}

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

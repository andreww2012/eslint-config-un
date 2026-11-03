import type {Paths} from 'utilery';

export type PickKeysStartingWith<O, T extends string> = {
  [K in keyof O as K extends `${T}${string}` ? K : never]: O[K];
};
export type PickKeysNotStartingWith<O, T extends string> = {
  [K in keyof O as K extends `${T}${string}` ? never : K]: O[K];
};

type PathSegmentInBracketNotation<
  Key extends string,
  Prefix extends string,
> = Key extends `${string}-${string}` ? `['${Key}']` : Prefix extends '' ? Key : `.${Key}`;

type ToBracketNotation<
  Path extends string,
  Prefix extends string = '',
> = Path extends `${infer Key}.${infer Rest}`
  ? ToBracketNotation<Rest, `${Prefix}${PathSegmentInBracketNotation<Key, Prefix>}`>
  : `${Prefix}${PathSegmentInBracketNotation<Path, Prefix>}`;

/**
 * `Paths`, but written like in code, with the keys containing dashes in brackets:
 * `plugins['better-tailwindcss'].settings`, not `plugins.better-tailwindcss.settings`
 */
export type PathsBracketed<T> = ToBracketNotation<`${Paths<T>}`>;

/** Only a subset of fields we actually read; `package.json` has many more */
export interface PackageJson {
  name?: string;
  version?: string;
  engines?: {node?: string};
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, {optional?: boolean}>;
  repository?: string | {type?: string; url?: string};
  workspaces?: string[] | {packages?: string[]};
}

export type {
  Branded,
  ConditionalKeys,
  EmptyObject,
  Falsy,
  MaybePromise,
  MergeObjects,
  Ms,
  NonEmptyString,
  NonEmptyTuple,
  Nullable,
  ObjectValues,
  OmitIndexSignature,
  OmitStrict,
  PartialDeep,
  Prettify,
  PrettifyDeep,
  ReadonlyDeep,
  RequireExactlyOne,
  SetFieldType,
  SetRequired,
  ToCamelCase,
  UnionToIntersection,
} from 'utilery';

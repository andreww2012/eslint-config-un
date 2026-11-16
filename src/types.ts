import type {Paths} from 'utilery';

export type PickKeysStartingWith<Source, Prefix extends string> = {
  [Key in keyof Source as Key extends `${Prefix}${string}` ? Key : never]: Source[Key];
};
export type PickKeysNotStartingWith<Source, Prefix extends string> = {
  [Key in keyof Source as Key extends `${Prefix}${string}` ? never : Key]: Source[Key];
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
export type PathsBracketed<Value> = ToBracketNotation<`${Paths<Value>}`>;

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
  ReturnTypeAwaited,
  SetFieldType,
  SetRequired,
  ToCamelCase,
  UnionToIntersection,
} from 'utilery';

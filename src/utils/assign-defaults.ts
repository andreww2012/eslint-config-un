import type {Prettify} from '../types';
// eslint-disable-next-line import/no-cycle
import {isObject} from '../utils';

// `any` (not `unknown`) is intentional here: only `Record<PropertyKey, any>` is
// assignment-compatible with regular object/interface types that lack an
// explicit index signature (`Foo extends Record<string, unknown>` is `false`,
// but `Foo extends Record<string, any>` is `true`). Without `any` the
// `Extract<S, Input>` filter below collapses to `never` for user-defined
// option interfaces and the merged result loses all of `S`'s keys.
// eslint-disable-next-line ts/no-explicit-any
type AssignDefaultsInput = Record<PropertyKey, any>;

// TODO void required?
// eslint-disable-next-line ts/no-invalid-void-type
type NullishOrVoid = null | undefined | void;

type SourceObjectShape<S> = Extract<Exclude<S, readonly unknown[]>, AssignDefaultsInput>;

type SourceMaybeAbsent<S> = [Exclude<S, AssignDefaultsInput>] extends [never] ? false : true;

type MutableShallow<T> = T extends readonly (infer U)[] ? U[] : T;

type ValidateDefaults<S, D> = [SourceObjectShape<S>] extends [never]
  ? unknown
  : (D extends Partial<SourceObjectShape<S>> ? unknown : Partial<SourceObjectShape<S>>) &
      Record<Exclude<keyof D, keyof SourceObjectShape<S>>, never>;

type MergeValue<SValue, DValue> = [Extract<SValue, NullishOrVoid>] extends [never]
  ? SValue
  : [MutableShallow<Exclude<DValue, NullishOrVoid>>] extends [Exclude<SValue, NullishOrVoid>]
    ? // `DValue` is structurally a subset of `SValue` (e.g. `{}` default for an object option,
      // or `never[]` default for an array option) — drop it so accessing keys on the result
      // doesn't have to deal with the empty-literal arm of the union.
      Exclude<SValue, NullishOrVoid>
    : Exclude<SValue, NullishOrVoid> | MutableShallow<Exclude<DValue, NullishOrVoid>>;

type MergeShallow<S extends AssignDefaultsInput, D extends AssignDefaultsInput> = S extends D
  ? S
  : // eslint-disable-next-line ts/no-restricted-types
    Omit<D, keyof S & keyof D> &
      // eslint-disable-next-line ts/no-restricted-types
      Omit<S, keyof S & keyof D> & {
        -readonly [K in keyof S & keyof D]: MergeValue<S[K], D[K]>;
      };

/**
 * Shallow-merge user-provided options with defaults: each defined top-level key
 * in `source` replaces the corresponding key in `defaults` outright (no
 * recursion into nested objects), `null`/`undefined` values in `source` fall
 * back to the default, and arrays from `source` are shallow-cloned to avoid
 * aliasing user input.
 *
 * `defaults` is constrained to be a partial of `source`'s object shape, so
 * call sites no longer need a `satisfies SomeOptions` annotation to type-check
 * the defaults object.
 */
export const assignDefaults = <S, const D extends AssignDefaultsInput>(
  source: S,
  defaults: D & ValidateDefaults<S, D>,
) => {
  const result: Record<PropertyKey, unknown> = {...defaults};

  if (isObject(source)) {
    // eslint-disable-next-line unicorn/prefer-object-iterable-methods -- see https://github.com/sindresorhus/eslint-plugin-unicorn/issues/3314
    for (const key of Object.keys(source)) {
      if (key === '__proto__' || key === 'constructor') {
        continue;
      }

      const value = (source as Record<string, unknown>)[key];
      if (value == null) {
        continue;
      }

      result[key] = Array.isArray(value) ? [...(value as unknown[])] : value;
    }
  }

  return result as Prettify<
    [SourceObjectShape<S>] extends [never]
      ? D
      : MergeShallow<
          SourceMaybeAbsent<S> extends true ? Partial<SourceObjectShape<S>> : SourceObjectShape<S>,
          D
        >
  >;
};

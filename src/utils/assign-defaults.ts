import type {Prettify} from '../types';
import {castToSafe, isObject} from '../utils';

// `any` (not `unknown`) is intentional here: only `Record<PropertyKey, any>` is
// assignment-compatible with regular object/interface types that lack an
// explicit index signature (`Foo extends Record<string, unknown>` is `false`,
// but `Foo extends Record<string, any>` is `true`). Without `any` the
// `Extract<Source, Input>` filter below collapses to `never` for user-defined
// option interfaces and the merged result loses all of `Source`'s keys
type AssignDefaultsInput = Record<
  PropertyKey,
  // eslint-disable-next-line ts/no-explicit-any -- Need to use for assignability
  any
>;

type SourceObjectShape<Source> = Extract<Exclude<Source, readonly unknown[]>, AssignDefaultsInput>;

type ValidateDefaults<Source, Defaults> = [SourceObjectShape<Source>] extends [never]
  ? unknown
  : (Defaults extends Partial<SourceObjectShape<Source>>
      ? unknown
      : Partial<SourceObjectShape<Source>>) &
      Record<Exclude<keyof Defaults, keyof SourceObjectShape<Source>>, never>;

/**
 * Shallow-merge user-provided options with defaults: each defined top-level key in `source`
 * replaces the corresponding key in `defaults` outright (no recursion into nested objects),
 * `null`/`undefined` values in `source` fall back to the default, and arrays from `source` are
 * shallow-cloned to avoid aliasing user input.
 *
 * `defaults` is constrained to be a partial of `source`'s object shape, so call sites no longer
 * need a `satisfies SomeOptions` annotation to type-check the defaults object
 */
export const assignDefaults = <Source, const Defaults extends AssignDefaultsInput>(
  source: Source,
  defaults: Defaults & ValidateDefaults<Source, Defaults>,
) => {
  // TODO void required?
  // eslint-disable-next-line ts/no-invalid-void-type -- Functions returning void can supply an absent source
  type NullishOrVoid = null | undefined | void;

  type MutableShallow<Value> = Value extends readonly (infer Item)[] ? Item[] : Value;

  type MergeValue<SourceValue, DefaultsValue> = [Extract<SourceValue, NullishOrVoid>] extends [
    never,
  ]
    ? SourceValue
    : [MutableShallow<Exclude<DefaultsValue, NullishOrVoid>>] extends [
          Exclude<SourceValue, NullishOrVoid>,
        ]
      ? // `DefaultsValue` is structurally a subset of `SourceValue` (e.g. `{}` default for an
        // object option, or `never[]` default for an array option); without it, code that reads
        // keys of the result doesn't have to handle the empty-literal arm of the union
        Exclude<SourceValue, NullishOrVoid>
      : Exclude<SourceValue, NullishOrVoid> | MutableShallow<Exclude<DefaultsValue, NullishOrVoid>>;

  type SourceMaybeAbsent = [Exclude<Source, AssignDefaultsInput>] extends [never] ? false : true;

  type MergeShallow<
    SourceShape extends AssignDefaultsInput,
    DefaultsShape extends AssignDefaultsInput,
  > = SourceShape extends DefaultsShape
    ? SourceShape
    : // eslint-disable-next-line ts/no-restricted-types -- Keep omission non-distributive so unions expose only their shared properties
      Omit<DefaultsShape, keyof SourceShape & keyof DefaultsShape> &
        // eslint-disable-next-line ts/no-restricted-types -- Keep omission non-distributive so unions expose only their shared properties
        Omit<SourceShape, keyof SourceShape & keyof DefaultsShape> & {
          -readonly [Key in keyof SourceShape & keyof DefaultsShape]: MergeValue<
            SourceShape[Key],
            DefaultsShape[Key]
          >;
        };

  const result: Record<PropertyKey, unknown> = {...defaults};

  if (isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (key === '__proto__' || key === 'constructor') {
        return;
      }

      const value: unknown = Reflect.get(source, key);
      if (value != null) {
        result[key] = Array.isArray(value) ? [...castToSafe<readonly unknown[]>(value)] : value;
      }
    });
  }

  // eslint-disable-next-line un/no-type-assertion -- The loop above builds this very shape
  return result as Prettify<
    [SourceObjectShape<Source>] extends [never]
      ? Defaults
      : MergeShallow<
          SourceMaybeAbsent extends true
            ? Partial<SourceObjectShape<Source>>
            : SourceObjectShape<Source>,
          Defaults
        >
  >;
};

import type {Falsy} from '../types';

export type ArrayOrBooleanRecord<
  T extends PropertyKey = string,
  Mode extends 'boolean' | 'booleanOrMessage' | 'message' = 'boolean',
> =
  | T[]
  | Partial<
      Record<
        T,
        Mode extends 'boolean'
          ? boolean
          : Mode extends 'booleanOrMessage'
            ? boolean | string
            : string
      >
    >;

// `Array.isArray` does not narrow read-only arrays
const isReadonlyArray = (value: unknown): value is readonly unknown[] => Array.isArray(value);

/**
 * Applies the given lists in order, where the object notation additionally allows removing an entry
 * that an earlier list added by setting its value to a falsy value
 */
export const mergeArrayOrBooleanRecords = (
  ...sources: (ArrayOrBooleanRecord | readonly string[] | Falsy)[]
): string[] => {
  const result = new Set<string>();

  sources.forEach((source) => {
    if (source) {
      (isReadonlyArray(source) ? source : Object.entries(source)).forEach((entry) => {
        const isEntryPlainKey = typeof entry === 'string';

        const key = isEntryPlainKey ? entry : entry[0];
        const isEnabled = isEntryPlainKey || entry[1];
        if (isEnabled) {
          result.add(key);
        } else {
          result.delete(key);
        }
      });
    }
  });

  return [...result];
};

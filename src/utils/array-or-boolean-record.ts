import type {Falsy} from '../types';
import {isArray} from '../utils';

export type ArrayOrBooleanRecord<
  Key extends PropertyKey = string,
  Mode extends 'boolean' | 'booleanOrMessage' | 'message' = 'boolean',
> =
  | Key[]
  | Partial<
      Record<
        Key,
        Mode extends 'boolean'
          ? boolean
          : Mode extends 'booleanOrMessage'
            ? boolean | string
            : string
      >
    >;

/**
 * Applies the given lists in order, where the object notation additionally allows removing an entry
 * that an earlier list added by setting its value to a falsy value
 */
export const mergeArrayOrBooleanRecords = (
  ...sources: readonly (ArrayOrBooleanRecord | readonly string[] | Falsy)[]
): string[] => {
  const result = new Set<string>();

  sources.forEach((source) => {
    if (source) {
      (isArray(source) ? source : Object.entries(source)).forEach((entry) => {
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

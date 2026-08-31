import path from 'node:path';
import url from 'node:url';
import {
  assignDefaults,
  findArrayInversions,
  getKeysOfTruthyValues,
  isNonEmptyArray,
  readAndParseJson,
  readFileSafe,
} from '../src/utils';

// `fetchPackageInfo` is replaced by a mock in `test/setup.ts`, so the real implementation
// has to be imported explicitly
const {fetchPackageInfo} = await vi.importActual<typeof import('../src/utils')>('../src/utils');

const FIXTURES = {
  plainObjectJson: 'plain-object.json',
} as const;

const fixturePath = (fixtureName: string) =>
  path.join(import.meta.dirname, 'fixtures', fixtureName);

const MISSING_FILE_PATH = fixturePath('this-file-does-not-exist.json');

const compareStrings = (a: string, b: string) => a.localeCompare(b);

// Please note: the pairs are harvested from whatever comparisons `Array#sort` happens to make,
// and those may differ between V8 versions, so only engine-independent invariants are asserted
describe('findArrayInversions', () => {
  it('returns no pairs for an empty array', () => {
    expect(findArrayInversions([], compareStrings)).toStrictEqual([]);
  });

  it('returns no pairs for a single-element array', () => {
    expect(findArrayInversions(['a'], compareStrings)).toStrictEqual([]);
  });

  it('returns no pairs for an already sorted array', () => {
    expect(findArrayInversions(['a', 'b', 'c'], compareStrings)).toStrictEqual([]);
  });

  it('returns the pair of two elements in the wrong order', () => {
    expect(findArrayInversions(['b', 'a'], compareStrings)).toStrictEqual([['b', 'a']]);
  });

  it('only reports pairs the out-of-order element participates in', () => {
    const inversions = findArrayInversions(['c', 'a', 'b'], compareStrings);

    expect(inversions.length).toBeGreaterThan(0);

    inversions.forEach(([left, right]) => {
      expect(left).toBe('c');
      expect(['a', 'b']).toContain(right);
    });
  });

  it('reports every element of a reversed array as out of order', () => {
    const reversed = ['d', 'c', 'b', 'a'];
    const inversions = findArrayInversions(reversed, compareStrings);

    inversions.forEach(([left, right]) => {
      expect(compareStrings(left, right)).toBe(1);
    });

    expect(new Set(inversions.flat())).toStrictEqual(new Set(reversed));
  });

  it('only returns pairs whose elements are really out of order', () => {
    const inversions = findArrayInversions(
      ['f', 'b', 'g', 'a', 'e', 'c', 'h', 'd'],
      compareStrings,
    );

    expect(inversions.length).toBeGreaterThan(0);

    inversions.forEach(([left, right]) => {
      expect(compareStrings(left, right)).toBe(1);
    });
  });

  // This order makes V8's TimSort compare the inverted pair (g, a) twice, so the dedupe guard is
  // actually reached rather than merely present
  it('does not report the same pair twice', () => {
    const inversions = findArrayInversions(
      ['b', 'g', 'a', 'd', 'f', 'c', 'e', 'h'],
      compareStrings,
    );

    expect(inversions).toHaveLength(new Set(inversions.map((pair) => pair.join('|'))).size);
  });

  it('groups the pairs by their left element when `group` is set', () => {
    const rightElements = findArrayInversions(['c', 'a', 'b'], compareStrings).map(
      ([, right]) => right,
    );

    expect(findArrayInversions(['c', 'a', 'b'], compareStrings, true)).toStrictEqual(
      new Map([['c', rightElements]]),
    );
  });

  it('returns an empty map for a sorted array when `group` is set', () => {
    expect(findArrayInversions(['a', 'b'], compareStrings, true)).toStrictEqual(new Map());
  });
});

describe('isNonEmptyArray', () => {
  it('returns `true` for an array with at least one element', () => {
    expect(isNonEmptyArray(['a'])).toBe(true);
  });

  it('returns `false` for an empty array', () => {
    expect(isNonEmptyArray([])).toBe(false);
  });

  it('returns `false` for `undefined`', () => {
    const value: string[] | undefined = undefined;

    expect(isNonEmptyArray(value)).toBe(false);
  });

  it('returns `false` for `null`', () => {
    expect(isNonEmptyArray(null)).toBe(false);
  });
});

describe('readFileSafe', () => {
  it('reads the file contents as a string', async () => {
    await expect(readFileSafe(fixturePath(FIXTURES.plainObjectJson))).resolves.toBeString();
  });

  it('reads the file contents as a buffer when `asBinary` is set', async () => {
    expect(Buffer.isBuffer(await readFileSafe(fixturePath(FIXTURES.plainObjectJson), true))).toBe(
      true,
    );
  });

  it('returns `null` when the file does not exist', async () => {
    await expect(readFileSafe(MISSING_FILE_PATH)).resolves.toBeNull();
  });

  it('rethrows errors other than the file being absent', async () => {
    await expect(readFileSafe(path.join(import.meta.dirname, 'fixtures'))).rejects.toThrow();
  });
});

describe('readAndParseJson', () => {
  it('parses the contents of the file at the given path', async () => {
    await expect(readAndParseJson(fixturePath(FIXTURES.plainObjectJson))).resolves.toBeObject();
  });

  it('accepts a `URL`', async () => {
    await expect(
      readAndParseJson(url.pathToFileURL(fixturePath(FIXTURES.plainObjectJson))),
    ).resolves.toBeObject();
  });

  it('returns `null` when no path is provided', async () => {
    await expect(readAndParseJson(undefined)).resolves.toBeNull();
  });

  it('returns `null` when the file does not exist', async () => {
    await expect(readAndParseJson(MISSING_FILE_PATH)).resolves.toBeNull();
  });

  // `jsonParseSafe` falls back to the input it was given, so the raw contents come back
  it('returns the raw contents when they are not valid JSON', async () => {
    await expect(
      readAndParseJson(path.join(import.meta.dirname, 'setup.ts')),
    ).resolves.toBeString();
  });
});

describe('fetchPackageInfo', () => {
  it('returns `null` for a package that cannot be resolved', async () => {
    await expect(fetchPackageInfo('this-package-is-not-installed')).resolves.toBeNull();
  });

  it('returns the `package.json` contents and the parsed versions of an installed package', async () => {
    const packageInfo = await fetchPackageInfo('verkit');

    expect(packageInfo?.info.name).toBe('verkit');
    expect(packageInfo?.versions.full).toBeString();
    expect(packageInfo?.versions.major).toBeNumber();
    expect(packageInfo?.versions.majorAndMinor).toBeNumber();
  });

  it('resolves a scoped package', async () => {
    expect((await fetchPackageInfo('@antfu/utils'))?.info.name).toBe('@antfu/utils');
  });
});

describe('getKeysOfTruthyValues', () => {
  describe('array input', () => {
    it('returns the array as-is', () => {
      const ARRAY = ['a', 'b'];

      expect(getKeysOfTruthyValues(ARRAY)).toBe(ARRAY);
    });

    it('returns the array as-is in `nonEmptyArray` mode when it is not empty', () => {
      expect(getKeysOfTruthyValues(['a'], 'nonEmptyArray')).toStrictEqual(['a']);
    });

    it('returns `undefined` for an empty array in `nonEmptyArray` mode', () => {
      expect(getKeysOfTruthyValues([], 'nonEmptyArray')).toBeUndefined();
    });

    it('converts the array to a record in `object` mode', () => {
      expect(getKeysOfTruthyValues(['a', 'b'], 'object')).toStrictEqual({a: true, b: true});
    });
  });

  describe('object input', () => {
    it('returns the keys of truthy values only', () => {
      expect(getKeysOfTruthyValues({a: true, b: false, c: 'yes'})).toStrictEqual(['a', 'c']);
    });

    it('returns the truthy keys in `nonEmptyArray` mode when there is at least one', () => {
      expect(getKeysOfTruthyValues({a: true, b: false}, 'nonEmptyArray')).toStrictEqual(['a']);
    });

    it('returns `undefined` when no value is truthy in `nonEmptyArray` mode', () => {
      expect(getKeysOfTruthyValues({a: false}, 'nonEmptyArray')).toBeUndefined();
    });

    it('returns a record of the truthy keys in `object` mode', () => {
      expect(getKeysOfTruthyValues({a: true, b: false, c: 'yes'}, 'object')).toStrictEqual({
        a: true,
        c: 'yes',
      });
    });
  });

  describe('nullish input', () => {
    it('returns no keys for `undefined`', () => {
      expect(getKeysOfTruthyValues(undefined)).toStrictEqual([]);
    });

    it('returns no keys for `null`', () => {
      expect(getKeysOfTruthyValues(null)).toStrictEqual([]);
    });

    it('returns `undefined` for `undefined` in `nonEmptyArray` mode', () => {
      expect(getKeysOfTruthyValues(undefined, 'nonEmptyArray')).toBeUndefined();
    });
  });
});

describe('assignDefaults', () => {
  it('returns a fresh defaults object when source is undefined', () => {
    const defaults = {a: 1, b: 'x'};
    const result = assignDefaults(undefined, defaults);

    expect(result).toStrictEqual({a: 1, b: 'x'});
    expect(result).not.toBe(defaults);
  });

  it('returns a fresh defaults object when source is null', () => {
    expect(assignDefaults(null, {a: 1})).toStrictEqual({a: 1});
  });

  it('treats boolean source as "no overrides"', () => {
    expect(assignDefaults(true, {a: 1, b: 2})).toStrictEqual({a: 1, b: 2});
    expect(assignDefaults(false, {a: 1, b: 2})).toStrictEqual({a: 1, b: 2});
  });

  it('treats array source as "no overrides"', () => {
    expect(assignDefaults([1, 2, 3], {a: 1})).toStrictEqual({a: 1});
  });

  it('skips nullish values in source', () => {
    const result = assignDefaults(
      {a: undefined, b: null, c: 5},
      // @ts-expect-error skip types testing
      {a: 1, b: 2, c: 3},
    );

    expect(result).toStrictEqual({a: 1, b: 2, c: 5});
  });

  it('keeps falsy non-nullish values in source', () => {
    const result = assignDefaults(
      {a: 0, b: false, c: '', d: Number.NaN},
      {a: 10, b: true, c: 'fallback', d: 42},
    );

    expect(result).toStrictEqual({a: 0, b: false, c: '', d: Number.NaN});
  });

  it('shallow-replaces nested objects instead of deep-merging', () => {
    const result = assignDefaults(
      {meta: {name: 'override'}},
      // @ts-expect-error skip types testing
      {meta: {name: 'default', version: '1.0'}, other: true},
    );

    expect(result).toStrictEqual({meta: {name: 'override'}, other: true});
    expect(result.meta).not.toHaveProperty('version');
  });

  it('replaces arrays in defaults rather than concatenating', () => {
    const result = assignDefaults(
      {tags: ['a']},
      // @ts-expect-error skip types testing
      {tags: ['x', 'y'], keep: 1},
    );

    expect(result).toStrictEqual({tags: ['a'], keep: 1});
  });

  it('clones arrays so later mutation of the source does not leak into the result', () => {
    const sourceArray = ['a'];
    const result = assignDefaults({tags: sourceArray}, {tags: ['x']});
    sourceArray.push('b');

    expect(result.tags).toStrictEqual(['a']);
  });

  it('preserves keys present only in source', () => {
    const result = assignDefaults(
      {extra: 'yes'},
      // @ts-expect-error skip types testing
      {base: 1},
    );

    expect(result).toStrictEqual({base: 1, extra: 'yes'});
  });

  it('preserves keys present only in defaults', () => {
    const result = assignDefaults(
      {a: 9},
      // @ts-expect-error skip types testing
      {a: 1, b: 2},
    );

    expect(result).toStrictEqual({a: 9, b: 2});
  });

  it('ignores `__proto__` and `constructor` keys to avoid prototype pollution', () => {
    const malicious = JSON.parse(
      '{"__proto__": {"polluted": true}, "constructor": {"x": 1}}',
    ) as unknown;
    const result = assignDefaults(malicious, {safe: 1});

    expect(result).toStrictEqual({safe: 1});
    expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();
  });

  it('does not mutate the defaults object', () => {
    const defaults = {a: 1, b: {nested: true}};
    assignDefaults(
      {a: 9, b: {other: false}},
      // @ts-expect-error skip types testing
      defaults,
    );

    expect(defaults).toStrictEqual({a: 1, b: {nested: true}});
  });
});

import {assignDefaults} from '../../src/utils';

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

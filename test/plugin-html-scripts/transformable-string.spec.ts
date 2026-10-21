import {
  TransformableString,
  getLineStarts,
  indexToLocation,
} from '../../src/plugin-html-scripts/transformable-string';

describe('getLineStarts', () => {
  it('splits lines on the same line breaks as ESLint', () => {
    expect(getLineStarts('a\nb\r\nc\rd\u{2028}e\u{2029}f')).toStrictEqual([0, 2, 5, 7, 9, 11]);
  });

  it('returns a single line for a text without line breaks', () => {
    expect(getLineStarts('abc')).toStrictEqual([0]);
  });
});

describe('indexToLocation', () => {
  it('returns 1-based lines and columns', () => {
    const lineStarts = getLineStarts('aa\nbb\ncc');

    expect(indexToLocation(0, lineStarts)).toStrictEqual({line: 1, column: 1});
    expect(indexToLocation(2, lineStarts)).toStrictEqual({line: 1, column: 3});
    expect(indexToLocation(3, lineStarts)).toStrictEqual({line: 2, column: 1});
    expect(indexToLocation(7, lineStarts)).toStrictEqual({line: 3, column: 2});
  });
});

describe('toString', () => {
  it('returns the original text if nothing is removed', () => {
    expect(new TransformableString('foo').toString()).toBe('foo');
  });

  it('returns the text without the removed ranges', () => {
    const text = new TransformableString('abcde');
    text.remove(2, 3);
    text.remove(3, 4);
    text.remove(0, 1);

    expect(text.toString()).toBe('be');
  });
});

describe('remove', () => {
  it('throws when removing overlapping ranges', () => {
    const text = new TransformableString('abcd');
    text.remove(1, 3);

    expect(() => text.remove(2, 4)).toThrow();
    expect(() => text.remove(0, 2)).toThrow();
  });

  it('throws on an invalid range', () => {
    const text = new TransformableString('abcd');

    expect(() => text.remove(2, 1)).toThrow();
    expect(() => text.remove(-1, 1)).toThrow();
    expect(() => text.remove(1, 5)).toThrow();
  });
});

describe('originalIndex', () => {
  it('returns the same index if nothing is removed', () => {
    const text = new TransformableString('abcde');

    expect(text.originalIndex(0)).toBe(0);
    expect(text.originalIndex(4)).toBe(4);
  });

  it('throws if the index is invalid', () => {
    const text = new TransformableString('abcde');

    expect(() => text.originalIndex(-1)).toThrow();
    expect(() => text.originalIndex(6)).toThrow();
  });

  it('returns the original index in a text with removed ranges', () => {
    const text = new TransformableString('abcde');
    text.remove(1, 2);
    text.remove(3, 4);

    expect(text.toString()).toBe('ace');
    expect(text.originalIndex(0)).toBe(0);
    expect(text.originalIndex(1)).toBe(2);
    expect(text.originalIndex(2)).toBe(4);
    // The index right after the end is allowed
    expect(text.originalIndex(3)).toBe(5);
    expect(() => text.originalIndex(4)).toThrow();
  });

  it('maps the end of the text to the start of a removed range reaching the end', () => {
    const text = new TransformableString('abcd');
    text.remove(2, 4);

    expect(text.originalIndex(1)).toBe(1);
    expect(text.originalIndex(2)).toBe(2);
  });
});

describe('originalLocation', () => {
  it('returns the same location if nothing is removed', () => {
    const original = 'aaaa\nbbbb\ncccc';
    const lineStarts = getLineStarts(original);
    const text = new TransformableString(original);

    expect(text.originalLocation({line: 1, column: 3}, lineStarts)).toStrictEqual({
      line: 1,
      column: 3,
    });
    expect(text.originalLocation({line: 2, column: 1}, lineStarts)).toStrictEqual({
      line: 2,
      column: 1,
    });
  });

  it('returns the original location in a text with removed ranges', () => {
    const original = 'aaaa\nbbbb\ncccc';
    const lineStarts = getLineStarts(original);
    const text = new TransformableString(original);
    text.remove(3, 6);

    expect(text.toString()).toBe('aaabbb\ncccc');
    expect(text.originalLocation({line: 1, column: 1}, lineStarts)).toStrictEqual({
      line: 1,
      column: 1,
    });
    expect(text.originalLocation({line: 1, column: 4}, lineStarts)).toStrictEqual({
      line: 2,
      column: 2,
    });
    expect(text.originalLocation({line: 2, column: 1}, lineStarts)).toStrictEqual({
      line: 3,
      column: 1,
    });
  });
});

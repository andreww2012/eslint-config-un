// Same line breaks as ESLint
const LINE_BREAK_REGEXP = /\r\n|[\n\r\u{2028}\u{2029}]/gu;

interface Location {
  line: number;
  column: number;
}

export interface Range {
  start: number;
  end: number;
}

export const getLineStarts = (text: string) => [
  0,
  ...Array.from(text.matchAll(LINE_BREAK_REGEXP), (match) => match.index + match[0].length),
];

export const indexToLocation = (index: number, lineStarts: readonly number[]) => {
  // The last line starting at or before the index
  let low = 0;
  let high = lineStarts.length - 1;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if ((lineStarts[middle] ?? 0) <= index) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }

  return {line: low + 1, column: index - (lineStarts[low] ?? 0) + 1};
};

/** A text with some of its ranges removed, mapping its indexes back to the original text */
export class TransformableString {
  readonly #original: string;
  readonly #removedRanges: Range[] = [];
  #cache: {text: string; lineStarts: readonly number[]} | undefined;

  constructor(original: string) {
    this.#original = original;
  }

  #compute() {
    if (!this.#cache) {
      const {text, lastEnd} = this.#removedRanges.reduce(
        (accumulated, {start, end}) => ({
          text: accumulated.text + this.#original.slice(accumulated.lastEnd, start),
          lastEnd: end,
        }),
        {text: '', lastEnd: 0},
      );
      const result = text + this.#original.slice(lastEnd);
      this.#cache = {text: result, lineStarts: getLineStarts(result)};
    }
    return this.#cache;
  }

  toString() {
    return this.#compute().text;
  }

  remove(start: number, end: number) {
    if (start > end || start < 0 || end > this.#original.length) {
      throw new Error('Invalid range');
    }

    this.#cache = undefined;
    const range = {start, end};
    const lastRange = this.#removedRanges.at(-1);
    if (!lastRange || lastRange.end <= start) {
      this.#removedRanges.push(range);
      return;
    }

    const index = this.#removedRanges.findIndex((other) => other.end > start);
    if ((this.#removedRanges[index]?.start ?? 0) < end) {
      throw new Error('Overlapping ranges');
    }
    this.#removedRanges.splice(index, 0, range);
  }

  /**
   * An index at the start of a removed range maps to its end, except at the end of the text, which
   * maps to the start of the last removed range reaching it
   */
  originalIndex(index: number) {
    let originalIndex = index;
    let lastVisitedRange: Range | undefined;
    for (const range of this.#removedRanges) {
      lastVisitedRange = range;
      if (originalIndex < range.start) {
        break;
      }
      originalIndex += range.end - range.start;
    }

    if (originalIndex < 0 || originalIndex > this.#original.length) {
      throw new Error('Invalid index');
    }

    return originalIndex === this.#original.length &&
      lastVisitedRange?.end === this.#original.length
      ? lastVisitedRange.start
      : originalIndex;
  }

  originalLocation({line, column}: Location, originalLineStarts: readonly number[]) {
    const index = (this.#compute().lineStarts[line - 1] ?? 0) + column - 1;
    return indexToLocation(this.originalIndex(index), originalLineStarts);
  }
}

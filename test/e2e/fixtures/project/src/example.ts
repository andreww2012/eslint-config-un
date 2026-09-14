import clsx from 'clsx';

export const orderBy = <T>(items: T[], getKey: (item: T) => number) =>
  items.toSorted((a, b) => getKey(a) - getKey(b));

// Fits 80 characters, but not the `printWidth` of 40 Prettier is configured with
export const isDefined = (value: string) => value !== undefined;

export const className = clsx('a', 'b');

// Fits 80 characters as an implicit return, but not the `printWidth` of 40 either
const sum = (first: number, second: number) => {
  return first + second;
};

export const three = sum(1, 2);

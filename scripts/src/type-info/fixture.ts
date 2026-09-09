/* eslint-disable unicorn/no-incorrect-template-string-interpolation -- the fixtures are TSX sources, so `{...}` in them is JSX, not an interpolation */

/**
 * Sources the runtime probe lints to make rules reach their type-aware branches.
 * A rule only asks the type checker a question when it meets the syntax it is about, so the wider
 * this is, the fewer rules the probe misses
 */
export const FIXTURE_FILES: Record<string, string> = {
  'tsconfig.json': JSON.stringify(
    {
      compilerOptions: {
        allowJs: true,
        experimentalDecorators: true,
        jsx: 'preserve',
        lib: ['ESNext', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        moduleResolution: 'bundler',
        noEmit: true,
        skipLibCheck: true,
        strict: true,
        target: 'ESNext',
      },
      include: ['**/*.ts', '**/*.tsx'],
    },
    null,
    2,
  ),

  'kitchen.ts': `
import {readFile} from 'node:fs/promises';

export const numbers: number[] = [1, 2, 3];
export const maybeString: string | undefined = undefined;
export let counter = 0;

export interface User { id: number; name: string; tags?: string[]; createdAt: Date }
export type Maybe<T> = T | null | undefined;
export const enum Color { Red, Green }

export class Repository<T extends {id: number}> {
  private readonly items = new Map<number, T>();
  readonly seen = new Set<string>();
  constructor(public label: string) {}
  get size(): number { return this.items.size }
  async find(id: number): Promise<T | undefined> { return this.items.get(id) }
  toString() { return this.label }
}

export async function main(): Promise<void> {
  const data = await readFile('a.txt', 'utf8');
  const parsed = JSON.parse(data) as User[];
  const found = parsed.filter((user) => user.name === 'a')[0];
  const names = parsed.map(function (user) { return user.name });
  const total = parsed.reduce((accumulated, user) => accumulated + user.id, 0);
  const sorted = parsed.sort((left, right) => left.id - right.id);
  const reversed = [...parsed].reverse();
  const joined = names.join();
  const sliced = joined.substr(0, 2);
  const replaced = joined.replace(/a/g, 'b');
  const indexed = joined.indexOf('a') !== -1;
  const included = names.indexOf('a') > -1;
  const flattened = [names, names].reduce((left, right) => left.concat(right), []);
  const byId = new Map(parsed.map((user) => [user.id, user]));
  const fromEntries = Array.from(byId.values()).map((user) => user.name);
  const last = names[names.length - 1];
  const coerced = !!maybeString;
  const asserted = maybeString!;
  const merged = Object.assign({}, found, {name: 'z'});
  const collected: string[] = [];
  names.forEach((name) => collected.push(name));
  for (let index = 0; index < names.length; index += 1) { console.log(names[index]) }
  for (const key in byId) { console.log(key) }
  if (names.length > 0 && names.length) { console.log('non-empty') }
  const settled = await Promise.allSettled([readFile('a')]);
  settled.map((result) => (result as PromiseFulfilledResult<Buffer>).value);
  await Promise.all([readFile('a'), readFile('b')]);
  new Promise<void>((resolve) => resolve()).then(() => {}).catch(() => {}).finally(() => {});
  void readFile('c');
  try { await readFile('d') } catch (error) { console.error(error) }
  const expression = new RegExp('a+b', 'g');
  const matched = expression.exec(joined);
  const now = new Date();
  const buffer = Buffer.from(joined, 'base64');
  const decoded = buffer.toString('utf8');
  const parsedNumber = Number.parseInt(joined, 10);
  const absolute = parsedNumber < 0 ? -parsedNumber : parsedNumber;
  const largest = numbers.sort((left, right) => right - left)[0];
  const trimmed = joined.trimLeft().trimRight();
  const starts = joined.substring(0, 3) === 'abc';
  const interpolated = \\\`\\\${joined}-\\\${parsedNumber}\\\`;
  const optional = found?.tags?.length ?? 0;
  const dictionary: Record<string, unknown> = {a: 1};
  const read = dictionary['a'];
  const present = 'a' in dictionary;
  const removed = delete dictionary['a'];
  const mapped = (callback: (value: string) => void) => names.map(callback);
  const repository = new Repository<User>('users');
  const bound = repository.toString.bind(repository);
  const awaited = async () => { await readFile('e') };
  const chained = 1 < parsedNumber && parsedNumber < 10;
  console.log({data, parsed, found, names, total, sorted, reversed, joined, sliced, replaced, indexed, included, flattened, byId, fromEntries, last, coerced, asserted, merged, collected, matched, now, decoded, absolute, largest, trimmed, starts, interpolated, optional, read, present, removed, mapped, bound, awaited, chained, counter, Color});
}

export function documentInteractions(element: HTMLElement, event: KeyboardEvent) {
  const attribute = element.getAttribute('data-foo');
  element.setAttribute('data-foo', 'bar');
  element.innerText = 'a';
  element.parentNode?.replaceChild(element, element);
  element.style.transition = 'all 1s';
  element.appendChild(document.createElement('div'));
  document.querySelectorAll('div').forEach((node) => node.remove());
  element.classList.toggle('a', true);
  window.addEventListener('resize', () => {}, false);
  return {attribute, code: event.keyCode, search: new URLSearchParams(location.search), href: new URL('https://example.com').toString()};
}

export const generate = async function* () { yield 1 };
export default main;
`,

  'component.tsx': `
import * as React from 'react';

export interface Props { items: string[]; label?: string; onClick?: () => void; children?: React.ReactNode }

export const List = ({items, label, onClick, children}: Props) => {
  const [current, setCurrent] = React.useState<string | null>(null);
  const container = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => { setCurrent(items[0] ?? null) }, [items]);
  return (
    <div ref={container} onClick={onClick} title={label}>
      {items.length && <span>{items.length}</span>}
      {items.map((item) => <span key={item}>{item}</span>)}
      {current ? <b>{current}</b> : null}
      {children}
    </div>
  );
};

export const App = (): React.ReactElement => <List items={['a']} />;
`,
};

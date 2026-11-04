/* eslint-disable vitest/require-hook -- `RuleTester` generates its own `describe`/`it` blocks */
/* eslint-disable no-template-curly-in-string -- some test cases have template literal types */
import path from 'node:path';
import {Linter, RuleTester} from 'eslint';
import {parser as typescriptParser} from 'typescript-eslint';
import {preferLogicalOr} from '../../../src/plugin-un/rules/prefer-logical-or';

const RULE_NAME = 'prefer-logical-or';

const FIXTURES_DIRECTORY = path.join(import.meta.dirname, 'fixtures');

const withFix = (code: string, output: string, errorCount = 1) => ({
  code,
  output,
  errors: Array.from({length: errorCount}, () => ({messageId: 'preferLogicalOr'})),
});

const withTypedFile = <TestCase extends {code: string}>(testCase: TestCase) => ({
  ...testCase,
  filename: path.join(FIXTURES_DIRECTORY, 'file.ts'),
});

const typeAwareRuleTester = new RuleTester({
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {projectService: true, tsconfigRootDir: FIXTURES_DIRECTORY},
  },
});

typeAwareRuleTester.run(RULE_NAME, preferLogicalOr, {
  valid: [
    'declare const value: object | undefined; value || {};',

    // Can be falsy without being nullish
    "declare const value: string | undefined; value ?? 'default';",
    'declare const value: number | null; value ?? 1;',
    'declare const value: bigint | undefined; value ?? 1n;',
    'declare const value: boolean | undefined; value ?? true;',
    'declare const value: false | undefined; value ?? true;',
    "declare const value: '' | 'text' | undefined; value ?? 'default';",
    'declare const value: 0 | 1 | undefined; value ?? 1;',
    'declare const value: 0n | undefined; value ?? 1n;',
    'declare const value: object | string | undefined; value ?? {};',
    "declare let value: string | undefined; value ??= 'default';",
    "declare const object: {key?: string}; object.key ??= 'default';",

    // Enums
    'enum Level { Off, On } declare const level: Level | undefined; level ?? Level.On;',
    "enum Text { Empty = '', Full = 'full' } declare const text: Text | undefined; text ?? Text.Full;",
    'declare function getLevel(): number; enum Level { Computed = getLevel() } declare const level: Level | undefined; level ?? 1;',
    // Any number can be assigned to a numeric enum, like a combination of flags
    'enum Permission { Read = 1, Write = 2 } declare const mask: Permission | undefined; mask ?? Permission.Read;',
    'enum Permission { Read = 1, Write = 2 } declare const mask: Permission.Read | undefined; mask ?? Permission.Read;',

    // Template literal and intrinsic string types that allow an empty string
    "declare const value: `${string}` | undefined; value ?? 'default';",
    "declare const value: Uppercase<string> | undefined; value ?? 'DEFAULT';",

    // Branded primitives are still primitives at runtime
    "declare const id: (string & {brand: 'id'}) | undefined; id ?? 'default';",
    "declare const count: (number & {brand: 'count'}) | undefined; count ?? 1;",

    // Object types a primitive can be assigned to
    'declare const value: {} | undefined; value ?? 1;',
    'declare const value: Object | undefined; value ?? 1;',
    'declare const value: {length: number} | undefined; value ?? [];',
    'declare const value: {toFixed: () => string} | undefined; value ?? 1;',
    'interface HTMLAllCollection { item: (index: number) => unknown } declare const all: HTMLAllCollection | undefined; all ?? [];',

    // Can be anything
    'declare const value: any; value ?? 1;',
    'declare const value: unknown; value ?? 1;',
    'declare function getValue(): void; getValue() ?? 1;',
    'function foo<T>(value: T) { return value ?? 1; }',
    'function foo<T>(value: T & {}) { return value ?? 1; }',
    "function foo<T>(value: (T & {brand: 'id'}) | undefined) { return value ?? 1; }",

    // Generic types are judged by their constraints
    "function foo<T extends string | undefined>(value: T) { return value ?? 'default'; }",
    "function foo<T>(key: keyof T | undefined) { return key ?? 'default'; }",
    "function foo<T extends {key?: string}>(object: T) { return object.key ?? 'default'; }",

    // Always nullish, which is more likely a wrong type
    'declare const value: null; value ?? 1;',
    'declare const value: undefined; value ?? 1;',
    'declare const value: null | undefined; value ?? 1;',
    'declare const value: never; value ?? 1;',
    'declare const object: {key: 1}; declare const key: string; (key in object ? (object[key] as never) : null) ?? 1;',

    // The result of `a ?? b` can be falsy if `a` can be
    "declare const first: string | undefined; declare const second: object | undefined; first ?? second ?? 'default';",
  ].map((code) => withTypedFile({code})),
  invalid: [
    withFix(
      'declare const value: object | undefined; value ?? {};',
      'declare const value: object | undefined; value || {};',
    ),
    withFix(
      'declare const value: {key: number} | null; value ?? {key: 1};',
      'declare const value: {key: number} | null; value || {key: 1};',
    ),
    withFix(
      'declare const items: string[] | undefined; items ?? [];',
      'declare const items: string[] | undefined; items || [];',
    ),
    withFix(
      'declare const callback: (() => void) | undefined; callback ?? (() => {});',
      'declare const callback: (() => void) | undefined; callback || (() => {});',
    ),
    withFix(
      'declare const value: Date | null | undefined; value ?? new Date();',
      'declare const value: Date | null | undefined; value || new Date();',
    ),
    withFix(
      'declare const user: {address?: {city: string}} | undefined; user?.address ?? {};',
      'declare const user: {address?: {city: string}} | undefined; user?.address || {};',
    ),
    withFix(
      'function foo<T extends object>(value: T | undefined) { return value ?? {}; }',
      'function foo<T extends object>(value: T | undefined) { return value || {}; }',
    ),

    // Truthy primitives
    withFix(
      'declare const value: true | undefined; value ?? false;',
      'declare const value: true | undefined; value || false;',
    ),
    withFix(
      "declare const value: 'first' | 'second' | undefined; value ?? 'first';",
      "declare const value: 'first' | 'second' | undefined; value || 'first';",
    ),
    withFix(
      'declare const value: 1 | -1 | null; value ?? 1;',
      'declare const value: 1 | -1 | null; value || 1;',
    ),
    withFix(
      'declare const value: 1n | undefined; value ?? 2n;',
      'declare const value: 1n | undefined; value || 2n;',
    ),
    withFix(
      'declare const value: symbol | undefined; value ?? Symbol();',
      'declare const value: symbol | undefined; value || Symbol();',
    ),
    withFix(
      "declare const value: `id-${string}` | undefined; value ?? 'id-0';",
      "declare const value: `id-${string}` | undefined; value || 'id-0';",
    ),
    withFix(
      "declare const value: ('id' & {brand: 'id'}) | undefined; value ?? 'id';",
      "declare const value: ('id' & {brand: 'id'}) | undefined; value || 'id';",
    ),
    withFix(
      "enum Color { Red = 'red' } declare const color: Color | undefined; color ?? Color.Red;",
      "enum Color { Red = 'red' } declare const color: Color | undefined; color || Color.Red;",
    ),
    withFix(
      "function foo<T extends 'first' | 'second'>(value: T | undefined) { return value ?? 'first'; }",
      "function foo<T extends 'first' | 'second'>(value: T | undefined) { return value || 'first'; }",
    ),

    // Logical assignment
    withFix(
      'declare let cache: Map<string, number> | undefined; cache ??= new Map();',
      'declare let cache: Map<string, number> | undefined; cache ||= new Map();',
    ),
    withFix(
      'declare const object: {items?: string[]}; object.items ??= [];',
      'declare const object: {items?: string[]}; object.items ||= [];',
    ),

    // Parentheses and comments
    withFix(
      'declare const value: object | undefined; (value) /* comment */ ?? {};',
      'declare const value: object | undefined; (value) /* comment */ || {};',
    ),
    withFix(
      'declare const value: object | undefined; declare const flag: boolean; flag && (value ?? {});',
      'declare const value: object | undefined; declare const flag: boolean; flag && (value || {});',
    ),
    withFix(
      "declare const first: object | undefined; declare const second: string | undefined; first ?? second ?? 'default';",
      "declare const first: object | undefined; declare const second: string | undefined; (first || second) ?? 'default';",
    ),
    withFix(
      'declare const first: object | undefined; declare const second: object | undefined; (first ?? second) ?? {};',
      'declare const first: object | undefined; declare const second: object | undefined; (first || second) || {};',
      2,
    ),
    withFix(
      'declare const first: object | undefined; declare const second: object | undefined; first ?? second ?? {};',
      'declare const first: object | undefined; declare const second: object | undefined; first || second || {};',
      2,
    ),
    withFix(
      'declare const first: object | undefined; declare const second: object | undefined; declare const third: object | undefined; first ?? second ?? third ?? {};',
      'declare const first: object | undefined; declare const second: object | undefined; declare const third: object | undefined; first || second || third || {};',
      3,
    ),
    withFix(
      "declare const first: object | undefined; declare const second: object | undefined; declare const text: string | undefined; first ?? second ?? text ?? 'default';",
      "declare const first: object | undefined; declare const second: object | undefined; declare const text: string | undefined; (first || second || text) ?? 'default';",
      2,
    ),
    withFix(
      'declare const nothing: null; declare const value: object | undefined; nothing ?? value ?? {};',
      'declare const nothing: null; declare const value: object | undefined; (nothing ?? value) || {};',
    ),
    withFix(
      'declare const first: object | undefined; declare const second: object | undefined; first ?? (second ?? {});',
      'declare const first: object | undefined; declare const second: object | undefined; first || (second || {});',
      2,
    ),

    {
      code: 'declare const value: object | undefined;\nvalue ?? {};',
      output: 'declare const value: object | undefined;\nvalue || {};',
      errors: [
        {
          message:
            'Use `||` instead of `??`: they work the same here, because the left side cannot be `false`, `0`, `0n`, `NaN` or an empty string.',
          line: 2,
          column: 7,
          endColumn: 9,
        },
      ],
    },
    {
      code: 'declare let value: object | undefined;\nvalue ??= {};',
      output: 'declare let value: object | undefined;\nvalue ||= {};',
      errors: [
        {
          message:
            'Use `||=` instead of `??=`: they work the same here, because the left side cannot be `false`, `0`, `0n`, `NaN` or an empty string.',
          line: 2,
          column: 7,
          endColumn: 10,
        },
      ],
    },
  ].map(withTypedFile),
});

// Without node maps, the rule can't get the types of the nodes
const typeAwareRuleTesterWithoutNodeMaps = new RuleTester({
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {
      projectService: true,
      tsconfigRootDir: FIXTURES_DIRECTORY,
      preserveNodeMaps: false,
    },
  },
});

typeAwareRuleTesterWithoutNodeMaps.run(
  `${RULE_NAME} (type information without node maps)`,
  preferLogicalOr,
  {
    valid: [withTypedFile({code: 'declare const value: object | undefined; value ?? {};'})],
    invalid: [],
  },
);

it('throws without type information', () => {
  expect(() =>
    new Linter().verify('value ?? {};', {
      plugins: {un: {rules: {[RULE_NAME]: preferLogicalOr}}},
      rules: {[`un/${RULE_NAME}`]: 'error'},
    }),
  ).toThrow('This rule requires type information');
});

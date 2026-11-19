/* eslint-disable vitest/require-hook -- `RuleTester` generates its own `describe`/`it` blocks */
import path from 'node:path';
import {RuleTester} from 'eslint';
import {parser as typescriptParser} from 'typescript-eslint';
import {consistentNullishComparison} from '../../../src/plugin-un/rules/consistent-nullish-comparison';

const RULE_NAME = 'consistent-nullish-comparison';

const FIXTURES_DIRECTORY = path.join(import.meta.dirname, 'fixtures');

const withReport = (messageId: string, code: string, output: string | null) => ({
  code,
  output,
  errors: [{messageId}],
});

const withStrictMode = <TestCase extends object>(testCase: TestCase) => ({
  ...testCase,
  options: ['strict'],
});

const withTypedFile = <TestCase extends {code: string}>(testCase: TestCase) => ({
  ...testCase,
  filename: path.join(FIXTURES_DIRECTORY, 'file.ts'),
});

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, consistentNullishComparison, {
  valid: [
    'x == null;',
    'x != null;',
    'null == x;',
    'x == y;',

    // Without type information, the value may be either `null` or `undefined`
    'x === null;',
    'x !== undefined;',

    // Not a pair
    'x === null || y === undefined;',
    'x === null && x === undefined;',
    'x !== null || x !== undefined;',
    'x === null || x === null;',
    'x === null ?? x === undefined;',
    'a && x === null || x === undefined;',
    // Calls may return different values
    'f() === null || f() === undefined;',

    'function foo(undefined) { return x == undefined; }',
    'null === undefined;',
  ],
  invalid: [
    withReport('replace', 'x == undefined;', 'x == null;'),
    withReport('replace', 'x != undefined;', 'x != null;'),
    withReport('replace', 'undefined == x;', 'null == x;'),

    withReport('joinComparisons', 'x === null || x === undefined;', 'x == null;'),
    withReport('joinComparisons', 'x !== null && x !== undefined;', 'x != null;'),
    withReport('joinComparisons', 'x === undefined || x === null;', 'x == null;'),
    withReport('joinComparisons', 'null === x || undefined === x;', 'null == x;'),
    withReport('joinComparisons', 'a.b === null || a.b == undefined;', 'a.b == null;'),
    withReport('joinComparisons', 'foo || x === null || x === undefined;', 'foo || x == null;'),
    withReport('joinComparisons', 'x === null || x === undefined || foo;', 'x == null || foo;'),
    withReport('joinComparisons', '(x === null) || (x === undefined);', '(x == null);'),
    withReport('joinComparisons', 'x === null || (x === undefined);', 'x == null;'),
    withReport('joinComparisons', '!(x === null || x === undefined);', '!(x == null);'),
    withReport('joinComparisons', 'x === null || /* Comment */ x === undefined;', null),
  ],
});

ruleTester.run(`${RULE_NAME} (strict)`, consistentNullishComparison, {
  valid: ['x === null;', 'x !== undefined;', 'x === null || x === undefined;'].map((code) =>
    withStrictMode({code}),
  ),
  invalid: [
    withReport('splitComparison', 'x == null;', 'x === null || x === undefined;'),
    withReport('splitComparison', 'x != null;', 'x !== null && x !== undefined;'),
    withReport('splitComparison', 'x == undefined;', 'x === null || x === undefined;'),
    withReport('splitComparison', 'null == x;', 'x === null || x === undefined;'),
    withReport('splitComparison', 'a.b == null;', 'a.b === null || a.b === undefined;'),
    withReport('splitComparison', 'if (x == null) {}', 'if (x === null || x === undefined) {}'),
    withReport('splitComparison', 'a || x == null;', 'a || x === null || x === undefined;'),
    withReport('splitComparison', 'a || x != null;', 'a || x !== null && x !== undefined;'),
    withReport('splitComparison', 'a && x == null;', 'a && (x === null || x === undefined);'),
    withReport('splitComparison', 'a ?? x == null;', 'a ?? (x === null || x === undefined);'),
    withReport('splitComparison', 'x == null == y;', '(x === null || x === undefined) == y;'),
    withReport('splitComparison', '!(x == null);', '!(x === null || x === undefined);'),
    withReport('splitComparison', 'null == (a, b);', '(a, b) === null || (a, b) === undefined;'),
    // The value would be computed twice
    withReport('splitComparison', 'f() == null;', null),
    withReport('splitComparison', 'x == /* Comment */ null;', null),
  ].map(withStrictMode),
});

const typeAwareRuleTester = new RuleTester({
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {projectService: true, tsconfigRootDir: FIXTURES_DIRECTORY},
  },
});

typeAwareRuleTester.run(`${RULE_NAME} (type information)`, consistentNullishComparison, {
  valid: [
    'declare const x: string | null | undefined; x === null;',
    'declare const x: string | null | undefined; x !== undefined;',
    'declare const x: {key?: string | null}; x.key === null;',
    // The type allows neither value, so the comparison likely guards against a wrong type
    'declare const x: string; x === undefined;',

    // A missing key gives `undefined`
    'declare const record: Record<string, string | null>; declare const key: string; record[key] === null;',
    'declare const record: Record<string, string | null>; record.key === null;',
    'declare const array: (string | null)[]; array[0] === null;',
    'declare const array: (string | null)[]; array?.[0] === null;',

    // The asserted type may leave out a value
    'declare const x: string | null | undefined; x! === null;',
    'declare const x: string | null | undefined; (x as string | null) === null;',

    // Can be anything
    'declare const x: any; x === null;',
    'declare const x: unknown; x === undefined;',
    'declare function f(): void; f() === undefined;',
    'function foo<T>(x: T) { return x === null; }',
    'function foo<T, K extends keyof T>(x: T, key: K) { return x[key] === undefined; }',

    // Generic types are judged by their constraints
    'function foo<T extends string | null | undefined>(x: T) { return x === null; }',

    // `document.all == null` is `true`
    'interface HTMLAllCollection { length: number } declare const all: HTMLAllCollection | null; all === null;',
    'interface HTMLAllCollection { length: number } declare const all: HTMLAllCollection | null | undefined; all === null || all === undefined;',
  ].map((code) => withTypedFile({code})),
  invalid: [
    withReport(
      'replaceByType',
      'declare const x: string | null; x === null;',
      'declare const x: string | null; x == null;',
    ),
    withReport(
      'replaceByType',
      'declare const x: string | undefined; x !== undefined;',
      'declare const x: string | undefined; x != null;',
    ),
    withReport(
      'replaceByType',
      'declare const tuple: [string | null]; tuple[0] === null;',
      'declare const tuple: [string | null]; tuple[0] == null;',
    ),
    withReport(
      'replaceByType',
      'declare const object: {key: string | null} & Record<string, unknown>; object.key === null;',
      'declare const object: {key: string | null} & Record<string, unknown>; object.key == null;',
    ),
    // Every key the type allows is declared
    withReport(
      'replaceByType',
      "declare const record: Record<'a' | 'b', string | null>; declare const key: 'a' | 'b'; record[key] === null;",
      "declare const record: Record<'a' | 'b', string | null>; declare const key: 'a' | 'b'; record[key] == null;",
    ),
    withReport(
      'replaceByType',
      'declare const x: string | null; (x as string | null | undefined) === null;',
      'declare const x: string | null; (x as string | null | undefined) == null;',
    ),
    withReport(
      'replaceByType',
      'declare const x: {key?: string}; x.key === undefined;',
      'declare const x: {key?: string}; x.key == null;',
    ),
    withReport(
      'replaceByType',
      'function foo<T extends string | undefined>(x: T) { return x === undefined; }',
      'function foo<T extends string | undefined>(x: T) { return x == null; }',
    ),
    withReport(
      'joinComparisons',
      'declare const x: unknown; x === null || x === undefined;',
      'declare const x: unknown; x == null;',
    ),
    // Reported once, as a pair
    withReport(
      'joinComparisons',
      'declare const x: string | null; x === null || x === undefined;',
      'declare const x: string | null; x == null;',
    ),
  ].map((testCase) => withTypedFile(testCase)),
});

typeAwareRuleTester.run(
  `${RULE_NAME} (type information, without \`strictNullChecks\`)`,
  consistentNullishComparison,
  {
    valid: [
      {
        code: 'declare const x: string | null; x === null;',
        filename: path.join(FIXTURES_DIRECTORY, 'no-strict-null-checks', 'file.ts'),
      },
    ],
    invalid: [],
  },
);

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
  consistentNullishComparison,
  {
    valid: [withTypedFile({code: 'declare const x: string | null; x === null;'})],
    invalid: [],
  },
);

typeAwareRuleTester.run(`${RULE_NAME} (type information, strict)`, consistentNullishComparison, {
  valid: [
    'interface HTMLAllCollection { length: number } declare const all: HTMLAllCollection | undefined; all == null;',
  ].map((code) => withTypedFile(withStrictMode({code}))),
  invalid: [
    withReport(
      'replaceByType',
      'declare const x: string | null; x == null;',
      'declare const x: string | null; x === null;',
    ),
    withReport(
      'replaceByType',
      'declare const x: string | undefined; x == null;',
      'declare const x: string | undefined; x === undefined;',
    ),
    withReport(
      'replaceByType',
      'declare const x: string | undefined; x != undefined;',
      'declare const x: string | undefined; x !== undefined;',
    ),
    withReport(
      'replaceByType',
      'declare const x: string | null; x == undefined;',
      'declare const x: string | null; x === null;',
    ),
    withReport(
      'replaceByType',
      'declare const array: string[]; array[0] == null;',
      'declare const array: string[]; array[0] === undefined;',
    ),
    // The type allows neither value, so the comparison likely guards against a wrong type
    withReport(
      'splitComparison',
      'declare const x: string; x == undefined;',
      'declare const x: string; x === null || x === undefined;',
    ),
    withReport(
      'splitComparison',
      'declare const record: Record<string, string | null>; record.key == null;',
      'declare const record: Record<string, string | null>; record.key === null || record.key === undefined;',
    ),
    withReport(
      'splitComparison',
      'declare const x: string | null | undefined; x == null;',
      'declare const x: string | null | undefined; x === null || x === undefined;',
    ),
    withReport(
      'splitComparison',
      'declare const x: unknown; x != null;',
      'declare const x: unknown; x !== null && x !== undefined;',
    ),
  ].map((testCase) => withTypedFile(withStrictMode(testCase))),
});

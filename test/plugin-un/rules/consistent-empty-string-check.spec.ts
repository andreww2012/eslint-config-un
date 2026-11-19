/* eslint-disable vitest/require-hook -- `RuleTester` generates its own `describe`/`it` blocks */
/* eslint-disable no-template-curly-in-string -- Some test cases have template literal types */
import path from 'node:path';
import {Linter, RuleTester} from 'eslint';
import {parser as typescriptParser} from 'typescript-eslint';
import {consistentEmptyStringCheck} from '../../../src/plugin-un/rules/consistent-empty-string-check';

const RULE_NAME = 'consistent-empty-string-check';

const FIXTURES_DIRECTORY = path.join(import.meta.dirname, 'fixtures');

const STRING_DECLARATION = 'declare const value: string;';

const EMPTY_STRING_STYLE = 'empty-string';

const withTypedFile = <TestCase extends {code: string}>(testCase: TestCase) => ({
  ...testCase,
  filename: path.join(FIXTURES_DIRECTORY, 'file.ts'),
});

const withLengthFix = (code: string, output: string, errorCount = 1) =>
  withTypedFile({
    code,
    output,
    errors: Array.from({length: errorCount}, () => ({messageId: 'preferLength'})),
  });

const withEmptyStringFix = (code: string, output: string, errorCount = 1) =>
  withTypedFile({
    code,
    output,
    options: [EMPTY_STRING_STYLE],
    errors: Array.from({length: errorCount}, () => ({messageId: 'preferEmptyString'})),
  });

const typeAwareRuleTester = new RuleTester({
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {projectService: true, tsconfigRootDir: FIXTURES_DIRECTORY},
  },
});

typeAwareRuleTester.run(RULE_NAME, consistentEmptyStringCheck, {
  valid: [
    `${STRING_DECLARATION} value.length === 0;`,
    `${STRING_DECLARATION} value.length > 0;`,
    `${STRING_DECLARATION} value === 'text';`,
    `${STRING_DECLARATION} value === ' ';`,
    `${STRING_DECLARATION} value < '';`,
    `${STRING_DECLARATION} value === \`\${''}\`;`,

    // `.length` would throw on `null` and `undefined`
    "declare const value: string | undefined; value === '';",
    "declare const value: string | null; value !== '';",
    "declare const object: {key?: string}; object.key === '';",

    // Without `noUncheckedIndexedAccess`, a missing value is still typed as a string
    "declare const items: string[]; items[0] === '';",
    "declare const items: string[]; declare const index: number; items[index] === '';",
    "declare const record: Record<string, string>; record.key === '';",
    "declare const object: {items: string[]}; object?.items[0] === '';",
    `${STRING_DECLARATION} value[0] === '';`,

    // Not a primitive string
    "declare const value: string | number; value === '';",
    "declare const value: string | string[]; value === '';",
    "declare const value: String; value === '';",
    "declare const value: {length: number}; value === '';",

    // Only the comparison with an empty string narrows these types
    "declare const value: '' | 'auto'; value !== '';",
    "declare const value: Uppercase<string> | 'auto'; value === '';",
    "enum Text { Empty = '', Full = 'full' } declare const text: Text; text === '';",
    "function foo<T extends '' | 'auto'>(value: T) { return value === ''; }",
    "function foo(value: '' | 'auto') { if (value === 'auto') { return 1; } return value === ''; }",
    "declare const value: 'text'; value !== '';",
    "enum Text { Empty = '' } declare const text: Text; text === '';",

    // Can be anything
    "declare const value: any; value === '';",
    "declare const value: unknown; value === '';",
    "declare const value: never; value === '';",
    "function foo<T>(value: T) { return value === ''; }",
  ].map((code) => withTypedFile({code})),
  invalid: [
    withLengthFix(
      `${STRING_DECLARATION} value === '';`,
      `${STRING_DECLARATION} value.length === 0;`,
    ),
    withLengthFix(`${STRING_DECLARATION} value !== '';`, `${STRING_DECLARATION} value.length > 0;`),
    withLengthFix(`${STRING_DECLARATION} value == '';`, `${STRING_DECLARATION} value.length == 0;`),
    withLengthFix(`${STRING_DECLARATION} value != '';`, `${STRING_DECLARATION} value.length > 0;`),
    withLengthFix(
      `${STRING_DECLARATION} value === "";`,
      `${STRING_DECLARATION} value.length === 0;`,
    ),
    withLengthFix(
      `${STRING_DECLARATION} value === \`\`;`,
      `${STRING_DECLARATION} value.length === 0;`,
    ),
    withLengthFix(
      `${STRING_DECLARATION} '' === value;`,
      `${STRING_DECLARATION} 0 === value.length;`,
    ),
    withLengthFix(`${STRING_DECLARATION} '' !== value;`, `${STRING_DECLARATION} 0 < value.length;`),
    withLengthFix(`${STRING_DECLARATION} '' == value;`, `${STRING_DECLARATION} 0 == value.length;`),
    withLengthFix(`${STRING_DECLARATION} '' != value;`, `${STRING_DECLARATION} 0 < value.length;`),
    withLengthFix(
      `${STRING_DECLARATION} value /* comment */ === '';`,
      `${STRING_DECLARATION} value.length /* comment */ === 0;`,
    ),
    withLengthFix(
      `${STRING_DECLARATION} if (value === '' || value !== '') {}`,
      `${STRING_DECLARATION} if (value.length === 0 || value.length > 0) {}`,
      2,
    ),

    // Other string types
    withLengthFix(
      "declare const value: Uppercase<string>; value === '';",
      'declare const value: Uppercase<string>; value.length === 0;',
    ),
    withLengthFix(
      "declare const value: `${number}px`; value === '';",
      'declare const value: `${number}px`; value.length === 0;',
    ),
    withLengthFix(
      "declare const id: string & {brand: 'id'}; id === '';",
      "declare const id: string & {brand: 'id'}; id.length === 0;",
    ),
    withLengthFix(
      "function foo<T extends string>(value: T) { return value === ''; }",
      'function foo<T extends string>(value: T) { return value.length === 0; }',
    ),

    // Other expressions
    withLengthFix(
      "declare const object: {text: string}; object.text === '';",
      'declare const object: {text: string}; object.text.length === 0;',
    ),
    withLengthFix(
      "declare function getText(): string; getText() !== '';",
      'declare function getText(): string; getText().length > 0;',
    ),
    withLengthFix(
      "declare const value: string | undefined; value! === '';",
      'declare const value: string | undefined; value!.length === 0;',
    ),
    withLengthFix(
      `${STRING_DECLARATION} (value) === '';`,
      `${STRING_DECLARATION} (value).length === 0;`,
    ),
    withLengthFix(
      "declare const first: string; declare const second: string; first + second === '';",
      'declare const first: string; declare const second: string; (first + second).length === 0;',
    ),
    withLengthFix(
      "declare const first: string; declare const second: string; '' !== first + second;",
      'declare const first: string; declare const second: string; 0 < (first + second).length;',
    ),
    withLengthFix(
      "declare const first: string; declare const second: string; (first + second) === '';",
      'declare const first: string; declare const second: string; (first + second).length === 0;',
    ),
    withLengthFix(
      "declare const value: unknown; value as string === '';",
      'declare const value: unknown; (value as string).length === 0;',
    ),
    withLengthFix(
      "declare const promise: Promise<string>; async function foo() { return await promise === ''; }",
      'declare const promise: Promise<string>; async function foo() { return (await promise).length === 0; }',
    ),
    withLengthFix(
      "declare const value: unknown; <string>value === '';",
      'declare const value: unknown; (<string>value).length === 0;',
    ),
    withLengthFix(
      `${STRING_DECLARATION} value satisfies string === '';`,
      `${STRING_DECLARATION} (value satisfies string).length === 0;`,
    ),
    withLengthFix(
      `${STRING_DECLARATION} \`\${value}\` === '';`,
      `${STRING_DECLARATION} (\`\${value}\`).length === 0;`,
    ),

    // Reads that can't be missing
    withLengthFix(
      "declare const pair: [string, string]; pair[0] === '';",
      'declare const pair: [string, string]; pair[0].length === 0;',
    ),
    withLengthFix(
      "declare const record: Record<'a' | 'b', string>; declare const key: 'a' | 'b'; record[key] === '';",
      "declare const record: Record<'a' | 'b', string>; declare const key: 'a' | 'b'; record[key].length === 0;",
    ),
    withLengthFix(
      "declare const items: string[]; items[0]! === '';",
      'declare const items: string[]; items[0]!.length === 0;',
    ),

    // The added parenthesis would otherwise continue the previous statement
    withLengthFix(
      `${STRING_DECLARATION}\nconst count = 1\nvalue + value === '' && count`,
      `${STRING_DECLARATION}\nconst count = 1\n;(value + value).length === 0 && count`,
    ),
    withLengthFix(
      `${STRING_DECLARATION}\nconst count = 1;\nvalue + value === '' && count`,
      `${STRING_DECLARATION}\nconst count = 1;\n(value + value).length === 0 && count`,
    ),
  ],
});

typeAwareRuleTester.run(`${RULE_NAME} (style: \`empty-string\`)`, consistentEmptyStringCheck, {
  valid: [
    `${STRING_DECLARATION} value === '';`,
    `${STRING_DECLARATION} value !== '';`,
    `${STRING_DECLARATION} value.length === 1;`,
    `${STRING_DECLARATION} value.length > 1;`,
    `${STRING_DECLARATION} value.length >= 1;`,
    `${STRING_DECLARATION} value.length < 0;`,
    `${STRING_DECLARATION} 0 > value.length;`,
    `${STRING_DECLARATION} value['length'] === 0;`,
    'declare const value: string | undefined; value?.length === 0;',

    // Not a primitive string
    'declare const value: string[]; value.length === 0;',
    'declare const value: string | string[]; value.length === 0;',
    'declare const value: String; value.length === 0;',
    'declare const value: {length: number}; value.length === 0;',

    // Can be anything
    'declare const value: any; value.length === 0;',
    'function foo<T extends {length: number}>(value: T) { return value.length === 0; }',

    // Never empty, or always empty
    "declare const value: 'a' | 'b'; value.length === 0;",
    'declare const value: `${number}px`; value.length === 0;',
    "declare const value: ''; value.length > 0;",
  ].map((code) => withTypedFile({code, options: [EMPTY_STRING_STYLE]})),
  invalid: [
    withEmptyStringFix(
      `${STRING_DECLARATION} value.length === 0;`,
      `${STRING_DECLARATION} value === '';`,
    ),
    withEmptyStringFix(
      `${STRING_DECLARATION} value.length > 0;`,
      `${STRING_DECLARATION} value !== '';`,
    ),
    withEmptyStringFix(
      `${STRING_DECLARATION} value.length !== 0;`,
      `${STRING_DECLARATION} value !== '';`,
    ),
    withEmptyStringFix(
      `${STRING_DECLARATION} value.length == 0;`,
      `${STRING_DECLARATION} value == '';`,
    ),
    withEmptyStringFix(
      `${STRING_DECLARATION} value.length != 0;`,
      `${STRING_DECLARATION} value != '';`,
    ),
    withEmptyStringFix(
      `${STRING_DECLARATION} 0 === value.length;`,
      `${STRING_DECLARATION} '' === value;`,
    ),
    withEmptyStringFix(
      `${STRING_DECLARATION} 0 < value.length;`,
      `${STRING_DECLARATION} '' !== value;`,
    ),
    withEmptyStringFix(
      "declare const value: '' | 'auto'; value.length === 0;",
      "declare const value: '' | 'auto'; value === '';",
    ),
    withEmptyStringFix(
      'function foo<T extends string>(value: T) { return value.length > 0; }',
      "function foo<T extends string>(value: T) { return value !== ''; }",
    ),
    withEmptyStringFix(
      'declare function getText(): string; getText().length === 0;',
      "declare function getText(): string; getText() === '';",
    ),
    withEmptyStringFix(
      'declare const first: string; declare const second: string; (first + second).length === 0;',
      "declare const first: string; declare const second: string; (first + second) === '';",
    ),
    withEmptyStringFix(
      'declare const value: string | number; (value as string).length === 0;',
      "declare const value: string | number; (value as string) === '';",
    ),
    withEmptyStringFix(
      `${STRING_DECLARATION} 0 == value.length;`,
      `${STRING_DECLARATION} '' == value;`,
    ),
    withEmptyStringFix(
      `${STRING_DECLARATION} 0 !== value.length;`,
      `${STRING_DECLARATION} '' !== value;`,
    ),
    withEmptyStringFix(
      `${STRING_DECLARATION} 0 != value.length;`,
      `${STRING_DECLARATION} '' != value;`,
    ),
    withEmptyStringFix(
      "declare const id: string & {brand: 'id'}; id.length === 0;",
      "declare const id: string & {brand: 'id'}; id === '';",
    ),
    withEmptyStringFix(
      'declare const value: Uppercase<string>; value.length > 0;',
      "declare const value: Uppercase<string>; value !== '';",
    ),
    withEmptyStringFix(
      `${STRING_DECLARATION} value./* comment */length === 0;`,
      `${STRING_DECLARATION} value/* comment */ === '';`,
    ),

    // `!==` binds more loosely than `>` and `<`
    withEmptyStringFix(
      'declare const first: string; declare const second: string; first.length > 0 === second.length > 0;',
      "declare const first: string; declare const second: string; (first !== '') === (second !== '');",
      2,
    ),
    withEmptyStringFix(
      `${STRING_DECLARATION} declare const flag: boolean; flag === 0 < value.length;`,
      `${STRING_DECLARATION} declare const flag: boolean; flag === ('' !== value);`,
    ),
    withEmptyStringFix(
      `${STRING_DECLARATION} value.length > 0 as boolean;`,
      `${STRING_DECLARATION} (value !== '') as boolean;`,
    ),
    withEmptyStringFix(
      `${STRING_DECLARATION} value.length > 0 && value.length > 1;`,
      `${STRING_DECLARATION} value !== '' && value.length > 1;`,
    ),
  ],
});

it('throws without type information', () => {
  expect(() =>
    new Linter().verify("value === '';", {
      plugins: {un: {rules: {[RULE_NAME]: consistentEmptyStringCheck}}},
      rules: {[`un/${RULE_NAME}`]: 'error'},
    }),
  ).toThrow('This rule requires type information');
});

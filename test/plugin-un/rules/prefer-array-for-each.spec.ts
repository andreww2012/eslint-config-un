/* eslint-disable vitest/require-hook -- `RuleTester` generates its own `describe`/`it` blocks */
import path from 'node:path';
import {RuleTester} from 'eslint';
import {parser as typescriptParser} from 'typescript-eslint';
import {preferArrayForEach} from '../../../src/plugin-un/rules/prefer-array-for-each';

const RULE_NAME = 'prefer-array-for-each';

const withFix = (code: string, output: string) => ({
  code,
  output,
  errors: [{messageId: 'preferForEach'}],
});

const withSuggestion = (code: string, output: string) => ({
  code,
  errors: [{messageId: 'preferForEach', suggestions: [{messageId: 'replaceWithForEach', output}]}],
});

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, preferArrayForEach, {
  valid: [
    'array.forEach((element) => bar(element));',

    // Can't be done in a callback
    'for (const element of array) { if (element === target) { break; } }',
    'for (const element of array) { await bar(element); }',
    'for (const element of array) { for await (const item of element) {} }',
    'function foo() { for (const element of array) { return element; } }',
    'function* foo() { for (const element of array) { yield element; } }',
    'for (const element of array) { var last = element; }',
    'outer: for (const element of array) { bar(element); }',
    'outer: for (const row of rows) { for (const cell of row) { continue outer; } }',
    'outer: for (const row of rows) { for (const cell of row) { break outer; } }',
    'for (let index = 0; index < array.length; index++) { if (array[index]) { break; } }',

    // The loop variable outlives the loop
    'for (var element of array) {}',
    'let element; for (element of array) {}',
    'for await (const element of array) {}',

    // Not arrays
    "for (const character of 'text') {}",
    'for (const character of `text`) {}',
    'for (const [key, value] of new Map()) {}',
    'const set = new Set(); for (const value of set) {}',
    "const text = 'text'; for (let index = 0; index < text.length; index++) {}",

    // `.entries()` with a pattern that has no `forEach` counterpart
    'for (const entry of array.entries()) {}',
    'for (const [index] of array.entries()) {}',
    'for (const [index, ...rest] of array.entries()) {}',
    'for (const [{length}, element] of array.entries()) {}',
    'for (const [index, element, extra] of array.entries()) {}',

    // Not a plain walk over every index
    'for (let index = 1; index < array.length; index++) {}',
    'for (let index = 0; index <= array.length; index++) {}',
    'for (let index = 0; index < array.length; index += 2) {}',
    'for (let index = 0; index < array.length; index--) {}',
    'for (let index = 0; index < array.length; index++) { index++; }',
    'for (let index = 0, length = array.length; index < length; index++) {}',
    'for (var index = 0; index < array.length; index++) {}',
    'for (let index = 0; index < getArray().length; index++) {}',
    'for (let index = 0; index < array?.length; index++) {}',
    'for (let index = 0; index < array[key].length; index++) {}',
  ],
  invalid: [
    withSuggestion(
      'for (const element of array) {\n  bar(element);\n}',
      'array.forEach((element) => {\n  bar(element);\n});',
    ),
    withFix(
      'const array = [1, 2];\nfor (const element of array) {\n  bar(element);\n}',
      'const array = [1, 2];\narray.forEach((element) => {\n  bar(element);\n});',
    ),
    withFix('for (let element of [1]) {}', '[1].forEach((element) => {});'),
    withFix('for (const {name} of Array.of(1)) {}', 'Array.of(1).forEach(({name}) => {});'),
    withFix(
      'for (const [key, value] of Object.entries(object)) {}',
      'Object.entries(object).forEach(([key, value]) => {});',
    ),
    withSuggestion(
      'for (const element of array) bar(element)',
      'array.forEach((element) => { bar(element) });',
    ),

    // Not known to be arrays
    withSuggestion('for (const element of [1, , 3]) {}', '[1, , 3].forEach((element) => {});'),
    withSuggestion(
      'for (const element of new Array(3)) {}',
      '(new Array(3)).forEach((element) => {});',
    ),
    withSuggestion(
      'const array = Array(3); for (const element of array) {}',
      'const array = Array(3); array.forEach((element) => {});',
    ),
    withSuggestion(
      'let array = [1]; array = other; for (const element of array) {}',
      'let array = [1]; array = other; array.forEach((element) => {});',
    ),

    // Parentheses and semicolons
    withSuggestion(
      'for (const element of first || second) {}',
      '(first || second).forEach((element) => {});',
    ),
    withSuggestion(
      'for (const element of await getArray()) {}',
      '(await getArray()).forEach((element) => {});',
    ),
    withFix('foo()\nfor (const element of [1]) {}', 'foo()\n;[1].forEach((element) => {});'),
    withFix('foo();\nfor (const element of [1]) {}', 'foo();\n[1].forEach((element) => {});'),
    withFix(
      'if (foo) {}\nfor (const element of [1]) {}',
      'if (foo) {}\n[1].forEach((element) => {});',
    ),
    withFix('if (foo) for (const element of [1]) {}', 'if (foo) [1].forEach((element) => {});'),

    // `.entries()`
    withSuggestion(
      'for (const [index, element] of array.entries()) {\n  bar(element, index);\n}',
      'array.forEach((element, index) => {\n  bar(element, index);\n});',
    ),
    withSuggestion(
      'for (const [, element] of array.entries()) {}',
      'array.forEach((element) => {});',
    ),
    withFix(
      'for (const [index, {name}] of Object.keys(object).entries()) {}',
      'Object.keys(object).forEach(({name}, index) => {});',
    ),

    // Control flow that works in a callback
    withFix(
      'for (const element of [1]) {\n  if (element) {\n    continue;\n  }\n  bar(element);\n}',
      '[1].forEach((element) => {\n  if (element) {\n    return;\n  }\n  bar(element);\n});',
    ),
    withFix(
      'for (const element of [1]) { switch (element) { case 1: continue; default: break; } }',
      '[1].forEach((element) => { switch (element) { case 1: return; default: break; } });',
    ),
    withFix(
      'for (const row of [[1]]) { for (const cell of row) { if (cell) { break; } continue; } }',
      '[[1]].forEach((row) => { for (const cell of row) { if (cell) { break; } continue; } });',
    ),
    withFix(
      'for (const element of [1]) { block: { break block; } }',
      '[1].forEach((element) => { block: { break block; } });',
    ),
    withFix(
      'for (const element of [1]) { push(async function () { var value = await element; return value; }); }',
      '[1].forEach((element) => { push(async function () { var value = await element; return value; }); });',
    ),
    {
      code: 'for (const row of rows) {\n  for (const cell of await row) {}\n}',
      errors: [
        {
          messageId: 'preferForEach',
          line: 2,
          suggestions: [
            {
              messageId: 'replaceWithForEach',
              output: 'for (const row of rows) {\n  (await row).forEach((cell) => {});\n}',
            },
          ],
        },
      ],
    },
    {
      code: 'for (const row of rows) { for (const cell of row) {} }',
      errors: [
        {
          messageId: 'preferForEach',
          column: 1,
          endColumn: 24,
          suggestions: [
            {
              messageId: 'replaceWithForEach',
              output: 'rows.forEach((row) => { for (const cell of row) {} });',
            },
          ],
        },
        {
          messageId: 'preferForEach',
          column: 27,
          suggestions: [
            {
              messageId: 'replaceWithForEach',
              output: 'for (const row of rows) { row.forEach((cell) => {}); }',
            },
          ],
        },
      ],
    },

    // The comments would be lost
    {
      code: 'for (const element /* comment */ of [1]) {}',
      output: null,
      errors: [{messageId: 'preferForEach'}],
    },

    // Classic `for` loops
    withSuggestion(
      'for (let index = 0; index < array.length; index++) {\n  bar(array[index], index);\n}',
      'array.forEach((element, index) => {\n  bar(element, index);\n});',
    ),
    withFix(
      'const array = [1];\nfor (let index = 0; index < array.length; ++index) {\n  bar(array[index]);\n}',
      'const array = [1];\narray.forEach((element) => {\n  bar(element);\n});',
    ),
    withSuggestion(
      'for (let index = 0; index < this.items.length; index += 1) { bar(this.items[index]); }',
      'this.items.forEach((element) => { bar(element); });',
    ),
    withSuggestion(
      'for (let index = 0; index < array.length; index++) { if (array[index]) { continue; } }',
      'array.forEach((element) => { if (element) { return; } });',
    ),
    withSuggestion(
      'for (let index = 0; index < array.length; index++) { bar(array[index], element); }',
      'array.forEach((element2) => { bar(element2, element); });',
    ),

    // The name of the element variable is taken over
    withSuggestion(
      'for (let index = 0; index < array.length; index++) {\n  const item = array[index];\n  bar(item, array[index]);\n}',
      'array.forEach((item) => {\n  bar(item, item);\n});',
    ),
    withSuggestion(
      'for (let index = 0; index < array.length; index++) {const item = array[index]; bar(item);}',
      'array.forEach((item) => { bar(item);});',
    ),
    withSuggestion(
      'for (let index = 0; index < array.length; index++) { const item = array[index]; { const item = 1; bar(array[index]); } }',
      'array.forEach((element) => { const item = element; { const item = 1; bar(element); } });',
    ),
    withSuggestion(
      'for (let index = 0; index < array.length; index++) { let item = array[index]; item = 1; }',
      'array.forEach((element) => { let item = element; item = 1; });',
    ),
    withSuggestion(
      'for (let index = 0; index < array.length; index++) { const item = /* comment */ array[index]; }',
      'array.forEach((element) => { const item = /* comment */ element; });',
    ),

    // The element is read anew after the array may have changed
    withSuggestion(
      'for (let index = 0; index < array.length; index++) { array[index] = array[index] * 2; }',
      'array.forEach((element, index) => { array[index] = array[index] * 2; });',
    ),
    withSuggestion(
      'for (let index = 0; index < array.length; index++) { array.pop(); bar(array[index]); }',
      'array.forEach((element, index) => { array.pop(); bar(array[index]); });',
    ),
    withSuggestion(
      'for (let index = 0; index < this.items.length; index++) { this.update(); bar(this.items[index]); }',
      'this.items.forEach((element, index) => { this.update(); bar(this.items[index]); });',
    ),
    withSuggestion(
      'for (let index = 0; index < array.length; index++) { array[index](); delete array[index]; array[index]++; }',
      'array.forEach((element, index) => { array[index](); delete array[index]; array[index]++; });',
    ),
    withSuggestion(
      'for (let index = 0; index < array.length; index++) { [array[index]] = [1]; ({key: array[index]} = object); }',
      'array.forEach((element, index) => { [array[index]] = [1]; ({key: array[index]} = object); });',
    ),
    withSuggestion(
      'for (let index = 0; index < array.length; index++) { bar(array[index]); array[index].baz(); }',
      'array.forEach((element) => { bar(element); element.baz(); });',
    ),
    withSuggestion(
      'for (let index = 0; index < array.length; index++) { bar({key: array[index]}, other[index]); }',
      'array.forEach((element, index) => { bar({key: element}, other[index]); });',
    ),
    withSuggestion(
      'for (let index = 0; index < array.length; index++) {}',
      'array.forEach((element) => {});',
    ),
  ],
});

const typescriptRuleTester = new RuleTester({languageOptions: {parser: typescriptParser}});

typescriptRuleTester.run(`${RULE_NAME} (TypeScript)`, preferArrayForEach, {
  valid: [
    'function foo(text: string) { for (const character of text) {} }',
    'for (const element of array) { await using resource = element; }',
  ],
  invalid: [
    withFix(
      'function foo(items: string[]) { for (const item of items) {} }',
      'function foo(items: string[]) { items.forEach((item) => {}); }',
    ),
    withFix(
      'function foo(items: readonly [string]) { for (const item of items) {} }',
      'function foo(items: readonly [string]) { items.forEach((item) => {}); }',
    ),
    withFix(
      'function foo(items: Array<string> | ReadonlyArray<number>) { for (const item of items) {} }',
      'function foo(items: Array<string> | ReadonlyArray<number>) { items.forEach((item) => {}); }',
    ),
    withFix(
      'const items: string[] = getItems(); for (const item of items) {}',
      'const items: string[] = getItems(); items.forEach((item) => {});',
    ),
    withSuggestion(
      'function foo(items: Set<string>) { for (const item of items) {} }',
      'function foo(items: Set<string>) { items.forEach((item) => {}); }',
    ),
    withSuggestion(
      'for (const item of items as string[]) {}',
      '(items as string[]).forEach((item) => {});',
    ),
    withSuggestion('for (const item of items!) {}', 'items!.forEach((item) => {});'),
    withSuggestion(
      'for (let index = 0; index < array.length; index++) { bar(array[index]!, (array[index] as number) + 1); }',
      'array.forEach((element) => { bar(element!, (element as number) + 1); });',
    ),
    withSuggestion(
      'for (let index = 0; index < array.length; index++) { const item: string = array[index]; }',
      'array.forEach((element) => { const item: string = element; });',
    ),
    withSuggestion(
      'for (let index = 0; index < array.length; index++) { const item = array[index]!; }',
      'array.forEach((element) => { const item = element!; });',
    ),
    withSuggestion(
      'for (let index = 0; index < array.length; index++) { array[index]! = 1; (array[index] as number)++; }',
      'array.forEach((element, index) => { array[index]! = 1; (array[index] as number)++; });',
    ),
  ],
});

const FIXTURES_DIRECTORY = path.join(import.meta.dirname, 'fixtures');

const typeAwareRuleTester = new RuleTester({
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {projectService: true, tsconfigRootDir: FIXTURES_DIRECTORY},
  },
});

const withTypedFile = <TestCase extends {code: string}>(testCase: TestCase) => ({
  ...testCase,
  filename: path.join(FIXTURES_DIRECTORY, 'file.ts'),
});

typeAwareRuleTester.run(`${RULE_NAME} (type information)`, preferArrayForEach, {
  valid: [
    'declare const map: Map<string, number>; for (const [key, value] of map) {}',
    'declare function getText(): string; for (const character of getText()) {}',
    'declare function getItems(): Iterable<number>; for (const item of getItems()) {}',
    'declare const set: Set<number>; for (const [index, item] of set.entries()) {}',
    'function foo() { for (const argument of arguments) {} }',
    `declare function getText(): string;
     const text = getText();
     for (let index = 0; index < text.length; index++) { bar(text[index]); }`,
  ].map((code) => withTypedFile({code})),
  invalid: [
    withFix(
      'declare function getItems(): string[]; for (const item of getItems()) {}',
      'declare function getItems(): string[]; getItems().forEach((item) => {});',
    ),
    withFix(
      'declare function getItems(): string[] | [number] | undefined; for (const item of getItems()!) {}',
      'declare function getItems(): string[] | [number] | undefined; getItems()!.forEach((item) => {});',
    ),
    withFix(
      'declare const items: string[] | undefined; for (const item of items) {}',
      'declare const items: string[] | undefined; items.forEach((item) => {});',
    ),
    withFix(
      'declare function getItems(): string[] & {brand: true}; for (const item of getItems()) {}',
      'declare function getItems(): string[] & {brand: true}; getItems().forEach((item) => {});',
    ),
    withFix(
      'declare const match: RegExpMatchArray; for (const part of match) {}',
      'declare const match: RegExpMatchArray; match.forEach((part) => {});',
    ),
    withFix(
      'function foo<T extends readonly number[]>(items: T) { for (const item of items) {} }',
      'function foo<T extends readonly number[]>(items: T) { items.forEach((item) => {}); }',
    ),
    withFix(
      'declare function getItems(): number[]; const items = getItems(); for (const [index, item] of items.entries()) {}',
      'declare function getItems(): number[]; const items = getItems(); items.forEach((item, index) => {});',
    ),
    withFix(
      'declare function getItems(): number[]; const items = getItems(); for (let index = 0; index < items.length; index++) { bar(items[index]); }',
      'declare function getItems(): number[]; const items = getItems(); items.forEach((element) => { bar(element); });',
    ),

    // Types can't tell
    withSuggestion(
      'declare const items: any; for (const item of items) {}',
      'declare const items: any; items.forEach((item) => {});',
    ),
    withSuggestion(
      'function foo<T>(items: T) { for (const item of items) {} }',
      'function foo<T>(items: T) { items.forEach((item) => {}); }',
    ),
    withSuggestion(
      'declare function getItems(): string[] | Set<string>; for (const item of getItems()) {}',
      'declare function getItems(): string[] | Set<string>; getItems().forEach((item) => {});',
    ),
    withSuggestion(
      'for (const item of new Array<number>(3)) {}',
      '(new Array<number>(3)).forEach((item) => {});',
    ),
  ].map(withTypedFile),
});

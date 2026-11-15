/* eslint-disable vitest/require-hook -- `RuleTester` generates its own `describe`/`it` blocks */
import path from 'node:path';
import markdown from '@eslint/markdown';
import {RuleTester} from 'eslint';
import {parser as typescriptParser} from 'typescript-eslint';
import * as vueParser from 'vue-eslint-parser';
import {noArraySort} from '../../../src/plugin-un/rules/no-array-sort';

const RULE_NAME = 'no-array-sort';

const FIXTURES_DIRECTORY = path.join(import.meta.dirname, 'fixtures');

const withSuggestion = (code: string, output: string) => ({
  code,
  errors: [{messageId: 'preferCopy', suggestions: [{messageId: 'switchToCopy', output}]}],
});

const withFix = (code: string, output: string) => ({
  code,
  output,
  errors: [{messageId: 'preferInPlace'}],
});

// Without type information, a method named like one returning a new array may belong to anything
const withInPlaceSuggestion = (code: string, output: string) => ({
  code,
  errors: [{messageId: 'preferInPlace', suggestions: [{messageId: 'switchToInPlace', output}]}],
});

const withTypedFile = <TestCase extends {code: string}>(testCase: TestCase) => ({
  ...testCase,
  filename: path.join(FIXTURES_DIRECTORY, 'file.ts'),
});

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, noArraySort, {
  valid: [
    // Sorted in place on purpose
    'array.sort();',
    'array?.sort();',
    'isSorted || array.sort();',
    'void array.sort();',
    '(array.sort(), other);',
    'isSorted ? null : array.sort();',

    // New arrays nothing else references
    'const sorted = array.filter(Boolean).sort();',
    'const sorted = array.map((item) => item.name).sort(compare);',
    'const sorted = array?.filter(Boolean).sort();',
    'const sorted = (array?.filter(Boolean)).sort();',
    'const sorted = array.flatMap((item) => item.children).sort();',
    'const sorted = array.slice().sort();',
    'const sorted = array.concat(other).sort();',
    'const sorted = array.splice(0, 2).sort();',
    'const sorted = array.toReversed().sort();',
    'const sorted = array.filter(Boolean).reverse().sort();',
    'const sorted = Array(3).fill(0).sort();',
    'const sorted = [...set].sort();',
    'const sorted = [b, a].sort();',
    'const sorted = [b, , a].sort();',
    'const sorted = Array.from(set).sort();',
    'const sorted = Object.keys(object).sort();',
    'const sorted = Object.entries(object).sort(([a], [b]) => a.localeCompare(b));',
    'const sorted = Reflect.ownKeys(object).sort();',
    "const sorted = text.split(',').sort();",
    'const sorted = iterator.toArray().sort();',
    'const sorted = text.match(/\\w+/g).sort();',
    'const sorted = structuredClone(array).sort();',
    'const sorted = JSON.parse(text).sort();',
    'async function foo() { return (await Promise.all(promises)).sort(); }',

    // Variables used for the last time
    'function foo(array) { const items = array.filter(Boolean); return items.sort(); }',
    `function foo(array) {
       const items = array.filter(Boolean);
       if (items.length === 0) { return []; }
       items.push(...array);
       for (const item of items) { bar(item); }
       for (const [index, item] of items.entries()) { bar(index, item); }
       items.sort();
       return items.sort();
     }`,
    `function foo(first, second) {
       let items = first.filter(Boolean);
       if (second) { items = second.map(bar); }
       return items.sort();
     }`,
    'function foo(array) { for (const list of array) { const items = list.filter(Boolean); bar(items.sort()); } }',
    'const items = array.filter(Boolean); const sorted = items.sort();',

    // Unlike arrays, these sort with an argument that is not a function
    'const cursor = collection.find().sort({name: 1});',
    "const query = builder.sort('name');",

    // Not supported calls
    'const sorted = array.sort(compare, other);',
    'const sorted = array.sort?.();',
    "const sorted = array['sort']();",

    // Copies of arrays that may be used elsewhere
    'const sorted = array.toSorted();',
    'const sorted = this.items.toSorted(compare);',
    'function foo(array) { const items = array.filter(Boolean); const sorted = items.toSorted(); return [items, sorted]; }',
    'function foo(array) { const items = array.filter(Boolean); bar(items); return items.toSorted(); }',

    // Holes stay holes after `sort()`, but `toSorted()` fills them with `undefined`
    'const sorted = [b, , a].toSorted();',
    'const sorted = Array(3).toSorted();',
    'function foo() { const items = Array(3); return items.toSorted(); }',

    // A copy loses the properties added to the array
    "function foo() { const items = [b, a]; items.label = 'x'; return items.toSorted(); }",

    // Declarations shadowing the globals
    "import {Object} from 'object';\nconst sorted = Object.keys(object).toSorted();",
    'function foo(structuredClone) { return structuredClone(array).toSorted(); }',
    'function foo(Array) { return Array.from(set).toSorted(); }',
  ],
  invalid: [
    withSuggestion('const sorted = array.sort();', 'const sorted = array.toSorted();'),
    withSuggestion('const sorted = array?.sort();', 'const sorted = array?.toSorted();'),
    withSuggestion(
      'function foo() { return this.items.sort(compare); }',
      'function foo() { return this.items.toSorted(compare); }',
    ),
    withSuggestion('foo(array.sort());', 'foo(array.toSorted());'),
    withSuggestion('array = array.sort();', 'array = array.toSorted();'),
    withSuggestion('const sorted = getItems().sort();', 'const sorted = getItems().toSorted();'),
    withSuggestion(
      'async function foo() { return (await getItems()).sort(); }',
      'async function foo() { return (await getItems()).toSorted(); }',
    ),
    withSuggestion(
      'const sorted = new Uint8Array(buffer).sort();',
      'const sorted = new Uint8Array(buffer).toSorted();',
    ),
    withSuggestion(
      'const sorted = array.sort().map(bar);',
      'const sorted = array.toSorted().map(bar);',
    ),
    withSuggestion(
      'const sorted = array.reverse().sort();',
      'const sorted = array.reverse().toSorted();',
    ),
    // Declarations shadowing the globals
    withSuggestion(
      "import {Array} from 'list';\nconst sorted = Array.from(set).sort();",
      "import {Array} from 'list';\nconst sorted = Array.from(set).toSorted();",
    ),
    withSuggestion(
      'const JSON = {parse: () => cache}; const sorted = JSON.parse(text).sort();',
      'const JSON = {parse: () => cache}; const sorted = JSON.parse(text).toSorted();',
    ),
    withSuggestion(
      'async function foo(Promise) { return (await Promise.all(promises)).sort(); }',
      'async function foo(Promise) { return (await Promise.all(promises)).toSorted(); }',
    ),
    withSuggestion(
      'function foo(Array) { return Array(3).sort(); }',
      'function foo(Array) { return Array(3).toSorted(); }',
    ),
    {
      ...withSuggestion(
        'var Object = getObject(); const sorted = Object.keys(object).sort();',
        'var Object = getObject(); const sorted = Object.keys(object).toSorted();',
      ),
      languageOptions: {sourceType: 'script'},
    },

    // The array of a variable that is used elsewhere
    withSuggestion(
      'function foo(array) { const items = array.filter(Boolean); bar(items); return items.sort(); }',
      'function foo(array) { const items = array.filter(Boolean); bar(items); return items.toSorted(); }',
    ),
    withSuggestion(
      'function foo(array) { const items = array.filter(Boolean); const sorted = items.sort(); return [items, sorted]; }',
      'function foo(array) { const items = array.filter(Boolean); const sorted = items.toSorted(); return [items, sorted]; }',
    ),
    withSuggestion(
      'function foo(array) { const items = array.filter(Boolean); const alias = items.reverse(); return items.sort(); }',
      'function foo(array) { const items = array.filter(Boolean); const alias = items.reverse(); return items.toSorted(); }',
    ),
    withSuggestion(
      'function foo(array) { const items = array.filter(Boolean); const iterator = items.values(); return items.sort(); }',
      'function foo(array) { const items = array.filter(Boolean); const iterator = items.values(); return items.toSorted(); }',
    ),
    withSuggestion(
      'function foo(array) { let items = array.filter(Boolean); items = other; return items.sort(); }',
      'function foo(array) { let items = array.filter(Boolean); items = other; return items.toSorted(); }',
    ),
    withSuggestion(
      'function foo(array) { const items = array.filter(Boolean); return items.sort((a, b) => items.indexOf(a) - items.indexOf(b)); }',
      'function foo(array) { const items = array.filter(Boolean); return items.toSorted((a, b) => items.indexOf(a) - items.indexOf(b)); }',
    ),
    // Each run gets the same array
    withSuggestion(
      'function foo(array) { const items = array.filter(Boolean); while (bar()) { baz(items.sort()); } }',
      'function foo(array) { const items = array.filter(Boolean); while (bar()) { baz(items.toSorted()); } }',
    ),
    withSuggestion(
      'function foo(array) { for (const items = array.filter(Boolean); bar();) { baz(items.sort()); } }',
      'function foo(array) { for (const items = array.filter(Boolean); bar();) { baz(items.toSorted()); } }',
    ),
    withSuggestion(
      'function foo(array) { const items = array.filter(Boolean); const log = () => { for (const item of items) { bar(item); } }; return items.sort(); }',
      'function foo(array) { const items = array.filter(Boolean); const log = () => { for (const item of items) { bar(item); } }; return items.toSorted(); }',
    ),
    withSuggestion(
      'function foo(array) { const items = array.filter(Boolean); return () => items.sort(); }',
      'function foo(array) { const items = array.filter(Boolean); return () => items.toSorted(); }',
    ),
    withSuggestion(
      'export const items = array.filter(Boolean); export const sorted = items.sort();',
      'export const items = array.filter(Boolean); export const sorted = items.toSorted();',
    ),
    {
      ...withSuggestion(
        'const items = array.filter(Boolean); const sorted = items.sort();',
        'const items = array.filter(Boolean); const sorted = items.toSorted();',
      ),
      languageOptions: {sourceType: 'script'},
    },

    // Copies of new arrays
    withInPlaceSuggestion(
      'const sorted = array.filter(Boolean).toSorted();',
      'const sorted = array.filter(Boolean).sort();',
    ),
    withInPlaceSuggestion(
      'const sorted = array?.filter(Boolean).toSorted();',
      'const sorted = array?.filter(Boolean).sort();',
    ),
    withInPlaceSuggestion(
      'const sorted = array.filter(Boolean)?.toSorted();',
      'const sorted = array.filter(Boolean)?.sort();',
    ),
    withInPlaceSuggestion(
      'const sorted = array.map((item) => item.name).toSorted(compare);',
      'const sorted = array.map((item) => item.name).sort(compare);',
    ),
    withFix(
      'const sorted = Object.keys(object).toSorted();',
      'const sorted = Object.keys(object).sort();',
    ),
    withFix('const sorted = [...set].toSorted();', 'const sorted = [...set].sort();'),
    withFix(
      'const sorted = array.toReversed().toSorted();',
      'const sorted = array.toReversed().sort();',
    ),
    withFix(
      'const sorted = structuredClone(array).toSorted();',
      'const sorted = structuredClone(array).sort();',
    ),
    withInPlaceSuggestion(
      'function foo(array) { const items = array.filter(Boolean); return items.toSorted(); }',
      'function foo(array) { const items = array.filter(Boolean); return items.sort(); }',
    ),
    withFix(
      'function foo(object) { const items = Object.values(object); items[0] = items[1]; items.length = 1; return items.toSorted(); }',
      'function foo(object) { const items = Object.values(object); items[0] = items[1]; items.length = 1; return items.sort(); }',
    ),
    // A copy assigned back to the only reference
    withInPlaceSuggestion(
      'function foo(array) { let items = array.filter(Boolean); items = items.toSorted(); bar(items.length); }',
      'function foo(array) { let items = array.filter(Boolean); items.sort(); bar(items.length); }',
    ),
    withFix(
      'let items = [b, a];\nfor (const [index, item] of items.entries()) { bar(index, item); }\nitems = items.toSorted(compare);\nbar(...items);',
      'let items = [b, a];\nfor (const [index, item] of items.entries()) { bar(index, item); }\nitems.sort(compare);\nbar(...items);',
    ),
    {
      code: 'let items = [b, a]; items = /* sorted */ items.toSorted(); bar(items[0]);',
      errors: [{messageId: 'preferInPlace'}],
    },
    {
      code: 'let items = [b, a]; items = (items.toSorted()); bar(items[0]);',
      errors: [{messageId: 'preferInPlace'}],
    },
    {
      code: 'let items = [b, a]; items = (items).toSorted(); bar(items[0]);',
      errors: [{messageId: 'preferInPlace'}],
    },
  ],
});

ruleTester.run(`${RULE_NAME} (copies assigned back)`, noArraySort, {
  valid: [
    // The array is also referenced elsewhere
    'let items = [b, a]; bar(items); items = items.toSorted();',
    'let items = [b, a]; const alias = items; items = items.toSorted();',
    'let items = [b, a]; const iterator = items.values(); items = items.toSorted();',
    'let items = [b, a]; const alias = items.reverse(); items = items.toSorted();',
    'let items = [b, a]; const alias = items.valueOf(); items = items.toSorted();',
    // A copy loses the properties added to the array, and a deleted element leaves a hole
    "let items = [b, a]; items.label = 'x'; items = items.toSorted();",
    'let items = [b, a]; delete items[0]; items = items.toSorted();',
    'export let items = [b, a]; items = items.toSorted();',
    'let items = getItems(); items = items.toSorted();',
    'let items = [b, a]; items = other; items = items.toSorted();',
    // A loop over the array would see the in-place change
    'let items = [b, a]; for (const item of items) { items = items.toSorted(); }',
    'let items = [b, a]; for (const [index, item] of items.entries()) { items = items.toSorted(); }',
    // A function may run in the middle of a loop over the array
    'let items = [b, a]; const sort = () => { items = items.toSorted(); }; items.forEach(sort);',
    'let items = [b, a]; function* foo() { for (const item of items) { yield item; } } items = items.toSorted();',
  ],
  invalid: [
    // The old array is not used after the assignment either
    withFix(
      'let items = [b, a]; const sorted = (items = items.toSorted());',
      'let items = [b, a]; const sorted = (items = items.sort());',
    ),
  ],
});

ruleTester.run(`${RULE_NAME} (unneededCopies: allow)`, noArraySort, {
  valid: [
    'const sorted = array.filter(Boolean).sort();',
    'const sorted = array.filter(Boolean).toSorted();',
    'let items = [b, a]; items = items.toSorted(); bar(items[0]);',
  ].map((code) => ({code, options: [{unneededCopies: 'allow'}]})),
  invalid: [
    {
      ...withSuggestion('const sorted = array.sort();', 'const sorted = array.toSorted();'),
      options: [{unneededCopies: 'allow'}],
    },
  ],
});

ruleTester.run(`${RULE_NAME} (unneededCopies: require)`, noArraySort, {
  valid: [
    'array.sort();',
    'array.filter(Boolean).sort();',
    '(array.sort(), other);',
    'const sorted = array.filter(Boolean).toSorted();',
    'let items = [b, a]; items = items.toSorted(); bar(items[0]);',
  ].map((code) => ({code, options: [{unneededCopies: 'require'}]})),
  invalid: [
    withSuggestion('const sorted = array.sort();', 'const sorted = array.toSorted();'),
    withSuggestion('isSorted || array.sort();', 'isSorted || array.toSorted();'),
    withSuggestion('void array.sort();', 'void array.toSorted();'),
    withSuggestion(
      'const sorted = array.filter(Boolean).sort();',
      'const sorted = array.filter(Boolean).toSorted();',
    ),
    withSuggestion(
      'function foo(array) { const items = array.filter(Boolean); return items.sort(); }',
      'function foo(array) { const items = array.filter(Boolean); return items.toSorted(); }',
    ),
    withSuggestion(
      'const sorted = [/* set */ ...set].sort();',
      'const sorted = [/* set */ ...set].toSorted();',
    ),
    {
      code: '[...array].sort();',
      errors: [
        {
          messageId: 'preferCopy',
          suggestions: [
            {messageId: 'switchToCopyOfSpread', output: 'array.toSorted();'},
            {messageId: 'switchToCopy', output: '[...array].toSorted();'},
          ],
        },
      ],
    },
    {
      code: 'const sorted = [...array].sort(compare);',
      errors: [
        {
          messageId: 'preferCopy',
          suggestions: [
            {messageId: 'switchToCopyOfSpread', output: 'const sorted = array.toSorted(compare);'},
            {messageId: 'switchToCopy', output: 'const sorted = [...array].toSorted(compare);'},
          ],
        },
      ],
    },
    {
      code: 'const sorted = [...(first || second)].sort();',
      errors: [
        {
          messageId: 'preferCopy',
          suggestions: [
            {
              messageId: 'switchToCopyOfSpread',
              output: 'const sorted = (first || second).toSorted();',
            },
            {
              messageId: 'switchToCopy',
              output: 'const sorted = [...(first || second)].toSorted();',
            },
          ],
        },
      ],
    },
  ].map((testCase) => ({...testCase, options: [{unneededCopies: 'require'}]})),
});

const typescriptRuleTester = new RuleTester({languageOptions: {parser: typescriptParser}});

typescriptRuleTester.run(`${RULE_NAME} (TypeScript)`, noArraySort, {
  valid: [
    'const sorted = (array.filter(Boolean) as Item[]).sort();',
    'const sorted = array.filter(Boolean)!.sort();',
    // Read-only arrays and tuples have no in-place methods or get a wrong type from them
    'const sorted = ([b, a] as const).toSorted();',
    'function foo(array: Item[]) { const items: readonly Item[] = array.filter(Boolean); return items.toSorted(); }',
    'function foo(array: Item[]) { const items: Items = array.filter(Boolean); return items.toSorted(); }',
    'function foo() { const items = [b, a] as const; return items.toSorted(); }',
    'let items: [number, number] = [2, 1]; items = items.toSorted() as [number, number];',
    // A type of the same name may be read-only
    'type Array<Item> = readonly Item[]; let items: Array<number> = [b, a]; items = items.toSorted(); items.at(0);',
  ],
  invalid: [
    withInPlaceSuggestion(
      'const sorted = (array.filter(Boolean) as Item[]).toSorted();',
      'const sorted = (array.filter(Boolean) as Item[]).sort();',
    ),
    withInPlaceSuggestion(
      'function foo(array: Item[]) { const items: Item[] = array.filter(Boolean); return items.toSorted(); }',
      'function foo(array: Item[]) { const items: Item[] = array.filter(Boolean); return items.sort(); }',
    ),
    withFix(
      'let items = [] as Array<number>; items = items.toSorted(); bar(items[0]);',
      'let items = [] as Array<number>; items.sort(); bar(items[0]);',
    ),
    withFix(
      'let items = [b, a]; items = items.toSorted(); bar(items![0], (items as Item[]).length);',
      'let items = [b, a]; items.sort(); bar(items![0], (items as Item[]).length);',
    ),
    // A value doesn't shadow a type
    withFix(
      'const Array = getArray(); let items: Array<number> = [b, a]; items = items.toSorted(); items.at(0);',
      'const Array = getArray(); let items: Array<number> = [b, a]; items.sort(); items.at(0);',
    ),
  ],
});

const typeAwareRuleTester = new RuleTester({
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {projectService: true, tsconfigRootDir: FIXTURES_DIRECTORY},
  },
});

typeAwareRuleTester.run(`${RULE_NAME} (type information)`, noArraySort, {
  valid: [
    // No `toSorted()` to switch to
    'declare class Query { sort(): Query } declare const query: Query; const sorted = query.sort();',
    'declare const list: {sort: () => number[]}; const sorted = list.sort();',
    'declare const items: number[] | Set<number>; const sorted = items.sort();',
    // No `sort()` to switch to
    'declare const collection: {filter: () => {toSorted: () => number[]}}; const sorted = collection.filter().toSorted();',
    'declare const items: readonly number[]; function foo() { const copy = items.filter(Boolean) as readonly number[]; return copy.toSorted(); }',
    // Not known to be new arrays: `Buffer#slice()`, for example, returns a view of the same memory
    'declare const bytes: Uint8Array; const sorted = bytes.slice(0, 4).toSorted();',
    'declare const store: {filter: () => number[]}; const sorted = store.filter().toSorted();',
    'declare const bytes: Uint8Array; function foo() { let part = bytes.slice(0, 4); part = part.toSorted(); part.at(0); }',
  ].map((code) => withTypedFile({code})),
  invalid: [
    withSuggestion(
      'declare const items: number[]; const sorted = items.sort();',
      'declare const items: number[]; const sorted = items.toSorted();',
    ),
    withSuggestion(
      'declare const items: number[] | undefined; const sorted = items?.sort();',
      'declare const items: number[] | undefined; const sorted = items?.toSorted();',
    ),
    withSuggestion(
      'declare const items: any; const sorted = items.sort();',
      'declare const items: any; const sorted = items.toSorted();',
    ),
    withSuggestion(
      'declare const bytes: Uint8Array; const sorted = bytes.sort();',
      'declare const bytes: Uint8Array; const sorted = bytes.toSorted();',
    ),
    withSuggestion(
      'function foo<Items extends number[]>(items: Items) { return items.sort(); }',
      'function foo<Items extends number[]>(items: Items) { return items.toSorted(); }',
    ),
    withSuggestion(
      'declare const bytes: Uint8Array; const sorted = bytes.slice(0, 4).sort();',
      'declare const bytes: Uint8Array; const sorted = bytes.slice(0, 4).toSorted();',
    ),
    withSuggestion(
      'declare const store: {filter: () => number[]}; const sorted = store.filter().sort();',
      'declare const store: {filter: () => number[]}; const sorted = store.filter().toSorted();',
    ),
    withFix(
      'declare const items: readonly number[]; const sorted = items.filter(Boolean).toSorted();',
      'declare const items: readonly number[]; const sorted = items.filter(Boolean).sort();',
    ),
    withFix(
      'declare const items: number[]; const sorted = items?.map((item) => item * 2).toSorted();',
      'declare const items: number[]; const sorted = items?.map((item) => item * 2).sort();',
    ),
    withFix(
      "declare const text: string; const sorted = text.split(',').toSorted();",
      "declare const text: string; const sorted = text.split(',').sort();",
    ),
    withFix(
      'declare const items: number[]; let doubled = items.map((item) => item * 2); doubled = doubled.toSorted(); doubled.at(0);',
      'declare const items: number[]; let doubled = items.map((item) => item * 2); doubled.sort(); doubled.at(0);',
    ),
    withInPlaceSuggestion(
      'declare const items: any; const sorted = items.filter(Boolean).toSorted();',
      'declare const items: any; const sorted = items.filter(Boolean).sort();',
    ),
  ].map(withTypedFile),
});

const vueRuleTester = new RuleTester({languageOptions: {parser: vueParser}});

vueRuleTester.run(`${RULE_NAME} (Vue)`, noArraySort, {
  valid: [
    {
      // The template uses the array too
      code: '<script setup>\nconst items = Object.keys(object);\nconst sorted = items.toSorted();\n</script>\n<template>{{ items }}</template>',
      filename: 'component.vue',
    },
  ],
  invalid: [
    {
      ...withFix(
        '<script setup>\nconst items = Object.keys(object);\nconst sorted = items.toSorted();\n</script>\n<template>{{ sorted }}</template>',
        '<script setup>\nconst items = Object.keys(object);\nconst sorted = items.sort();\n</script>\n<template>{{ sorted }}</template>',
      ),
      filename: 'component.vue',
    },
  ],
});

// Other languages have no parser services
const markdownRuleTester = new RuleTester({plugins: {markdown}, language: 'markdown/commonmark'});

markdownRuleTester.run(`${RULE_NAME} (Markdown)`, noArraySort, {
  valid: ['```js\nconst sorted = array.sort();\n```'],
  invalid: [],
});

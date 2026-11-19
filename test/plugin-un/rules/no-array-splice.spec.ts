/* eslint-disable vitest/require-hook -- `RuleTester` generates its own `describe`/`it` blocks */
import path from 'node:path';
import {RuleTester} from 'eslint';
import {parser as typescriptParser} from 'typescript-eslint';
import {noArraySplice} from '../../../src/plugin-un/rules/no-array-splice';

const RULE_NAME = 'no-array-splice';

const FIXTURES_DIRECTORY = path.join(import.meta.dirname, 'fixtures');

const withFix = (code: string, output: string) => ({
  code,
  output,
  errors: [{messageId: 'preferInPlace'}],
});

const withInPlaceSuggestion = (code: string, output: string) => ({
  code,
  errors: [{messageId: 'preferInPlace', suggestions: [{messageId: 'switchToInPlace', output}]}],
});

const withCopySuggestion = (code: string, output: string) => ({
  code,
  options: [{unneededCopies: 'require'}],
  errors: [{messageId: 'preferCopy', suggestions: [{messageId: 'assignCopy', output}]}],
});

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, noArraySplice, {
  valid: [
    'array.splice(1, 1);',
    'const removed = array.splice(1, 1);',
    'const copy = array.toSpliced(1, 1);',
    'let items = [1, 2, 3]; items.splice(1, 1);',
    // `toSpliced()` returns the changed array, but `splice()` returns the removed elements
    'const changed = array.filter(Boolean).toSpliced(0, 1);',
    'function foo(array) { const items = array.filter(Boolean); return items.toSpliced(0, 1); }',
    // The array may be referenced elsewhere
    'array = array.toSpliced(1, 1);',
    'let items = getItems(); items = items.toSpliced(1, 1);',
    'let items = [1, 2, 3]; bar(items); items = items.toSpliced(1, 1);',
    'let items = [1, 2, 3]; const iterator = items.values(); items = items.toSpliced(1, 1);',
    // A loop over the array would see the in-place change
    'let items = [1, 2, 3]; for (const item of items) { items = items.toSpliced(0, 1); }',
    // A function may run in the middle of a loop over the array
    'let items = [1, 2, 3]; function remove() { items = items.toSpliced(0, 1); }',
  ],
  invalid: [
    withFix(
      'let items = [1, 2, 3]; items = items.toSpliced(1, 1); bar(items.length);',
      'let items = [1, 2, 3]; items.splice(1, 1); bar(items.length);',
    ),
    withInPlaceSuggestion(
      `function foo(array, value) {
         let items = array.filter(Boolean);
         for (const [index, item] of items.entries()) { bar(index, item); }
         if (value) { items = items.toSpliced(0, 1, value); }
         return [...items];
       }`,
      `function foo(array, value) {
         let items = array.filter(Boolean);
         for (const [index, item] of items.entries()) { bar(index, item); }
         if (value) { items.splice(0, 1, value); }
         return [...items];
       }`,
    ),
  ],
});

ruleTester.run(`${RULE_NAME} (unneededCopies: allow)`, noArraySplice, {
  valid: [
    'let items = [1, 2, 3]; items.splice(1, 1);',
    'let items = [1, 2, 3]; items = items.toSpliced(1, 1);',
  ].map((code) => ({code, options: [{unneededCopies: 'allow'}]})),
  invalid: [],
});

ruleTester.run(`${RULE_NAME} (unneededCopies: require)`, noArraySplice, {
  valid: [
    'let items = [1, 2, 3]; items = items.toSpliced(1, 1);',
    'let items = [1, 2, 3]; const removed = items.splice(1, 1);',
    // Can't be assigned again
    'const items = [1, 2, 3]; items.splice(1, 1);',
    // The array may be referenced elsewhere
    'let items = getItems(); items.splice(1, 1);',
    'let items = [1, 2, 3]; bar(items); items.splice(1, 1);',
    'let items = [1, 2, 3]; for (const item of items) { items.splice(0, 1); }',
    // Like the rule of the same name in `eslint-plugin-unicorn`, only reported when thrown away
    // unconditionally
    'let items = [1, 2, 3]; isEmpty || items.splice(0, 1);',
    'let items = [1, 2, 3]; void items.splice(0, 1);',
  ].map((code) => ({code, options: [{unneededCopies: 'require'}]})),
  invalid: [
    withCopySuggestion(
      'let items = [1, 2, 3]; items.splice(1, 1);',
      'let items = [1, 2, 3]; items = items.toSpliced(1, 1);',
    ),
    withCopySuggestion(
      'let items = [1, 2, 3]; items?.splice(1, 1);',
      'let items = [1, 2, 3]; items = items?.toSpliced(1, 1);',
    ),
    withCopySuggestion(
      'let items = [1, 2, 3]; (items.splice(0, 1), bar());',
      'let items = [1, 2, 3]; (items = items.toSpliced(0, 1), bar());',
    ),
  ],
});

const typescriptRuleTester = new RuleTester({languageOptions: {parser: typescriptParser}});

typescriptRuleTester.run(`${RULE_NAME} (TypeScript)`, noArraySplice, {
  valid: [
    {
      // A changed copy doesn't fit the tuple type
      code: 'let items: [number, number] = [1, 2]; items.splice(0, 1);',
      options: [{unneededCopies: 'require'}],
    },
  ],
  invalid: [
    withCopySuggestion(
      'let items: number[] = [1, 2]; (items as number[]).splice(0, 1);',
      'let items: number[] = [1, 2]; items = (items as number[]).toSpliced(0, 1);',
    ),
  ],
});

const typeAwareRuleTester = new RuleTester({
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {projectService: true, tsconfigRootDir: FIXTURES_DIRECTORY},
  },
});

typeAwareRuleTester.run(`${RULE_NAME} (type information)`, noArraySplice, {
  valid: [],
  invalid: [
    withFix(
      'let items = [1, 2, 3]; items = items.toSpliced(1, 1); items.push(4);',
      'let items = [1, 2, 3]; items.splice(1, 1); items.push(4);',
    ),
  ].map((testCase) => ({...testCase, filename: path.join(FIXTURES_DIRECTORY, 'file.ts')})),
});

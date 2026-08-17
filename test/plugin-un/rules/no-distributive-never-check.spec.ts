/* eslint-disable vitest/require-hook -- `RuleTester` generates its own `describe`/`it` blocks */
import {parseForESLint as parseWithTypescriptParser} from '@typescript-eslint/parser';
import {RuleTester} from 'eslint';
import {parser as typescriptParser} from 'typescript-eslint';
import {noDistributiveNeverCheck} from '../../../src/plugin-un/rules/no-distributive-never-check';

const RULE_NAME = 'no-distributive-never-check';

const typescriptRuleTester = new RuleTester({languageOptions: {parser: typescriptParser}});

typescriptRuleTester.run(RULE_NAME, noDistributiveNeverCheck, {
  valid: [
    'type IsNever<T> = [T] extends [never] ? true : false;',
    'type IsNever<T> = [T] extends never ? true : false;',
    'type NotNever<T> = T extends never[] ? true : false;',
    'type NotNever<T> = T[] extends never ? true : false;',
    'type NotNever<T> = T extends string ? true : false;',
    'type Constrained<T extends never> = T;',

    // Only naked type parameters are distributed over
    'type Never = never; type IsNever = Never extends never ? true : false;',
    'type IsNever = string extends never ? true : false;',
    'type IsNever<T> = keyof T extends never ? true : false;',
    'type IsNever<T> = Namespace.Type extends never ? true : false;',
    'type IsNever<T> = T[number] extends never ? true : false;',

    // A mapped type key is never instantiated with `never`
    'type Keys<T> = {[Key in keyof T]: Key extends never ? true : false};',
  ],
  invalid: [
    {
      code: 'type IsNever<T> = T extends never ? true : false;',
      errors: [
        {
          messageId: 'noDistributiveNeverCheck',
          data: {typeParameter: 'T'},
          suggestions: [
            {
              messageId: 'wrapBothSidesInTuples',
              data: {typeParameter: 'T'},
              output: 'type IsNever<T> = [T] extends [never] ? true : false;',
            },
          ],
        },
      ],
    },
    {
      code: 'interface Box<Value> {value: Value extends never ? null : Value}',
      errors: [
        {
          messageId: 'noDistributiveNeverCheck',
          suggestions: [
            {
              messageId: 'wrapBothSidesInTuples',
              output: 'interface Box<Value> {value: [Value] extends [never] ? null : Value}',
            },
          ],
        },
      ],
    },
    {
      code: 'const isNever = <T,>(value: T): T extends never ? true : false => value as never;',
      errors: [
        {
          messageId: 'noDistributiveNeverCheck',
          suggestions: [
            {
              messageId: 'wrapBothSidesInTuples',
              output:
                'const isNever = <T,>(value: T): [T] extends [never] ? true : false => value as never;',
            },
          ],
        },
      ],
    },
    {
      // `infer`red type parameters are distributed over just like the declared ones
      code: 'type Unwrap<T> = T extends Promise<infer Awaited> ? (Awaited extends never ? 1 : 2) : 3;',
      errors: [
        {
          messageId: 'noDistributiveNeverCheck',
          data: {typeParameter: 'Awaited'},
          suggestions: [
            {
              messageId: 'wrapBothSidesInTuples',
              output:
                'type Unwrap<T> = T extends Promise<infer Awaited> ? ([Awaited] extends [never] ? 1 : 2) : 3;',
            },
          ],
        },
      ],
    },
    {
      // Only `T extends never` is reported, not the whole conditional type
      code: `type IsNever<T> = T extends
        never ? true : false;`,
      errors: [
        {
          messageId: 'noDistributiveNeverCheck',
          line: 1,
          column: 19,
          endLine: 2,
          endColumn: 14,
          suggestions: [
            {
              messageId: 'wrapBothSidesInTuples',
              output: `type IsNever<T> = [T] extends
        [never] ? true : false;`,
            },
          ],
        },
      ],
    },
    {
      code: 'type Both<T, U> = T extends never ? U extends never ? 1 : 2 : 3;',
      errors: [
        {
          messageId: 'noDistributiveNeverCheck',
          data: {typeParameter: 'T'},
          suggestions: [
            {
              messageId: 'wrapBothSidesInTuples',
              output: 'type Both<T, U> = [T] extends [never] ? U extends never ? 1 : 2 : 3;',
            },
          ],
        },
        {
          messageId: 'noDistributiveNeverCheck',
          data: {typeParameter: 'U'},
          suggestions: [
            {
              messageId: 'wrapBothSidesInTuples',
              output: 'type Both<T, U> = T extends never ? [U] extends [never] ? 1 : 2 : 3;',
            },
          ],
        },
      ],
    },
  ],
});

// TypeScript-aware AST and scope analysis, but no parser services, just like a non-TypeScript
// parser would produce
const noParserServicesRuleTester = new RuleTester({
  languageOptions: {
    parser: {
      parseForESLint: (code: string) => {
        const {services, ...parseResultWithoutServices} = parseWithTypescriptParser(code);
        return parseResultWithoutServices;
      },
    },
  },
});

noParserServicesRuleTester.run(`${RULE_NAME} (no TypeScript parser)`, noDistributiveNeverCheck, {
  valid: ['type IsNever<T> = T extends never ? true : false;'],
  invalid: [],
});

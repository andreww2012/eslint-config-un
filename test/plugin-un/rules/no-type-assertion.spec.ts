/* eslint-disable vitest/require-hook -- `RuleTester` generates its own `describe`/`it` blocks */
import path from 'node:path';
import {
  type ParserOptions,
  parseForESLint as parseWithTypescriptParser,
} from '@typescript-eslint/parser';
import {RuleTester} from 'eslint';
import {parser as typescriptParser} from 'typescript-eslint';
import * as vueParser from 'vue-eslint-parser';
import {noTypeAssertion} from '../../../src/plugin-un/rules/no-type-assertion';

const RULE_NAME = 'no-type-assertion';

const FIXTURES_DIRECTORY = path.join(import.meta.dirname, 'fixtures');

const MESSAGE_ID = 'noTypeAssertion';

const withSuggestions = (code: string, outputs: {annotation?: string; satisfies: string}) => ({
  code,
  errors: [
    {
      messageId: MESSAGE_ID,
      suggestions: [
        ...(outputs.annotation == null
          ? []
          : [{messageId: 'replaceWithAnnotation', output: outputs.annotation}]),
        {messageId: 'replaceWithSatisfies', output: outputs.satisfies},
      ],
    },
  ],
});

const typescriptRuleTester = new RuleTester({languageOptions: {parser: typescriptParser}});

typescriptRuleTester.run(RULE_NAME, noTypeAssertion, {
  valid: [
    // Always safe
    'value as const;',
    '<const>value;',
    '[1, 2] as const;',
    '({key: 1}) as const;',
    'value as unknown;',
    '<unknown>value;',
    'value as (unknown);',
    'value satisfies Type as Type;',
    '(value satisfies Type) as Type;',
    '<Type>(value satisfies Type);',
    'value satisfies Record<string, unknown> as Record<string,unknown>;',
    'value satisfies Map<\n  string,\n  number\n> as Map<string, number>;',
    'value satisfies /* type */ Type as Type /* type */;',
    'value satisfies Type satisfies Other as Other;',
    'value as unknown satisfies unknown as unknown;',

    // Not type assertions
    'value!;',
    'value!.key;',
    'value satisfies Type;',
    "import {first as second} from 'module';",
    'export {first as second};',
    'let value!: Type;',
    'class Store { value!: Type; }',
    'const identity = <Type,>(value: Type) => value;',
    'const identity = <Type extends object>(value: Type) => value;',

    // Allowed by default
    'export default {props: {user: {type: Object as PropType<User>, required: true}}};',
    '[String, Number] as PropType<string | number>;',
    'Function as PropType<() => void>;',
    'Object as PropType;',
    'Object as (PropType<User>);',

    // Allowed explicitly
    ...Object.entries({
      'value as UserId;': 'UserId',
      '<UserId>value;': 'UserId',
      'Object as Vue.PropType<User>;': 'Vue.PropType',
      'value as Record<string,unknown>;': 'Record<string, unknown>',
      'value as Record< string, unknown >;': 'Record<string,unknown>',
      'value as unknown[];': 'unknown[]',
      'value as any;': 'any',
      "value as import('vue').PropType<User>;": "import('vue').PropType",
      'value as typeof other;': 'typeof other',
    }).map(([code, allowedType]) => ({code, options: [{allowedTypes: [allowedType]}]})),
  ],
  invalid: [
    {
      code: 'value as string;',
      errors: [{messageId: MESSAGE_ID, line: 1, column: 7, endLine: 1, endColumn: 16}],
    },
    {
      code: '<string>value;',
      errors: [{messageId: MESSAGE_ID, line: 1, column: 1, endLine: 1, endColumn: 9}],
    },
    {
      code: '<Array<string>>value;',
      errors: [{messageId: MESSAGE_ID, column: 1, endColumn: 16}],
    },
    {
      code: '<string>(first, second);',
      errors: [{messageId: MESSAGE_ID, column: 1, endColumn: 9}],
    },
    {
      code: '(first, second) as string;',
      errors: [{messageId: MESSAGE_ID, column: 17, endColumn: 26}],
    },
    {
      code: 'value as (string | number);',
      errors: [{messageId: MESSAGE_ID, column: 7, endColumn: 27}],
    },
    {
      code: 'const value = {\n  key: 1,\n} as Type;',
      errors: [{messageId: MESSAGE_ID, line: 3, column: 3, endLine: 3, endColumn: 10}],
    },
    {
      code: 'value as any;',
      errors: [{messageId: MESSAGE_ID}],
    },
    {
      code: 'value as never;',
      errors: [{messageId: MESSAGE_ID}],
    },
    {
      code: 'value as Namespace.const;',
      errors: [{messageId: MESSAGE_ID}],
    },
    {
      code: 'value! as string;',
      errors: [{messageId: MESSAGE_ID}],
    },
    {
      code: '(value as string)!;',
      errors: [{messageId: MESSAGE_ID}],
    },
    {
      code: 'value as unknown as string;',
      errors: [{messageId: MESSAGE_ID, column: 18, endColumn: 27}],
    },
    {
      code: '<string><unknown>value;',
      errors: [{messageId: MESSAGE_ID, column: 1, endColumn: 9}],
    },
    {
      code: 'value as const as readonly number[];',
      errors: [{messageId: MESSAGE_ID, column: 16, endColumn: 36}],
    },
    {
      code: 'value satisfies Type as Other;',
      errors: [{messageId: MESSAGE_ID, column: 22, endColumn: 30}],
    },
    {
      code: 'value satisfies Type as Type as Other;',
      errors: [{messageId: MESSAGE_ID, column: 30, endColumn: 38}],
    },
    {
      code: 'value satisfies Map<string, number> as Map<number, string>;',
      errors: [{messageId: MESSAGE_ID}],
    },
    {
      code: '(value as First).key as Second;',
      errors: [
        {messageId: MESSAGE_ID, column: 8, endColumn: 16},
        {messageId: MESSAGE_ID, column: 22, endColumn: 31},
      ],
    },
    {
      code: 'function check(value: unknown) { return (value as Type).key; }',
      errors: [{messageId: MESSAGE_ID}],
    },
    {
      code: 'const element = <Item value={value as Type} />;',
      languageOptions: {parserOptions: {ecmaFeatures: {jsx: true}}},
      errors: [{messageId: MESSAGE_ID, column: 36, endColumn: 43}],
    },
    {
      code: 'value as PropTypes<User>;',
      errors: [{messageId: MESSAGE_ID}],
    },
    {
      code: 'value as PropType<User>[];',
      errors: [{messageId: MESSAGE_ID}],
    },
    {
      code: 'value as PropType<User> | null;',
      errors: [{messageId: MESSAGE_ID}],
    },
    {
      code: 'value as Vue.PropType<User>;',
      errors: [{messageId: MESSAGE_ID}],
    },

    // `allowedTypes` replaces the default list
    ...['Object as PropType<User>;', 'value as UserId[];', 'value as Users;'].map((code) => ({
      code,
      options: [{allowedTypes: ['UserId']}],
      errors: [{messageId: MESSAGE_ID}],
    })),
    {
      code: 'Object as PropType<User>;',
      options: [{allowedTypes: []}],
      errors: [{messageId: MESSAGE_ID}],
    },

    // Needs type information
    {
      code: "'first' as 'first' | 'second';",
      options: [{allowWidening: true}],
      errors: [{messageId: MESSAGE_ID}],
    },
  ],
});

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

const withWideningAllowed = <TestCase extends {code: string}>(testCase: TestCase) =>
  withTypedFile({...testCase, options: [{allowWidening: true}]});

typeAwareRuleTester.run(`${RULE_NAME} (type information)`, noTypeAssertion, {
  valid: [
    ...[
      'declare const text: string; text as string | number;',
      'declare const text: string; text as string;',
      "'first' as 'first' | 'second';",
      "type Mode = 'first' | 'second'; ({mode: 'first'}) as {mode: Mode};",
      '[] as string[];',
      '({user: null as {name: string} | null});',
      '({}) as {name?: string};',
      'declare const set: Set<string>; set as ReadonlySet<string>;',
      'class Base {} class Derived extends Base { key = 1; } declare const derived: Derived; derived as Base;',
      'declare const value: never; value as string;',
      'function identity<Type>(value: Type) { return value as Type; }',
      '<string | number>(0, 1);',
      'type List = string | List[]; declare const list: List; list as List | number;',
    ].map((code) => withWideningAllowed({code})),
    withTypedFile({code: 'value as const;'}),
  ],
  invalid: [
    ...[
      'declare const value: string | number; value as string;',
      'declare const value: unknown; value as string;',
      'declare const value: any; value as string;',
      'declare const text: string; text as any;',
      'declare const set: Set<any>; set as Set<string>;',
      'declare const set: Set<string>; set as Set<any>;',
      'declare const object: {key: string}; object as Record<string, any>;',
      'declare const value: string | undefined; value as string;',
      "({color: 'red', widht: 1}) as {color?: string; width?: number};",
      'function narrow<Type extends {key: string}>(value: {key: string}) { return value as Type; }',
      'declare const text: string; text as unknown as number;',
      'declare const value: Missing; value as string;',
      'type List = string | List[]; declare const list: List; list as string;',
    ].map((code) => withWideningAllowed({code, errors: [{messageId: MESSAGE_ID}]})),

    // Widening assertions are only reported when not allowed, and can be replaced
    withSuggestions('declare const text: string; const value = text as string | number;', {
      annotation: 'declare const text: string; const value: string | number = text;',
      satisfies:
        'declare const text: string; const value = text satisfies string | number as string | number;',
    }),
    withSuggestions('let value = <string[]>[];', {
      annotation: 'let value: string[] = [];',
      satisfies: 'let value = <string[]>([] satisfies string[]);',
    }),
    withSuggestions('let value = <string[]> [];', {
      annotation: 'let value: string[] = [];',
      satisfies: 'let value = <string[]>([] satisfies string[]);',
    }),
    withSuggestions('const value = (0, 1) as number;', {
      annotation: 'const value: number = (0, 1);',
      satisfies: 'const value = (0, 1) satisfies number as number;',
    }),
    withSuggestions('const value = <number>(0, 1);', {
      annotation: 'const value: number = (0, 1);',
      satisfies: 'const value = <number>((0, 1) satisfies number);',
    }),
    withSuggestions('const value = (1 as number);', {
      annotation: 'const value: number = (1);',
      satisfies: 'const value = (1 satisfies number as number);',
    }),
    withSuggestions("const {length} = 'text' as string | number[];", {
      annotation: "const {length}: string | number[] = 'text';",
      satisfies: "const {length} = 'text' satisfies string | number[] as string | number[];",
    }),
    withSuggestions('const first = 1, second = 2 as number;', {
      annotation: 'const first = 1, second: number = 2;',
      satisfies: 'const first = 1, second = 2 satisfies number as number;',
    }),
    withSuggestions('class Store { items = [] as string[]; }', {
      annotation: 'class Store { items: string[] = []; }',
      satisfies: 'class Store { items = [] satisfies string[] as string[]; }',
    }),
    withSuggestions('class Store { items? = [] as string[]; }', {
      annotation: 'class Store { items?: string[] = []; }',
      satisfies: 'class Store { items? = [] satisfies string[] as string[]; }',
    }),
    withSuggestions("class Store { ['items'] = [] as string[]; }", {
      annotation: "class Store { ['items']: string[] = []; }",
      satisfies: "class Store { ['items'] = [] satisfies string[] as string[]; }",
    }),
    withSuggestions('const value: number | string = 1 as number;', {
      satisfies: 'const value: number | string = 1 satisfies number as number;',
    }),
    withSuggestions('const object = {user: null as {name: string} | null};', {
      satisfies:
        'const object = {user: null satisfies {name: string} | null as {name: string} | null};',
    }),
    withSuggestions('console.log([] as string[]);', {
      satisfies: 'console.log([] satisfies string[] as string[]);',
    }),
    withSuggestions('const value = (value satisfies number as number) as number | string;', {
      annotation: 'const value: number | string = (value satisfies number as number);',
      satisfies:
        'const value = (value satisfies number as number) satisfies number | string as number | string;',
    }),
    withSuggestions('const value = 1 as (() => void) | number;', {
      annotation: 'const value: (() => void) | number = 1;',
      satisfies: 'const value = 1 satisfies (() => void) | number as (() => void) | number;',
    }),
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
  noTypeAssertion,
  {
    valid: [],
    invalid: [
      withWideningAllowed({
        code: '1 as number;',
        errors: [{messageId: MESSAGE_ID, suggestions: []}],
      }),
    ],
  },
);

// Mimics https://github.com/microsoft/TypeScript/issues/62933
const throwingTypeAwareRuleTester = new RuleTester({
  languageOptions: {
    parser: {
      parseForESLint: (code: string, options?: ParserOptions) => {
        const result = parseWithTypescriptParser(code, options);
        const {program} = result.services;
        return {
          ...result,
          services: {
            ...result.services,
            program: program && {
              ...program,
              getTypeChecker: () => ({
                ...program.getTypeChecker(),
                isTypeAssignableTo: () => {
                  throw new RangeError('Maximum call stack size exceeded');
                },
              }),
            },
          },
        };
      },
    },
    parserOptions: {projectService: true, tsconfigRootDir: FIXTURES_DIRECTORY},
  },
});

throwingTypeAwareRuleTester.run(
  `${RULE_NAME} (type information, TypeScript throws)`,
  noTypeAssertion,
  {
    valid: [],
    invalid: [
      withWideningAllowed({
        code: '1 as number;',
        errors: [{messageId: MESSAGE_ID, suggestions: []}],
      }),
    ],
  },
);

const vueRuleTester = new RuleTester({
  languageOptions: {parser: vueParser, parserOptions: {parser: typescriptParser}},
});

const toVueTestCase = <TestCase extends {code: string}>(testCase: TestCase) => ({
  ...testCase,
  code: `<script setup lang="ts">\n</script>\n\n<template>\n  ${testCase.code}\n</template>\n`,
  filename: 'component.vue',
});

vueRuleTester.run(`${RULE_NAME} (Vue)`, noTypeAssertion, {
  valid: [
    ...[
      '<Item :value="value as const" />',
      '<Item :value="value satisfies Type as Type" />',
      '<Item :value="value!" />',
      '<Item :value="value as unknown" />',
      '{{ value }}',
    ].map((code) => toVueTestCase({code})),
    {
      code: '<script setup lang="ts">\ndefineProps({user: {type: Object as PropType<User>}});\n</script>\n',
      filename: 'component.vue',
    },
  ],
  invalid: [
    ...(
      [
        ['<Item :value="(value as Type).key" />', 24, 31],
        ['<Item @click="select($event as MouseEvent)" />', 31, 44],
        ['{{ value as string }}', 12, 21],
        ['{{ <string>value }}', 6, 14],
        ['<Item v-for="item in (items as Item[])" :key="item.id" />', 31, 40],
      ] satisfies readonly (readonly [code: string, column: number, endColumn: number])[]
    ).map(([code, column, endColumn]) =>
      toVueTestCase({code, errors: [{messageId: MESSAGE_ID, line: 5, column, endColumn}]}),
    ),
    {
      code: '<script setup lang="ts">\nconst value = other as Type;\n</script>\n',
      filename: 'component.vue',
      errors: [{messageId: MESSAGE_ID, line: 2, column: 21, endColumn: 28}],
    },
  ],
});

const javascriptRuleTester = new RuleTester();

javascriptRuleTester.run(`${RULE_NAME} (JavaScript)`, noTypeAssertion, {
  valid: ['const value = /** @type {string} */ (other);'],
  invalid: [],
});

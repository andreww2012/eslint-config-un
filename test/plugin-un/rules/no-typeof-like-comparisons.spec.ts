/* eslint-disable vitest/require-hook -- `RuleTester` generates its own `describe`/`it` blocks */
import {RuleTester} from 'eslint';
import {parser as typescriptParser} from 'typescript-eslint';
import {noTypeofLikeComparison} from '../../../src/plugin-un/rules/no-typeof-like-comparisons';

const RULE_NAME = 'no-typeof-like-comparisons';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, noTypeofLikeComparison, {
  valid: [
    "typeof value === 'string'",
    "'string' === typeof value",
    "typeof value !== 'function'",
    "value === 'not-a-typeof-return-value'",
    "value === 'undefined'",
    'value === 42',
    "value > 'string'",
    "'string' === 'string'",
    "value === 'string' + suffix",

    "const type = typeof value; type === 'string';",
    "const type = typeof value; 'string' === type;",
    `const type = typeof value;
     if (type === 'boolean' || type === 'number' || type === 'string' || value === null) {}`,
    "var type = typeof value; type === 'string';",
    "let type; type = typeof value; type === 'string';",
    "let type = typeof first; type = typeof second; type === 'string';",
    "const type = typeof value; const alias = type; alias === 'string';",
    "const type = typeof value; const alias = condition ? type : type; alias === 'string';",
    "const type = typeof value; function check() { return type === 'string'; }",
    "const type = typeof value; const check = () => { const type = typeof other; return type === 'string'; };",

    "const type = condition ? typeof first : typeof second; type === 'string';",
    "const type = typeof first || typeof second; type === 'string';",
    "const type = typeof first ?? typeof second; type === 'string';",
    "const type = (log(), typeof value); type === 'string';",
    "let type; (type = typeof value) === 'string';",
    "(condition ? typeof first : typeof second) === 'string'",
    "(log(), typeof value) === 'string'",

    {
      code: "value === 'string'",
      options: [{allow: {string: true}}],
    },
    {
      code: "value === 'forbidden'",
      options: [{disallow: ['other']}],
    },
    {
      code: "typeof value === 'forbidden'",
      options: [{disallow: ['forbidden']}],
    },
    {
      code: "const type = typeof value; type === 'forbidden';",
      options: [{disallow: ['forbidden']}],
    },
  ],
  invalid: [
    {
      code: "value === 'string'",
      errors: [{messageId: 'noTypeofLikeComparison', data: {operandSide: 'left'}}],
    },
    {
      code: "'string' === value",
      errors: [{messageId: 'noTypeofLikeComparison', data: {operandSide: 'right'}}],
    },
    {
      code: "value.type != 'object'",
      errors: [{messageId: 'noTypeofLikeComparison', data: {operandSide: 'left'}}],
    },
    {
      code: "getType(value) === 'string'",
      errors: [{messageId: 'noTypeofLikeComparison', data: {operandSide: 'left'}}],
    },

    {
      code: "const type = getType(value); type === 'string';",
      errors: [{messageId: 'noTypeofLikeComparison'}],
    },
    {
      code: "let type = typeof value; type = 'custom'; type === 'string';",
      errors: [{messageId: 'noTypeofLikeComparison'}],
    },
    {
      code: "let type; type === 'string';",
      errors: [{messageId: 'noTypeofLikeComparison'}],
    },
    {
      code: "function check(type) { return type === 'string'; }",
      errors: [{messageId: 'noTypeofLikeComparison'}],
    },
    {
      code: "import {kind} from 'mod'; kind === 'string';",
      errors: [{messageId: 'noTypeofLikeComparison'}],
    },
    {
      code: "const [type] = [typeof value]; type === 'string';",
      errors: [{messageId: 'noTypeofLikeComparison'}],
    },
    {
      code: "for (const type in value) { type === 'string'; }",
      errors: [{messageId: 'noTypeofLikeComparison'}],
    },
    {
      code: "const type = condition ? typeof first : getType(second); type === 'string';",
      errors: [{messageId: 'noTypeofLikeComparison'}],
    },
    {
      code: "const type = typeof first || 'boolean'; type === 'string';",
      errors: [{messageId: 'noTypeofLikeComparison'}],
    },
    {
      code: "const type = (typeof value, other); type === 'string';",
      errors: [{messageId: 'noTypeofLikeComparison'}],
    },
    {
      code: "let type; (type += typeof value) === 'string';",
      errors: [{messageId: 'noTypeofLikeComparison'}],
    },
    {
      code: "let type; type += typeof value; type === 'string';",
      errors: [{messageId: 'noTypeofLikeComparison'}],
    },
    {
      code: "let type; type ||= typeof value; type === 'string';",
      errors: [{messageId: 'noTypeofLikeComparison'}],
    },
    {
      // Mutually referencing writes cannot be proven to hold a `typeof` result
      code: "let first = typeof value; let second = first; first = second; first === 'string';",
      errors: [{messageId: 'noTypeofLikeComparison'}],
    },
    {
      code: "const type = typeof value; function check(type) { return type === 'string'; }",
      errors: [{messageId: 'noTypeofLikeComparison'}],
    },

    {
      code: "value === 'undefined'",
      options: [{allow: {undefined: false}}],
      errors: [{messageId: 'noTypeofLikeComparison'}],
    },
    {
      code: "value === 'forbidden'",
      options: [{disallow: ['forbidden']}],
      errors: [{messageId: 'noComparisonWithUserProvidedLiteral', data: {value: 'forbidden'}}],
    },
    {
      code: "value === 'constructor'",
      options: [{disallow: ['constructor']}],
      errors: [{messageId: 'noComparisonWithUserProvidedLiteral', data: {value: 'constructor'}}],
    },
    {
      code: `value === 'say "hi"'`,
      options: [{disallow: ['say "hi"']}],
      errors: [
        {
          messageId: 'noComparisonWithUserProvidedLiteral',
          data: {value: String.raw`say \"hi\"`},
        },
      ],
    },
  ],
});

const typescriptRuleTester = new RuleTester({languageOptions: {parser: typescriptParser}});

typescriptRuleTester.run(`${RULE_NAME} (TypeScript)`, noTypeofLikeComparison, {
  valid: [
    "const type = typeof value as 'string' | 'number'; type === 'string';",
    "const type = <string>typeof value; type === 'string';",
    "const type = typeof value satisfies string; type === 'string';",
    "const type = (typeof value)!; type === 'string';",
    "const type = (typeof value)<string>; type === 'string';",
    "(typeof value as string) === 'string'",
  ],
  invalid: [
    {
      code: "const type = value as string; type === 'string';",
      errors: [{messageId: 'noTypeofLikeComparison'}],
    },
    {
      code: "(value as string) === 'string'",
      errors: [{messageId: 'noTypeofLikeComparison'}],
    },
  ],
});

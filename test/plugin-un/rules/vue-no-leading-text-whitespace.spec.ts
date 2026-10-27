/* eslint-disable vitest/require-hook -- `RuleTester` generates its own `describe`/`it` blocks */
import {RuleTester} from 'eslint';
import * as vueParser from 'vue-eslint-parser';
import {vueNoLeadingTextWhitespace} from '../../../src/plugin-un/rules/vue-no-leading-text-whitespace';

const RULE_NAME = 'vue-no-leading-text-whitespace';

const ruleTester = new RuleTester({languageOptions: {parser: vueParser}});

const toTestCase = (template: string) => ({
  code: `<template>${template}</template>`,
  filename: 'component.vue',
});

ruleTester.run(RULE_NAME, vueNoLeadingTextWhitespace, {
  valid: [
    ...[
      '<p>Loading...</p>',
      '\n  Loading...\n',
      '<p>\n</p>',
      '<p>\n  {{ label }}</p>',
      '<p>\n  <i></i>\n  Loading...</p>',
      '<p>{{ label }}<i v-if="isShown"> (optional)</i></p>',
      '<p><i></i><b>\n  Loading...</b></p>',
      '<p>&#32;Loading...</p>',
      '<pre>\n  Loading...</pre>',
      '<pre><b>\n  Loading...</b></pre>',
      '<textarea>\n  Loading...</textarea>',
    ].map(toTestCase),
    ...['<code-block>\n  Loading...</code-block>', '<CodeBlock><b> Loading...</b></CodeBlock>'].map(
      (template) => ({...toTestCase(template), options: [{ignoredElements: ['code-block']}]}),
    ),
  ],
  invalid: [
    ...[
      {template: '<p>\n  Loading...</p>', output: '<p>Loading...</p>'},
      {template: '<p> Loading...</p>', output: '<p>Loading...</p>'},
      {
        template: '<div>\n  <p>Done.</p>\n  <p>\n    You can close the window.</p>\n</div>',
        output: '<div>\n  <p>Done.</p>\n  <p>You can close the window.</p>\n</div>',
      },
      {template: '<p>Total: <b> 5</b></p>', output: '<p>Total: <b>5</b></p>'},
    ].map(({template, output}) => ({
      ...toTestCase(template),
      output: toTestCase(output).code,
      errors: [{messageId: 'leading'}],
    })),
    {
      ...toTestCase('<code-block>\n  Loading...</code-block>'),
      output: toTestCase('<code-block>Loading...</code-block>').code,
      options: [{ignoredElements: ['pre']}],
      errors: [{messageId: 'leading', line: 1, column: 23, endLine: 2, endColumn: 3}],
    },
  ],
});

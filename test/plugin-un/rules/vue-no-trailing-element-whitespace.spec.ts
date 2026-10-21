/* eslint-disable vitest/require-hook -- `RuleTester` generates its own `describe`/`it` blocks */
import {RuleTester} from 'eslint';
import {parser as typescriptParser} from 'typescript-eslint';
import * as vueParser from 'vue-eslint-parser';
import {vueNoTrailingElementWhitespace} from '../../../src/plugin-un/rules/vue-no-trailing-element-whitespace';

const RULE_NAME = 'vue-no-trailing-element-whitespace';

const ruleTester = new RuleTester({languageOptions: {parser: vueParser}});

const toTestCase = (template: string) => ({
  code: `<template>${template}</template>`,
  filename: 'component.vue',
});

ruleTester.run(RULE_NAME, vueNoTrailingElementWhitespace, {
  valid: [
    ...[
      '<p>Loading…</p>',
      '<p>\n  {{ label }}\n</p>',
      '<p>\n  <i></i>\n  <b></b>\n</p>',
      '<p>\n  <i></i>\n  <b v-if="isShown"></b>\n</p>',
      '<p>\n  {{ label }}\n  <i v-if="isShown"></i>\n  <b v-else></b>\n</p>',
      '<p>\n  {{ label }}<i v-if="isShown"> (optional)</i>\n</p>',
      '<p>\n  <i v-if="isShown"></i>\n  Loading…</p>',
      '<p>\n  <!-- Comment -->\n  <b v-if="isShown"></b>\n</p>',
      '<p>\n  <i></i>\n  <!-- Comment -->\n  <b v-if="isShown"></b>\n</p>',
      '<p>Total:&#32;</p>',
      '<p>Total:&nbsp;</p>',
      '<p>\n  \n</p>',
      '<pre>Loading…\n</pre>',
      '<pre><b>Loading… </b></pre>',
      '<textarea>Loading…\n</textarea>',
    ].map(toTestCase),
    ...[
      '<code-block>Loading…\n</code-block>',
      '<CodeBlock><b>Loading… </b></CodeBlock>',
      '<div class="whitespace-pre">Loading…\n</div>',
    ].map((template) => ({
      ...toTestCase(template),
      options: [{ignoredElements: ['CodeBlock', 'div']}],
    })),
    {
      ...toTestCase('<p>\n  <i></i>\n  <b v-if="isShown"></b>\n</p>'),
      options: [{whitespace: 'condense'}],
    },
    {
      code: "const template = '<p>Total: </p>';",
      filename: 'file.ts',
      languageOptions: {parser: typescriptParser},
    },
  ],
  invalid: [
    ...[
      {
        template: '<p>\n  <i></i>\n  Loading…\n</p>',
        error: {messageId: 'trailing', line: 3, column: 11, endLine: 4, endColumn: 1},
      },
      {
        template: '<p>Total: </p>',
        error: {messageId: 'trailing', line: 1, column: 20, endLine: 1, endColumn: 21},
      },
      {
        template: '<div>\n  <p>Done.\n  </p>\n</div>',
        error: {messageId: 'trailing', line: 2, column: 11, endLine: 3, endColumn: 3},
      },
      {
        template: '<p>\n  Loading…\n  <!-- Comment -->\n</p>',
        error: {messageId: 'trailing', line: 2, column: 11, endLine: 4, endColumn: 1},
      },
      {
        template: '<p>\n  Loading…<!-- Comment -->\n</p>',
        error: {messageId: 'trailing', line: 2, column: 27, endLine: 3, endColumn: 1},
      },
      {
        template: '<p>\n  {{ label }}\n  <i v-if="isShown"></i>\n</p>',
        error: {messageId: 'beforeOptional', line: 2, column: 14, endLine: 3, endColumn: 3},
      },
      {
        template: '<p>\n  Limit:\n  <i v-show="isShown"></i>\n</p>',
        error: {messageId: 'beforeOptional', line: 2, column: 9, endLine: 3, endColumn: 3},
      },
      {
        template: '<p><b></b> <i v-for="item in items"></i></p>',
        error: {messageId: 'beforeOptional', line: 1, column: 21, endLine: 1, endColumn: 22},
      },
      {
        template: '<p><b v-if="isShown"></b> <i v-else-if="isVisible"></i></p>',
        error: {messageId: 'beforeOptional', line: 1, column: 36, endLine: 1, endColumn: 37},
      },
      {
        template: '<p><i></i> <!-- Comment --> <b v-if="isShown"></b></p>',
        error: {messageId: 'beforeOptional', line: 1, column: 21, endLine: 1, endColumn: 39},
      },
    ].map(({template, error}) => ({...toTestCase(template), errors: [error]})),
    {
      ...toTestCase('<p>\n  <i></i>\n  <b v-if="isShown"></b>\n</p>'),
      options: [{whitespace: 'preserve'}],
      errors: [{messageId: 'beforeOptional', line: 2, column: 10, endLine: 3, endColumn: 3}],
    },
    {
      ...toTestCase('<p>\n  Limit:\n  <i v-if="isShown"></i>\n  <b v-if="isVisible"></b>\n</p>'),
      options: [{whitespace: 'preserve'}],
      errors: [
        {messageId: 'beforeOptional', line: 2, column: 9, endLine: 3, endColumn: 3},
        {messageId: 'beforeOptional', line: 3, column: 25, endLine: 4, endColumn: 3},
      ],
    },
    {
      ...toTestCase('<code-block>Loading…\n</code-block><p>Total: </p>'),
      options: [{ignoredElements: ['CodeBlock']}],
      errors: [{messageId: 'trailing', line: 2, column: 23, endLine: 2, endColumn: 24}],
    },
  ],
});

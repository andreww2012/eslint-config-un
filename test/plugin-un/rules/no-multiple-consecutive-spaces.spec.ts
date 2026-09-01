/* eslint-disable vitest/require-hook -- `RuleTester` generates its own `describe`/`it` blocks */
/* eslint-disable un/no-multiple-consecutive-spaces -- the test cases are made of them */
import {RuleTester} from 'eslint';
import {noMultipleConsecutiveSpaces} from '../../../src/plugin-un/rules/no-multiple-consecutive-spaces';

const RULE_NAME = 'no-multiple-consecutive-spaces';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, noMultipleConsecutiveSpaces, {
  valid: [
    "const value = 'a b';",
    "const value = '';",
    'const value = 42;',
    'const value = /a  b/;',
    'const value = `a  b`;',

    "const value = '  ';",
    {
      code: "const value = '  ';",
      options: [{allowSpacesOnly: true}],
    },
    {
      code: "const value = '  ';",
      options: [{allowSpacesOnly: true, allowLeadingSpaces: false, allowTrailingSpaces: false}],
    },

    "const value = 'a  ';",
    {
      code: "const value = 'a  ';",
      options: [{allowTrailingSpaces: true}],
    },
    "const value = '  a';",
    {
      code: "const value = '  a';",
      options: [{allowLeadingSpaces: true}],
    },
    "const value = '  a  ';",
  ],
  invalid: [
    {
      code: "const value = 'a  b';",
      errors: [
        {
          messageId: 'noMultipleConsecutiveSpaces',
          suggestions: [
            {
              messageId: 'replaceMultipleSpacesWithSingle',
              output: "const value = 'a b';",
            },
          ],
        },
      ],
    },
    {
      code: "const value = 'a   b';",
      errors: [
        {
          messageId: 'noMultipleConsecutiveSpaces',
          suggestions: [
            {
              messageId: 'replaceMultipleSpacesWithSingle',
              output: "const value = 'a b';",
            },
          ],
        },
      ],
    },
    {
      code: "const value = 'a  b  c';",
      errors: [
        {
          messageId: 'noMultipleConsecutiveSpaces',
          suggestions: [
            {
              messageId: 'replaceMultipleSpacesWithSingle',
              output: "const value = 'a b  c';",
            },
          ],
        },
        {
          messageId: 'noMultipleConsecutiveSpaces',
          suggestions: [
            {
              messageId: 'replaceMultipleSpacesWithSingle',
              output: "const value = 'a  b c';",
            },
          ],
        },
      ],
    },
    {
      code: "const value = {'a  b': 1};",
      errors: [
        {
          messageId: 'noMultipleConsecutiveSpaces',
          suggestions: [
            {
              messageId: 'replaceMultipleSpacesWithSingle',
              output: "const value = {'a b': 1};",
            },
          ],
        },
      ],
    },
    {
      code: "'a  b';",
      errors: [
        {
          messageId: 'noMultipleConsecutiveSpaces',
          suggestions: [
            {
              messageId: 'replaceMultipleSpacesWithSingle',
              output: "'a b';",
            },
          ],
        },
      ],
    },
    {
      code: "const value = '  ';",
      options: [{allowSpacesOnly: false}],
      errors: [
        {
          messageId: 'noMultipleConsecutiveSpaces',
          suggestions: [
            {
              messageId: 'replaceMultipleSpacesWithSingle',
              output: "const value = ' ';",
            },
          ],
        },
      ],
    },
    {
      code: "const value = '  ';",
      options: [{allowSpacesOnly: false, allowLeadingSpaces: true, allowTrailingSpaces: true}],
      errors: [
        {
          messageId: 'noMultipleConsecutiveSpaces',
          suggestions: [
            {
              messageId: 'replaceMultipleSpacesWithSingle',
              output: "const value = ' ';",
            },
          ],
        },
      ],
    },
    {
      code: "const value = '  a';",
      options: [{allowLeadingSpaces: false}],
      errors: [
        {
          messageId: 'noMultipleConsecutiveSpaces',
          suggestions: [
            {
              messageId: 'replaceMultipleSpacesWithSingle',
              output: "const value = ' a';",
            },
          ],
        },
      ],
    },
    {
      code: "const value = 'a  ';",
      options: [{allowTrailingSpaces: false}],
      errors: [
        {
          messageId: 'noMultipleConsecutiveSpaces',
          suggestions: [
            {
              messageId: 'replaceMultipleSpacesWithSingle',
              output: "const value = 'a ';",
            },
          ],
        },
      ],
    },
    {
      code: "const value = '  a  b  ';",
      errors: [
        {
          messageId: 'noMultipleConsecutiveSpaces',
          suggestions: [
            {
              messageId: 'replaceMultipleSpacesWithSingle',
              output: "const value = '  a b  ';",
            },
          ],
        },
      ],
    },
  ],
});

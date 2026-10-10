/* eslint-disable vitest/require-hook -- `RuleTester` generates its own `describe`/`it` blocks */
import path from 'node:path';
import {RuleTester} from 'eslint';
import * as parserPlain from 'eslint-parser-plain';
import {formatRules} from '../../src/plugin-format';

const FILE_NEXT_TO_PRETTIER_CONFIG = path.join(
  import.meta.dirname,
  'fixtures',
  'single-quote',
  'file.js',
);

// Formatters read the code as text, so the code of any language must be parsed
const ruleTester = new RuleTester({languageOptions: {parser: parserPlain}});

ruleTester.run('prettier', formatRules.prettier, {
  valid: [
    {code: 'const value = 1;\n', filename: 'file.js'},
    {
      code: 'const value = "a";\n',
      filename: FILE_NEXT_TO_PRETTIER_CONFIG,
      options: [{}, {readConfig: false}],
    },
    // The options passed to the rule take precedence over the config
    {
      code: 'const value = "a";\n',
      filename: FILE_NEXT_TO_PRETTIER_CONFIG,
      options: [{singleQuote: false}],
    },
  ],
  invalid: [
    {
      code: 'const value = 1\n',
      filename: 'file.js',
      output: 'const value = 1;\n',
      errors: [{message: 'Insert `;`', line: 1, column: 16}],
    },
    {
      // eslint-disable-next-line un/no-multiple-consecutive-spaces -- the formatter removes the extra one
      code: 'const value  = 1;\n',
      filename: 'file.js',
      output: 'const value = 1;\n',
      errors: [{message: 'Delete `·`', line: 1, column: 13}],
    },
    {
      code: "const value = 'a';\n",
      filename: 'file.js',
      output: 'const value = "a";\n',
      errors: [{message: 'Replace `\'a\'` with `"a"`'}],
    },
    {
      code: 'const value = "a";\n',
      filename: FILE_NEXT_TO_PRETTIER_CONFIG,
      output: "const value = 'a';\n",
      errors: [{message: 'Replace `"a"` with `\'a\'`'}],
    },
    {
      code: 'const = 1;\n',
      filename: 'file.js',
      errors: [{message: 'Parsing error: Unexpected token', line: 1, column: 7}],
    },
  ],
});

ruleTester.run('oxfmt', formatRules.oxfmt, {
  valid: [
    {code: 'const value = 1;\n', filename: 'file.js'},
    {code: 'not supported', filename: 'file.unknown'},
  ],
  invalid: [
    {
      code: 'const value = "a";\n',
      filename: 'file.js',
      options: [{singleQuote: true}],
      output: "const value = 'a';\n",
      errors: [{message: 'Replace `"a"` with `\'a\'`'}],
    },
    {
      code: 'const = 1;\n',
      filename: 'file.js',
      errors: [{message: 'Failed to format the code: Unexpected token'}],
    },
  ],
});

ruleTester.run('dprint', formatRules.dprint, {
  valid: [{code: '- item\n', filename: 'file.md', options: [{language: 'markdown'}]}],
  invalid: [
    {
      code: '* item\n',
      filename: 'file.md',
      options: [{language: 'markdown'}],
      output: '- item\n',
      errors: [{message: 'Replace `*` with `-`'}],
    },
    {
      code: '* item\n',
      filename: 'file.md',
      options: [{language: 'missing-plugin.wasm'}],
      errors: [
        {
          message:
            "Failed to format the code: ENOENT: no such file or directory, open 'missing-plugin.wasm'",
        },
      ],
    },
  ],
});

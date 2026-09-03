/* eslint-disable vitest/require-hook -- `RuleTester` generates its own `describe`/`it` blocks */
/* eslint-disable un/no-multiple-consecutive-spaces -- the test cases are made of them */
/* eslint-disable no-template-curly-in-string -- some test cases are template literals with expressions */
import {RuleTester} from 'eslint';
import {noMultipleConsecutiveSpaces} from '../../../src/plugin-un/rules/no-multiple-consecutive-spaces';

const RULE_NAME = 'no-multiple-consecutive-spaces';

const ruleTester = new RuleTester();

const errorWithSuggestion = (output: string, messageId = 'noMultipleConsecutiveSpaces') => ({
  messageId,
  suggestions: [{messageId: 'replaceMultipleSpacesWithSingle', output}],
});
const mixedErrorWithSuggestion = (output: string) => errorWithSuggestion(output, 'noMixedSpaces');

ruleTester.run(RULE_NAME, noMultipleConsecutiveSpaces, {
  valid: [
    "const value = 'a b';",
    "const value = '';",
    'const value = 42;',
    'const value = /a  b/;',

    // Spaces only
    "const value = '  ';",
    {
      code: "const value = '  ';",
      options: [{allowSpacesOnly: true, allowLeadingSpaces: 'never', allowTrailingSpaces: 'never'}],
    },
    'const value = `  `;',

    // Leading and trailing
    "const value = 'a  ';",
    "const value = '  a';",
    "const value = '  a  ';",
    {
      code: "const value = '  a  ';",
      options: [{allowLeadingSpaces: 'always', allowTrailingSpaces: 'always'}],
    },
    'const value = `  a  `;',
    'const value = `  ${a}  `;',

    // Line-aware leading and trailing
    String.raw`const value = 'a  \n  b';`,
    String.raw`const value = 'a  \r\n  b';`,
    'const value = `a  \n  b`;',
    'const value = `a  \r\n  b`;',
    'const value = `a  \\n  b`;',
    'const value = `\n  ${a}\n  ${b}\n`;',
    {
      code: String.raw`const value = 'a  \n  b';`,
      options: [{allowLeadingSpaces: 'linesOnly', allowTrailingSpaces: 'linesOnly'}],
    },
    {
      code: 'const value = `\n  SELECT *\n  FROM users`;',
      options: [{allowLeadingSpaces: 'linesOnly'}],
    },
    {
      code: "const value = '  a  ';",
      options: [{allowLeadingSpaces: 'stringOnly', allowTrailingSpaces: 'stringOnly'}],
    },

    // Defaults are merged with the provided options
    {
      code: "const value = '  a  ';",
      options: [{allowSpacesOnly: false}],
    },
    {
      code: 'const value = `\n  a\n`;',
      options: [{checkTaggedTemplateLiterals: true}],
    },

    // Template literals
    {
      code: 'const value = `a  b`;',
      options: [{checkTemplateLiterals: false}],
    },
    'const value = tag`a  b`;',
    'const value = String.raw`a  b`;',
    {
      code: 'const value = tag`a  b`;',
      options: [{checkTaggedTemplateLiterals: false}],
    },
    {
      code: 'const value = tag`a  b`;',
      options: [{checkTemplateLiterals: false, checkTaggedTemplateLiterals: false}],
    },

    // Space characters
    String.raw`const value = 'a\t\tb';`,
    "const value = 'a\t\tb';",
    "const value = 'a\u{A0}\u{A0}b';",
    String.raw`const value = 'a\u00A0\u00A0b';`,
    {
      code: "const value = 'a  b';",
      options: [{spaceCharacters: {space: false}}],
    },
    {
      code: String.raw`const value = '\t\ta';`,
      options: [{spaceCharacters: {tab: true}}],
    },

    // Mixed spaces
    {
      code: "const value = 'a \u{A0}b';",
      options: [{reportMixedSpaces: false}],
    },
    {
      code: String.raw`const value = 'a \tb';`,
      options: [{reportMixedSpaces: false}],
    },

    // Escaped backslashes are not escape sequences
    String.raw`const value = 'a\\t b';`,
    String.raw`const value = 'a\\u00A0 b';`,
    String.raw`const value = 'a\\\tb';`,

    // Ignore patterns
    {
      code: "const value = '| a    | b |';",
      options: [{ignorePatterns: [String.raw`^\|`]}],
    },
    {
      code: 'const value = String.raw`| a    | b |`;',
      options: [{checkTaggedTemplateLiterals: true, ignorePatterns: [String.raw`^\|`]}],
    },
    {
      code: 'const value = `| a    | ${b} |`;',
      options: [{ignorePatterns: [String.raw`^\|`]}],
    },
  ],
  invalid: [
    {
      code: "const value = 'a  b';",
      errors: [errorWithSuggestion("const value = 'a b';")],
    },
    {
      code: "const value = 'a   b';",
      errors: [errorWithSuggestion("const value = 'a b';")],
    },
    {
      code: "const value = 'a  b  c';",
      errors: [
        errorWithSuggestion("const value = 'a b  c';"),
        errorWithSuggestion("const value = 'a  b c';"),
      ],
    },
    {
      code: "const value = {'a  b': 1};",
      errors: [errorWithSuggestion("const value = {'a b': 1};")],
    },
    {
      code: "'a  b';",
      errors: [errorWithSuggestion("'a b';")],
    },
    {
      code: String.raw`const value = '\t  a  b';`,
      errors: [
        mixedErrorWithSuggestion("const value = ' a  b';"),
        errorWithSuggestion(String.raw`const value = '\t  a b';`),
      ],
    },

    // Spaces only
    {
      code: "const value = '  ';",
      options: [{allowSpacesOnly: false}],
      errors: [errorWithSuggestion("const value = ' ';")],
    },
    {
      code: "const value = '  ';",
      options: [
        {allowSpacesOnly: false, allowLeadingSpaces: 'always', allowTrailingSpaces: 'always'},
      ],
      errors: [errorWithSuggestion("const value = ' ';")],
    },
    {
      code: 'const value = `  `;',
      options: [{allowSpacesOnly: false}],
      errors: [errorWithSuggestion('const value = ` `;')],
    },
    {
      code: 'const value = `${a}  ${b}`;',
      errors: [errorWithSuggestion('const value = `${a} ${b}`;')],
    },

    // Leading and trailing
    {
      code: "const value = '  a';",
      options: [{allowLeadingSpaces: 'never'}],
      errors: [errorWithSuggestion("const value = ' a';")],
    },
    {
      code: "const value = 'a  ';",
      options: [{allowTrailingSpaces: 'never'}],
      errors: [errorWithSuggestion("const value = 'a ';")],
    },
    {
      code: "const value = '  a  b  ';",
      errors: [errorWithSuggestion("const value = '  a b  ';")],
    },
    {
      code: 'const value = `  a`;',
      options: [{allowLeadingSpaces: 'never'}],
      errors: [errorWithSuggestion('const value = ` a`;')],
    },

    // Line-aware leading and trailing
    {
      code: String.raw`const value = 'a  \n  b';`,
      options: [{allowLeadingSpaces: 'stringOnly', allowTrailingSpaces: 'stringOnly'}],
      errors: [
        errorWithSuggestion(String.raw`const value = 'a \n  b';`),
        errorWithSuggestion(String.raw`const value = 'a  \n b';`),
      ],
    },
    {
      code: 'const value = `a  \n  b`;',
      options: [{allowLeadingSpaces: 'stringOnly', allowTrailingSpaces: 'stringOnly'}],
      errors: [
        errorWithSuggestion('const value = `a \n  b`;'),
        errorWithSuggestion('const value = `a  \n b`;'),
      ],
    },
    {
      code: 'const value = `\n  a  b\n`;',
      errors: [errorWithSuggestion('const value = `\n  a b\n`;')],
    },
    {
      code: String.raw`const value = '  a\n  b  ';`,
      options: [{allowLeadingSpaces: 'linesOnly', allowTrailingSpaces: 'linesOnly'}],
      errors: [
        errorWithSuggestion(String.raw`const value = ' a\n  b  ';`),
        errorWithSuggestion(String.raw`const value = '  a\n  b ';`),
      ],
    },
    {
      code: 'const value = `  a\n  b  \nc`;',
      options: [{allowLeadingSpaces: 'stringOnly', allowTrailingSpaces: 'stringOnly'}],
      errors: [
        errorWithSuggestion('const value = `  a\n b  \nc`;'),
        errorWithSuggestion('const value = `  a\n  b \nc`;'),
      ],
    },
    {
      code: String.raw`const value = 'a  \n  b';`,
      options: [{allowLeadingSpaces: 'never', allowTrailingSpaces: 'never'}],
      errors: [
        errorWithSuggestion(String.raw`const value = 'a \n  b';`),
        errorWithSuggestion(String.raw`const value = 'a  \n b';`),
      ],
    },

    // Template literals
    {
      code: 'const value = `a  b`;',
      errors: [errorWithSuggestion('const value = `a b`;')],
    },
    {
      code: 'const value = `a  ${b}  c`;',
      errors: [
        errorWithSuggestion('const value = `a ${b}  c`;'),
        errorWithSuggestion('const value = `a  ${b} c`;'),
      ],
    },
    {
      code: 'const value = tag`a  b`;',
      options: [{checkTaggedTemplateLiterals: true}],
      errors: [errorWithSuggestion('const value = tag`a b`;')],
    },
    {
      code: 'const value = tag`a  b`;',
      options: [{checkTemplateLiterals: false, checkTaggedTemplateLiterals: true}],
      errors: [errorWithSuggestion('const value = tag`a b`;')],
    },

    // Space characters
    {
      code: String.raw`const value = 'a\t\tb';`,
      options: [{spaceCharacters: {tab: true}}],
      errors: [errorWithSuggestion(String.raw`const value = 'a\tb';`)],
    },
    {
      code: "const value = 'a\t\tb';",
      options: [{spaceCharacters: {tab: true}}],
      errors: [errorWithSuggestion("const value = 'a\tb';")],
    },
    {
      code: "const value = 'a  b';",
      options: [{spaceCharacters: {tab: true}}],
      errors: [errorWithSuggestion("const value = 'a b';")],
    },
    {
      code: "const value = 'a\u{A0}\u{A0}b';",
      options: [{spaceCharacters: {unicodeSpaces: true}}],
      errors: [errorWithSuggestion("const value = 'a\u{A0}b';")],
    },
    {
      code: String.raw`const value = 'a\u00A0\u00A0b';`,
      options: [{spaceCharacters: {unicodeSpaces: true}}],
      errors: [errorWithSuggestion(String.raw`const value = 'a\u00A0b';`)],
    },
    {
      code: String.raw`const value = 'a\xA0\u{A0}\u3000b';`,
      options: [{spaceCharacters: {unicodeSpaces: true}}],
      errors: [errorWithSuggestion(String.raw`const value = 'a\xA0b';`)],
    },

    // Mixed spaces
    {
      code: "const value = 'a \u{A0}b';",
      errors: [mixedErrorWithSuggestion("const value = 'a b';")],
    },
    {
      code: String.raw`const value = 'a \u00A0b';`,
      errors: [mixedErrorWithSuggestion("const value = 'a b';")],
    },
    {
      code: String.raw`const value = 'a \tb';`,
      errors: [mixedErrorWithSuggestion("const value = 'a b';")],
    },
    {
      code: "const value = ' \u{A0}a';",
      errors: [mixedErrorWithSuggestion("const value = ' a';")],
    },
    {
      code: "const value = ' \u{A0}';",
      errors: [mixedErrorWithSuggestion("const value = ' ';")],
    },
    {
      code: 'const value = `a \u{A0}${b}`;',
      errors: [mixedErrorWithSuggestion('const value = `a ${b}`;')],
    },

    // Escaped backslashes are not escape sequences
    {
      code: String.raw`const value = 'a\\n  b';`,
      options: [{allowLeadingSpaces: 'linesOnly'}],
      errors: [errorWithSuggestion(String.raw`const value = 'a\\n b';`)],
    },
    {
      code: String.raw`const value = 'a\\\t  b';`,
      errors: [mixedErrorWithSuggestion(String.raw`const value = 'a\\ b';`)],
    },

    // CRLF line breaks inside template literals
    {
      code: 'const value = `x\r\ny\r\nab  cd`;',
      errors: [errorWithSuggestion('const value = `x\r\ny\r\nab cd`;')],
    },
    {
      code: 'const value = String.raw`a  b`;',
      options: [{checkTaggedTemplateLiterals: true}],
      errors: [errorWithSuggestion('const value = String.raw`a b`;')],
    },

    // Ignore patterns
    {
      code: "const value = 'a  b';",
      options: [{ignorePatterns: [String.raw`^\|`]}],
      errors: [errorWithSuggestion("const value = 'a b';")],
    },
  ],
});

/* eslint-disable vitest/require-hook -- `RuleTester` generates its own `describe`/`it` blocks */
import {RuleTester} from 'eslint';
import {noArrayReverse} from '../../../src/plugin-un/rules/no-array-reverse';

const RULE_NAME = 'no-array-reverse';

const withSuggestion = (code: string, output: string) => ({
  code,
  errors: [{messageId: 'preferCopy', suggestions: [{messageId: 'switchToCopy', output}]}],
});

const withFix = (code: string, output: string) => ({
  code,
  output,
  errors: [{messageId: 'preferInPlace'}],
});

const withInPlaceSuggestion = (code: string, output: string) => ({
  code,
  errors: [{messageId: 'preferInPlace', suggestions: [{messageId: 'switchToInPlace', output}]}],
});

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, noArrayReverse, {
  valid: [
    'array.reverse();',
    "const reversed = text.split('').reverse().join('');",
    'const reversed = [...array].reverse();',
    'const reversed = array.filter(Boolean).sort().reverse();',
    'function foo(array) { const items = array.map(bar); return items.reverse(); }',
    // `reverse()` takes no arguments
    'const reversed = array.reverse(other);',
    'const reversed = array.toReversed();',
    'const reversed = [b, , a].toReversed();',
  ],
  invalid: [
    withSuggestion('const reversed = array.reverse();', 'const reversed = array.toReversed();'),
    withSuggestion(
      'const reversed = array.sort().reverse();',
      'const reversed = array.sort().toReversed();',
    ),
    withInPlaceSuggestion(
      "const reversed = text.split('').toReversed().join('');",
      "const reversed = text.split('').reverse().join('');",
    ),
    withFix(
      'const reversed = array.toSorted().toReversed();',
      'const reversed = array.toSorted().reverse();',
    ),
    withFix(
      'let items = [b, a]; items = items.toReversed(); bar(items[0]);',
      'let items = [b, a]; items.reverse(); bar(items[0]);',
    ),
  ],
});

ruleTester.run(`${RULE_NAME} (unneededCopies: allow)`, noArrayReverse, {
  valid: [
    "const reversed = text.split('').reverse().join('');",
    "const reversed = text.split('').toReversed().join('');",
  ].map((code) => ({code, options: [{unneededCopies: 'allow'}]})),
  invalid: [
    {
      ...withSuggestion(
        'const reversed = array.reverse();',
        'const reversed = array.toReversed();',
      ),
      options: [{unneededCopies: 'allow'}],
    },
  ],
});

ruleTester.run(`${RULE_NAME} (unneededCopies: require)`, noArrayReverse, {
  valid: ['array.reverse();', "const reversed = text.split('').toReversed().join('');"].map(
    (code) => ({code, options: [{unneededCopies: 'require'}]}),
  ),
  invalid: [
    {
      ...withSuggestion(
        "const reversed = text.split('').reverse().join('');",
        "const reversed = text.split('').toReversed().join('');",
      ),
      options: [{unneededCopies: 'require'}],
    },
    {
      code: 'const reversed = [...array].reverse();',
      options: [{unneededCopies: 'require'}],
      errors: [
        {
          messageId: 'preferCopy',
          suggestions: [
            {messageId: 'switchToCopyOfSpread', output: 'const reversed = array.toReversed();'},
            {messageId: 'switchToCopy', output: 'const reversed = [...array].toReversed();'},
          ],
        },
      ],
    },
  ],
});

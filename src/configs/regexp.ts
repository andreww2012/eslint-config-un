import * as eslintPluginRegexp from 'eslint-plugin-regexp';
import {ERROR, OFF, WARNING} from '../constants';
import type {ConfigSharedOptions, FlatConfigEntry, InternalConfigOptions} from '../types';
import {ConfigEntryBuilder} from '../utils';

export interface RegexpEslintConfigOptions extends ConfigSharedOptions<'regexp'> {}

export const regexpEslintConfig = (
  options: RegexpEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const builder = new ConfigEntryBuilder<'regexp'>(options, internalOptions);

  builder
    .addConfig(['regexp', {includeDefaultFilesAndIgnores: true}], {
      plugins: {
        regexp: eslintPluginRegexp,
      },
    })
    .addBulkRules(eslintPluginRegexp.configs['flat/recommended'].rules)
    // 🟢 Possible Errors
    // .addRule('regexp/no-contradiction-with-assertion', ERROR)
    // "This rule is inspired by the no-control-regex rule. The positions of reports are improved over the core rule and suggestions are provided in some cases"
    .addAnyRule('no-control-regex', OFF)
    .addRule('regexp/no-control-character', ERROR)
    // .addRule('regexp/no-dupe-disjunctions', ERROR)
    .addRule('regexp/no-empty-alternative', ERROR) // Default: warn
    // .addRule('regexp/no-empty-capturing-group', ERROR)
    // "The reports for this rule include reports for the ESLint core no-empty-character-class rule. That is, if you use this rule, you can turn off the ESLint core no-empty-character-class rule"
    .addRule('regexp/no-empty-character-class', ERROR, [], {overrideBaseRule: true})
    // .addRule('regexp/no-empty-group', ERROR)
    // .addRule('regexp/no-empty-lookarounds-assertion', ERROR)
    // .addRule('regexp/no-escape-backspace', ERROR)
    // .addRule('regexp/no-invalid-regexp', ERROR)
    .addRule('regexp/no-lazy-ends', ERROR) // Default: warn
    // .addRule('regexp/no-misleading-capturing-group', ERROR)
    // .addRule('regexp/no-misleading-unicode-character', ERROR)
    // .addRule('regexp/no-missing-g-flag', ERROR)
    // .addRule('regexp/no-optional-assertion', ERROR)
    .addRule('regexp/no-potentially-useless-backreference', WARNING)
    // .addRule('regexp/no-super-linear-backtracking', ERROR)
    // .addRule('regexp/no-super-linear-move', OFF)
    // .addRule('regexp/no-useless-assertions', ERROR)
    // "This rule is a based on the ESLint core no-useless-backreference rule. It reports all the ESLint core rule reports and some more"
    .addRule('regexp/no-useless-backreference', ERROR, [], {overrideBaseRule: true})
    // .addRule('regexp/no-useless-dollar-replacements', ERROR)
    // .addRule('regexp/strict', ERROR)
    // 🟢 Best Practices
    .addRule('regexp/confusing-quantifier', ERROR) // Default: warn
    // .addRule('regexp/control-character-escape', ERROR)
    // .addRule('regexp/negation', ERROR)
    // .addRule('regexp/no-dupe-characters-character-class', ERROR)
    // .addRule('regexp/no-empty-string-literal', ERROR)
    // .addRule('regexp/no-extra-lookaround-assertions', ERROR)
    // .addRule('regexp/no-invisible-character', ERROR)
    // .addRule('regexp/no-legacy-features', ERROR)
    // .addRule('regexp/no-non-standard-flag', ERROR)
    .addRule('regexp/no-obscure-range', WARNING)
    .addRule('regexp/no-octal', ERROR)
    .addRule('regexp/no-standalone-backslash', ERROR)
    // .addRule('regexp/no-trivially-nested-assertion', ERROR)
    // .addRule('regexp/no-trivially-nested-quantifier', ERROR)
    // .addRule('regexp/no-unused-capturing-group', ERROR)
    // .addRule('regexp/no-useless-character-class', ERROR)
    .addRule('regexp/no-useless-flag', ERROR) // Default: warn
    // .addRule('regexp/no-useless-lazy', ERROR)
    // .addRule('regexp/no-useless-quantifier', ERROR)
    // .addRule('regexp/no-useless-range', ERROR)
    // .addRule('regexp/no-useless-set-operand', ERROR)
    // .addRule('regexp/no-useless-string-literal', ERROR)
    // .addRule('regexp/no-useless-two-nums-quantifier', ERROR)
    // .addRule('regexp/no-zero-quantifier', ERROR)
    .addRule('regexp/optimal-lookaround-quantifier', ERROR) // Default: warn
    // .addRule('regexp/optimal-quantifier-concatenation', ERROR)
    // .addRule('regexp/prefer-escape-replacement-dollar-char', OFF)
    // .addRule('regexp/prefer-predefined-assertion', ERROR)
    .addRule('regexp/prefer-quantifier', ERROR) // Default: off
    // .addRule('regexp/prefer-range', ERROR)
    // Same (?) as `@typescript-eslint/prefer-regexp-exec` which is turned off by default
    // .addRule('regexp/prefer-regexp-exec', OFF)
    .addAnyRule('unicorn/prefer-regexp-test', OFF)
    .addRule('regexp/prefer-regexp-test', ERROR) // TODO better than the unicorn rule? Off by default
    // .addRule('regexp/prefer-set-operation', ERROR)
    // "This rule is inspired by the require-unicode-regexp rule. The position of the report is improved over the core rule and arguments of new RegExp() are also checked"
    // Yes, still off - we just want to show that it's a better replacement for the core rule
    .addRule('regexp/require-unicode-regexp', OFF, [], {overrideBaseRule: true})
    // .addRule('regexp/require-unicode-sets-regexp', OFF)
    // .addRule('regexp/simplify-set-operations', ERROR)
    // .addRule('regexp/sort-alternatives', OFF)
    // .addRule('regexp/use-ignore-case', ERROR)
    // 🟢 Stylistic Issues
    // .addRule('regexp/grapheme-string-literal', OFF) // TODO
    .addRule('regexp/hexadecimal-escape', ERROR, ['never'])
    // .addRule('regexp/letter-case', ERROR)
    // .addRule('regexp/match-any', ERROR)
    // .addRule('regexp/no-useless-escape', ERROR)
    // .addRule('regexp/no-useless-non-capturing-group', ERROR)
    // .addRule('regexp/prefer-character-class', ERROR)
    // .addRule('regexp/prefer-d', ERROR)
    .addRule('regexp/prefer-lookaround', ERROR, [{lookbehind: false}]) // Default: off
    // .addRule('regexp/prefer-named-backreference', OFF)
    // "This rule is inspired by the prefer-named-capture-group rule. The positions of reports are improved over the core rule and arguments of new RegExp() are also checked"
    // Yes, still off - we just want to show that it's a better replacement for the core rule
    .addRule('regexp/prefer-named-capture-group', OFF, [], {overrideBaseRule: true})
    // .addRule('regexp/prefer-named-replacement', OFF)
    // .addRule('regexp/prefer-plus-quantifier', ERROR)
    // .addRule('regexp/prefer-question-quantifier', ERROR)
    // .addRule('regexp/prefer-result-array-groups', OFF)
    // .addRule('regexp/prefer-star-quantifier', ERROR)
    // .addRule('regexp/prefer-unicode-codepoint-escapes', ERROR)
    // .addRule('regexp/prefer-w', ERROR)
    .addRule('regexp/sort-character-class-elements', ERROR) // Default: off
    // .addRule('regexp/sort-flags', ERROR)
    // .addRule('regexp/unicode-escape', OFF)
    .addRule('regexp/unicode-property', ERROR)
    .addOverrides();

  return builder.getAllConfigs();
};

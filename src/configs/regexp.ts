import * as eslintPluginRegexp from 'eslint-plugin-regexp';
import {ERROR, OFF} from '../constants';
import type {ConfigSharedOptions, FlatConfigEntry, InternalConfigOptions} from '../types';
import {genFlatConfigEntryName, genRuleOverrideFn, warnUnlessForcedError} from '../utils';

export interface RegexpEslintConfigOptions extends ConfigSharedOptions<`regexp/${string}`> {}

const overrideBaseRule = genRuleOverrideFn('regexp');

export const regexpEslintConfig = (
  options: RegexpEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const rules: FlatConfigEntry['rules'] = {
    // Possible Errors

    // 'regexp/no-contradiction-with-assertion': ERROR,
    // "This rule is inspired by the no-control-regex rule. The positions of reports are improved over the core rule and suggestions are provided in some cases"
    'no-control-regex': OFF,
    'regexp/no-control-character': ERROR,
    // 'regexp/no-dupe-disjunctions': ERROR,
    'regexp/no-empty-alternative': ERROR, // Default: warn
    // 'regexp/no-empty-capturing-group': ERROR,
    // "The reports for this rule include reports for the ESLint core no-empty-character-class rule. That is, if you use this rule, you can turn off the ESLint core no-empty-character-class rule"
    ...overrideBaseRule('no-empty-character-class', ERROR),
    // 'regexp/no-empty-group': ERROR,
    // 'regexp/no-empty-lookarounds-assertion': ERROR,
    // 'regexp/no-escape-backspace': ERROR,
    // 'regexp/no-invalid-regexp': ERROR,
    'regexp/no-lazy-ends': ERROR, // Default: warn
    // 'regexp/no-misleading-capturing-group': ERROR,
    // 'regexp/no-misleading-unicode-character': ERROR,
    // 'regexp/no-missing-g-flag': ERROR,
    // 'regexp/no-optional-assertion': ERROR,
    ...warnUnlessForcedError(internalOptions, 'regexp/no-potentially-useless-backreference'),
    // 'regexp/no-super-linear-backtracking': ERROR,
    // 'regexp/no-super-linear-move': OFF,
    // 'regexp/no-useless-assertions': ERROR,
    // "This rule is a based on the ESLint core no-useless-backreference rule. It reports all the ESLint core rule reports and some more"
    ...overrideBaseRule('no-useless-backreference', ERROR),
    // 'regexp/no-useless-dollar-replacements': ERROR,
    // 'regexp/strict': ERROR,

    // Best Practices

    'regexp/confusing-quantifier': ERROR, // Default: warn
    // 'regexp/control-character-escape': ERROR,
    // 'regexp/negation': ERROR,
    // 'regexp/no-dupe-characters-character-class': ERROR,
    // 'regexp/no-empty-string-literal': ERROR,
    // 'regexp/no-extra-lookaround-assertions': ERROR,
    // 'regexp/no-invisible-character': ERROR,
    // 'regexp/no-legacy-features': ERROR,
    // 'regexp/no-non-standard-flag': ERROR,
    ...warnUnlessForcedError(internalOptions, 'regexp/no-obscure-range'),
    'regexp/no-octal': ERROR,
    'regexp/no-standalone-backslash': ERROR,
    // 'regexp/no-trivially-nested-assertion': ERROR,
    // 'regexp/no-trivially-nested-quantifier': ERROR,
    // 'regexp/no-unused-capturing-group': ERROR,
    // 'regexp/no-useless-character-class': ERROR,
    'regexp/no-useless-flag': ERROR, // Default: warn
    // 'regexp/no-useless-lazy': ERROR,
    // 'regexp/no-useless-quantifier': ERROR,
    // 'regexp/no-useless-range': ERROR,
    // 'regexp/no-useless-set-operand': ERROR,
    // 'regexp/no-useless-string-literal': ERROR,
    // 'regexp/no-useless-two-nums-quantifier': ERROR,
    // 'regexp/no-zero-quantifier': ERROR,
    'regexp/optimal-lookaround-quantifier': ERROR, // Default: warn
    // 'regexp/optimal-quantifier-concatenation': ERROR,
    // 'regexp/prefer-escape-replacement-dollar-char': OFF,
    // 'regexp/prefer-predefined-assertion': ERROR,
    'regexp/prefer-quantifier': ERROR, // Default: off
    // 'regexp/prefer-range': ERROR,
    // Same (?) as `@typescript-eslint/prefer-regexp-exec` which is turned off by default
    // 'regexp/prefer-regexp-exec': OFF,
    'unicorn/prefer-regexp-test': OFF,
    'regexp/prefer-regexp-test': ERROR, // TODO better than the unicorn rule? Off by default
    // 'regexp/prefer-set-operation': ERROR,
    // "This rule is inspired by the require-unicode-regexp rule. The position of the report is improved over the core rule and arguments of new RegExp() are also checked"
    // Yes, still off - we just want to show that it's a better replacement for the core rule
    ...overrideBaseRule('require-unicode-regexp', OFF),
    // 'regexp/require-unicode-sets-regexp': OFF,
    // 'regexp/simplify-set-operations': ERROR,
    // 'regexp/sort-alternatives': OFF,
    // 'regexp/use-ignore-case': ERROR,

    // Stylistic Issues

    // 'regexp/grapheme-string-literal': OFF, // TODO
    'regexp/hexadecimal-escape': [ERROR, 'never'],
    // 'regexp/letter-case': ERROR,
    // 'regexp/match-any': ERROR,
    // 'regexp/no-useless-escape': ERROR,
    // 'regexp/no-useless-non-capturing-group': ERROR,
    // 'regexp/prefer-character-class': ERROR,
    // 'regexp/prefer-d': ERROR,
    'regexp/prefer-lookaround': [ERROR, {lookbehind: false}], // Default: off
    // 'regexp/prefer-named-backreference': OFF,
    // "This rule is inspired by the prefer-named-capture-group rule. The positions of reports are improved over the core rule and arguments of new RegExp() are also checked"
    // Yes, still off - we just want to show that it's a better replacement for the core rule
    ...overrideBaseRule('prefer-named-capture-group', OFF),
    // 'regexp/prefer-named-replacement': OFF,
    // 'regexp/prefer-plus-quantifier': ERROR,
    // 'regexp/prefer-question-quantifier': ERROR,
    // 'regexp/prefer-result-array-groups': OFF,
    // 'regexp/prefer-star-quantifier': ERROR,
    // 'regexp/prefer-unicode-codepoint-escapes': ERROR,
    // 'regexp/prefer-w': ERROR,
    'regexp/sort-character-class-elements': ERROR, // Default: off
    // 'regexp/sort-flags': ERROR,
    // 'regexp/unicode-escape': OFF,
    'regexp/unicode-property': ERROR,

    // ...warnUnlessForcedError(internalOptions, 'regexp/'),
  };

  return [
    {
      ...(options.files && {files: options.files}),
      ...(options.ignores && {ignores: options.ignores}),
      plugins: {
        regexp: eslintPluginRegexp,
      },
      rules: {
        ...eslintPluginRegexp.configs['flat/recommended'].rules,
        ...rules,
        ...options.overrides,
      },
      name: genFlatConfigEntryName('regexp'),
    },
  ];
};

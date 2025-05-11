import {ERROR, OFF, WARNING} from '../constants';
import {type ConfigSharedOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface RegexpEslintConfigOptions extends ConfigSharedOptions<'regexp'> {}

export const regexpUnConfig: UnConfigFn<'regexp'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.regexp;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies RegexpEslintConfigOptions);

  const configBuilder = createConfigBuilder(context, optionsResolved, 'regexp');

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig(['regexp', {includeDefaultFilesAndIgnores: true, doNotIgnoreHtml: true}])
    /* Category: Possible Errors */
    .addRule('no-contradiction-with-assertion', ERROR) // 🟢
    // "This rule is inspired by the `no-control-regex` rule. The positions of reports are improved over the core rule and suggestions are provided in some cases"
    .disableAnyRule('', 'no-control-regex') // TODO 🟢(enabled?!)
    .addRule('no-control-character', ERROR)
    .addRule('no-dupe-disjunctions', ERROR) // 🟢
    .addRule('no-empty-alternative', ERROR) // 🟡
    .addRule('no-empty-capturing-group', ERROR) // 🟢
    // "The reports for this rule include reports for the ESLint core no-empty-character-class rule. That is, if you use this rule, you can turn off the ESLint core no-empty-character-class rule"
    .addRule('no-empty-character-class', ERROR) // 🟢
    .disableAnyRule('', 'no-empty-character-class') // 🟢
    .addRule('no-empty-group', ERROR) // 🟢
    .addRule('no-empty-lookarounds-assertion', ERROR) // 🟢
    .addRule('no-escape-backspace', ERROR) // 🟢
    .addRule('no-invalid-regexp', ERROR) // 🟢
    .disableAnyRule('', 'no-invalid-regexp')
    .addRule('no-lazy-ends', ERROR) // 🟡
    .addRule('no-misleading-capturing-group', ERROR) // 🟢
    .addRule('no-misleading-unicode-character', ERROR) // 🟢
    .addRule('no-missing-g-flag', ERROR) // 🟢
    .addRule('no-optional-assertion', ERROR) // 🟢
    .addRule('no-potentially-useless-backreference', WARNING) // 🟡
    .addRule('no-super-linear-backtracking', ERROR) // 🟢
    .addRule('no-super-linear-move', OFF)
    .addRule('no-useless-assertions', ERROR) // 🟢
    // "This rule is a based on the ESLint core `no-useless-backreference` rule. It reports all the ESLint core rule reports and some more"
    .addRule('no-useless-backreference', ERROR) // 🟢
    .disableAnyRule('', 'no-useless-backreference') // 🟢
    .addRule('no-useless-dollar-replacements', ERROR) // 🟢
    .addRule('strict', ERROR) // 🟢
    /* Category: Best Practices */
    .addRule('confusing-quantifier', ERROR) // 🟡
    .addRule('control-character-escape', ERROR) // 🟢
    .addRule('negation', ERROR) // 🟢
    .addRule('no-dupe-characters-character-class', ERROR) // 🟢
    .addRule('no-empty-string-literal', ERROR) // 🟢
    .addRule('no-extra-lookaround-assertions', ERROR) // 🟢
    .addRule('no-invisible-character', ERROR) // 🟢
    .addRule('no-legacy-features', ERROR) // 🟢
    .addRule('no-non-standard-flag', ERROR) // 🟢
    .addRule('no-obscure-range', WARNING) // 🟢
    .addRule('no-octal', ERROR)
    .addRule('no-standalone-backslash', ERROR)
    .addRule('no-trivially-nested-assertion', ERROR) // 🟢
    .addRule('no-trivially-nested-quantifier', ERROR) // 🟢
    .addRule('no-unused-capturing-group', ERROR) // 🟢
    .addRule('no-useless-character-class', ERROR) // 🟢
    .addRule('no-useless-flag', ERROR) // 🟡
    .addRule('no-useless-lazy', ERROR) // 🟢
    .addRule('no-useless-quantifier', ERROR) // 🟢
    .addRule('no-useless-range', ERROR) // 🟢
    .addRule('no-useless-set-operand', ERROR) // 🟢
    .addRule('no-useless-string-literal', ERROR) // 🟢
    .addRule('no-useless-two-nums-quantifier', ERROR) // 🟢
    .addRule('no-zero-quantifier', ERROR) // 🟢
    .addRule('optimal-lookaround-quantifier', ERROR) // 🟡
    .addRule('optimal-quantifier-concatenation', ERROR) // 🟢
    .addRule('prefer-escape-replacement-dollar-char', OFF)
    .addRule('prefer-predefined-assertion', ERROR) // 🟢
    .addRule('prefer-quantifier', ERROR)
    .addRule('prefer-range', ERROR) // 🟢
    // Same (?) as `@typescript-eslint/prefer-regexp-exec` which is turned off by default
    .addRule('prefer-regexp-exec', OFF)
    .disableAnyRule('unicorn', 'prefer-regexp-test')
    .addRule('prefer-regexp-test', ERROR) // TODO better than the unicorn rule? Off by default
    .addRule('prefer-set-operation', ERROR) // 🟢
    // "This rule is inspired by the `require-unicode-regexp` rule. The position of the report is improved over the core rule and arguments of new RegExp() are also checked"
    // Yes, still off - we just want to show that it's a better replacement for the core rule
    .addRule('require-unicode-regexp', OFF)
    .disableAnyRule('', 'require-unicode-regexp')
    .addRule('require-unicode-sets-regexp', OFF)
    .addRule('simplify-set-operations', ERROR) // 🟢
    .addRule('sort-alternatives', OFF)
    .addRule('use-ignore-case', ERROR) // 🟢
    /* Category: Stylistic Issues */
    .addRule('grapheme-string-literal', OFF) // TODO
    .addRule('hexadecimal-escape', ERROR, ['never'])
    .addRule('letter-case', ERROR)
    .addRule('match-any', ERROR) // 🟢
    .addRule('no-useless-escape', ERROR) // 🟢
    .addRule('no-useless-non-capturing-group', ERROR) // 🟢
    .addRule('prefer-character-class', ERROR) // 🟢
    .addRule('prefer-d', ERROR) // 🟢
    .addRule('prefer-lookaround', ERROR, [{lookbehind: false}])
    .addRule('prefer-named-backreference', OFF)
    // "This rule is inspired by the `prefer-named-capture-group` rule. The positions of reports are improved over the core rule and arguments of new RegExp() are also checked"
    // Yes, still off - we just want to show that it's a better replacement for the core rule
    .addRule('prefer-named-capture-group', OFF)
    .disableAnyRule('', 'prefer-named-capture-group')
    .addRule('prefer-named-replacement', OFF)
    .addRule('prefer-plus-quantifier', ERROR) // 🟢
    .addRule('prefer-question-quantifier', ERROR) // 🟢
    .addRule('prefer-result-array-groups', OFF)
    .addRule('prefer-star-quantifier', ERROR) // 🟢
    .addRule('prefer-unicode-codepoint-escapes', ERROR) // 🟢
    .addRule('prefer-w', ERROR) // 🟢
    .addRule('sort-character-class-elements', ERROR)
    .addRule('sort-flags', ERROR) // 🟢
    .addRule('unicode-escape', OFF)
    .addRule('unicode-property', ERROR)
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

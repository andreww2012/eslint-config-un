import {ERROR, OFF, WARNING} from '../constants';
import {ConfigEntryBuilder, type ConfigSharedOptions} from '../eslint';
import {pluginsLoaders} from '../plugins';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface SonarEslintConfigOptions extends ConfigSharedOptions<'sonarjs'> {
  /**
   * Enables rules that are specific to AWS
   * @default true
   */
  enableAwsRules?: boolean;

  /**
   * Enables rules that are specific to test or assertion libraries
   * @default true
   */
  testsRules?: boolean;
}

export const sonarUnConfig: UnConfigFn<'sonar'> = async (context) => {
  const eslintPluginSonar = await pluginsLoaders.sonarjs();

  const optionsRaw = context.rootOptions.configs?.sonar;
  const optionsResolved = assignDefaults(optionsRaw, {
    enableAwsRules: true,
    testsRules: true,
  } satisfies SonarEslintConfigOptions);

  const {enableAwsRules, testsRules} = optionsResolved;

  const awsRulesSeverity = enableAwsRules ? ERROR : OFF;
  const testsRulesSeverity = testsRules ? ERROR : OFF;

  const configBuilder = new ConfigEntryBuilder('sonarjs', optionsResolved, context);

  // Legend:
  // 🟢 - in Recommended
  // 🔴 - deprecated
  // 💭 - requires type information
  // 🔤 - rule for regular expressions
  // 🧪 - rule for testing frameworks
  // 📦 - rule for specific package(s) or node module(s)
  // ⚠️ - rule is disabled (or kept disabled) because it overlaps with other rule(s) or by other reason(s) listed hereinafter
  // 🔵 - JSX/HTML rule

  configBuilder
    .addConfig(['sonar', {includeDefaultFilesAndIgnores: true}])
    .addBulkRules(eslintPluginSonar.configs.recommended.rules)
    // .addRule('anchor-precedence', ERROR) // 🟢💭🔤
    // ⚠️ Handled by TypeScript
    .addRule('argument-type', OFF) // 🟢💭
    // .addRule('arguments-order', ERROR) // 🟢💭
    // ⚠️ `prefer-rest-params`
    // .addRule('arguments-usage', OFF)
    // ⚠️ Handled by TypeScript
    .addRule('array-callback-without-return', OFF) // 🟢💭
    // ⚠️ `no-array-constructor`, `unicorn/no-new-array`
    // .addRule('array-constructor', OFF)
    // ⚠️ Prettier
    // .addRule('arrow-function-convention', OFF)
    .addRule('assertions-in-tests', testsRulesSeverity) // 🟢🧪
    .addRule('aws-apigateway-public-api', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('aws-ec2-rds-dms-public', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('aws-ec2-unencrypted-ebs-volume', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('aws-efs-unencrypted', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('aws-iam-all-privileges', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('aws-iam-all-resources-accessible', OFF) // 📦 `aws-cdk-lib`
    .addRule('aws-iam-privilege-escalation', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('aws-iam-public-access', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('aws-opensearchservice-domain', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('aws-rds-unencrypted-databases', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('aws-restricted-ip-admin-access', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('aws-s3-bucket-granted-access', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('aws-s3-bucket-insecure-http', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('aws-s3-bucket-public-access', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('aws-s3-bucket-server-encryption', OFF) // 🔴 📦 `aws-cdk-lib`
    .addRule('aws-s3-bucket-versioning', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('aws-sagemaker-unencrypted-notebook', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('aws-sns-unencrypted-topics', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('aws-sqs-unencrypted-queue', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    // Note: doesn't seem to work in TypeScript code
    // .addRule('bitwise-operators', ERROR) // 🟢
    // ⚠️ `block-scoped-var`, `vars-on-top`
    .addRule('block-scoped-var', OFF) // 🟢
    // .addRule('bool-param-default', OFF)
    // ⚠️ Prettier
    .addRule('call-argument-line', OFF) // 🟢
    // .addRule('certificate-transparency', ERROR) // 🟢 📦 `helmet`
    .addRule('chai-determinate-assertion', testsRulesSeverity) // 🟢🧪 📦 `chai`
    // ⚠️ `camelcase`
    .addRule('class-name', OFF) // 🟢
    // .addRule('class-prototype', OFF) // 💭
    // ⚠️ `no-eval`, `no-script-url`, `no-new-func`
    .addRule('code-eval', OFF) // 🟢
    // ⚠️ Unreliable metric and cannot be universally applied to all projects
    .addRule('cognitive-complexity', OFF) // 🟢
    // .addRule('comma-or-logical-or-case', ERROR) // 🟢
    // .addRule('comment-regex', OFF)
    // ⚠️ `regexp/prefer-w`, `regexp/prefer-plus-quantifier`
    .addRule('concise-regex', OFF) // 🟢💭🔤
    .addRule('conditional-indentation', OFF) // 🔴
    // .addRule('confidential-information-logging', ERROR) // 🟢 📦 `signale`
    // ⚠️ `no-new`
    .addRule('constructor-for-side-effects', OFF) // 🟢
    // .addRule('content-length', ERROR) // 🟢 📦 `formidable`, `multer`, `body-parser`
    // .addRule('content-security-policy', ERROR) // 🟢 📦 `helmet`
    // .addRule('cookie-no-httponly', ERROR) // 🟢 📦 `cookie-session`, `express-session`, `cookies`, `csurf`
    // .addRule('cookies', OFF) // 🔴
    // .addRule('cors', ERROR) // 🟢 📦 `node:http`, `cors`
    // .addRule('csrf', ERROR) // 🟢 📦 `csurf`
    // .addRule('cyclomatic-complexity', OFF)
    // .addRule('declarations-in-global-scope', OFF)
    // ⚠️ `import/no-deprecated`, `@typescript-eslint/no-deprecated` which also likely do the job better
    .addRule('deprecation', OFF) // 🟢💭
    // .addRule('destructuring-assignment-syntax', OFF)
    // ⚠️ Other rules & TypeScript itself; has false positives
    .addRule('different-types-comparison', OFF) // 🟢💭
    // .addRule('disabled-auto-escaping', ERROR) // 🟢💭 📦 `mustache`, `handlebars`, `markdown-it`, `marked`, `kramed`
    // .addRule('disabled-resource-integrity', ERROR) // 🟢💭
    .addRule('disabled-timeout', testsRulesSeverity) // 🟢🧪
    // .addRule('dns-prefetching', OFF) // 🔴
    // ⚠️ `regexp/no-dupe-characters-character-class`
    .addRule('duplicates-in-character-class', OFF) // 🟢💭🔤
    // .addRule('elseif-without-else', OFF)
    // ⚠️ `regexp/no-empty-group` (and also `sonarjs/no-empty-group`), `regexp/no-empty-alternative`, `regexp/no-trivially-nested-quantifier`
    .addRule('empty-string-repetition', OFF) // 🟢💭🔤
    // .addRule('encryption', OFF) // 🔴
    // .addRule('encryption-secure-mode', ERROR) // 🟢 📦 `node:crypto`
    // .addRule('enforce-trailing-comma', OFF) // 🔴
    // Not disabling because, despite being mostly covered by `regexp/no-useless-dollar-replacements` rule, finds more problems
    // .addRule('existing-groups', ERROR) // 🟢💭🔤
    // .addRule('expression-complexity', OFF)
    // .addRule('file-header', OFF)
    // .addRule('file-name-differ-from-class', OFF)
    // .addRule('file-permissions', ERROR) // 🟢 📦 `node:fs`, `node:process`
    // .addRule('file-uploads', ERROR) // 🟢 📦 `formidable`, `multer`
    // ⚠️ Completely forbids FIXME comments
    .addRule('fixme-tag', OFF) // 🟢
    // Reason for not enabling: covered by `guard-for-in` rule
    // .addRule('for-in', OFF)
    // .addRule('for-loop-increment-sign', ERROR) // 🟢
    // .addRule('frame-ancestors', ERROR) // 🟢 📦 `helmet`
    // ⚠️ IMHO too restrictive + some cases covered by `unicorn/consistent-function-scoping`
    .addRule('function-inside-loop', OFF) // 🟢
    // .addRule('function-name', OFF)
    // ⚠️ certainly not for everyone
    .addRule('function-return-type', OFF) // 🟢💭
    // .addRule('future-reserved-words', ERROR) // 🟢
    // ⚠️ `require-yield`. Does not seem to report on empty yields like `yield;`
    .addRule('generator-without-yield', OFF) // 🟢
    // .addRule('hashing', ERROR) // 🟢 📦 `node:crypto`
    // .addRule('hidden-files', ERROR) // 🟢 📦 `serve-static`
    // ⚠️ Handled by TypeScript
    .addRule('in-operator-type-error', OFF) // 🟢💭
    // .addRule('inconsistent-function-call', ERROR) // 🟢
    // .addRule('index-of-compare-to-positive-number', ERROR) // 🟢💭
    // .addRule('insecure-cookie', ERROR) // 🟢 📦 `cookie-session`, `express-session`, `cookies`, `csurf`
    // .addRule('insecure-jwt-token', ERROR) // 🟢 📦 `jsonwebtoken`
    .addRule('inverted-assertion-arguments', testsRulesSeverity) // 🟢🧪 📦 `chai`
    // .addRule('jsx-no-leaked-render', ERROR) // 🟢💭🔵
    // ⚠️ `no-labels`
    .addRule('label-position', OFF) // 🟢
    // TODO not sure if this is needed now
    // .addRule('link-with-target-blank', ERROR) // 🟢
    // .addRule('max-lines', OFF)
    // .addRule('max-lines-per-function', OFF)
    // ⚠️ Not for every project
    .addRule('max-switch-cases', OFF) // 🟢
    // .addRule('max-union-size', OFF)
    .addRule('misplaced-loop-counter', WARNING) // 🟢
    // .addRule('nested-control-flow', OFF)
    // ⚠️ Handled by TypeScript
    .addRule('new-operator-misuse', OFF) // 🟢💭
    // .addRule('no-all-duplicated-branches', ERROR) // 🟢
    // ⚠️ Seems too restrictive for me, alphabetical sorting is not a very rare requirement
    .addRule('no-alphabetical-sort', OFF) // 🟢💭
    // .addRule('no-angular-bypass-sanitization', ERROR) // 🟢 📦 `@angular/*`
    // ⚠️ `@typescript-eslint/no-array-delete`; works on TS code only anyway
    .addRule('no-array-delete', OFF) // 🟢💭
    // ⚠️ Handled by TypeScript
    .addRule('no-associative-arrays', OFF) // 🟢💭
    // ⚠️ Seems too restrictive for me
    .addRule('no-async-constructor', OFF) // 🟢
    // Reason for keeping disabled: should mostly be covered by `no-global-assign`
    // .addRule('no-built-in-override', OFF)
    // .addRule('no-case-label-in-switch', ERROR) // 🟢
    .addRule('no-clear-text-protocols', WARNING) // 🟢 📦 `nodemailer`, `ftp`, `telnet-client`, `aws-cdk-lib`
    .addRule('no-code-after-done', testsRulesSeverity) // 🟢🧪 📦 `chai`
    // .addRule('no-collapsible-if', OFF)
    // TODO disable autofix?
    // .addRule('no-collection-size-mischeck', ERROR) // 🟢💭
    // ⚠️ Seems too restrictive
    .addRule('no-commented-code', OFF) // 🟢
    // ⚠️ `regexp/no-control-character`
    .addRule('no-control-regex', OFF) // 🟢💭🔤
    // ⚠️ `no-useless-assignment`
    .addRule('no-dead-store', OFF) // 🟢
    // .addRule('no-delete-var', ERROR) // 🟢
    // ⚠️ `@typescript-eslint/no-duplicate-type-constituents`
    .addRule('no-duplicate-in-composite', OFF) // 🟢
    // .addRule('no-duplicate-string', OFF)
    // .addRule('no-duplicated-branches', ERROR) // 🟢
    // .addRule('no-element-overwrite', ERROR) // 🟢
    // Reason for keeping enabled: not caught by eslint-plugin-regexp
    // .addRule('no-empty-after-reluctant', ERROR) // 🟢💭🔤
    // ⚠️ `regexp/no-empty-alternative`
    .addRule('no-empty-alternatives', OFF) // 🟢💭🔤
    // ⚠️ `regexp/no-empty-character-class`
    .addRule('no-empty-character-class', OFF) // 🟢💭🔤
    // .addRule('no-empty-collection', ERROR) // 🟢
    // ⚠️ `regexp/no-empty-group`
    .addRule('no-empty-group', OFF) // 🟢💭🔤
    // ⚠️ It seems fragile to me that this rule does not give the control over which files to consider as test files: "This rule flags any file that has .test or .spec as part of its suffix but does not contain any test cases defined using the different forms of the it and test functions from Jasmine, Jest, Mocha, or Node.js testing API."
    .addRule('no-empty-test-file', OFF) // 🟢🧪
    // .addRule('no-equals-in-for-termination', ERROR) // 🟢
    // ⚠️ `jest/no-focused-tests`, `vitest/no-focused-tests`. For other testing frameworks, one can enable this rule manually
    .addRule('no-exclusive-tests', OFF) // 🟢🧪
    // .addRule('no-extra-arguments', ERROR) // 🟢
    // ⚠️ `no-fallthrough`
    .addRule('no-fallthrough', OFF) // 🟢
    .addRule('no-for-in-iterable', ERROR) // 💭
    // .addRule('no-function-declaration-in-block', OFF)
    // .addRule('no-global-this', ERROR) // 🟢
    // Note: with cases noncompliant with this rule, ESLint fails on parsing stage anyway due to the assuming of being in a strict mode
    // .addRule('no-globals-shadowing', ERROR) // 🟢
    // .addRule('no-gratuitous-expressions', ERROR) // 🟢
    // Warning because has false positives (triggered on any strings looking like IP addresses)
    .addRule('no-hardcoded-ip', WARNING) // 🟢 📦 `node:net`
    // .addRule('no-hardcoded-passwords', ERROR) // 🟢 📦 `mysql`
    // "This rule detects variables/fields having a name matching a list of words (secret, token, credential, auth, api[_.-]?key) being assigned a pseudorandom hard-coded value. The pseudorandomness of the hard-coded value is based on its entropy and the probability to be human-readable."
    // .addRule('no-hardcoded-secrets', ERROR) // 🟢
    // .addRule('no-hook-setter-in-body', ERROR) // 🟢 📦 `react`
    // ⚠️ `no-dupe-else-if`, `no-duplicate-case`
    .addRule('no-identical-conditions', OFF) // 🟢
    // Note: partially overlaps with `no-self-compare`
    // .addRule('no-identical-expressions', ERROR) // 🟢
    // .addRule('no-identical-functions', ERROR) // 🟢
    // .addRule('no-ignored-exceptions', ERROR) // 🟢
    // .addRule('no-ignored-return', ERROR) // 🟢💭
    // Reason for keeping disabled: should mostly be covered by `import/no-extraneous-dependencies`
    .addRule('no-implicit-dependencies', OFF)
    // .addRule('no-implicit-global', ERROR) // 🟢
    // .addRule('no-in-misuse', ERROR) // 🟢💭
    .addRule('no-incomplete-assertions', testsRulesSeverity) // 🟢🧪 📦 `chai`
    // ⚠️ `consistent-return`
    // .addRule('no-inconsistent-returns', OFF)
    // ⚠️ `@typescript-eslint/restrict-plus-operands`
    // .addRule('no-incorrect-string-concat', OFF) // 💭
    // .addRule('no-internal-api-use', ERROR) // 🟢
    // .addRule('no-intrusive-permissions', ERROR) // 🟢
    // ⚠️ `@typescript-eslint/await-thenable`, `unicorn/no-unnecessary-await`
    .addRule('no-invalid-await', OFF) // 🟢💭
    // ⚠️ `regexp/no-invalid-regexp`
    .addRule('no-invalid-regexp', OFF) // 🟢💭🔤
    // .addRule('no-invariant-returns', ERROR) // 🟢
    // .addRule('no-inverted-boolean-check', ERROR) // 🟢
    // .addRule('no-ip-forward', ERROR) // 🟢 📦 `node-http-proxy`, `http-proxy-middleware`
    // ⚠️ `no-labels`
    .addRule('no-labels', OFF) // 🟢
    // Note: seems usable in .js files only
    // .addRule('no-literal-call', ERROR) // 🟢
    // .addRule('no-mime-sniff', ERROR) // 🟢 📦 `helmet`
    // .addRule('no-misleading-array-reverse', ERROR) // 🟢💭
    // ⚠️ `regexp/no-misleading-unicode-character`
    .addRule('no-misleading-character-class', OFF) // 🟢💭🔤
    // .addRule('no-mixed-content', ERROR) // 🟢 📦 `helmet`
    // ⚠️ Too noisy in practice
    .addRule('no-nested-assignment', OFF) // 🟢
    // ⚠️ Too noisy in practice
    .addRule('no-nested-conditional', OFF) // 🟢
    // ⚠️ Too noisy in practice
    .addRule('no-nested-functions', OFF) // 🟢
    // .addRule('no-nested-incdec', OFF)
    // .addRule('no-nested-switch', OFF)
    // ⚠️ Seems too restrictive for me
    .addRule('no-nested-template-literals', OFF) // 🟢
    // ⚠️ `no-unreachable-loop`
    .addRule('no-one-iteration-loop', OFF) // 🟢
    // .addRule('no-os-command-from-path', ERROR) // 🟢 📦 `node:child_process`
    // .addRule('no-parameter-reassignment', ERROR) // 🟢
    // ⚠️ `no-new-wrappers`
    .addRule('no-primitive-wrappers', OFF) // 🟢
    // .addRule('no-redundant-assignments', ERROR) // 🟢
    // .addRule('no-redundant-boolean', ERROR) // 🟢
    // .addRule('no-redundant-jump', ERROR) // 🟢
    // .addRule('no-redundant-optional', ERROR) // 🟢💭
    // .addRule('no-redundant-parentheses', OFF) // 🔴
    // .addRule('no-reference-error', OFF)
    // .addRule('no-referrer-policy', ERROR) // 🟢 📦 `helmet`
    // ⚠️ `no-regex-spaces`, `regexp/prefer-quantifier`
    .addRule('no-regex-spaces', OFF) // 🟢💭🔤
    // .addRule('no-require-or-define', OFF) // 💭
    // .addRule('no-return-type-any', OFF) // 💭
    .addRule('no-same-argument-assert', testsRulesSeverity) // 🟢🧪 📦 `chai`
    // ⚠️ Purely stylistic, handled by Prettier
    .addRule('no-same-line-conditional', OFF) // 🟢
    // ⚠️ Unsure about this one, it seems to me that it might disallow "normal" code which could be hard to "fix"
    .addRule('no-selector-parameter', OFF) // 🟢💭
    // ⚠️ `jest/no-disabled-tests`, `vitest/no-disabled-tests`
    .addRule('no-skipped-tests', OFF) // 🟢🧪
    // .addRule('no-small-switch', ERROR) // 🟢
    // .addRule('no-sonar-comments', OFF)
    // .addRule('no-tab', OFF) // 🔴
    // .addRule('no-table-as-layout', ERROR) // 🟢🔵
    // ⚠️ Reports on promise-returning functions marked with `void `
    .addRule('no-try-promise', OFF) // 🟢💭
    // .addRule('no-undefined-argument', ERROR) // 🟢💭
    // ⚠️ Useful in some scenarios, for example in `mongoose` to remove the property from the document
    // .addRule('no-undefined-assignment', OFF)
    // ⚠️ `curly` and Prettier
    .addRule('no-unenclosed-multiline-block', OFF) // 🟢
    // .addRule('no-uniq-key', ERROR) // 🟢🔵
    // .addRule('no-unsafe-unzip', ERROR) // 🟢 📦 `tar`, `adm-zip`, `jszip`, `yauzl`, `extract-zip`
    // ⚠️ `no-new`
    .addRule('no-unthrown-error', OFF) // 🟢
    // .addRule('no-unused-collection', ERROR) // 🟢
    // .addRule('no-unused-function-argument', OFF)
    // ⚠️ `no-unused-vars`
    .addRule('no-unused-vars', OFF) // 🟢
    // .addRule('no-use-of-empty-return-value', ERROR) // 🟢
    // ⚠️ `no-useless-catch`
    .addRule('no-useless-catch', OFF) // 🟢
    // .addRule('no-useless-increment', ERROR) // 🟢
    // Reason for disabling: disallows `string & {}` pattern and has false positives
    .addRule('no-useless-intersection', OFF) // 🟢💭
    // .addRule('no-useless-react-setstate', ERROR) // 🟢 📦 `react`
    // ⚠️ `no-use-before-define`, `block-scoped-var`, `vars-on-top`
    // .addRule('no-variable-usage-before-declaration', OFF)
    // ⚠️ `vue/no-v-html`. Also finds problems in Vue 2 render functions
    .addRule('no-vue-bypass-sanitization', OFF) // 🟢
    // .addRule('no-weak-cipher', ERROR) // 🟢 📦 `node:crypto`
    // .addRule('no-weak-keys', ERROR) // 🟢 📦 `node:crypto`
    // .addRule('no-wildcard-import', OFF)
    // .addRule('non-existent-operator', ERROR) // 🟢
    // ⚠️ TypeScript
    // .addRule('non-number-in-arithmetic-expression', OFF) // 💭
    // ⚠️ TypeScript
    .addRule('null-dereference', OFF) // 🟢💭
    // .addRule('object-alt-content', ERROR) // 🟢🔵
    // ⚠️ TypeScript
    // .addRule('operation-returning-nan', OFF) // 💭
    // .addRule('os-command', ERROR) // 🟢 📦 `node:child_process`
    // .addRule('post-message', ERROR) // 🟢💭
    // ⚠️ `default-case-last`
    .addRule('prefer-default-last', OFF) // 🟢
    // .addRule('prefer-immediate-return', OFF)
    .addRule('prefer-object-literal', ERROR)
    // .addRule('prefer-promise-shorthand', ERROR) // 🟢
    // ⚠️ IMHO this is not a common practice
    .addRule('prefer-read-only-props', OFF) // 🟢💭
    // ⚠️ `RegExp.prototype.exec` mutates the state of the regexp: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#return_value
    .addRule('prefer-regexp-exec', OFF) // 🟢💭🔤
    .addRule('prefer-single-boolean-return', WARNING) // 🟢
    // .addRule('prefer-type-guard', ERROR) // 🟢
    // .addRule('prefer-while', ERROR) // 🟢
    // .addRule('process-argv', OFF) // 🔴
    .addRule('production-debug', ERROR) // 🟢 📦 `errorhandler`
    // ⚠️ Simply reports on every usage of `Math.random`
    .addRule('pseudo-random', OFF) // 🟢
    // .addRule('public-static-readonly', ERROR) // 🟢
    // .addRule('publicly-writable-directories', ERROR) // 🟢 📦 `node:fs`
    // .addRule('reduce-initial-value', ERROR) // 🟢💭
    // ⚠️ Sometimes this technique is useful
    .addRule('redundant-type-aliases', OFF) // 🟢
    .addRule('regex-complexity', WARNING, [{threshold: 40}]) // 🟢💭🔤
    // .addRule('regular-expr', OFF) // 🔴🔤
    // .addRule('session-regeneration', ERROR) // 🟢 📦 `passport`
    // .addRule('shorthand-property-grouping', OFF)
    // ⚠️ `regexp/no-useless-character-class`
    .addRule('single-char-in-character-classes', OFF) // 🟢💭🔤
    // ⚠️ `regexp/prefer-character-class`
    .addRule('single-character-alternation', OFF) // 🟢💭🔤
    // ⚠️ `regexp/no-super-linear-backtracking`
    .addRule('slow-regex', OFF) // 🟢💭🔤
    // .addRule('sockets', OFF) // 🔴 📦 `node:net`
    // .addRule('sql-queries', ERROR) // 🟢 📦 `mysql`, `pg`
    .addRule('stable-tests', testsRulesSeverity) // 🟢
    // .addRule('standard-input', OFF) // 🔴
    // .addRule('stateful-regex', ERROR) // 🟢🔤
    // .addRule('strict-transport-security', ERROR) // 🟢 📦 `helmet`
    .addRule('strings-comparison', WARNING) // 💭
    // ⚠️ `constructor-super`
    .addRule('super-invocation', OFF) // 🟢
    .addRule('table-header', WARNING) // 🟢🔵
    .addRule('table-header-reference', WARNING) // 🟢🔵
    // .addRule('test-check-exception', ERROR) // 🟢🧪 📦 `chai`
    // Reason for disabling: completely forbids TODO comments and has false positives
    .addRule('todo-tag', OFF) // 🟢
    // .addRule('too-many-break-or-continue-in-loop', OFF)
    // ⚠️ TypeScript
    // .addRule('unicode-aware-regex', OFF) // 🔤💭
    // `unused-imports/no-unused-imports`, `@typescript-eslint/no-unused-vars`, `no-unused-vars`
    .addRule('unused-import', OFF) // 🟢💭
    // .addRule('unused-named-groups', ERROR) // 🟢💭🔤
    // .addRule('unverified-certificate', ERROR) // 🟢 📦 `node:https`, `node:tls`
    .addRule('unverified-hostname', ERROR) // 🟢 📦 `node:https`, `node:tls`
    // ⚠️ `no-const-assign`
    .addRule('updated-const-var', OFF) // 🟢
    .addRule('updated-loop-counter', WARNING) // 🟢
    .addRule('use-type-alias', WARNING) // 🟢
    // ⚠️ `sonarjs/no-ignored-return`
    // .addRule('useless-string-operation', OFF) // 🔴💭
    // ⚠️ TypeScript
    // .addRule('values-not-convertible-to-numbers', OFF) // 💭
    // .addRule('variable-name', OFF)
    // ⚠️ `no-void`
    .addRule('void-use', OFF) // 🟢💭
    // .addRule('weak-ssl', ERROR) // 🟢 📦 `node:https`, `node:tls`
    // .addRule('web-sql-database', OFF) // 🔴💭
    // .addRule('x-powered-by', ERROR) // 🟢 📦 `express`, `helmet`
    // .addRule('xml-parser-xxe', ERROR) // 🟢 📦 `libxmljs`
    // .addRule('xpath', OFF) // 🔴 📦 `xpath`, `xmldom`
    .addOverrides();

  return {
    configs: configBuilder.getAllConfigs(),
    optionsResolved,
  };
};

import eslintPluginSonar from 'eslint-plugin-sonarjs';
import {ERROR, OFF, WARNING} from '../constants';
import {ConfigEntryBuilder, type ConfigSharedOptions, type FlatConfigEntry} from '../eslint';
import type {InternalConfigOptions} from './index';

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

export const sonarEslintConfig = (
  options: SonarEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const {enableAwsRules = true, testsRules = true} = options;

  const awsRulesSeverity = enableAwsRules ? ERROR : OFF;
  const testsRulesSeverity = testsRules ? ERROR : OFF;

  const builder = new ConfigEntryBuilder<'sonarjs'>(options, internalOptions);

  // Legend:
  // 🟢 - in Recommended
  // 🔴 - deprecated
  // 💭 - requires type information
  // 🔤 - rule for regular expressions
  // 🧪 - rule for testing frameworks
  // 📦 - rule for specific package(s) or node module(s)
  // ⚠️ - rule is disabled (or kept disabled) because it overlaps with other rule(s) or by other reason(s) listed hereinafter
  // 🔵 - JSX/HTML rule

  builder
    .addConfig(['sonar', {includeDefaultFilesAndIgnores: true}])
    .addBulkRules(eslintPluginSonar.configs.recommended.rules)
    // .addRule('sonarjs/anchor-precedence', ERROR) // 🟢💭🔤
    // ⚠️ Handled by TypeScript
    .addRule('sonarjs/argument-type', OFF) // 🟢💭
    // .addRule('sonarjs/arguments-order', ERROR) // 🟢💭
    // ⚠️ `prefer-rest-params`
    // .addRule('sonarjs/arguments-usage', OFF)
    // ⚠️ Handled by TypeScript
    .addRule('sonarjs/array-callback-without-return', OFF) // 🟢💭
    // ⚠️ `no-array-constructor`, `unicorn/no-new-array`
    // .addRule('sonarjs/array-constructor', OFF)
    // ⚠️ Prettier
    // .addRule('sonarjs/arrow-function-convention', OFF)
    .addRule('sonarjs/assertions-in-tests', testsRulesSeverity) // 🟢🧪
    .addRule('sonarjs/aws-apigateway-public-api', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('sonarjs/aws-ec2-rds-dms-public', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('sonarjs/aws-ec2-unencrypted-ebs-volume', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('sonarjs/aws-efs-unencrypted', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('sonarjs/aws-iam-all-privileges', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('sonarjs/aws-iam-all-resources-accessible', OFF) // 📦 `aws-cdk-lib`
    .addRule('sonarjs/aws-iam-privilege-escalation', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('sonarjs/aws-iam-public-access', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('sonarjs/aws-opensearchservice-domain', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('sonarjs/aws-rds-unencrypted-databases', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('sonarjs/aws-restricted-ip-admin-access', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('sonarjs/aws-s3-bucket-granted-access', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('sonarjs/aws-s3-bucket-insecure-http', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('sonarjs/aws-s3-bucket-public-access', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('sonarjs/aws-s3-bucket-server-encryption', OFF) // 🔴 📦 `aws-cdk-lib`
    .addRule('sonarjs/aws-s3-bucket-versioning', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('sonarjs/aws-sagemaker-unencrypted-notebook', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('sonarjs/aws-sns-unencrypted-topics', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    .addRule('sonarjs/aws-sqs-unencrypted-queue', awsRulesSeverity) // 🟢 📦 `aws-cdk-lib`
    // Note: doesn't seem to work in TypeScript code
    // .addRule('sonarjs/bitwise-operators', ERROR) // 🟢
    // ⚠️ `block-scoped-var`, `vars-on-top`
    .addRule('sonarjs/block-scoped-var', OFF) // 🟢
    // .addRule('sonarjs/bool-param-default', OFF)
    // ⚠️ Prettier
    .addRule('sonarjs/call-argument-line', OFF) // 🟢
    // .addRule('sonarjs/certificate-transparency', ERROR) // 🟢 📦 `helmet`
    .addRule('sonarjs/chai-determinate-assertion', testsRulesSeverity) // 🟢🧪 📦 `chai`
    // ⚠️ `camelcase`
    .addRule('sonarjs/class-name', OFF) // 🟢
    // .addRule('sonarjs/class-prototype', OFF) // 💭
    // ⚠️ `no-eval`, `no-script-url`, `no-new-func`
    .addRule('sonarjs/code-eval', OFF) // 🟢
    // ⚠️ Unreliable metric and cannot be universally applied to all projects
    .addRule('sonarjs/cognitive-complexity', OFF) // 🟢
    // .addRule('sonarjs/comma-or-logical-or-case', ERROR) // 🟢
    // .addRule('sonarjs/comment-regex', OFF)
    // ⚠️ `regexp/prefer-w`, `regexp/prefer-plus-quantifier`
    .addRule('sonarjs/concise-regex', OFF) // 🟢💭🔤
    .addRule('sonarjs/conditional-indentation', OFF) // 🔴
    // .addRule('sonarjs/confidential-information-logging', ERROR) // 🟢 📦 `signale`
    // ⚠️ `no-new`
    .addRule('sonarjs/constructor-for-side-effects', OFF) // 🟢
    // .addRule('sonarjs/content-length', ERROR) // 🟢 📦 `formidable`, `multer`, `body-parser`
    // .addRule('sonarjs/content-security-policy', ERROR) // 🟢 📦 `helmet`
    // .addRule('sonarjs/cookie-no-httponly', ERROR) // 🟢 📦 `cookie-session`, `express-session`, `cookies`, `csurf`
    // .addRule('sonarjs/cookies', OFF) // 🔴
    // .addRule('sonarjs/cors', ERROR) // 🟢 📦 `node:http`, `cors`
    // .addRule('sonarjs/csrf', ERROR) // 🟢 📦 `csurf`
    // .addRule('sonarjs/cyclomatic-complexity', OFF)
    // .addRule('sonarjs/declarations-in-global-scope', OFF)
    // ⚠️ `import/no-deprecated`, `@typescript-eslint/no-deprecated` which also likely do the job better
    .addRule('sonarjs/deprecation', OFF) // 🟢💭
    // .addRule('sonarjs/destructuring-assignment-syntax', OFF)
    // ⚠️ Other rules & TypeScript itself; has false positives
    .addRule('sonarjs/different-types-comparison', OFF) // 🟢💭
    // .addRule('sonarjs/disabled-auto-escaping', ERROR) // 🟢💭 📦 `mustache`, `handlebars`, `markdown-it`, `marked`, `kramed`
    // .addRule('sonarjs/disabled-resource-integrity', ERROR) // 🟢💭
    .addRule('sonarjs/disabled-timeout', testsRulesSeverity) // 🟢🧪
    // .addRule('sonarjs/dns-prefetching', OFF) // 🔴
    // ⚠️ `regexp/no-dupe-characters-character-class`
    .addRule('sonarjs/duplicates-in-character-class', OFF) // 🟢💭🔤
    // .addRule('sonarjs/elseif-without-else', OFF)
    // ⚠️ `regexp/no-empty-group` (and also `sonarjs/no-empty-group`), `regexp/no-empty-alternative`, `regexp/no-trivially-nested-quantifier`
    .addRule('sonarjs/empty-string-repetition', OFF) // 🟢💭🔤
    // .addRule('sonarjs/encryption', OFF) // 🔴
    // .addRule('sonarjs/encryption-secure-mode', ERROR) // 🟢 📦 `node:crypto`
    // .addRule('sonarjs/enforce-trailing-comma', OFF) // 🔴
    // Not disabling because, despite being mostly covered by `regexp/no-useless-dollar-replacements` rule, finds more problems
    // .addRule('sonarjs/existing-groups', ERROR) // 🟢💭🔤
    // .addRule('sonarjs/expression-complexity', OFF)
    // .addRule('sonarjs/file-header', OFF)
    // .addRule('sonarjs/file-name-differ-from-class', OFF)
    // .addRule('sonarjs/file-permissions', ERROR) // 🟢 📦 `node:fs`, `node:process`
    // .addRule('sonarjs/file-uploads', ERROR) // 🟢 📦 `formidable`, `multer`
    // ⚠️ Completely forbids FIXME comments
    .addRule('sonarjs/fixme-tag', OFF) // 🟢
    // Reason for not enabling: covered by `guard-for-in` rule
    // .addRule('sonarjs/for-in', OFF)
    // .addRule('sonarjs/for-loop-increment-sign', ERROR) // 🟢
    // .addRule('sonarjs/frame-ancestors', ERROR) // 🟢 📦 `helmet`
    // ⚠️ IMHO too restrictive + some cases covered by `unicorn/consistent-function-scoping`
    .addRule('sonarjs/function-inside-loop', OFF) // 🟢
    // .addRule('sonarjs/function-name', OFF)
    // ⚠️ certainly not for everyone
    .addRule('sonarjs/function-return-type', OFF) // 🟢💭
    // .addRule('sonarjs/future-reserved-words', ERROR) // 🟢
    // ⚠️ `require-yield`. Does not seem to report on empty yields like `yield;`
    .addRule('sonarjs/generator-without-yield', OFF) // 🟢
    // .addRule('sonarjs/hashing', ERROR) // 🟢 📦 `node:crypto`
    // .addRule('sonarjs/hidden-files', ERROR) // 🟢 📦 `serve-static`
    // ⚠️ Handled by TypeScript
    .addRule('sonarjs/in-operator-type-error', OFF) // 🟢💭
    // .addRule('sonarjs/inconsistent-function-call', ERROR) // 🟢
    // .addRule('sonarjs/index-of-compare-to-positive-number', ERROR) // 🟢💭
    // .addRule('sonarjs/insecure-cookie', ERROR) // 🟢 📦 `cookie-session`, `express-session`, `cookies`, `csurf`
    // .addRule('sonarjs/insecure-jwt-token', ERROR) // 🟢 📦 `jsonwebtoken`
    .addRule('sonarjs/inverted-assertion-arguments', testsRulesSeverity) // 🟢🧪 📦 `chai`
    // .addRule('sonarjs/jsx-no-leaked-render', ERROR) // 🟢💭🔵
    // ⚠️ `no-labels`
    .addRule('sonarjs/label-position', OFF) // 🟢
    // TODO not sure if this is needed now
    // .addRule('sonarjs/link-with-target-blank', ERROR) // 🟢
    // .addRule('sonarjs/max-lines', OFF)
    // .addRule('sonarjs/max-lines-per-function', OFF)
    // ⚠️ Not for every project
    .addRule('sonarjs/max-switch-cases', OFF) // 🟢
    // .addRule('sonarjs/max-union-size', OFF)
    .addRule('sonarjs/misplaced-loop-counter', WARNING) // 🟢
    // .addRule('sonarjs/nested-control-flow', OFF)
    // ⚠️ Handled by TypeScript
    .addRule('sonarjs/new-operator-misuse', OFF) // 🟢💭
    // .addRule('sonarjs/no-all-duplicated-branches', ERROR) // 🟢
    // ⚠️ Seems too restrictive for me, alphabetical sorting is not a very rare requirement
    .addRule('sonarjs/no-alphabetical-sort', OFF) // 🟢💭
    // .addRule('sonarjs/no-angular-bypass-sanitization', ERROR) // 🟢 📦 `@angular/*`
    // ⚠️ `@typescript-eslint/no-array-delete`; works on TS code only anyway
    .addRule('sonarjs/no-array-delete', OFF) // 🟢💭
    // ⚠️ Handled by TypeScript
    .addRule('sonarjs/no-associative-arrays', OFF) // 🟢💭
    // ⚠️ Seems too restrictive for me
    .addRule('sonarjs/no-async-constructor', OFF) // 🟢
    // Reason for keeping disabled: should mostly be covered by `no-global-assign`
    // .addRule('sonarjs/no-built-in-override', OFF)
    // .addRule('sonarjs/no-case-label-in-switch', ERROR) // 🟢
    // .addRule('sonarjs/no-clear-text-protocols', ERROR) // 🟢 📦 `nodemailer`, `ftp`, `telnet-client`, `aws-cdk-lib`
    .addRule('sonarjs/no-code-after-done', testsRulesSeverity) // 🟢🧪 📦 `chai`
    // .addRule('sonarjs/no-collapsible-if', OFF)
    // TODO disable autofix?
    // .addRule('sonarjs/no-collection-size-mischeck', ERROR) // 🟢💭
    // ⚠️ Seems too restrictive
    .addRule('sonarjs/no-commented-code', OFF) // 🟢
    // ⚠️ `regexp/no-control-character`
    .addRule('sonarjs/no-control-regex', OFF) // 🟢💭🔤
    // ⚠️ `no-useless-assignment`
    .addRule('sonarjs/no-dead-store', OFF) // 🟢
    // .addRule('sonarjs/no-delete-var', ERROR) // 🟢
    // ⚠️ `@typescript-eslint/no-duplicate-type-constituents`
    .addRule('sonarjs/no-duplicate-in-composite', OFF) // 🟢
    // .addRule('sonarjs/no-duplicate-string', OFF)
    // .addRule('sonarjs/no-duplicated-branches', ERROR) // 🟢
    // .addRule('sonarjs/no-element-overwrite', ERROR) // 🟢
    // Reason for keeping enabled: not caught by eslint-plugin-regexp
    // .addRule('sonarjs/no-empty-after-reluctant', ERROR) // 🟢💭🔤
    // ⚠️ `regexp/no-empty-alternative`
    .addRule('sonarjs/no-empty-alternatives', OFF) // 🟢💭🔤
    // ⚠️ `regexp/no-empty-character-class`
    .addRule('sonarjs/no-empty-character-class', OFF) // 🟢💭🔤
    // .addRule('sonarjs/no-empty-collection', ERROR) // 🟢
    // ⚠️ `regexp/no-empty-group`
    .addRule('sonarjs/no-empty-group', OFF) // 🟢💭🔤
    // ⚠️ It seems fragile to me that this rule does not give the control over which files to consider as test files: "This rule flags any file that has .test or .spec as part of its suffix but does not contain any test cases defined using the different forms of the it and test functions from Jasmine, Jest, Mocha, or Node.js testing API."
    .addRule('sonarjs/no-empty-test-file', OFF) // 🟢🧪
    // .addRule('sonarjs/no-equals-in-for-termination', ERROR) // 🟢
    // ⚠️ `jest/no-focused-tests`, `vitest/no-focused-tests`. For other testing frameworks, one can enable this rule manually
    .addRule('sonarjs/no-exclusive-tests', OFF) // 🟢🧪
    // .addRule('sonarjs/no-extra-arguments', ERROR) // 🟢
    // ⚠️ `no-fallthrough`
    .addRule('sonarjs/no-fallthrough', OFF) // 🟢
    .addRule('sonarjs/no-for-in-iterable', ERROR) // 💭
    // .addRule('sonarjs/no-function-declaration-in-block', OFF)
    // .addRule('sonarjs/no-global-this', ERROR) // 🟢
    // Note: with cases noncompliant with this rule, ESLint fails on parsing stage anyway due to the assuming of being in a strict mode
    // .addRule('sonarjs/no-globals-shadowing', ERROR) // 🟢
    // .addRule('sonarjs/no-gratuitous-expressions', ERROR) // 🟢
    // Warning because has false positives (triggered on any strings looking like IP addresses)
    .addRule('sonarjs/no-hardcoded-ip', WARNING) // 🟢 📦 `node:net`
    // .addRule('sonarjs/no-hardcoded-passwords', ERROR) // 🟢 📦 `mysql`
    // "This rule detects variables/fields having a name matching a list of words (secret, token, credential, auth, api[_.-]?key) being assigned a pseudorandom hard-coded value. The pseudorandomness of the hard-coded value is based on its entropy and the probability to be human-readable."
    // .addRule('sonarjs/no-hardcoded-secrets', ERROR) // 🟢
    // .addRule('sonarjs/no-hook-setter-in-body', ERROR) // 🟢 📦 `react`
    // ⚠️ `no-dupe-else-if`, `no-duplicate-case`
    .addRule('sonarjs/no-identical-conditions', OFF) // 🟢
    // Note: partially overlaps with `no-self-compare`
    // .addRule('sonarjs/no-identical-expressions', ERROR) // 🟢
    // .addRule('sonarjs/no-identical-functions', ERROR) // 🟢
    // .addRule('sonarjs/no-ignored-exceptions', ERROR) // 🟢
    // .addRule('sonarjs/no-ignored-return', ERROR) // 🟢💭
    // Reason for keeping disabled: should mostly be covered by `import/no-extraneous-dependencies`
    .addRule('sonarjs/no-implicit-dependencies', OFF)
    // .addRule('sonarjs/no-implicit-global', ERROR) // 🟢
    // .addRule('sonarjs/no-in-misuse', ERROR) // 🟢💭
    .addRule('sonarjs/no-incomplete-assertions', testsRulesSeverity) // 🟢🧪 📦 `chai`
    // ⚠️ `consistent-return`
    // .addRule('sonarjs/no-inconsistent-returns', OFF)
    // ⚠️ `@typescript-eslint/restrict-plus-operands`
    // .addRule('sonarjs/no-incorrect-string-concat', OFF) // 💭
    // .addRule('sonarjs/no-internal-api-use', ERROR) // 🟢
    // .addRule('sonarjs/no-intrusive-permissions', ERROR) // 🟢
    // ⚠️ `@typescript-eslint/await-thenable`, `unicorn/no-unnecessary-await`
    .addRule('sonarjs/no-invalid-await', OFF) // 🟢💭
    // ⚠️ `regexp/no-invalid-regexp`
    .addRule('sonarjs/no-invalid-regexp', OFF) // 🟢💭🔤
    // .addRule('sonarjs/no-invariant-returns', ERROR) // 🟢
    // .addRule('sonarjs/no-inverted-boolean-check', ERROR) // 🟢
    // .addRule('sonarjs/no-ip-forward', ERROR) // 🟢 📦 `node-http-proxy`, `http-proxy-middleware`
    // ⚠️ `no-labels`
    .addRule('sonarjs/no-labels', OFF) // 🟢
    // Note: seems usable in .js files only
    // .addRule('sonarjs/no-literal-call', ERROR) // 🟢
    // .addRule('sonarjs/no-mime-sniff', ERROR) // 🟢 📦 `helmet`
    // .addRule('sonarjs/no-misleading-array-reverse', ERROR) // 🟢💭
    // ⚠️ `regexp/no-misleading-unicode-character`
    .addRule('sonarjs/no-misleading-character-class', OFF) // 🟢💭🔤
    // .addRule('sonarjs/no-mixed-content', ERROR) // 🟢 📦 `helmet`
    // ⚠️ Too noisy in practice
    .addRule('sonarjs/no-nested-assignment', OFF) // 🟢
    // ⚠️ Too noisy in practice
    .addRule('sonarjs/no-nested-conditional', OFF) // 🟢
    // ⚠️ Too noisy in practice
    .addRule('sonarjs/no-nested-functions', OFF) // 🟢
    // .addRule('sonarjs/no-nested-incdec', OFF)
    // .addRule('sonarjs/no-nested-switch', OFF)
    // ⚠️ Seems too restrictive for me
    .addRule('sonarjs/no-nested-template-literals', OFF) // 🟢
    // ⚠️ `no-unreachable-loop`
    .addRule('sonarjs/no-one-iteration-loop', OFF) // 🟢
    // .addRule('sonarjs/no-os-command-from-path', ERROR) // 🟢 📦 `node:child_process`
    // .addRule('sonarjs/no-parameter-reassignment', ERROR) // 🟢
    // ⚠️ `no-new-wrappers`
    .addRule('sonarjs/no-primitive-wrappers', OFF) // 🟢
    // .addRule('sonarjs/no-redundant-assignments', ERROR) // 🟢
    // .addRule('sonarjs/no-redundant-boolean', ERROR) // 🟢
    // .addRule('sonarjs/no-redundant-jump', ERROR) // 🟢
    // .addRule('sonarjs/no-redundant-optional', ERROR) // 🟢💭
    // .addRule('sonarjs/no-redundant-parentheses', OFF) // 🔴
    // .addRule('sonarjs/no-reference-error', OFF)
    // .addRule('sonarjs/no-referrer-policy', ERROR) // 🟢 📦 `helmet`
    // ⚠️ `no-regex-spaces`, `regexp/prefer-quantifier`
    .addRule('sonarjs/no-regex-spaces', OFF) // 🟢💭🔤
    // .addRule('sonarjs/no-require-or-define', OFF) // 💭
    // .addRule('sonarjs/no-return-type-any', OFF) // 💭
    .addRule('sonarjs/no-same-argument-assert', testsRulesSeverity) // 🟢🧪 📦 `chai`
    // ⚠️ Purely stylistic, handled by Prettier
    .addRule('sonarjs/no-same-line-conditional', OFF) // 🟢
    // ⚠️ Unsure about this one, it seems to me that it might disallow "normal" code which could be hard to "fix"
    .addRule('sonarjs/no-selector-parameter', OFF) // 🟢💭
    // ⚠️ `jest/no-disabled-tests`, `vitest/no-disabled-tests`
    .addRule('sonarjs/no-skipped-tests', OFF) // 🟢🧪
    // .addRule('sonarjs/no-small-switch', ERROR) // 🟢
    // .addRule('sonarjs/no-sonar-comments', OFF)
    // .addRule('sonarjs/no-tab', OFF) // 🔴
    // .addRule('sonarjs/no-table-as-layout', ERROR) // 🟢🔵
    // ⚠️ Reports on promise-returning functions marked with `void `
    .addRule('sonarjs/no-try-promise', OFF) // 🟢💭
    // .addRule('sonarjs/no-undefined-argument', ERROR) // 🟢💭
    // ⚠️ Useful in some scenarios, for example in `mongoose` to remove the property from the document
    // .addRule('sonarjs/no-undefined-assignment', OFF)
    // ⚠️ `curly` and Prettier
    .addRule('sonarjs/no-unenclosed-multiline-block', OFF) // 🟢
    // .addRule('sonarjs/no-uniq-key', ERROR) // 🟢🔵
    // .addRule('sonarjs/no-unsafe-unzip', ERROR) // 🟢 📦 `tar`, `adm-zip`, `jszip`, `yauzl`, `extract-zip`
    // ⚠️ `no-new`
    .addRule('sonarjs/no-unthrown-error', OFF) // 🟢
    // .addRule('sonarjs/no-unused-collection', ERROR) // 🟢
    // .addRule('sonarjs/no-unused-function-argument', OFF)
    // ⚠️ `no-unused-vars`
    .addRule('sonarjs/no-unused-vars', OFF) // 🟢
    // .addRule('sonarjs/no-use-of-empty-return-value', ERROR) // 🟢
    // ⚠️ `no-useless-catch`
    .addRule('sonarjs/no-useless-catch', OFF) // 🟢
    // .addRule('sonarjs/no-useless-increment', ERROR) // 🟢
    // Reason for disabling: disallows `string & {}` pattern and has false positives
    .addRule('sonarjs/no-useless-intersection', OFF) // 🟢💭
    // .addRule('sonarjs/no-useless-react-setstate', ERROR) // 🟢 📦 `react`
    // ⚠️ `no-use-before-define`, `block-scoped-var`, `vars-on-top`
    // .addRule('sonarjs/no-variable-usage-before-declaration', OFF)
    // ⚠️ `vue/no-v-html`. Also finds problems in Vue 2 render functions
    .addRule('sonarjs/no-vue-bypass-sanitization', OFF) // 🟢
    // .addRule('sonarjs/no-weak-cipher', ERROR) // 🟢 📦 `node:crypto`
    // .addRule('sonarjs/no-weak-keys', ERROR) // 🟢 📦 `node:crypto`
    // .addRule('sonarjs/no-wildcard-import', OFF)
    // .addRule('sonarjs/non-existent-operator', ERROR) // 🟢
    // ⚠️ TypeScript
    // .addRule('sonarjs/non-number-in-arithmetic-expression', OFF) // 💭
    // ⚠️ TypeScript
    .addRule('sonarjs/null-dereference', OFF) // 🟢💭
    // .addRule('sonarjs/object-alt-content', ERROR) // 🟢🔵
    // ⚠️ TypeScript
    // .addRule('sonarjs/operation-returning-nan', OFF) // 💭
    // .addRule('sonarjs/os-command', ERROR) // 🟢 📦 `node:child_process`
    // .addRule('sonarjs/post-message', ERROR) // 🟢💭
    // ⚠️ `default-case-last`
    .addRule('sonarjs/prefer-default-last', OFF) // 🟢
    // .addRule('sonarjs/prefer-immediate-return', OFF)
    .addRule('sonarjs/prefer-object-literal', ERROR)
    // .addRule('sonarjs/prefer-promise-shorthand', ERROR) // 🟢
    // ⚠️ IMHO this is not a common practice
    .addRule('sonarjs/prefer-read-only-props', OFF) // 🟢💭
    // ⚠️ `RegExp.prototype.exec` mutates the state of the regexp: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#return_value
    .addRule('sonarjs/prefer-regexp-exec', OFF) // 🟢💭🔤
    .addRule('sonarjs/prefer-single-boolean-return', WARNING) // 🟢
    // .addRule('sonarjs/prefer-type-guard', ERROR) // 🟢
    // .addRule('sonarjs/prefer-while', ERROR) // 🟢
    // .addRule('sonarjs/process-argv', OFF) // 🔴
    .addRule('sonarjs/production-debug', ERROR) // 🟢 📦 `errorhandler`
    // ⚠️ Simply reports on every usage of `Math.random`
    .addRule('sonarjs/pseudo-random', OFF) // 🟢
    // .addRule('sonarjs/public-static-readonly', ERROR) // 🟢
    // .addRule('sonarjs/publicly-writable-directories', ERROR) // 🟢 📦 `node:fs`
    // .addRule('sonarjs/reduce-initial-value', ERROR) // 🟢💭
    // ⚠️ Sometimes this technique is useful
    .addRule('sonarjs/redundant-type-aliases', OFF) // 🟢
    .addRule('sonarjs/regex-complexity', WARNING, [{threshold: 40}]) // 🟢💭🔤
    // .addRule('sonarjs/regular-expr', OFF) // 🔴🔤
    // .addRule('sonarjs/session-regeneration', ERROR) // 🟢 📦 `passport`
    // .addRule('sonarjs/shorthand-property-grouping', OFF)
    // ⚠️ `regexp/no-useless-character-class`
    .addRule('sonarjs/single-char-in-character-classes', OFF) // 🟢💭🔤
    // ⚠️ `regexp/prefer-character-class`
    .addRule('sonarjs/single-character-alternation', OFF) // 🟢💭🔤
    // ⚠️ `regexp/no-super-linear-backtracking`
    .addRule('sonarjs/slow-regex', OFF) // 🟢💭🔤
    // .addRule('sonarjs/sockets', OFF) // 🔴 📦 `node:net`
    // .addRule('sonarjs/sql-queries', ERROR) // 🟢 📦 `mysql`, `pg`
    .addRule('sonarjs/stable-tests', testsRulesSeverity) // 🟢
    // .addRule('sonarjs/standard-input', OFF) // 🔴
    // .addRule('sonarjs/stateful-regex', ERROR) // 🟢🔤
    // .addRule('sonarjs/strict-transport-security', ERROR) // 🟢 📦 `helmet`
    .addRule('sonarjs/strings-comparison', WARNING) // 💭
    // ⚠️ `constructor-super`
    .addRule('sonarjs/super-invocation', OFF) // 🟢
    .addRule('sonarjs/table-header', WARNING) // 🟢🔵
    .addRule('sonarjs/table-header-reference', WARNING) // 🟢🔵
    // .addRule('sonarjs/test-check-exception', ERROR) // 🟢🧪 📦 `chai`
    // Reason for disabling: completely forbids TODO comments and has false positives
    .addRule('sonarjs/todo-tag', OFF) // 🟢
    // .addRule('sonarjs/too-many-break-or-continue-in-loop', OFF)
    // ⚠️ TypeScript
    // .addRule('sonarjs/unicode-aware-regex', OFF) // 🔤💭
    // `unused-imports/no-unused-imports`, `@typescript-eslint/no-unused-vars`, `no-unused-vars`
    .addRule('sonarjs/unused-import', OFF) // 🟢💭
    // .addRule('sonarjs/unused-named-groups', ERROR) // 🟢💭🔤
    // .addRule('sonarjs/unverified-certificate', ERROR) // 🟢 📦 `node:https`, `node:tls`
    .addRule('sonarjs/unverified-hostname', ERROR) // 🟢 📦 `node:https`, `node:tls`
    // ⚠️ `no-const-assign`
    .addRule('sonarjs/updated-const-var', OFF) // 🟢
    .addRule('sonarjs/updated-loop-counter', WARNING) // 🟢
    .addRule('sonarjs/use-type-alias', WARNING) // 🟢
    // ⚠️ `sonarjs/no-ignored-return`
    // .addRule('sonarjs/useless-string-operation', OFF) // 🔴💭
    // ⚠️ TypeScript
    // .addRule('sonarjs/values-not-convertible-to-numbers', OFF) // 💭
    // .addRule('sonarjs/variable-name', OFF)
    // ⚠️ `no-void`
    .addRule('sonarjs/void-use', OFF) // 🟢💭
    // .addRule('sonarjs/weak-ssl', ERROR) // 🟢 📦 `node:https`, `node:tls`
    // .addRule('sonarjs/web-sql-database', OFF) // 🔴💭
    // .addRule('sonarjs/x-powered-by', ERROR) // 🟢 📦 `express`, `helmet`
    // .addRule('sonarjs/xml-parser-xxe', ERROR) // 🟢 📦 `libxmljs`
    // .addRule('sonarjs/xpath', OFF) // 🔴 📦 `xpath`, `xmldom`
    .addOverrides();

  return builder.getAllConfigs();
};

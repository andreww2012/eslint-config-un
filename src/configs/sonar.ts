import {ERROR, OFF, WARNING} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults, doesPackageExist} from '../utils';
import type {UnConfigFn} from './index';

export interface SonarEslintConfigOptions extends UnConfigOptions<'sonarjs'> {
  /**
   * Enables rules that are specific to [aws-cdk-lib](https://npmjs.com/aws-cdk-lib)
   * @default true <=> `aws-cdk-lib` package is installed
   */
  enableAwsRules?: boolean;

  /**
   * Enables rules that are specific to [helmet](https://npmjs.com/helmet)
   * @default true <=> `helmet` package is installed
   */
  enableHelmetRules?: boolean;

  /**
   * Enables rules that are specific to test or assertion libraries
   * @default true
   */
  testsRules?: boolean;
}

export const sonarUnConfig: UnConfigFn<'sonar'> = async (context) => {
  const [awsCdkLibInstalled, helmetInstalled] = await Promise.all([
    doesPackageExist('aws-cdk-lib'),
    doesPackageExist('helmet'),
  ]);

  const optionsRaw = context.rootOptions.configs?.sonar;
  const optionsResolved = assignDefaults(optionsRaw, {
    enableAwsRules: awsCdkLibInstalled,
    enableHelmetRules: helmetInstalled,
    testsRules: true,
  } satisfies SonarEslintConfigOptions);

  const {enableAwsRules, enableHelmetRules, testsRules} = optionsResolved;

  const awsRulesSeverity = enableAwsRules ? ERROR : OFF;
  const helmetRulesSeverity = enableHelmetRules ? ERROR : OFF;
  const testsRulesSeverity = testsRules ? ERROR : OFF;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'sonarjs');

  // Legend:
  // [S1234] - Sonar rule code
  // 🟢 - in recommended
  // 🔴 - deprecated
  // 💭 - requires type information
  // 🔤 - rule for regular expressions
  // 🧪 - rule for testing frameworks
  // 📦 - rule for specific package(s) or node module(s)
  // ⚠️ - rule is disabled (or kept disabled) because it overlaps with other rule(s) or by other reason(s) listed hereinafter
  // 🔵 - JSX/HTML rule

  configBuilder
    ?.addConfig(['sonar', {includeDefaultFilesAndIgnores: true, doNotIgnoreHtml: true}])
    .addRule('anchor-precedence', ERROR) // [S5850] 🟢💭🔤
    // ⚠️ Handled by TypeScript
    .addRule('argument-type', OFF) // [S3782] 🟢💭
    .addRule('arguments-order', ERROR) // [S2234] 🟢💭
    // ⚠️ `prefer-rest-params`
    .addRule('arguments-usage', OFF) // [S3513]
    // ⚠️ Handled by TypeScript
    .addRule('array-callback-without-return', OFF) // [S3796] 🟢💭
    // ⚠️ `no-array-constructor`, `unicorn/no-new-array`
    .addRule('array-constructor', OFF) // [S1528]
    // ⚠️ Prettier
    .addRule('arrow-function-convention', OFF) // [S3524]
    .addRule('assertions-in-tests', testsRulesSeverity) // [S2699] 🟢🧪 📦 `chai`, `sinon`, `supertest`, `vitest`
    .addRule('aws-apigateway-public-api', awsRulesSeverity) // [S6333] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-ec2-rds-dms-public', awsRulesSeverity) // [S6329] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-ec2-unencrypted-ebs-volume', awsRulesSeverity) // [S6275] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-efs-unencrypted', awsRulesSeverity) // [S6332] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-iam-all-privileges', awsRulesSeverity) // [S6302] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-iam-all-resources-accessible', OFF) // [S6304] 📦 `aws-cdk-lib`
    .addRule('aws-iam-privilege-escalation', awsRulesSeverity) // [S6317] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-iam-public-access', awsRulesSeverity) // [S6270] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-opensearchservice-domain', awsRulesSeverity) // [S6308] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-rds-unencrypted-databases', awsRulesSeverity) // [S6303] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-restricted-ip-admin-access', awsRulesSeverity) // [S6321] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-s3-bucket-granted-access', awsRulesSeverity) // [S6265] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-s3-bucket-insecure-http', awsRulesSeverity) // [S6249] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-s3-bucket-public-access', awsRulesSeverity) // [S6281] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-s3-bucket-versioning', awsRulesSeverity) // [S6252] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-sagemaker-unencrypted-notebook', awsRulesSeverity) // [S6319] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-sns-unencrypted-topics', awsRulesSeverity) // [S6327] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-sqs-unencrypted-queue', awsRulesSeverity) // [S6330] 🟢 📦 `aws-cdk-lib`
    // Note: doesn't seem to work in TypeScript code
    .addRule('bitwise-operators', ERROR) // [S1529] 🟢
    // ⚠️ `block-scoped-var`, `vars-on-top`
    .addRule('block-scoped-var', OFF) // [S2392] 🟢
    .addRule('bool-param-default', OFF) // [S4798]
    // ⚠️ Prettier
    .addRule('call-argument-line', OFF) // [S1472] 🟢
    .addRule('chai-determinate-assertion', testsRulesSeverity) // [S6092] 🟢🧪 📦 `chai`
    // ⚠️ `camelcase`
    .addRule('class-name', OFF) // [S101] 🟢
    .addRule('class-prototype', OFF) // [S3525] 💭
    // ⚠️ `no-eval`, `no-script-url`, `no-new-func`
    .addRule('code-eval', OFF) // [S1523] 🟢
    // ⚠️ Unreliable metric and cannot be universally applied to all projects
    .addRule('cognitive-complexity', OFF) // [S3776] 🟢
    .addRule('comma-or-logical-or-case', ERROR) // [S3616] 🟢
    .addRule('comment-regex', OFF) // [S124]
    // ⚠️ `regexp/prefer-w`, `regexp/prefer-plus-quantifier`
    .addRule('concise-regex', OFF) // [S6353] 🟢💭🔤
    .addRule('confidential-information-logging', ERROR) // [S5757] 🟢 📦 `signale`
    // ⚠️ `no-new`
    .addRule('constructor-for-side-effects', OFF) // [S1848] 🟢
    .addRule('content-length', ERROR) // [S5693] 🟢 📦 `formidable`, `multer`, `body-parser`
    .addRule('content-security-policy', helmetRulesSeverity) // [S5728] 🟢 📦 `helmet`
    .addRule('cookie-no-httponly', ERROR) // [S3330] 🟢 📦 `cookie-session`, `express-session`, `cookies`, `csurf`
    .addRule('cors', ERROR) // [S5122] 🟢 📦 `node:http`, `cors`
    .addRule('csrf', ERROR) // [S4502] 🟢 📦 `csurf`
    .addRule('cyclomatic-complexity', OFF) // [S1541]
    .addRule('declarations-in-global-scope', OFF) // [S3798]
    // ⚠️ `import/no-deprecated`, ts/no-deprecated` which also likely do the job better
    .addRule('deprecation', OFF) // [S1874] 🟢💭
    .addRule('destructuring-assignment-syntax', OFF) // [S3514]
    // ⚠️ Other rules & TypeScript itself; has false positives
    .addRule('different-types-comparison', OFF) // [S3403] 🟢💭
    .addRule('disabled-auto-escaping', ERROR) // [S5247] 🟢💭 📦 `mustache`, `handlebars`, `markdown-it`, `marked`, `kramed`
    .addRule('disabled-resource-integrity', ERROR) // [S5725] 🟢💭
    .addRule('disabled-timeout', testsRulesSeverity) // [S6080] 🟢🧪 📦 `chai`
    // ⚠️ `regexp/no-dupe-characters-character-class`
    .addRule('duplicates-in-character-class', OFF) // [S5869] 🟢💭🔤
    .addRule('elseif-without-else', OFF) // [S126]
    // ⚠️ `regexp/no-empty-group` (and also `sonarjs/no-empty-group`), `regexp/no-empty-alternative`, `regexp/no-trivially-nested-quantifier`
    .addRule('empty-string-repetition', OFF) // [S5842] 🟢💭🔤
    .addRule('encryption-secure-mode', ERROR) // [S5542] 🟢 📦 `node:crypto`
    // Not disabling because, despite being mostly covered by `regexp/no-useless-dollar-replacements` rule, finds more problems
    .addRule('existing-groups', ERROR) // [S6328] 🟢💭🔤
    .addRule('expression-complexity', OFF) // [S1067]
    .addRule('file-header', OFF) // [S1451]
    .addRule('file-name-differ-from-class', OFF) // [S3317]
    .addRule('file-permissions', ERROR) // [S2612] 🟢 📦 `node:fs`, `node:process`
    .addRule('file-uploads', ERROR) // [S2598] 🟢 📦 `formidable`, `multer`
    // ⚠️ Completely forbids FIXME comments
    .addRule('fixme-tag', OFF) // [S1134] 🟢
    // Reason for not enabling: covered by `guard-for-in` rule
    .addRule('for-in', OFF) // [S1535]
    .addRule('for-loop-increment-sign', ERROR) // [S2251] 🟢
    .addRule('frame-ancestors', helmetRulesSeverity) // [S5732] 🟢 📦 `helmet`
    // ⚠️ IMHO too restrictive + some cases covered by `unicorn/consistent-function-scoping`
    .addRule('function-inside-loop', OFF) // [S1515] 🟢
    .addRule('function-name', OFF) // [S100]
    // ⚠️ certainly not for everyone
    .addRule('function-return-type', OFF) // [S3800] 🟢💭
    .addRule('future-reserved-words', ERROR) // [S1527] 🟢
    // ⚠️ `require-yield`. Does not seem to report on empty yields like `yield;`
    .addRule('generator-without-yield', OFF) // [S3531] 🟢
    .addRule('hashing', ERROR) // [S4790] 🟢 📦 `node:crypto`
    .addRule('hidden-files', ERROR) // [S5691] 🟢 📦 `serve-static`
    // ⚠️ Handled by TypeScript
    .addRule('in-operator-type-error', OFF) // [S3785] 🟢💭
    .addRule('inconsistent-function-call', ERROR) // [S3686] 🟢
    .addRule('index-of-compare-to-positive-number', ERROR) // [S2692] 🟢💭
    .addRule('insecure-cookie', ERROR) // [S2092] 🟢 📦 `cookie-session`, `express-session`, `cookies`, `csurf`
    .addRule('insecure-jwt-token', ERROR) // [S5659] 🟢 📦 `jsonwebtoken`
    .addRule('inverted-assertion-arguments', testsRulesSeverity) // [S3415] 🟢🧪 📦 `mocha`
    .addRule('jsx-no-leaked-render', ERROR) // [S6439] 🟢💭🔵
    // ⚠️ `no-labels`
    .addRule('label-position', OFF) // [S1439] 🟢
    // TODO not sure if this is needed now
    .addRule('link-with-target-blank', ERROR) // [S5148] 🟢
    .addRule('max-lines', OFF) // [S104]
    .addRule('max-lines-per-function', OFF) // [S138]
    // ⚠️ Not for every project
    .addRule('max-switch-cases', OFF) // [S1479] 🟢
    .addRule('max-union-size', OFF) // [S4622]
    .addRule('misplaced-loop-counter', WARNING) // [S1994] 🟢
    .addRule('nested-control-flow', OFF) // [S134]
    // ⚠️ Handled by TypeScript
    .addRule('new-operator-misuse', OFF) // [S2999] 🟢💭
    .addRule('no-all-duplicated-branches', ERROR) // [S3923] 🟢
    // ⚠️ Seems too restrictive for me, alphabetical sorting is not a very rare requirement
    .addRule('no-alphabetical-sort', OFF) // [S2871] 🟢💭
    .addRule('no-angular-bypass-sanitization', ERROR) // [S6268] 🟢 📦 `@angular/*`
    // ⚠️ ts/no-array-delete`; works on TS code only anyway
    .addRule('no-array-delete', OFF) // [S2870] 🟢💭
    // ⚠️ Handled by TypeScript
    .addRule('no-associative-arrays', OFF) // [S3579] 🟢💭
    // ⚠️ Seems too restrictive for me
    .addRule('no-async-constructor', OFF) // [S7059] 🟢
    // Reason for keeping disabled: should mostly be covered by `no-global-assign`
    .addRule('no-built-in-override', OFF) // [S2424]
    .addRule('no-case-label-in-switch', ERROR) // [S1219] 🟢
    .addRule('no-clear-text-protocols', WARNING) // [S5332] 🟢 📦 `nodemailer`, `ftp`, `telnet-client`, `aws-cdk-lib`
    .addRule('no-code-after-done', testsRulesSeverity) // [S6079] 🟢🧪 📦 `mocha`
    .addRule('no-collapsible-if', OFF) // [S1066]
    // TODO disable autofix?
    .addRule('no-collection-size-mischeck', ERROR) // [S3981] 🟢💭
    // ⚠️ Seems too restrictive
    .addRule('no-commented-code', OFF) // [S125] 🟢
    // ⚠️ `regexp/no-control-character`
    .addRule('no-control-regex', OFF) // [S6324] 🟢💭🔤
    // ⚠️ `no-useless-assignment`
    .addRule('no-dead-store', OFF) // [S1854] 🟢
    .addRule('no-delete-var', ERROR) // [S3001] 🟢
    // ⚠️ ts/no-duplicate-type-constituents`
    .addRule('no-duplicate-in-composite', OFF) // [S4621] 🟢
    .addRule('no-duplicate-string', OFF) // [S1192]
    .addRule('no-duplicated-branches', ERROR) // [S1871] 🟢
    .addRule('no-element-overwrite', ERROR) // [S4143] 🟢
    // Reason for keeping enabled: not caught by eslint-plugin-regexp
    .addRule('no-empty-after-reluctant', ERROR) // [S6019] 🟢💭🔤
    // ⚠️ `regexp/no-empty-alternative`
    .addRule('no-empty-alternatives', OFF) // [S6323] 🟢💭🔤
    // ⚠️ `regexp/no-empty-character-class`
    .addRule('no-empty-character-class', OFF) // [S2639] 🟢💭🔤
    .addRule('no-empty-collection', ERROR) // [S4158] 🟢
    // ⚠️ `regexp/no-empty-group`
    .addRule('no-empty-group', OFF) // [S6331] 🟢💭🔤
    // ⚠️ It seems fragile to me that this rule does not give the control over which files to consider as test files: "This rule flags any file that has .test or .spec as part of its suffix but does not contain any test cases defined using the different forms of the it and test functions from Jasmine, Jest, Mocha, or Node.js testing API."
    .addRule('no-empty-test-file', OFF) // [S2187] 🟢🧪 `jasmine`, `jest`, `mocha`, node.js (only assertions patterns are checked, not package imports: https://github.com/SonarSource/SonarJS/blob/b8ba1ad28ef481a6f9bae2f9c42ea18a14668adb/packages/jsts/src/rules/S2187/rule.ts#L24)
    .addRule('no-equals-in-for-termination', ERROR) // [S888] 🟢
    // ⚠️ `jest/no-focused-tests`, `vitest/no-focused-tests`. For other testing frameworks, one can enable this rule manually
    .addRule('no-exclusive-tests', OFF) // [S6426] 🟢🧪 (only patterns are checked, not package imports)
    .addRule('no-extra-arguments', ERROR) // [S930] 🟢
    // ⚠️ `no-fallthrough`
    .addRule('no-fallthrough', OFF) // [S128] 🟢
    .addRule('no-for-in-iterable', ERROR) // [S4139] 💭
    .addRule('no-function-declaration-in-block', OFF) // [S1530]
    .addRule('no-global-this', ERROR) // [S2990] 🟢
    // Note: with cases noncompliant with this rule, ESLint fails on parsing stage anyway due to the assuming of being in a strict mode
    .addRule('no-globals-shadowing', ERROR) // [S2137] 🟢
    .addRule('no-gratuitous-expressions', ERROR) // [S2589] 🟢
    // Warning because has false positives (triggered on any strings looking like IP addresses)
    .addRule('no-hardcoded-ip', WARNING) // [S1313] 🟢 📦 `node:net`
    .addRule('no-hardcoded-passwords', ERROR) // [S2068] 🟢 📦 `mysql`
    // "This rule detects variables/fields having a name matching a list of words (secret, token, credential, auth, api[_.-]?key) being assigned a pseudorandom hard-coded value. The pseudorandomness of the hard-coded value is based on its entropy and the probability to be human-readable."
    .addRule('no-hardcoded-secrets', ERROR) // [S6418] 🟢
    .addRule('no-hook-setter-in-body', ERROR) // [S6442] 🟢 📦 `react`
    // ⚠️ `no-dupe-else-if`, `no-duplicate-case`
    .addRule('no-identical-conditions', OFF) // [S1862] 🟢
    // Note: partially overlaps with `no-self-compare`
    .addRule('no-identical-expressions', ERROR) // [S1764] 🟢
    .addRule('no-identical-functions', ERROR) // [S4144] 🟢
    .addRule('no-ignored-exceptions', ERROR) // [S2486] 🟢
    .addRule('no-ignored-return', ERROR) // [S2201] 🟢💭
    // Reason for keeping disabled: should mostly be covered by `import/no-extraneous-dependencies`
    .addRule('no-implicit-dependencies', OFF) // [S4328]
    .addRule('no-implicit-global', ERROR) // [S2703] 🟢
    .addRule('no-in-misuse', ERROR) // [S4619] 🟢💭
    .addRule('no-incomplete-assertions', testsRulesSeverity) // [S2970] 🟢🧪 (only patterns are checked, not package imports)
    // ⚠️ `consistent-return`
    .addRule('no-inconsistent-returns', OFF) // [S3801]
    // ⚠️ ts/restrict-plus-operands`
    .addRule('no-incorrect-string-concat', OFF) // [S3402] 💭
    .addRule('no-internal-api-use', ERROR) // [S6627] 🟢
    .addRule('no-intrusive-permissions', ERROR) // [S5604] 🟢
    // ⚠️ `regexp/no-invalid-regexp`
    .addRule('no-invalid-regexp', OFF) // [S5856] 🟢💭🔤
    .addRule('no-invariant-returns', ERROR) // [S3516] 🟢
    .addRule('no-inverted-boolean-check', ERROR) // [S1940] 🟢
    .addRule('no-ip-forward', ERROR) // [S5759] 🟢 📦 `node-http-proxy`, `http-proxy-middleware`
    // ⚠️ `no-labels`
    .addRule('no-labels', OFF) // [S1119] 🟢
    // Note: seems usable in .js files only
    .addRule('no-literal-call', ERROR) // [S6958] 🟢
    .addRule('no-mime-sniff', helmetRulesSeverity) // [S5734] 🟢 📦 `helmet`
    .addRule('no-misleading-array-reverse', ERROR) // [S4043] 🟢💭
    // ⚠️ `regexp/no-misleading-unicode-character`
    .addRule('no-misleading-character-class', OFF) // [S5868] 🟢💭🔤
    .addRule('no-mixed-content', helmetRulesSeverity) // [S5730] 🟢 📦 `helmet`
    // ⚠️ Too noisy in practice
    .addRule('no-nested-assignment', OFF) // [S1121] 🟢
    // ⚠️ Too noisy in practice
    .addRule('no-nested-conditional', OFF) // [S3358] 🟢
    // ⚠️ Too noisy in practice
    .addRule('no-nested-functions', OFF) // [S2004] 🟢
    .addRule('no-nested-incdec', OFF) // [S881]
    .addRule('no-nested-switch', OFF) // [S1821]
    // ⚠️ Seems too restrictive for me
    .addRule('no-nested-template-literals', OFF) // [S4624] 🟢
    .addRule('no-os-command-from-path', ERROR) // [S4036] 🟢 📦 `node:child_process`
    .addRule('no-parameter-reassignment', ERROR) // [S1226] 🟢
    // ⚠️ `no-new-wrappers`
    .addRule('no-primitive-wrappers', OFF) // [S1533] 🟢
    .addRule('no-redundant-assignments', ERROR) // [S4165] 🟢
    .addRule('no-redundant-boolean', ERROR) // [S1125] 🟢
    .addRule('no-redundant-jump', ERROR) // [S3626] 🟢
    .addRule('no-redundant-optional', ERROR) // [S4782] 🟢💭
    .addRule('no-reference-error', OFF) // [S3827]
    .addRule('no-referrer-policy', helmetRulesSeverity) // [S5736] 🟢 📦 `helmet`
    // ⚠️ `no-regex-spaces`, `regexp/prefer-quantifier`
    .addRule('no-regex-spaces', OFF) // [S6326] 🟢💭🔤
    .addRule('no-require-or-define', OFF) // [S3533] 💭
    .addRule('no-return-type-any', OFF) // [S4324] 💭
    .addRule('no-same-argument-assert', testsRulesSeverity) // [S5863] 🟢🧪 📦 `chai`
    // ⚠️ Purely stylistic, handled by Prettier
    .addRule('no-same-line-conditional', OFF) // [S3972] 🟢
    // ⚠️ Unsure about this one, it seems to me that it might disallow "normal" code which could be hard to "fix"
    .addRule('no-selector-parameter', OFF) // [S2301] 🟢💭
    // ⚠️ `jest/no-disabled-tests`, `vitest/no-disabled-tests`
    .addRule('no-skipped-tests', OFF) // [S1607] 🟢🧪 `jasmine`, `jest`, `mocha`, node.js (only patterns are checked, not package imports)
    .addRule('no-small-switch', ERROR) // [S1301] 🟢
    .addRule('no-sonar-comments', OFF) // [S1291]
    .addRule('no-table-as-layout', ERROR) // [S5257] 🟢🔵
    // ⚠️ Reports on promise-returning functions marked with `void `
    .addRule('no-try-promise', OFF) // [S4822] 🟢💭
    .addRule('no-undefined-argument', ERROR) // [S4623] 🟢💭
    // ⚠️ Useful in some scenarios, for example in `mongoose` to remove the property from the document
    .addRule('no-undefined-assignment', OFF) // [S2138]
    // ⚠️ `curly` and Prettier
    .addRule('no-unenclosed-multiline-block', OFF) // [S2681] 🟢
    .addRule('no-uniq-key', ERROR) // [S6486] 🟢🔵
    .addRule('no-unsafe-unzip', ERROR) // [S5042] 🟢 📦 `tar`, `adm-zip`, `jszip`, `yauzl`, `extract-zip`
    // ⚠️ `no-new`
    .addRule('no-unthrown-error', OFF) // [S3984] 🟢
    .addRule('no-unused-collection', ERROR) // [S4030] 🟢
    .addRule('no-unused-function-argument', OFF) // [S1172]
    // ⚠️ `no-unused-vars`
    .addRule('no-unused-vars', OFF) // [S1481] 🟢
    .addRule('no-use-of-empty-return-value', ERROR) // [S3699] 🟢
    // ⚠️ `no-useless-catch`
    .addRule('no-useless-catch', OFF) // [S2737] 🟢
    .addRule('no-useless-increment', ERROR) // [S2123] 🟢
    // Reason for disabling: disallows `string & {}` pattern and has false positives
    .addRule('no-useless-intersection', OFF) // [S4335] 🟢💭
    .addRule('no-useless-react-setstate', ERROR) // [S6443] 🟢 📦 `react`
    // ⚠️ `no-use-before-define`, `block-scoped-var`, `vars-on-top`
    .addRule('no-variable-usage-before-declaration', OFF) // [S1526]
    .addRule('no-weak-cipher', ERROR) // [S5547] 🟢 📦 `node:crypto`
    .addRule('no-weak-keys', ERROR) // [S4426] 🟢 📦 `node:crypto`
    .addRule('no-wildcard-import', OFF) // [S2208]
    .addRule('non-existent-operator', ERROR) // [S2757] 🟢
    // ⚠️ TypeScript
    .addRule('non-number-in-arithmetic-expression', OFF) // [S3760] 💭
    // ⚠️ TypeScript
    .addRule('null-dereference', OFF) // [S2259] 🟢💭
    .addRule('object-alt-content', ERROR) // [S5264] 🟢🔵
    // ⚠️ TypeScript
    .addRule('operation-returning-nan', OFF) // [S3757] 💭
    .addRule('os-command', ERROR) // [S4721] 🟢 📦 `node:child_process`
    .addRule('post-message', ERROR) // [S2819] 🟢💭
    // ⚠️ `default-case-last`
    .addRule('prefer-default-last', OFF) // [S4524] 🟢
    .addRule('prefer-immediate-return', OFF) // [S1488]
    .addRule('prefer-object-literal', ERROR) // [S2428]
    .addRule('prefer-promise-shorthand', ERROR) // [S4634] 🟢
    // ⚠️ IMHO this is not a common practice
    .addRule('prefer-read-only-props', OFF) // [S6759] 🟢💭
    // ⚠️ `RegExp.prototype.exec` mutates the state of the regexp: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#return_value
    .addRule('prefer-regexp-exec', OFF) // [S6594] 🟢💭🔤
    .addRule('prefer-single-boolean-return', WARNING) // [S1126] 🟢
    .addRule('prefer-type-guard', ERROR) // [S4322] 🟢
    .addRule('prefer-while', ERROR) // [S1264] 🟢
    .addRule('production-debug', ERROR) // [S4507] 🟢 📦 `errorhandler`
    // ⚠️ Simply reports on every usage of `Math.random`
    .addRule('pseudo-random', OFF) // [S2245] 🟢
    .addRule('public-static-readonly', ERROR) // [S1444] 🟢
    .addRule('publicly-writable-directories', ERROR) // [S5443] 🟢 📦 `node:fs`
    .addRule('reduce-initial-value', ERROR) // [S6959] 🟢💭
    // ⚠️ Sometimes this technique is useful
    .addRule('redundant-type-aliases', OFF) // [S6564] 🟢
    .addRule('regex-complexity', WARNING, [{threshold: 40}]) // [S5843] 🟢💭🔤
    .addRule('session-regeneration', ERROR) // [S5876] 🟢 📦 `passport`
    .addRule('shorthand-property-grouping', OFF) // [S3499]
    // ⚠️ `regexp/no-useless-character-class`
    .addRule('single-char-in-character-classes', OFF) // [S6397] 🟢💭🔤
    // ⚠️ `regexp/prefer-character-class`
    .addRule('single-character-alternation', OFF) // [S6035] 🟢💭🔤
    // ⚠️ `regexp/no-super-linear-backtracking`
    .addRule('slow-regex', OFF) // [S5852] 🟢💭🔤
    .addRule('sql-queries', ERROR) // [S2077] 🟢 📦 `mysql`, `pg`
    .addRule('stable-tests', testsRulesSeverity) // [S5973] 🟢
    .addRule('stateful-regex', ERROR) // [S6351] 🟢🔤
    .addRule('strict-transport-security', helmetRulesSeverity) // [S5739] 🟢 📦 `helmet`
    .addRule('strings-comparison', WARNING) // [S3003] 💭
    // ⚠️ `constructor-super`
    .addRule('super-invocation', OFF) // [S3854] 🟢
    .addRule('table-header', WARNING) // [S5256] 🟢🔵
    .addRule('table-header-reference', WARNING) // [S5260] 🟢🔵
    .addRule('test-check-exception', ERROR) // [S5958] 🟢🧪 (only patterns are checked, not package imports)
    // Reason for disabling: completely forbids TODO comments and has false positives
    .addRule('todo-tag', OFF) // [S1135] 🟢
    .addRule('too-many-break-or-continue-in-loop', OFF) // [S135]
    // ⚠️ TypeScript
    .addRule('unicode-aware-regex', OFF) // [S5867] 🔤💭
    // `unused-imports/no-unused-imports`, ts/no-unused-vars`, `no-unused-vars`
    .addRule('unused-import', OFF) // [S1128] 🟢💭
    .addRule('unused-named-groups', ERROR) // [S5860] 🟢💭🔤
    .addRule('unverified-certificate', ERROR) // [S4830] 🟢 📦 `node:https`, `node:tls`
    .addRule('unverified-hostname', ERROR) // [S5527] 🟢 📦 `node:https`, `node:tls`
    // ⚠️ `no-const-assign`
    .addRule('updated-const-var', OFF) // [S3500] 🟢
    .addRule('updated-loop-counter', WARNING) // [S2310] 🟢
    .addRule('use-type-alias', WARNING) // [S4323] 🟢
    // ⚠️ TypeScript
    .addRule('values-not-convertible-to-numbers', OFF) // [S3758] 💭
    .addRule('variable-name', OFF) // [S117]
    // ⚠️ `no-void`
    .addRule('void-use', OFF) // [S3735] 🟢💭
    .addRule('weak-ssl', ERROR) // [S4423] 🟢 📦 `node:https`, `node:tls`
    .addRule('x-powered-by', ERROR) // [S5689] 🟢 📦 `express`, `helmet`
    .addRule('xml-parser-xxe', ERROR) // [S2755] 🟢 📦 `libxmljs`
    .enableConfigTesterForPlugin('sonarjs')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

// cspell:disable viem tronweb
import {ERROR, OFF, WARNING} from '../constants';
import {doesPackageExist} from '../utils';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface SonarEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'sonarjs'> {
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

export default (async (context, optionsRaw) => {
  const [awsCdkLibInstalled, helmetInstalled] = await Promise.all([
    doesPackageExist('aws-cdk-lib'),
    doesPackageExist('helmet'),
  ]);

  const optionsResolved = assignDefaults(optionsRaw, {
    enableAwsRules: awsCdkLibInstalled,
    enableHelmetRules: helmetInstalled,
    testsRules: true,
  } satisfies SonarEslintConfigOptions);

  const {enableAwsRules, enableHelmetRules, testsRules} = optionsResolved;

  const awsRulesSeverity = enableAwsRules ? ERROR : OFF;
  const helmetRulesSeverity = enableHelmetRules ? ERROR : OFF;
  const testsRulesSeverity = testsRules ? ERROR : OFF;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'sonarjs');

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
    ?.addConfig([
      'sonar',
      {
        includeDefaultFilesAndIgnores: true,
        // TODO why?
        ignoresInternal: {
          html: false,
        },
      },
    ])
    .addRule('anchor-precedence', ERROR) /** @since 1.0.4-alpha.0 */ // [S5850] 🟢💭🔤
    // ⚠️ Handled by TypeScript
    .addRule('argument-type', OFF) /** @since 1.0.4-alpha.0 */ // [S3782] 🟢💭
    .addRule('arguments-order', ERROR) /** @since 1.0.4-alpha.0 */ // [S2234] 🟢💭
    // ⚠️ `prefer-rest-params`
    .addRule('arguments-usage', OFF) /** @since 1.0.4-alpha.0 */ // [S3513]
    // ⚠️ Handled by TypeScript
    .addRule('array-callback-without-return', OFF) /** @since 1.0.4-alpha.0 */ // [S3796] 🟢💭
    // ⚠️ `no-array-constructor`, `unicorn/no-new-array`
    .addRule('array-constructor', OFF) /** @since 1.0.4-alpha.0 */ // [S1528]
    // ⚠️ Prettier
    .addRule('arrow-function-convention', OFF) /** @since 1.0.4-alpha.0 */ // [S3524]
    .addRule('assertions-in-tests', testsRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S2699] 🟢🧪 📦 `chai`, `sinon`, `supertest`, `vitest`
    .addRule('aws-apigateway-public-api', awsRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S6333] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-ec2-rds-dms-public', awsRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S6329] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-ec2-unencrypted-ebs-volume', awsRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S6275] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-efs-unencrypted', awsRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S6332] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-iam-all-privileges', awsRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S6302] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-iam-all-resources-accessible', OFF) /** @since 1.0.4-alpha.0 */ // [S6304] 📦 `aws-cdk-lib`
    .addRule('aws-iam-privilege-escalation', awsRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S6317] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-iam-public-access', awsRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S6270] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-opensearchservice-domain', awsRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S6308] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-rds-unencrypted-databases', awsRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S6303] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-restricted-ip-admin-access', awsRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S6321] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-s3-bucket-granted-access', awsRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S6265] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-s3-bucket-insecure-http', awsRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S6249] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-s3-bucket-public-access', awsRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S6281] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-s3-bucket-versioning', awsRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S6252] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-sagemaker-unencrypted-notebook', awsRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S6319] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-sns-unencrypted-topics', awsRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S6327] 🟢 📦 `aws-cdk-lib`
    .addRule('aws-sqs-unencrypted-queue', awsRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S6330] 🟢 📦 `aws-cdk-lib`
    // Note: doesn't seem to work in TypeScript code
    .addRule('bitwise-operators', ERROR) /** @since 1.0.4-alpha.0 */ // [S1529] 🟢
    // ⚠️ `block-scoped-var`, `vars-on-top`
    .addRule('block-scoped-var', OFF) /** @since 3.0.0 */ // [S2392] 🟢
    .addRule('bool-param-default', OFF) /** @since 1.0.4-alpha.0 */ // [S4798]
    // ⚠️ Prettier
    .addRule('call-argument-line', OFF) /** @since 1.0.4-alpha.0 */ // [S1472] 🟢
    .addRule('chai-determinate-assertion', testsRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S6092] 🟢🧪 📦 `chai`
    // ⚠️ `camelcase`
    .addRule('class-name', OFF) /** @since 1.0.4-alpha.0 */ // [S101] 🟢
    .addRule('class-prototype', OFF) /** @since 1.0.4-alpha.0 */ // [S3525] 💭
    // ⚠️ Unreliable metric and cannot be universally applied to all projects
    .addRule('cognitive-complexity', OFF) /** @since 0.1.0-0 */ // [S3776] 🟢
    .addRule('comma-or-logical-or-case', ERROR) /** @since 1.0.4-alpha.0 */ // [S3616] 🟢
    .addRule('comment-regex', OFF) /** @since 1.0.4-alpha.0 */ // [S124]
    // ⚠️ `regexp/prefer-w`, `regexp/prefer-plus-quantifier`
    .addRule('concise-regex', OFF) /** @since 1.0.4-alpha.0 */ // [S6353] 🟢💭🔤
    .addRule('confidential-information-logging', ERROR) /** @since 1.0.4-alpha.0 */ // [S5757] 🟢 📦 `signale`
    // ⚠️ `no-new`
    .addRule('constructor-for-side-effects', OFF) /** @since 1.0.4-alpha.0 */ // [S1848] 🟢
    .addRule('content-length', ERROR) /** @since 1.0.4-alpha.0 */ // [S5693] 🟢 📦 `formidable`, `multer`, `body-parser`
    .addRule('content-security-policy', helmetRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S5728] 🟢 📦 `helmet`
    .addRule('cookie-no-httponly', ERROR) /** @since 1.0.4-alpha.0 */ // [S3330] 🟢 📦 `cookie-session`, `express-session`, `cookies`, `csurf`
    .addRule('cors', ERROR) /** @since 1.0.4-alpha.0 */ // [S5122] 🟢 📦 `node:http`, `cors`
    .addRule('csrf', ERROR) /** @since 1.0.4-alpha.0 */ // [S4502] 🟢 📦 `csurf`
    .addRule('cyclomatic-complexity', OFF) /** @since 1.0.4-alpha.0 */ // [S1541]
    .addRule('declarations-in-global-scope', OFF) /** @since 1.0.4-alpha.0 */ // [S3798]
    // ⚠️ `import/no-deprecated`, ts/no-deprecated` which also likely do the job better
    .addRule('deprecation', OFF) /** @since 1.0.4-alpha.0 */ // [S1874] 🟢💭
    .addRule('destructuring-assignment-syntax', OFF) /** @since 1.0.4-alpha.0 */ // [S3514]
    // ⚠️ Other rules & TypeScript itself; has false positives
    .addRule('different-types-comparison', OFF) /** @since 1.0.4-alpha.0 */ // [S3403] 🟢💭
    .addRule('disabled-auto-escaping', ERROR) /** @since 1.0.4-alpha.0 */ // [S5247] 🟢💭 📦 `mustache`, `handlebars`, `markdown-it`, `marked`, `kramed`
    .addRule('disabled-resource-integrity', ERROR) /** @since 1.0.4-alpha.0 */ // [S5725] 🟢💭
    .addRule('disabled-timeout', testsRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S6080] 🟢🧪 📦 `chai`
    // ⚠️ `regexp/no-dupe-characters-character-class`
    .addRule('duplicates-in-character-class', OFF) /** @since 1.0.4-alpha.0 */ // [S5869] 🟢💭🔤
    .addRule('dynamically-constructed-templates', ERROR) /** @since 3.0.6 */ // [S7790] 🟢📦 `pug`, `ejs`
    .addRule('elseif-without-else', OFF) /** @since 0.9.1 */ // [S126]
    // ⚠️ `regexp/no-empty-group` (and also `sonarjs/no-empty-group`), `regexp/no-empty-alternative`, `regexp/no-trivially-nested-quantifier`
    .addRule('empty-string-repetition', OFF) /** @since 1.0.4-alpha.0 */ // [S5842] 🟢💭🔤
    .addRule('encryption-secure-mode', ERROR) /** @since 1.0.4-alpha.0 */ // [S5542] 🟢 📦 `node:crypto`
    // Not disabling because, despite being mostly covered by `regexp/no-useless-dollar-replacements` rule, finds more problems
    .addRule('existing-groups', ERROR) /** @since 1.0.4-alpha.0 */ // [S6328] 🟢💭🔤
    .addRule('expression-complexity', OFF) /** @since 1.0.4-alpha.0 */ // [S1067]
    .addRule('file-header', OFF) /** @since 1.0.4-alpha.0 */ // [S1451]
    .addRule('file-name-differ-from-class', OFF) /** @since 1.0.4-alpha.0 */ // [S3317]
    .addRule('file-permissions', ERROR) /** @since 1.0.4-alpha.0 */ // [S2612] 🟢 📦 `node:fs`, `node:process`
    .addRule('file-uploads', ERROR) /** @since 1.0.4-alpha.0 */ // [S2598] 🟢 📦 `formidable`, `multer`
    // ⚠️ Completely forbids FIXME comments
    .addRule('fixme-tag', OFF) /** @since 1.0.4-alpha.0 */ // [S1134] 🟢
    // Reason for not enabling: covered by `guard-for-in` rule
    .addRule('for-in', OFF) /** @since 1.0.4-alpha.0 */ // [S1535]
    .addRule('for-loop-increment-sign', ERROR) /** @since 1.0.4-alpha.0 */ // [S2251] 🟢
    .addRule('frame-ancestors', helmetRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S5732] 🟢 📦 `helmet`
    // ⚠️ IMHO too restrictive + some cases covered by `unicorn/consistent-function-scoping`
    .addRule('function-inside-loop', OFF) /** @since 1.0.4-alpha.0 */ // [S1515] 🟢
    .addRule('function-name', OFF) /** @since 1.0.4-alpha.0 */ // [S100]
    // ⚠️ certainly not for everyone
    .addRule('function-return-type', OFF) /** @since 1.0.4-alpha.0 */ // [S3800] 🟢💭
    .addRule('future-reserved-words', ERROR) /** @since 1.0.4-alpha.0 */ // [S1527] 🟢
    // ⚠️ `require-yield`. Does not seem to report on empty yields like `yield;`
    .addRule('generator-without-yield', OFF) /** @since 1.0.4-alpha.0 */ // [S3531] 🟢
    .addRule('hardcoded-secret-signatures', ERROR) /** @since 3.0.6 */ // [S6437] 🟢📦 `cookie-parser`, `node:crypto`, `jose`, `jsonwebtoken`, `node-jose`, `superagent`, `express-session`
    .addRule('hashing', ERROR) /** @since 1.0.4-alpha.0 */ // [S4790] 🟢 📦 `node:crypto`
    .addRule('hidden-files', ERROR) /** @since 1.0.4-alpha.0 */ // [S5691] 🟢 📦 `serve-static`
    // ⚠️ Handled by TypeScript
    .addRule('in-operator-type-error', OFF) /** @since 1.0.4-alpha.0 */ // [S3785] 🟢💭
    .addRule('inconsistent-function-call', ERROR) /** @since 1.0.4-alpha.0 */ // [S3686] 🟢
    .addRule('index-of-compare-to-positive-number', ERROR) /** @since 1.0.4-alpha.0 */ // [S2692] 🟢💭
    .addRule('insecure-cookie', ERROR) /** @since 1.0.4-alpha.0 */ // [S2092] 🟢 📦 `cookie-session`, `express-session`, `cookies`, `csurf`
    .addRule('insecure-jwt-token', ERROR) /** @since 1.0.4-alpha.0 */ // [S5659] 🟢 📦 `jsonwebtoken`
    .addRule('inverted-assertion-arguments', testsRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S3415] 🟢🧪 📦 `mocha`
    .addRule('jsx-no-leaked-render', ERROR) /** @since 3.0.0 */ // [S6439] 🟢💭🔵
    // ⚠️ `no-labels`
    .addRule('label-position', OFF) /** @since 1.0.4-alpha.0 */ // [S1439] 🟢
    // TODO not sure if this is needed now
    .addRule('link-with-target-blank', ERROR) /** @since 1.0.4-alpha.0 */ // [S5148] 🟢
    .addRule('max-lines', OFF) /** @since 3.0.0 */ // [S104]
    .addRule('max-lines-per-function', OFF) /** @since 3.0.0 */ // [S138]
    // ⚠️ Not for every project
    .addRule('max-switch-cases', OFF) /** @since 0.2.0 */ // [S1479] 🟢
    .addRule('max-union-size', OFF) /** @since 1.0.4-alpha.0 */ // [S4622]
    .addRule('misplaced-loop-counter', WARNING) /** @since 1.0.4-alpha.0 */ // [S1994] 🟢
    .addRule('nested-control-flow', OFF) /** @since 1.0.4-alpha.0 */ // [S134]
    // ⚠️ Handled by TypeScript
    .addRule('new-operator-misuse', OFF) /** @since 1.0.4-alpha.0 */ // [S2999] 🟢💭
    .addRule('no-all-duplicated-branches', ERROR) /** @since 0.1.0-0 */ // [S3923] 🟢
    // ⚠️ Seems too restrictive for me, alphabetical sorting is not a very rare requirement
    .addRule('no-alphabetical-sort', OFF) /** @since 1.0.4-alpha.0 */ // [S2871] 🟢💭
    .addRule('no-angular-bypass-sanitization', ERROR) /** @since 1.0.4-alpha.0 */ // [S6268] 🟢 📦 `@angular/*`
    // ⚠️ ts/no-array-delete`; works on TS code only anyway
    .addRule('no-array-delete', OFF) /** @since 1.0.4-alpha.0 */ // [S2870] 🟢💭
    // ⚠️ Handled by TypeScript
    .addRule('no-associative-arrays', OFF) /** @since 1.0.4-alpha.0 */ // [S3579] 🟢💭
    // ⚠️ Seems too restrictive for me
    .addRule('no-async-constructor', OFF) /** @since 2.0.3 */ // [S7059] 🟢
    // Reason for keeping disabled: should mostly be covered by `no-global-assign`
    .addRule('no-built-in-override', OFF) /** @since 1.0.4-alpha.0 */ // [S2424]
    .addRule('no-case-label-in-switch', ERROR) /** @since 1.0.4-alpha.0 */ // [S1219] 🟢
    .addRule('no-clear-text-protocols', WARNING) /** @since 1.0.4-alpha.0 */ // [S5332] 🟢 📦 `nodemailer`, `ftp`, `telnet-client`, `aws-cdk-lib`
    .addRule('no-code-after-done', testsRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S6079] 🟢🧪 📦 `mocha`
    .addRule('no-collapsible-if', OFF) /** @since 0.4.0 */ // [S1066]
    // TODO disable autofix?
    .addRule('no-collection-size-mischeck', ERROR) /** @since 0.5.0 */ // [S3981] 🟢💭
    // ⚠️ Seems too restrictive
    .addRule('no-commented-code', OFF) /** @since 1.0.4-alpha.0 */ // [S125] 🟢
    // ⚠️ `regexp/no-control-character`
    .addRule('no-control-regex', OFF) /** @since 3.0.0 */ // [S6324] 🟢💭🔤
    // ⚠️ `no-useless-assignment`
    .addRule('no-dead-store', OFF) /** @since 1.0.4-alpha.0 */ // [S1854] 🟢
    .addRule('no-delete-var', ERROR) /** @since 1.0.4-alpha.0 */ // [S3001] 🟢
    // ⚠️ ts/no-duplicate-type-constituents`
    .addRule('no-duplicate-in-composite', OFF) /** @since 1.0.4-alpha.0 */ // [S4621] 🟢
    .addRule('no-duplicate-string', OFF) /** @since 0.2.0 */ // [S1192]
    .addRule('no-duplicated-branches', ERROR) /** @since 0.1.0-0 */ // [S1871] 🟢
    .addRule('no-element-overwrite', ERROR) /** @since 0.1.0-0 */ // [S4143] 🟢
    // Reason for keeping enabled: not caught by eslint-plugin-regexp
    .addRule('no-empty-after-reluctant', ERROR) /** @since 1.0.4-alpha.0 */ // [S6019] 🟢💭🔤
    // ⚠️ `regexp/no-empty-alternative`
    .addRule('no-empty-alternatives', OFF) /** @since 1.0.4-alpha.0 */ // [S6323] 🟢💭🔤
    // ⚠️ `regexp/no-empty-character-class`
    .addRule('no-empty-character-class', OFF) /** @since 3.0.0 */ // [S2639] 🟢💭🔤
    .addRule('no-empty-collection', ERROR) /** @since 0.9.1 */ // [S4158] 🟢
    // ⚠️ `regexp/no-empty-group`
    .addRule('no-empty-group', OFF) /** @since 1.0.4-alpha.0 */ // [S6331] 🟢💭🔤
    // ⚠️ It seems fragile to me that this rule does not give the control over which files to consider as test files: "This rule flags any file that has .test or .spec as part of its suffix but does not contain any test cases defined using the different forms of the it and test functions from Jasmine, Jest, Mocha, or Node.js testing API."
    .addRule('no-empty-test-file', OFF) /** @since 1.0.4-alpha.0 */ // [S2187] 🟢🧪 `jasmine`, `jest`, `mocha`, node.js (only assertions patterns are checked, not package imports: https://github.com/SonarSource/SonarJS/blob/b8ba1ad28ef481a6f9bae2f9c42ea18a14668adb/packages/jsts/src/rules/S2187/rule.ts#L24)
    .addRule('no-equals-in-for-termination', ERROR) /** @since 1.0.4-alpha.0 */ // [S888] 🟢
    // ⚠️ `jest/no-focused-tests`, `vitest/no-focused-tests`. For other testing frameworks, one can enable this rule manually
    .addRule('no-exclusive-tests', OFF) /** @since 1.0.4-alpha.0 */ // [S6426] 🟢🧪 (only patterns are checked, not package imports)
    .addRule('no-extra-arguments', ERROR) /** @since 0.1.0-0 */ // [S930] 🟢
    // ⚠️ `no-fallthrough`
    .addRule('no-fallthrough', OFF) /** @since 3.0.0 */ // [S128] 🟢
    .addRule('no-for-in-iterable', ERROR) /** @since 1.0.4-alpha.0 */ // [S4139] 💭
    .addRule('no-function-declaration-in-block', OFF) /** @since 1.0.4-alpha.0 */ // [S1530]
    .addRule('no-global-this', ERROR) /** @since 1.0.4-alpha.0 */ // [S2990] 🟢
    // Note: with cases noncompliant with this rule, ESLint fails on parsing stage anyway due to the assuming of being in a strict mode
    .addRule('no-globals-shadowing', ERROR) /** @since 1.0.4-alpha.0 */ // [S2137] 🟢
    .addRule('no-gratuitous-expressions', ERROR) /** @since 0.9.1 */ // [S2589] 🟢
    // Warning because has false positives (triggered on any strings looking like IP addresses)
    .addRule('no-hardcoded-ip', WARNING) /** @since 1.0.4-alpha.0 */ // [S1313] 🟢 📦 `node:net`
    .addRule('no-hardcoded-passwords', ERROR) /** @since 3.0.0 */ // [S2068] 🟢 📦 `mysql`
    // "This rule detects variables/fields having a name matching a list of words (secret, token, credential, auth, api[_.-]?key) being assigned a pseudorandom hard-coded value. The pseudorandomness of the hard-coded value is based on its entropy and the probability to be human-readable."
    .addRule('no-hardcoded-secrets', ERROR) /** @since 3.0.0 */ // [S6418] 🟢
    .addRule('no-hook-setter-in-body', ERROR) /** @since 1.0.4-alpha.0 */ // [S6442] 🟢 📦 `react`
    // ⚠️ `no-dupe-else-if`, `no-duplicate-case`
    .addRule('no-identical-conditions', OFF) /** @since 0.1.0-0 */ // [S1862] 🟢
    // Note: partially overlaps with `no-self-compare`
    .addRule('no-identical-expressions', ERROR) /** @since 0.1.0-0 */ // [S1764] 🟢
    .addRule('no-identical-functions', ERROR) /** @since 0.1.0-0 */ // [S4144] 🟢
    .addRule('no-ignored-exceptions', ERROR) /** @since 1.0.4-alpha.0 */ // [S2486] 🟢
    .addRule('no-ignored-return', ERROR) /** @since 0.9.1 */ // [S2201] 🟢💭
    // Reason for keeping disabled: should mostly be covered by `import/no-extraneous-dependencies`
    .addRule('no-implicit-dependencies', OFF) /** @since 1.0.4-alpha.0 */ // [S4328]
    .addRule('no-implicit-global', ERROR) /** @since 1.0.4-alpha.0 */ // [S2703] 🟢
    .addRule('no-in-misuse', ERROR) /** @since 1.0.4-alpha.0 */ // [S4619] 🟢💭
    .addRule('no-incomplete-assertions', testsRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S2970] 🟢🧪 (only patterns are checked, not package imports)
    // ⚠️ `consistent-return`
    .addRule('no-inconsistent-returns', OFF) /** @since 1.0.4-alpha.0 */ // [S3801]
    // ⚠️ ts/restrict-plus-operands`
    .addRule('no-incorrect-string-concat', OFF) /** @since 1.0.4-alpha.0 */ // [S3402] 💭
    .addRule('no-internal-api-use', ERROR) /** @since 2.0.3 */ // [S6627] 🟢
    .addRule('no-intrusive-permissions', ERROR) /** @since 1.0.4-alpha.0 */ // [S5604] 🟢
    // ⚠️ `regexp/no-invalid-regexp`
    .addRule('no-invalid-regexp', OFF) /** @since 3.0.0 */ // [S5856] 🟢💭🔤
    .addRule('no-invariant-returns', ERROR) /** @since 1.0.4-alpha.0 */ // [S3516] 🟢
    .addRule('no-inverted-boolean-check', ERROR) /** @since 0.2.0 */ // [S1940] 🟢
    .addRule('no-ip-forward', ERROR) /** @since 1.0.4-alpha.0 */ // [S5759] 🟢 📦 `node-http-proxy`, `http-proxy-middleware`
    // ⚠️ `no-labels`
    .addRule('no-labels', OFF) /** @since 1.0.4-alpha.0 */ // [S1119] 🟢
    // Note: seems usable in .js files only
    .addRule('no-literal-call', ERROR) /** @since 1.0.4-alpha.0 */ // [S6958] 🟢
    .addRule('no-mime-sniff', helmetRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S5734] 🟢 📦 `helmet`
    .addRule('no-misleading-array-reverse', ERROR) /** @since 1.0.4-alpha.0 */ // [S4043] 🟢💭
    // ⚠️ `regexp/no-misleading-unicode-character`
    .addRule('no-misleading-character-class', OFF) /** @since 3.0.0 */ // [S5868] 🟢💭🔤
    .addRule('no-mixed-content', helmetRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S5730] 🟢 📦 `helmet`
    // ⚠️ Too noisy in practice
    .addRule('no-nested-assignment', OFF) /** @since 1.0.4-alpha.0 */ // [S1121] 🟢
    // ⚠️ Too noisy in practice
    .addRule('no-nested-conditional', OFF) /** @since 1.0.4-alpha.0 */ // [S3358] 🟢
    // ⚠️ Too noisy in practice
    .addRule('no-nested-functions', OFF) /** @since 1.0.4-alpha.0 */ // [S2004] 🟢
    .addRule('no-nested-incdec', OFF) /** @since 1.0.4-alpha.0 */ // [S881]
    .addRule('no-nested-switch', OFF) /** @since 0.9.1 */ // [S1821]
    // ⚠️ Seems too restrictive for me
    .addRule('no-nested-template-literals', OFF) /** @since 0.9.1 */ // [S4624] 🟢
    .addRule('no-os-command-from-path', ERROR) /** @since 1.0.4-alpha.0 */ // [S4036] 🟢 📦 `node:child_process`
    .addRule('no-parameter-reassignment', ERROR) /** @since 1.0.4-alpha.0 */ // [S1226] 🟢
    // ⚠️ `no-new-wrappers`
    .addRule('no-primitive-wrappers', OFF) /** @since 1.0.4-alpha.0 */ // [S1533] 🟢
    .addRule('no-redundant-assignments', ERROR) /** @since 1.0.4-alpha.0 */ // [S4165] 🟢
    .addRule('no-redundant-boolean', ERROR) /** @since 0.1.0-0 */ // [S1125] 🟢
    .addRule('no-redundant-jump', ERROR) /** @since 0.5.0 */ // [S3626] 🟢
    .addRule('no-redundant-optional', ERROR) /** @since 1.0.4-alpha.0 */ // [S4782] 🟢💭
    .addRule('no-reference-error', OFF) /** @since 1.0.4-alpha.0 */ // [S3827]
    .addRule('no-referrer-policy', helmetRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S5736] 🟢 📦 `helmet`
    // ⚠️ `no-regex-spaces`, `regexp/prefer-quantifier`
    .addRule('no-regex-spaces', OFF) /** @since 3.0.0 */ // [S6326] 🟢💭🔤
    .addRule('no-require-or-define', OFF) /** @since 1.0.4-alpha.0 */ // [S3533] 💭
    .addRule('no-return-type-any', OFF) /** @since 1.0.4-alpha.0 */ // [S4324] 💭
    .addRule('no-same-argument-assert', testsRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S5863] 🟢🧪 📦 `chai`
    // ⚠️ Purely stylistic, handled by Prettier
    .addRule('no-same-line-conditional', OFF) /** @since 0.5.0 */ // [S3972] 🟢
    // ⚠️ Unsure about this one, it seems to me that it might disallow "normal" code which could be hard to "fix"
    .addRule('no-selector-parameter', OFF) /** @since 2.0.3 */ // [S2301] 🟢💭
    .addRule('no-session-cookies-on-static-assets', ERROR) /** @since 4.0.0 */ // [S8441] 🟢 📦 `express-session`, `cookie-session`
    // ⚠️ `jest/no-disabled-tests`, `vitest/no-disabled-tests`
    .addRule('no-skipped-tests', OFF) /** @since 3.0.0 */ // [S1607] 🟢🧪 `jasmine`, `jest`, `mocha`, node.js (only patterns are checked, not package imports)
    .addRule('no-small-switch', ERROR) /** @since 0.1.0-0 */ // [S1301] 🟢
    .addRule('no-sonar-comments', OFF) /** @since 3.0.0 */ // [S1291]
    .addRule('no-table-as-layout', ERROR) /** @since 1.0.4-alpha.0 */ // [S5257] 🟢🔵
    // ⚠️ Reports on promise-returning functions marked with `void `
    .addRule('no-try-promise', OFF) /** @since 1.0.4-alpha.0 */ // [S4822] 🟢💭
    .addRule('no-undefined-argument', ERROR) /** @since 1.0.4-alpha.0 */ // [S4623] 🟢💭
    // ⚠️ Useful in some scenarios, for example in `mongoose` to remove the property from the document
    .addRule('no-undefined-assignment', OFF) /** @since 1.0.4-alpha.0 */ // [S2138]
    // ⚠️ `curly` and Prettier
    .addRule('no-unenclosed-multiline-block', OFF) /** @since 1.0.4-alpha.0 */ // [S2681] 🟢
    .addRule('no-uniq-key', ERROR) /** @since 1.0.4-alpha.0 */ // [S6486] 🟢🔵
    .addRule('no-unsafe-unzip', ERROR) /** @since 1.0.4-alpha.0 */ // [S5042] 🟢 📦 `tar`, `adm-zip`, `jszip`, `yauzl`, `extract-zip`
    // ⚠️ `no-new`
    .addRule('no-unthrown-error', OFF) /** @since 1.0.4-alpha.0 */ // [S3984] 🟢
    .addRule('no-unused-collection', ERROR) /** @since 0.5.0 */ // [S4030] 🟢
    .addRule('no-unused-function-argument', OFF) /** @since 1.0.4-alpha.0 */ // [S1172]
    // ⚠️ `no-unused-vars`
    .addRule('no-unused-vars', OFF) /** @since 3.0.0 */ // [S1481] 🟢
    .addRule('no-use-of-empty-return-value', ERROR) /** @since 0.1.0-0 */ // [S3699] 🟢
    // ⚠️ `no-useless-catch`
    .addRule('no-useless-catch', OFF) /** @since 0.2.0 */ // [S2737] 🟢
    .addRule('no-useless-increment', ERROR) /** @since 1.0.4-alpha.0 */ // [S2123] 🟢
    // Reason for disabling: disallows `string & {}` pattern and has false positives
    .addRule('no-useless-intersection', OFF) /** @since 1.0.4-alpha.0 */ // [S4335] 🟢💭
    .addRule('no-useless-react-setstate', ERROR) /** @since 1.0.4-alpha.0 */ // [S6443] 🟢 📦 `react`
    // ⚠️ `no-use-before-define`, `block-scoped-var`, `vars-on-top`
    .addRule('no-variable-usage-before-declaration', OFF) /** @since 1.0.4-alpha.0 */ // [S1526]
    .addRule('no-weak-cipher', ERROR) /** @since 1.0.4-alpha.0 */ // [S5547] 🟢 📦 `node:crypto`
    .addRule('no-weak-keys', ERROR) /** @since 1.0.4-alpha.0 */ // [S4426] 🟢 📦 `node:crypto`
    .addRule('no-wildcard-import', OFF) /** @since 1.0.4-alpha.0 */ // [S2208]
    .addRule('non-existent-operator', ERROR) /** @since 0.9.1 */ // [S2757] 🟢
    // ⚠️ TypeScript
    .addRule('non-number-in-arithmetic-expression', OFF) /** @since 1.0.4-alpha.0 */ // [S3760] 💭
    // ⚠️ TypeScript
    .addRule('null-dereference', OFF) /** @since 1.0.4-alpha.0 */ // [S2259] 🟢💭
    .addRule('object-alt-content', ERROR) /** @since 1.0.4-alpha.0 */ // [S5264] 🟢🔵
    // ⚠️ TypeScript
    .addRule('operation-returning-nan', OFF) /** @since 1.0.4-alpha.0 */ // [S3757] 💭
    .addRule('os-command', ERROR) /** @since 1.0.4-alpha.0 */ // [S4721] 🟢 📦 `node:child_process`
    .addRule('post-message', ERROR) /** @since 1.0.4-alpha.0 */ // [S2819] 🟢💭
    // ⚠️ `default-case-last`
    .addRule('prefer-default-last', OFF) /** @since 1.0.4-alpha.0 */ // [S4524] 🟢
    .addRule('prefer-immediate-return', OFF) /** @since 0.1.0-0 */ // [S1488]
    .addRule('prefer-object-literal', ERROR) /** @since 0.2.0 */ // [S2428]
    .addRule('prefer-promise-shorthand', ERROR) /** @since 1.0.4-alpha.0 */ // [S4634] 🟢
    // ⚠️ IMHO this is not a common practice
    .addRule('prefer-read-only-props', OFF) /** @since 3.0.0 */ // [S6759] 🟢💭
    // ⚠️ `RegExp.prototype.exec` mutates the state of the regexp: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#return_value
    .addRule('prefer-regexp-exec', OFF) /** @since 3.0.0 */ // [S6594] 🟢💭🔤
    .addRule('prefer-single-boolean-return', WARNING) /** @since 0.1.0-0 */ // [S1126] 🟢
    .addRule('prefer-type-guard', ERROR) /** @since 1.0.4-alpha.0 */ // [S4322] 🟢
    .addRule('prefer-while', ERROR) /** @since 0.1.0-0 */ // [S1264] 🟢
    .addRule('production-debug', ERROR) /** @since 1.0.4-alpha.0 */ // [S4507] 🟢 📦 `errorhandler`
    // ⚠️ Simply reports on every usage of `Math.random`
    .addRule('pseudo-random', OFF) /** @since 1.0.4-alpha.0 */ // [S2245] 🟢
    .addRule('public-static-readonly', ERROR) /** @since 1.0.4-alpha.0 */ // [S1444] 🟢
    .addRule('publicly-writable-directories', ERROR) /** @since 1.0.4-alpha.0 */ // [S5443] 🟢 📦 `node:fs`
    .addRule('reduce-initial-value', ERROR) /** @since 1.0.4-alpha.0 */ // [S6959] 🟢💭
    // ⚠️ Sometimes this technique is useful
    .addRule('redundant-type-aliases', OFF) /** @since 1.0.4-alpha.0 */ // [S6564] 🟢
    .addRule('regex-complexity', WARNING, [{threshold: 40}]) /** @since 1.0.4-alpha.0 */ // [S5843] 🟢💭🔤
    .addRule('review-blockchain-mnemonic', ERROR) /** @since 3.0.6 */ // [S7639] 🟢📦 `ethers`, `viem`, `tronweb`
    .addRule('session-regeneration', ERROR) /** @since 1.0.4-alpha.0 */ // [S5876] 🟢 📦 `passport`
    .addRule('shorthand-property-grouping', OFF) /** @since 1.0.4-alpha.0 */ // [S3499]
    // ⚠️ `regexp/no-useless-character-class`
    .addRule('single-char-in-character-classes', OFF) /** @since 1.0.4-alpha.0 */ // [S6397] 🟢💭🔤
    // ⚠️ `regexp/prefer-character-class`
    .addRule('single-character-alternation', OFF) /** @since 1.0.4-alpha.0 */ // [S6035] 🟢💭🔤
    // ⚠️ `regexp/no-super-linear-backtracking`
    .addRule('slow-regex', OFF) /** @since 1.0.4-alpha.0 */ // [S5852] 🟢💭🔤
    .addRule('sql-queries', ERROR) /** @since 1.0.4-alpha.0 */ // [S2077] 🟢 📦 `mysql`, `pg`
    .addRule('stable-tests', testsRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S5973] 🟢
    .addRule('stateful-regex', ERROR) /** @since 1.0.4-alpha.0 */ // [S6351] 🟢🔤
    .addRule('strict-transport-security', helmetRulesSeverity) /** @since 1.0.4-alpha.0 */ // [S5739] 🟢 📦 `helmet`
    .addRule('strings-comparison', WARNING) /** @since 1.0.4-alpha.0 */ // [S3003] 💭
    .addRule('table-header', WARNING) /** @since 1.0.4-alpha.0 */ // [S5256] 🟢🔵
    .addRule('table-header-reference', WARNING) /** @since 1.0.4-alpha.0 */ // [S5260] 🟢🔵
    .addRule('test-check-exception', ERROR) /** @since 1.0.4-alpha.0 */ // [S5958] 🟢🧪 (only patterns are checked, not package imports)
    // Reason for disabling: completely forbids TODO comments and has false positives
    .addRule('todo-tag', OFF) /** @since 1.0.4-alpha.0 */ // [S1135] 🟢
    .addRule('too-many-break-or-continue-in-loop', OFF) /** @since 1.0.4-alpha.0 */ // [S135]
    // ⚠️ TypeScript
    .addRule('unicode-aware-regex', OFF) /** @since 1.0.4-alpha.0 */ // [S5867] 🔤💭
    // `unused-imports/no-unused-imports`, ts/no-unused-vars`, `no-unused-vars`
    .addRule('unused-import', OFF) /** @since 1.0.4-alpha.0 */ // [S1128] 🟢💭
    .addRule('unused-named-groups', ERROR) /** @since 1.0.4-alpha.0 */ // [S5860] 🟢💭🔤
    .addRule('unverified-certificate', ERROR) /** @since 1.0.4-alpha.0 */ // [S4830] 🟢 📦 `node:https`, `node:tls`
    .addRule('unverified-hostname', ERROR) /** @since 1.0.4-alpha.0 */ // [S5527] 🟢 📦 `node:https`, `node:tls`
    // ⚠️ `no-const-assign`
    .addRule('updated-const-var', OFF) /** @since 1.0.4-alpha.0 */ // [S3500] 🟢
    .addRule('updated-loop-counter', WARNING) /** @since 1.0.4-alpha.0 */ // [S2310] 🟢
    .addRule('use-type-alias', WARNING) /** @since 1.0.4-alpha.0 */ // [S4323] 🟢
    // ⚠️ TypeScript
    .addRule('values-not-convertible-to-numbers', OFF) /** @since 1.0.4-alpha.0 */ // [S3758] 💭
    .addRule('variable-name', OFF) /** @since 1.0.4-alpha.0 */ // [S117]
    // ⚠️ `no-void`
    .addRule('void-use', OFF) /** @since 1.0.4-alpha.0 */ // [S3735] 🟢💭
    .addRule('weak-ssl', ERROR) /** @since 1.0.4-alpha.0 */ // [S4423] 🟢 📦 `node:https`, `node:tls`
    .addRule('x-powered-by', ERROR) /** @since 1.0.4-alpha.0 */ // [S5689] 🟢 📦 `express`, `helmet`
    .addRule('xml-parser-xxe', ERROR) /** @since 1.0.4-alpha.0 */ // [S2755] 🟢 📦 `libxmljs`
    .enableConfigTesterForPlugin('sonarjs', {
      // It looks like `code-eval` was accidentally re-introduced in v4.0.1 after removing in v4.0.0
      rulesToSkipInConfig: (ruleName) => ruleName === 'code-eval',
    })
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'sonar'>;

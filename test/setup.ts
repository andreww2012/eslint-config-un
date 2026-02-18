import {
  computeEslintConfig as computeEslintConfigImpl,
  testEslintConfig as testEslintConfigImpl,
} from './helpers/test-eslint-config';
import {findLintMessageFromLintResults as findLintMessageFromLintResultsImpl} from './helpers/check-lint-results';

/* eslint-disable vars-on-top */
declare global {
  var computeEslintConfig: typeof computeEslintConfigImpl;
  var testEslintConfig: typeof testEslintConfigImpl;
  var findLintMessageFromLintResults: typeof findLintMessageFromLintResultsImpl;
}
/* eslint-enable vars-on-top */

globalThis.computeEslintConfig = computeEslintConfigImpl;
globalThis.testEslintConfig = testEslintConfigImpl;
globalThis.findLintMessageFromLintResults = findLintMessageFromLintResultsImpl;

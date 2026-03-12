import {
  computeEslintConfig as computeEslintConfigImpl,
  testEslintConfig as testEslintConfigImpl,
} from './helpers/test-eslint-config';
import {findLintMessageFromLintResults as findLintMessageFromLintResultsImpl} from './helpers/check-lint-results';
import {
  getRuleSeverityFromEslintRuleEntry as getRuleSeverityFromEslintRuleEntryImpl,
  getAllRulesSeverities as getAllRulesSeveritiesImpl,
} from './helpers/eslint-config';
import {createFetchPackageInfoMock as createFetchPackageInfoMockImpl} from './helpers/module-mocks';

/* eslint-disable vars-on-top */
declare global {
  var computeEslintConfig: typeof computeEslintConfigImpl;
  var testEslintConfig: typeof testEslintConfigImpl;
  var findLintMessageFromLintResults: typeof findLintMessageFromLintResultsImpl;
  var getRuleSeverityFromEslintRuleEntry: typeof getRuleSeverityFromEslintRuleEntryImpl;
  var getAllRulesSeverities: typeof getAllRulesSeveritiesImpl;
  var createFetchPackageInfoMock: typeof createFetchPackageInfoMockImpl;
}
/* eslint-enable vars-on-top */

globalThis.computeEslintConfig = computeEslintConfigImpl;
globalThis.testEslintConfig = testEslintConfigImpl;
globalThis.findLintMessageFromLintResults = findLintMessageFromLintResultsImpl;
globalThis.getRuleSeverityFromEslintRuleEntry = getRuleSeverityFromEslintRuleEntryImpl;
globalThis.getAllRulesSeverities = getAllRulesSeveritiesImpl;
globalThis.createFetchPackageInfoMock = createFetchPackageInfoMockImpl;

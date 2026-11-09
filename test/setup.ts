import * as jestExtendedMatchers from 'jest-extended';
import {type MatchersObject, expect} from 'vitest';
import {expectConfigState as expectConfigStateImpl} from './helpers/basic-config';
import {findLintMessageFromLintResults as findLintMessageFromLintResultsImpl} from './helpers/check-lint-results';
import {
  getAllRulesSeverities as getAllRulesSeveritiesImpl,
  getRuleSeverityFromEslintRuleEntry as getRuleSeverityFromEslintRuleEntryImpl,
} from './helpers/eslint-config';
import {
  addInstalledPackages as addInstalledPackagesImpl,
  setInstalledPackages as setInstalledPackagesImpl,
} from './helpers/installed-packages';
import {spyOnProcessOutput as spyOnProcessOutputImpl} from './helpers/process-output';
import {
  computeEslintConfig as computeEslintConfigImpl,
  testEslintConfig as testEslintConfigImpl,
} from './helpers/test-eslint-config';

// The published matcher types describe the assertions they produce (`(...expected) => R`),
// not their real `(received, ...expected)` implementation shape
// eslint-disable-next-line un/no-type-assertion -- the published types describe assertions rather than matcher implementations
expect.extend(jestExtendedMatchers as unknown as MatchersObject);

// `jest-extended` only augments the global `jest` namespace, which Vitest no longer bridges into
// its own assertion type
declare module 'vitest' {
  interface Matchers<
    R extends void | Promise<void> = void | Promise<void>,
  > extends jest.Matchers<R> {}
}

vi.mock(import('../src/utils/package-detection'), async (importOriginal) => {
  // `vi.mock` is hoisted above the imports, so they may not be initialized when the factory runs
  const [{mockPackageDetection}, original] = await Promise.all([
    import('./helpers/installed-packages'),
    importOriginal(),
  ]);
  return mockPackageDetection(original);
});

beforeEach(() => {
  setInstalledPackagesImpl({eslint: '10.8.1'});
});

/* eslint-disable vars-on-top -- ambient globals are declarations rather than runtime variables */
declare global {
  var computeEslintConfig: typeof computeEslintConfigImpl;
  var testEslintConfig: typeof testEslintConfigImpl;
  var expectConfigState: typeof expectConfigStateImpl;
  var findLintMessageFromLintResults: typeof findLintMessageFromLintResultsImpl;
  var getRuleSeverityFromEslintRuleEntry: typeof getRuleSeverityFromEslintRuleEntryImpl;
  var getAllRulesSeverities: typeof getAllRulesSeveritiesImpl;
  var setInstalledPackages: typeof setInstalledPackagesImpl;
  var addInstalledPackages: typeof addInstalledPackagesImpl;
  var spyOnProcessOutput: typeof spyOnProcessOutputImpl;
}
/* eslint-enable vars-on-top -- the ambient globals block ends here */

globalThis.computeEslintConfig = computeEslintConfigImpl;
globalThis.testEslintConfig = testEslintConfigImpl;
globalThis.expectConfigState = expectConfigStateImpl;
globalThis.findLintMessageFromLintResults = findLintMessageFromLintResultsImpl;
globalThis.getRuleSeverityFromEslintRuleEntry = getRuleSeverityFromEslintRuleEntryImpl;
globalThis.getAllRulesSeverities = getAllRulesSeveritiesImpl;
globalThis.setInstalledPackages = setInstalledPackagesImpl;
globalThis.addInstalledPackages = addInstalledPackagesImpl;
globalThis.spyOnProcessOutput = spyOnProcessOutputImpl;

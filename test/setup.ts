// eslint-disable-next-line import/no-extraneous-dependencies
import * as jestExtendedMatchers from 'jest-extended';
// eslint-disable-next-line import/no-extraneous-dependencies
import {expect} from 'vitest';
import {expectConfigState as expectConfigStateImpl} from './helpers/basic-config';
import {findLintMessageFromLintResults as findLintMessageFromLintResultsImpl} from './helpers/check-lint-results';
import {
  getAllRulesSeverities as getAllRulesSeveritiesImpl,
  getRuleSeverityFromEslintRuleEntry as getRuleSeverityFromEslintRuleEntryImpl,
} from './helpers/eslint-config';
import {
  computeEslintConfig as computeEslintConfigImpl,
  testEslintConfig as testEslintConfigImpl,
} from './helpers/test-eslint-config';

expect.extend(jestExtendedMatchers);

type UtilsModule = typeof import('../src/utils');

const createFetchPackageInfoMock = vi.hoisted(
  () =>
    // eslint-disable-next-line unicorn/consistent-function-scoping -- must be placed inside `vi.hosted`
    (installedPackages: Record<string, string>, mod: UtilsModule): UtilsModule => ({
      ...mod,
      fetchPackageInfo: (packageName) => {
        const version = installedPackages[packageName];
        if (version == null) {
          return Promise.resolve(null);
        }

        const majorVersionRaw = Number.parseInt(version, 10);
        const majorVersion = Number.isNaN(majorVersionRaw) ? null : majorVersionRaw;
        const majorAndMinorVersionRaw = Number.parseFloat(version);
        const majorAndMinorVersion = Number.isNaN(majorAndMinorVersionRaw)
          ? null
          : majorAndMinorVersionRaw;
        return Promise.resolve({
          info: {name: packageName, version},
          versions: {full: version, major: majorVersion, majorAndMinor: majorAndMinorVersion},
        });
      },
      doesPackageExist: (packageName) => Promise.resolve(installedPackages[packageName] != null),
    }),
);

/**
 * The installed packages state is defined via `vi.hoisted` so it can be safely
 * referenced inside the `vi.mock` factory (which is hoisted above imports).
 *
 * By default, only `eslint` itself is considered installed.
 * Each spec file can call `addInstalledPackages` in a `beforeEach` to declare its own defaults.
 * Individual tests or describe blocks can use `setInstalledPackages` / `addInstalledPackages`
 * to fully replace or augment the installed package set.
 */
const {
  installedPackages,
  // eslint-disable-next-line ts/unbound-method -- safe
  setInstalledPackages: setInstalledPackagesImpl,
  // eslint-disable-next-line ts/unbound-method -- safe
  addInstalledPackages: addInstalledPackagesImpl,
} = vi.hoisted(() => {
  const installedPackages: Record<string, string> = {};

  return {
    installedPackages,
    setInstalledPackages(packages: Record<string, string>): void {
      for (const key of Object.keys(installedPackages)) {
        // eslint-disable-next-line ts/no-dynamic-delete
        delete installedPackages[key];
      }
      Object.assign(installedPackages, packages);
    },
    addInstalledPackages(packages: Record<string, string>): void {
      Object.assign(installedPackages, packages);
    },
  };
});

vi.mock(import('../src/utils'), async (importOriginal) => {
  const mod = await importOriginal();
  return createFetchPackageInfoMock(installedPackages, mod);
});

beforeEach(() => {
  setInstalledPackagesImpl({eslint: '9.39.2'});
});

/* eslint-disable vars-on-top */
declare global {
  var computeEslintConfig: typeof computeEslintConfigImpl;
  var testEslintConfig: typeof testEslintConfigImpl;
  var expectConfigState: typeof expectConfigStateImpl;
  var findLintMessageFromLintResults: typeof findLintMessageFromLintResultsImpl;
  var getRuleSeverityFromEslintRuleEntry: typeof getRuleSeverityFromEslintRuleEntryImpl;
  var getAllRulesSeverities: typeof getAllRulesSeveritiesImpl;
  var setInstalledPackages: typeof setInstalledPackagesImpl;
  var addInstalledPackages: typeof addInstalledPackagesImpl;
}
/* eslint-enable vars-on-top */

globalThis.computeEslintConfig = computeEslintConfigImpl;
globalThis.testEslintConfig = testEslintConfigImpl;
globalThis.expectConfigState = expectConfigStateImpl;
globalThis.findLintMessageFromLintResults = findLintMessageFromLintResultsImpl;
globalThis.getRuleSeverityFromEslintRuleEntry = getRuleSeverityFromEslintRuleEntryImpl;
globalThis.getAllRulesSeverities = getAllRulesSeveritiesImpl;
globalThis.setInstalledPackages = setInstalledPackagesImpl;
globalThis.addInstalledPackages = addInstalledPackagesImpl;

type PackageDetectionModule = typeof import('../../src/utils/package-detection');

/**
 * Packages that the package detection mock reports as installed.
 *
 * By default, only `eslint` itself is considered installed.
 * Each spec file can call `addInstalledPackages` in a `beforeEach` to declare its own defaults.
 * Individual tests or describe blocks can use `setInstalledPackages` / `addInstalledPackages`
 * to fully replace or augment the installed package set.
 *
 * It lives here rather than in the setup file because the setup file runs again before each test
 * file, while a worker running several test files in a row keeps this module and the mock loaded
 */
const installedPackages = new Map<string, string>();

export const addInstalledPackages = (packages: Record<string, string>) => {
  Object.entries(packages).forEach(([packageName, version]) => {
    installedPackages.set(packageName, version);
  });
};

export const setInstalledPackages = (packages: Record<string, string>) => {
  installedPackages.clear();
  addInstalledPackages(packages);
};

const fetchPackageInfo: PackageDetectionModule['fetchPackageInfo'] = (packageName) => {
  const version = installedPackages.get(packageName);
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
};

export const mockPackageDetection = (
  originalModule: PackageDetectionModule,
): PackageDetectionModule => ({
  ...originalModule,
  fetchPackageInfo,
  fetchProjectPackagesInfo: async (packageNames, options) => {
    const entries = await Promise.all(
      packageNames.map(async (packageName) => [
        packageName,
        await fetchPackageInfo(options?.aliases?.[packageName] || packageName),
      ]),
    );
    // eslint-disable-next-line un/no-type-assertion -- the entries cover every package
    return Object.fromEntries(entries) as Record<
      (typeof packageNames)[number],
      Awaited<ReturnType<typeof fetchPackageInfo>>
    >;
  },
});

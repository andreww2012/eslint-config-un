type UtilsModule = typeof import('../../src/utils');

export const createFetchPackageInfoMock = (
  installedPackages: Record<string, string>,
  mod: UtilsModule,
): UtilsModule => ({
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
});

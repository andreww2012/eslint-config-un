import semver from 'semver';
import {OPTIONAL_PEER_DEPENDENCIES} from '../plugins';
import {fetchPackageInfo, isIn} from '../utils';

export const checkIfModuleCorrectlyLoaded = async (
  moduleResult: {packageName: string; module: unknown} | null,
) => {
  const plugin = moduleResult?.module;
  if (moduleResult && isIn(moduleResult.packageName, OPTIONAL_PEER_DEPENDENCIES)) {
    const installedPluginVersion = plugin
      ? (await fetchPackageInfo(moduleResult.packageName))?.versions.full
      : null;
    const versionRange = OPTIONAL_PEER_DEPENDENCIES[moduleResult.packageName];
    if (
      !plugin ||
      (installedPluginVersion && !semver.satisfies(installedPluginVersion, versionRange))
    ) {
      return {
        name: moduleResult.packageName,
        versionRange,
        ...(installedPluginVersion && {installedVersion: installedPluginVersion}),
      };
    }
  }
  return null;
};

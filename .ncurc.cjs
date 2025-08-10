// @ts-check

const IGNORED_MAJOR_VERSION_TRANSITIONS = new Set([
  '@types/node',
  'angular-eslint-plugin-template15',
  'angular-eslint-plugin-template17',
  'angular-eslint-plugin18',
]);

/**
 * @type {import('npm-check-updates').RunOptions}
 */
module.exports = {
  dep: ['prod', 'dev', 'optional'],
  filterResults: (packageName, {currentVersionSemver, upgradedVersionSemver, upgradedVersion}) => {
    const currentMajorVersion = currentVersionSemver.find((v) => 'major' in v)?.major;
    const upgradedMajorVersion =
      upgradedVersionSemver?.major || upgradedVersion.split('@').at(-1)?.split('.')[0];
    // eslint-disable-next-line de-morgan/no-negated-conjunction
    return !(
      IGNORED_MAJOR_VERSION_TRANSITIONS.has(packageName) &&
      currentMajorVersion !== upgradedMajorVersion
    );
  },
};

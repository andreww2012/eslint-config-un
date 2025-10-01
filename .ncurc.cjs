// @ts-check

const semver = require('semver');
const packageJson = require('./package.json');

const IGNORED_RELEASE_ONLY_VERSION_TRANSITIONS = new Set(['@typescript/native-preview']);

const IGNORED_MAJOR_VERSION_TRANSITIONS = new Set([
  '@types/node',
  'angular-eslint-plugin-template15',
  'angular-eslint-plugin-template17',
  'angular-eslint-plugin18',
]);

const PACKAGE_GROUPS = Object.entries({
  'typescript-eslint': [null, 'typescript-eslint'],
  'angular-eslint': [null],
  jest: [null],
  'html-eslint': [null],
}).reduce(
  (result, [groupName, packagesInGroup]) =>
    Object.assign(
      result,
      Object.fromEntries(
        packagesInGroup.map((packageInGroup) => [
          packageInGroup == null ? `@${groupName}/*` : packageInGroup,
          `@${groupName}`,
        ]),
      ),
    ),
  {},
);

/**
 * @type {import('npm-check-updates').RunOptions}
 */
module.exports = {
  dep: ['prod', 'dev', 'optional'],

  filterResults: (
    packageName,
    {currentVersion: currentVersionRaw, upgradedVersion: upgradedVersionRaw},
  ) => {
    const [currentVersion, upgradedVersion] = [currentVersionRaw, upgradedVersionRaw].map((v) =>
      v.split('@').at(-1),
    );
    const [currentVersionSemver, upgradedVersionSemver] = [currentVersion, upgradedVersion].map(
      (v) => semver.parse(v),
    );
    return (
      // eslint-disable-next-line de-morgan/no-negated-conjunction
      !(
        IGNORED_MAJOR_VERSION_TRANSITIONS.has(packageName) &&
        currentVersionSemver?.major !== upgradedVersionSemver?.major
      ) &&
      // eslint-disable-next-line de-morgan/no-negated-conjunction
      !(
        IGNORED_RELEASE_ONLY_VERSION_TRANSITIONS.has(packageName) &&
        currentVersionSemver &&
        upgradedVersionSemver &&
        currentVersionSemver.major === upgradedVersionSemver.major &&
        currentVersionSemver.minor === upgradedVersionSemver.minor &&
        currentVersionSemver.patch === upgradedVersionSemver.patch &&
        JSON.stringify(currentVersionSemver.prerelease) !==
          JSON.stringify(upgradedVersionSemver.prerelease)
      )
    );
  },

  format: ['group'],
  interactive: true,
  groupFunction: (name) => {
    const [nameScope] = name.split('/');
    return (
      PACKAGE_GROUPS[name] ||
      PACKAGE_GROUPS[`${nameScope}/*`] ||
      (name in packageJson.devDependencies && !(name in packageJson.peerDependencies)
        ? '_3 Dev dependencies'
        : name in packageJson.peerDependencies
          ? '_2 Peer dependencies'
          : '_1 Direct dependencies')
    );
  },
};

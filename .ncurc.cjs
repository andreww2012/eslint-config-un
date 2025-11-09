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
  '@typescript-eslint': ['typescript-eslint'],
  '@angular-eslint': [],
  '@jest': [],
  '@html-eslint': [],
  '@cspell': ['cspell'],
  '@sveltejs': ['eslint-plugin-svelte', 'svelte-eslint-parser'],
  'eslint-plugin-vue': ['vue-eslint-parser'],
  'eslint-plugin-astro': ['astro-eslint-parser'],
  'eslint-plugin-ember': ['ember-eslint-parser'],
  '@eslint-react': ['eslint-plugin-react-debug'],
}).reduce(
  (result, [groupName, packagesInGroup]) =>
    Object.assign(
      result,
      Object.fromEntries([
        [groupName.startsWith('@') ? `${groupName}/*` : groupName, groupName],
        ...packagesInGroup.map((packageInGroup) => [packageInGroup, groupName]),
      ]),
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
      !(
        IGNORED_MAJOR_VERSION_TRANSITIONS.has(packageName) &&
        currentVersionSemver?.major !== upgradedVersionSemver?.major
      ) &&
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
  groupFunction: (fullName) => {
    const [nameScope] = fullName.split('/');
    const isPlugin =
      fullName.startsWith('eslint-plugin') ||
      fullName.startsWith('@eslint/') ||
      fullName.endsWith('/eslint-plugin');
    const groupNamePluginSuffix = isPlugin ? ' (plugins)' : '';
    const groupNumberStartsWith = 3 * (isPlugin ? 0 : 1);
    return (
      PACKAGE_GROUPS[fullName] ||
      PACKAGE_GROUPS[`${nameScope}/*`] ||
      (fullName in packageJson.devDependencies && !(fullName in packageJson.peerDependencies)
        ? `${3 + groupNumberStartsWith} Dev dependencies${groupNamePluginSuffix}`
        : fullName in packageJson.peerDependencies
          ? `${2 + groupNumberStartsWith} Peer dependencies${groupNamePluginSuffix}`
          : `${1 + groupNumberStartsWith} Direct dependencies${groupNamePluginSuffix}`)
    );
  },
};

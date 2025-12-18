// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const semver = require('semver');
const packageJson = require('./package.json');

const CACHE_DIRECTORY = path.join(__dirname, 'node_modules/.cache/npm-check-updates');
fs.mkdirSync(CACHE_DIRECTORY, {recursive: true});

const SCOPED_ESLINT_PACKAGES_NOT_PLUGINS = new Set(['config-inspector', 'compat']);

const PLUGINS_PUBLISHED_FROM_MONOREPO_WITH_PACKAGES_UNRELATED_TO_ESLINT = new Set([
  '@cspell/eslint-plugin',
  '@next/eslint-plugin-next',
  '@nx/eslint-plugin',
  '@unocss/eslint-plugin',
  'eslint-plugin-storybook',
  'eslint-plugin-turbo',
]);

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

  cache: true,
  cacheExpiration: 30,
  cacheFile: path.join(CACHE_DIRECTORY, 'cache.json'),

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
    const [nameScope, nameWithoutScope = ''] = fullName.split('/');
    const knownGroupName = PACKAGE_GROUPS[fullName] || PACKAGE_GROUPS[`${nameScope}/*`];

    if (knownGroupName) {
      return `3. ${knownGroupName} (🟢🟡 plugins and/or non-plugins)`;
    }

    const isPlugin =
      fullName.startsWith('eslint-plugin-') ||
      nameWithoutScope.startsWith('eslint-plugin') ||
      (nameScope === '@eslint' && !SCOPED_ESLINT_PACKAGES_NOT_PLUGINS.has(nameWithoutScope));
    const isParser = fullName.endsWith('-eslint-parser') || fullName.endsWith('-eslint/parser');
    const isPublishedFromMonorepoWithPackagesUnrelatedToEslint =
      PLUGINS_PUBLISHED_FROM_MONOREPO_WITH_PACKAGES_UNRELATED_TO_ESLINT.has(fullName);

    const groupNamePluginSuffix = `${isPlugin ? '(🟢 plugin(s))' : isParser ? '(🟢 parser(s))' : '(🟡 non-plugin/parser(s))'}${isPublishedFromMonorepoWithPackagesUnrelatedToEslint ? ' (🔴 updates might be fake)' : ''}`;

    /**
     * @param {number} base Base group number
     * @param {string} name Group name
     */
    const generateGroupName = (base, name) =>
      `${base + 3 * (isPlugin ? 0 : 1) + (isPlugin ? -1 : 0)}${isPublishedFromMonorepoWithPackagesUnrelatedToEslint ? '.1' : ''} ${name} ${groupNamePluginSuffix}`;

    return fullName in packageJson.devDependencies && !(fullName in packageJson.peerDependencies)
      ? generateGroupName(3, 'Dev dependencies')
      : fullName in packageJson.peerDependencies
        ? generateGroupName(2, 'Peer dependencies')
        : generateGroupName(1, 'Direct dependencies');
  },
};

// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const semver = require('semver');
const packageJson = require('./package.json');

// TODO mark `eslint-plugin-storybook` as requiring full reinstallation to avoid missing peer dependency warning

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
  'eslint-plugin-formatjs',
]);

const IGNORED_RELEASE_ONLY_VERSION_TRANSITIONS = new Set();

const IGNORED_MAJOR_VERSION_TRANSITIONS = new Set([
  '@eslint/core0',
  '@types/node',
  'angular-eslint-plugin-template15',
  'angular-eslint-plugin-template17',
  'angular-eslint-plugin18',
]);

const PACKAGE_GROUPS = Object.entries({
  'Package manager': {packages: ['pnpm'], special: true},
  tsgo: {packages: ['@typescript/native-preview'], special: true},

  '@typescript-eslint': {packages: ['typescript-eslint']},
  '@angular-eslint': {packages: []},
  '@jest': {packages: []},
  '@html-eslint': {packages: []},
  '@sveltejs': {packages: ['eslint-plugin-svelte', 'svelte-eslint-parser']},
  '@tsrx': {packages: []},
  'eslint-plugin-vue': {packages: ['vue-eslint-parser']},
  'eslint-plugin-astro': {packages: ['astro-eslint-parser']},
  'eslint-plugin-ember': {packages: ['ember-eslint-parser']},
  '@eslint-react': {packages: ['eslint-plugin-react-debug']},
}).reduce((result, [groupName, {packages: packagesInGroup, ...groupMeta}]) => {
  const groupInfo = {
    groupName,
    ...groupMeta,
  };

  const packagesInCurrentGroup = Object.fromEntries([
    [groupName.startsWith('@') ? `${groupName}/*` : groupName, groupInfo],
    ...packagesInGroup.map((packageInGroup) => [packageInGroup, groupInfo]),
  ]);

  return Object.assign(result, packagesInCurrentGroup);
}, {});

/**
 * @type {import('npm-check-updates').RunOptions}
 */
module.exports = {
  cache: true,
  cacheExpiration: 30,
  cacheFile: path.join(CACHE_DIRECTORY, 'cache.json'),

  // Fixes https://github.com/raineorshine/npm-check-updates/blob/55ee69bc7a9d7a786537b3359924af9784a112ae/CHANGELOG.md#how-to-opt-out-of-the-new-behavior
  target: '@latest',

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
        IGNORED_RELEASE_ONLY_VERSION_TRANSITIONS /* eslint-disable-line sonarjs/no-empty-collection */.has(
          packageName,
        ) &&
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
    const knownGroup = PACKAGE_GROUPS[fullName] || PACKAGE_GROUPS[`${nameScope}/*`];

    if (knownGroup) {
      if (knownGroup.special) {
        return `✨ ${knownGroup.groupName}`;
      }
      return `3. ${knownGroup.groupName} (🟢🟡 plugins and/or non-plugins)`;
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

// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import {defineConfig} from 'npm-check-updates';
import semver from 'semver';
import packageJson from './package.json' with {type: 'json'};

const CACHE_DIRECTORY = path.join(import.meta.dirname, 'node_modules/.cache/npm-check-updates');
// eslint-disable-next-line unicorn/no-top-level-side-effects
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

const ESLINT_PLUGINS_WITH_UNCONVENTIONAL_NAMES = new Set(['eslint-mdx', 'import-integrity-lint']);

const ESLINT_RELATED_PACKAGES_WITH_UNCONVENTIONAL_NAMES = new Set(['tailwind-csstree']);

const IGNORED_RELEASE_ONLY_VERSION_TRANSITIONS = new Set();

const PACKAGES_WITH_PINNED_MAJOR_VERSION = new Set([
  '@eslint/core0',
  '@types/node',
  'angular-eslint-plugin-template15',
  'angular-eslint-plugin-template17',
  'angular-eslint-plugin18',
  'eslint',
]);

const PACKAGES_ON_PRERELEASE_CHANNEL = new Set(['all-contributors-cli']);

const PACKAGE_GROUPS = Object.entries({
  'Package manager': {packages: ['pnpm'], nonEslint: true},
  tsgo: {packages: ['@typescript/native-preview'], nonEslint: true},
  '@effect': {packages: ['effect'], nonEslint: true},
  '@vitest': {packages: ['vitest'], excludePackages: ['eslint-plugin'], nonEslint: true},

  '@typescript-eslint': {packages: ['typescript-eslint']},
  '@angular-eslint': {packages: []},
  '@eslint-react': {packages: ['eslint-plugin-react-debug']},
  '@html-eslint': {packages: []},
  '@jest': {packages: []},
  '@sveltejs': {packages: ['eslint-plugin-svelte', 'svelte-eslint-parser']},
  '@tsrx': {packages: []},
  'eslint-plugin-vue': {packages: ['vue-eslint-parser']},
  'eslint-plugin-astro': {packages: ['astro-eslint-parser']},
  'eslint-plugin-ember': {packages: ['ember-eslint-parser']},
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

export default defineConfig({
  cache: true,
  cacheExpiration: 30,
  cacheFile: path.join(CACHE_DIRECTORY, 'cache.json'),

  target: (packageName) => {
    if (PACKAGES_WITH_PINNED_MAJOR_VERSION.has(packageName)) {
      return 'minor';
    }

    // `@latest` fixes https://github.com/raineorshine/npm-check-updates/blob/55ee69bc7a9d7a786537b3359924af9784a112ae/CHANGELOG.md#how-to-opt-out-of-the-new-behavior
    return PACKAGES_ON_PRERELEASE_CHANNEL.has(packageName) ? 'greatest' : '@latest';
  },

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
      (!PACKAGES_WITH_PINNED_MAJOR_VERSION.has(packageName) ||
        currentVersionSemver?.major === upgradedVersionSemver?.major) &&
      (!IGNORED_RELEASE_ONLY_VERSION_TRANSITIONS /* eslint-disable-line sonarjs/no-empty-collection */.has(
        packageName,
      ) ||
        !(
          currentVersionSemver &&
          upgradedVersionSemver &&
          currentVersionSemver.major === upgradedVersionSemver.major &&
          currentVersionSemver.minor === upgradedVersionSemver.minor &&
          currentVersionSemver.patch === upgradedVersionSemver.patch
        ) ||
        JSON.stringify(currentVersionSemver.prerelease) ===
          JSON.stringify(upgradedVersionSemver.prerelease))
    );
  },

  format: ['group'],
  interactive: true,
  groupFunction: (fullName) => {
    const [nameScope, nameWithoutScope = ''] = fullName.split('/', 2);

    let knownGroup = PACKAGE_GROUPS[fullName] || PACKAGE_GROUPS[`${nameScope}/*`];
    if (knownGroup?.excludePackages?.includes(nameWithoutScope)) {
      knownGroup = null;
    }

    if (knownGroup) {
      if (knownGroup.nonEslint) {
        return `✨ ${knownGroup.groupName}`;
      }
      return `3. ${knownGroup.groupName} (🟡 ESLint related)`;
    }

    const isPlugin =
      fullName.startsWith('eslint-plugin-') ||
      nameWithoutScope.startsWith('eslint-plugin') ||
      (nameScope === '@eslint' && !SCOPED_ESLINT_PACKAGES_NOT_PLUGINS.has(nameWithoutScope)) ||
      ESLINT_PLUGINS_WITH_UNCONVENTIONAL_NAMES.has(fullName);
    const isParser = fullName.endsWith('-eslint-parser') || fullName.endsWith('-eslint/parser');
    const isPublishedFromMonorepoWithPackagesUnrelatedToEslint =
      PLUGINS_PUBLISHED_FROM_MONOREPO_WITH_PACKAGES_UNRELATED_TO_ESLINT.has(fullName);

    const groupNamePluginSuffix = `${isPlugin || isParser ? '(🟢 ESLint plugins/parsers)' : fullName.includes('eslint') || ESLINT_RELATED_PACKAGES_WITH_UNCONVENTIONAL_NAMES.has(fullName) ? '🔵 (ESLint related)' : '(⚪️ non-ESLint related)'}${isPublishedFromMonorepoWithPackagesUnrelatedToEslint ? ' (⚠️ monorepo release)' : ''}`;

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
});

// @ts-check
import {ncuConfig} from '@andreww2012/npm-check-updates-config';
import {tryParse} from 'verkit';
import packageJson from './package.json' with {type: 'json'};

/** @type {ReadonlySet<string>} */
const SCOPED_ESLINT_PACKAGES_NOT_PLUGINS = new Set(['config-inspector', 'compat']);

/** @type {ReadonlySet<string>} */
const PLUGINS_PUBLISHED_FROM_MONOREPO_WITH_PACKAGES_UNRELATED_TO_ESLINT = new Set([
  '@cspell/eslint-plugin',
  '@docusaurus/eslint-plugin',
  '@next/eslint-plugin-next',
  '@ngrx/eslint-plugin',
  '@nx/eslint-plugin',
  '@tanstack/eslint-plugin-query',
  '@tanstack/eslint-plugin-router',
  '@tanstack/eslint-plugin-start',
  '@unhead/eslint-plugin',
  '@unocss/eslint-plugin',
  'eslint-plugin-drizzle',
  'eslint-plugin-expo',
  'eslint-plugin-formatjs',
  'eslint-plugin-lit-a11y',
  'eslint-plugin-mobx',
  'eslint-plugin-qwik',
  'eslint-plugin-react-hooks',
  'eslint-plugin-storybook',
  'eslint-plugin-turbo',
]);

/** @type {ReadonlySet<string>} */
const ESLINT_PLUGINS_WITH_UNCONVENTIONAL_NAMES = new Set([
  'eslint-cssicorn',
  'eslint-mdx',
  'eslint-soml',
  'import-integrity-lint',
]);

/** @type {ReadonlySet<string>} */
const ESLINT_RELATED_PACKAGES_WITH_UNCONVENTIONAL_NAMES = new Set([
  '@humanwhocodes/scsstree',
  'browserslist',
  'is-immutable-type',
  'shiki',
  'stylelint-config-clean-order',
  'stylelint-config-recess-order',
  'tailwind-csstree',
]);

/** @type {ReadonlySet<string>} */
const IGNORED_RELEASE_ONLY_VERSION_TRANSITIONS = new Set();

// Unlike real package names, aliases can't be given a target
/** @type {ReadonlySet<string>} */
const ALIASES_WITH_PINNED_MAJOR_VERSION = new Set([
  'angular-eslint-plugin-template15',
  'angular-eslint-plugin-template17',
  'angular-eslint-plugin18',
]);

const ALL_DEPENDENCY_NAMES = Object.keys({
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
  ...packageJson.peerDependencies,
});

const ESLINT_GROUP = Object.freeze({icon: '🟡', priority: 3});
const NON_ESLINT_GROUP = Object.freeze({icon: '✨', priority: null});

/** @param {string} packageName Real package name, not an alias */
const isEslintPlugin = (packageName) => {
  const [nameScope, nameWithoutScope = ''] = packageName.split('/', 2);
  return (
    packageName.startsWith('eslint-plugin-') ||
    nameWithoutScope.startsWith('eslint-plugin') ||
    (nameScope === '@eslint' && !SCOPED_ESLINT_PACKAGES_NOT_PLUGINS.has(nameWithoutScope)) ||
    ESLINT_PLUGINS_WITH_UNCONVENTIONAL_NAMES.has(packageName)
  );
};

/**
 * A scope group would also take in the scope's plugins, which are reviewed one by one
 * @param {string} scope Like `@eslint`
 * @param {string[]} packages Extra packages of the group
 */
const getScopePackagesWithoutPlugins = (scope, ...packages) => [
  ...packages,
  ...ALL_DEPENDENCY_NAMES.filter(
    (packageName) => packageName.startsWith(`${scope}/`) && !isEslintPlugin(packageName),
  ),
];

export default ncuConfig({
  cwd: import.meta.dirname,

  // `@latest` fixes https://github.com/raineorshine/npm-check-updates/blob/55ee69bc7a9d7a786537b3359924af9784a112ae/CHANGELOG.md#how-to-opt-out-of-the-new-behavior
  target: '@latest',
  targets: {
    eslint: 'minor',

    // Prerelease channel
    '@effect/platform-node': 'greatest',
    'all-contributors-cli': 'greatest',
    effect: 'greatest',
  },
  blockedVersions: {},

  filterResults: (packageName, {currentVersion, upgradedVersion}) => {
    const [currentVersionSemver, upgradedVersionSemver] = [currentVersion, upgradedVersion].map(
      (version) => tryParse(version.split('@').at(-1) || ''),
    );
    return (
      (!ALIASES_WITH_PINNED_MAJOR_VERSION.has(packageName) ||
        currentVersionSemver?.major === upgradedVersionSemver?.major) &&
      (!IGNORED_RELEASE_ONLY_VERSION_TRANSITIONS /* eslint-disable-line sonar/no-empty-collection */
        .has(packageName) ||
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

  groups: {
    '@cspell': false,
    '@eslint': false,
    '@vitest': false,
    cspell: {...NON_ESLINT_GROUP, packages: getScopePackagesWithoutPlugins('@cspell', 'cspell')},
    vitest: {...NON_ESLINT_GROUP, packages: getScopePackagesWithoutPlugins('@vitest', 'vitest')},
    tsgo: {...NON_ESLINT_GROUP, packages: ['@typescript/native-preview']},
    '@commitlint': NON_ESLINT_GROUP,
    '@effect': {...NON_ESLINT_GROUP, packages: ['effect']},

    ESLint: {...ESLINT_GROUP, packages: getScopePackagesWithoutPlugins('@eslint', 'eslint')},
    '@typescript-eslint': {...ESLINT_GROUP, packages: ['typescript-eslint']},
    '@angular-eslint': ESLINT_GROUP,
    '@eslint-react': {...ESLINT_GROUP, packages: ['eslint-plugin-react-debug']},
    '@html-eslint': ESLINT_GROUP,
    '@jest': ESLINT_GROUP,
    '@sveltejs': {...ESLINT_GROUP, packages: ['eslint-plugin-svelte', 'svelte-eslint-parser']},
    '@tsrx': ESLINT_GROUP,
    'eslint-plugin-vue': {...ESLINT_GROUP, packages: ['vue-eslint-parser']},
    'eslint-plugin-astro': {...ESLINT_GROUP, packages: ['astro-eslint-parser']},
    'eslint-plugin-ember': {...ESLINT_GROUP, packages: ['ember-eslint-parser']},
  },
  groupFunction: (packageName) => {
    const isPlugin = isEslintPlugin(packageName);
    const isParser =
      packageName.endsWith('-eslint-parser') || packageName.endsWith('-eslint/parser');
    const isPublishedFromMonorepoWithPackagesUnrelatedToEslint =
      PLUGINS_PUBLISHED_FROM_MONOREPO_WITH_PACKAGES_UNRELATED_TO_ESLINT.has(packageName);

    const groupNamePluginSuffix = `${isPlugin || isParser ? '(🟢 ESLint plugins/parsers)' : packageName.includes('eslint') || ESLINT_RELATED_PACKAGES_WITH_UNCONVENTIONAL_NAMES.has(packageName) ? '🔵 (ESLint related)' : '(⚪️ non-ESLint related)'}${isPublishedFromMonorepoWithPackagesUnrelatedToEslint ? ' (⚠️ monorepo release)' : ''}`;

    /**
     * @param {number} base Base group number
     * @param {string} name Group name
     */
    const generateGroupName = (base, name) =>
      `${base + 3 * (isPlugin ? 0 : 1) + (isPlugin ? -1 : 0)}${isPublishedFromMonorepoWithPackagesUnrelatedToEslint ? '.1' : ''} ${name} ${groupNamePluginSuffix}`;

    return packageName in packageJson.devDependencies &&
      !(packageName in packageJson.peerDependencies)
      ? generateGroupName(3, 'Dev dependencies')
      : packageName in packageJson.peerDependencies
        ? generateGroupName(2, 'Peer dependencies')
        : generateGroupName(1, 'Direct dependencies');
  },
});

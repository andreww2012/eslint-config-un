// @ts-check

const IGNORED_MAJOR_VERSION_TRANSITIONS = new Set(['@types/node']);

/**
 * @type {import('npm-check-updates').RunOptions}
 */
module.exports = {
  filterResults: (packageName, {currentVersionSemver, upgradedVersionSemver}) =>
    // eslint-disable-next-line de-morgan/no-negated-conjunction
    !(
      currentVersionSemver[0]?.major !== upgradedVersionSemver?.major &&
      IGNORED_MAJOR_VERSION_TRANSITIONS.has(packageName)
    ),
};

import {ERROR, OFF} from '../constants';
import type {GetRuleOptions} from '../eslint';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

export interface LockfileEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, 'lockfile'> {
  /**
   * Ensure that all packages in lockfiles are downloaded from trusted registries.
   *
   * If set to `true`, only the official npm registry (`https://registry.npmjs.org`)
   * will be allowed.
   *
   * Affected rule:
   * - [`registry`](https://github.com/ljharb/lockfile-tools/blob/HEAD/packages/eslint-plugin/docs/rules/registry.md)
   * @default false
   */
  enforceAllowedRegistries?: boolean | GetRuleOptions<'lockfile', 'registry'>;

  /**
   * Not enforced by default.
   *
   * Affected rule:
   * - [`version`](https://github.com/ljharb/lockfile-tools/blob/HEAD/packages/eslint-plugin/docs/rules/version.md)
   */
  enforceLockfileVersion?: GetRuleOptions<'lockfile', 'version'>;

  /**
   * Enforces that lockfiles from package manager(s) not specified here are not permitted.
   *
   * Affected rule:
   * - [`flavor`](https://github.com/ljharb/lockfile-tools/blob/HEAD/packages/eslint-plugin/docs/rules/flavor.md)
   */
  enforcePackageManager?: GetRuleOptions<'lockfile', 'flavor'>;

  /**
   * Warn when dependencies in lockfiles are pulled from non-registry sources
   * such as GitHub URLs, tarball URLs, git URLs, or file paths rather than proper npm registries.
   *
   * You may specify a boolean value to enable or disable the rule or an object to configure it.
   *
   * Affected rule:
   * - [`non-registry-specifiers`](https://github.com/ljharb/lockfile-tools/blob/HEAD/packages/eslint-plugin/docs/rules/non-registry-specifiers.md)
   * @default true
   */
  noNonRegistryDependencySpecifiers?:
    | boolean
    | GetRuleOptions<'lockfile', 'non-registry-specifiers'>;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    noNonRegistryDependencySpecifiers: true,
  } satisfies Partial<LockfileEslintConfigOptions>);

  const {
    enforceAllowedRegistries,
    enforceLockfileVersion,
    enforcePackageManager,
    noNonRegistryDependencySpecifiers,
  } = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'lockfile');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'lockfile',
      {
        includeDefaultFilesAndIgnores: true,
        filesDefault: [
          '**/package-lock.json',
          '**/yarn.lock',
          '**/pnpm-lock.yaml',
          '**/bun.lock',
          '**/bun.lockb',
          '**/vlt-lock.json',
        ],
      },
    ])
    .addRule('binary-conflicts', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule(
      'flavor',
      enforcePackageManager == null ? OFF : ERROR,
      enforcePackageManager == null ? [] : [enforcePackageManager],
    ) /** @since 1.0.0 */ // 🟢
    .addRule('integrity', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule(
      'non-registry-specifiers',
      noNonRegistryDependencySpecifiers ? ERROR : OFF,
      typeof noNonRegistryDependencySpecifiers === 'object'
        ? [noNonRegistryDependencySpecifiers]
        : [],
    ) /** @since 1.0.0 */ // 🟢
    .addRule(
      'registry',
      enforceAllowedRegistries ? ERROR : OFF,
      typeof enforceAllowedRegistries === 'object' ? [enforceAllowedRegistries] : [],
    ) /** @since 1.0.0 */ // 🟢
    .addRule(
      'version',
      enforceLockfileVersion ? ERROR : OFF,
      enforceLockfileVersion ? [enforceLockfileVersion] : [],
    ) /** @since 1.0.0 */ // 🟢
    .enableConfigTesterForPlugin('lockfile')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'lockfile'>;

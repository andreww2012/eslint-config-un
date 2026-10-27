import type {ParsingLanguagesWithDialects} from '../config-un/parsing';
import {ERROR, GLOB_PACKAGE_JSON, OFF} from '../constants';
import type {OmitStrict, Prettify} from '../types';
import {
  type MaybeArray,
  arrayify,
  getKeysOfTruthyValues,
  isKeyIn,
  objectEntriesUnsafe,
} from '../utils';
import {
  type ExtraPluginsType,
  type GetRuleNamesInPlugin,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  type UnRulesConfigPartial,
  assignDefaults,
  defineUnConfig,
} from './index';

const LOCKFILE_RULES_FOR_PACKAGE_JSON = [
  'no-weakening-config',
  'tracked',
] as const satisfies readonly GetRuleNamesInPlugin<'lockfile'>[];

const LOCKFILE_RULES_FOR_PACKAGE_JSON_SET: ReadonlySet<string> = new Set(
  LOCKFILE_RULES_FOR_PACKAGE_JSON,
);

type SupportedPackageManagers = Extract<GetRuleOptions<'lockfile', 'flavor'>, string>;

/**
 * An ESLint plugin to lint npm ecosystem lockfiles for security and consistency issues.
 *
 * 📁 Default `files`: <code>**&#47;package-lock.json</code>,
 * <code>**&#47;npm-shrinkwrap.json</code>,
 * <code>**&#47;yarn.lock</code>, <code>**&#47;pnpm-lock.yaml</code>, <code>**&#47;bun.lock</code>,
 * <code>**&#47;bun.lockb</code>, <code>**&#47;vlt-lock.json</code>
 *
 * ⚠️ Note: specified `files` will be naively analyzed for lockfile types and corresponding parser
 * configs (named `lockfile/parser/{json,jsonc,plain,yaml}`) will be created for matched entries
 */
export interface LockfileEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<
  ExtraPlugins,
  Prettify<
    OmitStrict<
      UnRulesConfigPartial<'lockfile'>,
      `lockfile/${(typeof LOCKFILE_RULES_FOR_PACKAGE_JSON)[number]}`
    >
  >
> {
  /**
   * Rules specific to `package.json` files.
   *
   * 📁 Default `files`: <code>**&#47;package.json</code>
   * @default true
   */
  configPackageJson?:
    | boolean
    | UnFlatConfigEntryBase<
        ExtraPlugins,
        Prettify<
          Pick<
            UnRulesConfigPartial<'lockfile'>,
            `lockfile/${(typeof LOCKFILE_RULES_FOR_PACKAGE_JSON)[number]}`
          >
        >
      >;

  /**
   * Ensure that all packages in lockfiles are downloaded from trusted registries.
   *
   * If set to `true`, only the official npm registry (`https://registry.npmjs.org`) will be
   * allowed.
   *
   * Affected rule:
   * - [`lockfile/registry`](https://github.com/ljharb/lockfile-tools/blob/HEAD/packages/eslint-plugin/docs/rules/registry.md)
   * @default false
   */
  enforceAllowedRegistries?: boolean | GetRuleOptions<'lockfile', 'registry'>;

  /**
   * Not enforced by default.
   *
   * Affected rule:
   * - [`lockfile/version`](https://github.com/ljharb/lockfile-tools/blob/HEAD/packages/eslint-plugin/docs/rules/version.md)
   */
  enforceLockfileVersion?: GetRuleOptions<'lockfile', 'version'>;

  /**
   * Enforces that lockfiles from package manager(s) not specified here are not permitted.
   * Not enforced by default.
   *
   * Affected rule:
   * - [`lockfile/flavor`](https://github.com/ljharb/lockfile-tools/blob/HEAD/packages/eslint-plugin/docs/rules/flavor.md)
   */
  enforcePackageManager?: GetRuleOptions<'lockfile', 'flavor'>;

  /**
   * Warn when dependencies in lockfiles are pulled from non-registry sources such as GitHub URLs,
   * tarball URLs, git URLs, or file paths rather than proper npm registries.
   *
   * You may specify a boolean value to enable or disable the rule or an object to configure it.
   *
   * Affected rule:
   * - [`lockfile/non-registry-specifiers`](https://github.com/ljharb/lockfile-tools/blob/HEAD/packages/eslint-plugin/docs/rules/non-registry-specifiers.md)
   * @default true
   */
  noNonRegistryDependencySpecifiers?:
    | boolean
    | GetRuleOptions<'lockfile', 'non-registry-specifiers'>;

  /**
   * The package manager(s) this project uses.
   * Needed for some rules in order to behave correctly.
   *
   * Detected automatically with
   * [`package-manager-detector`](https://npmx.dev/package-manager-detector).
   *
   * If PM(s) are neither specified here nor detected, the affected rules are disabled, since they
   * would otherwise assume `npm` and may report incorrectly.
   *
   * Affected rule:
   * - [`lockfile/tracked`](https://github.com/ljharb/lockfile-tools/blob/HEAD/packages/eslint-plugin/docs/rules/tracked.md)
   */
  packageManager?: MaybeArray<SupportedPackageManagers>;

  /**
   * Valid [`npm-package-arg` registry specifiers](https://npmx.dev/npm-package-arg) to ignore
   * packages that will be allowed to be installed with their own lockfiles (aka shrinkwrap files).
   *
   * Affected rule:
   * - [`lockfile/shrinkwrap`](https://github.com/ljharb/lockfile-tools/blob/HEAD/packages/eslint-plugin/docs/rules/shrinkwrap.md)
   */
  packageSpecifiersToAllowLockfilesFor?: Record<string, boolean>;
}

const LOCKFILE_LANGUAGES = {
  json: ['jsonc', 'json'],
  jsonc: ['jsonc', 'jsonc'],
  yaml: 'yaml',
  plain: 'plain',
} as const satisfies Record<string, ParsingLanguagesWithDialects>;

const LOCKFILES_INFO_MAP: Readonly<
  Record<
    SupportedPackageManagers,
    Readonly<Record<string /* Lockfile name */, keyof typeof LOCKFILE_LANGUAGES>>
  >
> = {
  npm: {
    'package-lock.json': 'json',
    'npm-shrinkwrap.json': 'json',
  },
  yarn: {
    'yarn.lock': 'yaml',
  },
  pnpm: {
    'pnpm-lock.yaml': 'yaml',
  },
  bun: {
    'bun.lock': 'jsonc',
    'bun.lockb': 'plain',
  },
  vlt: {
    'vlt-lock.json': 'json',
  },
};

const LOCKFILE_LANGUAGE_BY_NAME = Object.freeze(
  Object.values(LOCKFILES_INFO_MAP).flatMap((lockfiles) => objectEntriesUnsafe(lockfiles)),
);

export default defineUnConfig<LockfileEslintConfigOptions>('lockfile', {
  enabledBy: {group: 'misc'},
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configPackageJson: true,
    noNonRegistryDependencySpecifiers: true,
  });

  const {
    configPackageJson,
    enforceAllowedRegistries,
    enforceLockfileVersion,
    enforcePackageManager,
    noNonRegistryDependencySpecifiers,
    packageManager,
    packageSpecifiersToAllowLockfilesFor,
  } = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'lockfile');

  // Legend:
  // 🟢 - in recommended

  const lockfileEslintConfig = configBuilder
    ?.addConfig([
      'lockfile',
      {
        filesDefault: LOCKFILE_LANGUAGE_BY_NAME.map(([lockfile]) => `**/${lockfile}`),
        parsingIgnoresInheritedFrom: ['jsonc', 'yaml'],
      },
    ])
    .addRule('binary-conflicts', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule(
      'flavor',
      enforcePackageManager == null ? OFF : ERROR,
      enforcePackageManager == null ? [] : [enforcePackageManager],
    ) /** @since 1.0.0 */ // 🟢
    .addRule('integrity', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('manifest-sync', ERROR) /** @since 2.1.0 */ // 🟢
    .addRule('minimum-release-age', OFF) /** @since 2.1.0 */ // 🟢
    .addRule('name-matches-resolved', ERROR) /** @since 2.1.0 */ // 🟢
    .addRule('no-install-scripts', ERROR) /** @since 2.1.0 */ // 🟢
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
    .addRule('shrinkwrap', ERROR, [
      getKeysOfTruthyValues(packageSpecifiersToAllowLockfilesFor),
    ]) /** @since 1.1.0 */ // 🟢
    .addRule(
      'version',
      enforceLockfileVersion ? ERROR : OFF,
      enforceLockfileVersion ? [enforceLockfileVersion] : [],
    ) /** @since 1.0.0 */ // 🟢
    .enableConfigTesterForPlugin('lockfile', {
      /* v8 ignore next */
      rulesToSkipInConfig: (ruleName) => LOCKFILE_RULES_FOR_PACKAGE_JSON_SET.has(ruleName),
    })
    .addOverrides().config;

  objectEntriesUnsafe(
    Object.groupBy(
      lockfileEslintConfig?.files?.flat() || [],
      (fileGlob) =>
        LOCKFILE_LANGUAGE_BY_NAME.find(([lockfile]) => fileGlob.endsWith(lockfile))?.[1] || '',
    ),
  ).forEach(([languageName, globs = []]) => {
    if (!languageName) {
      context.logger.warn(
        `The following file globs in the \`lockfile\` config could not be associated with a known package manager and may not be parsed correctly: ${globs.join(
          ', ',
        )}`,
      );
      return;
    }

    configBuilder?.addConfig([
      `lockfile/parser/${languageName}`,
      {
        applyUserFilesAndIgnores: false,
        filesDefault: globs,
        ignoresInternal: {
          yaml: false,
        },
        parseWith: LOCKFILE_LANGUAGES[languageName],
      },
    ]);
  });

  const packageManagerDetected = context.meta.usedPackageManager?.name;
  const packageManagerFinal = arrayify(
    packageManager ||
      (packageManagerDetected != null && isKeyIn(packageManagerDetected, LOCKFILES_INFO_MAP)
        ? packageManagerDetected
        : null),
  );

  const configBuilderPackageJson = context.createConfigBuilder(configPackageJson, 'lockfile');
  configBuilderPackageJson
    ?.addConfig([
      'lockfile/package.json',
      {
        filesDefault: [GLOB_PACKAGE_JSON],
        parseWith: ['jsonc', 'json'],
      },
    ])
    .addRule('no-weakening-config', ERROR) /** @since 2.1.0 */ // 🟢
    .addRule(
      'tracked',
      packageManagerFinal.length > 0 ? ERROR : OFF,
      packageManagerFinal.length > 0 ? [packageManagerFinal] : [],
    ) /** @since 1.4.0 */ // 🟢
    .enableConfigTesterForPlugin('lockfile', {
      /* v8 ignore next */
      rulesToSkipInConfig: (ruleName) => !LOCKFILE_RULES_FOR_PACKAGE_JSON_SET.has(ruleName),
    })
    .addOverrides();
});

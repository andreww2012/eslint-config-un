import type {SupportedEslintPluginLanguages} from '../config-un/config-entry-builder';
import {ERROR, OFF} from '../constants';
import type {ParserPrefix} from '../loaders';
import {getKeysOfTruthyValues, groupBy, objectEntriesUnsafe} from '../utils';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

type SupportedPackageManagers = Extract<GetRuleOptions<'lockfile', 'flavor'>, string>;

export interface LockfileEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'lockfile'> {
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

  /**
   * Valid [`npm-package-arg` registry specifiers](https://www.npmx.dev/npm-package-arg)
   * to ignore packages that will be allowed to be installed with their own lockfiles
   * (aka shrinkwrap files).
   *
   * Affected rule:
   * - [`shrinkwrap`](https://github.com/ljharb/lockfile-tools/blob/HEAD/packages/eslint-plugin/docs/rules/shrinkwrap.md)
   */
  packageSpecifiersToAllowLockfilesFor?: Record<string, boolean>;
}

export default ((context, optionsRaw) => {
  const LOCKFILE_PARSERS = {
    json: {language: ['jsonc', 'json']},
    jsonc: {language: ['jsonc', 'jsonc']},
    yaml: {language: ['yaml', 'yaml']},
  } satisfies Record<string, {language: SupportedEslintPluginLanguages} | {parser: ParserPrefix}>;

  const LOCKFILES_INFO = objectEntriesUnsafe({
    npm: ['json', ['package-lock.json', 'npm-shrinkwrap.json']],
    yarn: ['yaml', ['yarn.lock']],
    pnpm: ['yaml', ['pnpm-lock.yaml']],
    bun: ['jsonc', ['bun.lock', 'bun.lockb']],
    vlt: ['json', ['vlt-lock.json']],
  } satisfies Record<
    SupportedPackageManagers,
    [languageOrParser: keyof typeof LOCKFILE_PARSERS, lockfileNames: string[]]
  >);

  const optionsResolved = assignDefaults(optionsRaw, {
    noNonRegistryDependencySpecifiers: true,
  } satisfies Partial<LockfileEslintConfigOptions>);

  const {
    enforceAllowedRegistries,
    enforceLockfileVersion,
    enforcePackageManager,
    noNonRegistryDependencySpecifiers,
    packageSpecifiersToAllowLockfilesFor,
  } = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'lockfile');

  // Legend:
  // 🟢 - in recommended

  const lockfileEslintConfig = configBuilder
    ?.addConfig([
      'lockfile',
      {
        includeDefaultFilesAndIgnores: true,
        filesDefault: LOCKFILES_INFO.flatMap(([, [, lockfiles]]) =>
          lockfiles.map((lockfile) => `**/${lockfile}`),
        ) satisfies string[],
        ignoresInternal: {
          yaml: false,
        },
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
    .addRule('shrinkwrap', ERROR, [
      getKeysOfTruthyValues(packageSpecifiersToAllowLockfilesFor),
    ]) /** @since 1.1.0 */ // 🟢
    .addRule(
      'version',
      enforceLockfileVersion ? ERROR : OFF,
      enforceLockfileVersion ? [enforceLockfileVersion] : [],
    ) /** @since 1.0.0 */ // 🟢
    .enableConfigTesterForPlugin('lockfile')
    .addOverrides().config;

  objectEntriesUnsafe(
    groupBy(lockfileEslintConfig?.files?.flat() || [], (fileGlob) => {
      for (const [, [parserConfigName, lockfileNames]] of LOCKFILES_INFO) {
        if (lockfileNames.some((lockfile) => fileGlob.includes(lockfile))) {
          return parserConfigName;
        }
      }
      return '';
    }),
  ).forEach(([parserConfigName, globs]) => {
    if (!parserConfigName) {
      context.logger.warn(
        `The following file globs in the \`lockfile\` config could not be associated with a known package manager and may not be parsed correctly: ${globs.join(
          ', ',
        )}`,
      );
      return;
    }

    // eslint-disable-next-line ts/no-non-null-assertion
    const [languageOrParserName] = LOCKFILES_INFO.find(([, [pm]]) => pm === parserConfigName)![1];
    const languageOrParser = LOCKFILE_PARSERS[languageOrParserName];

    configBuilder?.addConfig([
      `lockfile/parser/${parserConfigName}`,
      {
        filesDefault: globs,
        ignoresInternal: {
          yaml: false,
        },
        // ...('parser' in languageOrParser && {parser: languageOrParser.parser}),
        ...('language' in languageOrParser && {language: languageOrParser.language}),
      },
    ]);
  });

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'lockfile'>;

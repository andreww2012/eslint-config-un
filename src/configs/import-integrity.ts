// import type importIntegrityLint from 'import-integrity-lint';
import type {Environment} from '../config-un/shared';
import {ERROR, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

export interface ImportIntegrityPluginSettings {
  /**
   * Directory path in which the plugin scans for files in the current package.
   * @see https://nebrius.github.io/import-integrity-lint/configuration/repo-level-options.html#packagerootdir
   */
  packageRootDir?: string;

  /**
   * The absolute path to the monorepo root.
   * The plugin uses your monorepo's workspace configuration to discover packages underneath this
   * directory.
   * @see https://nebrius.github.io/import-integrity-lint/configuration/repo-level-options.html#monoreporootdir
   */
  monorepoRootDir?: string;

  /**
   * Set to `auto` by default by the plugin.
   *
   * Set by us to `editor` or `one-shot` if the resolved `environment` root option
   * is `editor` or `ci` respectively.
   * @see https://nebrius.github.io/import-integrity-lint/configuration/repo-level-options.html#mode
   */
  mode?: 'auto' | 'one-shot' | 'fix' | 'editor';

  /**
   * Defines the rate in milliseconds at which `editor` mode file watching checks for file changes.
   * @see https://nebrius.github.io/import-integrity-lint/configuration/repo-level-options.html#editorupdaterate
   */
  editorUpdateRate?: number;

  /**
   * Enables verbose logging that tells you performance numbers, when files are updated, and more.
   * @see https://nebrius.github.io/import-integrity-lint/configuration/repo-level-options.html#debuglogging
   */
  debugLogging?: boolean;

  /**
   * Defines custom module aliases, like it is done in TypeScript config file (`tsconfig.json`).
   * @see https://nebrius.github.io/import-integrity-lint/configuration/package-level-options.html#alias
   */
  alias?: Record<string, string>;

  /**
   * Files representing your package's public API - the set of files whose exports are intended to
   * be consumed by code outside the package.
   * Defaults to `package.json`'s entry points under certain conditions.
   * @see https://nebrius.github.io/import-integrity-lint/configuration/package-level-options.html#entrypointfiles
   */
  entryPointFiles?: Record<string, string>;

  /**
   * The list of files whose exports are imported by external systems such as frameworks, not by
   * code inside the codebase.
   *
   * Example: frontend frameworks' pages & layouts.
   *
   * Defaults to Next.js values if it's detected.
   * @see https://nebrius.github.io/import-integrity-lint/configuration/package-level-options.html#externallyimportedfiles
   */
  externallyImportedFiles?: string[];

  /**
   * A list of files to exclude from the analysis.
   * Uses the format used by `.gitignore`.
   * @see https://nebrius.github.io/import-integrity-lint/configuration/package-level-options.html#ignorepatterns
   */
  ignorePatterns?: string[];

  /**
   * A list of files to negate the `ignorePatterns`.
   * Uses the format used by `.gitignore`.
   * @see https://nebrius.github.io/import-integrity-lint/configuration/package-level-options.html#ignorepatterns
   */
  ignoreOverridePatterns?: string[];

  /**
   * A list of files that are considered "test" files.
   * This information is used by several rules.
   * Will be merged with the default list.
   * @see https://nebrius.github.io/import-integrity-lint/configuration/package-level-options.html#testfilepatterns
   */
  testFilePatterns?: string[];
}

/**
 * A faster alternative to `eslint-plugin-import(-x)` plugins.
 * From the docs, it is "A high-performance ESLint and Oxlint plugin for analyzing import and export
 * relationships across your codebase".
 *
 * ⚠️ Does not implement all the rules from the original plugins, does not support non-JS file
 * extensions and might require some additional setup.
 *
 * 📁 Default `files`: all files
 */
export interface ImportIntegrityEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'import-integrity'> {
  /**
   * [`import-integrity-lint`](https://npmx.dev/import-integrity-lint) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
   * that will be assigned to `import-integrity` property and applied to the resolved `files` and
   * `ignores` of this config.
   *
   * It will be merged with `{packageRootDir: import.meta.dirname}`
   */
  settings?: Partial<ImportIntegrityPluginSettings>;

  /**
   * Affected rule:
   * - [`import-integrity/no-restricted-imports`](https://nebrius.github.io/import-integrity-lint/rules/no-restricted-imports)
   */
  restrictImports?: GetRuleOptions<'import-integrity', 'no-restricted-imports'>;
}

const MODE_PER_ENVIRONMENT: Record<
  Exclude<Environment, 'default'>,
  ImportIntegrityPluginSettings['mode']
> = {
  ci: 'one-shot',
  editor: 'editor',
};

export default defineUnConfig<ImportIntegrityEslintConfigOptions>(
  'importIntegrity',
  false,
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {settings: pluginSettings, restrictImports} = optionsResolved;

  const {environment} = context.meta;
  const modeFromEnvironment = environment !== 'default' && MODE_PER_ENVIRONMENT[environment];

  const configBuilder = context.createConfigBuilder(optionsResolved, 'import-integrity');

  // Legend:
  // 🟢 - in recommended
  // 🟣 - in recommended (monorepo)

  configBuilder
    ?.addConfig([
      'import-integrity',
      {
        settings: {
          'import-integrity': {
            packageRootDir: import.meta.dirname,
            ...(modeFromEnvironment && {mode: modeFromEnvironment}),
            ...pluginSettings,
          } satisfies ImportIntegrityPluginSettings,
        },
      },
    ])
    .markCategory('Correctness')
    .addRule('no-cycle', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-unresolved-imports', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-unused-exports', ERROR) /** @since 1.0.0 */ // 🟢
    // TODO monorepo config?
    .addRule('no-unused-package-exports', OFF) /** @since 1.0.0 */ // 🟣
    .markCategory('Boundaries')
    .addRule('no-node-builtins', ERROR) /** @since 1.0.0 */
    .addRule(
      'no-restricted-imports',
      restrictImports ? ERROR : OFF,
      restrictImports ? [restrictImports] : [],
    ) /** @since 1.0.0 */
    .addRule('no-test-imports-in-prod', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-test-only-imports', ERROR) /** @since 1.0.0 */ // 🟢
    .markCategory('Aesthetics')
    .addRule('prefer-alias-imports', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('require-node-prefix', ERROR) /** @since 1.0.0 */ // 🟢
    .markCategory(
      'Footguns', // cspell:disable-line
    )
    .addRule('no-empty-entry-points', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-entry-point-imports', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-external-barrel-reexports', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-named-as-default', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-unnamed-entry-point-exports', ERROR) /** @since 1.0.0 */ // 🟢
    .enableConfigTesterForPlugin('import-integrity')
    .addOverrides();
});

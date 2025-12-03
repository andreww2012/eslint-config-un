import type {ResolveOptions as EnhancedResolveResolveOptions} from 'enhanced-resolve';
import globals from 'globals';
import {Range, subset as isFirstSemverRangeIsSubsetOfSecond} from 'semver';
import {ERROR, OFF} from '../constants';
import type {PackageJson, Prettify} from '../types';
import {interopDefault, readAndParseJson} from '../utils';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

interface EslintPluginNSettings {
  /**
   * Might be read by the following rules:
   * - [`no-extraneous-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-extraneous-import.md)
   * - [`no-extraneous-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-extraneous-require.md)
   * - [`no-missing-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-import.md)
   * - [`no-missing-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-require.md)
   * - [`no-unpublished-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-import.md)
   * - [`no-unpublished-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-require.md)
   */
  allowModules?: GetRuleOptions<'node', 'no-extraneous-import'>['allowModules'];

  /**
   * Might be read by the following rules:
   * - [`hashbang`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/hashbang.md)
   * - [`no-extraneous-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-extraneous-import.md)
   * - [`no-extraneous-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-extraneous-require.md)
   * - [`no-unpublished-bin`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-bin.md)
   * - [`no-unpublished-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-import.md)
   * - [`no-unpublished-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-require.md)
   */
  convertPath?: GetRuleOptions<'node', 'hashbang'>['convertPath'];

  /**
   * Might be read by the following rules:
   * - [`no-extraneous-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-extraneous-import.md)
   * - [`no-extraneous-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-extraneous-require.md)
   * - [`no-missing-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-import.md)
   * - [`no-missing-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-require.md)
   * - [`no-unpublished-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-import.md)
   * - [`no-unpublished-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-require.md)
   */
  resolvePaths?: GetRuleOptions<'node', 'no-extraneous-import'>['resolvePaths'];

  /**
   * Might be read by the following rules:
   * - [`no-extraneous-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-extraneous-import.md)
   * - [`no-extraneous-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-extraneous-require.md)
   * - [`no-missing-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-import.md)
   * - [`no-missing-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-require.md)
   * - [`no-unpublished-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-import.md)
   * - [`no-unpublished-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-require.md)
   */
  resolverConfig?: EnhancedResolveResolveOptions;

  /**
   * Might be read by the following rules:
   * - [`no-extraneous-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-extraneous-require.md)
   * - [`no-missing-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-import.md)
   * - [`no-missing-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-require.md)
   * - [`no-unpublished-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-require.md)
   */
  tryExtensions?: GetRuleOptions<'node', 'no-extraneous-require'>['tryExtensions'];

  /**
   * Might be read by the following rules:
   * - [`no-missing-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-import.md)
   * - [`no-missing-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-require.md)
   */
  tsconfigPath?: GetRuleOptions<'node', 'no-missing-import'>['tsconfigPath'];

  /**
   * Might be read by the following rules:
   * - [`no-missing-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-import.md)
   * - [`no-missing-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-require.md)
   */
  typescriptExtensionMap?:
    | Exclude<GetRuleOptions<'node', 'no-missing-import'>['typescriptExtensionMap'], unknown[]>
    | [string, string][];

  /**
   * Supported node version range
   *
   * If not explicitly specified, will be read from the closest to the currently linted file
   * `package.json`'s `engines.node` field, or ⚠️ fall back to `>=16.0.0`.
   *
   * Might be read by the following rules:
   * - [`no-deprecated-api`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-deprecated-api.md)
   * - [`no-unsupported-features/es-builtins`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unsupported-features/es-builtins.md)
   * - [`no-unsupported-features/es-syntax`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unsupported-features/es-syntax.md)
   * - [`no-unsupported-features/node-builtins`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unsupported-features/node-builtins.md)
   * - [`prefer-node-protocol`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-node-protocol.md)
   */
  version?: string;
}

export interface NodeEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, 'node'> {
  /**
   * [`eslint-plugin-n`](https://github.com/eslint-community/eslint-plugin-n) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `node` property and applied to the specified `files` and `ignores`.
   *
   * Most of the settings are used to override options simultaneously for multiple rules.
   * The plugin reads `option` value from multiple sources in the following order, and stops when it finds a valid value:
   * - Corresponding rule `option`
   * - `settings.n.option`
   * - `settings.node.option`
   * - Option-specific source
   * - Optional fall back value
   */
  settings?: EslintPluginNSettings;

  /**
   * Specifies which features will not be reported if detected as supported
   * by `no-unsupported-features/*` rules.
   */
  noUnsupportedFeaturesIgnores?: Prettify<{
    esBuiltins?: GetRuleOptions<'node', 'no-unsupported-features/es-builtins'>['ignores'];
    esSyntax?: GetRuleOptions<'node', 'no-unsupported-features/es-syntax'>['ignores'];
    nodeBuiltins?: GetRuleOptions<'node', 'no-unsupported-features/node-builtins'>['ignores'];
  }>;

  /**
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global
   */
  preferGlobal?: {
    /**
     * Enforces either `Buffer` or `require("buffer").Buffer`
     * @default true
     * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/buffer.md
     */
    buffer?: boolean;

    /**
     * Enforce either `console` or `require("console")`
     * @default true
     * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/console.md
     */
    console?: boolean;

    /**
     * Enforce either `process` or `require("process")`
     * @default true
     * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/process.md
     */
    process?: boolean;

    /**
     * Enforce either `TextDecoder` or `require("util").TextDecoder`
     * @default true
     * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/text-decoder.md
     */
    textDecoder?: boolean;

    /**
     * Enforce either `TextEncoder` or `require("util").TextEncoder`
     * @default true
     * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/text-encoder.md
     */
    textEncoder?: boolean;

    /**
     * Enforce either `URLSearchParams` or `require("url").URLSearchParams`
     * @default true
     * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/url-search-params.md
     */
    url?: boolean;

    /**
     * Enforce either `URL` or `require("url").URL`
     * @default true
     * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/url.md
     */
    urlSearchParams?: boolean;
  };
}

const IMPORT_META_PROPERTIES_AVAILABLE_SINCE = '>=20.11';

export default (async (context, optionsRaw) => {
  const closestPackageJson = await interopDefault(import('empathic/package'))
    .then((m) => m.up())
    .then((packageJsonPath) => readAndParseJson<PackageJson>(packageJsonPath));

  const optionsResolved = assignDefaults(optionsRaw, {
    preferGlobal: {} as NodeEslintConfigOptions['preferGlobal'] & {},
    noUnsupportedFeaturesIgnores:
      {} as NodeEslintConfigOptions['noUnsupportedFeaturesIgnores'] & {},
  } satisfies NodeEslintConfigOptions);

  const {settings: pluginSettings, preferGlobal, noUnsupportedFeaturesIgnores} = optionsResolved;

  const userNodeVersion = new Range(closestPackageJson?.engines?.['node'] || '');

  const configBuilder = context.createConfigBuilder(optionsResolved, 'node');

  // Legend:
  // 🟢 - in recommended
  // ✖️ - `n` rule only

  configBuilder
    ?.addConfig(['node', {includeDefaultFilesAndIgnores: true}], {
      ...(pluginSettings && {
        settings: {
          node: pluginSettings,
        },
      }),
      languageOptions: {
        globals: globals.node,
      },
    })
    // Versions in @since tags are from `eslint-plugin-node` plugin, unless the rule doesn't exist in it
    .addRule('callback-return', OFF) /** @since 11.1.0 */
    .addRule('exports-style', ERROR, [
      'module.exports',
      {allowBatchAssign: false},
    ]) /** @since 2.1.1 */
    .addRule('file-extension-in-import', OFF) /** @since 9.0.0 */
    .addRule('global-require', OFF) /** @since 11.1.0 */
    .addRule('handle-callback-err', OFF) /** @since 11.1.0 */
    .addRule('hashbang', ERROR) /** @since 17.0.0-4 */ // 🟢✖️
    .addRule('no-callback-literal', OFF) /** @since 9.2.0 */
    .addRule('no-deprecated-api', ERROR) /** @since 1.4.0 */ // 🟢
    .addRule('no-exports-assign', ERROR) /** @since 10.0.0 */ // 🟢
    .addRule('no-extraneous-import', OFF) /** @since 5.0.0 */ // TODO 🟢 only disable when import plugin is enabled?
    .addRule('no-extraneous-require', ERROR) /** @since 5.0.0 */ // TODO 🟢 handled by import plugin too?
    .addRule('no-missing-import', OFF) /** @since 0.1.0 */ // TODO 🟢 only disable when import plugin is enabled?
    .addRule('no-missing-require', ERROR) /** @since 0.1.0 */ // TODO 🟢 handled by import plugin too?
    .addRule('no-mixed-requires', OFF) /** @since 11.1.0 */
    .addRule('no-new-require', ERROR) /** @since 11.1.0 */
    .addRule('no-path-concat', ERROR) /** @since 11.1.0 */
    .addRule('no-process-env', OFF) /** @since 11.1.0 */
    .addRule('no-process-exit', OFF) /** @since 11.1.0 */ // 🟢 The corresponding Unicorn rule is better: https://github.com/sindresorhus/eslint-plugin-unicorn/blob/1deb9bb5edf27fdb2f656add11c924dfa59fdac9/docs/rules/no-process-exit.md
    .addAnyRule('unicorn', 'no-process-exit', ERROR) // TODO 🟢
    .addRule('no-restricted-import', OFF) /** @since 11.1.0 */
    .addRule('no-restricted-require', OFF) /** @since 11.1.0 */
    .addRule('no-sync', OFF) /** @since 11.1.0 */
    .addRule('no-top-level-await', ERROR, [{ignoreBin: true}]) /** @since 17.19.0 */ // ✖️
    .addRule('no-unpublished-bin', ERROR) /** @since 2.1.1 */ // 🟢
    .addRule('no-unpublished-import', OFF) /** @since 0.4.0 */ // TODO 🟢 only disable when import plugin is enabled?
    .addRule('no-unpublished-require', ERROR) /** @since 0.4.0 */ // TODO 🟢 handled by import plugin too?
    .addRule(
      'no-unsupported-features/es-builtins',
      ERROR,
      noUnsupportedFeaturesIgnores.esBuiltins?.length
        ? [{ignores: noUnsupportedFeaturesIgnores.esBuiltins}]
        : [],
    ) /** @since 7.0.0-beta.0 */ // 🟢
    .addRule(
      'no-unsupported-features/es-syntax',
      ERROR,
      noUnsupportedFeaturesIgnores.esSyntax?.length
        ? [{ignores: noUnsupportedFeaturesIgnores.esSyntax}]
        : [],
    ) /** @since 7.0.0-beta.0 */
    .addRule(
      'no-unsupported-features/node-builtins',
      ERROR,
      noUnsupportedFeaturesIgnores.nodeBuiltins?.length
        ? [{ignores: noUnsupportedFeaturesIgnores.nodeBuiltins}]
        : [],
    ) /** @since 7.0.0-beta.0 */ //  🟢
    .addRule('prefer-global/buffer', ERROR, [
      preferGlobal.buffer === false ? 'never' : 'always',
    ]) /** @since 7.0.0-beta.0 */
    .addRule('prefer-global/console', ERROR, [
      preferGlobal.console === false ? 'never' : 'always',
    ]) /** @since 7.0.0-beta.0 */
    .addRule('prefer-global/process', ERROR, [
      preferGlobal.process === false ? 'never' : 'always',
    ]) /** @since 7.0.0-beta.0 */
    .addRule('prefer-global/text-decoder', ERROR, [
      preferGlobal.textDecoder === false ? 'never' : 'always',
    ]) /** @since 8.0.0 */
    .addRule('prefer-global/text-encoder', ERROR, [
      preferGlobal.textEncoder === false ? 'never' : 'always',
    ]) /** @since 8.0.0 */
    .addRule('prefer-global/url', ERROR, [
      preferGlobal.url === false ? 'never' : 'always',
    ]) /** @since 7.0.0-beta.0 */
    .addRule('prefer-global/url-search-params', ERROR, [
      preferGlobal.urlSearchParams === false ? 'never' : 'always',
    ]) /** @since 7.0.0-beta.0 */
    .addRule('prefer-node-protocol', ERROR) /** @since 17.0.0-2 */ // ✖️
    .addRule('prefer-promises/dns', OFF) /** @since 9.0.0 */ // TODO enable?
    .addRule('prefer-promises/fs', OFF) /** @since 9.0.0 */ // TODO enable?
    .addRule('process-exit-as-throw', ERROR) /** @since 1.2.0 */ // 🟢 Does not report anything, makes ESLint treat `process.exit()` calls as a stop: https://github.com/eslint-community/eslint-plugin-node/blob/c092cd893010f8da894f87da567c07d69be6cc0d/docs/rules/process-exit-as-throw.md
    .addAnyRule(
      'unicorn',
      'prefer-import-meta-properties',
      isFirstSemverRangeIsSubsetOfSecond(userNodeVersion, IMPORT_META_PROPERTIES_AVAILABLE_SINCE)
        ? ERROR
        : OFF,
    )
    .enableConfigTesterForPlugin('node')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'node'>;

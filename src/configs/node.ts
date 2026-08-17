import type {ResolveOptions as EnhancedResolveResolveOptions} from 'enhanced-resolve';
import globals from 'globals';
import {Range, subset as isFirstSemverRangeIsSubsetOfSecond} from 'semver';
import {ERROR, OFF} from '../constants';
import type {PackageJson, Prettify} from '../types';
import {interopDefault, readAndParseJson} from '../utils';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

interface EslintPluginNSettings {
  /**
   * Affected rules:
   * - [`node/no-extraneous-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-extraneous-import.md)
   * - [`node/no-extraneous-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-extraneous-require.md)
   * - [`node/no-missing-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-import.md)
   * - [`node/no-missing-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-require.md)
   * - [`node/no-unpublished-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-import.md)
   * - [`node/no-unpublished-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-require.md)
   */
  allowModules?: GetRuleOptions<'node', 'no-extraneous-import'>['allowModules'];

  /**
   * Affected rules:
   * - [`node/hashbang`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/hashbang.md)
   * - [`node/no-extraneous-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-extraneous-import.md)
   * - [`node/no-extraneous-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-extraneous-require.md)
   * - [`node/no-unpublished-bin`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-bin.md)
   * - [`node/no-unpublished-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-import.md)
   * - [`node/no-unpublished-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-require.md)
   */
  convertPath?: GetRuleOptions<'node', 'hashbang'>['convertPath'];

  /**
   * Affected rules:
   * - [`node/no-extraneous-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-extraneous-import.md)
   * - [`node/no-extraneous-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-extraneous-require.md)
   * - [`node/no-missing-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-import.md)
   * - [`node/no-missing-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-require.md)
   * - [`node/no-unpublished-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-import.md)
   * - [`node/no-unpublished-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-require.md)
   */
  resolvePaths?: GetRuleOptions<'node', 'no-extraneous-import'>['resolvePaths'];

  /**
   * Affected rules:
   * - [`node/no-extraneous-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-extraneous-import.md)
   * - [`node/no-extraneous-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-extraneous-require.md)
   * - [`node/no-missing-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-import.md)
   * - [`node/no-missing-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-require.md)
   * - [`node/no-unpublished-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-import.md)
   * - [`node/no-unpublished-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-require.md)
   */
  resolverConfig?: Partial<EnhancedResolveResolveOptions>;

  /**
   * Affected rules:
   * - [`node/no-extraneous-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-extraneous-require.md)
   * - [`node/no-missing-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-import.md)
   * - [`node/no-missing-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-require.md)
   * - [`node/no-unpublished-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-require.md)
   */
  tryExtensions?: GetRuleOptions<'node', 'no-extraneous-require'>['tryExtensions'];

  /**
   * Affected rules:
   * - [`node/no-missing-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-import.md)
   * - [`node/no-missing-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-require.md)
   */
  tsconfigPath?: GetRuleOptions<'node', 'no-missing-import'>['tsconfigPath'];

  /**
   * Affected rules:
   * - [`node/no-missing-import`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-import.md)
   * - [`node/no-missing-require`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-require.md)
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
   * Affected rules:
   * - [`node/no-deprecated-api`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-deprecated-api.md)
   * - [`node/no-unsupported-features/es-builtins`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unsupported-features/es-builtins.md)
   * - [`node/no-unsupported-features/es-syntax`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unsupported-features/es-syntax.md)
   * - [`node/no-unsupported-features/node-builtins`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unsupported-features/node-builtins.md)
   * - [`node/prefer-node-protocol`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-node-protocol.md)
   */
  version?: string;
}

/**
 * Node.js code specific rules.
 *
 * 📁 Default `files`: all files
 */
export interface NodeEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'node'> {
  /**
   * [`eslint-plugin-n`](https://npmx.dev/eslint-plugin-n) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
   * that will be assigned to `node` property and applied to the resolved `files` and `ignores` of
   * this config.
   *
   * Most of the settings are used to override options simultaneously for multiple rules.
   * The plugin reads `option` value from multiple sources in the following order, and stops when it
   * finds a valid value:
   * - Corresponding rule `option`
   * - `settings.n.option`
   * - `settings.node.option`
   * - Option-specific source
   * - Optional fall back value
   */
  settings?: EslintPluginNSettings;

  /**
   * Specifies which features will not be reported if detected as supported by
   * `no-unsupported-features/*` rules.
   */
  noUnsupportedFeaturesIgnores?: Prettify<{
    /**
     * ECMAScript built-ins to never report
     */
    esBuiltins?: GetRuleOptions<'node', 'no-unsupported-features/es-builtins'>['ignores'];

    /**
     * ECMAScript syntax to never report
     */
    esSyntax?: GetRuleOptions<'node', 'no-unsupported-features/es-syntax'>['ignores'];

    /**
     * Node.js built-ins to never report
     */
    nodeBuiltins?: GetRuleOptions<'node', 'no-unsupported-features/node-builtins'>['ignores'];
  }>;

  /**
   * Enforces whether the Node.js APIs that are available both globally and as a built-in module
   * import are used through the global or through the import
   * @see https://github.com/eslint-community/eslint-plugin-n/tree/HEAD/docs/rules/prefer-global
   */
  preferGlobal?: {
    /**
     * Enforces either `Buffer` or `require("buffer").Buffer`
     *
     * Affected rule:
     * - [`node/prefer-global/buffer`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/buffer.md)
     * @default true
     */
    buffer?: boolean;

    /**
     * Enforce either `console` or `require("console")`
     *
     * Affected rule:
     * - [`node/prefer-global/console`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/console.md)
     * @default true
     */
    console?: boolean;

    /**
     * Enforce either `crypto` or `require("node:crypto").webcrypto`
     *
     * Affected rule:
     * - [`node/prefer-global/crypto`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/crypto.md)
     * @default true
     */
    crypto?: boolean;

    /**
     * Enforce either `process` or `require("process")`
     *
     * Affected rule:
     * - [`node/prefer-global/process`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/process.md)
     * @default true
     */
    process?: boolean;

    /**
     * Enforce either `TextDecoder` or `require("util").TextDecoder`
     *
     * Affected rule:
     * - [`node/prefer-global/text-decoder`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/text-decoder.md)
     * @default true
     */
    textDecoder?: boolean;

    /**
     * Enforce either `clearImmediate`, `clearInterval`, `clearTimeout`, `setImmediate`,
     * `setInterval`, and `setTimeout` or `require("timers").{setTimeout,...}`
     *
     * Affected rule:
     * - [`node/prefer-global/timers`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/timers.md)
     * @default true
     */
    timers?: boolean;

    /**
     * Enforce either `TextEncoder` or `require("util").TextEncoder`
     *
     * Affected rule:
     * - [`node/prefer-global/text-encoder`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/text-encoder.md)
     * @default true
     */
    textEncoder?: boolean;

    /**
     * Enforce either `URL` or `require("url").URL`
     *
     * Affected rule:
     * - [`node/prefer-global/url`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/url.md)
     * @default true
     */
    url?: boolean;

    /**
     * Enforce either `URLSearchParams` or `require("url").URLSearchParams`
     *
     * Affected rule:
     * - [`node/prefer-global/url-search-params`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/url-search-params.md)
     * @default true
     */
    urlSearchParams?: boolean;
  };
}

const IMPORT_META_PROPERTIES_AVAILABLE_SINCE = '>=20.11';
const EXPLICIT_RESOURCE_MANAGEMENT_AVAILABLE_SINCE = '>=24';

export default defineUnConfig<NodeEslintConfigOptions>('node', {
  enabledBy: true,
  // Re-enables `unicorn` rules that the `unicorn` config turns off expecting us to, so we must win
  after: ['unicorn'],
})(async (context, optionsRaw) => {
  const closestPackageJson = await interopDefault(import('empathic/package'))
    .then((m) => m.up())
    .then((packageJsonPath) => readAndParseJson<PackageJson>(packageJsonPath));

  const optionsResolved = assignDefaults(optionsRaw, {
    preferGlobal: {},
    noUnsupportedFeaturesIgnores: {},
  });

  const {settings: pluginSettings, preferGlobal, noUnsupportedFeaturesIgnores} = optionsResolved;

  const userNodeVersion = new Range(closestPackageJson?.engines?.node || '');

  const configBuilder = context.createConfigBuilder(optionsResolved, 'node');

  // Legend:
  // 🟢 - in recommended
  // ✖️ - `n` rule only

  configBuilder
    ?.addConfig(
      [
        'node',
        {
          settings: {
            // @ts-expect-error TS is crazy - if an interface is inlined, it won't error
            node: pluginSettings,
          },
        },
      ],
      {
        languageOptions: {
          globals: globals.node,
        },
      },
    )
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
    .addRule('prefer-global/crypto', ERROR, [
      preferGlobal.crypto === false ? 'never' : 'always',
    ]) /** @since 17.24.0 */
    .addRule('prefer-global/process', ERROR, [
      preferGlobal.process === false ? 'never' : 'always',
    ]) /** @since 7.0.0-beta.0 */
    .addRule('prefer-global/text-decoder', ERROR, [
      preferGlobal.textDecoder === false ? 'never' : 'always',
    ]) /** @since 8.0.0 */
    .addRule('prefer-global/text-encoder', ERROR, [
      preferGlobal.textEncoder === false ? 'never' : 'always',
    ]) /** @since 8.0.0 */
    .addRule('prefer-global/timers', ERROR, [
      preferGlobal.timers === false ? 'never' : 'always',
    ]) /** @since 17.24.0 */
    .addRule('prefer-global/url', ERROR, [
      preferGlobal.url === false ? 'never' : 'always',
    ]) /** @since 7.0.0-beta.0 */
    .addRule('prefer-global/url-search-params', ERROR, [
      preferGlobal.urlSearchParams === false ? 'never' : 'always',
    ]) /** @since 7.0.0-beta.0 */
    .addRule('prefer-import/assert-strict', OFF) /** @since 18.3.0 */ // ✖️
    .addRule('prefer-node-protocol', ERROR) /** @since 17.0.0-2 */ // ✖️
    .addRule('prefer-process-get-builtin-module', ERROR) /** @since 18.3.0 */ // ✖️
    .addRule('prefer-promises/dns', OFF) /** @since 9.0.0 */ // TODO enable?
    .addRule('prefer-promises/fs', OFF) /** @since 9.0.0 */ // TODO enable?
    .addRule('process-exit-as-throw', ERROR) /** @since 1.2.0 */ // 🟢 Does not report anything, makes ESLint treat `process.exit()` calls as a stop: https://github.com/eslint-community/eslint-plugin-n/blob/c092cd893010f8da894f87da567c07d69be6cc0d/docs/rules/process-exit-as-throw.md
    // Note: only disabling, since rules may have a different severity set in the `unicorn` config
    .addAnyRule(
      'unicorn',
      'prefer-dispose',
      isFirstSemverRangeIsSubsetOfSecond(
        userNodeVersion,
        EXPLICIT_RESOURCE_MANAGEMENT_AVAILABLE_SINCE,
      )
        ? null
        : OFF,
    )
    .addAnyRule(
      'unicorn',
      'prefer-import-meta-properties',
      isFirstSemverRangeIsSubsetOfSecond(userNodeVersion, IMPORT_META_PROPERTIES_AVAILABLE_SINCE)
        ? null
        : OFF,
    )
    .enableConfigTesterForPlugin('node')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});

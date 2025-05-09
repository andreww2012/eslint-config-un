import type {ResolveOptions as EnhancedResolveResolveOptions} from 'enhanced-resolve';
import {readPackageUp as readClosestPackageJson} from 'read-package-up';
import {Range, subset as isFirstSemverRangeIsSubsetOfSecond} from 'semver';
import {ERROR, OFF} from '../constants';
import {
  type ConfigSharedOptions,
  type GetRuleOptions,
  createConfigBuilder,
  createPluginObjectRenamer,
} from '../eslint';
import {pluginsLoaders} from '../plugins';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

interface EslintPluginNSettings {
  /**
   * Might be read by the following rules:
   * - [`no-extraneous-import`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-extraneous-import.md)
   * - [`no-extraneous-require`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-extraneous-require.md)
   * - [`no-missing-import`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-missing-import.md)
   * - [`no-missing-require`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-missing-require.md)
   * - [`no-unpublished-import`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-unpublished-import.md)
   * - [`no-unpublished-require`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-unpublished-require.md)
   */
  allowModules?: (GetRuleOptions<'node/no-extraneous-import'>['0'] & {})['allowModules'];

  /**
   * Might be read by the following rules:
   * - [`hashbang`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/hashbang.md)
   * - [`no-extraneous-import`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-extraneous-import.md)
   * - [`no-extraneous-require`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-extraneous-require.md)
   * - [`no-unpublished-bin`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-unpublished-bin.md)
   * - [`no-unpublished-import`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-unpublished-import.md)
   * - [`no-unpublished-require`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-unpublished-require.md)
   */
  convertPath?: (GetRuleOptions<'node/hashbang'>['0'] & {})['convertPath'];

  /**
   * Might be read by the following rules:
   * - [`no-extraneous-import`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-extraneous-import.md)
   * - [`no-extraneous-require`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-extraneous-require.md)
   * - [`no-missing-import`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-missing-import.md)
   * - [`no-missing-require`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-missing-require.md)
   * - [`no-unpublished-import`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-unpublished-import.md)
   * - [`no-unpublished-require`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-unpublished-require.md)
   */
  resolvePaths?: (GetRuleOptions<'node/no-extraneous-import'>['0'] & {})['resolvePaths'];

  /**
   * Might be read by the following rules:
   * - [`no-extraneous-import`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-extraneous-import.md)
   * - [`no-extraneous-require`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-extraneous-require.md)
   * - [`no-missing-import`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-missing-import.md)
   * - [`no-missing-require`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-missing-require.md)
   * - [`no-unpublished-import`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-unpublished-import.md)
   * - [`no-unpublished-require`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-unpublished-require.md)
   */
  resolverConfig?: EnhancedResolveResolveOptions;

  /**
   * Might be read by the following rules:
   * - [`no-extraneous-require`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-extraneous-require.md)
   * - [`no-missing-import`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-missing-import.md)
   * - [`no-missing-require`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-missing-require.md)
   * - [`no-unpublished-require`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-unpublished-require.md)
   */
  tryExtensions?: (GetRuleOptions<'node/no-extraneous-require'>['0'] & {})['tryExtensions'];

  /**
   * Might be read by the following rules:
   * - [`no-missing-import`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-missing-import.md)
   * - [`no-missing-require`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-missing-require.md)
   */
  tsconfigPath?: (GetRuleOptions<'node/no-missing-import'>['0'] & {})['tsconfigPath'];

  /**
   * Might be read by the following rules:
   * - [`no-missing-import`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-missing-import.md)
   * - [`no-missing-require`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-missing-require.md)
   */
  typescriptExtensionMap?:
    | Exclude<
        (GetRuleOptions<'node/no-missing-import'>['0'] & {})['typescriptExtensionMap'],
        unknown[]
      >
    | [string, string][];

  /**
   * Supported node version range
   *
   * If not explicitly specified, will be read from the closest to the currently linted file
   * `package.json`'s `engines.node` field, or ⚠️ fall back to `>=16.0.0`.
   *
   * Might be read by the following rules:
   * - [`no-deprecated-api`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-deprecated-api.md)
   * - [`no-unsupported-features/es-builtins`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-unsupported-features/es-builtins.md)
   * - [`no-unsupported-features/es-syntax`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-unsupported-features/es-syntax.md)
   * - [`no-unsupported-features/node-builtins`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/no-unsupported-features/node-builtins.md)
   * - [`prefer-node-protocol`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/prefer-node-protocol.md)
   */
  version?: (GetRuleOptions<'node/no-unsupported-features/node-builtins'>['0'] & {})['version'];
}

export interface NodeEslintConfigOptions extends ConfigSharedOptions<'node'> {
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
   * @see https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/prefer-global
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

const pluginRenamer = createPluginObjectRenamer('n', 'node');

const IMPORT_META_PROPERTIES_AVAILABLE_SINCE = '>=20.11';

export const nodeUnConfig: UnConfigFn<'node'> = async (context) => {
  const [eslintPluginNode, closestPackageJson] = await Promise.all([
    pluginsLoaders.node(),
    readClosestPackageJson(),
  ]);

  const optionsRaw = context.rootOptions.configs?.node;
  const optionsResolved = assignDefaults(optionsRaw, {
    preferGlobal: {} as NodeEslintConfigOptions['preferGlobal'] & {},
  } satisfies NodeEslintConfigOptions);

  const {settings: pluginSettings, preferGlobal} = optionsResolved;

  const userNodeVersion = new Range(closestPackageJson?.packageJson.engines?.node || '');

  const configBuilder = createConfigBuilder(context, optionsResolved, 'node');

  configBuilder
    ?.addConfig(['node', {includeDefaultFilesAndIgnores: true}], {
      ...(pluginSettings && {
        settings: {
          node: pluginSettings,
        },
      }),
    })
    .addBulkRules(pluginRenamer(eslintPluginNode.configs['flat/recommended'].rules))
    // .addRule('callback-return', OFF)
    .addRule('exports-style', ERROR, ['module.exports', {allowBatchAssign: false}])
    // .addRule('file-extension-in-import', OFF),
    // .addRule('global-require', OFF),
    // .addRule('handle-callback-err', OFF),
    // .addRule('hashbang', ERROR),
    // .addRule('no-callback-literal', OFF),
    // .addRule('no-deprecated-api', ERROR),
    // .addRule('no-exports-assign', ERROR),
    .addRule('no-extraneous-import', OFF) // TODO only disable when import plugin is enabled?
    // .addRule('no-extraneous-require', ERROR) // TODO handled by import plugin too?
    .addRule('no-missing-import', OFF) // TODO only disable when import plugin is enabled?
    // .addRule('no-missing-require', ERROR) // TODO handled by import plugin too?
    // .addRule('no-mixed-requires', OFF)
    .addRule('no-new-require', ERROR)
    .addRule('no-path-concat', ERROR)
    // .addRule('no-process-env', OFF)
    .addRule('no-process-exit', OFF) // The corresponding Unicorn rule is better: https://github.com/sindresorhus/eslint-plugin-unicorn/blob/1deb9bb5edf27fdb2f656add11c924dfa59fdac9/docs/rules/no-process-exit.md
    .addAnyRule('unicorn', 'no-process-exit', ERROR) // TODO
    // .addRule('no-restricted-import', OFF)
    // .addRule('no-restricted-require', OFF)
    // .addRule('no-sync', OFF)
    // .addRule('no-unpublished-bin', ERROR)
    .addRule('no-unpublished-import', OFF) // TODO only disable when import plugin is enabled?
    // .addRule('no-unpublished-require', ERROR) // TODO handled by import plugin too?
    // .addRule('no-unsupported-features/es-builtins', ERROR)
    // .addRule('no-unsupported-features/es-syntax', ERROR)
    // .addRule('no-unsupported-features/node-builtins', ERROR)
    .addRule('prefer-global/buffer', ERROR, [preferGlobal.buffer === false ? 'never' : 'always'])
    .addRule('prefer-global/console', ERROR, [preferGlobal.console === false ? 'never' : 'always'])
    .addRule('prefer-global/process', ERROR, [preferGlobal.process === false ? 'never' : 'always'])
    .addRule('prefer-global/text-decoder', ERROR, [
      preferGlobal.textDecoder === false ? 'never' : 'always',
    ])
    .addRule('prefer-global/text-encoder', ERROR, [
      preferGlobal.textEncoder === false ? 'never' : 'always',
    ])
    .addRule('prefer-global/url', ERROR, [preferGlobal.url === false ? 'never' : 'always'])
    .addRule('prefer-global/url-search-params', ERROR, [
      preferGlobal.urlSearchParams === false ? 'never' : 'always',
    ])
    .addRule('prefer-node-protocol', ERROR)
    .addRule('prefer-promises/dns', OFF) // TODO enable?
    .addRule('prefer-promises/fs', OFF) // TODO enable?
    .addRule('process-exit-as-throw', ERROR) // Does not report anything, makes ESLint treat `process.exit()` calls as a stop: https://github.com/eslint-community/eslint-plugin-node/blob/c092cd893010f8da894f87da567c07d69be6cc0d/docs/rules/process-exit-as-throw.md
    .addAnyRule(
      'unicorn',
      'prefer-import-meta-properties',
      isFirstSemverRangeIsSubsetOfSecond(userNodeVersion, IMPORT_META_PROPERTIES_AVAILABLE_SINCE)
        ? ERROR
        : OFF,
    )
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

import eslintPluginNode from 'eslint-plugin-n';
import {ERROR, OFF} from '../constants';
import type {ConfigSharedOptions, FlatConfigEntry} from '../eslint';
import {ConfigEntryBuilder, createPluginObjectRenamer} from '../eslint';
import type {InternalConfigOptions} from './index';

export interface NodeEslintConfigOptions extends ConfigSharedOptions<'node'> {
  /**
   * @see https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/prefer-global
   */
  preferGlobal?: {
    /**
     * Enforces either `Buffer` or `require("buffer").Buffer`
     * @see https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/prefer-global/buffer.md
     * @default true
     */
    buffer?: boolean;

    /**
     * Enforce either `console` or `require("console")`
     * @see https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/prefer-global/console.md
     * @default true
     */
    console?: boolean;

    /**
     * Enforce either `process` or `require("process")`
     * @see https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/prefer-global/process.md
     * @default true
     */
    process?: boolean;

    /**
     * Enforce either `TextDecoder` or `require("util").TextDecoder`
     * @see https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/prefer-global/text-decoder.md
     * @default true
     */
    textDecoder?: boolean;

    /**
     * Enforce either `TextEncoder` or `require("util").TextEncoder`
     * @see https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/prefer-global/text-encoder.md
     * @default true
     */
    textEncoder?: boolean;

    /**
     * Enforce either `URLSearchParams` or `require("url").URLSearchParams`
     * @see https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/prefer-global/url-search-params.md
     * @default true
     */
    url?: boolean;

    /**
     * Enforce either `URL` or `require("url").URL`
     * @see https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/prefer-global/url.md
     * @default true
     */
    urlSearchParams?: boolean;
  };
}

const pluginRenamer = createPluginObjectRenamer('n', 'node');

export const nodeEslintConfig = (
  options: NodeEslintConfigOptions = {},

  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const {preferGlobal = {}} = options;

  const builder = new ConfigEntryBuilder<'node'>(options, internalOptions);

  builder
    .addConfig(['node', {includeDefaultFilesAndIgnores: true}], {
      plugins: {
        node: eslintPluginNode,
      },
    })
    .addBulkRules(pluginRenamer(eslintPluginNode.configs['flat/recommended'].rules))
    // .addRule('node/callback-return', OFF)
    .addRule('node/exports-style', ERROR, ['module.exports', {allowBatchAssign: false}])
    // .addRule('node/file-extension-in-import', OFF),
    // .addRule('node/global-require', OFF),
    // .addRule('node/handle-callback-err', OFF),
    // .addRule('node/hashbang', ERROR),
    // .addRule('node/no-callback-literal', OFF),
    // .addRule('node/no-deprecated-api', ERROR),
    // .addRule('node/no-exports-assign', ERROR),
    .addRule('node/no-extraneous-import', OFF) // TODO only disable when import plugin is enabled?
    // .addRule('node/no-extraneous-require', ERROR) // TODO handled by import plugin too?
    .addRule('node/no-missing-import', OFF) // TODO only disable when import plugin is enabled?
    // .addRule('node/no-missing-require', ERROR) // TODO handled by import plugin too?
    // .addRule('node/no-mixed-requires', OFF)
    .addRule('node/no-new-require', ERROR)
    .addRule('node/no-path-concat', ERROR)
    // .addRule('node/no-process-env', OFF)
    .addRule('node/no-process-exit', OFF) // The corresponding Unicorn rule is better: https://github.com/sindresorhus/eslint-plugin-unicorn/blob/1deb9bb5edf27fdb2f656add11c924dfa59fdac9/docs/rules/no-process-exit.md
    .addAnyRule('unicorn/no-process-exit', ERROR) // TODO
    // .addRule('node/no-restricted-import', OFF)
    // .addRule('node/no-restricted-require', OFF)
    // .addRule('node/no-sync', OFF)
    // .addRule('node/no-unpublished-bin', ERROR)
    .addRule('node/no-unpublished-import', OFF) // TODO only disable when import plugin is enabled?
    // .addRule('node/no-unpublished-require', ERROR) // TODO handled by import plugin too?
    // .addRule('node/no-unsupported-features/es-builtins', ERROR)
    // .addRule('node/no-unsupported-features/es-syntax', ERROR)
    // .addRule('node/no-unsupported-features/node-builtins', ERROR)
    .addRule('node/prefer-global/buffer', ERROR, [
      preferGlobal.buffer === false ? 'never' : 'always',
    ])
    .addRule('node/prefer-global/console', ERROR, [
      preferGlobal.console === false ? 'never' : 'always',
    ])
    .addRule('node/prefer-global/process', ERROR, [
      preferGlobal.process === false ? 'never' : 'always',
    ])
    .addRule('node/prefer-global/text-decoder', ERROR, [
      preferGlobal.textDecoder === false ? 'never' : 'always',
    ])
    .addRule('node/prefer-global/text-encoder', ERROR, [
      preferGlobal.textEncoder === false ? 'never' : 'always',
    ])
    .addRule('node/prefer-global/url', ERROR, [preferGlobal.url === false ? 'never' : 'always'])
    .addRule('node/prefer-global/url-search-params', ERROR, [
      preferGlobal.urlSearchParams === false ? 'never' : 'always',
    ])
    .addRule('node/prefer-node-protocol', ERROR)
    .addRule('node/prefer-promises/dns', OFF) // TODO enable?
    .addRule('node/prefer-promises/fs', OFF) // TODO enable?
    .addRule('node/process-exit-as-throw', ERROR) // Does not report anything, makes ESLint treat `process.exit()` calls as a stop: https://github.com/eslint-community/eslint-plugin-node/blob/c092cd893010f8da894f87da567c07d69be6cc0d/docs/rules/process-exit-as-throw.md
    .addOverrides();

  return builder.getAllConfigs();
};

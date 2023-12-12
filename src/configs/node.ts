import eslintPluginNode from 'eslint-plugin-n';
import {ERROR, OFF} from '../constants';
import type {ConfigSharedOptions, FlatConfigEntry, InternalConfigOptions} from '../types';
import {createPluginObjectRenamer, genFlatConfigEntryName} from '../utils';

export interface NodeEslintConfigOptions extends ConfigSharedOptions<`node/${string}`> {}

const pluginRenamer = createPluginObjectRenamer('n', 'node');

export const nodeEslintConfig = (
  options: NodeEslintConfigOptions = {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const rules: FlatConfigEntry['rules'] = {
    // 'node/callback-return': OFF,
    'node/exports-style': [
      ERROR,
      'module.exports',
      {
        allowBatchAssign: false,
      },
    ],
    // 'node/file-extension-in-import': OFF,
    // 'node/global-require': OFF,
    // 'node/handle-callback-err': OFF,
    // 'node/hashbang': ERROR,
    // 'node/no-callback-literal': OFF,
    // 'node/no-deprecated-api': ERROR,
    // 'node/no-exports-assign': ERROR,
    // TODO only disable when import plugin is enabled?
    'node/no-extraneous-import': OFF,
    // 'node/no-extraneous-require': ERROR, // TODO handled by import plugin too?
    // TODO only disable when import plugin is enabled?
    'node/no-missing-import': OFF,
    // 'node/no-missing-require': ERROR, // TODO handled by import plugin too?
    // 'node/no-mixed-requires': OFF,
    'node/no-new-require': ERROR,
    'node/no-path-concat': ERROR,
    // 'node/no-process-env': OFF,
    'node/no-process-exit': OFF, // The corresponding Unicorn rule is better: https://github.com/sindresorhus/eslint-plugin-unicorn/blob/1deb9bb5edf27fdb2f656add11c924dfa59fdac9/docs/rules/no-process-exit.md
    'unicorn/no-process-exit': ERROR, // TODO
    // 'node/no-restricted-import': OFF,
    // 'node/no-restricted-require': OFF,
    // 'node/no-sync': OFF,
    // 'node/no-unpublished-bin': ERROR,
    // TODO only disable when import plugin is enabled?
    'node/no-unpublished-import': OFF,
    // 'node/no-unpublished-require': ERROR, // TODO handled by import plugin too?
    // 'node/no-unsupported-features/es-builtins': ERROR,
    // 'node/no-unsupported-features/es-syntax': ERROR,
    // 'node/no-unsupported-features/node-builtins': ERROR,
    'node/prefer-global/buffer': ERROR,
    'node/prefer-global/console': ERROR,
    'node/prefer-global/process': ERROR,
    'node/prefer-global/text-decoder': ERROR,
    'node/prefer-global/text-encoder': ERROR,
    'node/prefer-global/url': ERROR,
    'node/prefer-global/url-search-params': ERROR,
    'node/prefer-node-protocol': ERROR,
    'node/prefer-promises/dns': OFF, // TODO enable?
    'node/prefer-promises/fs': OFF, // TODO enable?
    // Does not report anything, makes ESLint treat `process.exit()` calls as a stop: https://github.com/eslint-community/eslint-plugin-node/blob/c092cd893010f8da894f87da567c07d69be6cc0d/docs/rules/process-exit-as-throw.md
    // 'node/process-exit-as-throw': ERROR,
  };

  return [
    {
      plugins: {
        node: eslintPluginNode,
      },
      ...(options.files && {files: options.files}),
      ...(options.ignores && {ignores: options.ignores}),
      rules: {
        ...pluginRenamer(eslintPluginNode.configs['flat/recommended'].rules || {}),
        ...rules,
        ...options.overrides,
      },
      name: genFlatConfigEntryName('node'),
    },
  ];
};

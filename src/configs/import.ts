import eslintPluginImportX from 'eslint-plugin-import-x';
import {ERROR, OFF} from '../constants';
import type {ConfigSharedOptions, FlatConfigEntry, InternalConfigOptions} from '../types';
import {
  arraify,
  createPluginObjectRenamer,
  genFlatConfigEntryName,
  warnUnlessForcedError,
} from '../utils';

export interface ImportEslintConfigOptions extends ConfigSharedOptions<'import'> {
  /**
   * Recognized automatically and normally should not be set manually
   */
  isTypescriptEnabled?: boolean;
  /**
   * @see https://github.com/import-js/eslint-plugin-import/blob/fc361a9998b14b9528d841d8349078a5af2da436/docs/rules/no-unresolved.md#ignore
   */
  importPatternsToIgnoreWhenTryingToResolve?: string | string[];
  /**
   * - `false` - never require extensions
   * - `true` - require extensions for JS/TS-like files
   * - `object` - granular settings for specific packages, use `*` key for setting the default for all extensions
   * @default false
   */
  requireModuleExtensions?: boolean | Record<string, 'always' | 'never' | 'ignorePackages'>;
}

const pluginRenamer = createPluginObjectRenamer('import-x', 'import');

export const importEslintConfig = (
  options: ImportEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const {isTypescriptEnabled} = options;

  const noUnresolvedIgnores = arraify(options.importPatternsToIgnoreWhenTryingToResolve);

  const rules: FlatConfigEntry['rules'] = {
    // 'import/consistent-type-specifier-style': OFF,
    // 'import/default': ERROR,
    // 'import/dynamic-import-chunkname': OFF,
    // 'import/export': ERROR,
    // 'import/exports-last': OFF,
    'import/extensions': [
      options.requireModuleExtensions ? ERROR : OFF,
      (typeof options.requireModuleExtensions === 'object' &&
        options.requireModuleExtensions['*']) ||
        'ignorePackages',
      {
        ...(options.requireModuleExtensions === true &&
          Object.fromEntries(
            ['js', 'cjs', 'mjs', 'ts', 'cts', 'mts', 'jsx', 'tsx'].map((ext) => [ext, 'always']),
          )),
        ...(typeof options.requireModuleExtensions === 'object' && options.requireModuleExtensions),
      },
    ],
    'import/first': ERROR,
    // 'import/group-exports': OFF,
    // 'import/max-dependencies': OFF,
    // 'import/named': ERROR | OFF, // disabled in TS config
    // 'import/namespace': ERROR,
    'import/newline-after-import': ERROR,
    'import/no-absolute-path': ERROR,
    // 'import/no-amd': OFF,
    // 'import/no-anonymous-default-export': OFF,
    // 'import/no-commonjs': OFF,
    ...warnUnlessForcedError(internalOptions, 'import/no-cycle'),
    'import/no-default-export': ERROR,
    ...warnUnlessForcedError(internalOptions, 'import/no-deprecated'),
    // 'import/no-duplicates': ERROR,
    // 'import/no-dynamic-require': OFF,
    'import/no-empty-named-blocks': ERROR,
    'import/no-extraneous-dependencies': [ERROR, {peerDependencies: false}],
    // 'import/no-import-module-exports': OFF, // TODO enable?
    // 'import/no-internal-modules': OFF,
    ...warnUnlessForcedError(internalOptions, 'import/no-mutable-exports'),
    'import/no-named-as-default-member': OFF,
    'import/no-named-as-default': OFF, // Not very useful + false positives for axios@1.6.7?
    // 'import/no-named-default': OFF,
    // 'import/no-named-export': OFF,
    // 'import/no-namespace': OFF,
    // 'import/no-nodejs-modules': OFF, // TODO
    // 'import/no-relative-packages': OFF,
    // 'import/no-relative-parent-imports': OFF,
    // 'import/no-restricted-paths': OFF,
    'import/no-self-import': ERROR,
    // 'import/no-unassigned-import': OFF,
    'import/no-unresolved': [
      ERROR,
      {
        ...(noUnresolvedIgnores.length > 0 && {
          ignore: noUnresolvedIgnores as [string, ...string[]],
        }),
      },
    ],
    // 'import/no-unused-modules': OFF,
    ...warnUnlessForcedError(internalOptions, 'import/no-useless-path-segments'),
    'import/no-webpack-loader-syntax': ERROR,
    'import/order': [
      ERROR,
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        alphabetize: {order: 'asc'},
      },
    ],
    // 'import/prefer-default-export': OFF,
    // 'import/unambiguous': OFF,
  };

  return [
    {
      plugins: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        import: eslintPluginImportX as any,
      },
      ...(options.files && {files: options.files}),
      ...(options.ignores && {ignores: options.ignores}),
      settings: {
        ...(isTypescriptEnabled && eslintPluginImportX.configs.typescript.settings),
        'import-x/resolver': {
          ...(isTypescriptEnabled && {
            typescript: {
              project: true,
              alwaysTryTypes: true,
            },
          }),
          node: true, // TODO
        },
        ...(isTypescriptEnabled && {
          'import-x/parsers': {
            '@typescript-eslint/parser': ['.ts', '.cts', '.mts', '.tsx', '.ctsx', '.mtsx'],
          },
        }),
      },
      rules: {
        ...pluginRenamer(eslintPluginImportX.configs.recommended.rules),
        ...(isTypescriptEnabled && pluginRenamer(eslintPluginImportX.configs.typescript.rules)),
        ...rules,
        ...options.overrides,
      },
      name: genFlatConfigEntryName('import'),
    },
  ];
};

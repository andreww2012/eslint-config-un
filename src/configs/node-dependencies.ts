import {ERROR, OFF, WARNING} from '../constants';
import {type GetRuleOptions, type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults, interopDefault} from '../utils';
import {DEFAULT_FILES_PACKAGE_JSON} from './package-json';
import type {UnConfigFn} from './index';

export interface NodeDependenciesEslintConfigOptions extends UnConfigOptions<'node-dependencies'> {
  /**
   * - `true`: enforces to use the absolute version only on `dependencies` and `devDependencies`.
   * - `'never'`: enforces not to use the absolute version.
   * - `false`: do not enforce anything.
   *
   * Affected rules:
   * - [`absolute-version`](https://ota-meshi.github.io/eslint-plugin-node-dependencies/rules/absolute-version.html)
   * @default false
   */
  enforceAbsoluteVersion?:
    | boolean
    | 'never'
    | (GetRuleOptions<'node-dependencies', 'absolute-version'>[0] & object);
}

export const nodeDependenciesUnConfig: UnConfigFn<'nodeDependencies'> = async (context) => {
  const jsoncEslintParser = await interopDefault(import('jsonc-eslint-parser'));

  const optionsRaw = context.rootOptions.configs?.nodeDependencies;
  const optionsResolved = assignDefaults(optionsRaw, {
    enforceAbsoluteVersion: false,
  } satisfies NodeDependenciesEslintConfigOptions);

  const {enforceAbsoluteVersion} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'node-dependencies');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(
      [
        'node-dependencies',
        {includeDefaultFilesAndIgnores: true, filesFallback: DEFAULT_FILES_PACKAGE_JSON},
      ],
      {
        languageOptions: {
          parser: jsoncEslintParser,
        },
      },
    )
    .markCategory('Possible Errors')
    .addRule('compat-engines', WARNING) /** @since 0.5.0 */ // 🟢
    .addRule('no-dupe-deps', ERROR) /** @since 0.8.0 */ // 🟢
    .addRule('valid-semver', ERROR) /** @since 0.1.0 */ // 🟢
    .markCategory('Best Practices')
    .addRule(
      'absolute-version',
      enforceAbsoluteVersion ? ERROR : OFF,
      enforceAbsoluteVersion
        ? [
            enforceAbsoluteVersion === true
              ? {
                  optionalDependencies: 'ignore',
                  peerDependencies: 'ignore',
                }
              : enforceAbsoluteVersion,
          ]
        : [],
    ) /** @since 0.7.0 */
    .addRule('no-deprecated', WARNING, [{devDependencies: true}]) /** @since 0.2.0 */
    // TODO option to restrict packages with modern alternatives?
    .addRule('no-restricted-deps', OFF) /** @since 0.8.0 */
    .markCategory('Stylistic Issues')
    .addRule('prefer-caret-range-version', OFF) /** @since 0.8.0 */
    .addRule('prefer-tilde-range-version', OFF) /** @since 0.8.0 */
    .enableConfigTesterForPlugin('node-dependencies')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

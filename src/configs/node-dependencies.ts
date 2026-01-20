import {ERROR, GLOB_PACKAGE_JSON, OFF, WARNING} from '../constants';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

export interface NodeDependenciesEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, 'node-dependencies'> {
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
    | (GetRuleOptions<'node-dependencies', 'absolute-version'> & object);
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    enforceAbsoluteVersion: false,
  } satisfies NodeDependenciesEslintConfigOptions);

  const {enforceAbsoluteVersion} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'node-dependencies');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'node-dependencies',
      {
        includeDefaultFilesAndIgnores: true,
        filesDefault: [GLOB_PACKAGE_JSON],
        parser: 'jsonc-eslint-parser',
      },
    ])
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
    .addRule('require-provenance-deps', OFF) /** @since 1.2.0 */
    .enableConfigTesterForPlugin('node-dependencies')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'nodeDependencies'>;

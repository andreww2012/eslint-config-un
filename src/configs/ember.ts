// cspell:ignore runloop tagless
import {ERROR, GLOB_JS_TS, GLOB_JS_TS_EXTENSION, OFF, WARNING} from '../constants';
import {
  type NoOnlyTestsSubConfigEnabledByDefault,
  RULES_TO_DISABLE_IN_TEST_FILES,
  generateConfigNoOnlyTestsBuilder,
  generateDefaultTestFiles,
} from './shared';
import {
  type ExtraPluginsType,
  type GetRuleNamesInPlugin,
  type GetRuleOptions,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface EmberEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'ember'> {
  /**
   * Rules specific to files with tests.
   */
  configTestFiles?:
    | boolean
    | (UnFlatConfigEntryBase<ExtraPlugins, 'ember'> &
        NoOnlyTestsSubConfigEnabledByDefault<ExtraPlugins>);

  /**
   * Affected rules:
   * - [`computed-property-getters`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/computed-property-getters.md)
   */
  enforceGettersInComputedProperties?: GetRuleOptions<'ember', 'computed-property-getters'>;

  /**
   * Affected rules:
   * - [`no-classic-components`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/no-classic-components.md)
   * @default true
   */
  enforceGlimmerComponents?: boolean;
}

const GLIMMER_TEMPLATES_FILES = ['**/*.{gjs,gts}'] as const;

const EMBER_TESTING_RELATED_RULES = new Set<string>([
  'no-current-route-name',
  'no-ember-testing-in-module-scope',
  'no-invalid-test-waiters',
  'no-legacy-test-waiters',
  'no-noop-setup-on-error-in-before',
  'no-pause-test',
  'no-replace-test-comments',
  'no-restricted-resolver-tests',
  'no-settled-after-test-helper',
  'no-test-and-then',
  'no-test-import-export',
  'no-test-module-for',
  'no-test-this-render',
  'prefer-ember-test-helpers',
  'require-valid-css-selector-in-test-helpers',
] satisfies GetRuleNamesInPlugin<'ember'>[]);

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configTestFiles: true,
    enforceGlimmerComponents: true,
  } satisfies EmberEslintConfigOptions);

  const {configTestFiles, enforceGettersInComputedProperties, enforceGlimmerComponents} =
    optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'ember');

  configBuilder?.addConfig([
    'ember/glimmer-templates',
    {
      filesDefault: [...GLIMMER_TEMPLATES_FILES],
      parser: 'ember-eslint-parser',
    },
  ]);

  // Legend:
  // 🟢 - in recommended
  // 🟠 - in recommended-gjs
  // 🔵 - in recommended-gts

  configBuilder
    ?.addConfig([
      'ember',
      {
        includeDefaultFilesAndIgnores: true,
        filesDefault: [GLOB_JS_TS, ...GLIMMER_TEMPLATES_FILES],
      },
    ])
    .markCategory('Components')
    .addRule('no-attrs-in-components', ERROR) /** @since 4.1.0 */ // 🟢
    .addRule('no-attrs-snapshot', ERROR) /** @since 4.0.0 */ // 🟢
    .addRule('no-builtin-form-components', WARNING) /** @since 12.7.0 */
    .addRule('no-classic-components', enforceGlimmerComponents ? ERROR : OFF) /** @since 7.3.0 */ // 🟢
    .addRule('no-component-lifecycle-hooks', ERROR) /** @since 7.9.0 */ // 🟢
    .addRule('no-on-calls-in-components', ERROR) /** @since 2.0.0 */ // 🟢
    .addRule('require-tagless-components', ERROR) /** @since 7.3.0 */ // 🟢
    .markCategory('Computed Properties')
    .addRule(
      'computed-property-getters',
      enforceGettersInComputedProperties == null ? OFF : ERROR,
      enforceGettersInComputedProperties == null ? [] : [enforceGettersInComputedProperties],
    ) /** @since 6.5.0 */
    .addRule('no-arrow-function-computed-properties', ERROR) /** @since 6.8.0 */ // 🟢
    .addRule(
      'no-assignment-of-untracked-properties-used-in-tracking-contexts',
      ERROR,
    ) /** @since 8.8.0 */ // 🟢
    .addRule('no-computed-properties-in-native-classes', ERROR) /** @since 7.3.0 */ // 🟢
    .addRule('no-deeply-nested-dependent-keys-with-each', ERROR) /** @since 6.2.0 */ // 🟢
    .addRule('no-duplicate-dependent-keys', ERROR) /** @since 4.3.0 */ // 🟢
    .addRule('no-incorrect-computed-macros', ERROR) /** @since 7.11.0 */ // 🟢
    .addRule('no-invalid-dependent-keys', ERROR) /** @since 7.11.0 */ // 🟢
    .addRule('no-side-effects', ERROR) /** @since 2.0.0 */ // 🟢
    .addRule('no-volatile-computed-properties', ERROR) /** @since 6.7.0 */ // 🟢
    .addRule('require-computed-macros', ERROR) /** @since 6.6.0 */ // 🟢
    .addRule('require-computed-property-dependencies', ERROR) /** @since 6.9.0 */ // 🟢
    .addRule('require-return-from-computed', ERROR) /** @since 6.3.0 */ // 🟢
    .addRule('use-brace-expansion', ERROR) /** @since 2.0.0 */ // 🟢
    .markCategory('Controllers')
    .addRule('alias-model-in-controller', OFF) /** @since 2.0.0 */
    .addRule('avoid-using-needs-in-controllers', ERROR) /** @since 5.4.0 */ // 🟢
    // "This rule will not be added to the recommended configuration until controller usage has become less common / deprecated"
    .addRule('no-controllers', OFF) /** @since 7.8.0 */
    .markCategory('Deprecations')
    .addRule('closure-actions', ERROR) /** @since 2.0.0 */ // 🟢
    .addRule('new-module-imports', ERROR) /** @since 4.2.0 */ // 🟢
    // "This rule is not in the recommended configuration because of the risk of false positives"
    .addRule('no-array-prototype-extensions', ERROR) /** @since 10.6.0 */
    .addRule('no-at-ember-render-modifiers', ERROR) /** @since 11.10.0 */ // 🟢
    .addRule('no-deprecated-router-transition-methods', ERROR) /** @since 11.4.0 */ // 🟢
    .addRule('no-function-prototype-extensions', ERROR) /** @since 2.0.0 */ // 🟢
    .addRule('no-implicit-injections', ERROR) /** @since 11.4.0 */ // 🟢
    .addRule('no-mixins', ERROR) /** @since 7.10.0 */ // 🟢
    .addRule('no-new-mixins', ERROR) /** @since 5.3.0 */ // 🟢
    .addRule('no-observers', ERROR) /** @since 2.0.0 */ // 🟢
    .addRule('no-old-shims', ERROR) /** @since 3.6.0 */ // 🟢
    .addRule('no-string-prototype-extensions', ERROR) /** @since 9.4.0 */ // 🟢
    .markCategory('Ember Data')
    // "This rule is not in the recommended configuration because the Ember Data team recommends not using transforms unless you actually want to transform something"
    .addRule('no-empty-attrs', OFF) /** @since 2.0.0 */
    .addRule('require-async-inverse-relationship', ERROR) /** @since 12.2.0 */
    .addRule('use-ember-data-rfc-395-imports', ERROR) /** @since 6.8.0 */ // 🟢
    .markCategory('Ember Object')
    .addRule('avoid-leaking-state-in-ember-objects', ERROR) /** @since 4.6.0 */ // 🟢
    .addRule('no-get', ERROR) /** @since 6.4.0 */ // 🟢
    .addRule('no-get-with-default', ERROR) /** @since 7.6.0 */ // 🟢
    // "This rule is not in the recommended configuration because there are legitimate usages of proxies"
    .addRule('no-proxies', ERROR) /** @since 6.8.0 */
    .addRule('no-try-invoke', ERROR) /** @since 9.3.0 */ // 🟢
    .addRule('require-super-in-lifecycle-hooks', ERROR) /** @since 10.0.0 */ // 🟢
    .addRule('use-ember-get-and-set', OFF) /** @since 2.0.0 */
    .markCategory('Ember Octane')
    .addRule('classic-decorator-hooks', ERROR) /** @since 6.7.0 */ // 🟢
    .addRule('classic-decorator-no-classic-methods', ERROR) /** @since 6.7.0 */ // 🟢
    .addRule('no-actions-hash', ERROR) /** @since 7.3.0 */ // 🟢
    .addRule('no-classic-classes', ERROR) /** @since 7.3.0 */ // 🟢
    .addRule('no-ember-super-in-es-classes', ERROR) /** @since 6.1.0 */ // 🟢
    .addRule('no-empty-glimmer-component-classes', ERROR) /** @since 9.5.0 */ // 🟢
    .addRule('no-tracked-properties-from-args', ERROR) /** @since 11.3.0 */ // 🟢
    .addRule('template-indent', OFF) /** @since 12.0.0-alpha.0 */
    .addRule('template-no-let-reference', ERROR) /** @since 12.0.0-alpha.0 */ // 🟠🔵
    .markCategory('jQuery')
    .addRule('jquery-ember-run', ERROR) /** @since 2.0.0 */ // 🟢
    .addRule('no-global-jquery', ERROR) /** @since 4.1.0 */ // 🟢
    .addRule('no-jquery', ERROR) /** @since 4.5.0 */ // 🟢
    .markCategory('Miscellaneous')
    .addRule('named-functions-in-promises', OFF) /** @since 2.0.0 */
    // "This rule is not in the recommended configuration because there are legitimate usages of `htmlSafe`"
    .addRule('no-html-safe', ERROR) /** @since 10.2.0 */
    .addRule('no-incorrect-calls-with-inline-anonymous-functions', ERROR) /** @since 6.10.0 */ // 🟢
    .addRule('no-invalid-debug-function-arguments', ERROR) /** @since 6.2.0 */ // 🟢
    .addRule('no-restricted-property-modifications', OFF) /** @since 10.5.0 */
    .addRule('no-runloop', ERROR) /** @since 11.3.0 */ // 🟢
    .addRule('require-fetch-import', OFF) /** @since 10.1.0 */
    .markCategory('Routes')
    // Not stylistic because "when you accidentally uppercase any of your routes or create upper-cased route using ember-cli the application will crash without any clear information what's wrong"
    .addRule('no-capital-letters-in-routes', ERROR) /** @since 3.4.0 */ // 🟢
    .addRule('no-controller-access-in-routes', ERROR) /** @since 8.10.0 */ // 🟢
    .addRule('no-private-routing-service', ERROR) /** @since 7.10.0 */ // 🟢
    .addRule('no-shadow-route-definition', ERROR) /** @since 9.4.0 */ // 🟢
    .addRule('no-unnecessary-index-route', ERROR) /** @since 6.3.0 */
    .addRule('no-unnecessary-route-path-option', ERROR) /** @since 6.2.0 */ // 🟢
    // "Enforces usage of kebab-case (instead of snake_case or camelCase) in route paths"
    .addRule('route-path-style', ERROR) /** @since 6.3.0 */
    .addRule('routes-segments-snake-case', ERROR) /** @since 2.0.0 */ // 🟢
    .markCategory('Services')
    // "This rule is not in the recommended configuration because it is somewhat of a stylistic preference and it's not always necessary to explicitly include the service injection argument"
    .addRule('no-implicit-service-injection-argument', OFF) /** @since 10.5.0 */
    .addRule('no-restricted-service-injections', OFF) /** @since 8.6.0 */
    // "This rule is not in the recommended configuration because this is more of a stylistic preference and some developers may prefer to use the explicit service injection argument to avoid potentially costly lookup/normalization of the service name"
    .addRule('no-unnecessary-service-injection-argument', OFF) /** @since 6.3.0 */
    // "This rule can exhibit false positives <...> Given these significant limitations, the rule is not currently recommended for production usage, but some may find it useful to experiment with. The rule will not be added to the recommended configuration unless the limitations can be addressed"
    .addRule('no-unused-services', ERROR) /** @since 10.4.0 */
    .markCategory('Stylistic Issues')
    .addRule('order-in-components', ERROR) /** @since 2.0.0 */
    .addRule('order-in-controllers', ERROR) /** @since 2.0.0 */
    .addRule('order-in-models', ERROR) /** @since 2.0.0 */
    .addRule('order-in-routes', ERROR) /** @since 2.0.0 */
    .markCategory('Testing')
    .addRule('no-test-support-import', ERROR) /** @since 9.2.0 */ // 🟢
    .enableConfigTesterForPlugin('ember', {
      rulesToSkipInConfig: (ruleName) => EMBER_TESTING_RELATED_RULES.has(ruleName),
    })
    .addOverrides();

  const configBuilderTests = context.createConfigBuilder(configTestFiles, 'ember');

  const configTestsFilesFallback = generateDefaultTestFiles(GLOB_JS_TS_EXTENSION);

  configBuilderTests
    ?.addConfig([
      'ember/tests',
      {
        includeDefaultFilesAndIgnores: true,
        filesDefault: configTestsFilesFallback,
      },
    ])
    .addRule('no-current-route-name', ERROR) /** @since 10.1.0 */
    .addRule('no-ember-testing-in-module-scope', ERROR) /** @since 5.3.0 */ // 🟢
    .addRule('no-invalid-test-waiters', ERROR) /** @since 7.12.0 */ // 🟢
    .addRule('no-legacy-test-waiters', ERROR) /** @since 7.9.0 */ // 🟢
    .addRule('no-noop-setup-on-error-in-before', ERROR) /** @since 8.13.0 */ // 🟢
    .addRule('no-pause-test', ERROR) /** @since 7.1.0 */ // 🟢
    // "This rule will not be added to the recommended configuration because it would cause the default ember-cli blueprint to contain lint violations"
    .addRule('no-replace-test-comments', WARNING) /** @since 7.11.0 */
    .addRule('no-restricted-resolver-tests', ERROR) /** @since 5.3.0 */ // 🟢
    .addRule('no-settled-after-test-helper', ERROR) /** @since 9.4.0 */ // 🟢
    .addRule('no-test-and-then', ERROR) /** @since 6.2.0 */ // 🟢
    .addRule('no-test-import-export', ERROR) /** @since 5.3.0 */ // 🟢
    .addRule('no-test-module-for', ERROR) /** @since 7.4.0 */ // 🟢
    .addRule('no-test-this-render', ERROR) /** @since 8.4.0 */ // 🟢
    .addRule('prefer-ember-test-helpers', ERROR) /** @since 8.4.0 */ // 🟢
    .addRule('require-valid-css-selector-in-test-helpers', ERROR) /** @since 9.4.0 */ // 🟢
    .disableBulkRules(RULES_TO_DISABLE_IN_TEST_FILES)
    .enableConfigTesterForPlugin('ember', {
      rulesToSkipInConfig: (ruleName) => !EMBER_TESTING_RELATED_RULES.has(ruleName),
    })
    .addOverrides();

  const configBuilderNoOnlyTests = generateConfigNoOnlyTestsBuilder(
    context,
    'ember',
    (typeof configTestFiles === 'object' ? configTestFiles.configNoOnlyTests : null) ?? true,
    configTestFiles,
    {filesDefault: configTestsFilesFallback},
  );

  return {
    configs: [configBuilder, configBuilderTests, configBuilderNoOnlyTests],
    optionsResolved,
  };
}) satisfies UnConfigFn<'ember'>;

// cspell:ignore runloop tagless
import {ERROR, GLOB_JS_TS, GLOB_JS_TS_EXTENSION, OFF, WARNING} from '../constants';
import {type GetRuleOptions, type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults, interopDefault} from '../utils';
import {generateDefaultTestFiles} from './shared';
import type {UnConfigFn} from './index';

export interface EmberEslintConfigOptions extends UnConfigOptions<'ember'> {
  /**
   * Rules specific to files with tests.
   */
  configTestFiles?: boolean | UnConfigOptions<'ember'>;

  /**
   * Affected rules:
   * - [`computed-property-getters`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/computed-property-getters.md)
   */
  enforceGettersInComputedProperties?: GetRuleOptions<'ember', 'computed-property-getters'>[0];

  /**
   * Affected rules:
   * - [`no-classic-components`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/no-classic-components.md)
   * @default true
   */
  enforceGlimmerComponents?: boolean;
}

const GLIMMER_TEMPLATES_FILES = ['**/*.{gjs,gts}'] as const;

export const emberUnConfig: UnConfigFn<'ember'> = async (context) => {
  const emberEslintParser = await interopDefault(import('ember-eslint-parser'));

  const optionsRaw = context.rootOptions.configs?.ember;
  const optionsResolved = assignDefaults(optionsRaw, {
    configTestFiles: true,
    enforceGlimmerComponents: true,
  } satisfies EmberEslintConfigOptions);

  const {configTestFiles, enforceGettersInComputedProperties, enforceGlimmerComponents} =
    optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'ember');

  configBuilder?.addConfig(
    [
      'ember/glimmer-templates',
      {
        filesFallback: [...GLIMMER_TEMPLATES_FILES],
      },
    ],
    {
      languageOptions: {
        parser: emberEslintParser,
      },
    },
  );

  // Legend:
  // 🟢 - in recommended
  // 🟠 - in recommended-gjs
  // 🔵 - in recommended-gts

  configBuilder
    ?.addConfig([
      'ember',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: [GLOB_JS_TS, ...GLIMMER_TEMPLATES_FILES],
      },
    ])
    /* Category: Components */
    .addRule('no-attrs-in-components', ERROR) // 🟢
    .addRule('no-attrs-snapshot', ERROR) // 🟢
    .addRule('no-classic-components', enforceGlimmerComponents ? ERROR : OFF) // 🟢
    .addRule('no-component-lifecycle-hooks', ERROR) // 🟢
    .addRule('no-on-calls-in-components', ERROR) // 🟢
    .addRule('require-tagless-components', ERROR) // 🟢
    /* Category: Computed Properties */
    .addRule(
      'computed-property-getters',
      enforceGettersInComputedProperties == null ? OFF : ERROR,
      enforceGettersInComputedProperties == null ? [] : [enforceGettersInComputedProperties],
    )
    .addRule('no-arrow-function-computed-properties', ERROR) // 🟢
    .addRule('no-assignment-of-untracked-properties-used-in-tracking-contexts', ERROR) // 🟢
    .addRule('no-computed-properties-in-native-classes', ERROR) // 🟢
    .addRule('no-deeply-nested-dependent-keys-with-each', ERROR) // 🟢
    .addRule('no-duplicate-dependent-keys', ERROR) // 🟢
    .addRule('no-incorrect-computed-macros', ERROR) // 🟢
    .addRule('no-invalid-dependent-keys', ERROR) // 🟢
    .addRule('no-side-effects', ERROR) // 🟢
    .addRule('no-volatile-computed-properties', ERROR) // 🟢
    .addRule('require-computed-macros', ERROR) // 🟢
    .addRule('require-computed-property-dependencies', ERROR) // 🟢
    .addRule('require-return-from-computed', ERROR) // 🟢
    .addRule('use-brace-expansion', ERROR) // 🟢
    /* Category: Controllers */
    .addRule('alias-model-in-controller', OFF)
    .addRule('avoid-using-needs-in-controllers', ERROR) // 🟢
    // "This rule will not be added to the recommended configuration until controller usage has become less common / deprecated"
    .addRule('no-controllers', OFF)
    /* Category: Deprecations */
    .addRule('closure-actions', ERROR) // 🟢
    .addRule('new-module-imports', ERROR) // 🟢
    // "This rule is not in the recommended configuration because of the risk of false positives"
    .addRule('no-array-prototype-extensions', ERROR)
    .addRule('no-at-ember-render-modifiers', ERROR) // 🟢
    .addRule('no-deprecated-router-transition-methods', ERROR) // 🟢
    .addRule('no-function-prototype-extensions', ERROR) // 🟢
    .addRule('no-implicit-injections', ERROR) // 🟢
    .addRule('no-mixins', ERROR) // 🟢
    .addRule('no-new-mixins', ERROR) // 🟢
    .addRule('no-observers', ERROR) // 🟢
    .addRule('no-old-shims', ERROR) // 🟢
    .addRule('no-string-prototype-extensions', ERROR) // 🟢
    /* Category: Ember Data */
    // "This rule is not in the recommended configuration because the Ember Data team recommends not using transforms unless you actually want to transform something"
    .addRule('no-empty-attrs', OFF)
    .addRule('require-async-inverse-relationship', ERROR)
    .addRule('use-ember-data-rfc-395-imports', ERROR) // 🟢
    /* Category: Ember Object */
    .addRule('avoid-leaking-state-in-ember-objects', ERROR) // 🟢
    .addRule('no-get', ERROR) // 🟢
    .addRule('no-get-with-default', ERROR) // 🟢
    // "This rule is not in the recommended configuration because there are legitimate usages of proxies"
    .addRule('no-proxies', ERROR)
    .addRule('no-try-invoke', ERROR) // 🟢
    .addRule('require-super-in-lifecycle-hooks', ERROR) // 🟢
    .addRule('use-ember-get-and-set', OFF)
    /* Category: Ember Octane */
    .addRule('classic-decorator-hooks', ERROR) // 🟢
    .addRule('classic-decorator-no-classic-methods', ERROR) // 🟢
    .addRule('no-actions-hash', ERROR) // 🟢
    .addRule('no-classic-classes', ERROR) // 🟢
    .addRule('no-ember-super-in-es-classes', ERROR) // 🟢
    .addRule('no-empty-glimmer-component-classes', ERROR) // 🟢
    .addRule('no-tracked-properties-from-args', ERROR) // 🟢
    .addRule('template-indent', OFF)
    .addRule('template-no-let-reference', ERROR) // 🟠🔵
    /* Category: jQuery */
    .addRule('jquery-ember-run', ERROR) // 🟢
    .addRule('no-global-jquery', ERROR) // 🟢
    .addRule('no-jquery', ERROR) // 🟢
    /* Category: Miscellaneous */
    .addRule('named-functions-in-promises', OFF)
    // "This rule is not in the recommended configuration because there are legitimate usages of `htmlSafe`"
    .addRule('no-html-safe', ERROR)
    .addRule('no-incorrect-calls-with-inline-anonymous-functions', ERROR) // 🟢
    .addRule('no-invalid-debug-function-arguments', ERROR) // 🟢
    .addRule('no-restricted-property-modifications', OFF)
    .addRule('no-runloop', ERROR) // 🟢
    .addRule('require-fetch-import', OFF)
    /* Category: Routes */
    // Not stylistic because "when you accidentally uppercase any of your routes or create upper-cased route using ember-cli the application will crash without any clear information what's wrong"
    .addRule('no-capital-letters-in-routes', ERROR) // 🟢
    .addRule('no-controller-access-in-routes', ERROR) // 🟢
    .addRule('no-private-routing-service', ERROR) // 🟢
    .addRule('no-shadow-route-definition', ERROR) // 🟢
    .addRule('no-unnecessary-index-route', ERROR)
    .addRule('no-unnecessary-route-path-option', ERROR) // 🟢
    // "Enforces usage of kebab-case (instead of snake_case or camelCase) in route paths"
    .addRule('route-path-style', ERROR)
    .addRule('routes-segments-snake-case', ERROR) // 🟢
    /* Category: Services */
    // "This rule is not in the recommended configuration because it is somewhat of a stylistic preference and it's not always necessary to explicitly include the service injection argument"
    .addRule('no-implicit-service-injection-argument', OFF)
    .addRule('no-restricted-service-injections', OFF)
    // "This rule is not in the recommended configuration because this is more of a stylistic preference and some developers may prefer to use the explicit service injection argument to avoid potentially costly lookup/normalization of the service name"
    .addRule('no-unnecessary-service-injection-argument', OFF)
    // "This rule can exhibit false positives <...> Given these significant limitations, the rule is not currently recommended for production usage, but some may find it useful to experiment with. The rule will not be added to the recommended configuration unless the limitations can be addressed"
    .addRule('no-unused-services', ERROR)
    /* Category: Stylistic Issues */
    .addRule('order-in-components', ERROR)
    .addRule('order-in-controllers', ERROR)
    .addRule('order-in-models', ERROR)
    .addRule('order-in-routes', ERROR)
    /* Category: Testing */
    .addRule('no-test-support-import', ERROR) // 🟢
    .addOverrides();

  const configBuilderTests = createConfigBuilder(context, configTestFiles, 'ember');

  configBuilderTests
    ?.addConfig([
      'ember/tests',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: generateDefaultTestFiles(GLOB_JS_TS_EXTENSION),
      },
    ])
    .addRule('no-current-route-name', ERROR)
    .addRule('no-ember-testing-in-module-scope', ERROR) // 🟢
    .addRule('no-invalid-test-waiters', ERROR) // 🟢
    .addRule('no-legacy-test-waiters', ERROR) // 🟢
    .addRule('no-noop-setup-on-error-in-before', ERROR) // 🟢
    .addRule('no-pause-test', ERROR) // 🟢
    // "This rule will not be added to the recommended configuration because it would cause the default ember-cli blueprint to contain lint violations"
    .addRule('no-replace-test-comments', WARNING)
    .addRule('no-restricted-resolver-tests', ERROR) // 🟢
    .addRule('no-settled-after-test-helper', ERROR) // 🟢
    .addRule('no-test-and-then', ERROR) // 🟢
    .addRule('no-test-import-export', ERROR) // 🟢
    .addRule('no-test-module-for', ERROR) // 🟢
    .addRule('no-test-this-render', ERROR) // 🟢
    .addRule('prefer-ember-test-helpers', ERROR) // 🟢
    .addRule('require-valid-css-selector-in-test-helpers', ERROR) // 🟢
    .addOverrides();

  return {
    configs: [configBuilder, configBuilderTests],
    optionsResolved,
  };
};

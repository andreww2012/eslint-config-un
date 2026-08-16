import {ERROR, GLOB_TS, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [NestJS](https://nestjs.com) specific rules.
 *
 * ⚠️ WARNING: make sure that the linted files are provided with type information.
 * For that, they must be included in `files` array of `ts/configTypeAware` config (they are by
 * default).
 *
 * 📁 Default `files`: <code>**&#47*.?([cm])ts</code>
 */
export interface NestJsEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'nestjs'> {}

// eslint-disable-next-line case-police/string-check
export default defineUnConfig<NestJsEslintConfigOptions>('nestJs', {
  enabledBy: {package: '@nestjs/core'},
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'nestjs');

  // Legend:
  // 🔴 - NOT in recommended
  // 💭 - requires type information

  configBuilder
    ?.addConfig([
      'nest-js',
      {
        filesDefault: [GLOB_TS],
      },
    ])
    .markCategory('Nest Modules and Dependency Injection')
    .addRule('injectable-should-be-provided', ERROR) /** @since 1.0.0 */
    .addRule('provided-injected-should-match-factory-parameters', ERROR) /** @since 1.0.0 */
    .addRule('use-dependency-injection', OFF) /** @since 6.17.0 */ // 🔴
    .addRule('use-injectable-provided-token', ERROR) /** @since 6.10.0 */
    .markCategory('Nest Swagger')
    .addRule('api-enum-property-best-practices', ERROR) /** @since 1.7.0 */ // 💭
    .addRule('api-method-should-specify-api-operation', ERROR) /** @since 1.6.0 */
    .addRule('api-method-should-specify-api-response', ERROR) /** @since 2.0.0 */
    .addRule('api-operation-summary-description-capitalized', ERROR) /** @since 6.2.0 */
    .addRule('api-property-matches-property-optionality', ERROR) /** @since 1.4.0 */
    .addRule('api-property-returning-array-should-set-array', ERROR) /** @since 1.7.0 */
    .addRule('api-property-should-have-api-extra-models', ERROR) /** @since 6.12.0 */
    .addRule('controllers-should-supply-api-tags', ERROR) /** @since 1.6.0 */
    .markCategory('Preventing bugs')
    .addRule('all-properties-are-whitelisted', ERROR) /** @since 3.8.0 */
    .addRule('all-properties-have-explicit-defined', ERROR) /** @since 3.15.0 */ // 💭
    .addRule('no-duplicate-decorators', ERROR) /** @since 4.3.0 */
    .addRule('param-decorator-name-matches-route-param', ERROR) /** @since 3.3.0 */
    .addRule('validate-nested-of-array-should-set-each', ERROR) /** @since 3.5.0 */
    .addRule('validated-non-primitive-property-needs-type-decorator', ERROR) /** @since 3.5.0 */ // 💭
    .addRule('validation-pipe-should-use-forbid-unknown', ERROR) /** @since 3.2.0 */ // Renamed from `should-specify-forbid-unknown-values` in v7.0.0
    .markCategory('Security')
    .addRule('api-methods-should-be-guarded', OFF) /** @since 3.19.0 */ // 🔴
    .markCategory('Code Consistency')
    .addRule('sort-module-metadata-arrays', OFF) /** @since 3.22.0 */ // 🔴
    .addRule('use-correct-endpoint-naming-convention', OFF) /** @since 6.11.0 */ // 🔴
    .enableConfigTesterForPlugin('nestjs')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});

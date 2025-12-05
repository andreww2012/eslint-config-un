import {ERROR, GLOB_TS, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

export interface NestJsEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, 'nestjs'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(
    optionsRaw,
    {} satisfies Partial<NestJsEslintConfigOptions>,
  );

  const configBuilder = context.createConfigBuilder(optionsResolved, 'nestjs');

  // Legend:
  // 🔴 - NOT in recommended
  // 💭 - requires type information

  configBuilder
    ?.addConfig([
      'nest-js',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: [GLOB_TS],
      },
    ])
    .markCategory('Nest Modules and Dependency Injection')
    .addRule('injectable-should-be-provided', ERROR) /** @since 1.0.0 */
    .addRule('provided-injected-should-match-factory-parameters', ERROR) /** @since 1.0.0 */
    .markCategory('Nest Swagger')
    .addRule('api-enum-property-best-practices', ERROR) /** @since 1.7.0 */
    .addRule('api-method-should-specify-api-operation', ERROR) /** @since 1.6.0 */
    .addRule('api-method-should-specify-api-response', ERROR) /** @since 2.0.0 */
    .addRule('api-property-matches-property-optionality', ERROR) /** @since 1.4.0 */
    .addRule('api-property-returning-array-should-set-array', ERROR) /** @since 1.7.0 */
    .addRule('controllers-should-supply-api-tags', ERROR) /** @since 1.6.0 */
    .markCategory('Preventing bugs')
    .addRule('all-properties-are-whitelisted', ERROR) /** @since 3.8.0 */
    .addRule('all-properties-have-explicit-defined', ERROR) /** @since 3.15.0 */
    .addRule('no-duplicate-decorators', ERROR) /** @since 4.3.0 */
    .addRule('param-decorator-name-matches-route-param', ERROR) /** @since 3.3.0 */
    .addRule('should-specify-forbid-unknown-values', ERROR) /** @since 3.2.0 */
    .addRule('validate-nested-of-array-should-set-each', ERROR) /** @since 3.5.0 */
    .addRule('validated-non-primitive-property-needs-type-decorator', ERROR) /** @since 3.5.0 */
    .markCategory('Security')
    .addRule('api-methods-should-be-guarded', OFF) /** @since 3.19.0 */ // 🔴
    .markCategory('Code Consistency')
    .addRule('sort-module-metadata-arrays', OFF) /** @since 3.22.0 */ // 🔴
    .enableConfigTesterForPlugin('nestjs')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
  // eslint-disable-next-line case-police/string-check
}) satisfies UnConfigFn<'nestJs'>;

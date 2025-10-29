import {ERROR, OFF, WARNING} from '../constants';
import {type GetRuleOptions, type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface ZodEslintConfigOptions extends UnConfigOptions<'zod'> {
  /**
   * Enforce zod array style:
   * - `'function'`: `z.array(z.string())`
   * - `'method'`: `z.string().array()`
   * - `false`: not enforced
   *
   * Affected rule:
   * - [`array-style`](https://github.com/marcalexiei/eslint-plugin-zod-x/blob/HEAD/docs/rules/array-style.md)
   * @default 'method'
   */
  arrayStyle?: GetRuleOptions<'zod', 'array-style'>['style'] | false;

  /**
   * Affected rule:
   * - [`prefer-namespace-import`](https://github.com/marcalexiei/eslint-plugin-zod-x/blob/HEAD/docs/rules/prefer-namespace-import.md)
   * @default true
   */
  enforceNamespaceImport?: boolean;

  /**
   * Enforces a consistent naming convention for Zod schema variables by requiring them
   * to end with a specified suffix. Pass `false` or an empty string to not enforce.
   * @default 'Zod'
   */
  schemaSuffix?: string | false;
}

export const zodUnConfig: UnConfigFn<'zod'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.zod;
  const optionsResolved = assignDefaults(optionsRaw, {
    arrayStyle: 'method',
    enforceNamespaceImport: true,
    schemaSuffix: 'Zod',
  } satisfies ZodEslintConfigOptions);

  const {arrayStyle, enforceNamespaceImport, schemaSuffix} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'zod');

  const zodMajorVersion = context.packagesInfo.zod?.versions.major ?? 4;
  const severityForRulesOnlyForV4 = zodMajorVersion >= 4 ? ERROR : OFF;

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['zod', {includeDefaultFilesAndIgnores: true}])
    .addRule(
      'array-style',
      arrayStyle === false ? OFF : ERROR,
      arrayStyle === false ? [] : [{style: arrayStyle}],
    ) /** @since 0.0.1 */ // 🟢
    .addRule('consistent-import-source', OFF) /** @since 1.2.0 */
    .addRule('no-any', WARNING) /** @since 0.0.1 */ // 🟢
    .addRule('no-empty-custom-schema', ERROR) /** @since 1.1.0 */ // 🟢
    // `.int()` added in v4
    .addRule('no-number-schema-with-int', severityForRulesOnlyForV4) /** @since 1.7.0 */ // 🟢
    .addRule('no-optional-and-default-together', ERROR) /** @since 1.6.0 */ // 🟢
    .addRule('no-throw-in-refine', ERROR) /** @since 0.0.1 */ // 🟢
    // `.meta()` added in v4
    .addRule('prefer-meta', severityForRulesOnlyForV4) /** @since 0.0.1 */ // 🟢
    .addRule('prefer-meta-last', ERROR) /** @since 0.0.1 */ // 🟢
    .addRule('prefer-namespace-import', enforceNamespaceImport ? ERROR : OFF) /** @since 0.0.1 */ // 🟢
    .addRule('prefer-strict-object', OFF) /** @since 0.0.1 */
    .addRule('require-error-message', ERROR) /** @since 1.4.0 */ // 🟢
    .addRule(
      'require-schema-suffix',
      schemaSuffix ? ERROR : OFF,
      schemaSuffix ? [{suffix: schemaSuffix}] : [],
    ) /** @since 1.3.0 */ // 🟢
    .enableConfigTesterForPlugin('zod')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

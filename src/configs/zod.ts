import {ERROR, OFF, WARNING} from '../constants';
import {allUnionMembers, getKeysOfTruthyValues} from '../utils';
import {
  type ArrayOrBooleanRecord,
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

type ZodObjectSchemaType = (GetRuleOptions<
  'zod',
  'consistent-object-schema-type'
>['allow'] & {})[number];
const ALL_ZOD_OBJECT_SCHEMA_TYPES = allUnionMembers<ZodObjectSchemaType>()([
  'object',
  'looseObject',
  'strictObject',
]);

export interface ZodEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'zod'> {
  /**
   * Specify which object schema types will be allowed.
   * - If object is used, it will be merged with the default value.
   * - Disallowing all methods will not ignored.
   *
   * Affected rule:
   * - [`consistent-object-schema-type`](https://github.com/marcalexiei/eslint-plugin-zod/blob/HEAD/docs/rules/consistent-object-schema-type.md)
   * @default {object: true, looseObject: true, strictObject: true}
   */
  allowedObjectSchemaTypes?: ArrayOrBooleanRecord<ZodObjectSchemaType>;

  /**
   * Enforce zod array style:
   * - `'function'`: `z.array(z.string())`
   * - `'method'`: `z.string().array()`
   * - `false`: not enforced
   *
   * Affected rule:
   * - [`array-style`](https://github.com/marcalexiei/eslint-plugin-zod/blob/HEAD/docs/rules/array-style.md)
   * @default 'method'
   */
  arrayStyle?: GetRuleOptions<'zod', 'array-style'>['style'] | false;

  /**
   * Affected rule:
   * - [`consistent-import`](https://github.com/marcalexiei/eslint-plugin-zod/blob/HEAD/docs/rules/consistent-import.md)
   * @default true
   */
  enforceNamespaceImport?: boolean;

  /**
   * Enforces a consistent naming convention for Zod schema variables by requiring them
   * to end with a specified suffix. Pass `false` or an empty string to not enforce.
   *
   * Affected rule:
   * - [`require-schema-suffix`](https://github.com/marcalexiei/eslint-plugin-zod/blob/HEAD/docs/rules/require-schema-suffix.md)
   * @default 'Zod'
   */
  schemaSuffix?: string | false;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    arrayStyle: 'method',
    enforceNamespaceImport: true,
    schemaSuffix: 'Zod',
  } satisfies ZodEslintConfigOptions);

  const {
    allowedObjectSchemaTypes: allowedObjectSchemaTypesRaw,
    arrayStyle,
    enforceNamespaceImport,
    schemaSuffix,
  } = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'zod');

  const zodMajorVersion = context.packagesInfo.zod?.versions.major ?? 4;
  const severityForRulesOnlyForV4 = zodMajorVersion >= 4 ? ERROR : OFF;

  const allowedObjectSchemaTypes = getKeysOfTruthyValues(
    Array.isArray(allowedObjectSchemaTypesRaw)
      ? Object.fromEntries(
          Array.from(new Set(allowedObjectSchemaTypesRaw), (method) => [method, true]),
        )
      : {
          ...Object.fromEntries(ALL_ZOD_OBJECT_SCHEMA_TYPES.map((method) => [method, true])),
          ...(!Array.isArray(allowedObjectSchemaTypesRaw) && allowedObjectSchemaTypesRaw),
        },
    true,
  );

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['zod', {includeDefaultFilesAndIgnores: true}])
    .addRule(
      'array-style',
      arrayStyle === false ? OFF : ERROR,
      arrayStyle === false ? [] : [{style: arrayStyle}],
    ) /** @since 0.0.1 */ // 🟢
    .addRule('consistent-import', enforceNamespaceImport ? ERROR : OFF) /** @since 3.1.0 */ // 🟢
    .addRule('consistent-import-source', OFF) /** @since 1.2.0 */
    .addRule(
      'consistent-object-schema-type',
      !allowedObjectSchemaTypes?.length ||
        allowedObjectSchemaTypes.length === ALL_ZOD_OBJECT_SCHEMA_TYPES.length
        ? OFF
        : ERROR,
      !allowedObjectSchemaTypes?.length ||
        allowedObjectSchemaTypes.length === ALL_ZOD_OBJECT_SCHEMA_TYPES.length
        ? []
        : [{allow: allowedObjectSchemaTypes}],
    ) /** @since 1.11.0 */
    .addRule('no-any-schema', WARNING) /** @since 0.0.1 */ /** @aka no-any (before 2.0.0) */ // 🟢
    .addRule('no-empty-custom-schema', ERROR) /** @since 1.1.0 */ // 🟢
    // `.int()` added in v4
    .addRule('no-number-schema-with-int', severityForRulesOnlyForV4) /** @since 1.7.0 */ // 🟢
    .addRule('no-optional-and-default-together', ERROR) /** @since 1.6.0 */ // 🟢
    .addRule('no-string-schema-with-uuid', ERROR) /** @since 3.2.0 */ // 🟢
    .addRule('no-throw-in-refine', ERROR) /** @since 0.0.1 */ // 🟢
    .addRule('no-unknown-schema', OFF) /** @since 1.12.0 */
    .addRule('prefer-enum-over-literal-union', ERROR) /** @since 3.0.0 */ // 🟢
    // `.meta()` added in v4
    .addRule('prefer-meta', severityForRulesOnlyForV4) /** @since 0.0.1 */ // 🟢
    .addRule('prefer-meta-last', ERROR) /** @since 0.0.1 */ // 🟢
    .addRule('prefer-string-schema-with-trim', OFF) /** @since 3.3.0 */ // 🟢
    .addRule('require-brand-type-parameter', ERROR) /** @since 1.8.0 */ // 🟢
    .addRule('require-error-message', ERROR) /** @since 1.4.0 */ // 🟢
    .addRule(
      'require-schema-suffix',
      schemaSuffix ? ERROR : OFF,
      schemaSuffix ? [{suffix: schemaSuffix}] : [],
    ) /** @since 1.3.0 */ // 🟢
    .addRule('schema-error-property-style', OFF) /** @since 1.8.0 */
    .enableConfigTesterForPlugin('zod')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'zod'>;

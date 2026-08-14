import {ERROR, OFF, WARNING} from '../constants';
import type {SetRequired} from '../types';
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

interface MiniSubConfigOptions<ExtraPlugins extends ExtraPluginsType> extends UnFlatConfigEntryBase<
  ExtraPlugins,
  'zod-mini'
> {
  /**
   * Same as the respective option of the parent config.
   *
   * Affected rule:
   * - [`zod-mini/consistent-object-schema-type`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod-mini/docs/rules/consistent-object-schema-type.md)
   * @default inherited from the respective option of the parent config
   */
  allowedObjectSchemaTypes?: ArrayOrBooleanRecord<ZodObjectSchemaType>;

  /**
   * Same as the respective option of the parent config.
   *
   * Affected rule:
   * - [`zod-mini/consistent-import`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod-mini/docs/rules/consistent-import.md)
   * @default inherited from the respective option of the parent config
   */
  enforceConsistentImport?: boolean | GetRuleOptions<'zod-mini', 'consistent-import'>['syntax'];

  /**
   * Same as the respective option of the parent config.
   *
   * Affected rule:
   * - [`zod-mini/consistent-schema-var-name`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod-mini/docs/rules/consistent-schema-var-name.md)
   * @default inherited from the respective option of the parent config
   */
  schemaVariableName?: boolean | string | GetRuleOptions<'zod-mini', 'consistent-schema-var-name'>;
}

interface CoreSubConfigOptions<ExtraPlugins extends ExtraPluginsType> extends UnFlatConfigEntryBase<
  ExtraPlugins,
  'zod-core'
> {
  /**
   * Same as the respective option of the parent config.
   *
   * Affected rule:
   * - [`zod-core/consistent-import`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod-core/docs/rules/consistent-import.md)
   * @default inherited from the respective option of the parent config
   */
  enforceConsistentImport?: boolean | GetRuleOptions<'zod-core', 'consistent-import'>['syntax'];
}

export interface ZodEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'zod'> {
  /**
   * Specify which object schema types will be allowed.
   * - If object is used, it will be merged with the default value.
   * - Disallowing all methods will be ignored.
   *
   * ⚠️ The option value will propagate to the option of the same name in `mini`
   * sub-config, unless explicitly overridden there.
   *
   * Affected rule:
   * - [`zod/consistent-object-schema-type`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/docs/rules/consistent-object-schema-type.md)
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
   * - [`zod/array-style`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/docs/rules/array-style.md)
   * @default 'method'
   */
  arrayStyle?: GetRuleOptions<'zod', 'array-style'>['style'] | false;

  /**
   * Rules for [`zod/v4/core`](https://zod.dev/packages/core).
   *
   * 📁 Default `files` and `ignores`: inherited from the parent config unless any of these
   * properties is specified
   *
   * 🧩 Main plugin: [`eslint-plugin-zod-core`](https://npmx.dev/eslint-plugin-zod-core)
   * ([docs](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod-core/README.md))
   *
   * Inherits `enforceNamespaceImport` from the parent config; pass an object
   * to override.
   * @default true
   */
  configCore?: boolean | CoreSubConfigOptions<ExtraPlugins>;

  /**
   * Rules for [`zod/mini`](https://zod.dev/packages/mini).
   *
   * 📁 Default `files` and `ignores`: inherited from the parent config unless any of these
   * properties is specified
   *
   * 🧩 Main plugin: [`eslint-plugin-zod-mini`](https://npmx.dev/eslint-plugin-zod-mini)
   * ([docs](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod-mini/README.md))
   *
   * Inherits `allowedObjectSchemaTypes`, `enforceNamespaceImport` and
   * `schemaVariableName` from the parent config; pass an object to override.
   * @default true
   */
  configMini?: boolean | MiniSubConfigOptions<ExtraPlugins>;

  /**
   * Enforces either namespace import of zod (`import * as z from 'zod'`) or named import
   * (`import { z } from 'zod'`).
   *
   * By default, namespace import is enforced.
   *
   * ⚠️ The option value will propagate to the option of the same name in `core` and `mini`
   * sub-configs, unless explicitly overridden there.
   *
   * Affected rule:
   * - [`zod/consistent-import`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/docs/rules/consistent-import.md)
   * @default true
   */
  enforceConsistentImport?: boolean | GetRuleOptions<'zod', 'consistent-import'>['syntax'];

  /**
   * Enforces a consistent naming convention for Zod schema variables by requiring them
   * to start and/or end with a specified string.
   *
   * Possible values:
   * - Not provided or `true`: enforces that schema variable names end with `Zod`;
   * - string: enforces that schema variable names end with the provided string;
   * - object: enforces that schema variable names follow the provided naming convention;
   * - `false`: does not enforce anything.
   *
   * ⚠️ The option value will propagate to the option of the same name in `mini`
   * sub-config, unless explicitly overridden there.
   *
   * Affected rule:
   * - [`zod/consistent-schema-var-name`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/docs/rules/consistent-schema-var-name.md)
   * @default 'Zod'
   */
  schemaVariableName?: boolean | string | GetRuleOptions<'zod', 'consistent-schema-var-name'>;
}

const resolveConsistentImportOptions = (
  userOptions: Pick<
    SetRequired<ZodEslintConfigOptions, 'enforceConsistentImport'>,
    'enforceConsistentImport'
  >,
) => {
  const {enforceConsistentImport} = userOptions;

  const severity = enforceConsistentImport === false ? OFF : ERROR;
  const options: GetRuleOptions<'zod', 'consistent-import', 'all'> =
    typeof enforceConsistentImport === 'string' ? [{syntax: enforceConsistentImport}] : [];

  return [severity, options] as const;
};

const resolveConsistentObjectSchemaTypeOptions = (
  userOptions: Pick<ZodEslintConfigOptions, 'allowedObjectSchemaTypes'>,
) => {
  const {allowedObjectSchemaTypes: allowedObjectSchemaTypesRaw} = userOptions;

  const allowedObjectSchemaTypes = getKeysOfTruthyValues(
    Array.isArray(allowedObjectSchemaTypesRaw)
      ? Object.fromEntries(
          Array.from(new Set(allowedObjectSchemaTypesRaw), (method) => [method, true]),
        )
      : {
          ...Object.fromEntries(ALL_ZOD_OBJECT_SCHEMA_TYPES.map((method) => [method, true])),
          ...(!Array.isArray(allowedObjectSchemaTypesRaw) && allowedObjectSchemaTypesRaw),
        },
    'nonEmptyArray',
  );

  const isAllowedObjectSchemaTypesUnrestricted =
    !allowedObjectSchemaTypes?.length ||
    allowedObjectSchemaTypes.length === ALL_ZOD_OBJECT_SCHEMA_TYPES.length;

  const severity = isAllowedObjectSchemaTypesUnrestricted ? OFF : ERROR;
  const options: GetRuleOptions<'zod', 'consistent-object-schema-type', 'all'> =
    isAllowedObjectSchemaTypesUnrestricted ? [] : [{allow: allowedObjectSchemaTypes}];

  return [severity, options] as const;
};

const DEFAULT_SCHEMA_VARIABLE_NAME = 'Zod';

const resolveConsistentSchemaVarNameOptions = (
  userOptions: Pick<
    SetRequired<ZodEslintConfigOptions, 'schemaVariableName'>,
    'schemaVariableName'
  >,
) => {
  const {schemaVariableName} = userOptions;

  const severity = schemaVariableName ? ERROR : OFF;
  const options: GetRuleOptions<'zod', 'consistent-schema-var-name', 'all'> = schemaVariableName
    ? [
        typeof schemaVariableName === 'object'
          ? schemaVariableName
          : {
              after:
                typeof schemaVariableName === 'string'
                  ? schemaVariableName
                  : DEFAULT_SCHEMA_VARIABLE_NAME,
            },
      ]
    : [];

  return [severity, options] as const;
};

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    arrayStyle: 'method',
    configCore: true,
    configMini: true,
    enforceConsistentImport: true,
    schemaVariableName: DEFAULT_SCHEMA_VARIABLE_NAME,
  });

  const {arrayStyle, configCore, configMini} = optionsResolved;

  const zodMajorVersion = context.packagesInfo.zod?.versions.major ?? 4;
  const severityForRulesOnlyForV4 = zodMajorVersion >= 4 ? ERROR : OFF;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'zod');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig('zod')
    .addRule(
      'array-style',
      arrayStyle === false ? OFF : ERROR,
      arrayStyle === false ? [] : [{style: arrayStyle}],
    ) /** @since 0.0.1 */ // 🟢
    .addRule(
      'consistent-import',
      ...resolveConsistentImportOptions(optionsResolved),
    ) /** @since 3.1.0 */ // 🟢
    .addRule('consistent-import-source', OFF) /** @since 1.2.0 */
    .addRule(
      'consistent-object-schema-type',
      ...resolveConsistentObjectSchemaTypeOptions(optionsResolved),
    ) /** @since 1.11.0 */
    .addRule('consistent-schema-output-type-style', ERROR) /** @since 3.8.0 */
    .addRule(
      'consistent-schema-var-name',
      ...resolveConsistentSchemaVarNameOptions(optionsResolved),
    ) /** @since 3.11.0 */ // 🟢
    .addRule('no-any-schema', WARNING) /** @since 0.0.1 */ /** @aka no-any (before 2.0.0) */ // 🟢
    .addRule('no-coerce-boolean', ERROR) /** @since 4.7.0 */ // 🟢
    .addRule('no-conflicting-checks', ERROR) /** @since 4.8.0 */
    .addRule('no-duplicate-schema-methods', ERROR) /** @since 4.6.0 */ // 🟢
    .addRule('no-empty-custom-schema', ERROR) /** @since 1.1.0 */ // 🟢
    .addRule('no-native-enum', severityForRulesOnlyForV4) /** @since 4.2.0 */ // 🟢
    // `.int()` added in v4
    .addRule('no-number-schema-with-finite', severityForRulesOnlyForV4) /** @since 3.9.0 */ // 🟢
    .addRule('no-number-schema-with-int', severityForRulesOnlyForV4) /** @since 1.7.0 */ // 🟢
    .addRule('no-number-schema-with-is-finite', severityForRulesOnlyForV4) /** @since 3.9.0 */ // 🟢
    .addRule('no-number-schema-with-is-int', severityForRulesOnlyForV4) /** @since 3.9.0 */ // 🟢
    .addRule('no-number-schema-with-safe', severityForRulesOnlyForV4) /** @since 3.9.0 */ // 🟢
    .addRule('no-number-schema-with-step', severityForRulesOnlyForV4) /** @since 3.9.0 */ // 🟢
    .addRule('no-optional-and-default-together', ERROR) /** @since 1.6.0 */ // 🟢
    .addRule('no-promise-schema', severityForRulesOnlyForV4) /** @since 4.5.0 */ // 🟢
    .addRule('no-schema-with-is-nullable', severityForRulesOnlyForV4) /** @since 4.4.0 */ // 🟢
    .addRule('no-schema-with-is-optional', severityForRulesOnlyForV4) /** @since 4.3.0 */ // 🟢
    .addRule('no-throw-in-refine', ERROR) /** @since 0.0.1 */ // 🟢
    .addRule('no-transform-in-record-key', ERROR) /** @since 3.6.0 */
    .addRule('no-unknown-schema', OFF) /** @since 1.12.0 */
    .addRule('no-unnecessary-readonly', ERROR) /** @since 4.8.0 */
    .addRule('prefer-enum-over-literal-union', ERROR) /** @since 3.0.0 */ // 🟢
    .addRule('prefer-loose-object', severityForRulesOnlyForV4) /** @since 4.3.0 */ // 🟢
    // `.meta()` added in v4
    .addRule('prefer-meta', severityForRulesOnlyForV4) /** @since 0.0.1 */ // 🟢
    .addRule('prefer-meta-last', ERROR) /** @since 0.0.1 */ // 🟢
    .addRule('prefer-nullish', ERROR) /** @since 4.9.0 */ // 🟢
    .addRule('prefer-strict-object', severityForRulesOnlyForV4) /** @since 4.3.0 */ // 🟢
    .addRule('prefer-string-schema-with-trim', OFF) /** @since 3.3.0 */ // 🟢
    .addRule('prefer-top-level-string-formats', severityForRulesOnlyForV4) /** @since 4.1.0 */ // 🟢
    .addRule('prefer-trim-before-string-length-checks', ERROR) /** @since 3.12.0 */ // 🟢
    // Note: not considered stylistic because may change types
    .addRule('prefer-tuple-over-array-length', ERROR) /** @since 4.8.0 */
    .addRule('require-brand-type-parameter', ERROR) /** @since 1.8.0 */ // 🟢
    .addRule('require-error-message', ERROR) /** @since 1.4.0 */ // 🟢
    .addRule('schema-error-property-style', OFF) /** @since 1.8.0 */
    .enableConfigTesterForPlugin('zod')
    .addOverrides();

  const optionsMiniResolved = assignDefaults(configMini, {
    enforceConsistentImport: optionsResolved.enforceConsistentImport,
  });
  optionsMiniResolved.allowedObjectSchemaTypes ??= optionsResolved.allowedObjectSchemaTypes;
  const miniSchemaVariableName =
    optionsMiniResolved.schemaVariableName ?? optionsResolved.schemaVariableName;

  const configBuilderMini = context.createConfigBuilder(configMini, 'zod-mini');

  configBuilderMini
    ?.addConfig([
      'zod/mini',
      {
        inheritFilesAndIgnoresFrom: optionsResolved,
      },
    ])
    .addRule(
      'consistent-import',
      ...resolveConsistentImportOptions(optionsMiniResolved),
    ) /** @since 0.1.0 */ // 🟢
    .addRule('consistent-import-source', OFF) /** @since 0.1.0 */
    .addRule(
      'consistent-object-schema-type',
      ...resolveConsistentObjectSchemaTypeOptions(optionsMiniResolved),
    ) /** @since 0.1.0 */
    .addRule('consistent-schema-output-type-style', ERROR) /** @since 0.1.0 */
    .addRule(
      'consistent-schema-var-name',
      ...resolveConsistentSchemaVarNameOptions({schemaVariableName: miniSchemaVariableName}),
    ) /** @since 0.1.0 */ // 🟢
    .addRule('no-any-schema', WARNING) /** @since 0.1.0 */ // 🟢
    .addRule('no-coerce-boolean', ERROR) /** @since 1.4.0 */ // 🟢
    .addRule('no-conflicting-checks', ERROR) /** @since 1.5.0 */
    .addRule('no-duplicate-schema-methods', ERROR) /** @since 1.3.0 */ // 🟢
    .addRule('no-empty-custom-schema', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-throw-in-refine', ERROR) /** @since 1.2.0 */ // 🟢
    .addRule('no-transform-in-record-key', ERROR) /** @since 1.2.0 */
    .addRule('no-unknown-schema', OFF) /** @since 0.1.0 */
    .addRule('no-unnecessary-readonly', ERROR) /** @since 1.5.0 */
    .addRule('prefer-enum-over-literal-union', ERROR) /** @since 1.1.0 */ // 🟢
    .addRule('prefer-meta', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('prefer-nullish', ERROR) /** @since 1.6.0 */ // 🟢
    // Note: not considered stylistic because may change types
    .addRule('prefer-tuple-over-array-length', ERROR) /** @since 1.5.0 */
    .addRule('require-brand-type-parameter', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('require-error-message', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('schema-error-property-style', OFF) /** @since 0.1.0 */
    .enableConfigTesterForPlugin('zod-mini')
    .addOverrides();

  const optionsCoreResolved = assignDefaults(configCore, {
    enforceConsistentImport: optionsResolved.enforceConsistentImport,
  });

  const configBuilderCore = context.createConfigBuilder(configCore, 'zod-core');

  configBuilderCore
    ?.addConfig([
      'zod/core',
      {
        inheritFilesAndIgnoresFrom: optionsResolved,
      },
    ])
    .addRule(
      'consistent-import',
      ...resolveConsistentImportOptions(optionsCoreResolved),
    ) /** @since 1.0.0 */ // 🟢
    .addRule('consistent-schema-output-type-style', ERROR) /** @since 1.0.0 */
    .enableConfigTesterForPlugin('zod-core')
    .addOverrides();

  return {
    configs: [configBuilder, configBuilderMini, configBuilderCore],
    optionsResolved,
  };
}) satisfies UnConfigFn<'zod'>;

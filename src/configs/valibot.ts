import {ERROR, OFF, WARNING} from '../constants';
import {allUnionMembers} from '../utils';
import {resolveAllowedValues} from './shared';
import {
  type ArrayOrBooleanRecord,
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

type ValibotObjectSchemaType = (GetRuleOptions<'valibot', 'no-loose-object'>['allow'] & {})[number];
const ALL_VALIBOT_OBJECT_SCHEMA_TYPES = allUnionMembers<
  ValibotObjectSchemaType,
  {readonly: true}
>()(['object', 'looseObject', 'strictObject']);

type ValibotSchemaNamingConvention = 'sameName' | 'suffix';

/**
 * Rules for [Valibot](https://valibot.dev).
 *
 * 📁 Default `files`: all files
 */
export interface ValibotEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'valibot'> {
  /**
   * Specify which object schema types will be allowed.
   * - If object is used, it will be merged with the default value.
   * - Disallowing all types will be ignored.
   *
   * Affected rule:
   * - [`valibot/no-loose-object`](https://github.com/nimaebra/eslint-plugin-valibot/blob/HEAD/docs/rules/no-loose-object.md)
   * @default {object: true, looseObject: true, strictObject: true}
   */
  allowedObjectSchemaTypes?: ArrayOrBooleanRecord<ValibotObjectSchemaType>;

  /**
   * Enforces either namespace import of Valibot (`import * as v from 'valibot'`) or named imports
   * (`import {object, string} from 'valibot'`).
   *
   * Possible values:
   * - `true` or `'namespace'`: enforces namespace import with `v` alias;
   * - `'named'`: enforces named imports;
   * - object: the rule options, for example to enforce a different namespace alias;
   * - `false`: does not enforce anything.
   *
   * Affected rule:
   * - [`valibot/consistent-import`](https://github.com/nimaebra/eslint-plugin-valibot/blob/HEAD/docs/rules/consistent-import.md)
   * @default true
   */
  enforceConsistentImport?:
    | boolean
    | GetRuleOptions<'valibot', 'consistent-import'>['style']
    | GetRuleOptions<'valibot', 'consistent-import'>;

  /**
   * Enforces one of the [naming conventions](https://valibot.dev/guides/naming-convention/) of
   * Valibot for exported schemas and the types inferred from them.
   *
   * Possible values:
   * - `true` or `'suffix'`: `UserSchema` for a schema, `UserInput`, `UserOutput` or `UserData` for
   * its inferred types;
   * - `'sameName'`: `User` for both a schema and its inferred type;
   * - object: the rule options, for example to also check names that are not exported or to change
   * the suffixes;
   * - `false`: does not enforce anything.
   *
   * Affected rule:
   * - [`valibot/consistent-schema-convention`](https://github.com/nimaebra/eslint-plugin-valibot/blob/HEAD/docs/rules/consistent-schema-convention.md)
   * @default false
   */
  schemaNamingConvention?:
    | boolean
    | ValibotSchemaNamingConvention
    | GetRuleOptions<'valibot', 'consistent-schema-convention'>;
}

// `true` keeps the rule defaults, and a string is a shorthand for the main rule option
const resolveShorthandRuleOptions = <
  Shorthand extends string,
  RuleOptions extends Record<string, unknown>,
>(
  value: boolean | Shorthand | RuleOptions,
  expandShorthand: (shorthand: Shorthand) => NoInfer<RuleOptions>,
) => {
  const ruleOptions = typeof value === 'string' ? expandShorthand(value) : value;
  const options: [] | [RuleOptions] = typeof ruleOptions === 'object' ? [ruleOptions] : [];

  return [ruleOptions === false ? OFF : ERROR, options] as const;
};

export default defineUnConfig<ValibotEslintConfigOptions>('valibot', {
  enabledBy: {package: 'valibot@^1'},
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    enforceConsistentImport: true,
    schemaNamingConvention: false,
  });

  const {enforceConsistentImport, schemaNamingConvention} = optionsResolved;

  const allowedObjectSchemaTypes = resolveAllowedValues(
    optionsResolved.allowedObjectSchemaTypes,
    ALL_VALIBOT_OBJECT_SCHEMA_TYPES,
  );

  const configBuilder = context.createConfigBuilder(optionsResolved, 'valibot');

  // Legend:
  // 🟢 - in `recommended` and `strict`
  // 🟡 - in `recommended` and `strict` (warns)
  // 🔵 - in `strict` only
  // 🎨 - in `stylistic`

  configBuilder
    ?.addConfig('valibot')
    .addRule(
      'consistent-import',
      ...resolveShorthandRuleOptions(enforceConsistentImport, (style) => ({style})),
    ) /** @since 0.1.0 */ // 🎨
    .addRule(
      'consistent-schema-convention',
      ...resolveShorthandRuleOptions(schemaNamingConvention, (convention) => ({
        convention: convention === 'sameName' ? 'same-name' : convention,
      })),
    ) /** @since 0.1.0 */ // 🎨
    .addRule('no-any-schema', WARNING) /** @since 0.1.0 */ // 🔵
    .addRule('no-async-action-in-sync-pipe', ERROR) /** @since 1.3.0 */ // 🟢
    .addRule('no-async-schema-in-sync-parent', ERROR) /** @since 1.4.0 */ // 🟢
    .addRule('no-conflicting-pipe-actions', ERROR) /** @since 1.2.0 */ // 🟢
    .addRule('no-duplicate-pipe-actions', ERROR) /** @since 0.1.0 */ // 🟡
    .addRule('no-empty-pipe', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-empty-union', ERROR) /** @since 1.2.0 */ // 🟢
    .addRule('no-instanceof-builtins', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-length-check-before-trim', ERROR) /** @since 1.4.0 */ // 🟢
    .addRule(
      'no-loose-object',
      allowedObjectSchemaTypes ? ERROR : OFF,
      allowedObjectSchemaTypes ? [{allow: allowedObjectSchemaTypes}] : [],
    ) /** @since 0.1.0 */ // 🔵
    .addRule('no-recreated-schemas', ERROR) /** @since 0.1.0 */ // 🔵
    .addRule('no-redundant-schema-wrappers', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-redundant-transformation', ERROR) /** @since 1.1.0 */ // 🟢
    .addRule('no-schema-as-type', ERROR) /** @since 0.1.0 */ // 🔵
    .addRule('no-single-member-union', ERROR) /** @since 1.2.0 */ // 🟢
    .addRule('no-throw-in-check', ERROR) /** @since 1.4.0 */ // 🟢
    .addRule('no-transform-in-record-key', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule(
      'no-unawaited-parse-async', // cspell:disable-line
      ERROR,
    ) /** @since 1.4.0 */ // 🟢
    .addRule('no-unchecked-safe-parse', ERROR) /** @since 1.4.0 */ // 🟢
    // A throw at module scope is usually intended, like when validating environment variables
    .addRule('no-unguarded-parse', ERROR, [{allowAtModuleScope: true}]) /** @since 0.1.0 */ // 🟢
    .addRule('no-unknown-schema', OFF) /** @since 0.1.0 */ // 🔵
    .addRule('prefer-flatten-pipe', ERROR) /** @since 1.2.0 */ // 🟡
    .addRule('prefer-nullable-over-union-null', ERROR) /** @since 0.1.0 */ // 🟡
    .addRule('prefer-nullish', ERROR) /** @since 0.1.0 */ // 🟡
    .addRule('prefer-optional-over-union-undefined', ERROR) /** @since 0.1.0 */ // 🟡
    .addRule(
      'prefer-picklist', // cspell:disable-line
      ERROR,
    ) /** @since 0.1.0 */ // 🎨
    .addRule('prefer-variant', ERROR) /** @since 0.1.0 */ // 🎨
    .addRule('require-issue-messages', OFF) /** @since 0.1.0 */ // 🔵
    .enableConfigTesterForPlugin('valibot')
    .addOverrides();
});

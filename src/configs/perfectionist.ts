import {ERROR, KEEP_LINTING_INLINE_JS, OFF} from '../constants';
import type {Prettify, SetRequired} from '../types';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  type UnRuleOptionsByPlugin,
  type UnRulesConfigPartial,
  assignDefaults,
  defineUnConfig,
} from './index';

type RuleSubConfig<
  ExtraPlugins extends ExtraPluginsType,
  T extends keyof UnRuleOptionsByPlugin['perfectionist'],
> =
  | boolean
  | (UnFlatConfigEntryBase<
      ExtraPlugins,
      Pick<UnRulesConfigPartial<'perfectionist'>, `perfectionist/${T}`>
    > & {
      /**
       * Options of the rule this sub-config enables
       */
      options?: GetRuleOptions<'perfectionist', T>;
    });

/**
 * [`eslint-plugin-perfectionist`](https://npmx.dev/eslint-plugin-perfectionist) plugin
 * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
 * that will be assigned to the `perfectionist` property of the `settings` flat config option.
 * @see https://perfectionist.dev/guide/getting-started#settings
 */
export type PerfectionistPluginSettings = Prettify<
  Pick<
    GetRuleOptions<'perfectionist'>,
    'type' | 'order' | 'fallbackSort' | 'alphabet' | 'ignoreCase' | 'specialCharacters' | 'locales'
  > &
    Pick<
      GetRuleOptions<'perfectionist', 'sort-objects'>,
      'partitionByComment' | 'partitionByNewLine' | 'newlinesBetween' | 'newlinesInside'
    > &
    Pick<GetRuleOptions<'perfectionist', 'sort-imports'>, 'tsconfig'>
>;

/**
 * An ESLint plugin that provides rules for sorting various data, such as objects, imports,
 * TypeScript types, etc.
 *
 * ⚠️ WARNING: all rules are disabled by default.
 *
 * 📁 Default `files`: all files
 */
export interface PerfectionistEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'perfectionist'> {
  /**
   * Enforces sorted array values before an `includes` call.
   *
   * 📁 Default `files`: all files
   *
   * Affected rule:
   * - [`perfectionist/sort-array-includes`](https://perfectionist.dev/rules/sort-array-includes)
   * @default false
   */
  configSortArrayIncludes?: RuleSubConfig<ExtraPlugins, 'sort-array-includes'>;

  /**
   * Enforces sorted array literal elements.
   *
   * 📁 Default `files`: all files
   *
   * Affected rule:
   * - [`perfectionist/sort-arrays`](https://perfectionist.dev/rules/sort-arrays)
   * @default false
   */
  configSortArrays?: RuleSubConfig<ExtraPlugins, 'sort-arrays'>;

  /**
   * Enforces sorted class members.
   *
   * 📁 Default `files`: all files
   *
   * Affected rule:
   * - [`perfectionist/sort-classes`](https://perfectionist.dev/rules/sort-classes)
   * @default false
   */
  configSortClasses?: RuleSubConfig<ExtraPlugins, 'sort-classes'>;

  /**
   * Enforces sorted decorators.
   *
   * 📁 Default `files`: all files
   *
   * Affected rule:
   * - [`perfectionist/sort-decorators`](https://perfectionist.dev/rules/sort-decorators)
   * @default false
   */
  configSortDecorators?: RuleSubConfig<ExtraPlugins, 'sort-decorators'>;

  /**
   * Enforces sorted TypeScript enum members.
   *
   * 📁 Default `files`: all files
   *
   * Affected rule:
   * - [`perfectionist/sort-enums`](https://perfectionist.dev/rules/sort-enums)
   * @default false
   */
  configSortEnums?: RuleSubConfig<ExtraPlugins, 'sort-enums'>;

  /**
   * Enforces sorted export attributes.
   *
   * 📁 Default `files`: all files
   *
   * Affected rule:
   * - [`perfectionist/sort-export-attributes`](https://perfectionist.dev/rules/sort-export-attributes)
   * @default false
   */
  configSortExportAttributes?: RuleSubConfig<ExtraPlugins, 'sort-export-attributes'>;

  /**
   * Enforces sorted export statements.
   *
   * 📁 Default `files`: all files
   *
   * Affected rule:
   * - [`perfectionist/sort-exports`](https://perfectionist.dev/rules/sort-exports)
   * @default false
   */
  configSortExports?: RuleSubConfig<ExtraPlugins, 'sort-exports'>;

  /**
   * Enforces sorted `extends` and `implements` clauses.
   *
   * 📁 Default `files`: all files
   *
   * Affected rule:
   * - [`perfectionist/sort-heritage-clauses`](https://perfectionist.dev/rules/sort-heritage-clauses)
   * @default false
   */
  configSortHeritageClauses?: RuleSubConfig<ExtraPlugins, 'sort-heritage-clauses'>;

  /**
   * Enforces sorted import statements.
   *
   * 📁 Default `files`: all files
   *
   * Affected rule:
   * - [`perfectionist/sort-imports`](https://perfectionist.dev/rules/sort-imports)
   * @default false
   */
  configSortImports?: RuleSubConfig<ExtraPlugins, 'sort-imports'>;

  /**
   * Enforces sorted import attributes.
   *
   * 📁 Default `files`: all files
   *
   * Affected rule:
   * - [`perfectionist/sort-import-attributes`](https://perfectionist.dev/rules/sort-import-attributes)
   * @default false
   */
  configSortImportAttributes?: RuleSubConfig<ExtraPlugins, 'sort-import-attributes'>;

  /**
   * Enforces sorted TypeScript interface members.
   *
   * 📁 Default `files`: all files
   *
   * Affected rule:
   * - [`perfectionist/sort-interfaces`](https://perfectionist.dev/rules/sort-interfaces)
   * @default false
   */
  configSortInterfaces?: RuleSubConfig<ExtraPlugins, 'sort-interfaces'>;

  /**
   * Enforces sorted TypeScript intersection type members.
   *
   * 📁 Default `files`: all files
   *
   * Affected rule:
   * - [`perfectionist/sort-intersection-types`](https://perfectionist.dev/rules/sort-intersection-types)
   * @default false
   */
  configSortIntersectionTypes?: RuleSubConfig<ExtraPlugins, 'sort-intersection-types'>;

  /**
   * Enforces sorted JSX props.
   *
   * 📁 Default `files`: all files
   *
   * Affected rule:
   * - [`perfectionist/sort-jsx-props`](https://perfectionist.dev/rules/sort-jsx-props)
   * @default false
   */
  configSortJsxProps?: RuleSubConfig<ExtraPlugins, 'sort-jsx-props'>;

  /**
   * Enforces sorted `Map` elements.
   *
   * 📁 Default `files`: all files
   *
   * Affected rule:
   * - [`perfectionist/sort-maps`](https://perfectionist.dev/rules/sort-maps)
   * @default false
   */
  configSortMaps?: RuleSubConfig<ExtraPlugins, 'sort-maps'>;

  /**
   * Enforces sorted module members.
   *
   * 📁 Default `files`: all files
   *
   * Affected rule:
   * - [`perfectionist/sort-modules`](https://perfectionist.dev/rules/sort-modules)
   * @default false
   */
  configSortModules?: RuleSubConfig<ExtraPlugins, 'sort-modules'>;

  /**
   * Enforces sorted named exports.
   *
   * 📁 Default `files`: all files
   *
   * Affected rule:
   * - [`perfectionist/sort-named-exports`](https://perfectionist.dev/rules/sort-named-exports)
   * @default false
   */
  configSortNamedExports?: RuleSubConfig<ExtraPlugins, 'sort-named-exports'>;

  /**
   * Enforces sorted named imports.
   *
   * 📁 Default `files`: all files
   *
   * Affected rule:
   * - [`perfectionist/sort-named-imports`](https://perfectionist.dev/rules/sort-named-imports)
   * @default false
   */
  configSortNamedImports?: RuleSubConfig<ExtraPlugins, 'sort-named-imports'>;

  /**
   * Enforces sorted TypeScript object type members.
   *
   * 📁 Default `files`: all files
   *
   * Affected rule:
   * - [`perfectionist/sort-object-types`](https://perfectionist.dev/rules/sort-object-types)
   * @default false
   */
  configSortObjectTypes?: RuleSubConfig<ExtraPlugins, 'sort-object-types'>;

  /**
   * Enforces sorted object properties.
   *
   * 📁 Default `files`: all files
   *
   * Affected rule:
   * - [`perfectionist/sort-objects`](https://perfectionist.dev/rules/sort-objects)
   * @default false
   */
  configSortObjects?: RuleSubConfig<ExtraPlugins, 'sort-objects'>;

  /**
   * Enforces sorted `Set` elements.
   *
   * 📁 Default `files`: all files
   *
   * Affected rule:
   * - [`perfectionist/sort-sets`](https://perfectionist.dev/rules/sort-sets)
   * @default false
   */
  configSortSets?: RuleSubConfig<ExtraPlugins, 'sort-sets'>;

  /**
   * Enforces sorted `switch` cases.
   *
   * 📁 Default `files`: all files
   *
   * Affected rule:
   * - [`perfectionist/sort-switch-case`](https://perfectionist.dev/rules/sort-switch-case)
   * @default false
   */
  configSortSwitchCase?: RuleSubConfig<ExtraPlugins, 'sort-switch-case'>;

  /**
   * Enforces sorted TypeScript union type members.
   *
   * 📁 Default `files`: all files
   *
   * Affected rule:
   * - [`perfectionist/sort-union-types`](https://perfectionist.dev/rules/sort-union-types)
   * @default false
   */
  configSortUnionTypes?: RuleSubConfig<ExtraPlugins, 'sort-union-types'>;

  /**
   * Enforces sorted variable declarations.
   *
   * 📁 Default `files`: all files
   *
   * Affected rule:
   * - [`perfectionist/sort-variable-declarations`](https://perfectionist.dev/rules/sort-variable-declarations)
   * @default false
   */
  configSortVariableDeclarations?: RuleSubConfig<ExtraPlugins, 'sort-variable-declarations'>;
}

export default defineUnConfig<PerfectionistEslintConfigOptions>(
  'perfectionist',
  false,
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configSortArrayIncludes: false,
    configSortArrays: false,
    configSortClasses: false,
    configSortDecorators: false,
    configSortEnums: false,
    configSortExports: false,
    configSortExportAttributes: false,
    configSortHeritageClauses: false,
    configSortImports: false,
    configSortImportAttributes: false,
    configSortInterfaces: false,
    configSortIntersectionTypes: false,
    configSortJsxProps: false,
    configSortMaps: false,
    configSortModules: false,
    configSortNamedExports: false,
    configSortNamedImports: false,
    configSortObjectTypes: false,
    configSortObjects: false,
    configSortSets: false,
    configSortSwitchCase: false,
    configSortUnionTypes: false,
    configSortVariableDeclarations: false,
  } satisfies SetRequired<
    PerfectionistEslintConfigOptions,
    Extract<keyof PerfectionistEslintConfigOptions, `configSort${string}`>
  >);

  const {
    configSortArrayIncludes,
    configSortArrays,
    configSortClasses,
    configSortDecorators,
    configSortEnums,
    configSortExportAttributes,
    configSortExports,
    configSortHeritageClauses,
    configSortImports,
    configSortImportAttributes,
    configSortInterfaces,
    configSortIntersectionTypes,
    configSortJsxProps,
    configSortMaps,
    configSortModules,
    configSortNamedExports,
    configSortNamedImports,
    configSortObjectTypes,
    configSortObjects,
    configSortSets,
    configSortSwitchCase,
    configSortUnionTypes,
    configSortVariableDeclarations,
  } = optionsResolved;

  const pluginSettings = context.getPluginSettings('perfectionist');

  const configBuilder = context.createConfigBuilder(optionsResolved, 'perfectionist');

  configBuilder
    ?.addConfig([
      'perfectionist',
      {
        ignoresInternal: KEEP_LINTING_INLINE_JS,
        settings: {
          perfectionist: pluginSettings,
        },
      },
    ])
    .addRule('sort-array-includes', OFF) /** @since 0.5.0 */
    .addRule('sort-arrays', OFF) /** @since 5.8.0 */
    .addRule('sort-classes', OFF) /** @since 0.11.0 */
    .addRule('sort-decorators', OFF) /** @since 4.0.0 */
    .addRule('sort-enums', OFF) /** @since 0.8.0 */
    .addRule('sort-export-attributes', OFF) /** @since 5.0.0 */
    .addRule('sort-exports', OFF) /** @since 1.2.0 */
    .addRule('sort-heritage-clauses', OFF) /** @since 4.0.0 */
    .addRule('sort-import-attributes', OFF) /** @since 5.0.0 */
    .addRule('sort-imports', OFF) /** @since 0.9.0 */
    .addRule('sort-interfaces', OFF) /** @since 0.1.0 */
    .addRule('sort-intersection-types', OFF) /** @since 2.9.0 */
    .addRule('sort-jsx-props', OFF) /** @since 0.2.0 */
    .addRule('sort-maps', OFF) /** @since 0.5.0 */
    .addRule('sort-modules', OFF) /** @since 4.0.0 */
    .addRule('sort-named-exports', OFF) /** @since 0.4.0 */
    .addRule('sort-named-imports', OFF) /** @since 0.2.0 */
    .addRule('sort-object-types', OFF) /** @since 0.11.0 */
    .addRule('sort-objects', OFF) /** @since 0.6.0 */
    .addRule('sort-sets', OFF) /** @since 3.4.0 */
    .addRule('sort-switch-case', OFF) /** @since 3.0.0 */
    .addRule('sort-union-types', OFF) /** @since 0.4.0 */
    .addRule('sort-variable-declarations', OFF) /** @since 3.0.0 */
    .enableConfigTesterForPlugin('perfectionist')
    .addOverrides();

  (
    [
      ['sort-array-includes', configSortArrayIncludes],
      ['sort-arrays', configSortArrays],
      ['sort-classes', configSortClasses],
      ['sort-decorators', configSortDecorators],
      ['sort-enums', configSortEnums],
      ['sort-export-attributes', configSortExportAttributes],
      ['sort-exports', configSortExports],
      ['sort-heritage-clauses', configSortHeritageClauses],
      ['sort-imports', configSortImports],
      ['sort-import-attributes', configSortImportAttributes],
      ['sort-interfaces', configSortInterfaces],
      ['sort-intersection-types', configSortIntersectionTypes],
      ['sort-jsx-props', configSortJsxProps],
      ['sort-maps', configSortMaps],
      ['sort-modules', configSortModules],
      ['sort-named-exports', configSortNamedExports],
      ['sort-named-imports', configSortNamedImports],
      ['sort-object-types', configSortObjectTypes],
      ['sort-objects', configSortObjects],
      ['sort-sets', configSortSets],
      ['sort-switch-case', configSortSwitchCase],
      ['sort-union-types', configSortUnionTypes],
      ['sort-variable-declarations', configSortVariableDeclarations],
    ] as const
  ).forEach(([ruleName, ruleSubConfig]) => {
    const configBuilderForRule = context.createConfigBuilder(ruleSubConfig, 'perfectionist');
    configBuilderForRule
      ?.addConfig(`perfectionist/${ruleName}`)
      .addRule(
        ruleName,
        ERROR,
        // @ts-expect-error `selector` type for different rules differs
        typeof ruleSubConfig === 'object' && ruleSubConfig.options ? [ruleSubConfig.options] : [],
      )
      .addOverrides();
  });
});

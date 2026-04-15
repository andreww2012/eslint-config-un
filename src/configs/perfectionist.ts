import {ERROR, OFF} from '../constants';
import type {Prettify, SetRequired} from '../types';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  type UnRuleOptionsByPlugin,
  type UnRulesConfigPartial,
  assignDefaults,
} from './index';

type RuleSubConfig<
  ExtraPlugins extends ExtraPluginsType,
  T extends keyof UnRuleOptionsByPlugin['perfectionist'],
> =
  | boolean
  | (UnFlatConfigEntryBase<
      ExtraPlugins,
      // @ts-expect-error typescript is bad
      Pick<UnRulesConfigPartial<'perfectionist'>, `perfectionist/${T}`>
    > & {
      options?: GetRuleOptions<'perfectionist', T>;
    });

export interface PerfectionistEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'perfectionist'> {
  /**
   * [`eslint-plugin-perfectionist`](https://npmjs.com/eslint-plugin-perfectionist) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `perfectionist` property
   * and applied to the resolved `files` and `ignores` of this config.
   * @see https://perfectionist.dev/guide/getting-started#settings
   */
  settings?: Prettify<
    Pick<
      GetRuleOptions<'perfectionist'>,
      | 'type'
      | 'order'
      | 'fallbackSort'
      | 'alphabet'
      | 'ignoreCase'
      | 'specialCharacters'
      | 'locales'
    > &
      Pick<
        GetRuleOptions<'perfectionist', 'sort-objects'>,
        'partitionByComment' | 'partitionByNewLine' | 'newlinesBetween' | 'newlinesInside'
      >
  >;

  /**
   * @default false
   * @see https://perfectionist.dev/rules/sort-array-includes
   */
  configSortArrayIncludes?: RuleSubConfig<ExtraPlugins, 'sort-array-includes'>;

  /**
   * @default false
   * @see https://perfectionist.dev/rules/sort-arrays
   */
  configSortArrays?: RuleSubConfig<ExtraPlugins, 'sort-arrays'>;

  /**
   * @default false
   * @see https://perfectionist.dev/rules/sort-classes
   */
  configSortClasses?: RuleSubConfig<ExtraPlugins, 'sort-classes'>;

  /**
   * @default false
   * @see https://perfectionist.dev/rules/sort-decorators
   */
  configSortDecorators?: RuleSubConfig<ExtraPlugins, 'sort-decorators'>;

  /**
   * @default false
   * @see https://perfectionist.dev/rules/sort-enums
   */
  configSortEnums?: RuleSubConfig<ExtraPlugins, 'sort-enums'>;

  /**
   * @default false
   * @see https://perfectionist.dev/rules/sort-export-attributes
   */
  configSortExportAttributes?: RuleSubConfig<ExtraPlugins, 'sort-export-attributes'>;

  /**
   * @default false
   * @see https://perfectionist.dev/rules/sort-exports
   */
  configSortExports?: RuleSubConfig<ExtraPlugins, 'sort-exports'>;

  /**
   * @default false
   * @see https://perfectionist.dev/rules/sort-heritage-clauses
   */
  configSortHeritageClauses?: RuleSubConfig<ExtraPlugins, 'sort-heritage-clauses'>;

  /**
   * @default false
   * @see https://perfectionist.dev/rules/sort-imports
   */
  configSortImports?: RuleSubConfig<ExtraPlugins, 'sort-imports'>;

  /**
   * @default false
   * @see https://perfectionist.dev/rules/sort-import-attributes
   */
  configSortImportAttributes?: RuleSubConfig<ExtraPlugins, 'sort-import-attributes'>;

  /**
   * @default false
   * @see https://perfectionist.dev/rules/sort-interfaces
   */
  configSortInterfaces?: RuleSubConfig<ExtraPlugins, 'sort-interfaces'>;

  /**
   * @default false
   * @see https://perfectionist.dev/rules/sort-intersection-types
   */
  configSortIntersectionTypes?: RuleSubConfig<ExtraPlugins, 'sort-intersection-types'>;

  /**
   * @default false
   * @see https://perfectionist.dev/rules/sort-jsx-props
   */
  configSortJsxProps?: RuleSubConfig<ExtraPlugins, 'sort-jsx-props'>;

  /**
   * @default false
   * @see https://perfectionist.dev/rules/sort-maps
   */
  configSortMaps?: RuleSubConfig<ExtraPlugins, 'sort-maps'>;

  /**
   * @default false
   * @see https://perfectionist.dev/rules/sort-modules
   */
  configSortModules?: RuleSubConfig<ExtraPlugins, 'sort-modules'>;

  /**
   * @default false
   * @see https://perfectionist.dev/rules/sort-named-exports
   */
  configSortNamedExports?: RuleSubConfig<ExtraPlugins, 'sort-named-exports'>;

  /**
   * @default false
   * @see https://perfectionist.dev/rules/sort-named-imports
   */
  configSortNamedImports?: RuleSubConfig<ExtraPlugins, 'sort-named-imports'>;

  /**
   * @default false
   * @see https://perfectionist.dev/rules/sort-object-types
   */
  configSortObjectTypes?: RuleSubConfig<ExtraPlugins, 'sort-object-types'>;

  /**
   * @default false
   * @see https://perfectionist.dev/rules/sort-objects
   */
  configSortObjects?: RuleSubConfig<ExtraPlugins, 'sort-objects'>;

  /**
   * @default false
   * @see https://perfectionist.dev/rules/sort-sets
   */
  configSortSets?: RuleSubConfig<ExtraPlugins, 'sort-sets'>;

  /**
   * @default false
   * @see https://perfectionist.dev/rules/sort-switch-case
   */
  configSortSwitchCase?: RuleSubConfig<ExtraPlugins, 'sort-switch-case'>;

  /**
   * @default false
   * @see https://perfectionist.dev/rules/sort-union-types
   */
  configSortUnionTypes?: RuleSubConfig<ExtraPlugins, 'sort-union-types'>;

  /**
   * @default false
   * @see https://perfectionist.dev/rules/sort-variable-declarations
   */
  configSortVariableDeclarations?: RuleSubConfig<ExtraPlugins, 'sort-variable-declarations'>;
}

export default ((context, optionsRaw) => {
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
    settings: pluginSettings,
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

  const configBuilder = context.createConfigBuilder(optionsResolved, 'perfectionist');

  configBuilder
    ?.addConfig([
      'perfectionist',
      {
        includeDefaultFilesAndIgnores: true,
        // TODO why?
        ignoresInternal: {
          html: false,
        },
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

  const subConfigs = (
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
  ).map(([ruleName, ruleSubConfig]) => {
    const configBuilderForRule = context.createConfigBuilder(ruleSubConfig, 'perfectionist');
    configBuilderForRule
      ?.addConfig([
        `perfectionist/${ruleName}`,
        {
          includeDefaultFilesAndIgnores: true,
        },
      ])
      .addRule(
        ruleName,
        ERROR,
        // @ts-expect-error `selector` type for different rules differs
        typeof ruleSubConfig === 'object' && ruleSubConfig.options ? [ruleSubConfig.options] : [],
      )
      .addOverrides();
    return configBuilderForRule;
  });

  return {
    configs: [configBuilder, ...subConfigs],
    optionsResolved,
  };
}) satisfies UnConfigFn<'perfectionist'> as UnConfigFn<'perfectionist'>;

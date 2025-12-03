import {ERROR, OFF} from '../constants';
import type {RuleOptionsPerPlugin} from '../eslint';
import type {Prettify} from '../types';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type RulesRecordPartial,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

type RuleSubConfig<
  ExtraPlugins extends ExtraPluginsType,
  T extends keyof RuleOptionsPerPlugin['perfectionist'],
> =
  | boolean
  | (UnConfigOptions<
      ExtraPlugins,
      // @ts-expect-error typescript is bad
      Pick<RulesRecordPartial<'perfectionist'>, `perfectionist/${T}`>
    > & {
      options?: GetRuleOptions<'perfectionist', T>;
    });

export interface PerfectionistEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, 'perfectionist'> {
  /**
   * [`eslint-plugin-perfectionist`](https://npmjs.com/eslint-plugin-perfectionist) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `perfectionist` property and applied to the specified `files` and `ignores`.
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
        'ignorePattern' | 'partitionByComment' | 'partitionByNewLine'
      >
  >;

  /**
   * @default false
   */
  configSortArrayIncludes?: RuleSubConfig<ExtraPlugins, 'sort-array-includes'>;

  /**
   * @default false
   */
  configSortClasses?: RuleSubConfig<ExtraPlugins, 'sort-classes'>;

  /**
   * @default false
   */
  configSortDecorators?: RuleSubConfig<ExtraPlugins, 'sort-decorators'>;

  /**
   * @default false
   */
  configSortEnums?: RuleSubConfig<ExtraPlugins, 'sort-enums'>;

  /**
   * @default false
   */
  configSortExports?: RuleSubConfig<ExtraPlugins, 'sort-exports'>;

  /**
   * @default false
   */
  configSortHeritageClauses?: RuleSubConfig<ExtraPlugins, 'sort-heritage-clauses'>;

  /**
   * @default false
   */
  configSortImports?: RuleSubConfig<ExtraPlugins, 'sort-imports'>;

  /**
   * @default false
   */
  configSortInterfaces?: RuleSubConfig<ExtraPlugins, 'sort-interfaces'>;

  /**
   * @default false
   */
  configSortIntersectionTypes?: RuleSubConfig<ExtraPlugins, 'sort-intersection-types'>;

  /**
   * @default false
   */
  configSortJsxProps?: RuleSubConfig<ExtraPlugins, 'sort-jsx-props'>;

  /**
   * @default false
   */
  configSortMaps?: RuleSubConfig<ExtraPlugins, 'sort-maps'>;

  /**
   * @default false
   */
  configSortModules?: RuleSubConfig<ExtraPlugins, 'sort-modules'>;

  /**
   * @default false
   */
  configSortNamedExports?: RuleSubConfig<ExtraPlugins, 'sort-named-exports'>;

  /**
   * @default false
   */
  configSortNamedImports?: RuleSubConfig<ExtraPlugins, 'sort-named-imports'>;

  /**
   * @default false
   */
  configSortObjectTypes?: RuleSubConfig<ExtraPlugins, 'sort-object-types'>;

  /**
   * @default false
   */
  configSortObjects?: RuleSubConfig<ExtraPlugins, 'sort-objects'>;

  /**
   * @default false
   */
  configSortSets?: RuleSubConfig<ExtraPlugins, 'sort-sets'>;

  /**
   * @default false
   */
  configSortSwitchCase?: RuleSubConfig<ExtraPlugins, 'sort-switch-case'>;

  /**
   * @default false
   */
  configSortUnionTypes?: RuleSubConfig<ExtraPlugins, 'sort-union-types'>;

  /**
   * @default false
   */
  configSortVariableDeclarations?: RuleSubConfig<ExtraPlugins, 'sort-variable-declarations'>;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configSortArrayIncludes: false,
    configSortClasses: false,
    configSortDecorators: false,
    configSortEnums: false,
    configSortExports: false,
    configSortHeritageClauses: false,
    configSortImports: false,
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
  } satisfies PerfectionistEslintConfigOptions);

  const {
    settings: pluginSettings,
    configSortArrayIncludes,
    configSortClasses,
    configSortDecorators,
    configSortEnums,
    configSortExports,
    configSortHeritageClauses,
    configSortImports,
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
    ?.addConfig(
      [
        'perfectionist',
        {
          includeDefaultFilesAndIgnores: true,
          doNotIgnoreHtml: true,
        },
      ],
      {
        ...(pluginSettings && {
          settings: {
            perfectionist: pluginSettings,
          },
        }),
      },
    )
    .addRule('sort-array-includes', OFF) /** @since 0.5.0 */
    .addRule('sort-classes', OFF) /** @since 0.11.0 */
    .addRule('sort-decorators', OFF) /** @since 4.0.0 */
    .addRule('sort-enums', OFF) /** @since 0.8.0 */
    .addRule('sort-exports', OFF) /** @since 1.2.0 */
    .addRule('sort-heritage-clauses', OFF) /** @since 4.0.0 */
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
      ['sort-classes', configSortClasses],
      ['sort-decorators', configSortDecorators],
      ['sort-enums', configSortEnums],
      ['sort-exports', configSortExports],
      ['sort-heritage-clauses', configSortHeritageClauses],
      ['sort-imports', configSortImports],
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

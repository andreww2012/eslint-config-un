import {ERROR, OFF} from '../constants';
import {
  type GetRuleOptions,
  type RuleOptionsPerPlugin,
  type RulesRecordPartial,
  type UnConfigOptions,
  createConfigBuilder,
} from '../eslint';
import type {PrettifyShallow} from '../types';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

type RuleSubConfig<T extends keyof RuleOptionsPerPlugin['perfectionist']> =
  | boolean
  | UnConfigOptions<
      // @ts-expect-error typescript is bad
      Pick<RulesRecordPartial<'perfectionist'>, `perfectionist/${T}`>,
      {
        options?: GetRuleOptions<'perfectionist', T>;
      }
    >;

export interface PerfectionistEslintConfigOptions extends UnConfigOptions<'perfectionist'> {
  /**
   * [`eslint-plugin-perfectionist`](https://npmjs.com/eslint-plugin-perfectionist) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `perfectionist` property and applied to the specified `files` and `ignores`.
   * @see https://perfectionist.dev/guide/getting-started#settings
   */
  settings?: PrettifyShallow<
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
  configSortArrayIncludes?: RuleSubConfig<'sort-array-includes'>;

  /**
   * @default false
   */
  configSortClasses?: RuleSubConfig<'sort-classes'>;

  /**
   * @default false
   */
  configSortDecorators?: RuleSubConfig<'sort-decorators'>;

  /**
   * @default false
   */
  configSortEnums?: RuleSubConfig<'sort-enums'>;

  /**
   * @default false
   */
  configSortExports?: RuleSubConfig<'sort-exports'>;

  /**
   * @default false
   */
  configSortHeritageClauses?: RuleSubConfig<'sort-heritage-clauses'>;

  /**
   * @default false
   */
  configSortImports?: RuleSubConfig<'sort-imports'>;

  /**
   * @default false
   */
  configSortInterfaces?: RuleSubConfig<'sort-interfaces'>;

  /**
   * @default false
   */
  configSortIntersectionTypes?: RuleSubConfig<'sort-intersection-types'>;

  /**
   * @default false
   */
  configSortJsxProps?: RuleSubConfig<'sort-jsx-props'>;

  /**
   * @default false
   */
  configSortMaps?: RuleSubConfig<'sort-maps'>;

  /**
   * @default false
   */
  configSortModules?: RuleSubConfig<'sort-modules'>;

  /**
   * @default false
   */
  configSortNamedExports?: RuleSubConfig<'sort-named-exports'>;

  /**
   * @default false
   */
  configSortNamedImports?: RuleSubConfig<'sort-named-imports'>;

  /**
   * @default false
   */
  configSortObjectTypes?: RuleSubConfig<'sort-object-types'>;

  /**
   * @default false
   */
  configSortObjects?: RuleSubConfig<'sort-objects'>;

  /**
   * @default false
   */
  configSortSets?: RuleSubConfig<'sort-sets'>;

  /**
   * @default false
   */
  configSortSwitchCase?: RuleSubConfig<'sort-switch-case'>;

  /**
   * @default false
   */
  configSortUnionTypes?: RuleSubConfig<'sort-union-types'>;

  /**
   * @default false
   */
  configSortVariableDeclarations?: RuleSubConfig<'sort-variable-declarations'>;
}

export const perfectionistUnConfig: UnConfigFn<'perfectionist'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.perfectionist;
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

  const configBuilder = createConfigBuilder(context, optionsResolved, 'perfectionist');

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
    const configBuilderForRule = createConfigBuilder(context, ruleSubConfig, 'perfectionist');
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
};

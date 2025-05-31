import angularTemplateParser from '@angular-eslint/template-parser';
import type Eslint from 'eslint';
import {ERROR, GLOB_HTML, GLOB_JS_TS_X, OFF, WARNING} from '../constants';
import {
  type EslintPlugin,
  type GetRuleOptions,
  type RulesRecordPartial,
  type UnConfigOptions,
  createConfigBuilder,
} from '../eslint';
import type {PrettifyShallow, ReadonlyDeep, SetRequired, Subtract} from '../types';
import {type MaybeArray, assignDefaults, cloneDeep, interopDefault} from '../utils';
import type {UnConfigFn} from './index';

// Please keep ascending order
const SUPPORTED_ANGULAR_VERSIONS = [13, 14, 15, 16, 17, 18, 19] as const;
type SupportedAngularVersion = (typeof SUPPORTED_ANGULAR_VERSIONS)[number];
type LatestSupportedAngularVersion = (typeof SUPPORTED_ANGULAR_VERSIONS)[Subtract<
  (typeof SUPPORTED_ANGULAR_VERSIONS)['length'],
  1
>];
const LATEST_SUPPORTED_ANGULAR_VERSION = SUPPORTED_ANGULAR_VERSIONS.at(
  -1,
) as LatestSupportedAngularVersion;

type AngularEslintPackagesForVersion = Record<
  'plugin' | 'pluginTemplate',
  () => Promise<EslintPlugin>
>;

const PACKAGES_FOR_SUPPORTED_ANGULAR_VERSIONS: Record<
  LatestSupportedAngularVersion,
  AngularEslintPackagesForVersion
> &
  Partial<
    Record<
      Exclude<SupportedAngularVersion, LatestSupportedAngularVersion>,
      Partial<AngularEslintPackagesForVersion>
    >
  > = {
  // All plugins' types have type mismatches with the eslint plugin type. We don't use `@ts-expect-error` here because it may prevent other errors from being reported (for example, about a missing object property).
  18: {
    plugin: () =>
      // eslint-disable-next-line import/no-extraneous-dependencies -- bundled
      interopDefault(import('angular-eslint-plugin18')).then((m) => m as unknown as EslintPlugin),
  },
  19: {
    plugin: () =>
      interopDefault(import('angular-eslint-plugin19')).then((m) => m as unknown as EslintPlugin),
    pluginTemplate: () =>
      interopDefault(import('angular-eslint-plugin-template19')).then(
        (m) => m as unknown as EslintPlugin,
      ),
  },
};

type RulesWithPartialAvailability =
  | 'consistent-component-styles'
  | 'no-async-lifecycle-method'
  | 'no-duplicates-in-metadata-arrays'
  | 'no-host-metadata-property'
  | 'prefer-output-emitter-ref'
  | 'prefer-signals'
  | 'prefer-standalone'
  | 'prefer-standalone-component'
  | 'require-lifecycle-on-prototype'
  | 'require-localize-metadata'
  | 'runtime-localize'
  | 'sort-lifecycle-methods'
  | 'sort-ngmodule-metadata-arrays'
  | 'accessibility-alt-text'
  | 'accessibility-elements-content'
  | 'accessibility-interactive-supports-focus'
  | 'accessibility-label-for'
  | 'accessibility-label-has-associated-control'
  | 'accessibility-role-has-required-aria'
  | 'accessibility-table-scope'
  | 'accessibility-valid-aria'
  | 'alt-text'
  | 'attributes-order'
  | 'elements-content'
  | 'interactive-supports-focus'
  | 'label-has-associated-control'
  | 'no-inline-styles'
  | 'no-interpolation-in-attributes'
  | 'prefer-control-flow'
  | 'prefer-ngsrc'
  | 'prefer-template-literal'
  | 'prefer-self-closing-tags'
  | 'prefer-static-string-properties'
  | 'role-has-required-aria'
  | 'table-scope'
  | 'valid-aria';

type RuleAvailability = [
  existedInVersions: [from: SupportedAngularVersion, to?: SupportedAngularVersion],
  newName?: string,
];

// TODO generate from plugins?
const RULES_AVAILABILITY: Record<string, RuleAvailability> = {
  'consistent-component-styles': [[17]],
  'no-async-lifecycle-method': [[17]],
  'no-duplicates-in-metadata-arrays': [[17]],
  'no-host-metadata-property': [[13, 18]],
  'prefer-signals': [[19]],
  'prefer-standalone': [[17]],
  'prefer-standalone-component': [[16, 18]],
  'prefer-template-literal': [[19]],
  'require-lifecycle-on-prototype': [[19]],
  'require-localize-metadata': [[16]],
  'runtime-localize': [[18]],
  'sort-lifecycle-methods': [[16]],
  'sort-ngmodule-metadata-arrays': [[13, 18]],

  'accessibility-alt-text': [[13, 15], 'alt-text'],
  'accessibility-elements-content': [[13, 15], 'elements-content'],
  'accessibility-interactive-supports-focus': [[14, 15], 'interactive-supports-focus'],
  'accessibility-label-for': [[13, 15], 'label-has-associated-control'], // deprecated since v13
  'accessibility-label-has-associated-control': [[13, 15], 'label-has-associated-control'],
  'accessibility-role-has-required-aria': [[14, 15], 'role-has-required-aria'],
  'accessibility-table-scope': [[13, 15], 'table-scope'],
  'accessibility-valid-aria': [[13, 15], 'valid-aria'],
  'alt-text': [[16]],
  'attributes-order': [[14]],
  'elements-content': [[16]],
  'interactive-supports-focus': [[16]],
  'label-has-associated-control': [[16]],
  'no-inline-styles': [[14]],
  'no-interpolation-in-attributes': [[15]],
  'prefer-control-flow': [[17]],
  'prefer-ngsrc': [[16]],
  'prefer-output-emitter-ref': [[19]],
  'prefer-self-closing-tags': [[16]],
  'prefer-static-string-properties': [[19]],
  'role-has-required-aria': [[16]],
  'table-scope': [[16]],
  'valid-aria': [[16]],
} satisfies Record<RulesWithPartialAvailability, RuleAvailability>;

const oldRuleNames = new Map<string, string[]>();
Object.entries(RULES_AVAILABILITY).forEach(([oldName, [, newName]]) => {
  if (newName) {
    oldRuleNames.set(newName, [...(oldRuleNames.get(newName) || []), oldName]);
  }
});

/**
 * Generates a ESLint plugin composed of all the rules in Angular ESLint plugins
 * from v13 to the latest version.
 *
 * If a rule with the same name exists in multiple plugins, implementation
 * from the latest version is used.
 *
 * If a rule does not exist in a plugin corresponding to the installed Angular version,
 * its implementation is nullified.
 */
const generateAngularPlugins = async (
  configOptions: ReadonlyDeep<AngularEslintConfigOptions>,
  installedVersion: SupportedAngularVersion,
) => {
  const latestPlugins = PACKAGES_FOR_SUPPORTED_ANGULAR_VERSIONS[LATEST_SUPPORTED_ANGULAR_VERSION];
  const [latestPlugin, latestPluginTemplate] = await Promise.all([
    latestPlugins.plugin(),
    latestPlugins.pluginTemplate(),
  ]);

  type EslintPluginWithRequiredRules = SetRequired<EslintPlugin, 'rules'>;
  const pluginGeneral: EslintPluginWithRequiredRules = {
    ...(latestPlugin as unknown as EslintPlugin),
    rules: {},
  };
  const pluginTemplate: EslintPluginWithRequiredRules = {
    ...(latestPluginTemplate as unknown as EslintPlugin),
    rules: {},
  };

  const ruleSchemas = new Map<string, object[]>();

  await Promise.all(
    SUPPORTED_ANGULAR_VERSIONS.map((angularVersion) =>
      Promise.all(
        (
          [
            ['plugin', pluginGeneral],
            ['pluginTemplate', pluginTemplate],
          ] as const
        ).map(async ([pluginType, mergedPlugin]) => {
          const originalPlugin =
            await PACKAGES_FOR_SUPPORTED_ANGULAR_VERSIONS[angularVersion]?.[pluginType]?.();
          if (!originalPlugin) {
            return;
          }

          Object.entries(cloneDeep(originalPlugin.rules || {})).forEach(
            ([currentRuleName, rule]) => {
              [currentRuleName, ...(oldRuleNames.get(currentRuleName) || [])].forEach(
                (ruleName) => {
                  let shouldDisableRule = false;

                  const ruleAvailability = RULES_AVAILABILITY[ruleName];
                  if (ruleAvailability) {
                    const [[from, to]] = ruleAvailability;
                    const ruleNotExistsForInstalledVersion =
                      installedVersion < from || (to != null && installedVersion > to);
                    shouldDisableRule = ruleNotExistsForInstalledVersion;
                  }

                  const ruleNameOfficial = `@angular-eslint${pluginType === 'pluginTemplate' ? '/template' : ''}/${ruleName}`;
                  if (
                    shouldDisableRule &&
                    !configOptions.portRules?.includes(
                      // @ts-expect-error includes type is narrower
                      ruleNameOfficial,
                    )
                  ) {
                    rule.create = () => ({});
                  }

                  mergedPlugin.rules[ruleName] = rule;

                  const schemas = [...(ruleSchemas.get(ruleName) || []), rule.meta?.schema].filter(
                    (v) => v != null && typeof v === 'object',
                  );
                  if (schemas.length > 0) {
                    ruleSchemas.set(ruleName, schemas);
                  }
                },
              );
            },
          );
        }),
      ),
    ),
  );
  [pluginGeneral, pluginTemplate].forEach((plugin) => {
    Object.entries(plugin.rules).forEach(([ruleName, rule]) => {
      const schemas = ruleSchemas.get(ruleName) || [];
      if (schemas.length === 0) {
        return;
      }

      (rule.meta ||= {}).schema = {
        anyOf: schemas.map((schema) => {
          if (Array.isArray(schema)) {
            return {type: 'array', minItems: 0, maxItems: schema.length, items: schema};
          }
          return schema;
        }),
      };
    });
  });

  return {
    pluginGeneral,
    pluginTemplate,
  };
};

export interface AngularEslintConfigOptions
  extends UnConfigOptions<RulesRecordPartial<'@angular-eslint'>> {
  /**
   * Enables or specifies the configuration for the [`@angular-eslint/eslint-plugin-template`](https://npmjs.com/@angular-eslint/eslint-plugin-template) plugin,
   * which includes template-specific rules.
   * @default true
   */
  configTemplate?:
    | boolean
    | UnConfigOptions<
        '@angular-eslint/template',
        {
          /**
           * Enable all a11y (accessibility) rules (all are prefixed with `@angular-eslint/template`):
           * - [`alt-text`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/alt-text.md) ([`accessibility-alt-text`](https://github.com/angular-eslint/angular-eslint/blob/v15.2.1/packages/eslint-plugin-template/docs/rules/accessibility-alt-text.md) before Angular 16)
           * - [`click-events-have-key-events`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/click-events-have-key-events.md)
           * - [`elements-content`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/elements-content.md) ([`accessibility-elements-content`](https://github.com/angular-eslint/angular-eslint/blob/v15.2.1/packages/eslint-plugin-template/docs/rules/accessibility-elements-content.md) before Angular 16)
           * - [`interactive-supports-focus`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/interactive-supports-focus.md) ([`accessibility-interactive-supports-focus`](https://github.com/angular-eslint/angular-eslint/blob/v15.2.1/packages/eslint-plugin-template/docs/rules/accessibility-interactive-supports-focus.md) before Angular 16)
           * - [`label-has-associated-control`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/label-has-associated-control.md) ([`accessibility-label-has-associated-control`](https://github.com/angular-eslint/angular-eslint/blob/v15.2.1/packages/eslint-plugin-template/docs/rules/accessibility-label-has-associated-control.md) before Angular 16)
           * - [`mouse-events-have-key-events`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/mouse-events-have-key-events.md)
           * - [`no-autofocus`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/no-autofocus.md)
           * - [`no-distracting-elements`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/no-distracting-elements.md)
           * - [`role-has-required-aria`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/role-has-required-aria.md) ([`accessibility-role-has-required-aria`](https://github.com/angular-eslint/angular-eslint/blob/v15.2.1/packages/eslint-plugin-template/docs/rules/accessibility-role-has-required-aria.md) before Angular 16)
           * - [`table-scope`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/table-scope.md) ([`accessibility-table-scope`](https://github.com/angular-eslint/angular-eslint/blob/v15.2.1/packages/eslint-plugin-template/docs/rules/accessibility-table-scope.md) before Angular 16)
           * - [`valid-aria`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/valid-aria.md) ([`accessibility-valid-aria`](https://github.com/angular-eslint/angular-eslint/blob/v15.2.1/packages/eslint-plugin-template/docs/rules/accessibility-valid-aria.md) before Angular 16)
           * @default true
           */
          a11yRules?: boolean | 'warn';

          /**
           * Uses [`@angular-eslint/template/prefer-control-flow`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/prefer-control-flow.md) rule.
           *
           * Note that this rule is enabled in our config if Angular version is at least 19.
           * @default true <=> Angular version >=19
           * @see https://angular.dev/guide/templates/control-flow
           */
          preferControlFlow?: boolean;

          /**
           * Prefer rendering images (`<img>`) with the help of [`NgOptimizedImage`](https://angular.dev/api/common/NgOptimizedImage) directive,
           * i.e. using `ngSrc` attribute instead of `src`.
           *
           * Also see ["Optimizing images"](https://angular.dev/tutorials/learn-angular/11-optimizing-images) lesson.
           *
           * Uses [`@angular-eslint/template/prefer-ngsrc`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/prefer-ngsrc.md) rule.
           * @default false
           */
          preferNgSrc?: boolean;

          /**
           * Requires [`trackBy` function](https://angular.dev/api/core/TrackByFunction) to be used with [`*ngFor` loops](https://angular.dev/api/common/NgFor).
           *
           * Uses [`@angular-eslint/template/use-track-by-function`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/use-track-by-function.md) rule.
           * @default false
           */
          requireLoopIndexes?: boolean;
        }
      >;

  /**
   * Detected automatically from a major version of the installed version of
   * `@angular/core` package, but can also be specified manually here.
   *
   * Used to determine which rules will be available based on its availability
   * in the same major version of the [`@angular-eslint/eslint-plugin`](https://npmjs.com/@angular-eslint/eslint-plugin) and [`@angular-eslint/eslint-plugin-template`](https://npmjs.com/@angular-eslint/eslint-plugin-template) packages.
   *
   * Unavailable rules can be ported by specifying them in `portRules` option.
   */
  angularVersion?: SupportedAngularVersion;

  /**
   * By default, all rules from [`@angular-eslint/eslint-plugin`](https://npmjs.com/@angular-eslint/eslint-plugin) and [`@angular-eslint/eslint-plugin-template`](https://npmjs.com/@angular-eslint/eslint-plugin-template) packages of versions 13 until 19
   * are present in our config, but the ones that are unavailable in the same major version
   * of these plugins as the detected (or specified in `angularVersion`) version of Angular
   * will simply do nothing. If you wish them to actually work, specify them here.
   *
   * The most common use case is to make rules added in higher major versions of the aforementioned
   * plugins work on your Angular version.
   *
   * For example, [`@angular-eslint/prefer-signals`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/prefer-signals.md)
   * was added in v19 of `@angular-eslint/eslint-plugin`, and will only be activated
   * in our config if the Angular version is at least 19.
   *
   * If say you're using Angular 18, specify this rule here to make it work.
   */
  portRules?: (keyof RulesRecordPartial<'@angular-eslint'> &
    `@angular-eslint/${'template/' | ''}${RulesWithPartialAvailability}`)[];

  /**
   * Process inline templates in order to lint them.
   * @default true
   */
  processInlineTemplates?: boolean;

  /**
   * Valid class name suffixes for classes decorated with `@Component`.
   * Passing empty array disables the check.
   * @default ['Component']
   * @see [`@angular-eslint/component-class-suffix`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/component-class-suffix.md)
   */
  componentClassSuffixes?: string[];

  /**
   * Enforces component selector style.
   * Options will be merged with the default value `{type: ['element'], style: 'kebab-case'}`.
   * Pass `false` to disable the check.
   * @default true
   * @see [`@angular-eslint/component-selector`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/component-selector.md)
   */
  componentSelector?:
    | boolean
    | PrettifyShallow<
        Omit<GetRuleOptions<'@angular-eslint', 'component-selector'>[0] & {}, 'type' | 'prefix'> & {
          type?: MaybeArray<'element' | 'attribute'>;
          prefix?: MaybeArray<string>;
        }
      >;

  /**
   * Ensures consistent usage of `styles`/`styleUrls`/`styleUrl` within `Component` metadata.
   * By default, `string` style is enforced.
   * Pass `false` to disable the check.
   * @default true
   * @see [`@angular-eslint/consistent-component-styles`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/consistent-component-styles.md)
   */
  componentStylesStyle?: boolean | GetRuleOptions<'@angular-eslint', 'consistent-component-styles'>;

  /**
   * Valid class name suffixes for classes decorated with `@Directive`.
   * Passing empty array disables the check.
   * @default ['Component']
   * @see [`@angular-eslint/directive-class-suffix`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/directive-class-suffix.md)
   */
  directiveClassSuffixes?: string[];

  /**
   * Enforces directive selector style.
   * Options will be merged with the default value `{type: ['attribute'], style: 'camelCase'}`.
   * Pass `false` to disable the check.
   * @default true
   * @see [`@angular-eslint/directive-selector`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/directive-selector.md)
   */
  directiveSelector?:
    | boolean
    | PrettifyShallow<
        Omit<GetRuleOptions<'@angular-eslint', 'directive-selector'>[0] & {}, 'type' | 'prefix'> & {
          type?: MaybeArray<'element' | 'attribute'>;
          prefix?: MaybeArray<string>;
        }
      >;

  /**
   * Forbids the use of certain metadata properties. Will be merged with the default value.
   *
   * Uses the following rules:
   * - [`@angular-eslint/no-inputs-metadata-property`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/no-inputs-metadata-property.md)
   * - [`@angular-eslint/no-outputs-metadata-property`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/no-outputs-metadata-property.md)
   * - [`@angular-eslint/no-queries-metadata-property`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/no-queries-metadata-property.md)
   * - [`@angular-eslint/no-host-metadata-property`](https://github.com/angular-eslint/angular-eslint/blob/v18.4.3/packages/eslint-plugin/docs/rules/no-host-metadata-property.md) (available until Angular 18, deprecated in Angular 18)
   * @default {inputs: true, outputs: true, queries: true}
   */
  forbiddenMetadataProperties?: Partial<Record<'host' | 'inputs' | 'outputs' | 'queries', boolean>>;

  /**
   * Disallow the following prefixes for input bindings, including aliases.
   * @default ['on']
   * @see [`@angular-eslint/no-input-prefix`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/no-input-prefix.md)
   */
  disallowedInputPrefixes?: string[];

  /**
   * @default false
   * @see [`@angular-eslint/no-attribute-decorator`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/no-attribute-decorator.md)
   */
  disallowAttributeDecorator?: boolean;

  /**
   * @default false
   * @see [`@angular-eslint/no-forward-ref`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/no-forward-ref.md)
   */
  disallowForwardRef?: boolean;

  /**
   * Enforce specified prefixes for pipes.
   * @default []
   * @see [`@angular-eslint/pipe-prefix`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/pipe-prefix.md)
   */
  pipePrefixes?: string[];

  /**
   * Uses [`@angular-eslint/prefer-standalone`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/prefer-standalone.md) rule since Angular 17 and uses [`@angular-eslint/prefer-standalone-component`](https://github.com/angular-eslint/angular-eslint/blob/v16.3.1/packages/eslint-plugin/docs/rules/prefer-standalone-component.md) rule for Angular 16.
   * @default true <=> Angular version >=19
   */
  preferStandaloneComponents?: boolean;
}

export const angularUnConfig: UnConfigFn<
  'angular',
  {plugins: Record<string, EslintPlugin>}
> = async (context) => {
  const optionsRaw = context.rootOptions.configs?.angular;
  const optionsResolved = assignDefaults(optionsRaw, {
    configTemplate: true,
    processInlineTemplates: true,
    componentClassSuffixes: ['Component'],
    componentSelector: true,
    componentStylesStyle: true,
    directiveClassSuffixes: ['Directive'],
    directiveSelector: true,
    disallowedInputPrefixes: ['on'],
    disallowAttributeDecorator: false,
    disallowForwardRef: false,
  } satisfies AngularEslintConfigOptions);

  const angularVersion: SupportedAngularVersion | null =
    optionsResolved.angularVersion ??
    (() => {
      const majorVersion = context.packagesInfo['@angular/core']?.versions.major;
      if (
        majorVersion != null &&
        majorVersion >= SUPPORTED_ANGULAR_VERSIONS[0] &&
        majorVersion <= LATEST_SUPPORTED_ANGULAR_VERSION
      ) {
        return majorVersion as SupportedAngularVersion;
      }
      return optionsRaw === true ? LATEST_SUPPORTED_ANGULAR_VERSION : null;
    })();

  if (angularVersion == null) {
    return null;
  }

  const {
    configTemplate,
    processInlineTemplates,
    componentClassSuffixes,
    componentSelector,
    componentStylesStyle,
    directiveClassSuffixes,
    directiveSelector,
    disallowedInputPrefixes,
    disallowAttributeDecorator,
    disallowForwardRef,
    pipePrefixes,
  } = optionsResolved;
  optionsResolved.preferStandaloneComponents ??= angularVersion >= 19;
  const {preferStandaloneComponents} = optionsResolved;

  const [
    {pluginGeneral: eslintPluginAngular, pluginTemplate: eslintPluginAngularTemplate},
    extractInlineHtmlProcessorLatest,
    extractInlineHtmlProcessorV17,
  ] = await Promise.all([
    generateAngularPlugins(optionsResolved, angularVersion),
    // Since v18, the processor uses `getDecorators` from `typescript` which does not exist prior to
    // v4.8 of `typescript`, which might be used in older projects
    interopDefault(import('angular-eslint-plugin-template19')).then(
      (m) => m.processors['extract-inline-html'] as Eslint.Linter.Processor,
    ),
    // eslint-disable-next-line import/no-extraneous-dependencies -- bundled
    interopDefault(import('angular-eslint-plugin-template17')).then(
      (m) => m.processors['extract-inline-html'] as Eslint.Linter.Processor,
    ),
  ]);

  const forbiddenMetadataProperties: typeof optionsResolved.forbiddenMetadataProperties = {
    inputs: true,
    outputs: true,
    queries: true,
    ...optionsResolved.forbiddenMetadataProperties,
  };

  const configBuilderGeneral = createConfigBuilder(context, optionsResolved, '@angular-eslint');

  // TODO backport rules?

  // Legend:
  // 🟢 - in recommended (latest version)
  // ♿ - in accessibility (latest version)
  // 🌐 - i18n related rules
  // 🔴 - deprecated
  // Check rule usage: https://github.com/search?q=%22%40angular-eslint%2Fno-input-prefix%22+path%3A%2F.*eslint%5B%5E%5C%2F%5D*%24%2F&type=code&p=1

  const extractInlineHtmlProcessor = cloneDeep(
    angularVersion < 18 ||
      (context.packagesInfo.typescript?.versions.majorAndMinor || Number.POSITIVE_INFINITY) < 4.8
      ? extractInlineHtmlProcessorV17
      : extractInlineHtmlProcessorLatest,
  );
  if (!extractInlineHtmlProcessor.meta) {
    extractInlineHtmlProcessor.meta = cloneDeep(extractInlineHtmlProcessorLatest.meta);
  }

  configBuilderGeneral
    ?.addConfig(
      [
        'angular/general',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: [GLOB_JS_TS_X],
        },
      ],
      {
        ...(processInlineTemplates && {
          processor: extractInlineHtmlProcessor,
        }),
      },
    )
    .addRule('component-class-suffix', componentClassSuffixes.length === 0 ? OFF : ERROR, [
      {
        ...(componentClassSuffixes.length > 0 && {suffixes: componentClassSuffixes}),
      },
    ]) // [all] 🟢
    .addRule('component-max-inline-declarations', OFF) // [all]
    .addRule('component-selector', componentSelector === false ? OFF : ERROR, [
      {
        type: ['element'],
        style: 'kebab-case',
        ...(typeof componentSelector === 'object' && componentSelector),
      },
    ]) // [all]
    .addRule('consistent-component-styles', componentStylesStyle === false ? OFF : ERROR, [
      typeof componentStylesStyle === 'string' ? componentStylesStyle : 'string',
    ]) // [>=17]
    .addRule('contextual-decorator', ERROR) // [all]
    .addRule('contextual-lifecycle', ERROR) // [all] 🟢
    .addRule('directive-class-suffix', directiveClassSuffixes.length === 0 ? OFF : ERROR, [
      {
        ...(directiveClassSuffixes.length > 0 && {suffixes: directiveClassSuffixes}),
      },
    ]) // [all] 🟢
    .addRule('directive-selector', directiveSelector === false ? OFF : ERROR, [
      {
        type: ['attribute'],
        style: 'camelCase',
        ...(typeof directiveSelector === 'object' && directiveSelector),
      },
    ]) // [all]
    .addRule('no-async-lifecycle-method', ERROR) // [>=17]
    .addRule('no-attribute-decorator', disallowAttributeDecorator ? ERROR : OFF) // [all]
    .addRule('no-conflicting-lifecycle', ERROR) // [all]
    .addRule('no-duplicates-in-metadata-arrays', ERROR) // [>=17]
    .addRule('no-empty-lifecycle-method', ERROR) // [all] 🟢
    .addRule('no-forward-ref', disallowForwardRef ? ERROR : OFF) // [all]
    // See https://github.com/angular/angular/pull/54084, https://angular.dev/guide/components/host-elements
    .addRule('no-host-metadata-property', forbiddenMetadataProperties.host ? ERROR : OFF) // [<=18] 🔴(18)
    .addRule('prefer-output-emitter-ref', ERROR) // [>=19.4]
    .addRule('no-input-prefix', ERROR, [{prefixes: disallowedInputPrefixes}]) // [all]
    .addRule('no-input-rename', ERROR) // [all] 🟢
    .addRule('no-inputs-metadata-property', forbiddenMetadataProperties.inputs ? ERROR : OFF) // [all] 🟢
    .addRule('no-lifecycle-call', ERROR) // [all]
    .addRule('no-output-native', ERROR) // [all] 🟢
    .addRule('no-output-on-prefix', ERROR) // [all] 🟢
    .addRule('no-output-rename', ERROR) // [all] 🟢
    .addRule('no-outputs-metadata-property', forbiddenMetadataProperties.outputs ? ERROR : OFF) // [all] 🟢
    .addRule('no-pipe-impure', ERROR) // [all]
    // https://github.com/angular/angular/blob/12.1.1/packages/core/src/metadata/directives.ts#L221-L258
    .addRule('no-queries-metadata-property', forbiddenMetadataProperties.queries ? ERROR : OFF) // [all]
    .addRule('pipe-prefix', ERROR, [{prefixes: pipePrefixes}]) // [all]
    .addRule('prefer-on-push-component-change-detection', OFF) // [all]
    .addRule('prefer-output-readonly', ERROR) // [all]
    .addRule('prefer-signals', OFF) // [>=19]
    .addRule('prefer-standalone', preferStandaloneComponents && angularVersion >= 17 ? ERROR : OFF) // [>=17] 🟢(>=19)
    .addRule(
      'prefer-standalone-component',
      preferStandaloneComponents && angularVersion < 17 ? ERROR : OFF,
    ) // [>=16<=18] 🔴(>=17)
    .addRule('relative-url-prefix', ERROR) // [all]
    .addRule('require-lifecycle-on-prototype', ERROR) // [>=19]
    .addRule('require-localize-metadata', ERROR) // [>=16] 🌐
    .addRule('runtime-localize', ERROR) // [>=18] 🌐
    .addRule('sort-lifecycle-methods', ERROR) // [>=16]
    .addRule('sort-ngmodule-metadata-arrays', OFF) // [<=18] 🔴(>=17)
    .addRule('use-component-selector', ERROR) // [all]
    .addRule('use-component-view-encapsulation', ERROR) // [all]
    .addRule('use-injectable-provided-in', ERROR) // [all]
    .addRule('use-lifecycle-interface', ERROR) // [all] 🟢(warns)
    .addRule('use-pipe-transform-interface', ERROR) // [all] 🟢
    .addOverrides();

  // TEMPLATE CONFIG

  const configTemplateOptions = assignDefaults(configTemplate, {
    a11yRules: true,
    preferControlFlow: angularVersion >= 19,
    preferNgSrc: false,
    requireLoopIndexes: false,
  } satisfies typeof configTemplate & object);
  const {a11yRules, preferControlFlow, preferNgSrc, requireLoopIndexes} = configTemplateOptions;

  const a11yRulesSeverity = a11yRules === true ? ERROR : a11yRules === 'warn' ? WARNING : OFF;

  const configBuilderTemplate = createConfigBuilder(
    context,
    configTemplate,
    '@angular-eslint/template',
  );

  configBuilderTemplate
    ?.addConfig(
      [
        'angular/template',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: [GLOB_HTML],
          doNotIgnoreHtml: true,
        },
      ],
      {
        languageOptions: {
          parser: angularTemplateParser,
        },
      },
    )
    .addRule('accessibility-alt-text', a11yRulesSeverity) // [<=15] ♿
    .addRule('accessibility-elements-content', a11yRulesSeverity) // [<=15] ♿
    .addRule('accessibility-interactive-supports-focus', a11yRulesSeverity) // [>=14<=15] ♿
    .addRule('accessibility-label-for', a11yRulesSeverity) // [<=15] ♿
    .addRule('accessibility-label-has-associated-control', a11yRulesSeverity) // [<=15] ♿
    .addRule('accessibility-role-has-required-aria', a11yRulesSeverity) // [>=14<=15] ♿
    .addRule('accessibility-table-scope', a11yRulesSeverity) // [<=15] ♿
    .addRule('accessibility-valid-aria', a11yRulesSeverity) // [<=15] ♿
    .addRule('alt-text', a11yRulesSeverity) // [>=16] ♿
    .addRule('attributes-order', ERROR) /// [>=14]
    .addRule('banana-in-box', ERROR) // [all] 🟢
    .addRule('button-has-type', ERROR) // [all]
    .addRule('click-events-have-key-events', a11yRulesSeverity) // [all] ♿
    .addRule('conditional-complexity', OFF) // [all]
    .addRule('cyclomatic-complexity', OFF) // [all]
    .addRule('elements-content', a11yRulesSeverity) // [>=16] ♿
    .addRule('eqeqeq', ERROR, [{allowNullOrUndefined: true}]) // [all] 🟢
    .addRule('i18n', OFF) // [all]
    .addRule('interactive-supports-focus', a11yRulesSeverity) // [>=16] ♿
    .addRule('label-has-associated-control', a11yRulesSeverity) // [>=16] ♿
    .addRule('mouse-events-have-key-events', a11yRulesSeverity) // [all] ♿
    .addRule('no-any', WARNING) // [all]
    .addRule('no-autofocus', a11yRulesSeverity) // [all] ♿
    .addRule('no-call-expression', OFF) // [all]
    .addRule('no-distracting-elements', a11yRulesSeverity) // [all] ♿
    .addRule('no-duplicate-attributes', ERROR) // [all]
    .addRule('no-inline-styles', OFF) // [>=14]
    .addRule('no-interpolation-in-attributes', ERROR) // [>=15]
    .addRule('no-negated-async', ERROR) // [all] 🟢
    .addRule('no-positive-tabindex', ERROR) // [all]
    .addRule('prefer-contextual-for-variables', ERROR) // [>=19.3]
    .addRule('prefer-control-flow', preferControlFlow ? ERROR : OFF) // [>=17]
    .addRule('prefer-ngsrc', preferNgSrc ? ERROR : OFF) // [>=16]
    .addRule('prefer-template-literal', ERROR) // [>=19.4]
    .addRule('prefer-self-closing-tags', OFF) // [>=16]
    .addRule('prefer-static-string-properties', ERROR) // [>=19]
    .addRule('role-has-required-aria', a11yRulesSeverity) // [>=16] ♿
    .addRule('table-scope', a11yRulesSeverity) // [>=16] ♿
    .addRule('use-track-by-function', requireLoopIndexes ? ERROR : OFF) // [all]
    .addRule('valid-aria', a11yRulesSeverity) // [>=16] ♿
    .addOverrides();

  return {
    configs: [configBuilderGeneral, configBuilderTemplate],
    optionsResolved,
    plugins: {
      '@angular-eslint': eslintPluginAngular,
      '@angular-eslint/template': eslintPluginAngularTemplate,
    },
  };
};

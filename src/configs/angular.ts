import type Eslint from 'eslint';
import {ERROR, GLOB_HTML, GLOB_JS_TS_X, OFF, type RuleSeverity, WARNING} from '../constants';
import {
  type GetRuleOptions,
  type RuleNamesForPlugin,
  type RulesRecordPartial,
  type UnConfigOptions,
  createConfigBuilder,
} from '../eslint';
import {pluginsLoaders} from '../plugins';
import type {NonEmptyTuple, PrettifyShallow, Subtract} from '../types';
import {
  type MaybeArray,
  assignDefaults,
  cloneDeep,
  fetchPackageInfo,
  interopDefault,
} from '../utils';
import type {UnConfigFn} from './index';

// Please keep ascending order
const SUPPORTED_ANGULAR_VERSIONS = [13, 14, 15, 16, 17, 18, 19, 20] as const;
type SupportedAngularVersion = (typeof SUPPORTED_ANGULAR_VERSIONS)[number];
type LatestSupportedAngularVersion = (typeof SUPPORTED_ANGULAR_VERSIONS)[Subtract<
  (typeof SUPPORTED_ANGULAR_VERSIONS)['length'],
  1
>];
const LATEST_SUPPORTED_ANGULAR_VERSION = SUPPORTED_ANGULAR_VERSIONS.at(
  -1,
) as LatestSupportedAngularVersion;

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

export const angularUnConfig: UnConfigFn<'angular'> = async (context) => {
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

  const angularVersion: SupportedAngularVersion =
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
      return LATEST_SUPPORTED_ANGULAR_VERSION;
    })();

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

  const forbiddenMetadataProperties: typeof optionsResolved.forbiddenMetadataProperties = {
    inputs: true,
    outputs: true,
    queries: true,
    ...optionsResolved.forbiddenMetadataProperties,
  };

  const configBuilderGeneral = createConfigBuilder(context, optionsResolved, '@angular-eslint');

  // Legend:
  // 🟢 - in recommended (latest version)
  // ♿ - in accessibility (latest version)
  // 🌐 - i18n related rules
  // 🔴 - deprecated
  // Check rule usage: https://github.com/search?q=%22%40angular-eslint%2Fno-input-prefix%22+path%3A%2F.*eslint%5B%5E%5C%2F%5D*%24%2F&type=code&p=1

  const [
    angularEslintPlugin,
    angularEslintPluginPackageInfo,
    angularTemplateEslintPlugin,
    angularTemplateEslintPluginPackageInfo,
    angularTemplateParserPackageInfo,
    extractInlineHtmlProcessor,
  ] = await Promise.all([
    pluginsLoaders['@angular-eslint'](context).then(({module}) => module),
    fetchPackageInfo('@angular-eslint/eslint-plugin'),
    pluginsLoaders['@angular-eslint/template'](context).then(({module}) => module),
    fetchPackageInfo('@angular-eslint/eslint-plugin-template'),
    fetchPackageInfo('@angular-eslint/template-parser'),
    interopDefault(import('@angular-eslint/eslint-plugin-template'))
      .then((m) => m.processors['extract-inline-html'] as Eslint.Linter.Processor)
      .then((processor) => {
        const fixedProcessor = cloneDeep(processor);
        fixedProcessor.meta ||= {
          name: 'extract-inline-html',
        };
        return fixedProcessor;
      }),
  ]);

  (
    [
      [angularEslintPluginPackageInfo, '@angular-eslint/eslint-plugin'],
      [angularTemplateEslintPluginPackageInfo, '@angular-eslint/eslint-plugin-template'],
      [angularTemplateParserPackageInfo, '@angular-eslint/template-parser'],
    ] satisfies [Awaited<ReturnType<typeof fetchPackageInfo>>, string][]
  ).forEach(([packageInfo, packageName]) => {
    if (packageInfo?.versions.major != null && packageInfo.versions.major !== angularVersion) {
      context.logger.warn(
        `Your \`${packageName}\` major version (${packageInfo.versions.major}) might not be compatible with the configured (or detected) Angular major version (${angularVersion}).`,
      );
    }
  });

  const angularEslintPluginRules = Object.keys(angularEslintPlugin?.rules || {});
  const getAngularEslintPluginRuleSeverity = <
    RuleName extends RuleNamesForPlugin<'@angular-eslint'>,
  >(
    ruleName: RuleName,
    severity: RuleSeverity,
  ) =>
    [
      ruleName satisfies RuleName,
      angularEslintPlugin && !angularEslintPluginRules.includes(ruleName) ? OFF : severity,
    ] satisfies NonEmptyTuple;

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
    .addRule(
      ...getAngularEslintPluginRuleSeverity(
        'component-class-suffix',
        componentClassSuffixes.length === 0 ? OFF : ERROR,
      ),
      [
        {
          ...(componentClassSuffixes.length > 0 && {suffixes: componentClassSuffixes}),
        },
      ],
    ) // >=0.0.1-alpha.12
    .addRule(...getAngularEslintPluginRuleSeverity('component-max-inline-declarations', OFF)) // >=0.0.1-alpha.19
    .addRule(
      ...getAngularEslintPluginRuleSeverity(
        'component-selector',
        componentSelector === false ? OFF : ERROR,
      ),
      [
        {
          type: ['element'],
          style: 'kebab-case',
          ...(typeof componentSelector === 'object' && componentSelector),
        },
      ],
    ) // >=0.0.1-alpha.18
    .addRule(
      ...getAngularEslintPluginRuleSeverity(
        'consistent-component-styles',
        componentStylesStyle === false ? OFF : ERROR,
      ),
      [typeof componentStylesStyle === 'string' ? componentStylesStyle : 'string'],
    ) // >=17.3.0
    .addRule(...getAngularEslintPluginRuleSeverity('contextual-decorator', ERROR)) // >=0.8.0-beta.7
    .addRule(...getAngularEslintPluginRuleSeverity('contextual-lifecycle', ERROR)) // 🟢 >=0.0.1-alpha.18
    .addRule(
      ...getAngularEslintPluginRuleSeverity(
        'directive-class-suffix',
        directiveClassSuffixes.length === 0 ? OFF : ERROR,
      ),
      [
        {
          ...(directiveClassSuffixes.length > 0 && {suffixes: directiveClassSuffixes}),
        },
      ],
    ) // >=0.0.1-alpha.23
    .addRule(
      ...getAngularEslintPluginRuleSeverity(
        'directive-selector',
        directiveSelector === false ? OFF : ERROR,
      ),
      [
        {
          type: ['attribute'],
          style: 'camelCase',
          ...(typeof directiveSelector === 'object' && directiveSelector),
        },
      ],
    ) // >=0.0.1-alpha.18
    .addRule(...getAngularEslintPluginRuleSeverity('no-async-lifecycle-method', ERROR)) // >=17.2.0
    .addRule(
      ...getAngularEslintPluginRuleSeverity(
        'no-attribute-decorator',
        disallowAttributeDecorator ? ERROR : OFF,
      ),
    ) // >=0.0.1-alpha.30
    .addRule(...getAngularEslintPluginRuleSeverity('no-conflicting-lifecycle', ERROR)) // >=0.0.1-alpha.19
    .addRule(...getAngularEslintPluginRuleSeverity('no-developer-preview', WARNING)) // >=20.1.0
    .addRule(...getAngularEslintPluginRuleSeverity('no-duplicates-in-metadata-arrays', ERROR)) // >=17.4.0
    .addRule(...getAngularEslintPluginRuleSeverity('no-empty-lifecycle-method', ERROR)) // 🟢 >=0.1.0-beta.1
    .addRule(...getAngularEslintPluginRuleSeverity('no-experimental', WARNING)) // >=20.1.0
    .addRule(
      ...getAngularEslintPluginRuleSeverity('no-forward-ref', disallowForwardRef ? ERROR : OFF),
    ) // >=0.0.1-alpha.23
    // See https://github.com/angular/angular/pull/54084, https://angular.dev/guide/components/host-elements
    .addRule(
      ...getAngularEslintPluginRuleSeverity(
        'no-host-metadata-property',
        forbiddenMetadataProperties.host ? ERROR : OFF,
      ),
    ) // 🔴(18) >=0.0.1-alpha.12 <=18
    .addRule(...getAngularEslintPluginRuleSeverity('prefer-output-emitter-ref', ERROR)) // >=19.4.0
    .addRule(...getAngularEslintPluginRuleSeverity('no-input-prefix', ERROR), [
      {prefixes: disallowedInputPrefixes},
    ]) // >=0.0.1-alpha.23
    .addRule(...getAngularEslintPluginRuleSeverity('no-input-rename', ERROR)) // 🟢 >=0.0.1-alpha.23
    .addRule(
      ...getAngularEslintPluginRuleSeverity(
        'no-inputs-metadata-property',
        forbiddenMetadataProperties.inputs ? ERROR : OFF,
      ),
    ) // 🟢 >=0.0.1-alpha.12
    .addRule(...getAngularEslintPluginRuleSeverity('no-lifecycle-call', ERROR)) // >=0.0.1-alpha.18
    .addRule(...getAngularEslintPluginRuleSeverity('no-output-native', ERROR)) // 🟢 >=0.0.1-alpha.18
    .addRule(...getAngularEslintPluginRuleSeverity('no-output-on-prefix', ERROR)) // 🟢 >=0.0.1-alpha.12
    .addRule(...getAngularEslintPluginRuleSeverity('no-output-rename', ERROR)) // 🟢 >=0.0.1-alpha.18
    .addRule(
      ...getAngularEslintPluginRuleSeverity(
        'no-outputs-metadata-property',
        forbiddenMetadataProperties.outputs ? ERROR : OFF,
      ),
    ) // 🟢 >=0.0.1-alpha.12
    .addRule(...getAngularEslintPluginRuleSeverity('no-pipe-impure', ERROR)) // >=0.0.1-alpha.17
    // https://github.com/angular/angular/blob/12.1.1/packages/core/src/metadata/directives.ts#L221-L258
    .addRule(
      ...getAngularEslintPluginRuleSeverity(
        'no-queries-metadata-property',
        forbiddenMetadataProperties.queries ? ERROR : OFF,
      ),
    ) // >=0.0.1-alpha.12
    .addRule(...getAngularEslintPluginRuleSeverity('no-uncalled-signals', ERROR)) // >=19.7.0
    .addRule(...getAngularEslintPluginRuleSeverity('pipe-prefix', ERROR), [
      {prefixes: pipePrefixes},
    ]) // >=0.0.1-alpha.33
    .addRule(...getAngularEslintPluginRuleSeverity('prefer-inject', ERROR)) // 🟢 >=19.6.0
    .addRule(
      ...getAngularEslintPluginRuleSeverity('prefer-on-push-component-change-detection', OFF),
    ) // >=0.0.1-alpha.17
    .addRule(...getAngularEslintPluginRuleSeverity('prefer-output-readonly', ERROR)) // >=0.0.1-alpha.19
    .addRule(...getAngularEslintPluginRuleSeverity('prefer-signals', OFF)) // >=19.0.0
    .addRule(
      ...getAngularEslintPluginRuleSeverity(
        'prefer-standalone',
        preferStandaloneComponents && angularVersion >= 17 ? ERROR : OFF,
      ),
    ) // 🟢(>=19) >=17.3.0
    .addRule(
      ...getAngularEslintPluginRuleSeverity(
        'prefer-standalone-component',
        preferStandaloneComponents && angularVersion < 17 ? ERROR : OFF,
      ),
    ) // 🔴(>=17) >=16.1.0 <=18
    .addRule(...getAngularEslintPluginRuleSeverity('relative-url-prefix', ERROR)) // >=0.0.1-alpha.23
    .addRule(...getAngularEslintPluginRuleSeverity('require-lifecycle-on-prototype', ERROR)) // >=19.2.0
    .addRule(...getAngularEslintPluginRuleSeverity('require-localize-metadata', ERROR)) // 🌐 >=13.2.0
    .addRule(...getAngularEslintPluginRuleSeverity('runtime-localize', ERROR)) // 🌐 >=18.3.0
    .addRule(...getAngularEslintPluginRuleSeverity('sort-keys-in-type-decorator', ERROR)) // >=19.5.0
    .addRule(...getAngularEslintPluginRuleSeverity('sort-lifecycle-methods', ERROR)) // >=16.2.0
    .addRule(...getAngularEslintPluginRuleSeverity('sort-ngmodule-metadata-arrays', OFF)) // 🔴(>=17) >=2.1.0 <=18
    .addRule(...getAngularEslintPluginRuleSeverity('use-component-selector', ERROR)) // >=0.0.1-alpha.12
    .addRule(...getAngularEslintPluginRuleSeverity('use-component-view-encapsulation', ERROR)) // >=0.0.1-alpha.12
    .addRule(...getAngularEslintPluginRuleSeverity('use-injectable-provided-in', ERROR)) // >=0.0.1-alpha.23
    .addRule(...getAngularEslintPluginRuleSeverity('use-lifecycle-interface', ERROR)) // 🟢(warns) >=0.0.1-alpha.12
    .addRule(...getAngularEslintPluginRuleSeverity('use-pipe-transform-interface', ERROR)) // 🟢 >=0.0.1-alpha.12
    .ensureAllRulesAreListed('@angular-eslint')
    .addOverrides();

  // TEMPLATE CONFIG

  const angularTemplateEslintPluginRules = Object.keys(angularTemplateEslintPlugin?.rules || {});
  const getAngularEslintTemplatePluginRuleSeverity = <
    RuleName extends RuleNamesForPlugin<'@angular-eslint/template'>,
  >(
    ruleName: RuleName,
    severity: RuleSeverity,
  ) =>
    [
      ruleName satisfies RuleName,
      angularTemplateEslintPlugin && !angularTemplateEslintPluginRules.includes(ruleName)
        ? OFF
        : severity,
    ] satisfies NonEmptyTuple;

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
    ?.addConfig([
      'angular/template',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: [GLOB_HTML],
        parser: '@angular-eslint/template-parser',
        doNotIgnoreHtml: true,
      },
    ])
    .addRule(
      ...getAngularEslintTemplatePluginRuleSeverity('accessibility-alt-text', a11yRulesSeverity),
    ) // ♿ >=0.8.0-beta.7 <=15
    .addRule(
      ...getAngularEslintTemplatePluginRuleSeverity(
        'accessibility-elements-content',
        a11yRulesSeverity,
      ),
    ) // ♿ >=0.8.0-beta.6 <=15
    .addRule(
      ...getAngularEslintTemplatePluginRuleSeverity(
        'accessibility-interactive-supports-focus',
        a11yRulesSeverity,
      ),
    ) // ♿ >=14.2.0 <=15
    .addRule(
      ...getAngularEslintTemplatePluginRuleSeverity('accessibility-label-for', a11yRulesSeverity),
    ) // ♿ >=1.1.0 <=15
    .addRule(
      ...getAngularEslintTemplatePluginRuleSeverity(
        'accessibility-label-has-associated-control',
        a11yRulesSeverity,
      ),
    ) // ♿ >=4.3.0 <=15
    .addRule(
      ...getAngularEslintTemplatePluginRuleSeverity(
        'accessibility-role-has-required-aria',
        a11yRulesSeverity,
      ),
    ) // ♿ >=14.2.0 <=15
    .addRule(
      ...getAngularEslintTemplatePluginRuleSeverity('accessibility-table-scope', a11yRulesSeverity),
    ) // ♿ >=0.8.0-beta.6 <=15
    .addRule(
      ...getAngularEslintTemplatePluginRuleSeverity('accessibility-valid-aria', a11yRulesSeverity),
    ) // ♿ >=0.8.0-beta.6 <=15
    .addRule(...getAngularEslintTemplatePluginRuleSeverity('alt-text', a11yRulesSeverity)) // ♿ >=16.0.0-alpha.0 (renamed from `accessibility-alt-text`)
    .addRule(...getAngularEslintTemplatePluginRuleSeverity('attributes-order', ERROR)) // >=14.2.0
    .addRule(...getAngularEslintTemplatePluginRuleSeverity('banana-in-box', ERROR)) // 🟢 >=0.0.1-alpha.12 (renamed from `banana-in-a-box`)
    .addRule(...getAngularEslintTemplatePluginRuleSeverity('button-has-type', ERROR)) // >=13.5.0
    .addRule(
      ...getAngularEslintTemplatePluginRuleSeverity(
        'click-events-have-key-events',
        a11yRulesSeverity,
      ),
    ) // ♿ >=0.8.0-beta.7
    .addRule(...getAngularEslintTemplatePluginRuleSeverity('conditional-complexity', OFF)) // >=0.8.0-beta.6
    .addRule(...getAngularEslintTemplatePluginRuleSeverity('cyclomatic-complexity', OFF)) // >=0.0.1-alpha.28
    .addRule(...getAngularEslintTemplatePluginRuleSeverity('elements-content', a11yRulesSeverity)) // ♿ >=16.0.0-alpha.0 (renamed from `accessibility-elements-content`)
    .addRule(...getAngularEslintTemplatePluginRuleSeverity('eqeqeq', ERROR), [
      {allowNullOrUndefined: true},
    ]) // 🟢 >=12.0.0
    .addRule(...getAngularEslintTemplatePluginRuleSeverity('i18n', OFF)) // >=0.8.0-beta.6
    .addRule(
      ...getAngularEslintTemplatePluginRuleSeverity(
        'interactive-supports-focus',
        a11yRulesSeverity,
      ),
    ) // ♿ >=16.0.0-alpha.0 (renamed from `accessibility-interactive-supports-focus`)
    .addRule(
      ...getAngularEslintTemplatePluginRuleSeverity(
        'label-has-associated-control',
        a11yRulesSeverity,
      ),
    ) // ♿ >=16.0.0-alpha.0 (renamed from `accessibility-label-has-associated-control`)
    .addRule(
      ...getAngularEslintTemplatePluginRuleSeverity(
        'mouse-events-have-key-events',
        a11yRulesSeverity,
      ),
    ) // ♿ >=0.8.0-beta.6
    .addRule(...getAngularEslintTemplatePluginRuleSeverity('no-any', WARNING)) // >=0.8.0-beta.6
    .addRule(...getAngularEslintTemplatePluginRuleSeverity('no-autofocus', a11yRulesSeverity)) // ♿ >=0.5.0-beta.4
    .addRule(...getAngularEslintTemplatePluginRuleSeverity('no-call-expression', OFF)) // >=0.0.1-alpha.30
    .addRule(
      ...getAngularEslintTemplatePluginRuleSeverity('no-distracting-elements', a11yRulesSeverity),
    ) // ♿ >=0.8.0-beta.6
    .addRule(...getAngularEslintTemplatePluginRuleSeverity('no-duplicate-attributes', ERROR)) // >=1.2.0
    .addRule(...getAngularEslintTemplatePluginRuleSeverity('no-empty-control-flow', ERROR)) // >=20.2.0
    .addRule(...getAngularEslintTemplatePluginRuleSeverity('no-inline-styles', OFF)) // >=14.3.0
    .addRule(...getAngularEslintTemplatePluginRuleSeverity('no-interpolation-in-attributes', ERROR)) // >=15.2.0
    .addRule(...getAngularEslintTemplatePluginRuleSeverity('no-negated-async', ERROR)) // 🟢 >=0.0.1-alpha.20
    .addRule(...getAngularEslintTemplatePluginRuleSeverity('no-nested-tags', ERROR)) // >=19.5.0
    .addRule(...getAngularEslintTemplatePluginRuleSeverity('no-positive-tabindex', ERROR)) // >=0.4.0-beta.1
    .addRule(...getAngularEslintTemplatePluginRuleSeverity('prefer-at-empty', ERROR)) // >=19.5.0
    .addRule(
      ...getAngularEslintTemplatePluginRuleSeverity('prefer-contextual-for-variables', ERROR),
    ) // >=19.3.0
    .addRule(
      ...getAngularEslintTemplatePluginRuleSeverity(
        'prefer-control-flow',
        preferControlFlow ? ERROR : OFF,
      ),
    ) // >=17.1.0
    .addRule(
      ...getAngularEslintTemplatePluginRuleSeverity('prefer-ngsrc', preferNgSrc ? ERROR : OFF),
    ) // >=16.2.0
    .addRule(...getAngularEslintTemplatePluginRuleSeverity('prefer-template-literal', ERROR)) // >=19.4.0
    .addRule(...getAngularEslintTemplatePluginRuleSeverity('prefer-self-closing-tags', OFF)) // >=16.1.0
    .addRule(
      ...getAngularEslintTemplatePluginRuleSeverity('prefer-static-string-properties', ERROR),
    ) // >=19.1.0
    .addRule(
      ...getAngularEslintTemplatePluginRuleSeverity('role-has-required-aria', a11yRulesSeverity),
    ) // ♿ >=16.0.0-alpha.0 (renamed from `accessibility-role-has-required-aria`)
    .addRule(...getAngularEslintTemplatePluginRuleSeverity('table-scope', a11yRulesSeverity)) // ♿ >=16.0.0-alpha.0 (renamed from `accessibility-table-scope`)
    .addRule(
      ...getAngularEslintTemplatePluginRuleSeverity(
        'use-track-by-function',
        requireLoopIndexes ? ERROR : OFF,
      ),
    ) // ♿ >=0.8.0-beta.5
    .addRule(...getAngularEslintTemplatePluginRuleSeverity('valid-aria', a11yRulesSeverity)) // ♿ >=16.0.0-alpha.0 (renamed from `accessibility-valid-aria`)
    .addOverrides();

  return {
    configs: [configBuilderGeneral, configBuilderTemplate],
    optionsResolved,
  };
};
